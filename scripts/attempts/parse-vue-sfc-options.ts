import fs from 'fs';
import pathModule from 'path';
import { parse } from '@vue/compiler-sfc';
import { extractDescriptionAndAuthor } from './common/extract-description-and-author';
import { extractEmits } from './vue-sfc-options/emits';
import { extractExposes } from './vue-sfc-options/exposes';
import { extractProps } from './vue-sfc-options/props';
import { extractInjects } from './vue-sfc-options/injects';
import { extractProvides } from './vue-sfc-options/provides';
import { extractSlots } from './vue-sfc-options/slots';
import { extractComponentTypes } from './vue-sfc-options/types';
import { extractChildComponents } from './common/extract-child-components';
import { extractCssVars } from './common/extract-css-vars';
import { convertTemplateToPug } from './common/convert-template-to-pug';

export const extractVueSfcOptions = (filePath: string, config: Record<string, any>) => {
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
    props = propsResult;
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
