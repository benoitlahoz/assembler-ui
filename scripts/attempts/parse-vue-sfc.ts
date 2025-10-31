import fs from 'fs';
import pathModule from 'path';
import config from '../../assembler-ui.config';
import { parse } from '@vue/compiler-sfc';
import { extractDescriptionAndAuthor } from './vue-sfc/description-and-author';
import { extractEmits } from './vue-sfc/emits';
import { extractExposes } from './vue-sfc/exposes';
import { extractProps } from './vue-sfc/props';
import { extractInjects } from './vue-sfc/injects';
import { extractProvides } from './vue-sfc/provides';
import { extractSlots } from './vue-sfc/slots';
import { extractComponentTypes } from './vue-sfc/types';
import { extractChildComponents } from './vue-sfc/child-components';
import { extractCssVars } from './common/extract-css-vars';
import { convertHtmlToPug } from './vue-common/pug-converter';

export const extractVueSfc = (filePath: string) => {
  const absPath = filePath.startsWith('/') ? filePath : `${process.cwd()}/${filePath}`;
  // Chemin relatif à config.globalPath et toujours préfixé par config.globalPath
  let relPath = absPath.includes(config.globalPath)
    ? pathModule.relative(config.globalPath, absPath)
    : filePath;
  // Toujours préfixer par config.globalPath (et éviter les doubles slashs)
  relPath = pathModule.join(config.globalPath, relPath).replace(/\\/g, '/');
  const vueSource = fs.readFileSync(absPath, 'utf-8');
  const { descriptor } = parse(vueSource);
  const script = descriptor.script;
  let description = '';
  let author = '';
  let props: Array<{ name: string; type: string; default?: any; description: string }> = [];
  let slots: any[] = [];
  let emits: Array<{ name: string; description: string }> = [];
  let exposes: Array<{ name: string; description: string; type?: string }> = [];
  let injects: Array<{ key: string; default?: any; type?: string; description: string }> = [];
  let provides: Array<{ key: string; value?: any; type?: string; description: string }> = [];
  let types: any[] = [];
  let childComponents: string[] = [];
  let cssVars: { name: string; value: string; description: string }[] = [];
  if (script) {
    // Normalisation : supprime les espaces en début de ligne pour fiabiliser le parsing AST
    let normalizedScript = script.content.replace(/^ +/gm, '');
    const descAndAuthor = extractDescriptionAndAuthor(normalizedScript);
    description = descAndAuthor.description;
    author = descAndAuthor.author;
    const templateContent =
      descriptor.template && descriptor.template.content ? descriptor.template.content : undefined;
    const propsResult = extractProps(normalizedScript, absPath);
    props = Array.isArray(propsResult) ? propsResult : propsResult.props;
    slots = extractSlots(templateContent);
    emits = extractEmits(normalizedScript, absPath);
    exposes = extractExposes(normalizedScript, absPath);
    injects = extractInjects(normalizedScript, absPath);
    provides = extractProvides(normalizedScript, absPath);
    types = extractComponentTypes(normalizedScript, absPath);
  }
  if (descriptor.template && descriptor.template.content) {
    // slots déjà extraits ci-dessus
    childComponents = extractChildComponents(descriptor.template.content);
  }
  if (descriptor.styles && descriptor.styles.length > 0) {
    cssVars = extractCssVars(descriptor.styles.map((s) => s.content).join('\n'));
  }
  let pugString = '';
  if (descriptor.template && descriptor.template.content) {
    pugString = convertHtmlToPug(descriptor.template.content);
  }
  return {
    path: relPath,
    description,
    author,
    childComponents,
    props,
    slots,
    emits,
    exposes,
    injects,
    provides,
    types,
    cssVars,
    source: {
      html: vueSource,
      pug:
        descriptor.template && descriptor.template.content && pugString
          ? vueSource.replace(
              /<template[^>]*>[\s\S]*?<\/template>/,
              `<template lang=\"pug\">\n${pugString}\n<\/template>`
            )
          : vueSource,
    },
  };
};

if (require.main === module) {
  const vueFilePath = process.argv[2] || 'registry/new-york/components/input/SimpleInput.vue';
  const result = extractVueSfc(vueFilePath);
  fs.writeFileSync(
    'scripts/attempts/vue-comments-no-setup.json',
    JSON.stringify(result, null, 2),
    'utf-8'
  );
  console.log(
    'Vue comments extraction result written to scripts/attempts/vue-comments-no-setup.json'
  );
}
