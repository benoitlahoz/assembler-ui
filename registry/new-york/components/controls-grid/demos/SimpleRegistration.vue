<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ControlsGrid } from '../index';
import { useControlRegistry } from '../../../composables/use-control-registry/useControlRegistry';
import { ControlButton } from '../../../components/control-button';

const { registerControl, getAllTemplates, createItemFromControl } = useControlRegistry();

const gridRef = ref<InstanceType<typeof ControlsGrid> | null>(null);
const gridItems = ref<any[]>([]);

// Enregistrer des contrôles au montage
onMounted(() => {
  // Enregistrement avec définition complète
  registerControl({
    id: 'small-button',
    name: 'Petit Bouton',
    description: 'Bouton compact 1×1',
    component: ControlButton,
    defaultSize: { width: 1, height: 1 },
    defaultProps: {
      variant: 'default',
      shape: 'square',
    },
    category: 'buttons',
    icon: '○',
    color: '#3b82f6',
  });

  // Enregistrement avec composant brut + options
  registerControl(ControlButton, {
    id: 'medium-button',
    name: 'Bouton Moyen',
    description: 'Bouton standard 2×1',
    defaultSize: { width: 2, height: 1 },
    defaultProps: {
      variant: 'default',
      shape: 'square',
    },
    category: 'buttons',
    icon: '◐',
    color: '#10b981',
  });

  registerControl(ControlButton, {
    id: 'large-button',
    name: 'Grand Bouton',
    description: 'Bouton large 2×2',
    defaultSize: { width: 2, height: 2 },
    defaultProps: {
      variant: 'solid',
      shape: 'square',
    },
    category: 'buttons',
    icon: '●',
    color: '#8b5cf6',
  });

  registerControl(ControlButton, {
    id: 'wide-button',
    name: 'Bouton Large',
    description: 'Bouton étendu 3×1',
    defaultSize: { width: 3, height: 1 },
    defaultProps: {
      variant: 'outline',
      shape: 'square',
    },
    category: 'buttons',
    icon: '▬',
    color: '#f59e0b',
  });
});

// Récupérer les templates pour la palette
const templates = computed(() => getAllTemplates());

// Ajouter un contrôle à la grille
const addControl = (controlId: string) => {
  const item = createItemFromControl(controlId);
  if (item) {
    gridRef.value?.addItem(item);
  }
};

// Gestionnaires d'événements
const handleItemPlaced = (item: any) => {
  console.log('✅ Item placé:', item.id);
};

const handleItemMoved = (item: any) => {
  console.log('🔄 Item déplacé:', item.id);
};

const handleItemRemoved = (id: string) => {
  console.log('🗑️ Item supprimé:', id);
};
</script>

<template>
  <div class="space-y-4 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Enregistrement Simple de Contrôles</h2>
      <p class="text-muted-foreground">
        Démonstration des différentes méthodes d'enregistrement avec useControlRegistry
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-[280px_1fr]">
      <!-- Palette -->
      <aside class="space-y-2 rounded-lg border bg-card p-4">
        <h3 class="font-semibold">Palette de Contrôles</h3>
        <p class="text-xs text-muted-foreground mb-3">Cliquez pour ajouter à la grille</p>

        <div class="space-y-2">
          <button
            v-for="template in templates"
            :key="template.id"
            class="w-full text-left rounded-lg border p-3 transition-all hover:border-primary hover:bg-accent active:scale-95"
            @click="addControl(template.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ template.icon }}</span>
                  <span class="font-medium text-sm">{{ template.label }}</span>
                </div>
                <div class="text-xs text-muted-foreground">
                  Taille: {{ template.width }}×{{ template.height }}
                </div>
              </div>
              <div
                class="h-8 w-8 rounded border shadow-sm shrink-0"
                :style="{ backgroundColor: template.color }"
              />
            </div>
          </button>
        </div>
      </aside>

      <!-- Grille -->
      <div class="space-y-2 rounded-lg border bg-card p-4">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h3 class="font-semibold">Grille de Contrôles</h3>
            <p class="text-xs text-muted-foreground">
              {{ gridItems.length }} contrôle{{ gridItems.length > 1 ? 's' : '' }}
            </p>
          </div>
          <button
            class="text-sm px-3 py-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
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
          :show-grid="true"
          class="min-h-[500px]"
          @item-placed="handleItemPlaced"
          @item-moved="handleItemMoved"
          @item-removed="handleItemRemoved"
        />
      </div>
    </div>

    <!-- Informations -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Méthode 1 -->
      <div class="rounded-lg border bg-muted/30 p-4 space-y-2">
        <h4 class="font-semibold text-sm">📝 Méthode 1 : Définition complète</h4>
        <pre class="text-xs bg-background rounded p-2 overflow-x-auto"><code>registerControl({
  id: 'small-button',
  name: 'Petit Bouton',
  component: ControlButton,
  defaultSize: { width: 1, height: 1 },
  color: '#3b82f6',
  icon: '○',
});</code></pre>
      </div>

      <!-- Méthode 2 -->
      <div class="rounded-lg border bg-muted/30 p-4 space-y-2">
        <h4 class="font-semibold text-sm">🎯 Méthode 2 : Composant + Options</h4>
        <pre
          class="text-xs bg-background rounded p-2 overflow-x-auto"
        ><code>registerControl(ControlButton, {
  id: 'medium-button',
  name: 'Bouton Moyen',
  defaultSize: { width: 2, height: 1 },
  color: '#10b981',
});</code></pre>
      </div>
    </div>

    <!-- Instructions -->
    <div class="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm space-y-2">
      <p class="font-semibold flex items-center gap-2">
        <span>💡</span>
        <span>Comment ça marche :</span>
      </p>
      <ul class="list-disc list-inside space-y-1 text-muted-foreground">
        <li>Les contrôles sont enregistrés au montage du composant</li>
        <li>Cliquez sur un contrôle dans la palette pour l'ajouter à la grille</li>
        <li>La grille trouve automatiquement une position disponible</li>
        <li>Vous pouvez déplacer les contrôles dans la grille en les glissant</li>
        <li>Les événements sont loggés dans la console</li>
      </ul>
    </div>
  </div>
</template>
