import pkg from './package.json' assert { type: 'json' };

export default {
  $schema: 'https://shadcn-vue.com/schema/registry-item.json',
  registryPath: '.registry.json',
  name: 'Assembler UI',
  homepage: 'https://benoitlahoz.github.io/assembler-ui',
  // Unless `// @ajs-author` is specified in a file, this author info will be used.
  author: pkg.author,
  domain: 'https://benoitlahoz.github.io/assembler-ui/r',
  definitionFile: 'assemblerjs.json',
  globalPath: 'registry/new-york/',
  paths: ['components', 'blocks', 'composables'],
  dependencies: ['vue-sonner'],
  registryDependencies: ['button', 'separator'],
  doc: {
    paths: {
      components: 'content/3.components',
      blocks: 'content/4.blocks',
      composables: 'content/5.composables',
    },
  },
};
