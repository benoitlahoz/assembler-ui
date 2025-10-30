import fs from 'fs';
import { join } from 'path';
import { createRegistryItem } from './crawl-registry-folders';
import {
  runWithSpinner,
  displayGenerationSummary,
  showRemainingSpinner,
} from './utils/terminal-display';
import type { RegistryItemType } from './types';
import Config from '../assembler-ui.config';

const GlobalPath = Config.globalPath;
const Paths = Config.paths;
const OutputFileName = Config.definitionFile || 'assemblerjs.json';

const getDirectories = (source: string) => {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
};

async function main() {
  const directories = Object.keys(Paths).map((key) => ({
    path: join(process.cwd(), GlobalPath, Paths[key as keyof typeof Paths]),
    type: `registry:${key}` as RegistryItemType,
  }));

  const errors: { dir: string; error: any }[] = [];
  let total = 0;
  for (const { path, type } of directories) {
    const componentDirs = getDirectories(path);
    let remaining = componentDirs.length;
    for (const dir of componentDirs) {
      total++;
      const relComponentPath = join(path.replace(process.cwd() + '/', ''), dir);
      const outputPath = join(path, dir, OutputFileName);
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
      remaining--;
      showRemainingSpinner(remaining);
    }
  }
  displayGenerationSummary(total, errors, {
    successMessage: `✔ {count} file(s) generated successfully.`,
  });
  console.log('');
}

main();
