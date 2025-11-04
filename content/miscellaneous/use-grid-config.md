---
title: useGridConfig
description: Composable pour gérer la configuration de la grille
---

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-grid-config.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-grid-config.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-grid-config.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-grid-config.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/use-grid-config/useGridConfig.ts"}

```ts [src/components/ui/use-grid-config/useGridConfig.ts]
import { ref } from "vue";
import type { GridConfig } from "../../components/controls-grid";

export function useGridConfig(initialConfig: Partial<GridConfig> = {}) {
  const config = ref<GridConfig>({
    cellSize: initialConfig.cellSize || 80,
    gap: initialConfig.gap || 8,
    columns: initialConfig.columns || 6,
    rows: initialConfig.rows || 6,
    width: initialConfig.width || 0,
    height: initialConfig.height || 0,
  });

  const updateConfig = (updates: Partial<GridConfig>) => {
    config.value = { ...config.value, ...updates };
  };

  const resetConfig = () => {
    config.value = {
      cellSize: 80,
      gap: 8,
      columns: 6,
      rows: 6,
      width: 0,
      height: 0,
    };
  };

  const calculateGridSize = (
    containerWidth: number,
    containerHeight: number,
  ) => {
    const columns = Math.floor(
      containerWidth / (config.value.cellSize + config.value.gap),
    );
    const rows = Math.floor(
      containerHeight / (config.value.cellSize + config.value.gap),
    );

    updateConfig({
      columns,
      rows,
      width: containerWidth,
      height: containerHeight,
    });
  };

  return {
    config,
    updateConfig,
    resetConfig,
    calculateGridSize,
  };
}
```
:::

## useGridConfig
::hr-underline
::

Composable pour gérer la configuration de la grille

---

::tip
You can copy and adapt this template for any component documentation.
::