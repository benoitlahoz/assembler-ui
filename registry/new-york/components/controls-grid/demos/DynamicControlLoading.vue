<script setup lang="ts">
import { ref, computed, h } from 'vue';
import { ControlsGrid } from '../index';
import { useControlRegistry } from '../../../composables/use-control-registry/useControlRegistry';

const {
  registerControl,
  registerControlFromFile,
  getAllTemplates,
  createItemFromControl,
  getAllControls,
} = useControlRegistry();

const gridRef = ref<InstanceType<typeof ControlsGrid> | null>(null);
const gridItems = ref<any[]>([]);
const isLoading = ref(false);
const errorMessage = ref('');

// Formulaire pour enregistrer un composant depuis un fichier
const componentPath = ref('');
const componentId = ref('');
const componentName = ref('');
const componentWidth = ref(1);
const componentHeight = ref(1);
const componentColor = ref('#3b82f6');
const componentCategory = ref('custom');

/**
 * Charge et enregistre un composant depuis un fichier
 */
const loadComponentFromFile = async () => {
  errorMessage.value = '';

  if (!componentPath.value || !componentId.value) {
    errorMessage.value = "Le chemin et l'ID sont requis";
    return;
  }

  isLoading.value = true;

  try {
    const success = await registerControlFromFile(componentPath.value, {
      id: componentId.value,
      name: componentName.value || componentId.value,
      defaultSize: {
        width: componentWidth.value,
        height: componentHeight.value,
      },
      color: componentColor.value,
      category: componentCategory.value,
    });

    if (success) {
      // Réinitialiser le formulaire
      componentPath.value = '';
      componentId.value = '';
      componentName.value = '';
      componentWidth.value = 1;
      componentHeight.value = 1;
      componentColor.value = '#3b82f6';
    } else {
      errorMessage.value = 'Échec du chargement du composant';
    }
  } catch (error) {
    errorMessage.value = `Erreur: ${error}`;
  } finally {
    isLoading.value = false;
  }
};

/**
 * Enregistre un composant brut pour démonstration
 */
const registerSampleComponent = () => {
  // Exemple de composant inline
  const SampleComponent = {
    name: 'SampleControl',
    setup() {
      const count = ref(0);
      return () =>
        h(
          'div',
          {
            class:
              'w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg cursor-pointer',
            onClick: () => count.value++,
          },
          [h('span', { class: 'text-white font-bold' }, `Clicks: ${count.value}`)]
        );
    },
  };

  registerControl(SampleComponent, {
    id: `sample-${Date.now()}`,
    name: 'Exemple de Contrôle',
    description: "Un contrôle d'exemple créé dynamiquement",
    defaultSize: { width: 2, height: 2 },
    color: '#a855f7',
    category: 'examples',
    icon: '✨',
  });
};

// Templates disponibles
const templates = computed(() => getAllTemplates());
const controls = computed(() => getAllControls());

/**
 * Ajoute un contrôle à la grille
 */
const addControlToGrid = (controlId: string) => {
  const item = createItemFromControl(controlId);
  if (item) {
    gridRef.value?.addItem(item);
  }
};

/**
 * Gestion du drag depuis la palette
 */
const handlePaletteDragStart = (event: DragEvent, template: any) => {
  if (!event.dataTransfer) return;

  const item = createItemFromControl(template.id);
  if (!item) return;

  event.dataTransfer.effectAllowed = 'copy';
  event.dataTransfer.setData('application/json', JSON.stringify(item));
};

// Gestionnaires d'événements de la grille
const handleItemPlaced = (item: any) => {
  console.log('Item placé:', item);
};

const handleItemMoved = (item: any) => {
  console.log('Item déplacé:', item);
};

const handleItemRemoved = (id: string) => {
  console.log('Item supprimé:', id);
};
</script>

<template>
  <div class="space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">Chargement Dynamique de Contrôles</h2>
      <p class="text-muted-foreground">
        Démonstration de l'enregistrement de contrôles depuis des fichiers ou dynamiquement
      </p>
    </div>

    <!-- Formulaire de chargement -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Chargement depuis fichier -->
      <div class="space-y-4 rounded-lg border p-4">
        <h3 class="font-semibold">Charger depuis un fichier</h3>

        <div class="space-y-2">
          <label class="text-sm font-medium">Chemin du fichier</label>
          <input
            v-model="componentPath"
            type="text"
            placeholder="~/components/MyControl.vue"
            class="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">ID *</label>
            <input
              v-model="componentId"
              type="text"
              placeholder="my-control"
              class="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Nom</label>
            <input
              v-model="componentName"
              type="text"
              placeholder="Mon Contrôle"
              class="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Largeur</label>
            <input
              v-model.number="componentWidth"
              type="number"
              min="1"
              class="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Hauteur</label>
            <input
              v-model.number="componentHeight"
              type="number"
              min="1"
              class="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Couleur</label>
            <input
              v-model="componentColor"
              type="color"
              class="h-[42px] w-full rounded-md border"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Catégorie</label>
          <input
            v-model="componentCategory"
            type="text"
            placeholder="custom"
            class="w-full rounded-md border px-3 py-2"
          />
        </div>

        <button
          :disabled="isLoading || !componentPath || !componentId"
          class="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          @click="loadComponentFromFile"
        >
          {{ isLoading ? 'Chargement...' : 'Charger le composant' }}
        </button>

        <div v-if="errorMessage" class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {{ errorMessage }}
        </div>
      </div>

      <!-- Création de composant dynamique -->
      <div class="space-y-4 rounded-lg border p-4">
        <h3 class="font-semibold">Créer un composant d'exemple</h3>
        <p class="text-sm text-muted-foreground">
          Crée un composant inline avec un compteur de clics pour démonstration
        </p>

        <button
          class="w-full rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/90"
          @click="registerSampleComponent"
        >
          Créer un exemple
        </button>

        <div class="rounded-md bg-muted/50 p-3 text-xs">
          <p class="font-medium mb-2">Composants enregistrés: {{ controls.length }}</p>
          <div class="space-y-1">
            <div
              v-for="control in controls"
              :key="control.id"
              class="flex items-center justify-between"
            >
              <span>{{ control.icon }} {{ control.name }}</span>
              <span class="text-muted-foreground">
                {{ control.defaultSize?.width }}×{{ control.defaultSize?.height }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Palette et Grille -->
    <div class="grid gap-4 lg:grid-cols-[280px_1fr]">
      <!-- Palette de contrôles -->
      <aside class="space-y-2 rounded-lg border p-4">
        <h3 class="font-semibold">Palette de Contrôles</h3>
        <p class="text-xs text-muted-foreground">Glissez-déposez ou cliquez pour ajouter</p>

        <div class="space-y-2">
          <div
            v-for="template in templates"
            :key="template.id"
            draggable="true"
            class="group relative cursor-move rounded-lg border p-3 transition-colors hover:border-primary hover:bg-accent"
            @dragstart="handlePaletteDragStart($event, template)"
            @click="addControlToGrid(template.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <span v-if="template.icon" class="text-lg">{{ template.icon }}</span>
                  <span class="font-medium text-sm">{{ template.label }}</span>
                </div>
                <div class="text-xs text-muted-foreground">
                  {{ template.width }}×{{ template.height }}
                </div>
              </div>
              <div
                v-if="template.color"
                class="h-6 w-6 rounded border"
                :style="{ backgroundColor: template.color }"
              />
            </div>
          </div>

          <div v-if="templates.length === 0" class="text-sm text-muted-foreground text-center py-4">
            Aucun contrôle enregistré
          </div>
        </div>
      </aside>

      <!-- Grille -->
      <div class="space-y-2 rounded-lg border p-4">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">Grille de Contrôles</h3>
          <button
            class="text-sm px-3 py-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20"
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
          class="min-h-[500px]"
          @item-placed="handleItemPlaced"
          @item-moved="handleItemMoved"
          @item-removed="handleItemRemoved"
        />
      </div>
    </div>

    <!-- Instructions -->
    <div class="rounded-lg bg-muted/30 p-4 text-sm text-muted-foreground space-y-2">
      <p class="font-semibold">Comment utiliser :</p>
      <ul class="list-disc list-inside space-y-1">
        <li>
          <strong>Charger depuis un fichier :</strong> Entrez le chemin du composant Vue et cliquez
          sur "Charger le composant"
        </li>
        <li>
          <strong>Créer un exemple :</strong> Cliquez sur "Créer un exemple" pour générer un
          composant de démonstration
        </li>
        <li>
          <strong>Ajouter à la grille :</strong> Glissez-déposez depuis la palette ou cliquez sur un
          contrôle
        </li>
        <li>
          <strong>Déplacer dans la grille :</strong> Glissez les items déjà placés pour les
          repositionner
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
input[type='text'],
input[type='number'] {
  outline: none;
}

input[type='text']:focus,
input[type='number']:focus {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}

input[type='color'] {
  cursor: pointer;
}
</style>
