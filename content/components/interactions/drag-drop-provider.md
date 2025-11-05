---
title: DragDropProvider
description: DragDropProvider - Wrapper component pour fournir la configuration drag-drop aux composants enfants
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <basic-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import DragDropProvider from "../DragDropProvider.vue";

const sourceItems = ref([
  {
    id: "1",
    title: "Item 1",
    description: "Draggable item",
    width: 1,
    height: 1,
  },
  {
    id: "2",
    title: "Item 2",
    description: "Draggable item",
    width: 1,
    height: 1,
  },
  {
    id: "3",
    title: "Item 3",
    description: "Draggable item",
    width: 1,
    height: 1,
  },
]);

const droppedItems = ref<any[]>([]);

const clearDropped = () => {
  droppedItems.value = [];
};
</script>

<template>
  <ClientOnly>
    <div class="w-full h-full p-8 bg-slate-50">
      <div class="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 class="text-2xl font-bold mb-2">DragDropProvider - Basic Demo</h2>
          <p class="text-gray-600">
            Utilisation du pattern Provider/Context pour partager la
            configuration drag-drop
          </p>
        </div>

        <DragDropProvider :allow-collision="true">
          <template
            #default="{ dragState, startDrag, handleDragOver, endDrag }"
          >
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <h3 class="font-semibold mb-3">📦 Source Items</h3>
                <div class="space-y-3">
                  <div
                    v-for="item in sourceItems"
                    :key="item.id"
                    :class="[
                      'p-4 rounded-lg border-2 cursor-move transition-all',
                      dragState.isDragging && dragState.item?.id === item.id
                        ? 'opacity-40 border-blue-500'
                        : 'border-gray-300 hover:border-blue-400',
                    ]"
                    draggable="true"
                    @dragstart="startDrag($event, item, true)"
                    @dragend="endDrag"
                  >
                    <div class="font-semibold">{{ item.title }}</div>
                    <div class="text-sm text-gray-600">
                      {{ item.description }}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex items-center justify-between mb-3">
                  <h3 class="font-semibold">📥 Drop Zone</h3>
                  <button
                    v-if="droppedItems.length > 0"
                    @click="clearDropped"
                    class="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Clear
                  </button>
                </div>

                <div
                  :class="[
                    'min-h-[200px] p-6 rounded-lg border-2 border-dashed transition-colors',
                    dragState.isDragging
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-gray-50',
                  ]"
                  @dragover="
                    (e) =>
                      handleDragOver(
                        e,
                        {
                          left: 0,
                          top: 0,
                          right: 0,
                          bottom: 0,
                          width: 0,
                          height: 0,
                        },
                        () => ({ x: 0, y: 0 }),
                      )
                  "
                  @drop="
                    (e) => {
                      e.preventDefault();
                      if (dragState.item && dragState.isValid) {
                        droppedItems.push({
                          ...dragState.item,
                          id: `dropped-${Date.now()}`,
                        });
                      }
                      endDrag();
                    }
                  "
                >
                  <div class="text-center text-gray-500 mb-4">
                    {{
                      dragState.isDragging ? "📥 Drop here!" : "⬇️ Drop zone"
                    }}
                  </div>

                  <div v-if="droppedItems.length > 0" class="space-y-2">
                    <div
                      v-for="item in droppedItems"
                      :key="item.id"
                      class="p-3 bg-white rounded border border-green-300"
                    >
                      <div class="font-medium">{{ item.title }}</div>
                      <div class="text-xs text-gray-500">
                        Dropped successfully!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm"
            >
              <div class="font-semibold text-blue-900 mb-2">🔍 Drag State</div>
              <pre class="text-blue-800">{{
                JSON.stringify(dragState, null, 2)
              }}</pre>
            </div>
          </template>
        </DragDropProvider>

        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 class="font-semibold text-sm text-yellow-900 mb-2">
            💡 Avantages du Provider
          </h3>
          <ul class="text-sm text-yellow-800 space-y-1">
            <li>✓ Configuration partagée entre tous les composants enfants</li>
            <li>✓ Pas besoin de passer les props manuellement</li>
            <li>✓ Accès au contexte via useDragDropContext()</li>
            <li>✓ État centralisé du drag-drop</li>
            <li>✓ Facilite la création de composants réutilisables</li>
          </ul>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
```
  :::
::

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/drag-drop-provider.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/drag-drop-provider.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/drag-drop-provider.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/drag-drop-provider.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/drag-drop-provider/index.ts"}

```ts [src/components/ui/drag-drop-provider/index.ts]
export { default as DragDropProvider } from "./DragDropProvider.vue";
```

```vue [src/components/ui/drag-drop-provider/DragDropProvider.vue]
<script setup lang="ts">
import { provide, readonly } from "vue";
import {
  useDragDrop,
  type UseDragDropOptions,
  type UseDragDropReturn,
} from "../../composables/use-drag-drop/useDragDrop";
import { DRAG_DROP_INJECTION_KEY } from "../../composables/use-drag-drop-context/useDragDropContext";

interface Props extends UseDragDropOptions {
  mode?: "drag" | "resize" | "both";
}

const props = withDefaults(defineProps<Props>(), {
  gap: 0,
  allowCollision: false,
  mode: "drag",
});

const dragDropInstance = useDragDrop({
  containerRef: props.containerRef,
  unitSize: props.unitSize,
  gap: props.gap,
  allowCollision: props.allowCollision,
  validatePlacement: props.validatePlacement,
});

provide(DRAG_DROP_INJECTION_KEY, {
  ...dragDropInstance,
  options: readonly({
    containerRef: props.containerRef,
    unitSize: props.unitSize,
    gap: props.gap,
    allowCollision: props.allowCollision,
    mode: props.mode,
  }),
});

defineExpose(dragDropInstance);
</script>

<template>
  <slot
    v-bind="{
      dragState: dragDropInstance.dragState.value,
      dragOffset: dragDropInstance.dragOffset.value,
      containerBounds: dragDropInstance.containerBounds,
      startDrag: dragDropInstance.startDrag,
      handleDragOver: dragDropInstance.handleDragOver,
      handleDragOverSimple: dragDropInstance.handleDragOverSimple,
      endDrag: dragDropInstance.endDrag,
      getVirtualBounds: dragDropInstance.getVirtualBounds,
      getItemFromDataTransfer: dragDropInstance.getItemFromDataTransfer,
    }"
  />
</template>
```

```ts [src/composables/use-drag-drop/useDragDrop.ts]
import { ref, computed, type Ref, onMounted } from "vue";
import { useElementBounding } from "@vueuse/core";

export interface DragDropItem<T = any> {
  id: string;

  width: number;

  height: number;

  data?: T;
}

export interface DragDropPosition {
  x: number;

  y: number;
}

export interface DragDropBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface DragDropState<T = any> {
  item: DragDropItem<T> | null;

  fromContainer: boolean;

  hoverPosition: DragDropPosition | null;

  isValid: boolean;

  isDragging: boolean;
}

export interface UseDragDropOptions {
  containerRef?: Ref<HTMLElement | null>;

  unitSize?: number;

  gap?: number;

  allowCollision?: boolean;

  validatePlacement?: (
    x: number,
    y: number,
    width: number,
    height: number,
    excludeId?: string,
  ) => boolean;
}

export interface UseDragDropReturn<T = any> {
  dragState: Ref<DragDropState<T>>;

  dragOffset: Ref<{ x: number; y: number } | null>;

  containerBounds?: ReturnType<typeof useElementBounding>;

  startDrag: (
    event: DragEvent,
    item: DragDropItem<T>,
    fromContainer?: boolean,
  ) => void;

  handleDragOver: (
    event: DragEvent,
    containerBounds: DragDropBounds,
    getPosition: (bounds: DragDropBounds) => DragDropPosition | null,
  ) => DragDropPosition | null;

  handleDragOverSimple?: (
    event: DragEvent,
    getPosition: (
      virtualBounds: DragDropBounds,
      containerBounds: DragDropBounds,
    ) => DragDropPosition | null,
  ) => DragDropPosition | null;

  endDrag: () => void;

  getVirtualBounds: (clientX: number, clientY: number) => DragDropBounds | null;

  getItemFromDataTransfer: (
    dataTransfer: DataTransfer | null,
  ) => DragDropItem<T> | null;
}

export function useDragDrop<T = any>(
  options: UseDragDropOptions,
): UseDragDropReturn<T> {
  const {
    containerRef,
    unitSize,
    gap = 0,
    allowCollision = false,
    validatePlacement,
  } = options;

  const dragState = ref<DragDropState<T>>({
    item: null,
    fromContainer: false,
    hoverPosition: null,
    isValid: false,
    isDragging: false,
  }) as Ref<DragDropState<T>>;

  const dragOffset = ref<{ x: number; y: number } | null>(null);

  const containerBounds = containerRef
    ? useElementBounding(containerRef)
    : undefined;

  const startDrag = (
    event: DragEvent,
    item: DragDropItem<T>,
    fromContainer = false,
  ) => {
    dragState.value.item = { ...item };
    dragState.value.fromContainer = fromContainer;
    dragState.value.isDragging = true;

    if (event.target instanceof HTMLElement) {
      const targetRect = event.target.getBoundingClientRect();

      const offsetX = event.clientX - targetRect.left;
      const offsetY = event.clientY - targetRect.top;

      dragOffset.value = { x: offsetX, y: offsetY };
    }

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/json", JSON.stringify(item));
    }
  };

  const getVirtualBounds = (
    clientX: number,
    clientY: number,
  ): DragDropBounds | null => {
    if (!dragState.value.item) return null;

    const itemWidth =
      unitSize !== undefined
        ? dragState.value.item.width * (unitSize + gap) - gap
        : dragState.value.item.width;
    const itemHeight =
      unitSize !== undefined
        ? dragState.value.item.height * (unitSize + gap) - gap
        : dragState.value.item.height;

    const offsetX = dragOffset.value?.x ?? itemWidth / 2;
    const offsetY = dragOffset.value?.y ?? itemHeight / 2;

    return {
      left: clientX - offsetX,
      top: clientY - offsetY,
      right: clientX - offsetX + itemWidth,
      bottom: clientY - offsetY + itemHeight,
      width: itemWidth,
      height: itemHeight,
    };
  };

  const getItemFromDataTransfer = (
    dataTransfer: DataTransfer | null,
  ): DragDropItem<T> | null => {
    if (!dataTransfer) return null;

    try {
      const data = dataTransfer.getData("application/json");
      if (data) {
        return JSON.parse(data) as DragDropItem<T>;
      }
    } catch (e) {
      console.error("Erreur lors du parsing des données de drag:", e);
    }

    return null;
  };

  const handleDragOver = (
    event: DragEvent,
    containerBounds: DragDropBounds,
    getPosition: (bounds: DragDropBounds) => DragDropPosition | null,
  ): DragDropPosition | null => {
    event.preventDefault();

    if (!dragState.value.item) {
      const item = getItemFromDataTransfer(event.dataTransfer);
      if (item) {
        dragState.value.item = item;
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

    const virtualBounds = getVirtualBounds(event.clientX, event.clientY);
    if (!virtualBounds) return null;

    const pos = getPosition(virtualBounds);
    if (!pos) return null;

    if (!allowCollision && validatePlacement && dragState.value.item) {
      const excludeId = dragState.value.fromContainer
        ? dragState.value.item.id
        : undefined;
      const isValid = validatePlacement(
        pos.x,
        pos.y,
        dragState.value.item.width,
        dragState.value.item.height,
        excludeId,
      );

      dragState.value.hoverPosition = pos;
      dragState.value.isValid = isValid;

      if (!isValid && event.dataTransfer) {
        event.dataTransfer.dropEffect = "none";
      }
    } else {
      dragState.value.hoverPosition = pos;
      dragState.value.isValid = true;
    }

    return pos;
  };

  const endDrag = () => {
    dragState.value.item = null;
    dragState.value.fromContainer = false;
    dragState.value.hoverPosition = null;
    dragState.value.isValid = false;
    dragState.value.isDragging = false;
    dragOffset.value = null;
  };

  const handleDragOverSimple = containerBounds
    ? (
        event: DragEvent,
        getPosition: (
          virtualBounds: DragDropBounds,
          containerBounds: DragDropBounds,
        ) => DragDropPosition | null,
      ): DragDropPosition | null => {
        const bounds: DragDropBounds = {
          left: containerBounds.left.value,
          top: containerBounds.top.value,
          right: containerBounds.right.value,
          bottom: containerBounds.bottom.value,
          width: containerBounds.width.value,
          height: containerBounds.height.value,
        };
        return handleDragOver(event, bounds, (virtualBounds) =>
          getPosition(virtualBounds, bounds),
        );
      }
    : undefined;

  const returnValue: UseDragDropReturn<T> = {
    dragState,
    dragOffset,
    startDrag,
    handleDragOver,
    endDrag,
    getVirtualBounds,
    getItemFromDataTransfer,
  };

  if (containerBounds) {
    returnValue.containerBounds = containerBounds;
    returnValue.handleDragOverSimple = handleDragOverSimple;
  }

  return returnValue;
}

export class DragDropUtils {
  static getPositionByIntersection(
    elementBounds: DragDropBounds,
    containerBounds: DragDropBounds,
    unitSize: number,
    gap: number,
    columns: number,
    rows: number,
  ): DragDropPosition | null {
    let maxIntersectionArea = 0;
    let bestPosition = { x: 0, y: 0 };

    const startX = Math.max(
      0,
      Math.floor(
        (elementBounds.left - containerBounds.left - gap) / (unitSize + gap),
      ),
    );
    const endX = Math.min(
      columns - 1,
      Math.ceil(
        (elementBounds.right - containerBounds.left - gap) / (unitSize + gap),
      ),
    );
    const startY = Math.max(
      0,
      Math.floor(
        (elementBounds.top - containerBounds.top - gap) / (unitSize + gap),
      ),
    );
    const endY = Math.min(
      rows - 1,
      Math.ceil(
        (elementBounds.bottom - containerBounds.top - gap) / (unitSize + gap),
      ),
    );

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const cellLeft = containerBounds.left + gap + x * (unitSize + gap);
        const cellTop = containerBounds.top + gap + y * (unitSize + gap);
        const cellRight = cellLeft + unitSize;
        const cellBottom = cellTop + unitSize;

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
  }

  static pixelToGrid(
    pixelX: number,
    pixelY: number,
    unitSize: number,
    gap: number,
  ): DragDropPosition {
    const x = Math.floor(pixelX / (unitSize + gap));
    const y = Math.floor(pixelY / (unitSize + gap));
    return { x, y };
  }

  static gridToPixel(
    gridX: number,
    gridY: number,
    unitSize: number,
    gap: number,
  ): { x: number; y: number } {
    const x = gridX * (unitSize + gap);
    const y = gridY * (unitSize + gap);
    return { x, y };
  }
}
```

```ts [src/composables/use-drag-drop-context/useDragDropContext.ts]
import { inject } from "vue";
import type {
  UseDragDropReturn,
  UseDragDropOptions,
} from "../use-drag-drop/useDragDrop";

export const DRAG_DROP_INJECTION_KEY = Symbol("drag-drop-context");

export interface DragDropContext<T = any> extends UseDragDropReturn<T> {
  options: Readonly<UseDragDropOptions & { mode?: "drag" | "resize" | "both" }>;
}

export function useDragDropContext<T = any>(): DragDropContext<T> {
  const context = inject<DragDropContext<T>>(DRAG_DROP_INJECTION_KEY);

  if (!context) {
    throw new Error(
      "useDragDropContext must be used within a DragDropProvider component. " +
        "Make sure to wrap your component with <DragDropProvider>.",
    );
  }

  return context;
}

export function useDragDropContextOptional<T = any>():
  | DragDropContext<T>
  | undefined {
  return inject<DragDropContext<T> | undefined>(
    DRAG_DROP_INJECTION_KEY,
    undefined,
  );
}
```
:::

## DragDropProvider
::hr-underline
::

Mode d&#39;interaction (peut être étendu pour supporter d&#39;autres modes)

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `mode`{.primary .text-primary} | `'drag' \| 'resize' \| 'both'` | drag | Mode d&#39;interaction (peut être étendu pour supporter d&#39;autres modes)
@default &#39;drag&#39; |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `DRAG_DROP_INJECTION_KEY`{.primary .text-primary} | `{
  ...dragDropInstance,
  options: readonly({
    containerRef: props.containerRef,
    unitSize: props.unitSize,
    gap: props.gap,
    allowCollision: props.allowCollision,
    mode: props.mode,
  }),
}` | `any` | Fournir l'instance aux composants enfants via provide |

---

  ## Examples
  ::hr-underline
  ::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <grid-layout-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref, computed, type Ref } from "vue";
import DragDropProvider from "../DragDropProvider.vue";
import { DragDropUtils } from "../../../composables/use-drag-drop/useDragDrop";

const CELL_SIZE = 80;
const GAP = 8;
const COLUMNS = 6;
const ROWS = 5;

const gridContainer: Ref<HTMLElement | null> = ref(null);

const items = ref([
  {
    id: "1",
    x: 0,
    y: 0,
    width: 2,
    height: 1,
    label: "Header",
    color: "bg-blue-500",
  },
  {
    id: "2",
    x: 2,
    y: 0,
    width: 2,
    height: 2,
    label: "Hero",
    color: "bg-purple-500",
  },
  {
    id: "3",
    x: 0,
    y: 1,
    width: 2,
    height: 1,
    label: "Nav",
    color: "bg-green-500",
  },
  {
    id: "4",
    x: 4,
    y: 0,
    width: 2,
    height: 1,
    label: "Search",
    color: "bg-cyan-500",
  },
  {
    id: "5",
    x: 0,
    y: 2,
    width: 4,
    height: 2,
    label: "Content",
    color: "bg-indigo-500",
  },
  {
    id: "6",
    x: 4,
    y: 1,
    width: 2,
    height: 3,
    label: "Ads",
    color: "bg-rose-500",
  },
  {
    id: "7",
    x: 0,
    y: 4,
    width: 2,
    height: 1,
    label: "Footer L",
    color: "bg-slate-500",
  },
  {
    id: "8",
    x: 2,
    y: 4,
    width: 2,
    height: 1,
    label: "Footer R",
    color: "bg-slate-500",
  },
]);

const validatePlacement = (
  x: number,
  y: number,
  width: number,
  height: number,
  excludeId?: string,
) => {
  console.log("🔍 validatePlacement called:", {
    x,
    y,
    width,
    height,
    excludeId,
  });

  if (x < 0 || y < 0 || x + width > COLUMNS || y + height > ROWS) {
    console.log("❌ HORS LIMITES:", {
      x,
      y,
      width,
      height,
      COLUMNS,
      ROWS,
      sum: x + width,
    });
    return false;
  }

  for (const item of items.value) {
    console.log(`  Checking item ${item.id} (${item.label}):`, {
      itemPos: `${item.x},${item.y}`,
      itemSize: `${item.width}x${item.height}`,
      excluded: excludeId === item.id,
    });

    if (excludeId && item.id === excludeId) {
      console.log(`  ⏭️  Skipping excluded item ${item.id}`);
      continue;
    }

    const overlapsX = x < item.x + item.width && x + width > item.x;
    const overlapsY = y < item.y + item.height && y + height > item.y;

    console.log(`  Overlap check:`, {
      overlapsX,
      overlapsY,
      xCheck: `${x} < ${item.x + item.width} && ${x + width} > ${item.x}`,
      yCheck: `${y} < ${item.y + item.height} && ${y + height} > ${item.y}`,
    });

    if (overlapsX && overlapsY) {
      console.log(`❌ COLLISION avec ${item.id} (${item.label})`);
      return false;
    }
  }

  console.log("✅ PLACEMENT VALIDE");
  return true;
};

const stats = computed(() => ({
  totalItems: items.value.length,
  totalCells: COLUMNS * ROWS,
  usedCells: items.value.reduce(
    (sum, item) => sum + item.width * item.height,
    0,
  ),
  freeCells:
    COLUMNS * ROWS -
    items.value.reduce((sum, item) => sum + item.width * item.height, 0),
}));

const allCells = computed(() => {
  const cells = [];
  const occupied = new Set<string>();

  for (const item of items.value) {
    for (let dy = 0; dy < item.height; dy++) {
      for (let dx = 0; dx < item.width; dx++) {
        occupied.add(`${item.x + dx},${item.y + dy}`);
      }
    }
  }

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLUMNS; x++) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        cells.push({ x, y, key });
      }
    }
  }

  return cells;
});

const getPositionByIntersectionDebug = (
  virtualBounds: any,
  containerBounds: any,
) => {
  console.log("🎯 getPositionByIntersectionDebug appelée!");
  console.log("🔍 Container bounds:", containerBounds);
  console.log("🔍 Virtual bounds:", virtualBounds);
  console.log("🔍 Config:", { CELL_SIZE, GAP, COLUMNS, ROWS });

  const result = DragDropUtils.getPositionByIntersection(
    virtualBounds,
    containerBounds,
    CELL_SIZE,
    GAP,
    COLUMNS,
    ROWS,
  );

  console.log("🔍 Calculated position:", result);
  return result;
};
</script>

<template>
  <div class="w-full h-full p-8 bg-slate-50">
    <div class="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 class="text-2xl font-bold mb-2">Grid Layout Demo</h2>
        <p class="text-gray-600">
          Déplacement d'items dans une grille avec validation de collision
        </p>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-blue-600">
            {{ stats.totalItems }}
          </div>
          <div class="text-xs text-gray-600">Items</div>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-green-600">
            {{ stats.usedCells }}
          </div>
          <div class="text-xs text-gray-600">Cellules occupées</div>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-orange-600">
            {{ stats.freeCells }}
          </div>
          <div class="text-xs text-gray-600">Cellules libres</div>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-purple-600">
            {{ COLUMNS }}×{{ ROWS }}
          </div>
          <div class="text-xs text-gray-600">Grille</div>
        </div>
      </div>

      <DragDropProvider
        :container-ref="gridContainer as any"
        :unit-size="CELL_SIZE"
        :gap="GAP"
        :validate-placement="validatePlacement"
      >
        <template>
          <div class="bg-white p-6 rounded-lg border shadow-lg">
            <div
              ref="gridContainer"
              class="relative bg-slate-100 rounded-lg"
              :style="{
                display: 'grid',
                gridTemplateColumns: `repeat(${COLUMNS}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
                gap: `${GAP}px`,
                padding: `${GAP}px`,
              }"
              @dragover="
                (e) => {
                  console.log('👆 DRAGOVER event');
                  handleDragOverSimple?.(e, getPositionByIntersectionDebug);
                }
              "
              @drop="
                (e) => {
                  e.preventDefault();
                  if (
                    dragState.item &&
                    dragState.hoverPosition &&
                    dragState.isValid
                  ) {
                    const item = items.find((i) => i.id === dragState.item!.id);
                    if (item) {
                      item.x = dragState.hoverPosition.x;
                      item.y = dragState.hoverPosition.y;
                    }
                  }
                  endDrag();
                }
              "
            >
              <div
                v-for="cell in allCells"
                :key="cell.key"
                :style="{
                  gridColumn: `${cell.x + 1} / span 1`,
                  gridRow: `${cell.y + 1} / span 1`,
                }"
                class="border border-dashed border-slate-300 rounded pointer-events-none bg-slate-50"
              />

              <div
                v-for="item in items"
                :key="item.id"
                :style="{
                  gridColumn: `${item.x + 1} / span ${item.width}`,
                  gridRow: `${item.y + 1} / span ${item.height}`,
                }"
                :class="[
                  'rounded-lg cursor-move transition-all p-4',
                  'border-2 border-white shadow-md',
                  item.color,
                  dragState.isDragging && dragState.item?.id === item.id
                    ? 'opacity-40'
                    : 'opacity-100',
                ]"
                draggable="true"
                @dragstart="
                  (e) => {
                    console.log('🚀 DRAGSTART:', item.id, item.label, {
                      width: item.width,
                      height: item.height,
                    });
                    startDrag(
                      e,
                      {
                        id: item.id,
                        width: item.width,
                        height: item.height,
                        data: item,
                      },
                      true,
                    );
                  }
                "
                @dragend="endDrag"
              >
                <div class="font-semibold text-white">{{ item.label }}</div>
                <div class="text-xs text-white opacity-75">
                  {{ item.width }}×{{ item.height }}
                </div>
              </div>

              <div
                v-if="
                  dragState.isDragging &&
                  dragState.hoverPosition &&
                  dragState.item
                "
                :style="{
                  gridColumn: `${dragState.hoverPosition.x + 1} / span ${dragState.item.width}`,
                  gridRow: `${dragState.hoverPosition.y + 1} / span ${dragState.item.height}`,
                }"
                :class="[
                  'rounded-lg border-2 pointer-events-none',
                  dragState.isValid
                    ? 'border-green-400 bg-green-100 bg-opacity-50'
                    : 'border-red-400 bg-red-100 bg-opacity-50',
                ]"
              >
                <div
                  class="p-2 text-sm font-semibold"
                  :class="dragState.isValid ? 'text-green-700' : 'text-red-700'"
                >
                  {{ dragState.isValid ? "✓" : "✗" }}
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <div class="font-semibold text-blue-900 mb-2">🔍 Drag State</div>
            <div class="space-y-1 text-blue-800">
              <div>Dragging: {{ dragState.isDragging }}</div>
              <div v-if="dragState.item">
                Item: {{ dragState.item.id }} ({{ dragState.item.width }}×{{
                  dragState.item.height
                }})
              </div>
              <div v-if="dragState.hoverPosition">
                Position: ({{ dragState.hoverPosition.x }},
                {{ dragState.hoverPosition.y }})
              </div>
              <div v-if="dragState.isDragging">
                Valid: {{ dragState.isValid }}
              </div>
            </div>
          </div>
        </template>
      </DragDropProvider>

      <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 class="font-semibold text-sm text-yellow-900 mb-2">
          💡 Instructions
        </h3>
        <ul class="text-sm text-yellow-800 space-y-1">
          <li>• Drag les items pour les repositionner dans la grille</li>
          <li>
            • Les items ne peuvent pas se chevaucher (validation de collision)
          </li>
          <li>• Vert = placement valide, Rouge = placement invalide</li>
          <li>• Les items gardent leur taille lors du déplacement</li>
          <li>• Le provider centralise la configuration pour tous les items</li>
        </ul>
      </div>
    </div>
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <simple-test />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import DragDropProvider from "../DragDropProvider.vue";

const items = ref([
  { id: "1", title: "Item 1", width: 1, height: 1 },
  { id: "2", title: "Item 2", width: 1, height: 1 },
  { id: "3", title: "Item 3", width: 1, height: 1 },
  { id: "4", title: "Item 4", width: 1, height: 1 },
]);

const draggedIndex = ref<number | null>(null);

const hoverIndex = ref<number | null>(null);

const handleDragStart = (index: number) => {
  draggedIndex.value = index;
  hoverIndex.value = null;
};

const handleDragOver = (index: number) => {
  if (draggedIndex.value === null || draggedIndex.value === index) return;
  hoverIndex.value = index;
};

const handleDrop = () => {
  if (draggedIndex.value === null || hoverIndex.value === null) {
    draggedIndex.value = null;
    hoverIndex.value = null;
    return;
  }

  const draggedItem = items.value[draggedIndex.value];
  if (!draggedItem) return;

  const newItems = [...items.value];

  newItems.splice(draggedIndex.value, 1);

  newItems.splice(hoverIndex.value, 0, draggedItem);

  items.value = newItems;
  draggedIndex.value = null;
  hoverIndex.value = null;
};

const handleDragEnd = () => {
  draggedIndex.value = null;
  hoverIndex.value = null;
};
</script>

<template>
  <ClientOnly>
    <div class="p-8 bg-slate-50">
      <h2 class="text-2xl font-bold mb-4">Sortable List Demo</h2>
      <p class="text-gray-600 mb-6">
        Démo de liste réorganisable par drag & drop
      </p>

      <DragDropProvider :allow-collision="true">
        <template #default="{ dragState }">
          <div class="max-w-md space-y-3">
            <div
              v-for="(item, index) in items"
              :key="item.id"
              :class="[
                'p-4 bg-white border-2 rounded-lg cursor-move transition-all',
                draggedIndex === index
                  ? 'opacity-40 border-blue-500'
                  : hoverIndex === index
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400',
              ]"
              draggable="true"
              @dragstart="handleDragStart(index)"
              @dragover.prevent="handleDragOver(index)"
              @drop="handleDrop"
              @dragend="handleDragEnd"
            >
              <div class="flex items-center gap-3">
                <div class="text-2xl">☰</div>
                <div class="font-semibold">{{ item.title }}</div>
              </div>
            </div>
          </div>

          <div
            class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm max-w-md"
          >
            <div class="font-semibold text-blue-900 mb-2">🔍 Drag State</div>
            <div class="space-y-1 text-blue-800">
              <div>Is Dragging: {{ dragState.isDragging }}</div>
              <div v-if="draggedIndex !== null">
                Dragged Index: {{ draggedIndex }}
              </div>
              <div v-if="hoverIndex !== null">
                Hover Index: {{ hoverIndex }}
              </div>
            </div>
          </div>

          <div
            class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mt-4"
          >
            <h3 class="font-semibold text-sm text-yellow-900 mb-2">
              💡 Instructions
            </h3>
            <ul class="text-sm text-yellow-800 space-y-1">
              <li>• Drag un item pour le déplacer</li>
              <li>• Drop sur un autre item pour échanger les positions</li>
              <li>• La liste se réorganise automatiquement</li>
            </ul>
          </div>
        </template>
      </DragDropProvider>
    </div>
  </ClientOnly>
</template>
```
  :::
::

::tip
You can copy and adapt this template for any component documentation.
::