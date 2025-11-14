<script setup lang="ts">
import { provide, readonly } from 'vue';
import {
  useDragDrop,
  type UseDragDropOptions,
  type UseDragDropReturn,
} from '~~/registry/new-york/composables/use-drag-drop/useDragDrop';
import { DRAG_DROP_INJECTION_KEY } from '~~/registry/new-york/composables/use-drag-drop-context/useDragDropContext';

interface Props extends UseDragDropOptions {
  /**
   * Mode d'interaction (peut être étendu pour supporter d'autres modes)
   * @default 'drag'
   */
  mode?: 'drag' | 'resize' | 'both';
}

const props = withDefaults(defineProps<Props>(), {
  gap: 0,
  allowCollision: false,
  mode: 'drag',
});

// Créer l'instance du composable
const dragDropInstance = useDragDrop({
  containerRef: props.containerRef,
  unitSize: props.unitSize,
  gap: props.gap,
  allowCollision: props.allowCollision,
  validatePlacement: props.validatePlacement,
});

// Fournir l'instance aux composants enfants via provide
provide(DRAG_DROP_INJECTION_KEY, {
  ...dragDropInstance,
  options: readonly({
    containerRef: props.containerRef,
    unitSize: props.unitSize,
    gap: props.gap,
    allowCollision: props.allowCollision,
    mode: props.mode,
  }),
});

// Exposer l'instance pour utilisation directe si nécessaire
defineExpose(dragDropInstance);
</script>

<template>
  <slot
    v-bind="{
      dragState: dragDropInstance.dragState.value,
      dragOffset: dragDropInstance.dragOffset.value,
      containerBounds: dragDropInstance.containerBounds,
      startDrag: dragDropInstance.startDrag,
      handleDragOver: dragDropInstance.handleDragOver,
      handleDragOverSimple: dragDropInstance.handleDragOverSimple,
      endDrag: dragDropInstance.endDrag,
      getVirtualBounds: dragDropInstance.getVirtualBounds,
      getItemFromDataTransfer: dragDropInstance.getItemFromDataTransfer,
    }"
  />
</template>
