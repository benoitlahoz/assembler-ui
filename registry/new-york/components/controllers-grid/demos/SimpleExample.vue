<script setup lang="ts">
import { ref } from 'vue';
import { ControllersGrid } from '..';

interface GridItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  component?: any;
}

// Référence à la grille
const grid = ref<InstanceType<typeof ControllersGrid> | null>(null);

// Items actuellement dans la grille
const gridItems = ref<GridItem[]>([]);

// Composants disponibles pour le drag and drop
const availableComponents = [
  { id: 'btn-1', width: 1, height: 1, label: 'Bouton 1x1', color: '#3b82f6' },
  { id: 'btn-2', width: 2, height: 1, label: 'Bouton 2x1', color: '#8b5cf6' },
  { id: 'slider-1', width: 2, height: 1, label: 'Slider 2x1', color: '#ec4899' },
  { id: 'knob-1', width: 1, height: 1, label: 'Knob 1x1', color: '#f59e0b' },
  { id: 'meter-1', width: 1, height: 2, label: 'Meter 1x2', color: '#10b981' },
  { id: 'pad-1', width: 2, height: 2, label: 'Pad 2x2', color: '#ef4444' },
];

// Compteur pour générer des IDs uniques
let itemCounter = 0;

// Créer un nouvel item à partir d'un template
const createItemFromTemplate = (template: (typeof availableComponents)[0]) => {
  return {
    id: `${template.id}-${itemCounter++}`,
    width: template.width,
    height: template.height,
    component: null, // On pourrait passer un vrai composant ici
    label: template.label,
    color: template.color,
  };
};

// Gestion du drag depuis la palette
const handlePaletteDragStart = (event: DragEvent, template: (typeof availableComponents)[0]) => {
  const item = createItemFromTemplate(template);
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(item));
  }
};

// Handlers d'événements
const handleItemPlaced = (item: GridItem) => {
  console.log('Item placé:', item);
};

const handleItemMoved = (item: GridItem) => {
  console.log('Item déplacé:', item);
};

const handleItemRemoved = (id: string) => {
  console.log('Item supprimé:', id);
};

// Actions
const clearGrid = () => {
  grid.value?.clearGrid();
};

const addRandomItem = () => {
  const template = availableComponents[Math.floor(Math.random() * availableComponents.length)];
  if (template) {
    const item = createItemFromTemplate(template);
    grid.value?.addItem(item);
  }
};

const exportConfig = () => {
  console.log('Configuration actuelle:', JSON.stringify(gridItems.value, null, 2));
  alert('Configuration exportée dans la console');
};
</script>

<template>
  <div class="example-container">
    <div class="example-header">
      <h2 class="text-2xl font-bold">Grille de Contrôleurs</h2>
      <div class="example-actions">
        <button class="btn btn-secondary" @click="addRandomItem">Ajouter aléatoire</button>
        <button class="btn btn-secondary" @click="exportConfig">Exporter config</button>
        <button class="btn btn-destructive" @click="clearGrid">Effacer tout</button>
      </div>
    </div>

    <div class="example-content">
      <!-- Palette de composants -->
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
            <span class="palette-item-size">{{ component.width }}×{{ component.height }}</span>
          </div>
        </div>

        <div class="palette-info">
          <p class="text-xs text-muted-foreground">
            💡 Astuce : Vous pouvez aussi déplacer les items déjà placés dans la grille
          </p>
        </div>
      </aside>

      <!-- Grille -->
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

/* Palette de composants */
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

/* Grille */
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

/* Boutons */
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

/* Responsive */
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
