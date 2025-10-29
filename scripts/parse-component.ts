import * as ts from 'typescript';
import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { parse } from '@vue/compiler-sfc';
import { toKebabCase, toPascalCase } from '@assemblerjs/core';
import type { PropInfo, RegistryItem } from './types';
import { extractAjsItemDescription } from './meta-parse/extract-ajs-item-description';
import { extractAjsPropDescriptions } from './meta-parse/extract-ajs-prop-descriptions';
import { visit, findWithDefaults } from './sfc-parse';

export const toPascalCaseWithSpaces = (str: string): string => {
  const pascal = toPascalCase(str);
  return pascal.replace(/(?!^)([A-Z])/g, ' $1');
};

export const getComponentMetaFromFolder = (folderPath: string) => {
  const folderName = basename(folderPath);
  const kebabName = toKebabCase(folderName);
  const title = toPascalCaseWithSpaces(folderName);
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

export const extractSFCProps = (filePath: string) => {
  const source = readFileSync(filePath, 'utf-8');
  const { descriptor } = parse(source);
  const script = descriptor.scriptSetup || descriptor.script;
  if (!script) return [];
  // Utilise la fonction extraite pour associer les descriptions @ajs-prop aux props
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
  // Fusionne les descriptions trouvées textuellement
  for (const prop of props) {
    if (propDescriptions[prop.name]) {
      prop.description = propDescriptions[prop.name];
    }
  }
  return props;
};

export const createRegistryItem = (folderPath: string): RegistryItem => {
  const meta = getComponentMetaFromFolder(folderPath);
  const vueFilePath = meta.path ? require('path').join(folderPath, meta.path) : '';
  const props = vueFilePath ? extractSFCProps(vueFilePath) : [];
  return {
    type: 'component',
    name: meta.name,
    title: meta.title,
    description: meta.description,
    files: [
      {
        path: meta.path,
        type: 'vue',
        props,
      },
    ],
  };
};

console.log(createRegistryItem('registry/new-york/components/knob'));
