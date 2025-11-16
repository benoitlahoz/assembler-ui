<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '~/components/ui/button';
import NotificationProvider from './NotificationProvider.vue';
import NotificationItem from './NotificationItem.vue';

const notifications = ref<
  Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    duration: number;
  }>
>([]);

let notificationCounter = 0;

const addNotification = (type: 'info' | 'success' | 'warning' | 'error', duration = 5000) => {
  const id = `notif-${++notificationCounter}`;
  const messages = {
    info: 'This is an informational message',
    success: 'Operation completed successfully!',
    warning: 'Please be careful with this action',
    error: 'An error occurred during the operation',
  };

  notifications.value.push({
    id,
    message: messages[type],
    type,
    duration,
  });

  // Auto-remove de notre liste après duration
  if (duration > 0) {
    setTimeout(() => {
      const index = notifications.value.findIndex((n) => n.id === id);
      if (index !== -1) {
        notifications.value.splice(index, 1);
      }
    }, duration);
  }
};

const handleDismiss = (id: string) => {
  console.log('Notification dismissed:', id);
  const index = notifications.value.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifications.value.splice(index, 1);
  }
};
</script>

<template>
  <div class="demo-container">
    <h2>Notification Pattern Demo</h2>
    <p>Les NotificationItem s'enregistrent et sont auto-removed après leur durée.</p>

    <NotificationProvider position="top-right">
      <!-- Notifications dynamiques -->
      <NotificationItem
        v-for="notif in notifications"
        :key="notif.id"
        :id="notif.id"
        :message="notif.message"
        :type="notif.type"
        :duration="notif.duration"
        @dismiss="handleDismiss(notif.id)"
      />
    </NotificationProvider>

    <!-- Controls -->
    <div class="controls">
      <h3>Add Notification:</h3>
      <div class="button-group">
        <Button @click="addNotification('info')" variant="default" size="sm">Info</Button>
        <Button @click="addNotification('success')" variant="default" size="sm">Success</Button>
        <Button @click="addNotification('warning')" variant="default" size="sm">Warning</Button>
        <Button @click="addNotification('error')" variant="destructive" size="sm">Error</Button>
      </div>
      <Button @click="addNotification('info', 0)" variant="outline" size="sm">
        Add Persistent (no auto-dismiss)
      </Button>
    </div>

    <!-- État actuel -->
    <div class="state-display">
      <h3>Active Notifications:</h3>
      <pre>{{ notifications.length }} notification(s)</pre>
      <ul v-if="notifications.length > 0">
        <li v-for="notif in notifications" :key="notif.id">
          {{ notif.type }}: {{ notif.message }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 0.5rem;
}

p {
  color: hsl(var(--muted-foreground));
  margin-bottom: 2rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.controls h3 {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
  margin: 0;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.state-display {
  margin-top: 2rem;
  padding: 1rem;
  background: hsl(var(--muted) / 0.3);
  border-radius: var(--radius);
}

.state-display h3 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
}

.state-display pre {
  font-family: var(--font-mono);
  margin: 0.5rem 0;
}

.state-display ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.state-display li {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  margin: 0.25rem 0;
}
</style>
