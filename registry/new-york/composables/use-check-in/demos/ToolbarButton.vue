<script setup lang="ts">
import { computed, inject } from 'vue';
import { useCheckIn } from '../useCheckIn';
import type { ToolbarItemData } from './ToolbarContainer.vue';

const props = withDefaults(
  defineProps<{
    /** Identifiant unique du bouton */
    id?: string;
    /** Label du bouton */
    label: string;
    /** Icône optionnelle */
    icon?: string;
    /** Bouton désactivé */
    disabled?: boolean;
    /** Groupe d'appartenance: start, main, end */
    group?: 'start' | 'main' | 'end';
    /** Position dans le groupe (pour tri) */
    position?: number;
  }>(),
  {
    group: 'main',
    position: 0,
  }
);

const emit = defineEmits<{
  click: [];
}>();

// Récupérer le contexte fourni par useCheckIn().createDesk()
// Dans ToolbarContainer, on a utilisé provide(DeskInjectionKey, desk)
// On peut donc injecter n'importe quel desk avec ce type
const desk = inject<any>('__check_in_desk__' as any);

// Utiliser useCheckIn pour s'enregistrer dans le desk fourni par ToolbarContainer
const {} = useCheckIn<ToolbarItemData>().checkIn(desk, {
  autoCheckIn: true,
  id: props.id,
  group: props.group,
  position: props.position,
  data: () => ({
    label: props.label,
    icon: props.icon,
    disabled: props.disabled,
    onClick: () => emit('click'),
  }),
  watchData: true,
  shallow: true,
});
</script>

<template>
  <!-- Ce composant ne rend rien, il s'enregistre juste auprès du ToolbarContainer -->
  <!-- Le rendu est géré par ToolbarContainer qui lit les items enregistrés -->
</template>
