---
title: useDragDropContext
description: useDragDropContext - Composable pour accéder au contexte drag-drop fourni par DragDropProvider
---

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop-context.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop-context.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop-context.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop-context.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-drag-drop-context/useDragDropContext.ts"}

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

  ### Returns

Le contexte drag-drop s&#39;il existe, undefined sinon

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `DragDropContext`{.primary .text-primary} | `interface` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
