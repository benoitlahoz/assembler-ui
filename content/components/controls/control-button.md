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
import { ref, onMounted, shallowRef, h } from "vue";
import { ControlButton } from "@/components/ui/control-button";
import { ControlGrid } from "~~/registry/new-york/components/control-grid";
import { useControlRegistry } from "~~/registry/new-york/composables/use-control-registry/useControlRegistry";
import type { ControlDefinition } from "~~/registry/new-york/composables/use-control-registry/useControlRegistry";

const { registerControls, getAllControls, createControlInstance } =
  useControlRegistry();

const createButtonComponent = (icon: string, label?: string) => {
  return {
    name: "GridControlButton",
    props: ["color", "variant", "shape"],
    setup(props: any) {
      const isActive = ref(false);

      const toggle = () => {
        isActive.value = !isActive.value;
        console.log(`Button ${isActive.value ? "activated" : "deactivated"}`);
      };

      return () =>
        h(
          ControlButton,
          {
            color: props.color,
            variant: props.variant || "default",
            shape: props.shape || "square",
            class: isActive.value ? "ring-2 ring-offset-2" : "",
            onClick: toggle,
          },
          () =>
            h(
              "span",
              { class: label ? "text-xs font-bold" : "text-lg" },
              label || icon,
            ),
        );
    },
  };
};

const controlDefinitions: ControlDefinition[] = [
  {
    id: "button-play",
    name: "Play",
    component: shallowRef(createButtonComponent("▶")),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: "#3b82f6", variant: "default", shape: "square" },
    category: "buttons",
    color: "#3b82f6",
  },
  {
    id: "button-stop",
    name: "Stop",
    component: shallowRef(createButtonComponent("■")),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: "#ef4444", variant: "default", shape: "square" },
    category: "buttons",
    color: "#ef4444",
  },
  {
    id: "button-circle",
    name: "Circle",
    component: shallowRef(createButtonComponent("●")),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: "#8b5cf6", variant: "outline", shape: "circle" },
    category: "buttons",
    color: "#8b5cf6",
  },
  {
    id: "button-wide",
    name: "Wide",
    component: shallowRef(createButtonComponent("", "WIDE")),
    defaultSize: { width: 2, height: 1 },
    defaultProps: { color: "#10b981", variant: "default", shape: "square" },
    category: "buttons",
    color: "#10b981",
  },
  {
    id: "button-star",
    name: "Star",
    component: shallowRef(createButtonComponent("★")),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: "#f59e0b", variant: "default", shape: "square" },
    category: "special",
    color: "#f59e0b",
  },
  {
    id: "button-heart",
    name: "Heart",
    component: shallowRef(createButtonComponent("♥")),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: "#ec4899", variant: "outline", shape: "circle" },
    category: "special",
    color: "#ec4899",
  },
  {
    id: "button-tall",
    name: "Tall",
    component: shallowRef(createButtonComponent("", "TALL")),
    defaultSize: { width: 1, height: 2 },
    defaultProps: { color: "#06b6d4", variant: "ghost", shape: "square" },
    category: "special",
    color: "#06b6d4",
  },
  {
    id: "button-big",
    name: "Big",
    component: shallowRef(createButtonComponent("✦")),
    defaultSize: { width: 2, height: 2 },
    defaultProps: { color: "#a855f7", variant: "solid", shape: "square" },
    category: "special",
    color: "#a855f7",
  },
];

const gridItems = ref<any[]>([]);
const availableControls = ref<ControlDefinition[]>([]);

onMounted(() => {
  registerControls(controlDefinitions);
  availableControls.value = getAllControls();

  const initialControls = [
    "button-play",
    "button-stop",
    "button-circle",
    "button-wide",
  ];
  initialControls.forEach((controlId, index) => {
    const instance = createControlInstance(controlId, {
      x: index % 3,
      y: Math.floor(index / 3),
    });
    if (instance) {
      gridItems.value.push(instance);
    }
  });
});

const handlePaletteDragStart = (
  event: DragEvent,
  control: ControlDefinition,
) => {
  const instance = createControlInstance(control.id);
  if (instance && event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/json", JSON.stringify(instance));
  }
};

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
      <div
        class="flex gap-3 p-4 bg-muted/30 rounded-lg border border-border flex-wrap"
      >
        <div
          v-for="control in availableControls"
          :key="control.id"
          class="control-palette-item cursor-grab active:cursor-grabbing"
          :draggable="true"
          :style="{
            width: `${(control.defaultSize?.width || 1) * 80 + ((control.defaultSize?.width || 1) - 1) * 8}px`,
            height: `${(control.defaultSize?.height || 1) * 80 + ((control.defaultSize?.height || 1) - 1) * 8}px`,
            backgroundColor: control.color,
          }"
          @dragstart="handlePaletteDragStart($event, control)"
        >
          <div
            class="w-full h-full flex items-center justify-center text-white font-bold text-xs"
          >
            {{ control.name }}
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <h4 class="text-sm font-medium">Grille de contrôles</h4>
      <ControlGrid
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

::tip
You can copy and adapt this template for any component documentation.
::