// scripts/create-registry-file.ts
// This script generates a registry file compatible with shadcn-vue by scanning the generated component folders.
// It aggregates the necessary information from the files present in each component folder.

import fs from 'fs';
import { join, resolve, relative, dirname } from 'path';
import config from '../assembler-ui.config';
import {
  runWithSpinner,
  displayGenerationSummary,
  showRemainingSpinner,
} from '../utils/terminal-display';

// Read config info
const REGISTRY_ROOT = resolve(process.cwd(), config.globalPath);
const DEFINITION_FILE = config.definitionFile || 'assemblerjs.json';
const OUTPUT_FILE = join(process.cwd(), 'registry.json');

// Utility function to recursively read component folders
const walkRegistry = (dir: string): any[] => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let registryEntries: any[] = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // Traverse subfolders
      registryEntries = registryEntries.concat(walkRegistry(fullPath));
    } else if (entry.isFile() && entry.name === DEFINITION_FILE) {
      try {
        const json = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        // Remove 'props' property at root and in each file in 'files'
        if ('props' in json) {
          delete json.props;
        }
        if (Array.isArray(json.files)) {
          json.files = json.files.map((file: any) => {
            if ('props' in file) {
              const { props, ...rest } = file;
              return rest;
            }
            return file;
          });
        }
        registryEntries.push(json);
      } catch (e) {
        registryEntries.push({ error: e, file: fullPath });
      }
    }
  }
  return registryEntries;
};

// Generate the registry
const generateRegistry = async () => {
  if (!fs.existsSync(REGISTRY_ROOT)) {
    console.error(`Registry folder does not exist: ${REGISTRY_ROOT}`);
    process.exit(1);
  }
  let errors: { dir: string; error: any }[] = [];
  let entries: any[] = [];
  await runWithSpinner({
    message: 'Generating registry file...',
    action: async () => {
      entries = walkRegistry(REGISTRY_ROOT);
      // Collect errors from walkRegistry
      errors = entries
        .filter((item) => item && item.error)
        .map((item) => ({ dir: item.file, error: item.error }));
      entries = entries.filter((item) => !item.error);
      const registry = {
        $schema: 'https://shadcn-vue.com/schema/registry-item.json',
        name: config.name || 'Registry',
        homepage: config.homepage || '',
        items: entries,
      };
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2), 'utf-8');
    },
    successMessage: `Registry generated at ${OUTPUT_FILE}`,
    failMessage: 'Error while generating registry',
  });
  displayGenerationSummary(entries.length, errors, {
    successMessage: `✔ {count} item(s) added to registry.json.\n✔ 1 registry.json file generated.`,
  });
};

generateRegistry();
