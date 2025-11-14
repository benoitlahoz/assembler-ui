<script setup lang="ts">
import { ref, computed, type Ref } from 'vue';
import DragDropProvider from '../DragDropProvider.vue';
import { DragDropUtils } from '../~~/registry/new-york/composables/use-drag-drop/useDragDrop';

const CELL_SIZE = 80;
const GAP = 8;
const COLUMNS = 6;
const ROWS = 5;

const gridContainer: Ref<HTMLElement | null> = ref(null);

const items = ref([
  { id: '1', x: 0, y: 0, width: 2, height: 1, label: 'Header', color: 'bg-blue-500' },
  { id: '2', x: 2, y: 0, width: 2, height: 2, label: 'Hero', color: 'bg-purple-500' },
  { id: '3', x: 0, y: 1, width: 2, height: 1, label: 'Nav', color: 'bg-green-500' },
  { id: '4', x: 4, y: 0, width: 2, height: 1, label: 'Search', color: 'bg-cyan-500' },
  { id: '5', x: 0, y: 2, width: 4, height: 2, label: 'Content', color: 'bg-indigo-500' },
  { id: '6', x: 4, y: 1, width: 2, height: 3, label: 'Ads', color: 'bg-rose-500' },
  { id: '7', x: 0, y: 4, width: 2, height: 1, label: 'Footer L', color: 'bg-slate-500' },
  { id: '8', x: 2, y: 4, width: 2, height: 1, label: 'Footer R', color: 'bg-slate-500' },
]);

// Validation de placement dans la grille
const validatePlacement = (
  x: number,
  y: number,
  width: number,
  height: number,
  excludeId?: string
) => {
  console.log('🔍 validatePlacement called:', { x, y, width, height, excludeId });

  // Vérifier les limites de la grille
  if (x < 0 || y < 0 || x + width > COLUMNS || y + height > ROWS) {
    console.log('❌ HORS LIMITES:', { x, y, width, height, COLUMNS, ROWS, sum: x + width });
    return false;
  }

  // Vérifier les collisions
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

  console.log('✅ PLACEMENT VALIDE');
  return true;
};

const stats = computed(() => ({
  totalItems: items.value.length,
  totalCells: COLUMNS * ROWS,
  usedCells: items.value.reduce((sum, item) => sum + item.width * item.height, 0),
  freeCells: COLUMNS * ROWS - items.value.reduce((sum, item) => sum + item.width * item.height, 0),
}));

// Générer la liste de toutes les cellules pour afficher les cases vides
const allCells = computed(() => {
  const cells = [];
  const occupied = new Set<string>();

  // Marquer toutes les cellules occupées
  for (const item of items.value) {
    for (let dy = 0; dy < item.height; dy++) {
      for (let dx = 0; dx < item.width; dx++) {
        occupied.add(`${item.x + dx},${item.y + dy}`);
      }
    }
  }

  // Créer toutes les cellules
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

// Version debug de getPositionByIntersection
const getPositionByIntersectionDebug = (virtualBounds: any, containerBounds: any) => {
  console.log('🎯 getPositionByIntersectionDebug appelée!');
  console.log('🔍 Container bounds:', containerBounds);
  console.log('🔍 Virtual bounds:', virtualBounds);
  console.log('🔍 Config:', { CELL_SIZE, GAP, COLUMNS, ROWS });

  const result = DragDropUtils.getPositionByIntersection(
    virtualBounds,
    containerBounds,
    CELL_SIZE,
    GAP,
    COLUMNS,
    ROWS
  );

  console.log('🔍 Calculated position:', result);
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

      <!-- Stats -->
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-blue-600">{{ stats.totalItems }}</div>
          <div class="text-xs text-gray-600">Items</div>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-green-600">{{ stats.usedCells }}</div>
          <div class="text-xs text-gray-600">Cellules occupées</div>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-orange-600">{{ stats.freeCells }}</div>
          <div class="text-xs text-gray-600">Cellules libres</div>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="text-2xl font-bold text-purple-600">{{ COLUMNS }}×{{ ROWS }}</div>
          <div class="text-xs text-gray-600">Grille</div>
        </div>
      </div>

      <!-- Grid avec Provider -->
      <DragDropProvider
        :container-ref="gridContainer as any"
        :unit-size="CELL_SIZE"
        :gap="GAP"
        :validate-placement="validatePlacement"
      >
        <template
          #default="{ dragState, startDrag, handleDragOverSimple, endDrag, containerBounds }"
        >
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
                  if (dragState.item && dragState.hoverPosition && dragState.isValid) {
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
              <!-- Cellules vides (indicateurs visuels) -->
              <div
                v-for="cell in allCells"
                :key="cell.key"
                :style="{
                  gridColumn: `${cell.x + 1} / span 1`,
                  gridRow: `${cell.y + 1} / span 1`,
                }"
                class="border border-dashed border-slate-300 rounded pointer-events-none bg-slate-50"
              />

              <!-- Grid items -->
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
                      true
                    );
                  }
                "
                @dragend="endDrag"
              >
                <div class="font-semibold text-white">{{ item.label }}</div>
                <div class="text-xs text-white opacity-75">{{ item.width }}×{{ item.height }}</div>
              </div>

              <!-- Hover preview -->
              <div
                v-if="dragState.isDragging && dragState.hoverPosition && dragState.item"
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
                  {{ dragState.isValid ? '✓' : '✗' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Debug -->
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
                Position: ({{ dragState.hoverPosition.x }}, {{ dragState.hoverPosition.y }})
              </div>
              <div v-if="dragState.isDragging">Valid: {{ dragState.isValid }}</div>
            </div>
          </div>
        </template>
      </DragDropProvider>

      <!-- Instructions -->
      <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 class="font-semibold text-sm text-yellow-900 mb-2">💡 Instructions</h3>
        <ul class="text-sm text-yellow-800 space-y-1">
          <li>• Drag les items pour les repositionner dans la grille</li>
          <li>• Les items ne peuvent pas se chevaucher (validation de collision)</li>
          <li>• Vert = placement valide, Rouge = placement invalide</li>
          <li>• Les items gardent leur taille lors du déplacement</li>
          <li>• Le provider centralise la configuration pour tous les items</li>
        </ul>
      </div>
    </div>
  </div>
</template>
