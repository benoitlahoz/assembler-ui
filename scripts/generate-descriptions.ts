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
 * Loads the dependency map
 */
const loadDependencyMap = (): DependencyMap => {
  const mapPath = path.resolve(__dirname, 'dependency-map.json');
  if (!fs.existsSync(mapPath)) {
    console.warn('⚠️  Dependency map not found. Generating without optimization.');
    return {};
  }
  return JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
};

/**
 * Enriches the parseFolder result with dependency information
 */
const enrichWithDependencies = (
  result: any,
  folderName: string,
  dependencyMap: DependencyMap
): EnrichedResult => {
  const enriched = { ...result };

  // Add dependency information if available
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
 * Sorts folders in topological order (dependencies first)
 */
const topologicalSort = (folders: string[], dependencyMap: DependencyMap): string[] => {
  const sorted: string[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const visit = (folder: string) => {
    if (visited.has(folder)) return;
    if (visiting.has(folder)) {
      // Cycle detected, ignoring
      console.warn(`⚠️  Dependency cycle detected for: ${folder}`);
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
  console.log('🚀 Generating descriptions with dependency map\n');

  // 1. Load the dependency map
  const dependencyMap = loadDependencyMap();

  // 2. Get all folders to process
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

  // 3. Sort folders in topological order
  const sortedFolders = topologicalSort(allFolders, dependencyMap);

  // 4. Generate descriptions
  const errors: { dir: string; error: any }[] = [];
  let total = 0;
  let remaining = sortedFolders.length;

  for (const folderName of sortedFolders) {
    // Find the full path of the folder
    let folderPath: string | null = null;
    for (const subPath of config.paths) {
      const folderTestPath = path.join(GlobalPath, subPath, folderName);
      if (fs.existsSync(folderTestPath)) {
        folderPath = folderTestPath;
        break;
      }
    }

    if (!folderPath) {
      remaining--;
      continue;
    }

    // Check if the folder should be ignored
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
          // Parse the folder
          const result = parseFolder(path.join(process.cwd(), folderPath!), config) as any;

          // Enrich with dependencies
          const enriched = enrichWithDependencies(result, folderName, dependencyMap);

          // Add missing files from dependency-map
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

          // Add standard metadata
          enriched.$schema = config.$schema;
          enriched.type = typeof enriched.type !== 'undefined' ? enriched.type : 'registry:ui';

          // Process files
          if (Array.isArray(enriched.files)) {
            enriched.files = enriched.files.map((f: any) => ({
              ...f,
              type: typeof f.type !== 'undefined' ? f.type : enriched.type,
            }));

            // Extract demos from files
            const allDemos = enriched.files
              .filter((f: any) => Array.isArray(f.demo) && f.demo.length > 0)
              .flatMap((f: any) => f.demo);
            if (allDemos.length > 0) {
              enriched.demo = allDemos;
            }

            // Remove demo from each file
            enriched.files = enriched.files.map((f: any) => {
              const { demo, ...rest } = f;
              return rest;
            });
          }

          // Determine the category
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

          // Normalize the category
          if (
            typeof enriched.category === 'object' &&
            enriched.category !== null &&
            'name' in enriched.category
          ) {
            enriched.category = (enriched.category as any).name;
          }

          // Reorganize keys
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

          // Add all other keys
          Object.keys(enriched).forEach((key) => {
            if (!(key in ordered)) {
              ordered[key] = (enriched as any)[key];
            }
          });

          // Write the file
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
