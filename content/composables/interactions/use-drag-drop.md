---
title: useDragDrop
description: useDragDrop - Composable pour gérer le drag and drop avec intersection précise
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <file-list-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useDragDrop } from "../useDragDrop";

interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  order: number;
  icon: string;
}

const files = ref<FileItem[]>([
  {
    id: "f1",
    name: "README.md",
    type: "file",
    size: "2.4 KB",
    order: 0,
    icon: "📄",
  },
  {
    id: "f2",
    name: "package.json",
    type: "file",
    size: "1.2 KB",
    order: 1,
    icon: "📦",
  },
  { id: "f3", name: "src", type: "folder", order: 2, icon: "📁" },
  { id: "f4", name: "components", type: "folder", order: 3, icon: "📁" },
  {
    id: "f5",
    name: "index.ts",
    type: "file",
    size: "845 B",
    order: 4,
    icon: "📄",
  },
  {
    id: "f6",
    name: "styles.css",
    type: "file",
    size: "3.1 KB",
    order: 5,
    icon: "🎨",
  },
  { id: "f7", name: "utils", type: "folder", order: 6, icon: "📁" },
  {
    id: "f8",
    name: "config.ts",
    type: "file",
    size: "512 B",
    order: 7,
    icon: "⚙️",
  },
]);

const sortedFiles = computed(() => {
  return [...files.value].sort((a, b) => a.order - b.order);
});

const { dragState, startDrag, endDrag } = useDragDrop({
  unitSize: 48,
  gap: 4,
});

const dragOverIndex = ref<number | null>(null);

const onDragStart = (event: DragEvent, file: FileItem) => {
  startDrag(
    event,
    {
      id: file.id,
      width: 1,
      height: 1,
      data: file,
    },
    true,
  );
};

const onDragOver = (event: DragEvent, index: number) => {
  event.preventDefault();

  if (!dragState.value.item) return;

  dragOverIndex.value = index;

  const targetFile = sortedFiles.value[index];
  if (!targetFile || dragState.value.item.id === targetFile.id) return;

  const draggedFile = files.value.find(
    (f) => f.id === dragState.value.item!.id,
  );
  if (!draggedFile) return;

  const currentIndex = sortedFiles.value.findIndex(
    (f) => f.id === draggedFile.id,
  );

  if (currentIndex !== index) {
    const newFiles = [...sortedFiles.value];
    newFiles.splice(currentIndex, 1);
    newFiles.splice(index, 0, draggedFile);

    newFiles.forEach((f, i) => {
      const file = files.value.find((file) => file.id === f.id);
      if (file) file.order = i;
    });
  }
};

const onDragLeave = () => {
  dragOverIndex.value = null;
};

const onDragEndHandler = () => {
  endDrag();
  dragOverIndex.value = null;
};

const selectedFile = ref<string | null>(null);

const selectFile = (id: string) => {
  selectedFile.value = selectedFile.value === id ? null : id;
};
</script>

<template>
  <div class="w-full h-full p-8 bg-slate-50">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold mb-6">File Explorer - Reorder Files</h2>

      <div class="bg-white rounded-lg shadow-sm border">
        <div
          class="px-4 py-3 bg-slate-100 border-b font-semibold text-sm flex items-center gap-4"
        >
          <span class="flex-1">Name</span>
          <span class="w-24 text-right">Size</span>
          <span class="w-16 text-right">Type</span>
        </div>

        <div class="divide-y">
          <div
            v-for="(file, index) in sortedFiles"
            :key="file.id"
            draggable="true"
            @dragstart="onDragStart($event, file)"
            @dragover="onDragOver($event, index)"
            @dragleave="onDragLeave"
            @dragend="onDragEndHandler"
            @click="selectFile(file.id)"
            :class="[
              'px-4 py-3 cursor-move transition-all flex items-center gap-4',
              'hover:bg-slate-50',
              selectedFile === file.id
                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                : '',
              dragState.isDragging && dragState.item?.id === file.id
                ? 'opacity-40'
                : 'opacity-100',
              dragOverIndex === index && dragState.item?.id !== file.id
                ? 'border-t-2 border-t-blue-400'
                : '',
            ]"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <span class="text-2xl shrink-0">{{ file.icon }}</span>
              <span class="font-medium text-sm truncate">{{ file.name }}</span>
            </div>

            <span class="w-24 text-right text-sm text-slate-600">
              {{ file.size || "-" }}
            </span>

            <span class="w-16 text-right text-xs text-slate-500 capitalize">
              {{ file.type }}
            </span>
          </div>
        </div>

        <div
          v-if="files.length === 0"
          class="px-4 py-12 text-center text-slate-400"
        >
          No files found
        </div>
      </div>

      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 class="font-semibold text-sm text-blue-900 mb-2">
          💡 Instructions
        </h3>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• Drag and drop files to reorder them</li>
          <li>• Click on a file to select it</li>
          <li>• The list maintains the order automatically</li>
        </ul>
      </div>

      <div
        v-if="dragState.isDragging"
        class="mt-4 p-3 bg-slate-100 rounded text-xs font-mono"
      >
        <div>Dragging: {{ dragState.item?.data?.name }}</div>
        <div>Is Valid: {{ dragState.isValid }}</div>
      </div>
    </div>
  </div>
</template>
```
  :::
::

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-drag-drop/useDragDrop.ts"}

```ts [src/composables/use-drag-drop/useDragDrop.ts]
import { ref, computed, type Ref } from "vue";
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
  unitSize: number;

  gap?: number;

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

  endDrag: () => void;

  getVirtualBounds: (clientX: number, clientY: number) => DragDropBounds | null;

  getItemFromDataTransfer: (
    dataTransfer: DataTransfer | null,
  ) => DragDropItem<T> | null;
}

export function useDragDrop<T = any>(
  options: UseDragDropOptions,
): UseDragDropReturn<T> {
  const { unitSize, gap = 0, validatePlacement } = options;

  const dragState = ref<DragDropState<T>>({
    item: null,
    fromContainer: false,
    hoverPosition: null,
    isValid: false,
    isDragging: false,
  }) as Ref<DragDropState<T>>;

  const dragOffset = ref<{ x: number; y: number } | null>(null);

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

    const itemWidth = dragState.value.item.width * (unitSize + gap) - gap;
    const itemHeight = dragState.value.item.height * (unitSize + gap) - gap;

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

    if (validatePlacement && dragState.value.item) {
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

  return {
    dragState,
    dragOffset,
    startDrag,
    handleDragOver,
    endDrag,
    getVirtualBounds,
    getItemFromDataTransfer,
  };
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
:::

## API
::hr-underline
::

  ### Parameters
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `options`{.primary .text-primary} | `UseDragDropOptions` | — | — |

  ### Returns

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `DragDropItem`{.primary .text-primary} | `interface` | — |
| `DragDropPosition`{.primary .text-primary} | `interface` | — |
| `DragDropBounds`{.primary .text-primary} | `interface` | — |
| `DragDropState`{.primary .text-primary} | `interface` | — |
| `UseDragDropOptions`{.primary .text-primary} | `interface` | — |
| `UseDragDropReturn`{.primary .text-primary} | `interface` | — |

---

  ## Examples
  ::hr-underline
  ::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <timeline-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useElementBounding } from "@vueuse/core";
import { useDragDrop } from "../useDragDrop";

interface Event {
  id: string;
  title: string;
  startHour: number;
  duration: number;
  color: string;
  type: "meeting" | "task" | "break" | "personal";
}

const timeline = ref<HTMLElement | null>(null);
const timelineBounds = useElementBounding(timeline);

const events = ref<Event[]>([
  {
    id: "e1",
    title: "Team Standup",
    startHour: 9,
    duration: 0.5,
    color: "bg-blue-500",
    type: "meeting",
  },
  {
    id: "e2",
    title: "Deep Work Session",
    startHour: 10,
    duration: 2,
    color: "bg-purple-500",
    type: "task",
  },
  {
    id: "e3",
    title: "Lunch Break",
    startHour: 12,
    duration: 1,
    color: "bg-green-500",
    type: "break",
  },
  {
    id: "e4",
    title: "Client Meeting",
    startHour: 14,
    duration: 1.5,
    color: "bg-red-500",
    type: "meeting",
  },
  {
    id: "e5",
    title: "Code Review",
    startHour: 16,
    duration: 1,
    color: "bg-indigo-500",
    type: "task",
  },
]);

const HOUR_HEIGHT = 80;
const START_HOUR = 6;
const END_HOUR = 22;
const WORK_START = 8;
const WORK_END = 18;

const { dragState, startDrag, handleDragOver, endDrag } = useDragDrop({
  unitSize: HOUR_HEIGHT,
  gap: 0,
  validatePlacement: (x, y, width, height) => {
    const endHour = y + height;

    return y >= WORK_START && endHour <= WORK_END;
  },
});

const onDragStart = (event: DragEvent, evt: Event) => {
  startDrag(
    event,
    {
      id: evt.id,
      width: 1,
      height: evt.duration,
      data: evt,
    },
    true,
  );
};

const onDragOver = (event: DragEvent) => {
  const bounds = {
    left: timelineBounds.left.value,
    top: timelineBounds.top.value,
    right: timelineBounds.right.value,
    bottom: timelineBounds.bottom.value,
    width: timelineBounds.width.value,
    height: timelineBounds.height.value,
  };

  handleDragOver(event, bounds, (virtualBounds) => {
    const relativeY = virtualBounds.top - bounds.top;
    const hour = START_HOUR + relativeY / HOUR_HEIGHT;

    const roundedHour = Math.round(hour * 4) / 4;

    return {
      x: 0,
      y: Math.max(START_HOUR, Math.min(END_HOUR, roundedHour)),
    };
  });
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();

  if (
    dragState.value.item &&
    dragState.value.hoverPosition &&
    dragState.value.isValid
  ) {
    const evt = events.value.find((e) => e.id === dragState.value.item!.id);
    if (evt) {
      evt.startHour = dragState.value.hoverPosition.y;
    }
  }

  endDrag();
};

const hours = computed(() => {
  return Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i,
  );
});

const formatHour = (hour: number) => {
  const h = hour % 12 || 12;
  const period = hour < 12 ? "AM" : "PM";
  return `${h}:00 ${period}`;
};

const getEventStyle = (event: Event) => {
  return {
    position: "absolute" as const,
    left: "80px",
    right: "20px",
    top: `${(event.startHour - START_HOUR) * HOUR_HEIGHT}px`,
    height: `${event.duration * HOUR_HEIGHT}px`,
  };
};

const isWorkHour = (hour: number) => {
  return hour >= WORK_START && hour < WORK_END;
};

const selectedEvent = ref<string | null>(null);

const addEvent = () => {
  const newEvent: Event = {
    id: `e${Date.now()}`,
    title: "New Event",
    startHour: 10,
    duration: 1,
    color: "bg-slate-500",
    type: "task",
  };
  events.value.push(newEvent);
  selectedEvent.value = newEvent.id;
};

const removeEvent = (id: string) => {
  events.value = events.value.filter((e) => e.id !== id);
  if (selectedEvent.value === id) {
    selectedEvent.value = null;
  }
};
</script>

<template>
  <div class="w-full h-full p-8 bg-slate-50">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">Daily Schedule</h2>
        <button
          @click="addEvent"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          ➕ Add Event
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-lg border overflow-hidden">
        <div class="px-6 py-3 bg-slate-100 border-b font-semibold">
          <div class="text-sm text-slate-600">
            {{
              new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }}
          </div>
        </div>

        <div class="relative overflow-auto max-h-[700px]">
          <div
            ref="timeline"
            class="relative"
            :style="{
              height: `${(END_HOUR - START_HOUR + 1) * HOUR_HEIGHT}px`,
            }"
            @dragover="onDragOver"
            @drop="onDrop"
          >
            <div
              v-for="hour in hours"
              :key="hour"
              :class="[
                'absolute left-0 right-0 border-b',
                isWorkHour(hour) ? 'bg-white' : 'bg-slate-50',
              ]"
              :style="{
                top: `${(hour - START_HOUR) * HOUR_HEIGHT}px`,
                height: `${HOUR_HEIGHT}px`,
              }"
            >
              <div
                class="absolute left-4 top-2 text-sm font-semibold text-slate-600"
              >
                {{ formatHour(hour) }}
              </div>

              <div
                class="absolute left-16 right-0 top-1/4 border-t border-slate-200"
              ></div>
              <div
                class="absolute left-16 right-0 top-1/2 border-t border-slate-300"
              ></div>
              <div
                class="absolute left-16 right-0 top-3/4 border-t border-slate-200"
              ></div>
            </div>

            <div
              class="absolute left-0 right-0 border-2 border-blue-200 border-dashed pointer-events-none"
              :style="{
                top: `${(WORK_START - START_HOUR) * HOUR_HEIGHT}px`,
                height: `${(WORK_END - WORK_START) * HOUR_HEIGHT}px`,
              }"
            >
              <div
                class="absolute left-2 top-2 text-xs text-blue-600 font-semibold bg-white px-2 py-1 rounded"
              >
                Work Hours
              </div>
            </div>

            <div
              v-for="event in events"
              :key="event.id"
              :style="getEventStyle(event)"
              :class="[
                'rounded-lg shadow-md cursor-move transition-all p-3',
                'border-l-4',
                event.color,
                'text-white',
                selectedEvent === event.id ? 'ring-4 ring-blue-300' : '',
                dragState.isDragging && dragState.item?.id === event.id
                  ? 'opacity-40'
                  : 'opacity-100',
              ]"
              draggable="true"
              @dragstart="onDragStart($event, event)"
              @dragend="endDrag"
              @click="selectedEvent = event.id"
              @dblclick="removeEvent(event.id)"
            >
              <div class="font-semibold text-sm">{{ event.title }}</div>
              <div class="text-xs opacity-90 mt-1">
                {{ formatHour(event.startHour) }} -
                {{ formatHour(event.startHour + event.duration) }} ({{
                  event.duration
                }}h)
              </div>
              <div class="text-xs opacity-75 mt-1 capitalize">
                {{ event.type }}
              </div>
            </div>

            <div
              v-if="
                dragState.isDragging &&
                dragState.hoverPosition &&
                dragState.item
              "
              :style="{
                position: 'absolute',
                left: '80px',
                right: '20px',
                top: `${(dragState.hoverPosition.y - START_HOUR) * HOUR_HEIGHT}px`,
                height: `${dragState.item.height * HOUR_HEIGHT}px`,
              }"
              :class="[
                'rounded-lg pointer-events-none',
                dragState.isValid
                  ? 'border-2 border-green-400 bg-green-100 bg-opacity-30'
                  : 'border-2 border-red-400 bg-red-100 bg-opacity-30',
              ]"
            >
              <div
                class="p-2 text-sm font-semibold"
                :class="dragState.isValid ? 'text-green-700' : 'text-red-700'"
              >
                {{ formatHour(dragState.hoverPosition.y) }}
                {{ dragState.isValid ? "✓" : "✗" }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 class="font-semibold text-sm text-blue-900 mb-2">
          💡 Instructions
        </h3>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• Drag events to reschedule them</li>
          <li>• Events snap to 15-minute intervals</li>
          <li>• Can only place events during work hours (8 AM - 6 PM)</li>
          <li>• Click to select, double-click to delete</li>
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
    <kanban-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import { useDragDrop } from "../useDragDrop";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "doing" | "done";
}

const tasks = ref<Task[]>([
  {
    id: "1",
    title: "Design UI mockups",
    description: "Create Figma designs for new feature",
    status: "todo",
  },
  {
    id: "2",
    title: "Implement drag and drop",
    description: "Build reusable composable",
    status: "doing",
  },
  {
    id: "3",
    title: "Write documentation",
    description: "Add examples and API docs",
    status: "doing",
  },
  {
    id: "4",
    title: "Deploy to production",
    description: "Release version 1.0",
    status: "done",
  },
]);

const { dragState, startDrag, endDrag } = useDragDrop({
  unitSize: 60,
  gap: 8,
});

const onDragStart = (event: DragEvent, task: Task) => {
  startDrag(
    event,
    {
      id: task.id,
      width: 1,
      height: 1,
      data: task,
    },
    true,
  );
};

const onDrop = (event: DragEvent, newStatus: Task["status"]) => {
  event.preventDefault();

  if (dragState.value.item?.data) {
    const task = tasks.value.find((t) => t.id === dragState.value.item!.id);
    if (task) {
      task.status = newStatus;
    }
  }

  endDrag();
};

const getColumnTasks = (status: Task["status"]) => {
  return tasks.value.filter((t) => t.status === status);
};

const columnConfig = {
  todo: { label: "À faire", color: "bg-slate-100" },
  doing: { label: "En cours", color: "bg-blue-100" },
  done: { label: "Terminé", color: "bg-green-100" },
};
</script>

<template>
  <div class="w-full h-full p-8 bg-slate-50">
    <h2 class="text-2xl font-bold mb-6">Kanban Board</h2>

    <div class="flex gap-6">
      <div
        v-for="(config, status) in columnConfig"
        :key="status"
        class="flex-1 min-w-0"
      >
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div :class="['px-4 py-3 font-semibold border-b', config.color]">
            {{ config.label }}
            <span class="ml-2 text-sm opacity-70">
              ({{ getColumnTasks(status as Task["status"]).length }})
            </span>
          </div>

          <div
            class="p-4 min-h-[500px] space-y-3"
            @dragover.prevent
            @drop="onDrop($event, status as Task['status'])"
          >
            <div
              v-for="task in getColumnTasks(status as Task['status'])"
              :key="task.id"
              draggable="true"
              @dragstart="onDragStart($event, task)"
              @dragend="endDrag"
              :class="[
                'bg-white border rounded-lg p-4 cursor-move transition-all',
                'hover:shadow-md hover:border-blue-300',
                dragState.isDragging && dragState.item?.id === task.id
                  ? 'opacity-50 scale-95'
                  : 'opacity-100 scale-100',
              ]"
            >
              <h3 class="font-semibold text-sm mb-2">{{ task.title }}</h3>
              <p class="text-xs text-slate-600">{{ task.description }}</p>

              <div class="mt-3 flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-slate-300"></div>
                <span class="text-xs text-slate-500">#{{ task.id }}</span>
              </div>
            </div>

            <div
              v-if="getColumnTasks(status as Task['status']).length === 0"
              class="text-center text-slate-400 text-sm py-8"
            >
              Glissez une tâche ici
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
[draggable="true"] {
  transition:
    transform 0.2s,
    opacity 0.2s,
    box-shadow 0.2s;
}

[draggable="true"]:active {
  cursor: grabbing;
}
</style>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <palette-canvas-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import { useElementBounding } from "@vueuse/core";
import { useDragDrop } from "../useDragDrop";

interface PaletteItem {
  id: string;
  label: string;
  type: string;
  emoji: string;
  color: string;
}

interface PlacedItem {
  id: string;
  x: number;
  y: number;
  type: string;
  emoji: string;
  color: string;
  label: string;
}

const palette: PaletteItem[] = [
  {
    id: "circle",
    label: "Circle",
    type: "circle",
    emoji: "⭕",
    color: "bg-red-100 border-red-300",
  },
  {
    id: "square",
    label: "Square",
    type: "square",
    emoji: "⬜",
    color: "bg-blue-100 border-blue-300",
  },
  {
    id: "star",
    label: "Star",
    type: "star",
    emoji: "⭐",
    color: "bg-yellow-100 border-yellow-300",
  },
  {
    id: "heart",
    label: "Heart",
    type: "heart",
    emoji: "❤️",
    color: "bg-pink-100 border-pink-300",
  },
  {
    id: "diamond",
    label: "Diamond",
    type: "diamond",
    emoji: "💎",
    color: "bg-purple-100 border-purple-300",
  },
  {
    id: "rocket",
    label: "Rocket",
    type: "rocket",
    emoji: "🚀",
    color: "bg-green-100 border-green-300",
  },
];

const canvas = ref<HTMLElement | null>(null);
const canvasBounds = useElementBounding(canvas);

const placedItems = ref<PlacedItem[]>([
  {
    id: "demo-1",
    x: 100,
    y: 100,
    type: "star",
    emoji: "⭐",
    color: "bg-yellow-100 border-yellow-300",
    label: "Star",
  },
]);

const { dragState, startDrag, handleDragOver, endDrag } = useDragDrop({
  unitSize: 80,
  gap: 0,
});

const onDragFromPalette = (event: DragEvent, item: PaletteItem) => {
  startDrag(
    event,
    {
      id: `${item.id}-${Date.now()}`,
      width: 80,
      height: 80,
      data: item,
    },
    false,
  );
};

const onDragFromCanvas = (event: DragEvent, item: PlacedItem) => {
  startDrag(
    event,
    {
      id: item.id,
      width: 80,
      height: 80,
      data: item,
    },
    true,
  );
};

const onCanvasDragOver = (event: DragEvent) => {
  const bounds = {
    left: canvasBounds.left.value,
    top: canvasBounds.top.value,
    right: canvasBounds.right.value,
    bottom: canvasBounds.bottom.value,
    width: canvasBounds.width.value,
    height: canvasBounds.height.value,
  };

  handleDragOver(event, bounds, (virtualBounds) => ({
    x: Math.max(0, Math.round(virtualBounds.left - bounds.left)),
    y: Math.max(0, Math.round(virtualBounds.top - bounds.top)),
  }));
};

const onDropToCanvas = (event: DragEvent) => {
  event.preventDefault();

  if (!dragState.value.item || !dragState.value.hoverPosition) {
    endDrag();
    return;
  }

  if (dragState.value.fromContainer) {
    const item = placedItems.value.find(
      (i) => i.id === dragState.value.item!.id,
    );
    if (item) {
      item.x = dragState.value.hoverPosition.x;
      item.y = dragState.value.hoverPosition.y;
    }
  } else {
    const paletteData = dragState.value.item.data;
    placedItems.value.push({
      id: dragState.value.item.id,
      x: dragState.value.hoverPosition.x,
      y: dragState.value.hoverPosition.y,
      type: paletteData.type,
      emoji: paletteData.emoji,
      color: paletteData.color,
      label: paletteData.label,
    });
  }

  endDrag();
};

const removeItem = (id: string) => {
  placedItems.value = placedItems.value.filter((item) => item.id !== id);
};

const clearCanvas = () => {
  placedItems.value = [];
};

const selectedItem = ref<string | null>(null);
</script>

<template>
  <div class="w-full h-full flex bg-slate-50">
    <aside class="w-64 bg-white border-r p-4 space-y-4">
      <div>
        <h3 class="font-bold text-lg mb-4">Shape Palette</h3>

        <div class="space-y-2">
          <div
            v-for="item in palette"
            :key="item.id"
            draggable="true"
            @dragstart="onDragFromPalette($event, item)"
            @dragend="endDrag"
            :class="[
              'p-4 rounded-lg border-2 cursor-move transition-all',
              'hover:shadow-md hover:scale-105',
              'flex items-center gap-3',
              item.color,
            ]"
          >
            <span class="text-3xl">{{ item.emoji }}</span>
            <span class="font-semibold text-sm">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t">
        <h4 class="font-semibold text-sm mb-3">Canvas Controls</h4>

        <button
          @click="clearCanvas"
          class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
        >
          🗑️ Clear Canvas
        </button>

        <div class="mt-4 text-xs text-slate-600">
          <p class="font-semibold mb-1">Items: {{ placedItems.length }}</p>
        </div>
      </div>

      <div class="pt-4 border-t text-xs text-slate-500">
        <p class="font-semibold mb-2">💡 How to use:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>Drag shapes from palette</li>
          <li>Drop on canvas to place</li>
          <li>Drag placed items to move</li>
          <li>Double-click to remove</li>
        </ul>
      </div>
    </aside>

    <div class="flex-1 p-8">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-2xl font-bold">Canvas</h2>
        <div class="text-sm text-slate-600">
          Drag shapes from the palette to place them on the canvas
        </div>
      </div>

      <div
        ref="canvas"
        class="relative w-full h-[700px] bg-white rounded-lg shadow-lg border-2 border-slate-200 overflow-hidden"
        @dragover="onCanvasDragOver"
        @drop="onDropToCanvas"
      >
        <div
          class="absolute inset-0 pointer-events-none opacity-10"
          style="
            background-image:
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 40px 40px;
          "
        ></div>

        <div
          v-for="item in placedItems"
          :key="item.id"
          :style="{
            position: 'absolute',
            left: `${item.x}px`,
            top: `${item.y}px`,
            width: '80px',
            height: '80px',
          }"
          :class="[
            'border-2 rounded-xl cursor-move transition-all',
            'flex items-center justify-center text-4xl',
            'hover:shadow-lg hover:scale-110',
            item.color,
            dragState.isDragging && dragState.item?.id === item.id
              ? 'opacity-40 scale-95'
              : 'opacity-100',
            selectedItem === item.id ? 'ring-4 ring-blue-400' : '',
          ]"
          draggable="true"
          @dragstart="onDragFromCanvas($event, item)"
          @dragend="endDrag"
          @click="selectedItem = item.id"
          @dblclick="removeItem(item.id)"
          :title="`${item.label} - Double-click to remove`"
        >
          {{ item.emoji }}
        </div>

        <div
          v-if="
            dragState.isDragging && dragState.hoverPosition && dragState.item
          "
          :style="{
            position: 'absolute',
            left: `${dragState.hoverPosition.x}px`,
            top: `${dragState.hoverPosition.y}px`,
            width: '80px',
            height: '80px',
          }"
          class="border-2 border-dashed border-blue-400 bg-blue-100 bg-opacity-40 rounded-xl pointer-events-none flex items-center justify-center text-3xl"
        >
          {{ dragState.item.data?.emoji }}
        </div>

        <div
          v-if="placedItems.length === 0 && !dragState.isDragging"
          class="absolute inset-0 flex items-center justify-center text-slate-400 text-lg"
        >
          <div class="text-center">
            <div class="text-6xl mb-4">👈</div>
            <p>Drag shapes from the palette</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <free-layout-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import { useElementBounding } from "@vueuse/core";
import { useDragDrop } from "../useDragDrop";

interface Widget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "text" | "image" | "button" | "box";
  label: string;
  color: string;
}

const canvas = ref<HTMLElement | null>(null);
const canvasBounds = useElementBounding(canvas);

const widgets = ref<Widget[]>([
  {
    id: "w1",
    x: 50,
    y: 50,
    width: 200,
    height: 100,
    type: "text",
    label: "Text Block",
    color: "bg-blue-100 border-blue-300",
  },
  {
    id: "w2",
    x: 300,
    y: 80,
    width: 150,
    height: 150,
    type: "image",
    label: "🖼️ Image",
    color: "bg-purple-100 border-purple-300",
  },
  {
    id: "w3",
    x: 100,
    y: 250,
    width: 180,
    height: 60,
    type: "button",
    label: "Button Widget",
    color: "bg-green-100 border-green-300",
  },
]);

const selectedWidget = ref<string | null>(null);

const { dragState, startDrag, handleDragOver, endDrag, getVirtualBounds } =
  useDragDrop({
    unitSize: 1,
    gap: 0,
  });

const onDragStart = (event: DragEvent, widget: Widget) => {
  selectedWidget.value = widget.id;

  startDrag(
    event,
    {
      id: widget.id,
      width: widget.width,
      height: widget.height,
      data: widget,
    },
    true,
  );
};

const onDragOver = (event: DragEvent) => {
  const bounds = {
    left: canvasBounds.left.value,
    top: canvasBounds.top.value,
    right: canvasBounds.right.value,
    bottom: canvasBounds.bottom.value,
    width: canvasBounds.width.value,
    height: canvasBounds.height.value,
  };

  handleDragOver(event, bounds, (virtualBounds) => {
    return {
      x: Math.round(virtualBounds.left - bounds.left),
      y: Math.round(virtualBounds.top - bounds.top),
    };
  });
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();

  if (dragState.value.item && dragState.value.hoverPosition) {
    const widget = widgets.value.find((w) => w.id === dragState.value.item!.id);
    if (widget) {
      widget.x = dragState.value.hoverPosition.x;
      widget.y = dragState.value.hoverPosition.y;
    }
  }

  endDrag();
  selectedWidget.value = null;
};

const deleteWidget = (id: string) => {
  widgets.value = widgets.value.filter((w) => w.id !== id);
  if (selectedWidget.value === id) {
    selectedWidget.value = null;
  }
};

const addWidget = (type: Widget["type"]) => {
  const newWidget: Widget = {
    id: `w${Date.now()}`,
    x: 20,
    y: 20,
    width: type === "button" ? 180 : type === "image" ? 150 : 200,
    height: type === "button" ? 60 : type === "image" ? 150 : 100,
    type,
    label:
      type === "text" ? "Text Block" : type === "image" ? "🖼️ Image" : "Button",
    color:
      type === "text"
        ? "bg-blue-100 border-blue-300"
        : type === "image"
          ? "bg-purple-100 border-purple-300"
          : "bg-green-100 border-green-300",
  };

  widgets.value.push(newWidget);
};
</script>

<template>
  <div class="w-full h-full flex bg-slate-50">
    <aside class="w-64 bg-white border-r p-4">
      <h3 class="font-bold text-lg mb-4">Widgets</h3>

      <div class="space-y-2">
        <button
          @click="addWidget('text')"
          class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          ➕ Text Block
        </button>

        <button
          @click="addWidget('image')"
          class="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
        >
          ➕ Image
        </button>

        <button
          @click="addWidget('button')"
          class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          ➕ Button
        </button>
      </div>

      <div v-if="selectedWidget" class="mt-8 p-3 bg-slate-100 rounded">
        <h4 class="font-semibold text-sm mb-2">Selected</h4>
        <p class="text-xs text-slate-600 mb-2">{{ selectedWidget }}</p>
        <button
          @click="deleteWidget(selectedWidget)"
          class="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          🗑️ Delete
        </button>
      </div>

      <div class="mt-8 text-xs text-slate-500">
        <p class="mb-1">💡 Tips:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>Drag widgets to reposition</li>
          <li>Click to select</li>
          <li>Add new widgets from buttons</li>
        </ul>
      </div>
    </aside>

    <div class="flex-1 p-8 overflow-auto">
      <div
        ref="canvas"
        class="relative w-full h-[800px] bg-white rounded-lg shadow-inner border-2 border-dashed border-slate-300"
        @dragover="onDragOver"
        @drop="onDrop"
      >
        <div
          class="absolute inset-0 pointer-events-none opacity-20"
          style="
            background-image:
              linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
            background-size: 20px 20px;
          "
        ></div>

        <div
          v-for="widget in widgets"
          :key="widget.id"
          :style="{
            position: 'absolute',
            left: `${widget.x}px`,
            top: `${widget.y}px`,
            width: `${widget.width}px`,
            height: `${widget.height}px`,
          }"
          :class="[
            'border-2 rounded-lg cursor-move transition-all flex items-center justify-center',
            widget.color,
            selectedWidget === widget.id
              ? 'ring-2 ring-blue-500 ring-offset-2'
              : '',
            dragState.isDragging && dragState.item?.id === widget.id
              ? 'opacity-50'
              : 'opacity-100',
          ]"
          draggable="true"
          @click="selectedWidget = widget.id"
          @dragstart="onDragStart($event, widget)"
          @dragend="endDrag"
        >
          <span class="font-semibold text-sm select-none">{{
            widget.label
          }}</span>
        </div>

        <div
          v-if="
            dragState.isDragging && dragState.hoverPosition && dragState.item
          "
          :style="{
            position: 'absolute',
            left: `${dragState.hoverPosition.x}px`,
            top: `${dragState.hoverPosition.y}px`,
            width: `${dragState.item.width}px`,
            height: `${dragState.item.height}px`,
          }"
          class="border-2 border-blue-400 bg-blue-100 bg-opacity-30 rounded-lg pointer-events-none"
        ></div>
      </div>
    </div>
  </div>
</template>
```
  :::
::

::tip
You can copy and adapt this template for any composable documentation.
::
