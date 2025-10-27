// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['shadcn-docs-nuxt'],

  content: {
    documentDriven: true,
    highlight: {
      theme: {
        // Default theme
        default: 'github-light',
        // Theme used in dark-mode
        dark: 'github-dark',
      }
    }
  },

  modules: ['@nuxt/image', '@nuxt/eslint'],

  devtools: { enabled: true },

  compatibilityDate: '2024-07-06',

  i18n: {
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        name: 'English',
        language: 'en-US',
      },
    ],
  },
});
