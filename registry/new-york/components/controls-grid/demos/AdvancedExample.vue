<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, shallowRef, h, computed } from 'vue';
import { ControlsGrid } from '..';
import { useControlRegistry } from '~~/registry/new-york/composables/use-control-registry';
import { ControlButton } from '~~/registry/new-york/components/control-button';
import type { ControlDefinition } from '~~/registry/new-york/composables/use-control-registry';

// Initialiser le registre de contrôles
const { registerControls, getAllControls, createControlInstance } = useControlRegistry();

// Créer un composant wrapper pour ControlButton avec icône
const createButtonComponent = (icon: string) => {
  return {
    name: 'GridControlButton',
    props: ['color', 'variant', 'shape'],
    setup(props: any) {
      return () =>
        h(
          ControlButton,
          {
            color: props.color,
            variant: props.variant || 'default',
            shape: props.shape || 'square',
          },
          () => h('span', { class: 'text-lg font-bold' }, icon)
        );
    },
  };
};

// Définir les contrôles
const controlDefinitions: ControlDefinition[] = [
  {
    id: 'button',
    name: '🎛️ Button',
    component: shallowRef(createButtonComponent('●')),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: '#3b82f6', variant: 'default', shape: 'square' },
    category: 'basic',
    color: '#3b82f6',
  },
  {
    id: 'fader',
    name: '🎚️ Fader',
    component: shallowRef(createButtonComponent('▮')),
    defaultSize: { width: 1, height: 2 },
    defaultProps: { color: '#8b5cf6', variant: 'default', shape: 'square' },
    category: 'basic',
    color: '#8b5cf6',
  },
  {
    id: 'knob',
    name: '🎛️ Knob',
    component: shallowRef(createButtonComponent('◉')),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: '#ec4899', variant: 'default', shape: 'circle' },
    category: 'basic',
    color: '#ec4899',
  },
  {
    id: 'slider',
    name: '⬌ Slider',
    component: shallowRef(createButtonComponent('⬌')),
    defaultSize: { width: 2, height: 1 },
    defaultProps: { color: '#f59e0b', variant: 'outline', shape: 'square' },
    category: 'basic',
    color: '#f59e0b',
  },
  {
    id: 'xy-pad',
    name: '⊞ XY Pad',
    component: shallowRef(createButtonComponent('⊞')),
    defaultSize: { width: 2, height: 2 },
    defaultProps: { color: '#ef4444', variant: 'solid', shape: 'square' },
    category: 'advanced',
    color: '#ef4444',
  },
  {
    id: 'meter',
    name: '📊 Meter',
    component: shallowRef(createButtonComponent('📊')),
    defaultSize: { width: 1, height: 2 },
    defaultProps: { color: '#10b981', variant: 'ghost', shape: 'square' },
    category: 'display',
    color: '#10b981',
  },
  {
    id: 'display',
    name: '📺 Display',
    component: shallowRef(createButtonComponent('📺')),
    defaultSize: { width: 2, height: 1 },
    defaultProps: { color: '#06b6d4', variant: 'outline', shape: 'square' },
    category: 'display',
    color: '#06b6d4',
  },
  {
    id: 'keyboard',
    name: '🎹 Keyboard',
    component: shallowRef(createButtonComponent('🎹')),
    defaultSize: { width: 4, height: 2 },
    defaultProps: { color: '#6366f1', variant: 'default', shape: 'square' },
    category: 'advanced',
    color: '#6366f1',
  },
];

// État du composant
const grid = ref<InstanceType<typeof ControlsGrid> | null>(null);
const items = ref<any[]>([]);
const availableControls = ref<ControlDefinition[]>([]);
const selectedItemId = ref<string | null>(null);
const historyIndex = ref(-1);
const history = ref<any[][]>([]);

// État local
const showGrid = ref(true);
const cellSize = ref(100);
const gap = ref(12);
const autoSave = ref(false);

// Computed
const canUndo = computed(() => historyIndex.value > 0);
const canRedo = computed(() => historyIndex.value < history.value.length - 1);
const totalArea = computed(() =>
  items.value.reduce((sum, item) => sum + item.width * item.height, 0)
);

// Fonctions d'historique
const saveToHistory = () => {
  history.value = history.value.slice(0, historyIndex.value + 1);
  history.value.push(JSON.parse(JSON.stringify(items.value)));
  historyIndex.value = history.value.length - 1;
};

const undo = () => {
  if (canUndo.value) {
    historyIndex.value--;
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]));
  }
};

const redo = () => {
  if (canRedo.value) {
    historyIndex.value++;
    items.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]));
  }
};

const clearItems = () => {
  items.value = [];
  saveToHistory();
};

const duplicateItem = (id: string) => {
  const item = items.value.find((i) => i.id === id);
  if (item) {
    const newItem = { ...item, id: `${item.controlId}-${Date.now()}` };
    grid.value?.addItem(newItem as any);
  }
};

const selectItem = (id: string | null) => {
  selectedItemId.value = id;
};

const saveToLocalStorage = () => {
  localStorage.setItem('controls-grid-items', JSON.stringify(items.value));
};

const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('controls-grid-items');
  if (saved) {
    items.value = JSON.parse(saved);
    saveToHistory();
    return true;
  }
  return false;
};

// Gestion du drag depuis la palette
const handlePaletteDragStart = (event: DragEvent, control: ControlDefinition) => {
  const instance = createControlInstance(control.id);
  if (instance && event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(instance));
  }
};

// Handlers
const handleItemPlaced = (item: any) => {
  console.log('Item placé:', item);
  saveToHistory();
  if (autoSave.value) {
    saveToLocalStorage();
  }
};

const handleItemMoved = (item: any) => {
  console.log('Item déplacé:', item);
  saveToHistory();
  if (autoSave.value) {
    saveToLocalStorage();
  }
};

const handleItemRemoved = (id: string) => {
  console.log('Item supprimé:', id);
  saveToHistory();
  if (autoSave.value) {
    saveToLocalStorage();
  }
};

// Actions
const handleUndo = () => {
  undo();
};

const handleRedo = () => {
  redo();
};

const handleClear = () => {
  if (confirm('Êtes-vous sûr de vouloir effacer tous les items ?')) {
    clearItems();
  }
};

const handleDuplicate = () => {
  if (selectedItemId.value) {
    duplicateItem(selectedItemId.value);
  }
};

const handleSave = () => {
  saveToLocalStorage();
  alert('Configuration sauvegardée !');
};

const handleLoad = () => {
  if (loadFromLocalStorage()) {
    alert('Configuration chargée !');
  } else {
    alert('Aucune configuration trouvée');
  }
};

const handleExport = () => {
  const data = JSON.stringify(items.value, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grid-config-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Raccourcis clavier
const handleKeyDown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + Z : Undo
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    handleUndo();
  }
  // Ctrl/Cmd + Shift + Z : Redo
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
    event.preventDefault();
    handleRedo();
  }
  // Ctrl/Cmd + D : Duplicate
  if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
    event.preventDefault();
    handleDuplicate();
  }
  // Delete : Supprimer l'item sélectionné
  if (event.key === 'Delete' && selectedItemId.value) {
    event.preventDefault();
    const itemToRemove = selectedItemId.value;
    selectItem(null);
    grid.value?.removeItem(itemToRemove);
  }
};

// Auto-save watcher
watch(
  () => autoSave.value,
  (enabled) => {
    if (enabled) {
      saveToLocalStorage();
    }
  }
);

// Lifecycle
onMounted(() => {
  registerControls(controlDefinitions);
  availableControls.value = getAllControls();
  saveToHistory();
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="advanced-example">
    <!-- Header -->
    <header class="example-header">
      <div class="header-left">
        <h1 class="text-3xl font-bold">Controllers Grid</h1>
        <p class="text-sm text-muted-foreground">
          Grille drag-and-drop avancée avec historique et persistance
        </p>
      </div>

      <div class="header-right">
        <div class="stats">
          <div class="stat-item">
            <span class="stat-label">Items</span>
            <span class="stat-value">{{ items.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Cellules</span>
            <span class="stat-value">{{ totalArea }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-group">
        <button
          class="toolbar-btn"
          :disabled="!canUndo"
          @click="handleUndo"
          title="Annuler (Ctrl+Z)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 7v6h6" />
            <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
          Annuler
        </button>

        <button
          class="toolbar-btn"
          :disabled="!canRedo"
          @click="handleRedo"
          title="Refaire (Ctrl+Shift+Z)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 7v6h-6" />
            <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
          </svg>
          Refaire
        </button>

        <div class="toolbar-separator" />

        <button
          class="toolbar-btn"
          :disabled="!selectedItemId"
          @click="handleDuplicate"
          title="Dupliquer (Ctrl+D)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
          Dupliquer
        </button>

        <button class="toolbar-btn toolbar-btn-destructive" @click="handleClear">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          Effacer
        </button>
      </div>

      <div class="toolbar-group">
        <button class="toolbar-btn" @click="handleSave">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Sauvegarder
        </button>

        <button class="toolbar-btn" @click="handleLoad">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" x2="12" y1="15" y2="3" />
          </svg>
          Charger
        </button>

        <button class="toolbar-btn" @click="handleExport">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
          </svg>
          Exporter
        </button>
      </div>

      <div class="toolbar-group">
        <label class="toolbar-checkbox">
          <input v-model="showGrid" type="checkbox" />
          <span>Grille</span>
        </label>

        <label class="toolbar-checkbox">
          <input v-model="autoSave" type="checkbox" />
          <span>Auto-save</span>
        </label>

        <label class="toolbar-range">
          <span>Taille: {{ cellSize }}px</span>
          <input v-model.number="cellSize" type="range" min="60" max="150" step="10" />
        </label>

        <label class="toolbar-range">
          <span>Gap: {{ gap }}px</span>
          <input v-model.number="gap" type="range" min="4" max="24" step="4" />
        </label>
      </div>
    </div>

    <!-- Content -->
    <div class="example-content">
      <!-- Palette -->
      <aside class="palette">
        <h3 class="palette-title">Composants</h3>

        <div class="palette-grid">
          <div
            v-for="control in availableControls"
            :key="control.id"
            class="palette-item"
            :draggable="true"
            :style="{ backgroundColor: control.color }"
            @dragstart="handlePaletteDragStart($event, control)"
          >
            <span class="palette-label">{{ control.name }}</span>
            <span class="palette-size"
              >{{ control.defaultSize?.width }}×{{ control.defaultSize?.height }}</span
            >
          </div>
        </div>

        <div class="palette-hint">
          <p class="text-xs">
            💡 <strong>Raccourcis :</strong><br />
            Ctrl+Z/Cmd+Z : Annuler<br />
            Ctrl+Shift+Z : Refaire<br />
            Ctrl+D/Cmd+D : Dupliquer<br />
            Delete : Supprimer
          </p>
        </div>
      </aside>

      <!-- Grid -->
      <div class="grid-container">
        <ControlsGrid
          ref="grid"
          v-model:items="items"
          :cell-size="cellSize"
          :gap="gap"
          :min-columns="6"
          :show-grid="showGrid"
          @item-placed="handleItemPlaced"
          @item-moved="handleItemMoved"
          @item-removed="handleItemRemoved"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.advanced-example {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: hsl(var(--background));
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: hsl(var(--foreground));
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 2rem;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--border));
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: hsl(var(--secondary));
  color: hsl(var(--secondary-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover:not(:disabled) {
  background: hsl(var(--secondary) / 0.8);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn-destructive {
  background: hsl(var(--destructive));
  color: hsl(var(--destructive-foreground));
}

.toolbar-btn-destructive:hover {
  background: hsl(var(--destructive) / 0.9);
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: hsl(var(--border));
  margin: 0 0.25rem;
}

.toolbar-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.toolbar-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.toolbar-range input[type='range'] {
  width: 100px;
}

.example-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  flex: 1;
  overflow: hidden;
}

.palette {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: hsl(var(--card));
  border-right: 1px solid hsl(var(--border));
  overflow-y: auto;
}

.palette-title {
  font-size: 1rem;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.palette-grid {
  display: grid;
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
  color: white;
  cursor: grab;
  user-select: none;
  transition: all 0.2s;
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

.palette-label {
  font-weight: 500;
  font-size: 0.875rem;
}

.palette-size {
  font-size: 0.75rem;
  opacity: 0.9;
}

.palette-hint {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid hsl(var(--border));
  color: hsl(var(--muted-foreground));
}

.grid-container {
  position: relative;
  padding: 1.5rem;
  overflow: auto;
}

@media (max-width: 1024px) {
  .example-content {
    grid-template-columns: 1fr;
  }

  .palette {
    max-height: 300px;
  }
}
</style>
