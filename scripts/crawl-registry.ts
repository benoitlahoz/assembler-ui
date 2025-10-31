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
    .map((dirent) => join(dirent.parentPath, dirent.name));
};

export const main = async () => {
  const directories = Paths.map((path: string) => join(GlobalPath, path));
  const errors: { dir: string; error: any }[] = [];
  let total = 0;
  for (const path of directories) {
    const componentDirs = getDirectories(path);

    let remaining = componentDirs.length;
    for (const dir of componentDirs) {
      total++;
      const outputPath = join(process.cwd(), dir, OutputFilename);
      try {
        await runWithSpinner({
          message: `Generating description ${dir}`,
          action: async () => {
            const result = parseFolder(join(dir), config);
            fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
          },
          successMessage: `File generated: ${outputPath}`,
          failMessage: `Error while generating ${dir}`,
        });
      } catch (error) {
        errors.push({ dir, error });
      }

      remaining--;
      showRemainingSpinner(remaining);
    }

    /*
    
    for (const dir of componentDirs) {
      total++;
      const relComponentPath = join(path.replace(process.cwd() + '/', ''), dir);
      const outputPath = join(path, dir, OutputFilename);
      try {
        await runWithSpinner({
          message: `Generating component ${dir}`,
          action: async () => {
            const result = createRegistryItem(relComponentPath, type, Config);
            fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
          },
          successMessage: `File generated: ${outputPath}`,
          failMessage: `Error while generating ${dir}`,
        });
      } catch (error) {
        errors.push({ dir, error });
      }
      
      */
  }
};
/*
  displayGenerationSummary(total, errors, {
    successMessage: `✔ {count} file(s) generated successfully.`,
  });
  console.log('');
  */

main();
