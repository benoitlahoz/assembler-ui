import fs from 'fs';
import { join } from 'path';
import { parseFolder } from './parse-folder';
import {
  runWithSpinner,
  displayGenerationSummary,
  showRemainingSpinner,
} from './utils/terminal-display';

import config from '../assembler-ui.config.js';

const DEBUG_JSON = true;

const GlobalPath = config.globalPath || 'registry/new-york/';
const Paths = config.paths || {};
const OutputFilename = config.definitionFile || 'assemblerjs.json';

const getDirectories = (source: string) => {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => {
      return {
        dir: join(dirent.parentPath, dirent.name),
        name: dirent.name,
      };
    });
};

export const main = async () => {
  const directories = Paths.map((path: string) => join(GlobalPath, path));
  const errors: { dir: string; error: any }[] = [];
  let total = 0;
  for (const path of directories) {
    const componentDirs = getDirectories(path);

    let remaining = componentDirs.length;
    for (const { dir, name } of componentDirs) {
      total++;
      const outputPath = join(process.cwd(), dir, OutputFilename);
      try {
        await runWithSpinner({
          message: `Generating description for '${name}'`,
          action: async () => {
            const result = parseFolder(join(dir), config) as any;

            result.$schema = config.$schema;
            // Toujours forcer le champ type : si absent, mettre registry:ui
            result.type = typeof result.type !== 'undefined' ? result.type : 'registry:ui';
            // Ajouter un type à chaque entrée de files si absent
            if (Array.isArray(result.files)) {
              result.files = result.files.map((f: any) => ({
                ...f,
                type: typeof f.type !== 'undefined' ? f.type : result.type,
              }));
            }

            // Récupérer toutes les entrées demo des files et les placer dans l'objet principal
            if (Array.isArray(result.files)) {
              const allDemos = result.files
                .filter((f: any) => Array.isArray(f.demo) && f.demo.length > 0)
                .flatMap((f: any) => f.demo);
              if (allDemos.length > 0) {
                result.demo = allDemos;
              }
              // Supprimer demo de chaque file
              result.files = result.files.map((f: any) => {
                const { demo, ...rest } = f;
                return rest;
              });
            }

            // Déterminer la catégorie à reporter dans l'objet principal
            if (typeof result.category === 'undefined') {
              let mainCategory = undefined;
              if (Array.isArray(result.files)) {
                // Cherche d'abord un fichier nommé 'index' avec une catégorie
                const indexFile = result.files.find((f: any) => f.name === 'index' && f.category);
                if (indexFile && indexFile.category) {
                  mainCategory = indexFile.category;
                } else {
                  // Sinon, prend la première catégorie trouvée
                  const firstWithCategory = result.files.find((f: any) => f.category);
                  if (firstWithCategory && firstWithCategory.category) {
                    mainCategory = firstWithCategory.category;
                  }
                }
              }
              result.category = mainCategory || 'miscellaneous';
            }
            // Normaliser la catégorie : si c'est un objet structuré, extraire le nom
            if (
              typeof result.category === 'object' &&
              result.category !== null &&
              'name' in result.category
            ) {
              result.category = result.category.name;
            }
            // Réorganiser les clés pour respecter l'ordre souhaité
            const ordered: any = {};
            if (result.$schema) ordered.$schema = result.$schema;
            ordered.install = `${config.homepage}/r/${result.name}.json`;
            if (result.name) ordered.name = result.name;
            if (result.title) ordered.title = result.title;
            if (result.description) ordered.description = result.description;
            if (result.category) ordered.category = result.category;
            if (result.type) ordered.type = result.type;
            if (result.demo) ordered.demo = result.demo;
            if (result.files) ordered.files = result.files;
            // Ajoute toutes les autres clés restantes
            Object.keys(result).forEach((key) => {
              if (!(key in ordered)) {
                ordered[key] = result[key];
              }
            });
            fs.writeFileSync(
              outputPath,
              DEBUG_JSON ? JSON.stringify(ordered, null, 2) : JSON.stringify(ordered),
              'utf-8'
            );
            return { type: result.type };
          },
          successMessage: (res) =>
            `File generated for entry '${name}' of type '${res?.type ?? ''}'.`,
          failMessage: `Error while generating ${dir}`,
        });
      } catch (error) {
        errors.push({ dir, error });
      }

      remaining--;
      showRemainingSpinner(remaining);
    }
  }

  displayGenerationSummary(total, errors, {
    successMessage: `✔ {count} file(s) generated successfully.`,
  });
  console.log('');
};

main();
