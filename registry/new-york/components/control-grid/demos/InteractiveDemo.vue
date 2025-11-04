<script setup lang="ts">
/**
 * Démo interactive avec toolbar et ajout de contrôles
 */
import { ref } from 'vue';
import { ControlGrid, type GridItem, type ComponentToRegister } from '..';
import { ControlButton } from '../../control-button';

// Items initiaux
const items = ref<GridItem[]>([
  {
    id: 'initial-button',
    x: 0,
    y: 0,
    width: 2,
    height: 1,
    component: ControlButton,
    label: 'Button 1',
    color: 'hsl(var(--primary))',
  },
]);

// Composants disponibles
const components: ComponentToRegister[] = [
  {
    name: 'ControlButton',
    component: ControlButton,
  },
];

// Templates de contrôles disponibles
const controlTemplates = [
  { name: 'Button', width: 2, height: 1, color: 'hsl(var(--primary))' },
  { name: 'Wide Button', width: 3, height: 1, color: 'hsl(var(--secondary))' },
  { name: 'Square', width: 2, height: 2, color: 'hsl(var(--accent))' },
  { name: 'Tall', width: 1, height: 2, color: 'hsl(var(--muted))' },
];

// Référence à la grille
const gridRef = ref<InstanceType<typeof ControlGrid>>();

// Compteur pour les IDs uniques
let counter = 1;

// Fonction pour ajouter un contrôle depuis un template
const addControlFromTemplate = (template: typeof controlTemplates[0]) => {
  counter++;
  const newItem: Omit<GridItem, 'x' | 'y'> = {
    id: `control-${counter}`,
    width: template.width,
    height: template.height,
    component: ControlButton,
    label: `${template.name} ${counter}`,
    color: template.color,
  };

  gridRef.value?.addItem(newItem);
};

// Fonction pour vider la grille
const clearAll = () => {
  gridRef.value?.clearGrid();
};

// Fonction pour réinitialiser
const reset = () => {
  items.value = [
    {
      id: 'initial-button',
      x: 0,
      y: 0,
      width: 2,
      height: 1,
      component: ControlButton,
      label: 'Button 1',
      color: 'hsl(var(--primary))',
    },
  ];
  counter = 1;
};
</script>

<template>
  <div class="w-full space-y-4">
    <!-- Toolbar -->
    <div class="p-4 border border-border rounded-lg bg-card">
      <h3 class="text-sm font-semibold mb-3">Ajouter des contrôles</h3>
      
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="template in controlTemplates"
          :key="template.name"
          @click="addControlFromTemplate(template)"
          class="px-3 py-2 text-sm rounded-md border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
          :style="{ borderLeftColor: template.color, borderLeftWidth: '3px' }"
        >
          {{ template.name }} ({{ template.width }}×{{ template.height }})
        </button>
      </div>

      <div class="flex gap-2 pt-3 border-t border-border">
        <button
          @click="reset"
          class="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Réinitialiser
        </button>
        <button
          @click="clearAll"
          class="px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
        >
          Tout effacer
        </button>
      </div>
    </div>

    <!-- Grille -->
    <div class="h-[600px] border border-border rounded-lg overflow-hidden">
      <ControlGrid
        ref="gridRef"
        v-model:items="items"
        :components="components"
        :cell-size="100"
        :gap="12"
        :min-columns="6"
        :show-grid="true"
      >
        <!-- Info en overlay -->
        <template #default="{ placedItems, config }">
          <div class="absolute top-2 left-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm border border-border rounded-md text-xs text-muted-foreground">
            {{ placedItems.length }} contrôle(s) | Grille {{ config.columns }}×{{ config.rows }}
          </div>
        </template>
      </ControlGrid>
    </div>

    <!-- Légende -->
    <div class="p-4 border border-border rounded-lg bg-muted/50">
      <p class="text-sm text-muted-foreground">
        💡 <strong>Astuce :</strong> Glissez-déposez les contrôles pour les réorganiser. 
        Cliquez sur le bouton ✕ pour supprimer un contrôle.
      </p>
    </div>
  </div>
</template>
