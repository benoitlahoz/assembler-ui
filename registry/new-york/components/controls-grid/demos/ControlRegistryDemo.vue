<script setup lang="ts">
import { ref, onMounted, shallowRef, h } from 'vue';
import { ControlsGrid } from '~~/registry/new-york/components/controls-grid';
import { useControlRegistry } from '~~/registry/new-york/composables/use-control-registry/useControlRegistry';
import { ControlButton } from '~~/registry/new-york/components/control-button';
import type { ControlDefinition } from '~~/registry/new-york/composables/use-control-registry/useControlRegistry';

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

// Définir les contrôles directement avec ControlButton
const controlDefinitions: ControlDefinition[] = [
  {
    id: 'button-control',
    name: 'Button Control',
    description: 'Un bouton simple avec état on/off',
    component: shallowRef(createButtonComponent('▶')),
    defaultSize: {
      width: 1,
      height: 1,
    },
    defaultProps: {
      color: '#3b82f6',
      variant: 'default',
      shape: 'square',
    },
    category: 'basic',
    icon: '▶',
    color: '#3b82f6',
  },
  {
    id: 'button-stop',
    name: 'Stop Button',
    description: 'Bouton stop',
    component: shallowRef(createButtonComponent('■')),
    defaultSize: {
      width: 1,
      height: 1,
    },
    defaultProps: {
      color: '#ef4444',
      variant: 'default',
      shape: 'square',
    },
    category: 'basic',
    icon: '■',
    color: '#ef4444',
  },
  {
    id: 'button-record',
    name: 'Record Button',
    description: 'Bouton enregistrement',
    component: shallowRef(createButtonComponent('●')),
    defaultSize: {
      width: 1,
      height: 1,
    },
    defaultProps: {
      color: '#ef4444',
      variant: 'outline',
      shape: 'circle',
    },
    category: 'basic',
    icon: '●',
    color: '#ef4444',
  },
  {
    id: 'button-wide',
    name: 'Wide Button',
    description: 'Bouton large (2x1)',
    component: shallowRef(createButtonComponent('WIDE')),
    defaultSize: {
      width: 2,
      height: 1,
    },
    defaultProps: {
      color: '#10b981',
      variant: 'default',
      shape: 'square',
    },
    category: 'basic',
    icon: '⬌',
    color: '#10b981',
  },
  {
    id: 'button-tall',
    name: 'Tall Button',
    description: 'Bouton haut (1x2)',
    component: shallowRef(createButtonComponent('TALL')),
    defaultSize: {
      width: 1,
      height: 2,
    },
    defaultProps: {
      color: '#06b6d4',
      variant: 'ghost',
      shape: 'square',
    },
    category: 'basic',
    icon: '⬍',
    color: '#06b6d4',
  },
  {
    id: 'button-big',
    name: 'Big Button',
    description: 'Grand bouton (2x2)',
    component: shallowRef(createButtonComponent('✦')),
    defaultSize: {
      width: 2,
      height: 2,
    },
    defaultProps: {
      color: '#a855f7',
      variant: 'solid',
      shape: 'square',
    },
    category: 'basic',
    icon: '✦',
    color: '#a855f7',
  },
];

// Items dans la grille
const gridItems = ref<any[]>([]);

// Récupérer tous les contrôles disponibles pour la palette
const availableControls = ref<ControlDefinition[]>([]);

onMounted(() => {
  registerControls(controlDefinitions);
  availableControls.value = getAllControls();
});

// Ajouter un contrôle à la grille programmatiquement
const gridRef = ref<any>(null);

const addControlToGrid = (controlId: string) => {
  const instance = createControlInstance(controlId);
  if (instance && gridRef.value) {
    const added = gridRef.value.addItem(instance);
    if (!added) {
      console.warn("Pas assez d'espace dans la grille pour ajouter le contrôle");
    }
  }
};

// Gestion du drag depuis la palette
const handleDragStart = (event: DragEvent, controlId: string) => {
  const instance = createControlInstance(controlId);
  if (instance && event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(instance));
  }
};

const handleItemPlaced = (item: any) => {
  console.log('Control placed:', item);
};

const handleItemMoved = (item: any) => {
  console.log('Control moved:', item);
};

const handleItemRemoved = (id: string) => {
  console.log('Control removed:', id);
};
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <div class="space-y-2">
      <h3 class="text-lg font-semibold">
        Control Registry - Système d'enregistrement de contrôles
      </h3>
      <p class="text-sm text-muted-foreground">
        Glissez-déposez les contrôles depuis la palette vers la grille, ou cliquez sur "Ajouter"
        pour les placer automatiquement.
      </p>
    </div>

    <!-- Palette de contrôles -->
    <div class="space-y-2">
      <h4 class="text-sm font-medium">Palette de contrôles enregistrés</h4>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 bg-muted/30 rounded-lg border border-border"
      >
        <div
          v-for="control in availableControls"
          :key="control.id"
          class="flex flex-col items-center gap-2 p-3 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors"
        >
          <div
            class="control-preview cursor-grab active:cursor-grabbing"
            :draggable="true"
            :style="{
              width: `${control.defaultSize!.width * 40 + (control.defaultSize!.width - 1) * 4}px`,
              height: `${control.defaultSize!.height * 40 + (control.defaultSize!.height - 1) * 4}px`,
            }"
            @dragstart="(e) => handleDragStart(e, control.id)"
          >
            <ControlButton
              :color="control.color"
              :variant="control.defaultProps?.variant || 'default'"
              :shape="control.defaultProps?.shape || 'square'"
              class="pointer-events-none"
            >
              <span class="text-sm font-bold">{{ control.icon }}</span>
            </ControlButton>
          </div>
          <div class="text-center space-y-1">
            <p class="text-xs font-medium">{{ control.name }}</p>
            <p class="text-xs text-muted-foreground">
              {{ control.defaultSize!.width }}×{{ control.defaultSize!.height }}
            </p>
          </div>
          <button
            class="w-full text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            @click="addControlToGrid(control.id)"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>

    <!-- Grille de contrôles -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium">Grille de contrôles</h4>
        <button
          class="text-xs px-3 py-1.5 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
          @click="gridRef?.clearGrid()"
        >
          Vider la grille
        </button>
      </div>
      <ControlsGrid
        ref="gridRef"
        v-model:items="gridItems"
        :cell-size="80"
        :gap="8"
        :min-columns="6"
        @item-placed="handleItemPlaced"
        @item-moved="handleItemMoved"
        @item-removed="handleItemRemoved"
      />
    </div>

    <!-- Info -->
    <div class="text-xs text-muted-foreground space-y-1 p-4 bg-muted/30 rounded-lg">
      <p class="font-semibold mb-2">Comment utiliser :</p>
      <p>
        • <strong>Glisser-déposer :</strong> Glissez un contrôle depuis la palette vers la grille
      </p>
      <p>
        • <strong>Ajouter automatiquement :</strong> Cliquez sur "Ajouter" pour placer le contrôle
        au premier emplacement disponible
      </p>
      <p>• <strong>Réorganiser :</strong> Glissez les contrôles dans la grille pour les déplacer</p>
      <p>
        • <strong>Supprimer :</strong> Survolez un contrôle et cliquez sur le × pour le supprimer
      </p>
      <p>
        • <strong>Interagir :</strong> Cliquez sur les contrôles dans la grille pour les
        activer/désactiver
      </p>
    </div>
  </div>
</template>

<style scoped>
.control-preview {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.control-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.control-preview:active {
  transform: scale(0.95);
}
</style>
