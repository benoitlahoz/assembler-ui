---
title: useComponentPalette
description: Composable pour gérer une palette de templates de composants
---

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-component-palette.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-component-palette.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-component-palette.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-component-palette.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/use-component-palette/useComponentPalette.ts"}

```ts [src/components/ui/use-component-palette/useComponentPalette.ts]
import { ref } from "vue";
import type {
  GridItem,
  GridItemTemplate,
} from "../../components/controls-grid";

export function useComponentPalette(templates: GridItemTemplate[] = []) {
  const availableTemplates = ref<GridItemTemplate[]>([...templates]);
  const itemCounter = ref(0);

  const createItemFromTemplate = (
    template: GridItemTemplate,
  ): Omit<GridItem, "x" | "y"> => {
    itemCounter.value++;
    const { label, color, icon, ...rest } = template;

    return {
      ...rest,
      id: `${template.id}-${itemCounter.value}`,
    };
  };

  const addTemplate = (template: GridItemTemplate) => {
    availableTemplates.value.push(template);
  };

  const removeTemplate = (id: string) => {
    const index = availableTemplates.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      availableTemplates.value.splice(index, 1);
    }
  };

  const getTemplateById = (id: string) => {
    return availableTemplates.value.find((t) => t.id === id);
  };

  const filterTemplatesBySize = (maxWidth: number, maxHeight: number) => {
    return availableTemplates.value.filter(
      (t) => t.width <= maxWidth && t.height <= maxHeight,
    );
  };

  return {
    availableTemplates,
    createItemFromTemplate,
    addTemplate,
    removeTemplate,
    getTemplateById,
    filterTemplatesBySize,
  };
}
```
:::

## useComponentPalette
::hr-underline
::

Composable pour gérer une palette de templates de composants

---

::tip
You can copy and adapt this template for any component documentation.
::