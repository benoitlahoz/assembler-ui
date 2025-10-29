// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: '/assembler-ui/',
  },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/scripts', '@nuxt/ui'],
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
});
