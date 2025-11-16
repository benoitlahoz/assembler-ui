<script setup lang="ts">
import { ref, h } from 'vue';
import { useSlotRegistry } from '../useSlotRegistry';
import NotificationItem from './NotificationItem.vue';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

const { createSlotRegistry } = useSlotRegistry<NotificationData>();

const { registry, renderSlots } = createSlotRegistry({
  defaultSort: { by: 'timestamp', order: 'desc' },
});

// Gestionnaire de notifications
const notificationIdCounter = ref(0);
const activeNotifications = ref<NotificationData[]>([]);

const showNotification = (
  type: NotificationType,
  title: string,
  message: string,
  duration = 5000
) => {
  const id = `notification-${++notificationIdCounter.value}`;
  const notification: NotificationData = {
    id,
    type,
    title,
    message,
    duration,
  };

  activeNotifications.value.push(notification);

  // Auto-remove après duration
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }
};

const removeNotification = (id: string) => {
  activeNotifications.value = activeNotifications.value.filter((n) => n.id !== id);
};

// Exemples de notifications
const showInfo = () => {
  showNotification('info', 'Information', 'Ceci est une notification informative.');
};

const showSuccess = () => {
  showNotification('success', 'Succès', "L'opération a été effectuée avec succès.");
};

const showWarning = () => {
  showNotification('warning', 'Avertissement', 'Attention, ceci nécessite votre attention.');
};

const showError = () => {
  showNotification(
    'error',
    'Erreur',
    'Une erreur est survenue lors du traitement.',
    0 // persist
  );
};
</script>

<template>
  <div class="relative w-full rounded-lg border bg-card p-6">
    <h3 class="mb-4 font-semibold">Notification Provider Demo</h3>

    <!-- Actions pour déclencher les notifications -->
    <div class="mb-6 flex flex-wrap gap-2">
      <button
        class="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
        @click="showInfo"
      >
        Info
      </button>
      <button
        class="rounded bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"
        @click="showSuccess"
      >
        Success
      </button>
      <button
        class="rounded bg-orange-500 px-3 py-1.5 text-sm text-white hover:bg-orange-600"
        @click="showWarning"
      >
        Warning
      </button>
      <button
        class="rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
        @click="showError"
      >
        Error
      </button>
    </div>

    <!-- Container des notifications (position fixe) -->
    <div class="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <component :is="() => renderSlots()" />
    </div>

    <!-- Affichage dynamique des notifications -->
    <NotificationItem
      v-for="notification in activeNotifications"
      :key="notification.id"
      :registry="registry"
      :notification="notification"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>
