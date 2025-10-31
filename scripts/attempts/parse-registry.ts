import path from 'path';
import fs from 'fs';
import { toPascalCase } from '@assemblerjs/core';
import { isCompositionApi } from './common/is.composition-api';
import { extractTs } from './ts/extract-ts';
import { extractVueSfcOptions } from './parse-vue-sfc-options';
import { extractVueSfcComposition } from './parse-vue-sfc-composition';

import config from '../../assembler-ui.config';

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
    // Détection stricte : <script ... setup ...> non vide
    const vueSource = fs.readFileSync(vuePath, 'utf-8');
    const isComposition = isCompositionApi(vueSource);
    // On passe un chemin relatif au workspace à extractVueSfc/extractVueSfcSetup
    const relVuePath = path.relative(process.cwd(), vuePath);
    const doc = isComposition
      ? extractVueSfcComposition(relVuePath, config)
      : extractVueSfcOptions(relVuePath, config);
    return {
      name: path.basename(vuePath, '.vue'),
      path: relVuePath,
      api: isComposition ? 'composition' : 'options',
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
