---
title: ControlButton
description: A 1:1 aspect ratio button component.
---




  




::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <control-button-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
  ```vue
<script setup lang="ts">
import {
  ControlButton,
  ControlButtonLabel,
} from "@/components/ui/control-button";
import { Separator } from "@/components/ui/separator";
</script>

<template>
  <div class="flex items-center justify-center h-128 gap-4">
    <ControlButton shape="square" size="sm">
      <ControlButtonLabel class="text-sm font-bold pt-2"
        ># 1</ControlButtonLabel
      >
    </ControlButton>
    <ControlButton shape="square" size="default" variant="destructive">
      <ControlButtonLabel class="text-sm font-bold pt-2"
        ># 2</ControlButtonLabel
      >
    </ControlButton>
    <ControlButton shape="circle" variant="secondary">
      <ControlButtonLabel class="text-sm font-bold pt-2"
        ># 3</ControlButtonLabel
      >
    </ControlButton>
    <div class="h-24">
      <Separator orientation="vertical" class="mx-4" />
    </div>
    <ControlButton shape="square" variant="outline" size="lg"> </ControlButton>
  </div>
</template>

  ```
  :::
::



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

:::code-tree{default-value="src/components/ui/control-button/index.ts"}


```ts [src/components/ui/control-button/index.ts]
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as ControlButton } from "./ControlButton.vue";
export { default as ControlButtonLabel } from "./ControlButtonLabel.vue";

export const buttonVariants = cva(
  "aspect-square w-auto h-auto min-w-0 min-h-0 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      },
      size: {
        default: "size-9",
        sm: "size-8",
        lg: "size-10",
      },
      shape: {
        square: "rounded-md",
        circle: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "square",
    },
  },
);

export type ControlButtonVariants = VariantProps<typeof buttonVariants>;
export { type ControlButtonProps } from "./ControlButton.vue";
export { type ControlButtonLabelProps } from "./ControlButtonLabel.vue";

```

```vue [src/components/ui/control-button/ControlButton.vue]
<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import type { ControlButtonVariants } from ".";
import { Primitive } from "reka-ui";
import { cn } from "@/lib/utils";
import { buttonVariants } from ".";

import { ControlButtonLabel } from "@/components/ui/control-button";

export interface ControlButtonProps extends PrimitiveProps {
  variant?: ControlButtonVariants["variant"];
  size?: ControlButtonVariants["size"];
  shape?: ControlButtonVariants["shape"];
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<ControlButtonProps>(), {
  as: "button",
  shape: "square",
});
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <Primitive
      data-slot="button"
      :as="as"
      :as-child="asChild"
      :class="cn(buttonVariants({ variant, size, shape }), props.class)"
    >
    </Primitive>

    <slot />
  </div>
</template>

```

```vue [src/components/ui/control-button/ControlButtonLabel.vue]
<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";

export interface ControlButtonLabelProps {
  class?: HTMLAttributes["class"];
}

const props = defineProps<ControlButtonLabelProps>();
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <Label :class="cn(props.class)">
      <slot />
    </Label>
  </div>
</template>

```


:::




## ControlButton
::hr-underline
::




**API**: composition





  
### Variants
**ControlButtonVariants**
| Name | Values |
|------|--------|
|`variant`{.primary .text-primary} | `default`{.mr-2} `destructive`{.mr-2} `outline`{.mr-2} `secondary`{.mr-2} |
|`size`{.primary .text-primary} | `default`{.mr-2} `sm`{.mr-2} `lg`{.mr-2} |
|`shape`{.primary .text-primary} | `square`{.mr-2} `circle`{.mr-2} |




  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `variant`{.primary .text-primary} | `ControlButtonVariants['variant']` | - |  |
| `size`{.primary .text-primary} | `ControlButtonVariants['size']` | - |  |
| `shape`{.primary .text-primary} | `ControlButtonVariants['shape']` | square |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |






  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |













  ### Types
| Name | Type | Description |
|------|------|-------------|
| `ControlButtonProps`{.primary .text-primary} | `interface` | - |





  ### Child Components

  `Primitive`{.primary .text-primary}




---


## ControlButtonLabel
::hr-underline
::




**API**: composition







  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |






  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |













  ### Types
| Name | Type | Description |
|------|------|-------------|
| `ControlButtonLabelProps`{.primary .text-primary} | `interface` | - |





  ### Child Components

  `Label`{.primary .text-primary}




---







::tip
You can copy and adapt this template for any component documentation.
::