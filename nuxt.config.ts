// https://nuxt.com/docs/api/configuration/nuxt-config
// @ts-expect-error - Nuxt auto-imports defineNuxtConfig
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/ui',
    '@nuxt/content',
    'nuxt-og-image',
    'nuxt-llms',
  ],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
      ignore: ['index.ts'],
    },
  ],

  imports: {
    autoImport: true,
  },

  devtools: {
    enabled: true,
  },

  app: {
    baseURL: process.env.NODE_ENV === 'development' ? '/' : '/docs/',
  },

  css: ['~/assets/css/main.css'],

  content: {
    build: {
      markdown: {
        toc: {
          searchDepth: 1,
        },
      },
    },
    // Configuration des composants MDC
    highlight: {
      theme: 'github-dark',
    },
  },
  alias: {
    '@': '.',
  },

  compatibilityDate: '2024-07-11',

  nitro: {
    prerender: {
      routes: ['/'],
      crawlLinks: true,
      autoSubfolderIndex: false,
    },
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs',
      },
    },
  },

  icon: {
    provider: 'iconify',
  },

  llms: {
    domain: 'https://docs-template.nuxt.dev/',
    title: 'Nuxt Docs Template',
    description: 'A template for building documentation with Nuxt UI and Nuxt Content.',
    full: {
      title: 'Nuxt Docs Template - Full Documentation',
      description: 'This is the full documentation for the Nuxt Docs Template.',
    },
    sections: [
      {
        title: 'Getting Started',
        contentCollection: 'docs',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/getting-started%' }],
      },
      {
        title: 'Essentials',
        contentCollection: 'docs',
        contentFilters: [{ field: 'path', operator: 'LIKE', value: '/essentials%' }],
      },
    ],
  },
});
