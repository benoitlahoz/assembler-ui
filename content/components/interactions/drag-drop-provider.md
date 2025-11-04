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
import { ref, computed } from "vue";
import DragDropProvider from "../DragDropProvider.vue";
import { DragDropUtils } from "../../../composables/use-drag-drop/useDragDrop";

const CELL_SIZE = 80;
const GAP = 8;
const COLUMNS = 6;
const ROWS = 5;

const gridContainer = ref<HTMLElement | null>(null);

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
    width: 1,
    height: 1,
    label: "Nav",
    color: "bg-green-500",
  },
  {
    id: "4",
    x: 1,
    y: 1,
    width: 1,
    height: 1,
    label: "Sidebar",
    color: "bg-orange-500",
  },
  {
    id: "5",
    x: 4,
    y: 0,
    width: 2,
    height: 1,
    label: "Search",
    color: "bg-cyan-500",
  },
  {
    id: "6",
    x: 0,
    y: 2,
    width: 4,
    height: 2,
    label: "Content",
    color: "bg-indigo-500",
  },
  {
    id: "7",
    x: 4,
    y: 1,
    width: 2,
    height: 3,
    label: "Ads",
    color: "bg-rose-500",
  },
  {
    id: "8",
    x: 0,
    y: 4,
    width: 2,
    height: 1,
    label: "Footer L",
    color: "bg-slate-500",
  },
  {
    id: "9",
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
  if (x < 0 || y < 0 || x + width > COLUMNS || y + height > ROWS) {
    return false;
  }

  for (const item of items.value) {
    if (excludeId && item.id === excludeId) continue;

    const overlapsX = x < item.x + item.width && x + width > item.x;
    const overlapsY = y < item.y + item.height && y + height > item.y;

    if (overlapsX && overlapsY) {
      return false;
    }
  }

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
                (e) =>
                  handleDragOverSimple?.(
                    e,
                    (virtualBounds, containerBounds) => {
                      return DragDropUtils.getPositionByIntersection(
                        virtualBounds,
                        containerBounds,
                        CELL_SIZE,
                        GAP,
                        COLUMNS,
                        ROWS,
                      );
                    },
                  )
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
                  (e) =>
                    startDrag(
                      e,
                      {
                        id: item.id,
                        width: item.width,
                        height: item.height,
                        data: item,
                      },
                      true,
                    )
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
]);
</script>

<template>
  <div class="p-8">
    <h2 class="text-2xl font-bold mb-4">Test DragDropProvider</h2>

    <DragDropProvider :allow-collision="true">
      <template #default="{ dragState, startDrag, endDrag }">
        <div class="space-y-4">
          <div class="p-4 bg-blue-100 rounded">
            Provider is rendering!
            <br />
            Is Dragging: {{ dragState.isDragging }}
          </div>

          <div
            v-for="item in items"
            :key="item.id"
            class="p-4 bg-white border rounded cursor-move"
            draggable="true"
            @dragstart="(e) => startDrag(e, item, true)"
            @dragend="endDrag"
          >
            {{ item.title }}
          </div>
        </div>
      </template>
    </DragDropProvider>
  </div>
</template>
```
  :::
::

::tip
You can copy and adapt this template for any component documentation.
::