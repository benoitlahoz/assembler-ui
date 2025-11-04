import fs from 'fs';
import pathModule from 'path';
import { parse } from '@vue/compiler-sfc';
import { extractDescriptionAndTags } from './common/extract-description-and-tags';
import { extractEmits } from './vue-sfc-composition/emits';
import { extractExposes } from './vue-sfc-composition/exposes';
import { extractProps } from './vue-sfc-composition/props';
import { extractCvaVariants } from './vue-sfc-composition/cva-variants';
import { extractInjects } from './vue-sfc-composition/injects';
import { extractProvides } from './vue-sfc-composition/provides';
import { extractSlots } from './vue-sfc-composition/slots';
import { extractComponentTypes } from './vue-sfc-composition/types';
import { extractChildComponents } from './common/extract-child-components';
import { extractCssVars } from './common/extract-css-vars';
import { convertTemplateToPug } from './common/convert-template-to-pug';

// Main exported function
export const extractVueSfcComposition = (filePath: string, config: Record<string, any>) => {
  const GlobalPath = config.globalPath || 'registry/new-york/';

  const absPath = filePath.startsWith('/') ? filePath : `${process.cwd()}/${filePath}`;
  // Relative path to config.globalPath and always prefixed by config.globalPath
  let relPath = absPath.includes(config.globalPath)
    ? pathModule.relative(config.globalPath, absPath)
    : filePath;
  // Always prefix by config.globalPath (and avoid double slashes)
  relPath = pathModule.join(config.globalPath, relPath).replace(/\\/g, '/');
  let vueSource = fs.readFileSync(absPath, 'utf-8');

  const searchString = `~~/${GlobalPath}components`;
  vueSource = vueSource.replace(searchString, '@/components/ui');

  const { descriptor } = parse(vueSource);

  const script = descriptor.scriptSetup || descriptor.script;
  let description = '';
  let tags: Record<string, any> = {};
  let props: Array<{ name: string; type: string; default?: any; description: string }> = [];
  let slots: any[] = [];
  let emits: Array<{ name: string; description: string }> = [];
  let exposes: Array<{ name: string; description: string; type?: string }> = [];
  let injects: Array<{ key: string; default?: any; type?: string; description: string }> = [];
  let provides: Array<{ key: string; value?: any; type?: string; description: string }> = [];
  let types: any[] = [];
  let childComponents: string[] = [];
  let cssVars: { name: string; value: string; description: string }[] = [];
  let variants: Record<string, Record<string, string[]>> = {};
  if (script) {
    const descAndAuthor = extractDescriptionAndTags(script.content);
    description = descAndAuthor.description;
    tags = descAndAuthor.tags;
    props = extractProps(script.content, absPath);
    emits = extractEmits(script.content, absPath);
    exposes = extractExposes(script.content, absPath);
    injects = extractInjects(script.content, absPath);
    provides = extractProvides(script.content, absPath);
    types = extractComponentTypes(script.content, absPath);

    // Search for a cva import in the component folder (extraction of all cva variants)
    const dir = pathModule.dirname(absPath);
    const indexPath = pathModule.join(dir, 'index.ts');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      if (indexContent.includes('cva(')) {
        const allVariants = extractCvaVariants(indexContent, indexPath);
        // Keep only variants whose type is used in the props
        // Collect the type/key pairs used in the props
        const usedTypeKeys: Array<{ type: string; key: string }> = props
          .map((p) => {
            if (typeof p.type === 'string') {
              const match = p.type.match(/^(\w+)\['([\w-]+)'\]$/);
              if (match) return { type: match[1], key: match[2] };
            }
            return undefined;
          })
          .filter(Boolean) as Array<{ type: string; key: string }>;
        variants = {} as Record<string, Record<string, string[]>>;
        for (const { type, key } of usedTypeKeys) {
          if (type && key && allVariants[type] && allVariants[type][key]) {
            if (!variants[type]) variants[type] = {};
            variants[type][key] = allVariants[type][key];
          }
        }
      }
    }
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
    tags,
    childComponents,
    props,
    variants,
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
