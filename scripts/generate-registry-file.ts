import fs from 'fs';
import path from 'path';
import { runWithSpinner, displayGenerationSummary } from './utils/terminal-display';
import config from '../assembler-ui.config.js';

const RegistryPath = config.registryPath || 'registry.json';

/**
 * Reads all generated assemblerjs.json files and builds an object matching registry.json (without the doc property).
 * @param {string[]} files - List of paths to assemblerjs.json files
 * @returns {object} - Object ready to be written to registry.json
 */
export async function buildRegistryObject(files: string[]) {
  const items = files.map((filePath) => {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // Supprimer la propriété install si elle existe
    if ('install' in content) {
      delete content.install;
    }
    // Keep only path and type in each file
    if (Array.isArray(content.files)) {
      content.files = content.files.map((f: Record<string, any>) => {
        return {
          path: f.path,
          type: typeof f.type !== 'undefined' ? f.type : null,
        };
      });
    }
    // Remove $schema at file level
    delete content.$schema;
    return content;
  });
  return {
    $schema: 'https://shadcn-vue.com/schema/registry-item.json',
    name: 'Assembler UI',
    homepage: 'https://benoitlahoz.github.io/assembler-ui',
    items,
  };
}

// Recursively search for all assemblerjs.json files in the registry/new-york folder
function findAssemblerJsonFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findAssemblerJsonFiles(filePath));
    } else if (file === 'assemblerjs.json') {
      results.push(filePath);
    }
  });
  return results;
}

// Point d'entrée principal pour générer registry.json
async function main() {
  const baseDir = path.join(process.cwd(), 'registry', 'new-york');
  let errors: { dir: string; error: any }[] = [];
  let registry: Awaited<ReturnType<typeof buildRegistryObject>> | null = null;
  let files: string[] = [];
  await runWithSpinner({
    message: 'Generating registry.json...',
    action: async () => {
      files = findAssemblerJsonFiles(baseDir);
      registry = await buildRegistryObject(files);
      const outputPath = path.join(process.cwd(), RegistryPath);
      fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2), 'utf-8');
      return { count: registry.items.length };
    },
    successMessage: (res) =>
      `registry.json generated with ${res?.count ?? 0} items in ${RegistryPath}.`,
    failMessage: 'Error while generating registry.json',
  });
  displayGenerationSummary(files.length, errors, {
    successMessage: '✔ {count} items in registry.json generated successfully.',
  });
}

if (require.main === module) {
  main();
}
