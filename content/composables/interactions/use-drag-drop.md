---
title: useDragDrop
description: useDragDrop - Composable pour gérer le drag and drop avec intersection précise
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <file-list-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
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

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
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

const { dragState, startDrag, handleDragOverSimple, endDrag } = useDragDrop({
  containerRef: timeline,
  unitSize: HOUR_HEIGHT,
  gap: 0,
  allowCollision: true,
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
  handleDragOverSimple?.(event, (virtualBounds, containerBounds) => {
    const relativeY = virtualBounds.top - containerBounds.top;
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
  const overlapping = events.value.filter((e) => {
    if (e.id === event.id) return false;
    const eventEnd = event.startHour + event.duration;
    const eEnd = e.startHour + e.duration;

    return (
      (event.startHour < eEnd && eventEnd > e.startHour) ||
      (e.startHour < eventEnd && eEnd > event.startHour)
    );
  });

  const allOverlapping = [...overlapping, event].sort(
    (a, b) => a.startHour - b.startHour,
  );

  const columnIndex = allOverlapping.findIndex((e) => e.id === event.id);
  const totalColumns = allOverlapping.length;

  const columnWidth = 100 / totalColumns;
  const leftOffset = columnWidth * columnIndex;

  return {
    position: "absolute" as const,
    left: `calc(80px + ${leftOffset}%)`,
    width: `calc(${columnWidth}% - 20px)`,
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
          <li>• Events can overlap (collision detection disabled)</li>
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

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
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

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref } from "vue";
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

const { dragState, startDrag, handleDragOverSimple, endDrag } = useDragDrop({
  containerRef: canvas,
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
  handleDragOverSimple?.(event, (virtualBounds, containerBounds) => ({
    x: Math.max(0, Math.round(virtualBounds.left - containerBounds.left)),
    y: Math.max(0, Math.round(virtualBounds.top - containerBounds.top)),
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

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref } from "vue";
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

const {
  dragState,
  startDrag,
  handleDragOverSimple,
  endDrag,
  getVirtualBounds,
} = useDragDrop({
  containerRef: canvas,
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
  handleDragOverSimple?.(event, (virtualBounds, containerBounds) => {
    return {
      x: Math.round(virtualBounds.left - containerBounds.left),
      y: Math.round(virtualBounds.top - containerBounds.top),
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

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <adaptive-mode-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue

<script setup lang="ts">
import { ref } from 'vue';
import { useDragDrop } from '../useDragDrop';

interface Card {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number; 
  height: number; 
  color: string;
}

const workspace = ref<HTMLElement | null>(null);

const cards = ref<Card[]>([
  {
    id: 'card-1',
    title: 'Note 1',
    content: 'Cette carte peut être déplacée librement',
    x: 50,
    y: 50,
    width: 250,
    height: 150,
    color: 'bg-yellow-100 border-yellow-300',
  },
  {
    id: 'card-2',
    title: 'Note 2',
    content: 'Chaque carte a sa propre taille',
    x: 350,
    y: 100,
    width: 200,
    height: 120,
    color: 'bg-blue-100 border-blue-300',
  },
  {
    id: 'card-3',
    title: 'Note 3',
    content: 'Pas besoin de définir unitSize !',
    x: 150,
    y: 250,
    width: 300,
    height: 180,
    color: 'bg-pink-100 border-pink-300',
  },
]);


const { dragState, startDrag, handleDragOverSimple, endDrag } = useDragDrop({
  containerRef: workspace,
  gap: 0, 
});

const onDragStart = (event: DragEvent, card: Card) => {
  startDrag(
    event,
    {
      id: card.id,
      width: card.width, 
      height: card.height, 
      data: card,
    },
    true
  );
};

const onDragOver = (event: DragEvent) => {
  handleDragOverSimple?.(event, (virtualBounds, containerBounds) => {
    
    return {
      x: Math.round(virtualBounds.left - containerBounds.left),
      y: Math.round(virtualBounds.top - containerBounds.top),
    };
  });
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();

  if (dragState.value.item && dragState.value.hoverPosition) {
    const card = cards.value.find((c) => c.id === dragState.value.item!.id);
    if (card) {
      card.x = dragState.value.hoverPosition.x;
      card.y = dragState.value.hoverPosition.y;
    }
  }

  endDrag();
};

const selectedCard = ref<string | null>(null);

const addCard = () => {
  const colors = [
    'bg-yellow-100 border-yellow-300',
    'bg-blue-100 border-blue-300',
    'bg-pink-100 border-pink-300',
    'bg-green-100 border-green-300',
    'bg-purple-100 border-purple-300',
  ];

  const randomIndex = Math.floor(Math.random() * colors.length);

  const newCard: Card = {
    id: `card-${Date.now()}`,
    title: 'Nouvelle note',
    content: 'Double-cliquez pour modifier',
    x: 20,
    y: 20,
    width: 250,
    height: 150,
    color: colors[randomIndex]!,
  };

  cards.value.push(newCard);
  selectedCard.value = newCard.id;
};

const removeCard = (id: string) => {
  cards.value = cards.value.filter((c) => c.id !== id);
  if (selectedCard.value === id) {
    selectedCard.value = null;
  }
};

const resizeCard = (card: Card, delta: number) => {
  card.width = Math.max(150, card.width + delta);
  card.height = Math.max(100, card.height + delta);
};
</script>

<template>
  <div class="w-full h-full flex bg-slate-50">
    
    <aside class="w-64 bg-white border-r p-4">
      <h3 class="font-bold text-lg mb-4">Mode Adaptatif</h3>

      <div class="space-y-4">
        <button
          @click="addCard"
          class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          ➕ Ajouter une carte
        </button>

        <div v-if="selectedCard" class="p-3 bg-slate-100 rounded">
          <h4 class="font-semibold text-sm mb-3">Carte sélectionnée</h4>

          <div class="space-y-2">
            <div class="text-xs">
              <span class="text-slate-600">ID:</span>
              <code class="ml-1 text-xs">{{ selectedCard }}</code>
            </div>

            <div class="flex gap-2">
              <button
                @click="resizeCard(cards.find((c) => c.id === selectedCard)!, 20)"
                class="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
              >
                ➕ Agrandir
              </button>
              <button
                @click="resizeCard(cards.find((c) => c.id === selectedCard)!, -20)"
                class="flex-1 px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
              >
                ➖ Réduire
              </button>
            </div>

            <button
              @click="removeCard(selectedCard)"
              class="w-full px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 p-3 bg-blue-50 rounded text-xs">
        <p class="font-semibold text-blue-900 mb-2">✨ Avantages</p>
        <ul class="text-blue-800 space-y-1">
          <li>• Pas besoin de unitSize</li>
          <li>• Chaque item a sa taille</li>
          <li>• Positionnement libre</li>
          <li>• Adapté aux interfaces fluides</li>
        </ul>
      </div>

      <div class="mt-4 p-3 bg-slate-100 rounded text-xs">
        <p class="font-semibold mb-2">📊 Statistiques</p>
        <div class="space-y-1 text-slate-600">
          <div>Cartes: {{ cards.length }}</div>
          <div>Mode: Adaptatif</div>
          <div>unitSize: <code>undefined</code></div>
        </div>
      </div>
    </aside>

    
    <div class="flex-1 p-8">
      <div class="mb-4">
        <h2 class="text-2xl font-bold mb-2">Workspace - Mode Adaptatif</h2>
        <p class="text-sm text-slate-600">
          En mode adaptatif, width et height sont interprétés comme des pixels directement
        </p>
      </div>

      <div
        ref="workspace"
        class="relative w-full h-[700px] bg-white rounded-lg shadow-lg border-2 border-slate-200 overflow-hidden"
        @dragover="onDragOver"
        @drop="onDrop"
      >
        
        <div
          class="absolute inset-0 pointer-events-none opacity-5"
          style="
            background-image:
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
          "
        ></div>

        
        <div
          v-for="card in cards"
          :key="card.id"
          :style="{
            position: 'absolute' as const,
            left: `${card.x}px`,
            top: `${card.y}px`,
            width: `${card.width}px`,
            height: `${card.height}px`,
          }"
          :class="[
            'border-2 rounded-lg cursor-move transition-all p-4',
            'shadow-md hover:shadow-xl',
            card.color,
            selectedCard === card.id ? 'ring-4 ring-blue-400' : '',
            dragState.isDragging && dragState.item?.id === card.id ? 'opacity-40' : 'opacity-100',
          ]"
          draggable="true"
          @dragstart="onDragStart($event, card)"
          @dragend="endDrag"
          @click="selectedCard = card.id"
          @dblclick="removeCard(card.id)"
        >
          <div class="font-bold text-sm mb-2">{{ card.title }}</div>
          <div class="text-xs text-slate-700">{{ card.content }}</div>

          <div class="absolute bottom-2 right-2 text-xs text-slate-400 font-mono">
            {{ card.width }}×{{ card.height }}px
          </div>
        </div>

        
        <div
          v-if="dragState.isDragging && dragState.hoverPosition && dragState.item"
          :style="{
            position: 'absolute' as const,
            left: `${dragState.hoverPosition.x}px`,
            top: `${dragState.hoverPosition.y}px`,
            width: `${dragState.item.width}px`,
            height: `${dragState.item.height}px`,
          }"
          class="border-2 border-dashed border-blue-400 bg-blue-100 bg-opacity-30 rounded-lg pointer-events-none"
        ></div>

        
        <div
          v-if="cards.length === 0"
          class="absolute inset-0 flex items-center justify-center text-slate-400"
        >
          <div class="text-center">
            <div class="text-6xl mb-4">📝</div>
            <p class="text-lg">Ajoutez votre première carte</p>
          </div>
        </div>
      </div>

      
      <div
        class="mt-6 p-4 bg-slate-800 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto"
      >
        <div class="text-green-400 mb-2">
        <div>
          <span class="text-purple-400">const</span> {{ '{' }} dragState, startDrag, handleDragOver,
          endDrag {{ '}' }} = <span class="text-yellow-400">useDragDrop</span>({{ '{' }}
        </div>
        <div class="pl-4 text-slate-400">
        <div class="pl-4">gap: <span class="text-blue-400">0</span>,</div>
        <div>{{ '})' }};</div>
        <div class="mt-2 text-slate-400">
          <div>
          <div>startDrag(event, {{ '{' }} id, width: 250, height: 150 {{ '}' }});</div>
        </div>
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
