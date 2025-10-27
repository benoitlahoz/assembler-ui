// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Your custom configs here
  {
    ignores: [
      'dist',
      '.output',
      'node_modules',
    ],
  },
  {
    files: ['**/*.{js,ts,vue}'],
    extends: [
      'eslint:recommended',
      'plugin:vue/vue3-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
      'prettier',
    ],
    rules: {
      // Ajoutez vos règles personnalisées ici
    },
  },
]
)
