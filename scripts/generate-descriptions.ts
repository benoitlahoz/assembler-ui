import fs from 'fs';
import path from 'path';
import { parseFolder } from './parse-folder';
import {
  runWithSpinner,
  displayGenerationSummary,
  showRemainingSpinner,
} from './utils/terminal-display';
import config from '../assembler-ui.config.js';
import type { DependencyMap } from './create-dependency-map';

const DEBUG_JSON = true;
const GlobalPath = config.globalPath || 'registry/new-york/';
const OutputFilename = config.definitionFile || 'assemblerjs.json';

interface EnrichedResult {
  name: string;
  title: string;
  description: string;
  type?: string;
  category?: string;
  files: any[];
  demo?: any[];
  dependencies?: {
    dependsOn: Array<{ path: string; name: string }>;
    usedBy: string[];
  };
  $schema?: string;
  install?: string;
}

/**
 * Charge la carte de dépendances
 */
const loadDependencyMap = (): DependencyMap => {
  const mapPath = path.resolve(__dirname, 'dependency-map.json');
  if (!fs.existsSync(mapPath)) {
    console.warn('⚠️  Carte de dépendances non trouvée. Génération sans optimisation.');
    return {};
  }
  return JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
};

/**
 * Enrichit le résultat de parseFolder avec les informations de dépendances
 */
const enrichWithDependencies = (
  result: any,
  folderName: string,
  dependencyMap: DependencyMap
): EnrichedResult => {
  const enriched = { ...result };

  // Ajouter les informations de dépendances si disponibles
  if (dependencyMap[folderName]) {
    const { dependsOn, usedBy } = dependencyMap[folderName];

    enriched.dependencies = {
      dependsOn: dependsOn.map((dep) => ({
        path: dep.path,
        name: path.basename(dep.path),
      })),
      usedBy,
    };
  }

  return enriched;
};

/**
 * Trie les dossiers par ordre topologique (dépendances d'abord)
 */
const topologicalSort = (folders: string[], dependencyMap: DependencyMap): string[] => {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (folder: string) => {
    if (visited.has(folder)) return;
    if (visiting.has(folder)) {
      // Cycle détecté, on ignore
      console.warn(`⚠️  Cycle de dépendances détecté pour: ${folder}`);
      return;
    }

    visiting.add(folder);

    const deps = dependencyMap[folder]?.dependsOn || [];
    deps.forEach((dep) => {
      const depName = path.basename(dep.path);
      if (folders.includes(depName)) {
        visit(depName);
      }
    });

    visiting.delete(folder);
    visited.add(folder);
    sorted.push(folder);
  };

  folders.forEach((folder) => visit(folder));
  return sorted;
};

export const main = async () => {
  console.log('🚀 Génération de descriptions avec carte de dépendances\n');

  // 1. Charger la carte de dépendances
  const dependencyMap = loadDependencyMap();

  // 2. Obtenir tous les dossiers à traiter
  const allFolders: string[] = [];
  config.paths.forEach((subPath: string) => {
    const fullPath = path.resolve(process.cwd(), GlobalPath, subPath);
    if (!fs.existsSync(fullPath)) return;

    const folders = fs.readdirSync(fullPath).filter((item) => {
      const itemPath = path.join(fullPath, item);
      return fs.statSync(itemPath).isDirectory();
    });

    allFolders.push(...folders);
  });

  // 3. Trier les dossiers par ordre topologique
  const sortedFolders = topologicalSort(allFolders, dependencyMap);

  // 4. Générer les descriptions
  const errors: { dir: string; error: any }[] = [];
  let total = 0;
  let remaining = sortedFolders.length;

  for (const folderName of sortedFolders) {
    // Trouver le chemin complet du dossier
    let folderPath: string | null = null;
    for (const subPath of config.paths) {
      const testPath = path.join(GlobalPath, subPath, folderName);
      if (fs.existsSync(testPath)) {
        folderPath = testPath;
        break;
      }
    }

    if (!folderPath) {
      remaining--;
      continue;
    }

    // Vérifier si le dossier doit être ignoré
    if (config.skipSubfolders && config.skipSubfolders.includes(folderName)) {
      remaining--;
      continue;
    }

    total++;
    const outputPath = path.join(process.cwd(), folderPath, OutputFilename);

    try {
      await runWithSpinner({
        message: `Generating description for '${folderName}'`,
        action: async () => {
          // Parser le dossier
          const result = parseFolder(path.join(process.cwd(), folderPath!), config) as any;

          // Enrichir avec les dépendances
          const enriched = enrichWithDependencies(result, folderName, dependencyMap);

          // Ajouter les fichiers manquants depuis dependency-map
          if (dependencyMap[folderName] && Array.isArray(dependencyMap[folderName].files)) {
            const existingPaths = new Set((enriched.files || []).map((f: any) => f.path));

            dependencyMap[folderName].files.forEach((depFile: any) => {
              if (!existingPaths.has(depFile.path)) {
                enriched.files = enriched.files || [];
                enriched.files.push({
                  name: path.basename(depFile.name, path.extname(depFile.name)),
                  title: path.basename(depFile.name, path.extname(depFile.name)),
                  path: depFile.path,
                  doc: {
                    source: depFile.source,
                  },
                });
              }
            });
          }

          // Ajouter les métadonnées standards
          enriched.$schema = config.$schema;
          enriched.type = typeof enriched.type !== 'undefined' ? enriched.type : 'registry:ui';

          // Traitement des files
          if (Array.isArray(enriched.files)) {
            enriched.files = enriched.files.map((f: any) => ({
              ...f,
              type: typeof f.type !== 'undefined' ? f.type : enriched.type,
            }));

            // Extraire les demos des files
            const allDemos = enriched.files
              .filter((f: any) => Array.isArray(f.demo) && f.demo.length > 0)
              .flatMap((f: any) => f.demo);
            if (allDemos.length > 0) {
              enriched.demo = allDemos;
            }

            // Supprimer demo de chaque file
            enriched.files = enriched.files.map((f: any) => {
              const { demo, ...rest } = f;
              return rest;
            });
          }

          // Déterminer la catégorie
          if (typeof enriched.category === 'undefined') {
            let mainCategory = undefined;
            if (Array.isArray(enriched.files)) {
              const indexFile = enriched.files.find((f: any) => f.name === 'index' && f.category);
              if (indexFile && indexFile.category) {
                mainCategory = indexFile.category;
              } else {
                const firstWithCategory = enriched.files.find((f: any) => f.category);
                if (firstWithCategory && firstWithCategory.category) {
                  mainCategory = firstWithCategory.category;
                }
              }
            }
            enriched.category = mainCategory || 'miscellaneous';
          }

          // Normaliser la catégorie
          if (
            typeof enriched.category === 'object' &&
            enriched.category !== null &&
            'name' in enriched.category
          ) {
            enriched.category = (enriched.category as any).name;
          }

          // Réorganiser les clés
          const ordered: any = {};
          if (enriched.$schema) ordered.$schema = enriched.$schema;
          ordered.install = `${config.homepage}/r/${enriched.name}.json`;
          if (enriched.name) ordered.name = enriched.name;
          if (enriched.title) ordered.title = enriched.title;
          if (enriched.description) ordered.description = enriched.description;
          if (enriched.category) ordered.category = enriched.category;
          if (enriched.type) ordered.type = enriched.type;
          if (enriched.dependencies) ordered.dependencies = enriched.dependencies;
          if (enriched.demo) ordered.demo = enriched.demo;
          if (enriched.files) ordered.files = enriched.files;

          // Ajouter toutes les autres clés
          Object.keys(enriched).forEach((key) => {
            if (!(key in ordered)) {
              ordered[key] = (enriched as any)[key];
            }
          });

          // Écrire le fichier
          fs.writeFileSync(
            outputPath,
            DEBUG_JSON ? JSON.stringify(ordered, null, 2) : JSON.stringify(ordered),
            'utf-8'
          );

          return { type: ordered.type, dependencies: ordered.dependencies };
        },
        successMessage: (res) =>
          `File generated for entry '${folderName}' of type '${res?.type ?? ''}' ${res?.dependencies ? `(deps: ${res.dependencies.dependsOn.length})` : ''}.`,
        failMessage: `Error while generating ${folderName}`,
      });
    } catch (error) {
      errors.push({ dir: folderPath, error });
    }

    remaining--;
    showRemainingSpinner(remaining);
  }

  displayGenerationSummary(total, errors, {
    successMessage: `✔ {count} file(s) generated successfully.`,
  });
  console.log('');
};

main();
