<script setup lang="ts">
import { inject } from 'vue';
import { useCheckIn } from '../useCheckIn';
import type { ContextMenuItemData } from './ContextMenuProvider.vue';

const props = withDefaults(
  defineProps<{
    /** Identifiant unique de l'item */
    id?: string;
    /** Label de l'item */
    label: string;
    /** Icône optionnelle */
    icon?: string;
    /** Item désactivé */
    disabled?: boolean;
    /** Afficher comme séparateur */
    separator?: boolean;
    /** Item dangereux (rouge) */
    danger?: boolean;
    /** Position dans le menu (pour tri) */
    position?: number;
  }>(),
  {
    position: 0,
    danger: false,
  }
);

const emit = defineEmits<{
  click: [];
}>();

// Injecter le desk
const desk = inject<any>('__check_in_desk__' as any);

// S'enregistrer auprès du desk (groupe 'main' ou 'danger')
useCheckIn<ContextMenuItemData>().checkIn(desk, {
  autoCheckIn: true,
  id: props.id,
  group: props.danger ? 'danger' : 'main',
  position: props.position,
  data: () => ({
    label: props.label,
    icon: props.icon,
    disabled: props.disabled,
    separator: props.separator,
    danger: props.danger,
    onClick: () => emit('click'),
  }),
  watchData: true,
  shallow: true,
});
</script>

<template>
  <!-- Transparent - ne rend rien -->
</template>
