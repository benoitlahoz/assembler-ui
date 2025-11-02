---
title: MediaDevicesProvider
description: 
---





## Install with CLI
::hr-underline
::

This will install the item in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
  ```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```

  ```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```

  ```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```

  ```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```
:::



## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/media-devices-provider/index.ts"}


```ts [src/components/ui/media-devices-provider/index.ts]
export { default as MediaDevicesProvider } from "./MediaDevicesProvider.vue";

```

```vue [src/components/ui/media-devices-provider/MediaDevicesProvider.vue]
<script setup lang="ts"></script>

<template>
  <div class="media-device-provider">
</template>

<style scoped></style>

```


:::




## MediaDevicesProvider
::hr-underline
::




**API**: composition
























---







::tip
You can copy and adapt this template for any component documentation.
::