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
import type { GridItem } from "../../components/control-grid";
import { GridUtils } from "../../components/control-grid";

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

```ts [src/components/ui/control-grid/index.ts]
import type { Component, InjectionKey, Ref } from "vue";

export { default as ControlGrid } from "./ControlGrid.vue";
export { default as ControlGridToolbar } from "./ControlGridToolbar.vue";
export { default as ControlGridItem } from "./ControlGridItem.vue";

export { useControlsGrid } from "../../composables/use-controls-grid/useControlsGrid";
export { useControlRegistry } from "../../composables/use-control-registry/useControlRegistry";

export interface ComponentToRegister {
  name: string;

  component: Component;
}

export interface GridItem {
  id: string;

  x: number;

  y: number;

  width: number;

  height: number;

  component?: any;

  color?: string;

  [key: string]: any;
}

export interface GridPosition {
  x: number;

  y: number;
}

export interface GridDimensions {
  width: number;

  height: number;
}

export interface GridConfig {
  cellSize: number;

  gap: number;

  columns: number;

  rows: number;

  width: number;

  height: number;
}

export interface GridItemTemplate extends Omit<GridItem, "x" | "y"> {
  label?: string;

  color?: string;

  icon?: string;
}

export interface GridEvents {
  "update:items": (items: GridItem[]) => void;

  "item-placed": (item: GridItem) => void;

  "item-moved": (item: GridItem) => void;

  "item-removed": (id: string) => void;

  "config-changed": (config: GridConfig) => void;
}

export interface GridMethods {
  addItem: (item: Omit<GridItem, "x" | "y">) => GridItem | null;

  addItemByComponent: (
    componentName: string,
    width?: number,
    height?: number,
    additionalProps?: Record<string, any>,
  ) => GridItem | null;

  removeItem: (id: string) => void;

  clearGrid: () => void;

  getComponent: (name: string) => Component | undefined;

  getRegisteredComponents: () => string[];

  isCellOccupied?: (x: number, y: number, excludeId?: string) => boolean;

  isValidPlacement?: (
    x: number,
    y: number,
    width: number,
    height: number,
    excludeId?: string,
  ) => boolean;

  findAvailablePosition?: (
    width: number,
    height: number,
  ) => GridPosition | null;
}

export interface GridProps {
  cellSize?: number;

  gap?: number;

  minColumns?: number;

  items?: GridItem[];

  showGrid?: boolean;

  snapToGrid?: boolean;

  components?: ComponentToRegister[];
}

export interface DragState {
  item: GridItem | null;

  fromGrid: boolean;

  hoverPosition: GridPosition | null;

  isValid: boolean;
}

export class GridUtils {
  static pixelToGrid(
    pixelX: number,
    pixelY: number,
    cellSize: number,
    gap: number,
  ): GridPosition {
    const x = Math.floor(pixelX / (cellSize + gap));
    const y = Math.floor(pixelY / (cellSize + gap));
    return { x, y };
  }

  static gridToPixel(
    gridX: number,
    gridY: number,
    cellSize: number,
    gap: number,
  ): { x: number; y: number } {
    const x = gridX * (cellSize + gap);
    const y = gridY * (cellSize + gap);
    return { x, y };
  }

  static doItemsOverlap(item1: GridItem, item2: GridItem): boolean {
    return !(
      item1.x + item1.width <= item2.x ||
      item2.x + item2.width <= item1.x ||
      item1.y + item1.height <= item2.y ||
      item2.y + item2.height <= item1.y
    );
  }

  static calculateArea(item: GridItem): number {
    return item.width * item.height;
  }

  static generateId(prefix = "item"): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static cloneItemAtPosition(item: GridItem, x: number, y: number): GridItem {
    return {
      ...item,
      id: this.generateId(item.id.split("-")[0]),
      x,
      y,
    };
  }

  static isValidItem(item: Partial<GridItem>): boolean {
    return (
      typeof item.id === "string" &&
      typeof item.width === "number" &&
      typeof item.height === "number" &&
      item.width > 0 &&
      item.height > 0
    );
  }

  static sortItems(items: GridItem[]): GridItem[] {
    return [...items].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
  }

  static findOverlappingItems(
    items: GridItem[],
    x: number,
    y: number,
    width: number,
    height: number,
    excludeId?: string,
  ): GridItem[] {
    const testItem: GridItem = {
      id: "test",
      x,
      y,
      width,
      height,
    };

    return items.filter((item) => {
      if (excludeId && item.id === excludeId) return false;
      return this.doItemsOverlap(item, testItem);
    });
  }
}

export const ControlGridItemsKey: InjectionKey<Ref<GridItem[]>> =
  Symbol("ControlGridItems");

export const ControlGridConfigKey: InjectionKey<Ref<GridConfig>> =
  Symbol("ControlGridConfig");

export const ControlGridHoverKey: InjectionKey<Ref<GridPosition | null>> =
  Symbol("ControlGridHover");

export const ControlGridDragStateKey: InjectionKey<Ref<DragState>> = Symbol(
  "ControlGridDragState",
);

export const ControlGridComponentRegistryKey: InjectionKey<
  Ref<Map<string, Component>>
> = Symbol("ControlGridComponentRegistry");

export const ControlGridAddItemKey: InjectionKey<GridMethods["addItem"]> =
  Symbol("ControlGridAddItem");

export const ControlGridAddItemByComponentKey: InjectionKey<
  GridMethods["addItemByComponent"]
> = Symbol("ControlGridAddItemByComponent");

export const ControlGridRemoveItemKey: InjectionKey<GridMethods["removeItem"]> =
  Symbol("ControlGridRemoveItem");

export const ControlGridClearGridKey: InjectionKey<GridMethods["clearGrid"]> =
  Symbol("ControlGridClearGrid");

export const ControlGridGetComponentKey: InjectionKey<
  GridMethods["getComponent"]
> = Symbol("ControlGridGetComponent");

export const ControlGridGetRegisteredComponentsKey: InjectionKey<
  GridMethods["getRegisteredComponents"]
> = Symbol("ControlGridGetRegisteredComponents");
```

```vue [src/components/ui/control-grid/ControlGrid.vue]
<script setup lang="ts">
import {
  provide,
  watch,
  onMounted,
  computed,
  ref,
  nextTick,
  type Ref,
} from "vue";
import {
  useElementSize,
  useElementBounding,
  useMouse,
  useEventListener,
} from "@vueuse/core";
import { useMotion } from "@vueuse/motion";
import {
  useDragDrop,
  DragDropUtils,
  type DragDropItem,
} from "../../composables/use-drag-drop/useDragDrop";
import {
  ControlGridItemsKey,
  ControlGridConfigKey,
  ControlGridHoverKey,
  ControlGridDragStateKey,
  ControlGridComponentRegistryKey,
  ControlGridAddItemKey,
  ControlGridAddItemByComponentKey,
  ControlGridRemoveItemKey,
  ControlGridClearGridKey,
  ControlGridGetComponentKey,
  ControlGridGetRegisteredComponentsKey,
  type GridItem,
  type GridConfig,
  type GridPosition,
  type DragState,
  type ComponentToRegister,
  GridUtils,
} from ".";

const isClient = typeof window !== "undefined";

export interface ControlGridProps {
  cellSize?: number;

  gap?: number;

  minColumns?: number;

  items?: GridItem[];

  showGrid?: boolean;

  snapToGrid?: boolean;

  components?: ComponentToRegister[];
}

const props = withDefaults(defineProps<ControlGridProps>(), {
  cellSize: 80,
  gap: 8,
  minColumns: 4,
  items: () => [],
  showGrid: true,
  snapToGrid: true,
  components: () => [],
});

const emit = defineEmits<{
  "update:items": [items: GridItem[]];
  "item-placed": [item: GridItem];
  "item-moved": [item: GridItem];
  "item-removed": [id: string];
  "config-changed": [config: GridConfig];
}>();

const gridContainer = ref<HTMLElement | null>(null);
const placedItems = ref<GridItem[]>([...props.items]);
const hoverCell = ref<GridPosition | null>(null);
const previewSize = ref<{ width: number; height: number } | null>(null);

const itemRefs = ref<Map<string, HTMLElement>>(new Map());

const componentRegistry = ref<Map<string, any>>(new Map());

const { width: gridWidth, height: gridHeight } = useElementSize(gridContainer);
const gridBounds = useElementBounding(gridContainer);
const { x: mouseX, y: mouseY } = useMouse();

const {
  dragState: internalDragState,
  dragOffset,
  startDrag,
  handleDragOver: handleDragOverComposable,
  endDrag,
  getVirtualBounds,
  getItemFromDataTransfer,
} = useDragDrop<any>({
  unitSize: props.cellSize,
  gap: props.gap,
  validatePlacement: (x, y, width, height, excludeId) => {
    return isValidPlacement(x, y, width, height, excludeId);
  },
});

const dragState = ref<DragState>({
  item: null,
  fromGrid: false,
  hoverPosition: null,
  isValid: false,
});

watch(
  internalDragState,
  (newState) => {
    dragState.value = {
      item: newState.item as GridItem | null,
      fromGrid: newState.fromContainer,
      hoverPosition: newState.hoverPosition,
      isValid: newState.isValid,
    };
  },
  { deep: true },
);

const previewRef = ref<HTMLElement | null>(null);

const itemVariants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  placed: {
    scale: [0.95, 1.05, 1],
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 400,
    },
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
  },
  dragging: {
    scale: 1.05,
    opacity: 0.7,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  },
};

const previewVariants = {
  initial: {
    scale: 0.9,
    opacity: 0,
  },
  enter: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      duration: 150,
    },
  },
  invalid: {
    scale: [1, 0.95, 1],
    borderColor: [
      "rgba(239, 68, 68, 0.5)",
      "rgba(239, 68, 68, 0.8)",
      "rgba(239, 68, 68, 0.5)",
    ],
    transition: {
      repeat: Infinity,
      duration: 1000,
    },
  },
};

const gridConfig = computed<GridConfig>(() => {
  const cols = Math.floor(gridWidth.value / (props.cellSize + props.gap));
  const calculatedColumns = Math.max(cols, props.minColumns);
  const calculatedRows = Math.max(
    Math.floor(gridHeight.value / (props.cellSize + props.gap)),
    6,
  );

  return {
    cellSize: props.cellSize,
    gap: props.gap,
    columns: calculatedColumns,
    rows: calculatedRows,
    width: gridWidth.value,
    height: gridHeight.value,
  };
});

const columns = computed(() => gridConfig.value.columns);
const rows = computed(() => gridConfig.value.rows);

const gridTemplateColumns = computed(() => {
  return `repeat(${columns.value}, ${props.cellSize}px)`;
});

const gridTemplateRows = computed(() => {
  return `repeat(${rows.value}, ${props.cellSize}px)`;
});

const isCellOccupied = (x: number, y: number, excludeId?: string): boolean => {
  return placedItems.value.some((item) => {
    if (excludeId && item.id === excludeId) return false;
    return (
      x >= item.x &&
      x < item.x + item.width &&
      y >= item.y &&
      y < item.y + item.height
    );
  });
};

const isValidPlacement = (
  x: number,
  y: number,
  width: number,
  height: number,
  excludeId?: string,
): boolean => {
  if (x < 0 || y < 0 || x + width > columns.value || y + height > rows.value) {
    return false;
  }

  for (let dx = 0; dx < width; dx++) {
    for (let dy = 0; dy < height; dy++) {
      if (isCellOccupied(x + dx, y + dy, excludeId)) {
        return false;
      }
    }
  }

  return true;
};

const findAvailablePosition = (
  width: number,
  height: number,
): { x: number; y: number } | null => {
  for (let y = 0; y <= rows.value - height; y++) {
    for (let x = 0; x <= columns.value - width; x++) {
      if (isValidPlacement(x, y, width, height)) {
        return { x, y };
      }
    }
  }
  return null;
};

const getGridPositionByIntersection = (elementBounds: {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}): { x: number; y: number } | null => {
  if (!gridContainer.value) return null;

  let maxIntersectionArea = 0;
  let bestPosition = { x: 0, y: 0 };

  const startX = Math.max(
    0,
    Math.floor(
      (elementBounds.left - gridBounds.left.value - props.gap) /
        (props.cellSize + props.gap),
    ),
  );
  const endX = Math.min(
    columns.value - 1,
    Math.ceil(
      (elementBounds.right - gridBounds.left.value - props.gap) /
        (props.cellSize + props.gap),
    ),
  );
  const startY = Math.max(
    0,
    Math.floor(
      (elementBounds.top - gridBounds.top.value - props.gap) /
        (props.cellSize + props.gap),
    ),
  );
  const endY = Math.min(
    rows.value - 1,
    Math.ceil(
      (elementBounds.bottom - gridBounds.top.value - props.gap) /
        (props.cellSize + props.gap),
    ),
  );

  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      const cellLeft =
        gridBounds.left.value + props.gap + x * (props.cellSize + props.gap);
      const cellTop =
        gridBounds.top.value + props.gap + y * (props.cellSize + props.gap);
      const cellRight = cellLeft + props.cellSize;
      const cellBottom = cellTop + props.cellSize;

      const intersectionLeft = Math.max(elementBounds.left, cellLeft);
      const intersectionTop = Math.max(elementBounds.top, cellTop);
      const intersectionRight = Math.min(elementBounds.right, cellRight);
      const intersectionBottom = Math.min(elementBounds.bottom, cellBottom);

      const intersectionWidth = Math.max(
        0,
        intersectionRight - intersectionLeft,
      );
      const intersectionHeight = Math.max(
        0,
        intersectionBottom - intersectionTop,
      );
      const intersectionArea = intersectionWidth * intersectionHeight;

      if (intersectionArea > maxIntersectionArea) {
        maxIntersectionArea = intersectionArea;
        bestPosition = { x, y };
      }
    }
  }

  return maxIntersectionArea > 0 ? bestPosition : null;
};

const getGridPosition = (
  clientX: number,
  clientY: number,
): { x: number; y: number } => {
  if (!gridContainer.value) return { x: 0, y: 0 };

  const relativeX = clientX - gridBounds.left.value - props.gap;
  const relativeY = clientY - gridBounds.top.value - props.gap;

  const x = Math.floor(relativeX / (props.cellSize + props.gap));
  const y = Math.floor(relativeY / (props.cellSize + props.gap));

  return {
    x: Math.max(0, Math.min(x, columns.value - 1)),
    y: Math.max(0, Math.min(y, rows.value - 1)),
  };
};

const addItem = (item: Omit<GridItem, "x" | "y">): GridItem | null => {
  const position = findAvailablePosition(item.width, item.height);
  if (position) {
    const newItem: GridItem = { ...item, ...position } as GridItem;
    placedItems.value.push(newItem);

    if (isClient) {
      nextTick(() => {
        const el = itemRefs.value.get(newItem.id);
        if (el) {
          const motion = useMotion(el, itemVariants);
          motion.apply("placed");
        }
      });
    }

    emit("item-placed", newItem);
    emit("update:items", placedItems.value);
    return newItem;
  }
  return null;
};

const addItemByComponent = (
  componentName: string,
  width: number = 1,
  height: number = 1,
  additionalProps?: Record<string, any>,
): GridItem | null => {
  const component = getComponent(componentName);
  if (!component) {
    console.warn(`Composant "${componentName}" non trouvé dans le registre`);
    return null;
  }

  const position = findAvailablePosition(width, height);
  if (position) {
    const newItem: GridItem = {
      id: `${componentName}-${Date.now()}`,
      x: position.x,
      y: position.y,
      width,
      height,
      component,
      ...additionalProps,
    };
    placedItems.value.push(newItem);
    emit("item-placed", newItem);
    emit("update:items", placedItems.value);
    return newItem;
  }
  return null;
};

const removeItem = (id: string): void => {
  const index = placedItems.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    placedItems.value.splice(index, 1);
    emit("item-removed", id);
    emit("update:items", placedItems.value);
  }
};

const clearGrid = (): void => {
  placedItems.value = [];
  emit("update:items", []);
};

const getComponent = (name: string): any | undefined => {
  return componentRegistry.value.get(name);
};

const getRegisteredComponents = (): string[] => {
  return Array.from(componentRegistry.value.keys());
};

const handleDragStart = (
  event: DragEvent,
  item: GridItem,
  fromGrid = false,
) => {
  previewSize.value = { width: item.width, height: item.height };
  startDrag(event, item, fromGrid);
};

const handleDragOver = (event: DragEvent) => {
  const containerBounds = {
    left: gridBounds.left.value,
    top: gridBounds.top.value,
    right: gridBounds.right.value,
    bottom: gridBounds.bottom.value,
    width: gridBounds.width.value,
    height: gridBounds.height.value,
  };

  const pos = handleDragOverComposable(
    event,
    containerBounds,
    (virtualBounds) => {
      return DragDropUtils.getPositionByIntersection(
        virtualBounds,
        containerBounds,
        props.cellSize,
        props.gap,
        columns.value,
        rows.value,
      );
    },
  );

  hoverCell.value = pos;

  if (!dragState.value.item && event.dataTransfer) {
    const types = event.dataTransfer.types;
    if (types.includes("application/json")) {
      previewSize.value = { width: 1, height: 1 };
    }
  }
};

const handleDragLeave = (event: DragEvent) => {
  if (!dragState.value) return;

  const relatedTarget = event.relatedTarget as HTMLElement | null;
  if (!relatedTarget || !gridContainer.value?.contains(relatedTarget)) {
    hoverCell.value = null;
    dragState.value.hoverPosition = null;
  }
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    const effect = event.dataTransfer.effectAllowed;
    if (effect === "copy" || effect === "copyMove") {
      event.dataTransfer.dropEffect = "copy";
    } else {
      event.dataTransfer.dropEffect = "move";
    }
  }
};

const handleDragEnd = () => {
  hoverCell.value = null;
  previewSize.value = null;
  endDrag();
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();

  if (!dragState.value) {
    console.warn("dragState is not initialized");
    return;
  }

  let itemToDrop: GridItem | null = dragState.value.item ?? null;

  if (!itemToDrop && event.dataTransfer) {
    try {
      const data = event.dataTransfer.getData("application/json");
      if (data) {
        itemToDrop = JSON.parse(data);
        if (itemToDrop) {
          previewSize.value = {
            width: itemToDrop.width,
            height: itemToDrop.height,
          };
        }
      }
    } catch (e) {
      console.error("Erreur lors du parsing des données de drag:", e);
      handleDragEnd();
      return;
    }
  }

  if (!itemToDrop || !hoverCell.value) {
    handleDragEnd();
    return;
  }

  const excludeId = dragState.value?.fromGrid ? itemToDrop.id : undefined;
  if (
    !isValidPlacement(
      hoverCell.value.x,
      hoverCell.value.y,
      itemToDrop.width,
      itemToDrop.height,
      excludeId,
    )
  ) {
    console.warn("Placement invalide");
    handleDragEnd();
    return;
  }

  const newItem: GridItem = {
    ...itemToDrop,
    x: hoverCell.value.x,
    y: hoverCell.value.y,
  };

  if (dragState.value?.fromGrid) {
    const index = placedItems.value.findIndex((item) => item.id === newItem.id);
    if (index !== -1) {
      placedItems.value[index] = newItem;

      if (isClient) {
        nextTick(() => {
          const el = itemRefs.value.get(newItem.id);
          if (el) {
            const motion = useMotion(el, itemVariants);
            motion.apply("placed");
          }
        });
      }

      emit("item-moved", newItem);
    }
  } else {
    placedItems.value.push(newItem);

    if (isClient) {
      nextTick(() => {
        const el = itemRefs.value.get(newItem.id);
        if (el) {
          const motion = useMotion(el, itemVariants);
          motion.apply("placed");
        }
      });
    }

    emit("item-placed", newItem);
  }

  emit("update:items", placedItems.value);
  handleDragEnd();
};

provide<Ref<GridItem[]>>(ControlGridItemsKey, placedItems);

provide<Ref<GridConfig>>(ControlGridConfigKey, gridConfig);

provide<Ref<GridPosition | null>>(ControlGridHoverKey, hoverCell);

provide<Ref<DragState>>(ControlGridDragStateKey, dragState);

provide<Ref<Map<string, any>>>(
  ControlGridComponentRegistryKey,
  componentRegistry,
);

provide(ControlGridAddItemKey, addItem);
provide(ControlGridAddItemByComponentKey, addItemByComponent);
provide(ControlGridRemoveItemKey, removeItem);
provide(ControlGridClearGridKey, clearGrid);
provide(ControlGridGetComponentKey, getComponent);
provide(ControlGridGetRegisteredComponentsKey, getRegisteredComponents);

watch(
  () => props.items,
  (newItems) => {
    placedItems.value = [...newItems];
  },
  { deep: true },
);

watch(
  () => props.components,
  (newComponents) => {
    componentRegistry.value.clear();
    newComponents.forEach(({ name, component }) => {
      componentRegistry.value.set(name, component);
    });
  },
  { deep: true, immediate: true },
);

watch(
  gridConfig,
  (newConfig) => {
    emit("config-changed", newConfig);
  },
  { deep: true },
);

onMounted(() => {
  props.components.forEach(({ name, component }) => {
    componentRegistry.value.set(name, component);
  });
});

defineExpose({
  addItem,
  addItemByComponent,
  removeItem,
  clearGrid,
  getComponent,
  getRegisteredComponents,
  isCellOccupied,
  isValidPlacement,
  findAvailablePosition,
});
</script>

<template>
  <div class="controls-grid-container flex gap-4 w-full h-full">
    <slot
      name="toolbar"
      :columns="columns"
      :rows="rows"
      :placed-items="placedItems"
      :component-registry="componentRegistry"
      :get-component="getComponent"
      :get-registered-components="getRegisteredComponents"
      :add-item="addItem"
      :add-item-by-component="addItemByComponent"
      :remove-item="removeItem"
      :clear-grid="clearGrid"
      :config="gridConfig"
      :hover-position="hoverCell"
      :drag-state="dragState"
    />

    <div
      ref="gridContainer"
      class="relative w-full h-full min-h-[400px] overflow-auto bg-transparent border border-border rounded flex-1"
      :style="{
        '--cell-size': `${cellSize}px`,
        '--gap-size': `${gap}px`,
      }"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div
        class="relative grid z-1"
        :style="{
          gridTemplateColumns,
          gridTemplateRows,
          gap: `${gap}px`,
          padding: `${gap}px`,
        }"
      >
        <div
          v-if="hoverCell && (dragState.item || previewSize)"
          ref="previewRef"
          :class="[
            'rounded-lg pointer-events-none transition-all duration-200',
            dragState.isValid
              ? 'bg-primary/10 border-2 border-dashed border-primary animate-fade-in'
              : 'bg-destructive/10 border-2 border-dashed border-destructive animate-pulse',
          ]"
          :style="{
            gridColumn: `${hoverCell.x + 1} / span ${dragState.item?.width || previewSize?.width || 1}`,
            gridRow: `${hoverCell.y + 1} / span ${dragState.item?.height || previewSize?.height || 1}`,
          }"
        />

        <div
          v-for="item in placedItems"
          :key="item.id"
          :ref="(el) => el && itemRefs.set(item.id, el as HTMLElement)"
          class="grid-item-wrapper relative cursor-move select-none transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg active:cursor-grabbing active:scale-105 active:opacity-70"
          :draggable="true"
          :style="{
            gridColumn: `${item.x + 1} / span ${item.width}`,
            gridRow: `${item.y + 1} / span ${item.height}`,
          }"
          @dragstart.stop="handleDragStart($event, item, true)"
          @dragend.stop="handleDragEnd"
        >
          <div
            class="relative w-full h-full bg-card/50 border border-border rounded overflow-hidden flex flex-col"
            draggable="false"
          >
            <button
              class="grid-item-remove absolute top-1 right-1 z-10 flex items-center justify-center w-6 h-6 bg-destructive text-destructive-foreground border-none rounded cursor-pointer opacity-0 transition-all duration-200 scale-75 hover:bg-destructive/90 hover:scale-110 active:scale-95"
              @click.stop="removeItem(item.id)"
              aria-label="Supprimer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div
              class="flex-1 p-2 flex items-center justify-center overflow-hidden"
            >
              <component
                v-if="item.component"
                :is="item.component"
                v-bind="item"
              />
              <div
                v-else
                class="flex flex-col items-center justify-center gap-2 w-full h-full text-muted-foreground"
              >
                <span class="text-sm">{{ item.id }}</span>
                <span class="text-xs">
                  {{ item.width }}x{{ item.height }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <slot
        :columns="columns"
        :rows="rows"
        :placed-items="placedItems"
        :add-item="addItem"
        :add-item-by-component="addItemByComponent"
        :remove-item="removeItem"
        :clear-grid="clearGrid"
        :get-component="getComponent"
        :get-registered-components="getRegisteredComponents"
        :config="gridConfig"
        :hover-position="hoverCell"
        :drag-state="dragState"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 200ms ease-out;
}

.grid-item-wrapper:active {
  cursor: grabbing;
}

.grid-item-wrapper:hover .grid-item-remove {
  opacity: 1 !important;
  transform: scale(1) !important;
}
</style>
```

```vue [src/components/ui/control-grid/ControlGrid.old.vue]
<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  type Component,
} from "vue";
import { useElementSize, useDropZone } from "@vueuse/core";
import { useMotion } from "@vueuse/motion";

interface GridItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  component?: any;
  color?: string;
}

interface ComponentToRegister {
  name: string;
  component: Component;
}

interface Props {
  cellSize?: number;
  gap?: number;
  minColumns?: number;
  items?: GridItem[];
  showGrid?: boolean;
  snapToGrid?: boolean;
  components?: ComponentToRegister[];
}

const props = withDefaults(defineProps<Props>(), {
  cellSize: 80,
  gap: 8,
  minColumns: 4,
  items: () => [],
  showGrid: true,
  snapToGrid: true,
  components: () => [],
});

const emit = defineEmits<{
  "update:items": [items: GridItem[]];
  "item-placed": [item: GridItem];
  "item-moved": [item: GridItem];
  "item-removed": [id: string];
}>();

const gridContainer = ref<HTMLElement | null>(null);
const placedItems = ref<GridItem[]>([...props.items]);
const hoverCell = ref<{ x: number; y: number } | null>(null);
const draggedItem = ref<GridItem | null>(null);
const draggedFromGrid = ref(false);
const previewSize = ref<{ width: number; height: number } | null>(null);

const componentRegistry = ref<Map<string, Component>>(new Map());

const { width: gridWidth, height: gridHeight } = useElementSize(gridContainer);

const columns = computed(() => {
  const cols = Math.floor(gridWidth.value / (props.cellSize + props.gap));
  return Math.max(cols, props.minColumns);
});

const rows = computed(() => {
  return Math.max(
    Math.floor(gridHeight.value / (props.cellSize + props.gap)),
    6,
  );
});

const gridTemplateColumns = computed(() => {
  return `repeat(${columns.value}, ${props.cellSize}px)`;
});

const gridTemplateRows = computed(() => {
  return `repeat(${rows.value}, ${props.cellSize}px)`;
});

const isCellOccupied = (x: number, y: number, excludeId?: string): boolean => {
  return placedItems.value.some((item) => {
    if (excludeId && item.id === excludeId) return false;
    return (
      x >= item.x &&
      x < item.x + item.width &&
      y >= item.y &&
      y < item.y + item.height
    );
  });
};

const isValidPlacement = (
  x: number,
  y: number,
  width: number,
  height: number,
  excludeId?: string,
): boolean => {
  if (x < 0 || y < 0 || x + width > columns.value || y + height > rows.value) {
    return false;
  }

  for (let dx = 0; dx < width; dx++) {
    for (let dy = 0; dy < height; dy++) {
      if (isCellOccupied(x + dx, y + dy, excludeId)) {
        return false;
      }
    }
  }

  return true;
};

const findAvailablePosition = (
  width: number,
  height: number,
): { x: number; y: number } | null => {
  for (let y = 0; y <= rows.value - height; y++) {
    for (let x = 0; x <= columns.value - width; x++) {
      if (isValidPlacement(x, y, width, height)) {
        return { x, y };
      }
    }
  }
  return null;
};

const updateGridSize = () => {
  if (gridContainer.value) {
    const rect = gridContainer.value.getBoundingClientRect();
    gridWidth.value = rect.width;
    gridHeight.value = rect.height;
  }
};

const getGridPosition = (
  clientX: number,
  clientY: number,
): { x: number; y: number } => {
  if (!gridContainer.value) return { x: 0, y: 0 };

  const rect = gridContainer.value.getBoundingClientRect();
  const relativeX = clientX - rect.left - props.gap;
  const relativeY = clientY - rect.top - props.gap;

  const x = Math.floor(relativeX / (props.cellSize + props.gap));
  const y = Math.floor(relativeY / (props.cellSize + props.gap));

  return {
    x: Math.max(0, Math.min(x, columns.value - 1)),
    y: Math.max(0, Math.min(y, rows.value - 1)),
  };
};

const handleDragStart = (
  event: DragEvent,
  item: GridItem,
  fromGrid = false,
) => {
  draggedItem.value = { ...item };
  draggedFromGrid.value = fromGrid;
  previewSize.value = { width: item.width, height: item.height };

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/json", JSON.stringify(item));
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();

  if (!draggedItem.value && event.dataTransfer) {
    const types = event.dataTransfer.types;
    if (types.includes("application/json")) {
      previewSize.value = { width: 1, height: 1 };
    }
  }

  if (event.dataTransfer) {
    const effect = event.dataTransfer.effectAllowed;
    if (effect === "copy" || effect === "copyMove") {
      event.dataTransfer.dropEffect = "copy";
    } else {
      event.dataTransfer.dropEffect = "move";
    }
  }

  const pos = getGridPosition(event.clientX, event.clientY);

  if (draggedItem.value) {
    const excludeId = draggedFromGrid.value ? draggedItem.value.id : undefined;

    if (
      isValidPlacement(
        pos.x,
        pos.y,
        draggedItem.value.width,
        draggedItem.value.height,
        excludeId,
      )
    ) {
      hoverCell.value = pos;
    } else {
      hoverCell.value = null;
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "none";
      }
    }
  } else if (previewSize.value) {
    hoverCell.value = pos;
  }
};

const handleDragLeave = (event: DragEvent) => {
  const relatedTarget = event.relatedTarget as HTMLElement | null;
  if (!relatedTarget || !gridContainer.value?.contains(relatedTarget)) {
    hoverCell.value = null;
  }
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();

  if (event.dataTransfer) {
    const effect = event.dataTransfer.effectAllowed;
    if (effect === "copy" || effect === "copyMove") {
      event.dataTransfer.dropEffect = "copy";
    } else {
      event.dataTransfer.dropEffect = "move";
    }
  }
};

const handleDragEnd = () => {
  draggedItem.value = null;
  hoverCell.value = null;
  draggedFromGrid.value = false;
  previewSize.value = null;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();

  let itemToDrop: GridItem | null = draggedItem.value;

  if (!itemToDrop && event.dataTransfer) {
    try {
      const data = event.dataTransfer.getData("application/json");
      if (data) {
        itemToDrop = JSON.parse(data);

        if (itemToDrop) {
          previewSize.value = {
            width: itemToDrop.width,
            height: itemToDrop.height,
          };
        }
      }
    } catch (e) {
      console.error("Erreur lors du parsing des données de drag:", e);
      draggedItem.value = null;
      hoverCell.value = null;
      draggedFromGrid.value = false;
      previewSize.value = null;
      return;
    }
  }

  if (!itemToDrop || !hoverCell.value) {
    draggedItem.value = null;
    hoverCell.value = null;
    draggedFromGrid.value = false;
    previewSize.value = null;
    return;
  }

  const excludeId = draggedFromGrid.value ? itemToDrop.id : undefined;
  if (
    !isValidPlacement(
      hoverCell.value.x,
      hoverCell.value.y,
      itemToDrop.width,
      itemToDrop.height,
      excludeId,
    )
  ) {
    console.warn("Placement invalide");
    draggedItem.value = null;
    hoverCell.value = null;
    draggedFromGrid.value = false;
    previewSize.value = null;
    return;
  }

  const newItem: GridItem = {
    ...itemToDrop,
    x: hoverCell.value.x,
    y: hoverCell.value.y,
  };

  if (draggedFromGrid.value) {
    const index = placedItems.value.findIndex((item) => item.id === newItem.id);
    if (index !== -1) {
      placedItems.value[index] = newItem;
      emit("item-moved", newItem);
    }
  } else {
    placedItems.value.push(newItem);
    emit("item-placed", newItem);
  }

  emit("update:items", placedItems.value);

  draggedItem.value = null;
  hoverCell.value = null;
  draggedFromGrid.value = false;
  previewSize.value = null;
};

const removeItem = (id: string) => {
  const index = placedItems.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    placedItems.value.splice(index, 1);
    emit("item-removed", id);
    emit("update:items", placedItems.value);
  }
};

const getComponent = (name: string): Component | undefined => {
  return componentRegistry.value.get(name);
};

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  props.components.forEach(({ name, component }) => {
    componentRegistry.value.set(name, component);
  });

  updateGridSize();

  if (gridContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      updateGridSize();
    });
    resizeObserver.observe(gridContainer.value);
  }
});

watch(
  () => props.components,
  (newComponents) => {
    componentRegistry.value.clear();
    newComponents.forEach(({ name, component }) => {
      componentRegistry.value.set(name, component);
    });
  },
  { deep: true },
);

onUnmounted(() => {
  if (resizeObserver && gridContainer.value) {
    resizeObserver.unobserve(gridContainer.value);
  }
});

defineExpose({
  addItem: (item: Omit<GridItem, "x" | "y">) => {
    const position = findAvailablePosition(item.width, item.height);
    if (position) {
      const newItem: GridItem = { ...item, ...position } as GridItem;
      placedItems.value.push(newItem);
      emit("item-placed", newItem);
      emit("update:items", placedItems.value);
      return newItem;
    }
    return null;
  },
  addItemByComponent: (
    componentName: string,
    width: number = 1,
    height: number = 1,
    additionalProps?: Record<string, any>,
  ) => {
    const component = getComponent(componentName);
    if (!component) {
      console.warn(`Composant "${componentName}" non trouvé dans le registre`);
      return null;
    }

    const position = findAvailablePosition(width, height);
    if (position) {
      const newItem: GridItem = {
        id: `${componentName}-${Date.now()}`,
        x: position.x,
        y: position.y,
        width,
        height,
        component,
        ...additionalProps,
      };
      placedItems.value.push(newItem);
      emit("item-placed", newItem);
      emit("update:items", placedItems.value);
      return newItem;
    }
    return null;
  },
  removeItem,
  clearGrid: () => {
    placedItems.value = [];
    emit("update:items", []);
  },
  getComponent,
  getRegisteredComponents: () => Array.from(componentRegistry.value.keys()),
});
</script>

<template>
  <div class="controls-grid-container flex gap-4 w-full h-full">
    <slot
      name="toolbar"
      :columns="columns"
      :rows="rows"
      :placed-items="placedItems"
      :component-registry="componentRegistry"
      :get-component="getComponent"
      :get-registered-components="() => Array.from(componentRegistry.keys())"
    />

    <div
      ref="gridContainer"
      class="relative w-full h-full min-h-[400px] overflow-auto bg-transparent border border-border rounded flex-1"
      :style="{
        '--cell-size': `${cellSize}px`,
        '--gap-size': `${gap}px`,
      }"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div
        class="relative grid z-1"
        :style="{
          gridTemplateColumns,
          gridTemplateRows,
          gap: `${gap}px`,
          padding: `${gap}px`,
        }"
      >
        <div
          v-if="hoverCell && (draggedItem || previewSize)"
          class="bg-primary/10 border-2 border-dashed border-primary rounded-lg pointer-events-none animate-pulse-subtle"
          v-motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :enter="{ opacity: 1, scale: 1, transition: { duration: 150 } }"
          :style="{
            gridColumn: `${hoverCell.x + 1} / span ${draggedItem?.width || previewSize?.width || 1}`,
            gridRow: `${hoverCell.y + 1} / span ${draggedItem?.height || previewSize?.height || 1}`,
          }"
        />

        <div
          v-for="item in placedItems"
          :key="item.id"
          class="grid-item-wrapper relative cursor-move select-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:cursor-grabbing active:opacity-70"
          :draggable="true"
          :style="{
            gridColumn: `${item.x + 1} / span ${item.width}`,
            gridRow: `${item.y + 1} / span ${item.height}`,
          }"
          v-motion
          :initial="{ opacity: 0, scale: 0.8 }"
          :enter="{
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 300, damping: 20 },
          }"
          @dragstart.stop="handleDragStart($event, item, true)"
          @dragend.stop="handleDragEnd"
        >
          <div
            class="relative w-full h-full bg-card/50 border border-border rounded overflow-hidden flex flex-col"
            draggable="false"
          >
            <button
              class="grid-item-remove absolute top-1 right-1 z-10 flex items-center justify-center w-6 h-6 bg-destructive text-destructive-foreground border-none rounded cursor-pointer opacity-0 transition-all duration-200 scale-75 hover:bg-destructive/90 hover:scale-110 active:scale-95"
              @click.stop="removeItem(item.id)"
              aria-label="Supprimer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div
              class="flex-1 p-2 flex items-center justify-center overflow-hidden"
            >
              <component
                v-if="item.component"
                :is="item.component"
                v-bind="item"
              />
              <div
                v-else
                class="flex flex-col items-center justify-center gap-2 w-full h-full text-muted-foreground"
              >
                <span class="text-sm">{{ item.id }}</span>
                <span class="text-xs">
                  {{ item.width }}x{{ item.height }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <slot :columns="columns" :rows="rows" :placed-items="placedItems" />
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse-subtle {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse-subtle {
  animation: pulse-subtle 1.5s ease-in-out infinite;
}

.grid-item-wrapper:hover .grid-item-remove {
  opacity: 1 !important;
  transform: scale(1) !important;
}
</style>
```

```vue [src/components/ui/control-grid/ControlGridItem.vue]
<script setup lang="ts">
import { inject, computed, type Ref } from "vue";
import {
  ControlGridItemsKey,
  ControlGridConfigKey,
  ControlGridHoverKey,
  ControlGridDragStateKey,
  ControlGridAddItemKey,
  ControlGridRemoveItemKey,
  ControlGridClearGridKey,
  type GridItem,
  type GridConfig,
  type GridPosition,
  type DragState,
} from ".";

const items = inject(ControlGridItemsKey) as Ref<GridItem[]> | undefined;
const config = inject(ControlGridConfigKey) as Ref<GridConfig> | undefined;
const hoverPosition = inject(ControlGridHoverKey) as
  | Ref<GridPosition | null>
  | undefined;
const dragState = inject(ControlGridDragStateKey) as Ref<DragState> | undefined;

const addItem = inject(ControlGridAddItemKey);
const removeItem = inject(ControlGridRemoveItemKey);
const clearGrid = inject(ControlGridClearGridKey);

const itemCount = computed(() => items?.value.length || 0);
const gridSize = computed(() => {
  if (!config?.value) return "N/A";
  return `${config.value.columns} × ${config.value.rows}`;
});

const handleAddItem = () => {
  if (addItem) {
    addItem({
      id: `item-${Date.now()}`,
      width: 1,
      height: 1,
    });
  }
};

const handleClearGrid = () => {
  if (clearGrid) {
    clearGrid();
  }
};
</script>

<template>
  <div class="controls-grid-child p-4 border border-border rounded-lg">
    <h3 class="text-lg font-semibold mb-4">Grid Info (via inject)</h3>

    <div class="space-y-2 text-sm">
      <div><span class="font-medium">Items:</span> {{ itemCount }}</div>
      <div><span class="font-medium">Grid Size:</span> {{ gridSize }}</div>
      <div v-if="hoverPosition">
        <span class="font-medium">Hover:</span>
        ({{ hoverPosition.x }}, {{ hoverPosition.y }})
      </div>
      <div v-if="dragState?.item">
        <span class="font-medium">Dragging:</span> {{ dragState.item.id }}
      </div>
    </div>

    <div class="flex gap-2 mt-4">
      <button
        @click="handleAddItem"
        class="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Add Item
      </button>
      <button
        @click="handleClearGrid"
        class="px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
      >
        Clear Grid
      </button>
    </div>
  </div>
</template>
```

```vue [src/components/ui/control-grid/ControlGridToolbar.vue]
<script setup lang="ts">
import { ref, computed } from "vue";
import {
  useControlRegistry,
  type ControlDefinition,
} from "../../composables/use-control-registry/useControlRegistry";

interface Props {
  category?: string;

  orientation?: "horizontal" | "vertical";

  itemSize?: number;

  gap?: number;

  showLabels?: boolean;

  labelSize?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  orientation: "horizontal",
  itemSize: 60,
  gap: 8,
  showLabels: true,
  labelSize: "sm",
});

const emit = defineEmits<{
  "control-selected": [control: ControlDefinition];
  "control-drag-start": [control: ControlDefinition, event: DragEvent];
}>();

const { getAllControls, getControlsByCategory } = useControlRegistry();

const controls = computed(() => {
  if (props.category) {
    return getControlsByCategory(props.category);
  }
  return getAllControls();
});

const groupedControls = computed(() => {
  if (props.category) {
    return { [props.category]: controls.value };
  }

  const groups: Record<string, ControlDefinition[]> = {};
  controls.value.forEach((control) => {
    const category = control.category || "Autres";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(control);
  });
  return groups;
});

const labelClasses = computed(() => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };
  return `${sizeClasses[props.labelSize]} font-medium truncate`;
});

const handleDragStart = (event: DragEvent, control: ControlDefinition) => {
  if (!event.dataTransfer) return;

  const dragData = {
    id: `${control.id}-${Date.now()}`,
    width: control.defaultSize?.width || 1,
    height: control.defaultSize?.height || 1,
    component: control.component,
    color: control.color,
    ...control.defaultProps,
  };

  event.dataTransfer.effectAllowed = "copy";
  event.dataTransfer.setData("application/json", JSON.stringify(dragData));

  emit("control-drag-start", control, event);
};

const handleControlClick = (control: ControlDefinition) => {
  emit("control-selected", control);
};
</script>

<template>
  <div
    class="controls-toolbar flex bg-card border border-border rounded-lg shadow-sm"
    :class="{
      'flex-col overflow-y-auto': orientation === 'vertical',
      'flex-row overflow-x-auto': orientation === 'horizontal',
    }"
    :style="{
      '--item-size': `${itemSize}px`,
      '--gap-size': `${gap}px`,
    }"
  >
    <div
      v-for="(categoryControls, categoryName) in groupedControls"
      :key="categoryName"
      class="controls-group"
      :class="{
        'flex flex-col': orientation === 'vertical',
        'flex flex-row': orientation === 'horizontal',
      }"
    >
      <div
        v-if="!category && Object.keys(groupedControls).length > 1"
        class="category-header px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50 sticky"
        :class="{
          'top-0': orientation === 'vertical',
          'left-0': orientation === 'horizontal',
        }"
      >
        {{ categoryName }}
      </div>

      <div
        class="controls-list flex"
        :class="{
          'flex-col': orientation === 'vertical',
          'flex-row': orientation === 'horizontal',
        }"
        :style="{ gap: `${gap}px`, padding: `${gap}px` }"
      >
        <div
          v-for="control in categoryControls"
          :key="control.id"
          class="control-item flex cursor-move select-none transition-all duration-200 hover:scale-105 active:cursor-grabbing active:opacity-70"
          :class="{
            'flex-col items-center': true,
            'min-w-(--item-size)': orientation === 'horizontal',
          }"
          :draggable="true"
          @dragstart="handleDragStart($event, control)"
          @click="handleControlClick(control)"
          :title="control.description || control.name"
        >
          <div
            class="control-preview relative flex items-center justify-center bg-background border-2 border-border rounded-lg overflow-hidden transition-all duration-200 hover:border-primary hover:shadow-md"
            :style="{
              width: `${itemSize}px`,
              height: `${itemSize}px`,
              backgroundColor: control.color ? `${control.color}20` : undefined,
              borderColor: control.color || undefined,
            }"
          >
            <div
              v-if="control.icon"
              class="control-icon text-2xl"
              :style="{ color: control.color }"
            >
              {{ control.icon }}
            </div>

            <div
              v-else
              class="control-component-preview w-full h-full flex items-center justify-center p-2 pointer-events-none"
            >
              <component
                v-if="control.component"
                :is="control.component"
                v-bind="{ ...control.defaultProps, disabled: true }"
                class="scale-75 opacity-80"
              />
            </div>

            <div
              class="absolute bottom-1 right-1 px-1.5 py-0.5 text-[10px] font-mono bg-background/90 border border-border rounded"
            >
              {{ control.defaultSize?.width || 1 }}×{{
                control.defaultSize?.height || 1
              }}
            </div>
          </div>

          <span
            v-if="showLabels"
            class="control-label mt-1 text-center max-w-full"
            :class="labelClasses"
            :style="{ maxWidth: `${itemSize}px` }"
          >
            {{ control.name }}
          </span>
        </div>
      </div>
    </div>

    <slot :controls="controls" />
  </div>
</template>

<style scoped>
.controls-toolbar {
  --item-size: 60px;
  --gap-size: 8px;
}

.controls-toolbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.controls-toolbar::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 4px;
}

.controls-toolbar::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 4px;
}

.controls-toolbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}

.control-item:hover .control-preview {
  transform: translateY(-2px);
}

.control-item:active .control-preview {
  transform: translateY(0);
}
</style>
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
