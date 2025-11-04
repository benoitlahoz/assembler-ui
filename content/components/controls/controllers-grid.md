---
title: ControllersGrid
description: ControllersGrid - Composant de grille drag-and-drop
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <simple-example />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import { ControllersGrid } from "..";

interface GridItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  component?: any;
  color?: string;
}

const grid = ref<InstanceType<typeof ControllersGrid> | null>(null);

const gridItems = ref<GridItem[]>([]);

const availableComponents = [
  { id: "btn-1", width: 1, height: 1, label: "Bouton 1x1", color: "#3b82f6" },
  { id: "btn-2", width: 2, height: 1, label: "Bouton 2x1", color: "#8b5cf6" },
  {
    id: "slider-1",
    width: 2,
    height: 1,
    label: "Slider 2x1",
    color: "#ec4899",
  },
  { id: "knob-1", width: 1, height: 1, label: "Knob 1x1", color: "#f59e0b" },
  { id: "meter-1", width: 1, height: 2, label: "Meter 1x2", color: "#10b981" },
  { id: "pad-1", width: 2, height: 2, label: "Pad 2x2", color: "#ef4444" },
];

let itemCounter = 0;

const createItemFromTemplate = (template: (typeof availableComponents)[0]) => {
  return {
    id: `${template.id}-${itemCounter++}`,
    width: template.width,
    height: template.height,
    component: null,
    label: template.label,
    color: template.color,
  };
};

const handlePaletteDragStart = (
  event: DragEvent,
  template: (typeof availableComponents)[0],
) => {
  const item = createItemFromTemplate(template);
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/json", JSON.stringify(item));
  }
};

const handleItemPlaced = (item: GridItem) => {
  console.log("Item placé:", item);
};

const handleItemMoved = (item: GridItem) => {
  console.log("Item déplacé:", item);
};

const handleItemRemoved = (id: string) => {
  console.log("Item supprimé:", id);
};

const clearGrid = () => {
  grid.value?.clearGrid();
};

const addRandomItem = () => {
  const template =
    availableComponents[Math.floor(Math.random() * availableComponents.length)];
  if (template) {
    const item = createItemFromTemplate(template);
    grid.value?.addItem(item);
  }
};

const exportConfig = () => {
  console.log(
    "Configuration actuelle:",
    JSON.stringify(gridItems.value, null, 2),
  );
  alert("Configuration exportée dans la console");
};
</script>

<template>
  <div class="example-container">
    <div class="example-header">
      <h2 class="text-2xl font-bold">Grille de Contrôleurs</h2>
      <div class="example-actions">
        <button class="btn btn-secondary" @click="addRandomItem">
          Ajouter aléatoire
        </button>
        <button class="btn btn-secondary" @click="exportConfig">
          Exporter config
        </button>
        <button class="btn btn-destructive" @click="clearGrid">
          Effacer tout
        </button>
      </div>
    </div>

    <div class="example-content">
      <aside class="components-palette">
        <h3 class="palette-title">Composants disponibles</h3>
        <p class="palette-subtitle">Glissez-déposez dans la grille</p>

        <div class="palette-items">
          <div
            v-for="component in availableComponents"
            :key="component.id"
            class="palette-item"
            :draggable="true"
            :style="{ backgroundColor: component.color }"
            @dragstart="handlePaletteDragStart($event, component)"
          >
            <span class="palette-item-label">{{ component.label }}</span>
            <span class="palette-item-size"
              >{{ component.width }}×{{ component.height }}</span
            >
          </div>
        </div>

        <div class="palette-info">
          <p class="text-xs text-muted-foreground">
            💡 Astuce : Vous pouvez aussi déplacer les items déjà placés dans la
            grille
          </p>
        </div>
      </aside>

      <div class="grid-wrapper">
        <ControllersGrid
          ref="grid"
          v-model:items="gridItems"
          :cell-size="100"
          :gap="12"
          :min-columns="6"
          :show-grid="true"
          @item-placed="handleItemPlaced"
          @item-moved="handleItemMoved"
          @item-removed="handleItemRemoved"
        >
          <template #default="{ columns, rows, placedItems }">
            <div class="grid-info">
              <span>Grille: {{ columns }}×{{ rows }}</span>
              <span>Items: {{ placedItems.length }}</span>
            </div>
          </template>
        </ControllersGrid>
      </div>
    </div>
  </div>
</template>

<style scoped>
.example-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  min-height: 100vh;
  background-color: hsl(var(--background));
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.example-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.example-content {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 1.5rem;
  height: calc(100vh - 200px);
}

.components-palette {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  overflow-y: auto;
}

.palette-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.palette-subtitle {
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  margin-top: -0.5rem;
}

.palette-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.palette-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 1rem;
  border-radius: 8px;
  cursor: grab;
  user-select: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  color: white;
  text-align: center;
}

.palette-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.palette-item:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.palette-item-label {
  font-weight: 500;
  font-size: 0.875rem;
}

.palette-item-size {
  font-size: 0.75rem;
  opacity: 0.9;
}

.palette-info {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid hsl(var(--border));
}

.grid-wrapper {
  position: relative;
  min-height: 500px;
}

.grid-info {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  z-index: 10;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background-color: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border-color: hsl(var(--border));
}

.btn-secondary:hover {
  background-color: hsl(var(--secondary) / 0.8);
}

.btn-destructive {
  background-color: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}

.btn-destructive:hover {
  background-color: hsl(var(--destructive) / 0.9);
}

@media (max-width: 768px) {
  .example-content {
    grid-template-columns: 1fr;
    height: auto;
  }

  .components-palette {
    max-height: 300px;
  }

  .grid-wrapper {
    min-height: 400px;
  }
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
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/controllers-grid.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/controllers-grid.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/controllers-grid.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/controllers-grid.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/controllers-grid/index.ts"}

```ts [src/components/ui/controllers-grid/index.ts]
export { default as ControllersGrid } from "./ControllersGrid.vue";

export {
  useControllersGrid,
  useComponentPalette,
  useGridConfig,
} from "./composables";

export {
  GridUtils,
  type GridItem,
  type GridPosition,
  type GridDimensions,
  type GridConfig,
  type GridItemTemplate,
  type GridEvents,
  type GridMethods,
  type GridProps,
  type DragState,
} from "./types";
```

```vue [src/components/ui/controllers-grid/ControllersGrid.vue]
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
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

interface Props {
  cellSize?: number;
  gap?: number;
  minColumns?: number;
  items?: GridItem[];
  showGrid?: boolean;
  snapToGrid?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  cellSize: 80,
  gap: 8,
  minColumns: 4,
  items: () => [],
  showGrid: true,
  snapToGrid: true,
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

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  updateGridSize();

  if (gridContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      updateGridSize();
    });
    resizeObserver.observe(gridContainer.value);
  }
});

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
  removeItem,
  clearGrid: () => {
    placedItems.value = [];
    emit("update:items", []);
  },
});
</script>

<template>
  <div
    ref="gridContainer"
    class="relative w-full h-full min-h-[400px] overflow-auto bg-transparent border border-border rounded"
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
              <span class="text-xs"> {{ item.width }}x{{ item.height }} </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <slot :columns="columns" :rows="rows" :placed-items="placedItems" />
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

```ts [src/components/ui/controllers-grid/composables.ts]
import { ref, computed, type Ref } from "vue";
import type { GridItem, GridItemTemplate, GridConfig } from "./types";
import { GridUtils } from "./types";

export function useControllersGrid(initialItems: GridItem[] = []) {
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

  const saveToLocalStorage = (key = "controllers-grid-config") => {
    try {
      localStorage.setItem(key, JSON.stringify(exportConfig()));
      return true;
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      return false;
    }
  };

  const loadFromLocalStorage = (key = "controllers-grid-config") => {
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

```ts [src/components/ui/controllers-grid/types.ts]
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

  removeItem: (id: string) => void;

  clearGrid: () => void;

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
```
:::

## ControllersGrid
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `cellSize`{.primary .text-primary} | `number` | 80 |  |
| `gap`{.primary .text-primary} | `number` | 8 |  |
| `minColumns`{.primary .text-primary} | `number` | 4 |  |
| `items`{.primary .text-primary} | `GridItem[]` |  |  |
| `showGrid`{.primary .text-primary} | `boolean` | true |  |
| `snapToGrid`{.primary .text-primary} | `boolean` | true |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | Slot pour le contenu additionnel ou des actions |

  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `addItem`{.primary .text-primary} | `(item: Omit<GridItem, 'x' \| 'y'>) => any` | — |
| `removeItem`{.primary .text-primary} | `(id: string) => void` | — |
| `clearGrid`{.primary .text-primary} | `() => void` | — |

---

  ## Examples
  ::hr-underline
  ::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <advanced-example />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref, watch } from "vue";
import { ControllersGrid } from "..";
import { useControllersGrid, useComponentPalette } from "../composables";
import type { GridItemTemplate } from "../types";

const templates: GridItemTemplate[] = [
  {
    id: "button",
    width: 1,
    height: 1,
    label: "🎛️ Button",
    color: "#3b82f6",
  },
  {
    id: "fader",
    width: 1,
    height: 2,
    label: "🎚️ Fader",
    color: "#8b5cf6",
  },
  {
    id: "knob",
    width: 1,
    height: 1,
    label: "🎛️ Knob",
    color: "#ec4899",
  },
  {
    id: "slider",
    width: 2,
    height: 1,
    label: "⬌ Slider",
    color: "#f59e0b",
  },
  {
    id: "xy-pad",
    width: 2,
    height: 2,
    label: "⊞ XY Pad",
    color: "#ef4444",
  },
  {
    id: "meter",
    width: 1,
    height: 2,
    label: "📊 Meter",
    color: "#10b981",
  },
  {
    id: "display",
    width: 2,
    height: 1,
    label: "📺 Display",
    color: "#06b6d4",
  },
  {
    id: "keyboard",
    width: 4,
    height: 2,
    label: "🎹 Keyboard",
    color: "#6366f1",
  },
];

const grid = ref<InstanceType<typeof ControllersGrid> | null>(null);
const {
  items,
  canUndo,
  canRedo,
  totalArea,
  undo,
  redo,
  clearItems,
  duplicateItem,
  selectItem,
  selectedItemId,
  saveToLocalStorage,
  loadFromLocalStorage,
} = useControllersGrid();
const { availableTemplates, createItemFromTemplate } =
  useComponentPalette(templates);

const showGrid = ref(true);
const cellSize = ref(100);
const gap = ref(12);
const autoSave = ref(false);

const handlePaletteDragStart = (
  event: DragEvent,
  template: GridItemTemplate,
) => {
  const item = createItemFromTemplate(template);
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/json", JSON.stringify(item));
  }
};

const handleItemPlaced = (item: any) => {
  console.log("Item placé:", item);
  if (autoSave.value) {
    saveToLocalStorage();
  }
};

const handleItemMoved = (item: any) => {
  console.log("Item déplacé:", item);
  if (autoSave.value) {
    saveToLocalStorage();
  }
};

const handleItemRemoved = (id: string) => {
  console.log("Item supprimé:", id);
  if (autoSave.value) {
    saveToLocalStorage();
  }
};

const handleUndo = () => {
  undo();
};

const handleRedo = () => {
  redo();
};

const handleClear = () => {
  if (confirm("Êtes-vous sûr de vouloir effacer tous les items ?")) {
    clearItems();
  }
};

const handleDuplicate = () => {
  if (selectedItemId.value) {
    duplicateItem(selectedItemId.value);
  }
};

const handleSave = () => {
  saveToLocalStorage();
  alert("Configuration sauvegardée !");
};

const handleLoad = () => {
  if (loadFromLocalStorage()) {
    alert("Configuration chargée !");
  } else {
    alert("Aucune configuration trouvée");
  }
};

const handleExport = () => {
  const data = JSON.stringify(items.value, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `grid-config-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

watch(
  () => autoSave.value,
  (enabled) => {
    if (enabled) {
      saveToLocalStorage();
    }
  },
);

const handleKeyDown = (event: KeyboardEvent) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key === "z" &&
    !event.shiftKey
  ) {
    event.preventDefault();
    handleUndo();
  }

  if ((event.ctrlKey || event.metaKey) && event.key === "z" && event.shiftKey) {
    event.preventDefault();
    handleRedo();
  }

  if ((event.ctrlKey || event.metaKey) && event.key === "d") {
    event.preventDefault();
    handleDuplicate();
  }

  if (event.key === "Delete" && selectedItemId.value) {
    event.preventDefault();
    const itemToRemove = selectedItemId.value;
    selectItem(null);
    grid.value?.removeItem(itemToRemove);
  }
};

import { onMounted, onUnmounted } from "vue";

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);

  if (autoSave.value) {
    loadFromLocalStorage();
  }
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="advanced-example">
    <header class="example-header">
      <div class="header-left">
        <h1 class="text-3xl font-bold">Controllers Grid</h1>
        <p class="text-sm text-muted-foreground">
          Grille drag-and-drop avancée avec historique et persistance
        </p>
      </div>

      <div class="header-right">
        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">Items</span>
            <span class="stat-value">{{ items.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Cellules</span>
            <span class="stat-value">{{ totalArea }}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="toolbar">
      <div class="toolbar-group">
        <button
          class="toolbar-btn"
          :disabled="!canUndo"
          @click="handleUndo"
          title="Annuler (Ctrl+Z)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
          Annuler
        </button>

        <button
          class="toolbar-btn"
          :disabled="!canRedo"
          @click="handleRedo"
          title="Refaire (Ctrl+Shift+Z)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
          Refaire
        </button>

        <div class="toolbar-separator" />

        <button
          class="toolbar-btn"
          :disabled="!selectedItemId"
          @click="handleDuplicate"
          title="Dupliquer (Ctrl+D)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          Dupliquer
        </button>

        <button
          class="toolbar-btn toolbar-btn-destructive"
          @click="handleClear"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          Effacer
        </button>
      </div>

      <div class="toolbar-group">
        <button class="toolbar-btn" @click="handleSave">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Sauvegarder
        </button>

        <button class="toolbar-btn" @click="handleLoad">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          Charger
        </button>

        <button class="toolbar-btn" @click="handleExport">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          Exporter
        </button>
      </div>

      <div class="toolbar-group">
        <label class="toolbar-checkbox">
          <input v-model="showGrid" type="checkbox" />
          <span>Grille</span>
        </label>

        <label class="toolbar-checkbox">
          <input v-model="autoSave" type="checkbox" />
          <span>Auto-save</span>
        </label>

        <label class="toolbar-range">
          <span>Taille: {{ cellSize }}px</span>
          <input
            v-model.number="cellSize"
            type="range"
            min="60"
            max="150"
            step="10"
          />
        </label>

        <label class="toolbar-range">
          <span>Gap: {{ gap }}px</span>
          <input v-model.number="gap" type="range" min="4" max="24" step="4" />
        </label>
      </div>
    </div>

    <div class="example-content">
      <aside class="palette">
        <h3 class="palette-title">Composants</h3>

        <div class="palette-grid">
          <div
            v-for="template in availableTemplates"
            :key="template.id"
            class="palette-item"
            :draggable="true"
            :style="{ backgroundColor: template.color }"
            @dragstart="handlePaletteDragStart($event, template)"
          >
            <span class="palette-label">{{ template.label }}</span>
            <span class="palette-size"
              >{{ template.width }}×{{ template.height }}</span
            >
          </div>
        </div>

        <div class="palette-hint">
          <p class="text-xs">
            💡 <strong>Raccourcis :</strong><br />
            Ctrl+Z/Cmd+Z : Annuler<br />
            Ctrl+Shift+Z : Refaire<br />
            Ctrl+D/Cmd+D : Dupliquer<br />
            Delete : Supprimer
          </p>
        </div>
      </aside>

      <div class="grid-container">
        <ControllersGrid
          ref="grid"
          v-model:items="items"
          :cell-size="cellSize"
          :gap="gap"
          :min-columns="6"
          :show-grid="showGrid"
          @item-placed="handleItemPlaced"
          @item-moved="handleItemMoved"
          @item-removed="handleItemRemoved"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.advanced-example {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: hsl(var(--background));
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--foreground));
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 2rem;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover:not(:disabled) {
  background: hsl(var(--secondary) / 0.8);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn-destructive {
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}

.toolbar-btn-destructive:hover {
  background: hsl(var(--destructive) / 0.9);
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: hsl(var(--border));
  margin: 0 0.25rem;
}

.toolbar-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.toolbar-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.toolbar-range input[type="range"] {
  width: 100px;
}

.example-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  flex: 1;
  overflow: hidden;
}

.palette {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: hsl(var(--card));
  border-right: 1px solid hsl(var(--border));
  overflow-y: auto;
}

.palette-title {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.palette-grid {
  display: grid;
  gap: 0.75rem;
}

.palette-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 1rem;
  border-radius: 8px;
  color: white;
  cursor: grab;
  user-select: none;
  transition: all 0.2s;
  text-align: center;
}

.palette-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.palette-item:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.palette-label {
  font-weight: 500;
  font-size: 0.875rem;
}

.palette-size {
  font-size: 0.75rem;
  opacity: 0.9;
}

.palette-hint {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
}

.grid-container {
  position: relative;
  padding: 1.5rem;
  overflow: auto;
}

@media (max-width: 1024px) {
  .example-content {
    grid-template-columns: 1fr;
  }

  .palette {
    max-height: 300px;
  }
}
</style>
```
  :::
::

::tip
You can copy and adapt this template for any component documentation.
::