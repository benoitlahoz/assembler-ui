import { resolve, dirname, basename, join, relative } from 'path';
import fs from 'fs';
import { toKebabCase, toPascalCase } from '@assemblerjs/core';
import { isCompositionApi } from './common/is.composition-api';
import { extractTs, extractDeclareModule } from './ts/extract-ts';
import { extractVueSfcOptions } from './parse-vue-sfc-options';
import { extractVueSfcComposition } from './parse-vue-sfc-composition';

export const parseFolder = (path: string, config: Record<string, any>) => {
  // path est maintenant un dossier
  const absDir = path.startsWith('/') ? path : resolve(process.cwd(), path);
  const folder = basename(absDir);

  // Cherche tous les fichiers .vue du dossier
  const vueFiles = fs
    .readdirSync(absDir)
    .filter((f) => f.endsWith('.vue'))
    .map((f) => join(absDir, f));
  // Parse chaque .vue
  const vueItems = vueFiles.map((vuePath) => {
    const vueSource = fs.readFileSync(vuePath, 'utf-8');
    const isComposition = isCompositionApi(vueSource);
    const relVuePath = relative(process.cwd(), vuePath);
    const doc = isComposition
      ? extractVueSfcComposition(relVuePath, config)
      : extractVueSfcOptions(relVuePath, config);
    const { tags, ...docWithoutTags } = doc;
    return {
      name: basename(vuePath, '.vue'),
      path: relVuePath,
      api: isComposition ? 'composition' : 'options',
      description: doc.description || '',
      ...(tags || {}),
      doc: docWithoutTags,
    };
  });

  // Cherche tous les fichiers .ts du dossier (hors .d.ts)
  const tsFiles = fs
    .readdirSync(absDir)
    .filter((f) => f.endsWith('.ts'))
    .map((f) => join(absDir, f));

  // On extrait les infos de chaque .ts
  let tsItems = tsFiles.map((tsPath) => {
    const absTsPath = tsPath.startsWith('/') ? tsPath : resolve(process.cwd(), tsPath);
    const absGlobalPath = config.globalPath.startsWith('/')
      ? config.globalPath
      : resolve(process.cwd(), config.globalPath);
    const tsSourceFile = fs.readFileSync(absTsPath, 'utf-8');
    const tsInfo = extractTs(absTsPath);
    const { description, types, ...tags } = tsInfo;
    let doc: any = {
      types,
      source: tsSourceFile,
    };
    if (absTsPath.endsWith('.d.ts')) {
      const declare = extractDeclareModule(tsSourceFile);
      if (declare) {
        doc = { declare };
      }
    }
    // path relatif à config.globalPath (robuste)
    let relTsPath;
    if (absTsPath.startsWith(absGlobalPath)) {
      relTsPath = join(config.globalPath, relative(absGlobalPath, absTsPath));
    } else {
      relTsPath = join(config.globalPath, basename(absTsPath));
    }
    return {
      name: basename(absTsPath, '.ts'),
      path: relTsPath,
      description: description || '',
      ...tags,
      doc,
    };
  });

  // Place index.ts en premier si présent
  const indexIdx = tsItems.findIndex((item) => item.name === 'index');
  if (indexIdx > 0) {
    const [indexItem] = tsItems.splice(indexIdx, 1);
    if (indexItem) {
      tsItems = [indexItem, ...tsItems];
    }
  }

  const allItems = [...tsItems, ...vueItems];
  const foundType = (allItems.find((item) => (item as any).type) as any)?.type;
  const result = {
    name: toKebabCase(folder),
    title: toPascalCase(folder),
    description: allItems.find((item) => item.description)?.description || '',
    // Can be undefined.
    type: foundType,
    files: allItems,
  };

  return result;
};
/*
if (require.main === module) {
  const tsFilePath = 'registry/new-york/components/my-input/index.ts';
  const result = extractFolder(tsFilePath);
  fs.writeFileSync(
    'scripts/parse-folder/ts-comments.json',
    JSON.stringify(result, null, 2),
    'utf-8'
  );
  console.log('TS+Vue comments extraction result written to scripts/parse-folder/ts-comments.json');
}
*/
