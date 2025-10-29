// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: '/assembler-ui/', // Nécessaire pour GitHub Pages
  },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/scripts', '@nuxt/ui'],
});
