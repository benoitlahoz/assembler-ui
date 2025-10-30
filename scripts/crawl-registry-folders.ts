import * as ts from 'typescript';
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import { parse } from '@vue/compiler-sfc';
import { toKebabCase, toPascalCase, toCamelCase } from '@assemblerjs/core';
import type { PropInfo, RegistryItem } from './types';
import { extractAjsItemDescription } from './meta-parse/extract-ajs-item-description';
import { extractAjsPropDescriptions } from './meta-parse/extract-ajs-prop-descriptions';
import { extractAjsAuthorsFromFolder } from './meta-parse/extract-ajs-author';
import { extractAjsCategoryFromFolder } from './meta-parse/extract-ajs-category';
import { visit, findWithDefaults } from './sfc-parse';
import { type RegistryFile, type RegistryItemType } from './types';

const getComponentMetaFromFolder = (folderPath: string, type: RegistryItemType) => {
  const folderName = basename(folderPath);
  const kebabName = toKebabCase(folderName);
  const title = type === 'registry:ui' ? toPascalCase(folderName) : toCamelCase(folderName);
  const files = readdirSync(folderPath);
  const vueFile = files.find((f) => f.endsWith('.vue'));
  let description;
  if (vueFile) {
    description = extractAjsItemDescription(join(folderPath, vueFile));
  }
  return {
    name: kebabName,
    title,
    description: description || '',
    path: vueFile || '',
  };
};

const extractSFCProps = (filePath: string, sourceOverride?: string) => {
  const source = sourceOverride ?? readFileSync(filePath, 'utf-8');
  const { descriptor } = parse(source);
  const script = descriptor.scriptSetup || descriptor.script;
  if (!script) return [];
  const propDescriptions = extractAjsPropDescriptions(script.content);
  const sourceFile = ts.createSourceFile(
    filePath,
    script.content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const defaultsMap = findWithDefaults(sourceFile);
  const props: PropInfo[] = [];
  visit(sourceFile, props, defaultsMap, sourceFile);
  for (const prop of props) {
    if (propDescriptions[prop.name]) {
      prop.description = propDescriptions[prop.name];
    }
  }
  return props;
};

const getGlobalDescription = (
  folderPath: string,
  metaDescription: string,
  vueFiles: string[]
): string => {
  const indexTsPath = join(folderPath, 'index.ts');
  let description = metaDescription;
  try {
    const indexSource = readFileSync(indexTsPath, 'utf-8');
    const desc = extractAjsItemDescription(indexSource, true);
    if (desc) return desc;
  } catch {}
  if (vueFiles.length > 0) {
    try {
      const vueSource = readFileSync(join(folderPath, vueFiles[0]!), 'utf-8');
      const desc = extractAjsItemDescription(vueSource, true);
      if (desc) return desc;
    } catch {}
  }
  return description;
};

const buildRegistryFiles = (
  absFolderPath: string,
  secondaryType: string,
  config: any,
  relFolderPath: string
): RegistryFile[] => {
  const files: RegistryFile[] = readdirSync(absFolderPath)
    .filter((f: string) => f.endsWith('.ts'))
    .map((f: string) => ({
      path: join(relFolderPath, f),
      type: secondaryType,
    }));
  const vueFiles = readdirSync(absFolderPath).filter((f) => f.endsWith('.vue'));
  vueFiles.forEach((vueFile) => {
    const filePath = join(absFolderPath, vueFile);
    let fileProps: PropInfo[] = [];
    let fileDescription: string | undefined = undefined;
    try {
      const vueSource = readFileSync(filePath, 'utf-8');
      fileProps = extractSFCProps(filePath, vueSource);
      fileDescription = extractAjsItemDescription(vueSource, true);
    } catch {}
    const fileObj: RegistryFile = {
      path: join(relFolderPath, vueFile),
      type: secondaryType,
      ...(fileProps.length > 0 ? { props: fileProps } : {}),
      ...(fileDescription ? { description: fileDescription } : {}),
    };
    files.push(fileObj);
  });
  return files;
};

export const createRegistryItem = (
  folderPath: string,
  registryType: RegistryItemType,
  config: any
): RegistryItem => {
  // Résout le chemin absolu pour le traitement
  const absFolderPath = resolve(process.cwd(), folderPath);
  const primaryType = registryType;
  const secondaryType = registryType === 'registry:block' ? 'registry:ui' : registryType;
  const meta = getComponentMetaFromFolder(absFolderPath, secondaryType);
  const vueFiles = readdirSync(absFolderPath).filter((f) => f.endsWith('.vue'));
  const description = getGlobalDescription(absFolderPath, meta.description, vueFiles);
  const author = extractAjsAuthorsFromFolder(absFolderPath) || config.author || '';
  const files = buildRegistryFiles(absFolderPath, secondaryType, config, folderPath);
  // Construction de l'objet assemblerJson avec la catégorie si présente
  const category = extractAjsCategoryFromFolder(absFolderPath);
  const assemblerJson: RegistryItem = {
    type: primaryType,
    name: meta.name,
    title: meta.title,
    description,
    author,
    ...(category ? { category } : {}),
    files,
  };
  return assemblerJson;
};
