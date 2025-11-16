<script setup lang="ts">
import { h, ref, watch } from 'vue';
import { useSlotRegistry, type SlotRegistry } from '../useSlotRegistry';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

interface Props {
  registry: SlotRegistry<NotificationData>;
  notification: NotificationData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

const { registerSlot } = useSlotRegistry<NotificationData>();

const isVisible = ref(true);

// S'enregistrer quand visible, se retirer quand caché
watch(
  isVisible,
  (visible) => {
    if (!visible) {
      // Petit délai pour l'animation de sortie
      setTimeout(() => {
        emit('close');
      }, 300);
    }
  },
  { immediate: false }
);

const iconMap: Record<NotificationType, string> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert-triangle',
  error: 'x-circle',
};

const colorMap: Record<NotificationType, string> = {
  info: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
  success: 'border-green-500 bg-green-50 dark:bg-green-950',
  warning: 'border-orange-500 bg-orange-50 dark:bg-orange-950',
  error: 'border-red-500 bg-red-50 dark:bg-red-950',
};

registerSlot(props.registry, {
  id: props.notification.id,
  autoRegister: true,
  visible: () => isVisible.value,
  render: () => {
    return h(
      'div',
      {
        class: [
          'pointer-events-auto min-w-80 rounded-lg border-l-4 p-4 shadow-lg transition-all',
          colorMap[props.notification.type],
          isVisible.value ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
        ],
      },
      [
        // Header avec titre et bouton close
        h('div', { class: 'flex items-start justify-between gap-3' }, [
          // Icon + Title
          h('div', { class: 'flex items-center gap-2' }, [
            h('span', {
              class: `i-lucide-${iconMap[props.notification.type]} h-5 w-5`,
            }),
            h('h4', { class: 'font-semibold' }, props.notification.title),
          ]),
          // Close button
          h(
            'button',
            {
              class: 'text-muted-foreground hover:text-foreground transition-colors',
              onClick: () => {
                isVisible.value = false;
              },
            },
            [
              h('span', {
                class: 'i-lucide-x h-4 w-4',
              }),
            ]
          ),
        ]),
        // Message
        h('p', { class: 'mt-1 text-sm text-muted-foreground' }, props.notification.message),
      ]
    );
  },
});
</script>

<template>
  <!-- Pas de template, tout est rendu via la render function -->
</template>
