import { resolve } from 'node:path';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  /*
  vite: {
    resolve: {
      alias: {
        '@': resolve(__dirname),
      },
    },
  },
  alias: {
    components: resolve(__dirname, 'app', 'components'),
    composables: resolve(__dirname, 'lib', 'composables'),
    utils: resolve(__dirname, 'lib', 'utils'),
    ui: resolve(__dirname, 'app', 'components', 'ui'),
    lib: resolve(__dirname, 'lib'),
  },
  */
  app: {
    baseURL: '/assembler-ui/',
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'apple-touch-icon', sizes: '192x192', href: '/android-chrome-192x192.png' },
        { rel: 'apple-touch-icon', sizes: '512x512', href: '/android-chrome-512x512.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' },
      ],
    },
  },
  modules: [
    '@anymud/nuxt-module-alias',
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/scripts',
    '@nuxt/ui',
    'shadcn-nuxt',
  ],
  robots: { robotsTxt: false },
  llms: {
    domain: 'https://benoitlahoz.github.io/assembler-ui',
    title: 'Assembler UI',
    description: 'Documentation for AssemblerUI components and features',
    sections: [
      {
        title: 'Getting Started',
        description: 'Getting started with Assembler UI',
        links: [
          {
            title: 'Introduction',
            description: 'Project overview',
            href: '/getting-started/introduction',
          },
          {
            title: 'Installation',
            description: 'How to install Assembler UI',
            href: '/getting-started/installation',
          },
          {
            title: 'Project Structure',
            description: 'File organization',
            href: '/getting-started/project-structure',
          },
        ],
      },
      {
        title: 'Essentials',
        description: 'Core features and syntax',
        links: [
          {
            title: 'Markdown Syntax',
            description: 'Markdown syntax guide',
            href: '/essentials/markdown-syntax',
          },
          {
            title: 'Code Blocks',
            description: 'How to use code blocks',
            href: '/essentials/code-blocks',
          },
          {
            title: 'Components',
            description: 'The list ofcomponents',
            href: '/essentials/components',
          },
        ],
      },
    ],
  },
  components: {
    dirs: [
      { path: '~/components', pathPrefix: false, extensions: ['.vue'], ignore: ['**/index.ts'] },
      { path: '~/../components', pathPrefix: false, extensions: ['.vue'], ignore: ['**/index.ts'] },
    ],
  },
});
