import pkg from './package.json' assert { type: 'json' };

export default {
  name: 'Assembler UI',
  // Unless `@author` is specified in a file, this author info will be used.
  author: pkg.author,
  homepage: 'https://benoitlahoz.github.io/assembler-ui',
  $schema: 'https://shadcn-vue.com/schema/registry-item.json',
  domain: 'https://benoitlahoz.github.io/assembler-ui/r',
  registryPath: '.registry.json',
  definitionFile: 'assemblerjs.json',
  globalPath: 'registry/new-york/',
  paths: ['components', 'blocks', 'composables'],
  dependencies: ['vue-sonner'],
  registryDependencies: ['button', 'separator'],
  // Mapping des types registry vers les dossiers de documentation
  typeMapping: {
    ui: 'components',
    component: 'components',
    hook: 'composables',
    block: 'blocks',
  },
  install: {
    pnpm: 'pnpm dlx shadcn-vue@latest add',
    npm: 'npx shadcn-vue@latest add',
    yarn: 'npx shadcn-vue@latest add',
    bun: 'bunx --bun shadcn-vue@latest add',
  },
};
