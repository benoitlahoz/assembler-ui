---
title: useControlsGrid
description: Composable pour gérer l&#39;état et les opérations d&#39;une grille de contrôles
---

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-controls-grid.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-controls-grid.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-controls-grid.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-controls-grid.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-controls-grid/useControlsGrid.ts"}

```ts [src/composables/use-controls-grid/useControlsGrid.ts]
import { ref, computed } from "vue";
import type { GridItem } from "../../components/controls-grid";
import { GridUtils } from "../../components/controls-grid";

export function useControlsGrid(initialItems: GridItem[] = []) {
  const items = ref<GridItem[]>([...initialItems]);
  const selectedItemId = ref<string | null>(null);
  const history = ref<GridItem[][]>([]);
  const historyIndex = ref(-1);
  const maxHistorySize = 50;

  const selectedItem = computed(() => {
    if (!selectedItemId.value) return null;
    return items.value.find((item) => item.id === selectedItemId.value) || null;
  });

  const canUndo = computed(() => historyIndex.value > 0);
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);

  const totalArea = computed(() => {
    return items.value.reduce(
      (sum, item) => sum + GridUtils.calculateArea(item),
      0,
    );
  });

  const addToHistory = () => {
    history.value = history.value.slice(0, historyIndex.value + 1);

    history.value.push(JSON.parse(JSON.stringify(items.value)));

    if (history.value.length > maxHistorySize) {
      history.value.shift();
    } else {
      historyIndex.value++;
    }
  };

  const undo = () => {
    if (!canUndo.value) return;

    historyIndex.value--;
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]));
  };

  const redo = () => {
    if (!canRedo.value) return;

    historyIndex.value++;
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]));
  };

  const addItem = (item: GridItem) => {
    items.value.push(item);
    addToHistory();
  };

  const removeItem = (id: string) => {
    const index = items.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      items.value.splice(index, 1);
      if (selectedItemId.value === id) {
        selectedItemId.value = null;
      }
      addToHistory();
    }
  };

  const updateItem = (id: string, updates: Partial<GridItem>) => {
    const index = items.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updates } as GridItem;
      addToHistory();
    }
  };

  const clearItems = () => {
    items.value = [];
    selectedItemId.value = null;
    addToHistory();
  };

  const selectItem = (id: string | null) => {
    selectedItemId.value = id;
  };

  const duplicateItem = (id: string, offsetX = 1, offsetY = 0) => {
    const item = items.value.find((item) => item.id === id);
    if (!item) return null;

    const newItem = GridUtils.cloneItemAtPosition(
      item,
      item.x + offsetX,
      item.y + offsetY,
    );

    items.value.push(newItem);
    addToHistory();

    return newItem;
  };

  const exportConfig = () => {
    return {
      items: items.value,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };
  };

  const importConfig = (config: { items: GridItem[] }) => {
    items.value = config.items;
    selectedItemId.value = null;
    addToHistory();
  };

  const saveToLocalStorage = (key = "controls-grid-config") => {
    try {
      localStorage.setItem(key, JSON.stringify(exportConfig()));
      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      return false;
    }
  };

  const loadFromLocalStorage = (key = "controls-grid-config") => {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const config = JSON.parse(data);
        importConfig(config);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      return false;
    }
  };

  const sortItems = () => {
    items.value = GridUtils.sortItems(items.value);
  };

  const getItemById = (id: string) => {
    return items.value.find((item) => item.id === id);
  };

  const getItemsAtPosition = (x: number, y: number) => {
    return items.value.filter(
      (item) =>
        x >= item.x &&
        x < item.x + item.width &&
        y >= item.y &&
        y < item.y + item.height,
    );
  };

  if (items.value.length > 0) {
    addToHistory();
  }

  return {
    items,
    selectedItemId,
    selectedItem,
    canUndo,
    canRedo,
    totalArea,

    addItem,
    removeItem,
    updateItem,
    clearItems,
    selectItem,
    duplicateItem,
    undo,
    redo,
    exportConfig,
    importConfig,
    saveToLocalStorage,
    loadFromLocalStorage,
    sortItems,
    getItemById,
    getItemsAtPosition,
  };
}
```
:::

## API
::hr-underline
::

  ### Parameters
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `initialItems`{.primary .text-primary} | `GridItem[]` | [] | — |

  ### Returns

| Property | Type | Description |
|----------|------|-------------|
| `items`{.primary .text-primary} | `Ref<GridItem[]>` | État |
| `selectedItemId`{.primary .text-primary} | `Ref<string \| null>` | — |
| `selectedItem`{.primary .text-primary} | `ComputedRef<any>` | — |
| `canUndo`{.primary .text-primary} | `ComputedRef<any>` | — |
| `canRedo`{.primary .text-primary} | `ComputedRef<any>` | — |
| `totalArea`{.primary .text-primary} | `ComputedRef<any>` | — |
| `addItem`{.primary .text-primary} | `any` | Méthodes |
| `removeItem`{.primary .text-primary} | `any` | — |
| `updateItem`{.primary .text-primary} | `any` | — |
| `clearItems`{.primary .text-primary} | `any` | — |
| `selectItem`{.primary .text-primary} | `any` | — |
| `duplicateItem`{.primary .text-primary} | `any` | — |
| `undo`{.primary .text-primary} | `any` | — |
| `redo`{.primary .text-primary} | `any` | — |
| `exportConfig`{.primary .text-primary} | `any` | — |
| `importConfig`{.primary .text-primary} | `any` | — |
| `saveToLocalStorage`{.primary .text-primary} | `any` | — |
| `loadFromLocalStorage`{.primary .text-primary} | `any` | — |
| `sortItems`{.primary .text-primary} | `any` | — |
| `getItemById`{.primary .text-primary} | `any` | — |
| `getItemsAtPosition`{.primary .text-primary} | `any` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
