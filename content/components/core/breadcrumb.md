---
title: Breadcrumb
description: 
---

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/breadcrumb.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/breadcrumb.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/breadcrumb.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/breadcrumb.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/breadcrumb/index.ts"}

```ts [src/components/ui/breadcrumb/index.ts]
export { default as Breadcrumb } from "./Breadcrumb.vue";
export { default as BreadcrumbItem } from "./BreadcrumbItem.vue";
```

```vue [src/components/ui/breadcrumb/Breadcrumb.vue]
<script setup lang="ts"></script>

<template>
  <div>B</div>
</template>

<style scoped></style>
```

```vue [src/components/ui/breadcrumb/BreadcrumbItem.vue]
<script setup lang="ts"></script>

<template>
  <div>B</div>
</template>

<style scoped></style>
```
:::

## Breadcrumb
::hr-underline
::

**API**: composition

---

## BreadcrumbItem
::hr-underline
::

**API**: composition

---

::tip
You can copy and adapt this template for any component documentation.
::