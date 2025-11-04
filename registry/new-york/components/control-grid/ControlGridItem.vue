<script setup lang="ts">
/**
 * Example child component that uses injected grid state and methods
 */

import { inject, computed, type Ref } from 'vue';
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
} from '.';

// Inject grid state
const items = inject(ControlGridItemsKey) as Ref<GridItem[]> | undefined;
const config = inject(ControlGridConfigKey) as Ref<GridConfig> | undefined;
const hoverPosition = inject(ControlGridHoverKey) as Ref<GridPosition | null> | undefined;
const dragState = inject(ControlGridDragStateKey) as Ref<DragState> | undefined;

// Inject methods
const addItem = inject(ControlGridAddItemKey);
const removeItem = inject(ControlGridRemoveItemKey);
const clearGrid = inject(ControlGridClearGridKey);

// Computed
const itemCount = computed(() => items?.value.length || 0);
const gridSize = computed(() => {
  if (!config?.value) return 'N/A';
  return `${config.value.columns} × ${config.value.rows}`;
});

// Methods using injected functions
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
