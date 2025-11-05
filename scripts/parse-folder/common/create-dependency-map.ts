import fs from 'fs';
import path from 'path';
import { stripComments } from '../../docs/common/strip-comments';

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
 * Récupère tous les fichiers .vue, .ts, .js d'un dossier (récursivement)
 * @param folderPath - Chemin du dossier à parcourir
 * @param skipSubfolders - Liste des noms de sous-dossiers à ignorer
 */
const getFilesInFolderRecursive = (folderPath: string, skipSubfolders: string[] = []): string[] => {
  if (!fs.existsSync(folderPath)) return [];

  const allFiles: string[] = [];
  const items = fs.readdirSync(folderPath);

  items.forEach((item) => {
    const itemPath = path.join(folderPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      // Vérifier si ce sous-dossier doit être ignoré
      if (skipSubfolders.includes(item)) {
        return; // Skip ce dossier
      }
      // Récursion dans les sous-dossiers
      allFiles.push(...getFilesInFolderRecursive(itemPath, skipSubfolders));
    } else if (/\.(vue|ts|js)$/.test(item) && !item.endsWith('.d.ts')) {
      allFiles.push(itemPath);
    }
  });

  return allFiles;
};

/**
 * Récupère uniquement les fichiers .vue, .ts, .js du niveau actuel d'un dossier (NON récursif)
 * @param folderPath - Chemin du dossier à parcourir
 */
const getFilesInFolder = (folderPath: string): string[] => {
  if (!fs.existsSync(folderPath)) return [];

  const files: string[] = [];
  const items = fs.readdirSync(folderPath);

  items.forEach((item) => {
    const itemPath = path.join(folderPath, item);
    const stat = fs.statSync(itemPath);

    // Prendre uniquement les fichiers du niveau actuel, pas les sous-dossiers
    if (!stat.isDirectory() && /\.(vue|ts|js)$/.test(item) && !item.endsWith('.d.ts')) {
      files.push(itemPath);
    }
  });

  return files;
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
 * @param skipSubfolders - Liste des noms de sous-dossiers à ignorer
 * @returns Carte de dépendances complète
 */
export function createDependencyMap(
  jsonResults: FolderAnalysisResult[],
  globalPath: string,
  skipSubfolders: string[] = []
): DependencyMap {
  const dependencyMap: DependencyMap = {};

  // Initialiser la map avec tous les dossiers
  jsonResults.forEach((result) => {
    const folderName = path.basename(result.folder);
    const folderFullPath = path.resolve(process.cwd(), result.folder);

    // Lire tous les fichiers du dossier RÉCURSIVEMENT (y compris les sous-dossiers)
    const files = getFilesInFolderRecursive(folderFullPath, skipSubfolders).map((filePath) => {
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
          const depFiles = getFilesInFolderRecursive(depFolderFullPath, skipSubfolders).map(
            (filePath) => {
              const fileName = path.basename(filePath);
              const source = readFileWithoutComments(filePath);
              const relativePath = path.relative(process.cwd(), filePath);

              return {
                name: fileName,
                path: relativePath,
                source,
              };
            }
          );

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
