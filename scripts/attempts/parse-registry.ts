import path from 'path';
import fs from 'fs';
import { toPascalCase } from '@assemblerjs/core';
import { extractTs } from './ts/extract-ts';
import { extractVueSfc } from './parse-vue-sfc';
import { extractVueSfcSetup } from './parse-vue-sfc-setup';

import config from '../../assembler-ui.config';

export const extractFolder = (file: string) => {
  const absPath = file.startsWith('/') ? file : path.resolve(process.cwd(), file);
  const tsSource = fs.readFileSync(absPath, 'utf-8');
  const info = extractTs(absPath);
  const vueItems = extractVueExportsFromTsFile(absPath, tsSource, config.globalPath);
  // Ajoute l'index.ts comme premier item
  const folder = path.basename(path.dirname(absPath));
  // Chemin absolu commençant par config.globalPath
  const fullFile = absPath.startsWith(config.globalPath)
    ? absPath
    : path.join(config.globalPath, path.relative(config.globalPath, absPath));
  const indexItem = {
    name: 'index',
    path: fullFile,
    doc: {
      description: info.description || '',
      author: info.author || '',
      category: info.category || '',
      types: info.types,
      source: tsSource,
    },
  };
  return {
    name: folder,
    title: toPascalCase(folder),
    path: fullFile,
    description: info.description || '',
    author: info.author || '',
    category: info.category || '',
    source: tsSource,
    items: [indexItem, ...vueItems],
  };
};

export const extractVueExportsFromTsFile = (
  tsFilePath: string,
  tsSource: string,
  globalPath?: string
) => {
  // Chercher les exports de composants Vue
  const vueExports = [];
  const vueExportRegex = /export\s+\{\s*default\s+as\s+(\w+)\s*\}\s+from\s+['"](.+\.vue)['"]/g;
  let match;
  while ((match = vueExportRegex.exec(tsSource))) {
    vueExports.push({ name: match[1], path: match[2] });
  }

  // Pour chaque composant, détecter le type (setup ou non) et parser
  return vueExports.map(({ name, path: vueRelPath }) => {
    if (!vueRelPath) return { name, path: undefined, doc: undefined };
    const vueAbsPath = vueRelPath.startsWith('/')
      ? vueRelPath
      : path.resolve(path.dirname(tsFilePath), vueRelPath);
    if (!vueAbsPath) return { name, path: undefined, isSetup: false, doc: undefined };
    const relFile = globalPath ? path.relative(globalPath, vueAbsPath) : vueAbsPath;
    const vueSource = fs.readFileSync(vueAbsPath, 'utf-8');
    // Heuristique : présence de <script setup>
    const isSetup = /<script\s+setup[\s>]/.test(vueSource);
    const doc = isSetup ? extractVueSfcSetup(vueAbsPath) : extractVueSfc(vueAbsPath);
    return { name, path: relFile, doc };
  });
};

if (require.main === module) {
  const tsFilePath = 'registry/new-york/components/button-foo/index.ts';
  const result = extractFolder(tsFilePath);
  fs.writeFileSync('scripts/attempts/ts-comments.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log('TS+Vue comments extraction result written to scripts/attempts/ts/ts-comments.json');
}
