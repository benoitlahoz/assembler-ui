<script setup lang="ts">
import { inject } from 'vue';
import { useCheckIn } from '../useCheckIn';
import type { BreadcrumbItemData } from './BreadcrumbContainer.vue';

const props = withDefaults(
  defineProps<{
    /** Identifiant unique de l'item */
    id?: string;
    /** Label de l'item */
    label: string;
    /** URL de l'item (optionnel) */
    href?: string;
    /** Icône optionnelle */
    icon?: string;
    /** Item désactivé */
    disabled?: boolean;
    /** Position dans le breadcrumb (pour tri) */
    position?: number;
  }>(),
  {
    position: 0,
  }
);

const emit = defineEmits<{
  click: [];
}>();

// Injecter le desk
const desk = inject<any>('__check_in_desk__' as any);

// S'enregistrer auprès du desk
useCheckIn<BreadcrumbItemData>().checkIn(desk, {
  autoCheckIn: true,
  id: props.id,
  group: 'breadcrumb',
  position: props.position,
  data: () => ({
    label: props.label,
    href: props.href,
    icon: props.icon,
    disabled: props.disabled,
    onClick: () => emit('click'),
  }),
  watchData: true,
  shallow: true,
});
</script>

<template>
  <!-- Transparent - ne rend rien -->
</template>
