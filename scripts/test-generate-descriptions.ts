import fs from 'fs';
import path from 'path';
import { parseFolder } from './parse-folder';
import config from '../assembler-ui.config';
import type { DependencyMap } from './create-dependency-map';

/**
 * Script de test pour générer des descriptions optimisées avec la carte de dépendances
 *
 * Optimisations apportées :
 * 1. Lecture unique de la carte de dépendances (au lieu de parser chaque dossier)
 * 2. Enrichissement des assemblerjs.json avec les informations de dépendances
 * 3. Possibilité de générer les fichiers dans un ordre optimal (dépendances d'abord)
 *
 * Usage:
 *   yarn tsx scripts/test-generate-descriptions.ts
 */

const DEBUG_JSON = true;
const GlobalPath = config.globalPath || 'registry/new-york/';
const OutputFilename = 'assemblerjs-test.json'; // Nom différent pour ne pas écraser les vrais fichiers

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

/**
 * Génère les descriptions pour tous les dossiers
 */
const main = async () => {
  console.log('🧪 Test de génération de descriptions avec carte de dépendances\n');
  console.log('='.repeat(80));

  // 1. Charger la carte de dépendances
  console.log('\n📊 Chargement de la carte de dépendances...');
  const dependencyMap = loadDependencyMap();
  const totalFolders = Object.keys(dependencyMap).length;
  console.log(`✅ ${totalFolders} dossier(s) dans la carte`);

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

  console.log(`\n📁 ${allFolders.length} dossier(s) à traiter`);

  // 3. Trier les dossiers par ordre topologique (optionnel, pour optimisation)
  console.log('\n🔄 Tri topologique des dépendances...');
  const sortedFolders = topologicalSort(allFolders, dependencyMap);
  console.log(`✅ Ordre de traitement: ${sortedFolders.slice(0, 5).join(', ')}...`);

  // 4. Générer les descriptions
  console.log('\n⚙️  Génération des descriptions enrichies...\n');

  const results: Array<{ folder: string; success: boolean; error?: any }> = [];

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
      console.log(`⏭️  Dossier ignoré (non trouvé): ${folderName}`);
      continue;
    }

    // Vérifier si le dossier doit être ignoré
    if (config.skipSubfolders && config.skipSubfolders.includes(folderName)) {
      console.log(`⏭️  Dossier ignoré (skipSubfolders): ${folderName}`);
      continue;
    }

    try {
      console.log(`📝 Traitement: ${folderName}`);

      // Parser le dossier (logique existante de generate-descriptions)
      const result = parseFolder(path.join(process.cwd(), folderPath), config) as any;

      // Enrichir avec les dépendances
      const enriched = enrichWithDependencies(result, folderName, dependencyMap);

      // AJOUT: Ajouter les fichiers manquants depuis dependency-map (fichiers dans sous-dossiers)
      if (dependencyMap[folderName] && Array.isArray(dependencyMap[folderName].files)) {
        const existingPaths = new Set((enriched.files || []).map((f: any) => f.path));

        // Ajouter les fichiers qui sont dans dependency-map mais pas dans result.files
        dependencyMap[folderName].files.forEach((depFile: any) => {
          if (!existingPaths.has(depFile.path)) {
            // Créer une entrée file à partir du fichier de dependency-map
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

      // Traitement des files (même logique que generate-descriptions)
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
      const outputPath = path.join(process.cwd(), folderPath, OutputFilename);
      fs.writeFileSync(
        outputPath,
        DEBUG_JSON ? JSON.stringify(ordered, null, 2) : JSON.stringify(ordered),
        'utf-8'
      );

      console.log(`   ✅ ${OutputFilename} généré`);
      if (ordered.dependencies) {
        console.log(
          `   📦 Dépendances: ${ordered.dependencies.dependsOn.length} | Utilisé par: ${ordered.dependencies.usedBy.length}`
        );
      }

      results.push({ folder: folderName, success: true });
    } catch (error) {
      console.error(`   ❌ Erreur: ${error}`);
      results.push({ folder: folderName, success: false, error });
    }
  }

  // 5. Afficher le résumé
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 Résumé de la génération:\n');
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`✅ Succès: ${successful}`);
  console.log(`❌ Échecs: ${failed}`);

  if (failed > 0) {
    console.log('\nDossiers en échec:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   - ${r.folder}: ${r.error}`);
      });
  }

  console.log('\n✨ Génération terminée!\n');
};

main();
