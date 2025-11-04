<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import { ControlButton } from '~~/registry/new-york/components/control-button';
import { ControlsGrid } from '~~/registry/new-york/components/controls-grid';

// Composant wrapper pour le ControlButton dans la grille
const GridControlButton = {
  props: ['id', 'width', 'height', 'color', 'variant', 'shape', 'icon', 'label'],
  setup(props: any) {
    const isActive = ref(false);

    const toggle = () => {
      isActive.value = !isActive.value;
      console.log(
        `Button ${props.label || props.id} ${isActive.value ? 'activated' : 'deactivated'}`
      );
    };

    return { isActive, toggle };
  },
  template: `
    <ControlButton 
      :color="color" 
      :variant="variant || 'default'" 
      :shape="shape || 'square'"
      :class="{ 'ring-2 ring-offset-2': isActive }"
      @click="toggle"
    >
      <span v-if="icon" class="text-lg">{{ icon }}</span>
      <span v-else-if="label" class="text-xs font-bold">{{ label }}</span>
    </ControlButton>
  `,
};

// Items prédéfinis pour la grille
const gridItems = ref([
  {
    id: 'btn-1',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    component: shallowRef(GridControlButton),
    color: '#3b82f6',
    variant: 'default',
    shape: 'square',
    icon: '▶',
  },
  {
    id: 'btn-2',
    x: 1,
    y: 0,
    width: 1,
    height: 1,
    component: shallowRef(GridControlButton),
    color: '#ef4444',
    variant: 'default',
    shape: 'square',
    icon: '■',
  },
  {
    id: 'btn-3',
    x: 2,
    y: 0,
    width: 1,
    height: 1,
    component: shallowRef(GridControlButton),
    color: '#8b5cf6',
    variant: 'outline',
    shape: 'circle',
    icon: '●',
  },
  {
    id: 'btn-4',
    x: 0,
    y: 1,
    width: 2,
    height: 1,
    component: shallowRef(GridControlButton),
    color: '#10b981',
    variant: 'default',
    shape: 'square',
    label: 'WIDE',
  },
]);

// Palette de boutons à ajouter
const buttonPalette = ref([
  {
    id: 'new-square',
    width: 1,
    height: 1,
    component: shallowRef(GridControlButton),
    color: '#f59e0b',
    variant: 'default',
    shape: 'square',
    icon: '★',
  },
  {
    id: 'new-circle',
    width: 1,
    height: 1,
    component: shallowRef(GridControlButton),
    color: '#ec4899',
    variant: 'outline',
    shape: 'circle',
    icon: '♥',
  },
  {
    id: 'new-tall',
    width: 1,
    height: 2,
    component: shallowRef(GridControlButton),
    color: '#06b6d4',
    variant: 'ghost',
    shape: 'square',
    label: 'TALL',
  },
  {
    id: 'new-big',
    width: 2,
    height: 2,
    component: shallowRef(GridControlButton),
    color: '#a855f7',
    variant: 'solid',
    shape: 'square',
    icon: '✦',
  },
]);

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
      <div class="flex gap-3 p-4 bg-muted/30 rounded-lg border border-border">
        <div
          v-for="btn in buttonPalette"
          :key="btn.id"
          class="control-palette-item cursor-grab active:cursor-grabbing"
          :draggable="true"
          :style="{
            width: `${btn.width * 80 + (btn.width - 1) * 8}px`,
            height: `${btn.height * 80 + (btn.height - 1) * 8}px`,
          }"
          @dragstart="
            (e) => {
              e.dataTransfer!.effectAllowed = 'copy';
              e.dataTransfer!.setData(
                'application/json',
                JSON.stringify({
                  ...btn,
                  id: btn.id + '-' + Date.now(), // ID unique
                })
              );
            }
          "
        >
          <component :is="btn.component" v-bind="btn" class="pointer-events-none" />
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
