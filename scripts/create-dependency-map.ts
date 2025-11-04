import fs from 'fs';
import path from 'path';
import { stripComments } from './docs/common/strip-comments';

/**
 * Structure d'un import groupé par dossier
 */
export interface ImportGroup {
  path: string;
  files: string[];
}

/**
 * Structure d'un résultat d'analyse de dossier
 */
export interface FolderAnalysisResult {
  folder: string;
  imports: ImportGroup[];
}

/**
 * Structure d'une entrée de la carte de dépendances
 */
export interface DependencyMapEntry {
  dependsOn: ImportGroup[];
  usedBy: string[];
  files: Array<{
    name: string;
    path: string;
    source: string;
  }>;
}

/**
 * Carte de dépendances complète
 */
export type DependencyMap = Record<string, DependencyMapEntry>;

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

/**
 * Lit le contenu d'un fichier et retire les commentaires (sauf pour .d.ts)
 */
const readFileWithoutComments = (filePath: string): string => {
  const fileName = path.basename(filePath);
  let source = fs.readFileSync(filePath, 'utf-8');

  // Retirer les commentaires de tous les fichiers (sauf .d.ts)
  if (!fileName.endsWith('.d.ts')) {
    source = stripComments(source);
  }

  return source;
};

/**
 * Crée une carte de dépendances à partir des résultats d'analyse
 *
 * @param jsonResults - Résultats d'analyse des dossiers
 * @param globalPath - Chemin de base du projet (ex: 'registry/new-york/')
 * @returns Carte de dépendances complète
 */
export function createDependencyMap(
  jsonResults: FolderAnalysisResult[],
  globalPath: string
): DependencyMap {
  const dependencyMap: DependencyMap = {};

  // Initialiser la map avec tous les dossiers
  jsonResults.forEach((result) => {
    const folderName = path.basename(result.folder);
    const folderFullPath = path.resolve(process.cwd(), result.folder);

    // Lire tous les fichiers du dossier avec leur code source
    const files = getFilesInFolder(folderFullPath).map((filePath) => {
      const fileName = path.basename(filePath);
      const source = readFileWithoutComments(filePath);
      const relativePath = path.relative(process.cwd(), filePath);

      return {
        name: fileName,
        path: relativePath,
        source,
      };
    });

    if (!dependencyMap[folderName]) {
      dependencyMap[folderName] = {
        dependsOn: [],
        usedBy: [],
        files,
      };
    }
  });

  // Remplir les dépendances
  jsonResults.forEach((result) => {
    const folderName = path.basename(result.folder);

    if (result.imports && result.imports.length > 0) {
      if (dependencyMap[folderName]) {
        dependencyMap[folderName].dependsOn = result.imports;
      }

      // Mettre à jour "usedBy" pour les dossiers dépendants
      result.imports.forEach((imp) => {
        const depFolderName = path.basename(imp.path);
        if (!dependencyMap[depFolderName]) {
          const depFolderFullPath = path.resolve(process.cwd(), globalPath, imp.path);
          const depFiles = getFilesInFolder(depFolderFullPath).map((filePath) => {
            const fileName = path.basename(filePath);
            const source = readFileWithoutComments(filePath);
            const relativePath = path.relative(process.cwd(), filePath);

            return {
              name: fileName,
              path: relativePath,
              source,
            };
          });

          dependencyMap[depFolderName] = {
            dependsOn: [],
            usedBy: [],
            files: depFiles,
          };
        }
        if (
          dependencyMap[depFolderName] &&
          !dependencyMap[depFolderName].usedBy.includes(folderName)
        ) {
          dependencyMap[depFolderName].usedBy.push(folderName);
        }
      });
    }
  });

  return dependencyMap;
}

/**
 * Sauvegarde la carte de dépendances dans un fichier JSON
 *
 * @param dependencyMap - Carte de dépendances à sauvegarder
 * @param outputPath - Chemin du fichier de sortie
 */
export function saveDependencyMap(dependencyMap: DependencyMap, outputPath: string): void {
  fs.writeFileSync(outputPath, JSON.stringify(dependencyMap, null, 2), 'utf-8');
}

/**
 * Affiche les statistiques de la carte de dépendances
 *
 * @param dependencyMap - Carte de dépendances à analyser
 */
export function displayDependencyMapStats(dependencyMap: DependencyMap): void {
  console.log(`\n📊 Statistiques:`);
  console.log(`   - Total de dossiers: ${Object.keys(dependencyMap).length}`);
  console.log(
    `   - Dossiers avec dépendances: ${
      Object.values(dependencyMap).filter((d) => d.dependsOn.length > 0).length
    }`
  );
  console.log(
    `   - Dossiers utilisés: ${Object.values(dependencyMap).filter((d) => d.usedBy.length > 0).length}`
  );
}
