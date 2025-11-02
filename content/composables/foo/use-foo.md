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
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-foo.json"
  ```

  ```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-foo.json"
  ```

  ```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-foo.json"
  ```

  ```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-foo.json"
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