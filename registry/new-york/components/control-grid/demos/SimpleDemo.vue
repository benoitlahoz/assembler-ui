<script setup lang="ts">
/**
 * Démo simple avec des contrôles déjà placés
 */
import { ref } from 'vue';
import { ControlGrid, type GridItem } from '..';
import { ControlButton } from '../../control-button';

// Items pré-placés dans la grille
const items = ref<GridItem[]>([
  {
    id: 'play-button',
    x: 0,
    y: 0,
    width: 2,
    height: 1,
    component: ControlButton,
    label: 'Play',
    color: 'hsl(var(--primary))',
  },
  {
    id: 'pause-button',
    x: 2,
    y: 0,
    width: 2,
    height: 1,
    component: ControlButton,
    label: 'Pause',
    color: 'hsl(var(--secondary))',
  },
  {
    id: 'stop-button',
    x: 0,
    y: 1,
    width: 2,
    height: 1,
    component: ControlButton,
    label: 'Stop',
    color: 'hsl(var(--destructive))',
  },
  {
    id: 'record-button',
    x: 2,
    y: 1,
    width: 2,
    height: 1,
    component: ControlButton,
    label: 'Record',
    color: 'hsl(0 84% 60%)',
  },
  {
    id: 'volume-control',
    x: 0,
    y: 2,
    width: 4,
    height: 1,
    component: ControlButton,
    label: 'Volume',
    color: 'hsl(var(--muted))',
  },
]);
</script>

<template>
  <div class="w-full h-[600px]">
    <ControlGrid
      v-model:items="items"
      :cell-size="100"
      :gap="12"
      :min-columns="4"
      :show-grid="true"
    />
  </div>
</template>
