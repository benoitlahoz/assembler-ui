import fs from 'fs';
import { join } from 'path';
import {
  runWithSpinner,
  displayGenerationSummary,
  showRemainingSpinner,
} from './utils/terminal-display';
import type { RegistryItemType } from './types';

import config from '../assembler-ui.config.js';
import { parseFolder } from './parse-folder';

const GlobalPath = config.globalPath || 'registry/new-york/';
const Paths = config.paths || {
  ui: 'components',
  block: 'blocks',
  hook: 'composables',
};
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
        let type = '';
        await runWithSpinner({
          message: `Generating description ${dir}`,
          action: async () => {
            const result = parseFolder(join(dir), config) as any;
            type = result.type || 'registry:ui';
            result.$schema = config.$schema;
            result.type = type;
            fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
            return { type };
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
/*
  displayGenerationSummary(total, errors, {
    successMessage: `✔ {count} file(s) generated successfully.`,
  });
  console.log('');
  */

main();
