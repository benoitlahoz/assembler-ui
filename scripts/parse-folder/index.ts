import { resolve, dirname, basename, join, relative } from 'path';
import fs from 'fs';
import { toKebabCase, toPascalCase, toCamelCase } from '@assemblerjs/core';
import { extractDemo } from './common/extract-demo';
import { convertContent } from './common/convert-template-to-pug';
import { isCompositionApi } from './common/is.composition-api';
import { extractTs, extractDeclareModule } from './ts/extract-ts';
import { extractVueSfcOptions } from './parse-vue-sfc-options';
import { extractVueSfcComposition } from './parse-vue-sfc-composition';
import { extractComposable } from './parse-composable';

export const parseFolder = (path: string, config: Record<string, any>) => {
  // path est maintenant un dossier
  const absDir = path.startsWith('/') ? path : resolve(process.cwd(), path);
  const folder = basename(absDir);

  // ===== 1. PARSE INDEX.TS =====
  let indexItem: any = null;
  let indexVariants: Record<string, Record<string, string[]>> = {};

  const indexPath = join(absDir, 'index.ts');
  if (fs.existsSync(indexPath)) {
    const absGlobalPath = config.globalPath.startsWith('/')
      ? config.globalPath
      : resolve(process.cwd(), config.globalPath);
    const tsSourceFile = fs.readFileSync(indexPath, 'utf-8');
    const tsInfo = extractTs(indexPath);
    const { description, types, variants, ...tags } = tsInfo;

    let doc: any = {
      types,
      source: tsSourceFile,
    };

    if (variants) {
      doc.variants = variants;
      indexVariants = variants;
    }

    let relTsPath;
    if (indexPath.startsWith(absGlobalPath)) {
      relTsPath = join(config.globalPath, relative(absGlobalPath, indexPath));
    } else {
      relTsPath = join(config.globalPath, basename(indexPath));
    }

    indexItem = {
      name: 'index',
      title: toCamelCase('index'),
      path: relTsPath,
      description: description || '',
      ...tags,
      doc,
    };
  }

  // ===== 2. PARSE COMPOSANTS VUE =====
  const vueFiles = fs
    .readdirSync(absDir)
    .filter((f) => f.endsWith('.vue'))
    .map((f) => join(absDir, f));

  const vueItems = vueFiles.map((vuePath) => {
    const vueSource = fs.readFileSync(vuePath, 'utf-8');
    const isComposition = isCompositionApi(vueSource);
    const relVuePath = relative(process.cwd(), vuePath);
    const doc = isComposition
      ? extractVueSfcComposition(relVuePath, { ...config, indexVariants })
      : extractVueSfcOptions(relVuePath, { ...config, indexVariants });

    // Remplacement des types ButtonVariants['variant'] dans les props par les valeurs extraites
    if (doc.props && indexVariants) {
      for (const prop of doc.props) {
        const match = typeof prop.type === 'string' && prop.type.match(/^(\w+)\['([\w-]+)'\]$/);
        if (match) {
          const typeName = match[1];
          const variantKey = match[2];
          let variantObj: Record<string, string[]> | undefined = undefined;
          if (
            indexVariants &&
            typeof typeName === 'string' &&
            Object.prototype.hasOwnProperty.call(indexVariants, typeName)
          ) {
            variantObj = indexVariants[typeName];
          }
          let valuesArr: string[] | undefined = undefined;
          if (
            variantObj &&
            typeof variantKey === 'string' &&
            Object.prototype.hasOwnProperty.call(variantObj, variantKey)
          ) {
            valuesArr = variantObj[variantKey];
          }
          if (Array.isArray(valuesArr)) {
            (prop as any).values = valuesArr;
          }
        }
      }
    }

    const { tags, ...docWithoutTags } = doc;
    const name = basename(vuePath, '.vue');

    return {
      name,
      title: toPascalCase(name),
      path: relVuePath,
      api: isComposition ? 'composition' : 'options',
      description: doc.description || '',
      ...(tags || {}),
      doc: docWithoutTags,
    };
  });

  // Place le fichier Vue portant le nom du dossier en première position
  const folderNamePascal = toPascalCase(folder);
  const vueFileIdx = vueItems.findIndex((item) => item.name === folderNamePascal);
  if (vueFileIdx > 0) {
    const [vueItem] = vueItems.splice(vueFileIdx, 1);
    if (vueItem) {
      vueItems.unshift(vueItem);
    }
  }

  // ===== 3. PARSE COMPOSABLES (fichiers .ts sauf index.ts) =====
  const tsFiles = fs
    .readdirSync(absDir)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts' && !f.endsWith('.d.ts'))
    .map((f) => join(absDir, f));

  const composableItems = tsFiles
    .filter((tsPath) => {
      // Ne traiter que les fichiers qui commencent par "use" (convention des composables)
      const fileName = basename(tsPath, '.ts');
      return fileName.startsWith('use');
    })
    .map((tsPath) => {
      const relTsPath = relative(process.cwd(), tsPath);
      const composableData = extractComposable(relTsPath, config);
      const { tags, ...docWithoutTags } = composableData;
      const name = basename(tsPath, '.ts');

      return {
        name,
        title: toCamelCase(name),
        path: relTsPath,
        description: composableData.description || '',
        ...(tags || {}),
        doc: docWithoutTags,
      };
    });

  // ===== 4. PARSE AUTRES FICHIERS TS (utilitaires, types, etc.) =====
  const otherTsItems = tsFiles
    .filter((tsPath) => {
      const fileName = basename(tsPath, '.ts');
      return !fileName.startsWith('use'); // Tout sauf les composables
    })
    .map((tsPath) => {
      const absGlobalPath = config.globalPath.startsWith('/')
        ? config.globalPath
        : resolve(process.cwd(), config.globalPath);
      const tsSourceFile = fs.readFileSync(tsPath, 'utf-8');
      const tsInfo = extractTs(tsPath);
      const { description, types, variants, ...tags } = tsInfo;

      let doc: any = {
        types,
        source: tsSourceFile,
      };

      if (tsPath.endsWith('.d.ts')) {
        const declare = extractDeclareModule(tsSourceFile);
        if (declare) {
          doc = { declare };
        }
      }

      let relTsPath;
      if (tsPath.startsWith(absGlobalPath)) {
        relTsPath = join(config.globalPath, relative(absGlobalPath, tsPath));
      } else {
        relTsPath = join(config.globalPath, basename(tsPath));
      }

      const name = basename(tsPath, '.ts');
      return {
        name,
        title: toCamelCase(name),
        path: relTsPath,
        description: description || '',
        ...tags,
        doc,
      };
    });

  // Place le fichier TS portant le nom du dossier en première position des autres TS
  const folderNameKebab = toKebabCase(folder);
  const folderFileIdx = otherTsItems.findIndex((item) => item.name === folderNameKebab);
  if (folderFileIdx > 0) {
    const [folderItem] = otherTsItems.splice(folderFileIdx, 1);
    if (folderItem) {
      otherTsItems.unshift(folderItem);
    }
  }

  // ===== 5. CONSTRUCTION FINALE =====
  // Ordre : index.ts, composants Vue, composables, autres fichiers TS
  const allItems = [
    ...(indexItem ? [indexItem] : []),
    ...vueItems,
    ...composableItems,
    ...otherTsItems,
  ];

  const foundType = (allItems.find((item) => (item as any).type) as any)?.type;

  let title;
  if (allItems.length > 0) {
    // S'il y a au moins un fichier .vue, PascalCase, sinon camelCase
    if (allItems.some((item) => item.path.endsWith('.vue'))) {
      title = toPascalCase(folder);
    } else {
      title = toCamelCase(folder);
    }
  } else {
    title = toPascalCase(folder);
  }

  // Regroupe toutes les demos des files, cherche le code source, et les place à la racine
  let demo: any[] = [];
  if (Array.isArray(allItems)) {
    demo = extractDemo(absDir, allItems, config);
    // Supprime demo de chaque file
    for (const file of allItems) {
      if ((file as any).demo) {
        delete (file as any).demo;
      }
    }
  }

  const result: any = {
    name: toKebabCase(folder),
    title,
    description: allItems.find((item) => item.description)?.description || '',
    type: foundType,
    files: allItems,
  };

  if (demo.length > 0) {
    result.demo = demo;
  }

  return result;
};
