<script setup lang="ts">
import { ref, onMounted, shallowRef, h } from 'vue';
import { ControlsGrid } from '..';
import { useControlRegistry } from '~~/registry/new-york/composables/use-control-registry';
import { ControlButton } from '~~/registry/new-york/components/control-button';
import type { ControlDefinition } from '~~/registry/new-york/composables/use-control-registry';

// Initialiser le registre de contrôles
const { registerControl, createControlInstance } = useControlRegistry();

// Référence à la grille pour accéder aux méthodes exposées
const gridRef = ref<InstanceType<typeof ControlsGrid> | null>(null);
const gridItems = ref<any[]>([]);

// Créer un composant wrapper pour ControlButton
const createButtonComponent = () => {
  return {
    name: 'GridControlButton',
    props: ['color', 'variant', 'shape'],
    setup(props: any) {
      const isActive = ref(false);

      const toggle = () => {
        isActive.value = !isActive.value;
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
          () => h('span', { class: 'text-lg font-bold' }, '●')
        );
    },
  };
};

// Enregistrer le contrôle au montage
onMounted(() => {
  const controlDefinition: ControlDefinition = {
    id: 'control-button',
    name: 'Control Button',
    description: 'Un bouton de contrôle interactif',
    component: shallowRef(createButtonComponent()),
    defaultSize: { width: 2, height: 2 },
    defaultProps: {
      color: '#3b82f6',
      variant: 'default',
      shape: 'circle',
    },
    category: 'controls',
    color: '#3b82f6',
  };

  registerControl(controlDefinition);
});

// Ajouter un bouton de contrôle à la grille
const addControlButton = () => {
  const instance = createControlInstance('control-button', undefined, {
    color: '#' + Math.floor(Math.random() * 16777215).toString(16),
  });

  if (instance && instance.id) {
    gridRef.value?.addItem(instance as any);
  }
};

// Lister les composants enregistrés
const listRegisteredComponents = () => {
  console.log('Items dans la grille:', gridItems.value);
  console.log("Nombre d'items:", gridItems.value.length);
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex gap-2">
      <button
        class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        @click="addControlButton"
      >
        Ajouter un ControlButton
      </button>
      <button
        class="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
        @click="listRegisteredComponents"
      >
        Lister les composants
      </button>
    </div>

    <ControlsGrid
      ref="gridRef"
      v-model:items="gridItems"
      :cell-size="80"
      :gap="8"
      :min-columns="6"
      class="h-[600px]"
    />
  </div>
</template>
