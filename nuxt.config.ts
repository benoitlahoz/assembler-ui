// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: '/assembler-ui/',
  },
  modules: ['@nuxt/content', '@nuxt/eslint', '@nuxt/scripts', '@nuxt/ui'],
  robots: { robotsTxt: false },
});
