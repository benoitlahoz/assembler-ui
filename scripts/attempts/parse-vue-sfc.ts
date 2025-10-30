import fs from 'fs';
import { parse } from '@vue/compiler-sfc';
import { extractDescriptionAndAuthor } from './vue-sfc/description-and-author';
import { extractEmits } from './vue-sfc/emits';
import { extractExposes } from './vue-sfc/exposes';
import { extractProps } from './vue-sfc/props';
import { extractInjects } from './vue-sfc/injects';
import { extractProvides } from './vue-sfc/provides';
import { extractSlotsFromTemplate } from './vue-common/slots-template';
import { extractComponentTypes } from './vue-sfc/types';
import { extractChildComponents } from './vue-sfc/child-components';
import { extractCssVars } from './vue-sfc/css-vars';
import { convertHtmlToPug } from './vue-sfc/pug-converter';

export const extractVueSfc = (file: string) => {
  const absPath = file.startsWith('/') ? file : `${process.cwd()}/${file}`;
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
    const descAndAuthor = extractDescriptionAndAuthor(script.content);
    description = descAndAuthor.description;
    author = descAndAuthor.author;
    props = extractProps(script.content, absPath);
    emits = extractEmits(script.content, absPath);
    exposes = extractExposes(script.content, absPath);
    injects = extractInjects(script.content, absPath);
    provides = extractProvides(script.content, absPath);
    types = extractComponentTypes(script.content, absPath);
  }
  if (descriptor.template && descriptor.template.content) {
    slots = extractSlotsFromTemplate(descriptor.template.content);
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
    file,
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
  const vueFilePath =
    process.argv[2] || 'registry/new-york/components/button-foo/ButtonFooNoSetup.vue';
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
