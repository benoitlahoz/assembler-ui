---
title: ControlButton
description: A 1:1 aspect ratio button component for grid-based layouts.
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <control-button-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref, shallowRef } from "vue";
import { ControlButton } from "@/components/ui/control-button";
import { ControlsGrid } from "~~/registry/new-york/components/controls-grid";

const GridControlButton = {
  props: [
    "id",
    "width",
    "height",
    "color",
    "variant",
    "shape",
    "icon",
    "label",
  ],
  setup(props: any) {
    const isActive = ref(false);

    const toggle = () => {
      isActive.value = !isActive.value;
      console.log(
        `Button ${props.label || props.id} ${isActive.value ? "activated" : "deactivated"}`,
      );
    };

    return { isActive, toggle };
  },
  template: `
    <ControlButton 
      :color="color" 
      :variant="variant || 'default'" 
      :shape="shape || 'square'"
      :class="{ 'ring-2 ring-offset-2': isActive }"
      @click="toggle"
    >
      <span v-if="icon" class="text-lg">{{ icon }}</span>
      <span v-else-if="label" class="text-xs font-bold">{{ label }}</span>
    </ControlButton>
  `,
};

const gridItems = ref([
  {
    id: "btn-1",
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    component: shallowRef(GridControlButton),
    color: "#3b82f6",
    variant: "default",
    shape: "square",
    icon: "▶",
  },
  {
    id: "btn-2",
    x: 1,
    y: 0,
    width: 1,
    height: 1,
    component: shallowRef(GridControlButton),
    color: "#ef4444",
    variant: "default",
    shape: "square",
    icon: "■",
  },
  {
    id: "btn-3",
    x: 2,
    y: 0,
    width: 1,
    height: 1,
    component: shallowRef(GridControlButton),
    color: "#8b5cf6",
    variant: "outline",
    shape: "circle",
    icon: "●",
  },
  {
    id: "btn-4",
    x: 0,
    y: 1,
    width: 2,
    height: 1,
    component: shallowRef(GridControlButton),
    color: "#10b981",
    variant: "default",
    shape: "square",
    label: "WIDE",
  },
]);

const buttonPalette = ref([
  {
    id: "new-square",
    width: 1,
    height: 1,
    component: shallowRef(GridControlButton),
    color: "#f59e0b",
    variant: "default",
    shape: "square",
    icon: "★",
  },
  {
    id: "new-circle",
    width: 1,
    height: 1,
    component: shallowRef(GridControlButton),
    color: "#ec4899",
    variant: "outline",
    shape: "circle",
    icon: "♥",
  },
  {
    id: "new-tall",
    width: 1,
    height: 2,
    component: shallowRef(GridControlButton),
    color: "#06b6d4",
    variant: "ghost",
    shape: "square",
    label: "TALL",
  },
  {
    id: "new-big",
    width: 2,
    height: 2,
    component: shallowRef(GridControlButton),
    color: "#a855f7",
    variant: "solid",
    shape: "square",
    icon: "✦",
  },
]);

const handleItemPlaced = (item: any) => {
  console.log("Item placed:", item);
};

const handleItemMoved = (item: any) => {
  console.log("Item moved:", item);
};

const handleItemRemoved = (id: string) => {
  console.log("Item removed:", id);
};
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <div class="space-y-2">
      <h3 class="text-lg font-semibold">Control Buttons dans la grille</h3>
      <p class="text-sm text-muted-foreground">
        Glissez-déposez les boutons depuis la palette vers la grille, ou
        déplacez-les dans la grille.
      </p>
    </div>

    <div class="space-y-2">
      <h4 class="text-sm font-medium">Palette de contrôles</h4>
      <div class="flex gap-3 p-4 bg-muted/30 rounded-lg border border-border">
        <div
          v-for="btn in buttonPalette"
          :key="btn.id"
          class="control-palette-item cursor-grab active:cursor-grabbing"
          :draggable="true"
          :style="{
            width: `${btn.width * 80 + (btn.width - 1) * 8}px`,
            height: `${btn.height * 80 + (btn.height - 1) * 8}px`,
          }"
          @dragstart="
            (e) => {
              e.dataTransfer!.effectAllowed = 'copy';
              e.dataTransfer!.setData(
                'application/json',
                JSON.stringify({
                  ...btn,
                  id: btn.id + '-' + Date.now(),
                }),
              );
            }
          "
        >
          <component
            :is="btn.component"
            v-bind="btn"
            class="pointer-events-none"
          />
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h4 class="text-sm font-medium">Grille de contrôles</h4>
      <ControlsGrid
        v-model:items="gridItems"
        :cell-size="80"
        :gap="8"
        :min-columns="4"
        @item-placed="handleItemPlaced"
        @item-moved="handleItemMoved"
        @item-removed="handleItemRemoved"
      />
    </div>

    <div class="text-xs text-muted-foreground space-y-1">
      <p>• Cliquez sur un bouton pour l'activer/désactiver (ring visuel)</p>
      <p>• Glissez depuis la palette pour ajouter de nouveaux contrôles</p>
      <p>• Glissez dans la grille pour réorganiser</p>
      <p>
        • Survolez un bouton dans la grille et cliquez sur × pour le supprimer
      </p>
    </div>
  </div>
</template>

<style scoped>
.control-palette-item {
  position: relative;
  border-radius: 0.5rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
}

.control-palette-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.control-palette-item:active {
  transform: scale(0.95);
}
</style>
```
  :::
::

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/control-button.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/control-button.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/control-button.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/control-button.json"
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
  "aspect-square w-auto h-auto min-w-0 min-h-0 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "shadow-xs hover:brightness-90",
        outline:
          "border border-current/20 bg-transparent shadow-xs hover:bg-current/10 dark:border-current/30 dark:hover:bg-current/20",
        ghost: "bg-transparent hover:bg-current/10",
        solid: "shadow-xs hover:brightness-90",
      },
      shape: {
        square: "rounded-md",
        circle: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
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
import { computed } from "vue";

export interface ControlButtonProps extends PrimitiveProps {
  variant?: ControlButtonVariants["variant"];
  shape?: ControlButtonVariants["shape"];
  color?: string;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<ControlButtonProps>(), {
  as: "button",
  shape: "square",
  variant: "default",
});

const colorStyle = computed(() => {
  if (!props.color) return {};

  const isVariable = props.color.startsWith("--");
  const colorValue = isVariable ? `var(${props.color})` : props.color;

  return {
    "--button-color": colorValue,
    "background-color":
      props.variant === "outline" || props.variant === "ghost"
        ? "transparent"
        : colorValue,
    color:
      props.variant === "outline" || props.variant === "ghost"
        ? colorValue
        : "white",
    "border-color": props.variant === "outline" ? colorValue : undefined,
  };
});
</script>

<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :class="
      cn(buttonVariants({ variant, shape }), 'w-full h-full', props.class)
    "
    :style="colorStyle"
  >
    <slot />
  </Primitive>
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
|`variant`{.primary .text-primary} | `default`{.mr-2} `outline`{.mr-2} `ghost`{.mr-2} `solid`{.mr-2} |
|`shape`{.primary .text-primary} | `square`{.mr-2} `circle`{.mr-2} |

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `variant`{.primary .text-primary} | `ControlButtonVariants['variant']` | default |  |
| `shape`{.primary .text-primary} | `ControlButtonVariants['shape']` | square |  |
| `color`{.primary .text-primary} | `string` | - |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

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

  ### Child Components

  `Label`{.primary .text-primary}

---

::tip
You can copy and adapt this template for any component documentation.
::