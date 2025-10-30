import fs from 'fs';
import { parse } from '@vue/compiler-sfc';
import { extractDescriptionAndAuthor } from './vue/description-and-author';
import { extractEmits } from './vue/emits';
import { extractExposes } from './vue/exposes';
import { extractProps } from './vue/props';
import { extractInjects } from './vue/injects';
import { extractProvides } from './vue/provides';
import { extractSlots } from './vue/slots';
import { extractComponentTypes } from './vue/types';

// Fonction principale exportée
export const extractVueDoc = (vueFilePath: string) => {
  const absPath = vueFilePath.startsWith('/') ? vueFilePath : `${process.cwd()}/${vueFilePath}`;
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
  }
  return {
    file: vueFilePath,
    description,
    author,
    props,
    slots,
    emits,
    exposes,
    injects,
    provides,
    types,
  };
};

// Utilisation CLI
if (require.main === module) {
  const vueFilePath = process.argv[2] || 'registry/new-york/components/button-foo/ButtonFoo.vue';
  const result = extractVueDoc(vueFilePath);
  fs.writeFileSync('scripts/attempts/vue-comments.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log('Vue comments extraction result written to scripts/attempts/vue-comments.json');
}
