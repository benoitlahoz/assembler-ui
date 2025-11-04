<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useElementSize, useDropZone } from '@vueuse/core';
import { useMotion } from '@vueuse/motion';

interface GridItem {
  id: string;
  x: number; // position x dans la grille (0-based)
  y: number; // position y dans la grille (0-based)
  width: number; // largeur en cellules
  height: number; // hauteur en cellules
  component?: any; // composant Vue à rendre
  color?: string; // couleur de fond du contrôleur
}

interface Props {
  cellSize?: number; // taille de base d'une cellule en px
  gap?: number; // espacement entre les cellules en px
  minColumns?: number; // nombre minimum de colonnes
  items?: GridItem[]; // items déjà placés dans la grille
  showGrid?: boolean; // afficher la grille
  snapToGrid?: boolean; // snap automatique à la grille
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
  'update:items': [items: GridItem[]];
  'item-placed': [item: GridItem];
  'item-moved': [item: GridItem];
  'item-removed': [id: string];
}>();

// Refs
const gridContainer = ref<HTMLElement | null>(null);
const placedItems = ref<GridItem[]>([...props.items]);
const hoverCell = ref<{ x: number; y: number } | null>(null);
const draggedItem = ref<GridItem | null>(null);
const draggedFromGrid = ref(false);
const previewSize = ref<{ width: number; height: number } | null>(null);

// Use VueUse pour la taille du conteneur
const { width: gridWidth, height: gridHeight } = useElementSize(gridContainer);

// Computed
const columns = computed(() => {
  const cols = Math.floor(gridWidth.value / (props.cellSize + props.gap));
  return Math.max(cols, props.minColumns);
});

const rows = computed(() => {
  return Math.max(Math.floor(gridHeight.value / (props.cellSize + props.gap)), 6);
});

const gridTemplateColumns = computed(() => {
  return `repeat(${columns.value}, ${props.cellSize}px)`;
});

const gridTemplateRows = computed(() => {
  return `repeat(${rows.value}, ${props.cellSize}px)`;
});

// Vérifie si une cellule est occupée
const isCellOccupied = (x: number, y: number, excludeId?: string): boolean => {
  return placedItems.value.some((item) => {
    if (excludeId && item.id === excludeId) return false;
    return x >= item.x && x < item.x + item.width && y >= item.y && y < item.y + item.height;
  });
};

// Vérifie si un placement est valide
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

// Trouve la première position disponible
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

// Gestion du redimensionnement
const updateGridSize = () => {
  if (gridContainer.value) {
    const rect = gridContainer.value.getBoundingClientRect();
    gridWidth.value = rect.width;
    gridHeight.value = rect.height;
  }
};

// Convertir les coordonnées de la souris en position de grille
const getGridPosition = (clientX: number, clientY: number): { x: number; y: number } => {
  if (!gridContainer.value) return { x: 0, y: 0 };

  const rect = gridContainer.value.getBoundingClientRect();
  const relativeX = clientX - rect.left;
  const relativeY = clientY - rect.top;

  const x = Math.floor(relativeX / (props.cellSize + props.gap));
  const y = Math.floor(relativeY / (props.cellSize + props.gap));

  return {
    x: Math.max(0, Math.min(x, columns.value - 1)),
    y: Math.max(0, Math.min(y, rows.value - 1)),
  };
};

// Drag and Drop handlers
const handleDragStart = (event: DragEvent, item: GridItem, fromGrid = false) => {
  draggedItem.value = { ...item };
  draggedFromGrid.value = fromGrid;
  previewSize.value = { width: item.width, height: item.height };

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('application/json', JSON.stringify(item));
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();

  // Pour les items externes, essayer de lire la taille depuis les types de données
  if (!draggedItem.value && event.dataTransfer) {
    // On ne peut pas lire getData() ici, mais on peut vérifier les types
    const types = event.dataTransfer.types;
    if (types.includes('application/json')) {
      // C'est probablement un drag valide, on accepte
      // On utilisera une taille par défaut pour le preview
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

  // Si on a un draggedItem (drag interne), on peut valider précisément
  if (draggedItem.value) {
    const excludeId = draggedFromGrid.value ? draggedItem.value.id : undefined;

    if (
      isValidPlacement(pos.x, pos.y, draggedItem.value.width, draggedItem.value.height, excludeId)
    ) {
      hoverCell.value = pos;
    } else {
      hoverCell.value = null;
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'none';
      }
    }
  } else if (previewSize.value) {
    // Pour drag externe, montrer la position avec taille par défaut
    // On validera précisément dans handleDrop
    hoverCell.value = pos;
  }
};

const handleDragLeave = (event: DragEvent) => {
  // Vérifier si on quitte vraiment la grille (relatedTarget est en dehors)
  const relatedTarget = event.relatedTarget as HTMLElement | null;
  if (!relatedTarget || !gridContainer.value?.contains(relatedTarget)) {
    hoverCell.value = null;
    // Ne pas clear previewSize ici car on en a besoin pour le drop
  }
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  // Accepter le drag (copy ou move)
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
  draggedItem.value = null;
  hoverCell.value = null;
  draggedFromGrid.value = false;
  previewSize.value = null;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();

  let itemToDrop: GridItem | null = draggedItem.value;

  // Si on n'a pas déjà un draggedItem (drag externe), le récupérer depuis dataTransfer
  if (!itemToDrop && event.dataTransfer) {
    try {
      const data = event.dataTransfer.getData('application/json');
      if (data) {
        itemToDrop = JSON.parse(data);
        // Mettre à jour previewSize avec la vraie taille
        if (itemToDrop) {
          previewSize.value = { width: itemToDrop.width, height: itemToDrop.height };
        }
      }
    } catch (e) {
      console.error('Erreur lors du parsing des données de drag:', e);
      draggedItem.value = null;
      hoverCell.value = null;
      draggedFromGrid.value = false;
      previewSize.value = null;
      return;
    }
  }

  if (!itemToDrop || !hoverCell.value) {
    // Reset state
    draggedItem.value = null;
    hoverCell.value = null;
    draggedFromGrid.value = false;
    previewSize.value = null;
    return;
  }

  // Valider le placement une dernière fois
  const excludeId = draggedFromGrid.value ? itemToDrop.id : undefined;
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
    // Déplacement d'un item existant
    const index = placedItems.value.findIndex((item) => item.id === newItem.id);
    if (index !== -1) {
      placedItems.value[index] = newItem;
      emit('item-moved', newItem);
    }
  } else {
    // Nouvel item
    placedItems.value.push(newItem);
    emit('item-placed', newItem);
  }

  emit('update:items', placedItems.value);

  draggedItem.value = null;
  hoverCell.value = null;
  draggedFromGrid.value = false;
  previewSize.value = null;
};

const removeItem = (id: string) => {
  const index = placedItems.value.findIndex((item) => item.id === id);
  if (index !== -1) {
    placedItems.value.splice(index, 1);
    emit('item-removed', id);
    emit('update:items', placedItems.value);
  }
};

// Lifecycle
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

// Expose pour permettre l'ajout programmatique
defineExpose({
  addItem: (item: Omit<GridItem, 'x' | 'y'>) => {
    const position = findAvailablePosition(item.width, item.height);
    if (position) {
      const newItem: GridItem = { ...item, ...position } as GridItem;
      placedItems.value.push(newItem);
      emit('item-placed', newItem);
      emit('update:items', placedItems.value);
      return newItem;
    }
    return null;
  },
  removeItem,
  clearGrid: () => {
    placedItems.value = [];
    emit('update:items', []);
  },
});
</script>

<template>
  <div
    ref="gridContainer"
    class="controllers-grid"
    :class="{ 'show-grid': showGrid }"
    :style="{
      '--cell-size': `${cellSize}px`,
      '--gap-size': `${gap}px`,
    }"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <!-- Grille de fond -->
    <div class="grid-background">
      <!-- Aperçu du placement lors du drag -->
      <div
        v-if="hoverCell && (draggedItem || previewSize)"
        class="grid-item-preview"
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 150 } }"
        :style="{
          position: 'absolute',
          left: `calc(var(--spacing, 1rem) + ${hoverCell.x} * (var(--cell-size) + var(--gap-size)))`,
          top: `calc(var(--spacing, 1rem) + ${hoverCell.y} * (var(--cell-size) + var(--gap-size)))`,
          width: `calc(${draggedItem?.width || previewSize?.width || 1} * var(--cell-size) + ${(draggedItem?.width || previewSize?.width || 1) - 1} * var(--gap-size))`,
          height: `calc(${draggedItem?.height || previewSize?.height || 1} * var(--cell-size) + ${(draggedItem?.height || previewSize?.height || 1) - 1} * var(--gap-size))`,
        }"
      />
    </div>

    <!-- Items placés -->
    <div
      class="grid-items"
      :style="{
        gridTemplateColumns,
        gridTemplateRows,
        gap: `${gap}px`,
      }"
    >
      <div
        v-for="item in placedItems"
        :key="item.id"
        class="grid-item"
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
          class="grid-item-content"
          draggable="false"
          :style="{
            backgroundColor: item.color || 'hsl(var(--card))',
          }"
        >
          <button class="grid-item-remove" @click.stop="removeItem(item.id)" aria-label="Supprimer">
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

          <div class="grid-item-body">
            <component v-if="item.component" :is="item.component" v-bind="item" />
            <div v-else class="grid-item-placeholder">
              <span class="text-sm text-muted-foreground">{{ item.id }}</span>
              <span class="text-xs text-muted-foreground">
                {{ item.width }}x{{ item.height }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Slot pour le contenu additionnel ou des actions -->
    <slot :columns="columns" :rows="rows" :placed-items="placedItems" />
  </div>
</template>

<style scoped>
.controllers-grid {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  overflow: auto;
  background-color: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
}

.grid-background {
  position: absolute;
  inset: 0;
  padding: var(--spacing, 1rem);
  pointer-events: none;
}

.show-grid .grid-background {
  background-image: radial-gradient(circle, hsl(var(--border) / 0.5) 2px, transparent 2px);
  background-size: calc(var(--cell-size) + var(--gap-size)) calc(var(--cell-size) + var(--gap-size));
  background-position: var(--spacing, 1rem) var(--spacing, 1rem);
}

.grid-cell {
  display: none;
}

.grid-item-preview {
  background-color: hsl(var(--primary) / 0.1);
  border: 2px dashed hsl(var(--primary));
  border-radius: 8px;
  pointer-events: none;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

.grid-items {
  position: relative;
  display: grid;
  padding: var(--spacing, 1rem);
  z-index: 1;
}

.grid-item {
  position: relative;
  cursor: move;
  user-select: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.grid-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px hsl(var(--foreground) / 0.1);
}

.grid-item:active {
  cursor: grabbing;
  opacity: 0.7;
}

.grid-item-content {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.grid-item-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s ease;
  transform: scale(0.8);
}

.grid-item:hover .grid-item-remove {
  opacity: 1;
  transform: scale(1);
}

.grid-item-remove:hover {
  background-color: hsl(var(--destructive) / 0.9);
  transform: scale(1.1);
}

.grid-item-remove:active {
  transform: scale(0.95);
}

.grid-item-body {
  flex: 1;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.grid-item-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  color: hsl(var(--muted-foreground));
}

/* États de drag */
.controllers-grid.drag-over {
  border-color: hsl(var(--primary));
  background-color: hsl(var(--primary) / 0.05);
}
</style>
