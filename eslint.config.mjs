// @ts-check

import withNuxt from './.nuxt/eslint.config.mjs';

/**
 * Ajoute la règle pour forcer l'ordre des blocks dans les fichiers .vue : script, template, style
 */
export default {
  ...withNuxt(),
  rules: {
    ...((withNuxt() && withNuxt().rules) || {}),
    'vue/block-order': [
      'error',
      {
        order: ['script', 'template', 'style'],
      },
    ],
  },
};
