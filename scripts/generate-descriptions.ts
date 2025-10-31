import fs from 'fs';
import { join } from 'path';
import {
  runWithSpinner,
  displayGenerationSummary,
  showRemainingSpinner,
} from './utils/terminal-display';

import config from '../assembler-ui.config.js';
import { parseFolder } from './parse-folder';

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
            fs.writeFileSync(
              outputPath,
              DEBUG_JSON ? JSON.stringify(result, null, 2) : JSON.stringify(result),
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
