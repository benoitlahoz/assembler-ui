<script setup lang="ts">
/**
 * The ControlGrid component provides a drag-and-drop grid system
 * for placing and managing control components.
 */

import { provide, watch, onMounted, computed, ref, type Ref } from 'vue';
import { useElementSize } from '@vueuse/core';
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
} from '.';

export interface ControlGridProps {
  /**
   * Base size of a cell in pixels.
   */
  cellSize?: number;
  /**
   * Gap between cells in pixels.
   */
  gap?: number;
  /**
   * Minimum number of columns.
   */
  minColumns?: number;
  /**
   * Items already placed in the grid.
   */
  items?: GridItem[];
  /**
   * Show the grid background.
   */
  showGrid?: boolean;
  /**
   * Enable automatic snapping to grid.
   */
  snapToGrid?: boolean;
  /**
   * Components to register in the grid.
   */
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
  'update:items': [items: GridItem[]];
  'item-placed': [item: GridItem];
  'item-moved': [item: GridItem];
  'item-removed': [id: string];
  'config-changed': [config: GridConfig];
}>();

// Refs
const gridContainer = ref<HTMLElement | null>(null);
const placedItems = ref<GridItem[]>([...props.items]);
const hoverCell = ref<GridPosition | null>(null);
const dragState = ref<DragState>({
  item: null,
  fromGrid: false,
  hoverPosition: null,
  isValid: false,
});
const previewSize = ref<{ width: number; height: number } | null>(null);

// Registre des composants
const componentRegistry = ref<Map<string, any>>(new Map());

// Use VueUse pour la taille du conteneur
const { width: gridWidth, height: gridHeight } = useElementSize(gridContainer);

// Configuration calculée
const gridConfig = computed<GridConfig>(() => {
  const cols = Math.floor(gridWidth.value / (props.cellSize + props.gap));
  const calculatedColumns = Math.max(cols, props.minColumns);
  const calculatedRows = Math.max(Math.floor(gridHeight.value / (props.cellSize + props.gap)), 6);

  return {
    cellSize: props.cellSize,
    gap: props.gap,
    columns: calculatedColumns,
    rows: calculatedRows,
    width: gridWidth.value,
    height: gridHeight.value,
  };
});

// Computed helpers
const columns = computed(() => gridConfig.value.columns);
const rows = computed(() => gridConfig.value.rows);

const gridTemplateColumns = computed(() => {
  return `repeat(${columns.value}, ${props.cellSize}px)`;
});

const gridTemplateRows = computed(() => {
  return `repeat(${rows.value}, ${props.cellSize}px)`;
});

// Grid logic methods
const isCellOccupied = (x: number, y: number, excludeId?: string): boolean => {
  return placedItems.value.some((item) => {
    if (excludeId && item.id === excludeId) return false;
    return x >= item.x && x < item.x + item.width && y >= item.y && y < item.y + item.height;
  });
};

const isValidPlacement = (
  x: number,
  y: number,
  width: number,
  height: number,
  excludeId?: string
): boolean => {
  // Vérifie les limites de la grille
  if (x < 0 || y < 0 || x + width > columns.value || y + height > rows.value) {
    return false;
  }

  // Vérifie les chevauchements
  for (let dx = 0; dx < width; dx++) {
    for (let dy = 0; dy < height; dy++) {
      if (isCellOccupied(x + dx, y + dy, excludeId)) {
        return false;
      }
    }
  }

  return true;
};

const findAvailablePosition = (width: number, height: number): { x: number; y: number } | null => {
  for (let y = 0; y <= rows.value - height; y++) {
    for (let x = 0; x <= columns.value - width; x++) {
      if (isValidPlacement(x, y, width, height)) {
        return { x, y };
      }
    }
  }
  return null;
};

const getGridPosition = (clientX: number, clientY: number): { x: number; y: number } => {
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

// Exposed methods
const addItem = (item: Omit<GridItem, 'x' | 'y'>): GridItem | null => {
  const position = findAvailablePosition(item.width, item.height);
  if (position) {
    const newItem: GridItem = { ...item, ...position } as GridItem;
    placedItems.value.push(newItem);
    emit('item-placed', newItem);
    emit('update:items', placedItems.value);
    return newItem;
  }
  return null;
};

const addItemByComponent = (
  componentName: string,
  width: number = 1,
  height: number = 1,
  additionalProps?: Record<string, any>
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
    emit('item-placed', newItem);
    emit('update:items', placedItems.value);
    return newItem;
  }
  return null;
};

const removeItem = (id: string): void => {
  const index = placedItems.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    placedItems.value.splice(index, 1);
    emit('item-removed', id);
    emit('update:items', placedItems.value);
  }
};

const clearGrid = (): void => {
  placedItems.value = [];
  emit('update:items', []);
};

const getComponent = (name: string): any | undefined => {
  return componentRegistry.value.get(name);
};

const getRegisteredComponents = (): string[] => {
  return Array.from(componentRegistry.value.keys());
};

// Drag and Drop handlers
const handleDragStart = (event: DragEvent, item: GridItem, fromGrid = false) => {
  dragState.value.item = { ...item };
  dragState.value.fromGrid = fromGrid;
  previewSize.value = { width: item.width, height: item.height };

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(item));
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();

  if (!dragState.value.item && event.dataTransfer) {
    const types = event.dataTransfer.types;
    if (types.includes('application/json')) {
      previewSize.value = { width: 1, height: 1 };
    }
  }

  if (event.dataTransfer) {
    const effect = event.dataTransfer.effectAllowed;
    if (effect === 'copy' || effect === 'copyMove') {
      event.dataTransfer.dropEffect = 'copy';
    } else {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  const pos = getGridPosition(event.clientX, event.clientY);

  if (dragState.value.item) {
    const excludeId = dragState.value.fromGrid ? dragState.value.item.id : undefined;

    if (
      isValidPlacement(
        pos.x,
        pos.y,
        dragState.value.item.width,
        dragState.value.item.height,
        excludeId
      )
    ) {
      hoverCell.value = pos;
      dragState.value.hoverPosition = pos;
      dragState.value.isValid = true;
    } else {
      hoverCell.value = null;
      dragState.value.hoverPosition = null;
      dragState.value.isValid = false;
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'none';
      }
    }
  } else if (previewSize.value) {
    hoverCell.value = pos;
    dragState.value.hoverPosition = pos;
  }
};

const handleDragLeave = (event: DragEvent) => {
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
    if (effect === 'copy' || effect === 'copyMove') {
      event.dataTransfer.dropEffect = 'copy';
    } else {
      event.dataTransfer.dropEffect = 'move';
    }
  }
};

const handleDragEnd = () => {
  dragState.value.item = null;
  hoverCell.value = null;
  dragState.value.fromGrid = false;
  dragState.value.hoverPosition = null;
  dragState.value.isValid = false;
  previewSize.value = null;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();

  let itemToDrop: GridItem | null = dragState.value.item;

  if (!itemToDrop && event.dataTransfer) {
    try {
      const data = event.dataTransfer.getData('application/json');
      if (data) {
        itemToDrop = JSON.parse(data);
        if (itemToDrop) {
          previewSize.value = { width: itemToDrop.width, height: itemToDrop.height };
        }
      }
    } catch (e) {
      console.error('Erreur lors du parsing des données de drag:', e);
      handleDragEnd();
      return;
    }
  }

  if (!itemToDrop || !hoverCell.value) {
    handleDragEnd();
    return;
  }

  const excludeId = dragState.value.fromGrid ? itemToDrop.id : undefined;
  if (
    !isValidPlacement(
      hoverCell.value.x,
      hoverCell.value.y,
      itemToDrop.width,
      itemToDrop.height,
      excludeId
    )
  ) {
    console.warn('Placement invalide');
    handleDragEnd();
    return;
  }

  const newItem: GridItem = {
    ...itemToDrop,
    x: hoverCell.value.x,
    y: hoverCell.value.y,
  };

  if (dragState.value.fromGrid) {
    const index = placedItems.value.findIndex((item) => item.id === newItem.id);
    if (index !== -1) {
      placedItems.value[index] = newItem;
      emit('item-moved', newItem);
    }
  } else {
    placedItems.value.push(newItem);
    emit('item-placed', newItem);
  }

  emit('update:items', placedItems.value);
  handleDragEnd();
};

/**
 * Provide grid state and controls to child components.
 */

/** Items placés dans la grille */
provide<Ref<GridItem[]>>(ControlGridItemsKey, placedItems);

/** Configuration de la grille */
provide<Ref<GridConfig>>(ControlGridConfigKey, gridConfig);

/** Position de survol actuelle */
provide<Ref<GridPosition | null>>(ControlGridHoverKey, hoverCell);

/** État du drag en cours */
provide<Ref<DragState>>(ControlGridDragStateKey, dragState);

/** Registre des composants */
provide<Ref<Map<string, any>>>(ControlGridComponentRegistryKey, componentRegistry);

/** Méthodes exposées */
provide(ControlGridAddItemKey, addItem);
provide(ControlGridAddItemByComponentKey, addItemByComponent);
provide(ControlGridRemoveItemKey, removeItem);
provide(ControlGridClearGridKey, clearGrid);
provide(ControlGridGetComponentKey, getComponent);
provide(ControlGridGetRegisteredComponentsKey, getRegisteredComponents);

/**
 * Watch for changes in props and update accordingly.
 */
watch(
  () => props.items,
  (newItems) => {
    placedItems.value = [...newItems];
  },
  { deep: true }
);

watch(
  () => props.components,
  (newComponents) => {
    componentRegistry.value.clear();
    newComponents.forEach(({ name, component }) => {
      componentRegistry.value.set(name, component);
    });
  },
  { deep: true, immediate: true }
);

watch(
  gridConfig,
  (newConfig) => {
    emit('config-changed', newConfig);
  },
  { deep: true }
);

/**
 * Initialize on mount.
 */
onMounted(() => {
  // Enregistrer les composants initiaux
  props.components.forEach(({ name, component }) => {
    componentRegistry.value.set(name, component);
  });
});

// Expose methods for programmatic access
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
    <!-- Slot pour la toolbar (optionnel) -->
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

    <!-- Grille principale -->
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
      <!-- Items placés -->
      <div
        class="relative grid z-1"
        :style="{
          gridTemplateColumns,
          gridTemplateRows,
          gap: `${gap}px`,
          padding: `${gap}px`,
        }"
      >
        <!-- Aperçu du placement lors du drag -->
        <div
          v-if="hoverCell && (dragState.item || previewSize)"
          class="bg-primary/10 border-2 border-dashed border-primary rounded-lg pointer-events-none animate-pulse-subtle"
          :style="{
            gridColumn: `${hoverCell.x + 1} / span ${dragState.item?.width || previewSize?.width || 1}`,
            gridRow: `${hoverCell.y + 1} / span ${dragState.item?.height || previewSize?.height || 1}`,
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

            <div class="flex-1 p-2 flex items-center justify-center overflow-hidden">
              <component v-if="item.component" :is="item.component" v-bind="item" />
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

      <!-- Slot pour le contenu additionnel -->
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

/* Hover state pour le bouton remove au niveau du parent */
.grid-item-wrapper:hover .grid-item-remove {
  opacity: 1 !important;
  transform: scale(1) !important;
}
</style>
