import fs from 'fs';
import path from 'path';
import {
  extractImports,
  filterExternalInternalImports,
} from './parse-folder/common/extract-imports';
import {
  createDependencyMap,
  saveDependencyMap,
  displayDependencyMapStats,
} from './parse-folder/common/create-dependency-map.js';
import type { FolderAnalysisResult } from './parse-folder/common/create-dependency-map.js';
import config from '../assembler-ui.config.js';

const GlobalPath = config.globalPath || 'registry/new-york/';
const Paths = config.paths || ['components', 'composables', 'blocks'];
const SkipSubfolders = config.skipSubfolders || [];

/**
 * Analyse un dossier pour détecter ses dépendances
 */
const analyzeFolderDependencies = (
  folderPath: string,
  folderName: string
): FolderAnalysisResult => {
  const absGlobalPath = path.resolve(process.cwd(), GlobalPath);
  const imports: Set<string> = new Set();

  // Lire tous les fichiers .ts, .js, .vue du dossier (récursivement)
  const getFiles = (dir: string): string[] => {
    const files: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Ignorer les sous-dossiers dans skipSubfolders
        if (SkipSubfolders.includes(item)) {
          continue;
        }
        files.push(...getFiles(fullPath));
      } else if (/\.(vue|ts|js)$/.test(item) && !item.endsWith('.d.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  };

  const files = getFiles(folderPath);

  // Analyser chaque fichier
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileImports = extractImports(content, filePath, {
      sourceFilePath: filePath,
      globalPath: GlobalPath,
      paths: Paths,
      root: process.cwd(),
    });

    // Filtrer pour ne garder que les imports internes externes au dossier actuel
    const externalImports = filterExternalInternalImports(fileImports, filePath);

    for (const imp of externalImports) {
      if (imp.relativePath) {
        // Extraire le dossier de niveau supérieur (e.g., 'composables/use-media-devices' -> 'composables/use-media-devices')
        const segments = imp.relativePath.split('/');
        if (segments.length >= 2) {
          const topLevelFolder = segments[0];
          const secondLevelFolder = segments[1];
          const importFolder = `${topLevelFolder}/${secondLevelFolder}`;
          imports.add(importFolder);
        }
      }
    }
  }

  // Grouper les imports par dossier
  const importGroups: Record<string, Set<string>> = {};

  for (const importPath of imports) {
    if (!importGroups[importPath]) {
      importGroups[importPath] = new Set();
    }

    // Lister les fichiers du dossier importé
    const importedFolderPath = path.resolve(process.cwd(), GlobalPath, importPath);
    if (fs.existsSync(importedFolderPath)) {
      const importedFiles = fs
        .readdirSync(importedFolderPath)
        .filter((f) => /\.(vue|ts|js)$/.test(f) && !f.endsWith('.d.ts'));

      for (const file of importedFiles) {
        importGroups[importPath]?.add(file);
      }
    }
  }

  // Convertir en format attendu
  const result: FolderAnalysisResult = {
    folder: folderPath,
    imports: Object.entries(importGroups).map(([importPath, files]) => ({
      path: importPath,
      files: Array.from(files),
    })),
  };

  return result;
};

/**
 * Script principal
 */
const main = () => {
  console.log('🔨 Building dependency map...\n');

  const results: FolderAnalysisResult[] = [];

  // Parcourir tous les dossiers dans les paths configurés
  for (const subPath of Paths) {
    const fullPath = path.resolve(process.cwd(), GlobalPath, subPath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️  Path not found: ${fullPath}`);
      continue;
    }

    const folders = fs.readdirSync(fullPath).filter((item) => {
      const itemPath = path.join(fullPath, item);
      return fs.statSync(itemPath).isDirectory() && !SkipSubfolders.includes(item);
    });

    for (const folder of folders) {
      const folderPath = path.join(fullPath, folder);
      console.log(`📁 Analyzing: ${subPath}/${folder}`);

      const result = analyzeFolderDependencies(folderPath, folder);
      results.push(result);
    }
  }

  // Créer la carte de dépendances
  console.log('\n📊 Creating dependency map...');
  const dependencyMap = createDependencyMap(results, GlobalPath, SkipSubfolders);

  // Sauvegarder
  const outputPath = path.resolve(__dirname, 'dependency-map.json');
  saveDependencyMap(dependencyMap, outputPath);

  console.log(`✅ Dependency map saved to: ${outputPath}\n`);

  // Afficher les statistiques
  displayDependencyMapStats(dependencyMap);
};

main();
