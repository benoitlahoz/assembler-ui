import fs from 'fs';
import path from 'path';
import { createRegistryItem } from './parse-component';

const COMPONENTS_DIR = path.join(__dirname, '../registry/new-york/components');

function getDirectories(source: string) {
  return fs.readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

async function main() {
  const componentDirs = getDirectories(COMPONENTS_DIR);
  for (const dir of componentDirs) {
    const componentPath = path.join(COMPONENTS_DIR, dir);
    try {
  const result = createRegistryItem(componentPath);
      const outputPath = path.join(componentPath, 'assemblerjs.json');
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');
      console.log(`Écrit : ${outputPath}`);
    } catch (err) {
      console.error(`Erreur lors du traitement de ${dir}:`, err);
    }
  }
}

main();
