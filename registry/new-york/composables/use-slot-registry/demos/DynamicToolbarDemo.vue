<script setup lang="ts">
import { ref, h } from 'vue';
import { useSlotRegistry } from '../useSlotRegistry';
import DynamicToolbarButton from './DynamicToolbarButton.vue';
import DynamicToolbarSeparator from './DynamicToolbarSeparator.vue';

const { createSlotRegistry } = useSlotRegistry();

const { registry, renderSlots, renderGroup } = createSlotRegistry({
  defaultSort: { by: 'position', order: 'asc' },
});

// Simuler un état partagé
const documentTitle = ref('Sans titre');
const isSaved = ref(true);
const canUndo = ref(false);
const canRedo = ref(false);

// Actions simulées
const save = () => {
  console.log('💾 Document sauvegardé');
  isSaved.value = true;
};

const undo = () => {
  console.log('↶ Annuler');
  canUndo.value = false;
};

const redo = () => {
  console.log('↷ Refaire');
  canRedo.value = false;
};

const edit = () => {
  console.log('✏️ Modifier le titre');
  isSaved.value = false;
  canUndo.value = true;
};
</script>

<template>
  <div class="w-full rounded-lg border bg-card p-6">
    <h3 class="mb-4 font-semibold">Dynamic Toolbar Demo</h3>

    <!-- Toolbar principal -->
    <div class="mb-6 flex items-center gap-2 rounded border bg-muted/30 p-2">
      <!-- Groupe: start -->
      <div class="flex items-center gap-1">
        <component :is="() => renderGroup('start')" />
      </div>

      <DynamicToolbarSeparator />

      <!-- Groupe: main -->
      <div class="flex flex-1 items-center gap-1">
        <component :is="() => renderGroup('main')" />
      </div>

      <DynamicToolbarSeparator />

      <!-- Groupe: end -->
      <div class="flex items-center gap-1">
        <component :is="() => renderGroup('end')" />
      </div>
    </div>

    <!-- État du document -->
    <div class="space-y-2 text-sm">
      <div>
        <span class="font-medium">Titre:</span>
        {{ documentTitle }}
      </div>
      <div>
        <span class="font-medium">État:</span>
        <span :class="isSaved ? 'text-green-600' : 'text-orange-600'">
          {{ isSaved ? '✓ Sauvegardé' : '• Non sauvegardé' }}
        </span>
      </div>
    </div>

    <!-- Les enfants s'enregistrent ici -->
    <DynamicToolbarButton
      :registry="registry"
      label="Nouveau"
      icon="file-plus"
      group="start"
      :position="1"
      @click="
        () => {
          documentTitle = 'Nouveau document';
          isSaved = false;
        }
      "
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Ouvrir"
      icon="folder-open"
      group="start"
      :position="2"
      @click="() => console.log('📂 Ouvrir')"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Sauvegarder"
      icon="save"
      group="main"
      :position="10"
      :disabled="isSaved"
      @click="save"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Annuler"
      icon="undo"
      group="main"
      :position="20"
      :disabled="!canUndo"
      @click="undo"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Refaire"
      icon="redo"
      group="main"
      :position="21"
      :disabled="!canRedo"
      @click="redo"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Éditer"
      icon="pencil"
      group="main"
      :position="30"
      @click="edit"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Exporter"
      icon="download"
      group="end"
      :position="100"
      @click="() => console.log('📥 Exporter')"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Paramètres"
      icon="settings"
      group="end"
      :position="200"
      @click="() => console.log('⚙️ Paramètres')"
    />
  </div>
</template>
