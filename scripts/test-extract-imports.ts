import fs from 'fs';
import path from 'path';
import {
  extractImports,
  filterInternalImports,
  filterExternalInternalImports,
  groupImportsByFolder,
  type ImportInfo,
} from './parse-folder/common/extract-imports';
import {
  createDependencyMap,
  saveDependencyMap,
  displayDependencyMapStats,
  type FolderAnalysisResult,
} from './create-dependency-map';
import config from '../assembler-ui.config';

/**
 * Script de test pour extract-imports
 *
 * Usage:
 *   yarn tsx scripts/test-extract-imports.ts           # Affichage formaté
 *   yarn tsx scripts/test-extract-imports.ts --json    # Sortie JSON
 *   yarn tsx scripts/test-extract-imports.ts --map     # Génère une carte de dépendances
 */

// Construire les dossiers de test à partir de la config
const basePath = config.globalPath;

// Récupérer tous les sous-dossiers de components, composables, blocks
const getSubFolders = (basePath: string, subPath: string): string[] => {
  const fullPath = path.resolve(process.cwd(), basePath, subPath);
  if (!fs.existsSync(fullPath)) return [];

  return fs
    .readdirSync(fullPath)
    .filter((item) => {
      const itemPath = path.join(fullPath, item);
      return fs.statSync(itemPath).isDirectory();
    })
    .map((item) => path.join(basePath, subPath, item));
};

// Collecter tous les dossiers de test
const testFolders: string[] = [];
config.paths.forEach((subPath: string) => {
  testFolders.push(...getSubFolders(basePath, subPath));
});

const isJsonMode = process.argv.includes('--json');
const isMapMode = process.argv.includes('--map');
const shouldGenerateJson = isJsonMode || isMapMode; // Générer JSON pour les deux modes

if (!shouldGenerateJson) {
  console.log("🧪 Test de l'extraction des imports\n");
  console.log('='.repeat(80));
}

// Configuration
const resolveConfig = {
  globalPath: config.globalPath,
  paths: config.paths,
  // Les alias seront automatiquement résolus depuis tsconfig.json par extractImports
  // Utiliser la racine du projet pour la résolution
  root: process.cwd(),
};

// Résultats pour mode JSON
const jsonResults: FolderAnalysisResult[] = [];

/**
 * Récupère tous les fichiers .vue, .ts, .js d'un dossier
 */
const getFilesInFolder = (folderPath: string): string[] => {
  if (!fs.existsSync(folderPath)) return [];

  const files = fs.readdirSync(folderPath);
  return files
    .filter((file) => /\.(vue|ts|js)$/.test(file) && !file.endsWith('.d.ts'))
    .map((file) => path.join(folderPath, file));
};

testFolders.forEach((folderPath) => {
  const absFolderPath = path.resolve(process.cwd(), folderPath);

  if (!fs.existsSync(absFolderPath)) {
    if (!isJsonMode) {
      console.log(`\n❌ Dossier non trouvé: ${folderPath}`);
    }
    return;
  }

  if (!isJsonMode) {
    console.log(`\n� Dossier: ${folderPath}`);
    console.log('-'.repeat(80));
  }

  // Récupérer tous les fichiers du dossier
  const filesInFolder = getFilesInFolder(absFolderPath);

  if (filesInFolder.length === 0) {
    if (!isJsonMode) {
      console.log('   Aucun fichier .vue/.ts/.js trouvé');
    }
    return;
  }

  // Collecter tous les imports de tous les fichiers du dossier
  const allFolderImports: ImportInfo[] = [];
  const fileImportsMap: Record<string, ImportInfo[]> = {};

  filesInFolder.forEach((filePath) => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileImports = extractImports(content, filePath, {
      ...resolveConfig,
      sourceFilePath: filePath,
    });

    const externalInternal = filterExternalInternalImports(fileImports, filePath);
    allFolderImports.push(...externalInternal);

    if (externalInternal.length > 0) {
      fileImportsMap[path.basename(filePath)] = externalInternal;
    }
  });

  // Dédupliquer les imports par relativePath
  const uniqueImports = Array.from(
    new Map(allFolderImports.map((imp) => [imp.relativePath, imp])).values()
  );

  // Grouper par dossier
  const grouped = groupImportsByFolder(uniqueImports, config.paths);

  // Stocker pour mode JSON - format pour code-tree
  if (shouldGenerateJson) {
    // Créer la structure pour le code-tree
    const imports = Object.entries(grouped)
      .map(([folderType, imports]) => {
        // Extraire les chemins uniques de dossiers importés
        const uniqueFolders = new Map<string, string>();

        imports.forEach((imp) => {
          if (imp.relativePath) {
            // Extraire le chemin du dossier (ex: "composables/use-media-devices/useMediaDevices.ts" -> "composables/use-media-devices")
            const parts = imp.relativePath.split('/');
            parts.pop(); // Retirer le nom du fichier
            const folderPath = parts.join('/');

            if (!uniqueFolders.has(folderPath)) {
              uniqueFolders.set(folderPath, folderPath);
            }
          }
        });

        // Pour chaque dossier importé, lister TOUS ses fichiers
        return Array.from(uniqueFolders.values()).map((folderPath) => {
          const fullFolderPath = path.resolve(process.cwd(), config.globalPath, folderPath);
          const allFiles = getFilesInFolder(fullFolderPath).map((f) => path.basename(f));

          return {
            path: folderPath,
            files: allFiles,
          };
        });
      })
      .flat();

    jsonResults.push({
      folder: folderPath,
      imports,
    });
  } else {
    console.log(`\n📊 Fichiers analysés: ${filesInFolder.length}`);
    console.log(`   - Imports internes uniques (hors dossier): ${uniqueImports.length}`);

    // Afficher les imports internes
    if (uniqueImports.length > 0) {
      console.log('\n🔗 Imports internes (notre code, hors dossier):');
      uniqueImports.forEach((imp) => {
        console.log(`   - ${imp.name}`);
        console.log(`     ├─ Source: ${imp.importPath}`);
        console.log(`     ├─ Chemin relatif: ${imp.relativePath || 'N/A'}`);
        console.log(`     └─ Spécificateurs: [${imp.specifiers.join(', ')}]`);
      });

      console.log('\n📁 Groupés par dossier:');
      Object.entries(grouped).forEach(([folder, imports]) => {
        if (imports.length > 0) {
          console.log(`   ${folder}: ${imports.length}`);
          imports.forEach((imp) => {
            console.log(`     - ${imp.name} (${imp.relativePath})`);
          });
        }
      });
    }

    // Afficher le détail par fichier
    if (Object.keys(fileImportsMap).length > 0) {
      console.log('\n� Détail par fichier:');
      Object.entries(fileImportsMap).forEach(([fileName, imports]) => {
        console.log(`   ${fileName}: ${imports.length} import(s)`);
      });
    }

    console.log('\n' + '='.repeat(80));
  }
});

if (isJsonMode) {
  const outputPath = path.resolve(__dirname, 'test-extract-imports.json');
  fs.writeFileSync(outputPath, JSON.stringify(jsonResults, null, 2), 'utf-8');
  console.log(`✅ Résultats écrits dans: ${outputPath}`);
} else if (isMapMode) {
  // Générer une carte de dépendances globale
  const dependencyMap = createDependencyMap(jsonResults, config.globalPath);

  const mapOutputPath = path.resolve(__dirname, 'dependency-map.json');
  saveDependencyMap(dependencyMap, mapOutputPath);
  console.log(`✅ Carte de dépendances écrite dans: ${mapOutputPath}`);
  displayDependencyMapStats(dependencyMap);
} else {
  console.log('\n✅ Test terminé\n');
}
