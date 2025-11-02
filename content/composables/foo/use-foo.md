---
title: useFoo
description: A simple composable that provides a description of the foo feature.
---





## Install with CLI
::hr-underline
::

This will install the item in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
  ```bash [yarn]
  yarn add @nuxt/ui
  ```
  
  ```bash [npm]
  npm install @nuxt/ui
  ```

  ```bash [pnpm]
  pnpm add @nuxt/ui
  ```
  
  ```bash [bun]
  bun add @nuxt/ui
  ```
:::



## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-foo/useFoo.ts"}


```ts [src/composables/use-foo/useFoo.ts]
export const useFoo = () => {
  const description =
    "This is a foo composable used for demonstration purposes.";
  return description;
};

```


:::









::tip
You can copy and adapt this template for any component documentation.
::