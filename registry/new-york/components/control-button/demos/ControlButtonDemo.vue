<script setup lang="ts">
import { ref, onMounted, shallowRef, h } from 'vue';
import { ControlButton } from '~~/registry/new-york/components/control-button';
import { ControlsGrid } from '~~/registry/new-york/components/controls-grid';
import { useControlRegistry } from '~~/registry/new-york/composables/use-control-registry';
import type { ControlDefinition } from '~~/registry/new-york/composables/use-control-registry';

// Initialiser le registre de contrôles
const { registerControls, getAllControls, createControlInstance } = useControlRegistry();

// Créer un composant wrapper pour ControlButton avec icône
const createButtonComponent = (icon: string, label?: string) => {
  return {
    name: 'GridControlButton',
    props: ['color', 'variant', 'shape'],
    setup(props: any) {
      const isActive = ref(false);

      const toggle = () => {
        isActive.value = !isActive.value;
        console.log(`Button ${isActive.value ? 'activated' : 'deactivated'}`);
      };

      return () =>
        h(
          ControlButton,
          {
            color: props.color,
            variant: props.variant || 'default',
            shape: props.shape || 'square',
            class: isActive.value ? 'ring-2 ring-offset-2' : '',
            onClick: toggle,
          },
          () => h('span', { class: label ? 'text-xs font-bold' : 'text-lg' }, label || icon)
        );
    },
  };
};

// Définir les contrôles
const controlDefinitions: ControlDefinition[] = [
  {
    id: 'button-play',
    name: 'Play',
    component: shallowRef(createButtonComponent('▶')),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: '#3b82f6', variant: 'default', shape: 'square' },
    category: 'buttons',
    color: '#3b82f6',
  },
  {
    id: 'button-stop',
    name: 'Stop',
    component: shallowRef(createButtonComponent('■')),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: '#ef4444', variant: 'default', shape: 'square' },
    category: 'buttons',
    color: '#ef4444',
  },
  {
    id: 'button-circle',
    name: 'Circle',
    component: shallowRef(createButtonComponent('●')),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: '#8b5cf6', variant: 'outline', shape: 'circle' },
    category: 'buttons',
    color: '#8b5cf6',
  },
  {
    id: 'button-wide',
    name: 'Wide',
    component: shallowRef(createButtonComponent('', 'WIDE')),
    defaultSize: { width: 2, height: 1 },
    defaultProps: { color: '#10b981', variant: 'default', shape: 'square' },
    category: 'buttons',
    color: '#10b981',
  },
  {
    id: 'button-star',
    name: 'Star',
    component: shallowRef(createButtonComponent('★')),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: '#f59e0b', variant: 'default', shape: 'square' },
    category: 'special',
    color: '#f59e0b',
  },
  {
    id: 'button-heart',
    name: 'Heart',
    component: shallowRef(createButtonComponent('♥')),
    defaultSize: { width: 1, height: 1 },
    defaultProps: { color: '#ec4899', variant: 'outline', shape: 'circle' },
    category: 'special',
    color: '#ec4899',
  },
  {
    id: 'button-tall',
    name: 'Tall',
    component: shallowRef(createButtonComponent('', 'TALL')),
    defaultSize: { width: 1, height: 2 },
    defaultProps: { color: '#06b6d4', variant: 'ghost', shape: 'square' },
    category: 'special',
    color: '#06b6d4',
  },
  {
    id: 'button-big',
    name: 'Big',
    component: shallowRef(createButtonComponent('✦')),
    defaultSize: { width: 2, height: 2 },
    defaultProps: { color: '#a855f7', variant: 'solid', shape: 'square' },
    category: 'special',
    color: '#a855f7',
  },
];

// État
const gridItems = ref<any[]>([]);
const availableControls = ref<ControlDefinition[]>([]);

onMounted(() => {
  registerControls(controlDefinitions);
  availableControls.value = getAllControls();

  // Ajouter les items initiaux
  const initialControls = ['button-play', 'button-stop', 'button-circle', 'button-wide'];
  initialControls.forEach((controlId, index) => {
    const instance = createControlInstance(controlId, { x: index % 3, y: Math.floor(index / 3) });
    if (instance) {
      gridItems.value.push(instance);
    }
  });
});

// Gestion du drag depuis la palette
const handlePaletteDragStart = (event: DragEvent, control: ControlDefinition) => {
  const instance = createControlInstance(control.id);
  if (instance && event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(instance));
  }
};

const handleItemPlaced = (item: any) => {
  console.log('Item placed:', item);
};

const handleItemMoved = (item: any) => {
  console.log('Item moved:', item);
};

const handleItemRemoved = (id: string) => {
  console.log('Item removed:', id);
};
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <div class="space-y-2">
      <h3 class="text-lg font-semibold">Control Buttons dans la grille</h3>
      <p class="text-sm text-muted-foreground">
        Glissez-déposez les boutons depuis la palette vers la grille, ou déplacez-les dans la
        grille.
      </p>
    </div>

    <!-- Palette de boutons à glisser -->
    <div class="space-y-2">
      <h4 class="text-sm font-medium">Palette de contrôles</h4>
      <div class="flex gap-3 p-4 bg-muted/30 rounded-lg border border-border flex-wrap">
        <div
          v-for="control in availableControls"
          :key="control.id"
          class="control-palette-item cursor-grab active:cursor-grabbing"
          :draggable="true"
          :style="{
            width: `${(control.defaultSize?.width || 1) * 80 + ((control.defaultSize?.width || 1) - 1) * 8}px`,
            height: `${(control.defaultSize?.height || 1) * 80 + ((control.defaultSize?.height || 1) - 1) * 8}px`,
            backgroundColor: control.color,
          }"
          @dragstart="handlePaletteDragStart($event, control)"
        >
          <div class="w-full h-full flex items-center justify-center text-white font-bold text-xs">
            {{ control.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- Grille de contrôles -->
    <div class="space-y-2">
      <h4 class="text-sm font-medium">Grille de contrôles</h4>
      <ControlsGrid
        v-model:items="gridItems"
        :cell-size="80"
        :gap="8"
        :min-columns="4"
        @item-placed="handleItemPlaced"
        @item-moved="handleItemMoved"
        @item-removed="handleItemRemoved"
      />
    </div>

    <!-- Info -->
    <div class="text-xs text-muted-foreground space-y-1">
      <p>• Cliquez sur un bouton pour l'activer/désactiver (ring visuel)</p>
      <p>• Glissez depuis la palette pour ajouter de nouveaux contrôles</p>
      <p>• Glissez dans la grille pour réorganiser</p>
      <p>• Survolez un bouton dans la grille et cliquez sur × pour le supprimer</p>
    </div>
  </div>
</template>

<style scoped>
.control-palette-item {
  position: relative;
  border-radius: 0.5rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
}

.control-palette-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.control-palette-item:active {
  transform: scale(0.95);
}
</style>
