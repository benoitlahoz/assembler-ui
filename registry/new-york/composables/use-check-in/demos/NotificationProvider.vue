<script setup lang="ts">
import { provide, computed } from 'vue';
import { useCheckIn } from '../useCheckIn';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItemData {
  message: string;
  type: NotificationType;
  duration?: number;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const props = withDefaults(
  defineProps<{
    /** Position des notifications */
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    /** Durée par défaut (ms) */
    defaultDuration?: number;
  }>(),
  {
    position: 'top-right',
    defaultDuration: 5000,
  }
);

// Créer le desk pour enregistrer les notifications
const { desk, DeskInjectionKey } = useCheckIn<NotificationItemData>().createDesk({
  context: {},
  onCheckIn: (id, data) => {
    console.log('[NotificationProvider] Notification added:', id, data);

    // Auto-remove après duration si spécifié
    if (data.duration && data.duration > 0) {
      setTimeout(() => {
        desk.checkOut(id);
      }, data.duration);
    }
  },
});

// Fournir le desk aux enfants
provide(DeskInjectionKey, desk);

// Récupérer toutes les notifications triées par timestamp (plus récentes en premier)
const notifications = computed(() => desk.getAll({ sortBy: 'timestamp', order: 'desc' }));

const handleDismiss = (id: string | number, onDismiss?: () => void) => {
  desk.checkOut(id);
  onDismiss?.();
};

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✕';
    case 'warning':
      return '⚠';
    case 'info':
      return 'ℹ';
  }
};
</script>

<template>
  <div class="notification-provider">
    <!-- Le slot contient les NotificationItem qui s'enregistrent -->
    <slot />

    <!-- Rendu des notifications -->
    <div class="notification-container" :class="`position-${position}`">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="notification"
        :class="`notification-${item.data.type}`"
      >
        <span class="notification-icon">{{ getTypeIcon(item.data.type) }}</span>
        <span class="notification-message">{{ item.data.message }}</span>
        <button
          v-if="item.data.dismissible !== false"
          class="notification-close"
          @click="handleDismiss(item.id, item.data.onDismiss)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-provider {
  position: relative;
}

.notification-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  pointer-events: none;
}

.notification-container.position-top-right {
  top: 0;
  right: 0;
}

.notification-container.position-top-left {
  top: 0;
  left: 0;
}

.notification-container.position-bottom-right {
  bottom: 0;
  right: 0;
}

.notification-container.position-bottom-left {
  bottom: 0;
  left: 0;
}

.notification {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius);
  box-shadow: 0 4px 6px hsl(var(--foreground) / 0.1);
  min-width: 300px;
  max-width: 400px;
  pointer-events: auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-info {
  background: hsl(var(--primary) / 0.1);
  border-left: 4px solid hsl(var(--primary));
  color: hsl(var(--primary));
}

.notification-success {
  background: hsl(142 76% 36% / 0.1);
  border-left: 4px solid hsl(142 76% 36%);
  color: hsl(142 76% 36%);
}

.notification-warning {
  background: hsl(38 92% 50% / 0.1);
  border-left: 4px solid hsl(38 92% 50%);
  color: hsl(38 92% 50%);
}

.notification-error {
  background: hsl(var(--destructive) / 0.1);
  border-left: 4px solid hsl(var(--destructive));
  color: hsl(var(--destructive));
}

.notification-icon {
  font-size: 1.25rem;
  font-weight: bold;
}

.notification-message {
  flex: 1;
  font-size: 0.875rem;
}

.notification-close {
  padding: 0.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
  font-size: 1rem;
}

.notification-close:hover {
  opacity: 1;
}
</style>
