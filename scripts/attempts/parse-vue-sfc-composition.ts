import fs from 'fs';
import pathModule from 'path';
import { parse } from '@vue/compiler-sfc';
import { extractDescriptionAndAuthor } from './common/extract-description-and-author';
import { extractEmits } from './vue-sfc-composition/emits';
import { extractExposes } from './vue-sfc-composition/exposes';
import { extractProps } from './vue-sfc-composition/props';
import { extractInjects } from './vue-sfc-composition/injects';
import { extractProvides } from './vue-sfc-composition/provides';
import { extractSlots } from './vue-sfc-composition/slots';
import { extractComponentTypes } from './vue-sfc-composition/types';
import { extractChildComponents } from './common/extract-child-components';
import { extractCssVars } from './common/extract-css-vars';
import { convertTemplateToPug } from './common/convert-template-to-pug';

// Main exported function
export const extractVueSfcComposition = (filePath: string, config: Record<string, any>) => {
  const absPath = filePath.startsWith('/') ? filePath : `${process.cwd()}/${filePath}`;
  // Chemin relatif à config.globalPath et toujours préfixé par config.globalPath
  let relPath = absPath.includes(config.globalPath)
    ? pathModule.relative(config.globalPath, absPath)
    : filePath;
  // Toujours préfixer par config.globalPath (et éviter les doubles slashs)
  relPath = pathModule.join(config.globalPath, relPath).replace(/\\/g, '/');
  const vueSource = fs.readFileSync(absPath, 'utf-8');
  const { descriptor } = parse(vueSource);
  const script = descriptor.scriptSetup || descriptor.script;
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
    slots = extractSlots(script ? script.content : '', absPath, descriptor.template.content);
    childComponents = extractChildComponents(descriptor.template.content);
  }
  if (descriptor.styles && descriptor.styles.length > 0) {
    // Only take the first <style> block (or concatenate all)
    cssVars = extractCssVars(descriptor.styles.map((s) => s.content).join('\n'));
  }
  // Compose the source property (html/pug)
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
      pug: convertTemplateToPug(
        vueSource,
        (descriptor.template && descriptor.template.content) || undefined
      ),
    },
  };
};
