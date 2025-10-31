import path from 'path';
import fs from 'fs';
import { toPascalCase } from '@assemblerjs/core';
import { extractTs } from './ts/extract-ts';
import { extractVueSfc } from './parse-vue-sfc';
import { extractVueSfcSetup } from './parse-vue-sfc-setup';

import config from '../../assembler-ui.config';
import { vueExportRegex } from './common/vue-export.regex';
import { scriptSetupRegex } from './common/script-setup.regex';

export const extractFolder = (file: string) => {
  const absPath = file.startsWith('/') ? file : path.resolve(process.cwd(), file);
  const tsSource = fs.readFileSync(absPath, 'utf-8');
  const info = extractTs(absPath);
  const folderDir = path.dirname(absPath);
  const folder = path.basename(folderDir);
  // Cherche tous les fichiers .vue du dossier
  const vueFiles = fs
    .readdirSync(folderDir)
    .filter((f) => f.endsWith('.vue'))
    .map((f) => path.join(folderDir, f));
  // Parse chaque .vue
  const vueItems = vueFiles.map((vuePath) => {
    // Détection stricte : <script ... setup ...>
    const vueSource = fs.readFileSync(vuePath, 'utf-8');
    // Recherche tous les blocs <script ...>
    const scriptBlockRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
    let match;
    let hasSetup = false;
    let hasNonEmptySetup = false;
    while ((match = scriptBlockRegex.exec(vueSource))) {
      const attrs = match[1];
      const content = match[2];
      const isSetupBlock = /\bsetup\b/i.test(attrs || '');
      if (isSetupBlock) {
        hasSetup = true;
        if (content && content.trim().length > 0) {
          hasNonEmptySetup = true;
        }
      }
    }
    const isSetup = hasNonEmptySetup;
    // On passe un chemin relatif au workspace à extractVueSfc/extractVueSfcSetup
    const relVuePath = path.relative(process.cwd(), vuePath);
    const doc = isSetup ? extractVueSfcSetup(relVuePath) : extractVueSfc(relVuePath);
    return {
      name: path.basename(vuePath, '.vue'),
      path: relVuePath,
      doc,
    };
  });
  // Ajoute l'index.ts comme premier item
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

if (require.main === module) {
  const tsFilePath = 'registry/new-york/components/input/index.ts';
  const result = extractFolder(tsFilePath);
  fs.writeFileSync('scripts/attempts/ts-comments.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log('TS+Vue comments extraction result written to scripts/attempts/ts/ts-comments.json');
}
