---
title: useFoo
description: A simple composable that provides a description of the foo feature.
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <use-foo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
  ```vue
  <useFoo />
  ```
  :::
::

## Install with CLI 

:::code-group{.w-full}
  ```bash [pnpm]
  pnpm add @nuxt/ui
  ```
  
  ```bash [yarn]
  yarn add @nuxt/ui
  ```
  
  ```bash [npm]
  npm install @nuxt/ui
  ```
  
  ```bash [bun]
  bun add @nuxt/ui
  ```
:::


## Install Manually

:::code-tree


```ts [useFoo.ts]
/**
 * A simple composable that provides a description of the foo feature.
 * @type registry:hook
 */
export const useFoo = () => {
  const description = 'This is a foo composable used for demonstration purposes.';
  return description;
};

```


:::





## Advanced Usage

<!-- Add more code-preview/code-group/code-tree blocks as needed for advanced examples -->

::tip
You can copy and adapt this template for any component documentation.
::