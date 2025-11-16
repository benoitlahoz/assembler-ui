<script setup lang="ts">
import { inject } from 'vue';
import { useCheckIn } from '../useCheckIn';
import type { NotificationItemData } from './NotificationProvider.vue';

const props = withDefaults(
  defineProps<{
    /** Identifiant unique de la notification */
    id?: string;
    /** Message de la notification */
    message: string;
    /** Type de notification */
    type?: 'info' | 'success' | 'warning' | 'error';
    /** Durée avant auto-dismiss (ms) - 0 pour désactiver */
    duration?: number;
    /** Peut être fermée manuellement */
    dismissible?: boolean;
  }>(),
  {
    type: 'info',
    duration: 5000,
    dismissible: true,
  }
);

const emit = defineEmits<{
  dismiss: [];
}>();

// Injecter le desk
const desk = inject<any>('__check_in_desk__' as any);

// S'enregistrer auprès du desk
useCheckIn<NotificationItemData>().checkIn(desk, {
  autoCheckIn: true,
  id: props.id,
  data: () => ({
    message: props.message,
    type: props.type,
    duration: props.duration,
    dismissible: props.dismissible,
    onDismiss: () => emit('dismiss'),
  }),
  watchData: true,
  shallow: true,
});
</script>

<template>
  <!-- Transparent - ne rend rien -->
</template>
