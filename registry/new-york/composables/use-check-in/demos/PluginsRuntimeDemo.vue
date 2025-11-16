<script setup lang="ts">
/**
 * Demo: Toolbar avec slots natifs + hooks runtime
 *
 * Cette démo montre comment :
 * - Utiliser les slots natifs pour organiser les boutons
 * - Créer des hooks runtime pour tracker les interactions
 * - Gérer le cycle de vie des hooks simplement
 */

import { ref, computed, onMounted } from 'vue';
import { useCheckIn } from '../useCheckIn';
import type { DeskHook, CheckInItem } from '../types';

// ==========================================
// TYPES
// ==========================================

interface ToolbarButton {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}

// ==========================================
// HOOK ANALYTICS (Simple et léger)
// ==========================================

interface AnalyticsEvent {
  type: 'button-click' | 'check-in' | 'check-out';
  itemId: string | number;
  timestamp: number;
  data?: any;
}

const createAnalyticsHook = (): DeskHook<ToolbarButton> & {
  getStats: () => {
    totalEvents: number;
    buttonClicks: number;
    checkIns: number;
    checkOuts: number;
  };
  getHistory: () => AnalyticsEvent[];
} => {
  const events: AnalyticsEvent[] = [];
  const stats = {
    totalEvents: 0,
    buttonClicks: 0,
    checkIns: 0,
    checkOuts: 0,
  };

  const track = (event: AnalyticsEvent) => {
    events.push(event);
    stats.totalEvents++;

    if (event.type === 'button-click') stats.buttonClicks++;
    else if (event.type === 'check-in') stats.checkIns++;
    else if (event.type === 'check-out') stats.checkOuts++;
  };

  return {
    name: 'analytics',
    onCheckIn: (item: CheckInItem<ToolbarButton>) => {
      track({
        type: 'check-in',
        itemId: item.id,
        timestamp: Date.now(),
        data: item.data,
      });
    },
    onCheckOut: (id: string | number) => {
      track({
        type: 'check-out',
        itemId: id,
        timestamp: Date.now(),
      });
    },
    getStats: () => ({ ...stats }),
    getHistory: () => [...events],
  };
};

// ==========================================
// COMPOSABLE
// ==========================================

const { createDesk } = useCheckIn<ToolbarButton>();
const { desk } = createDesk({ debug: true });

// Hook Analytics
const analyticsHook = createAnalyticsHook();

// State
const showAnalytics = ref(false);
const message = ref('');

// ==========================================
// INITIALISER SLOTS ET HOOKS
// ==========================================

const initializeDeskFeatures = () => {
  // Configurer les slots natifs
  desk.slots.register('header-left', 'toolbar', { align: 'left' });
  desk.slots.register('header-right', 'toolbar', { align: 'right' });
  desk.slots.register('footer', 'toolbar', { align: 'center' });

  // Ajouter le hook analytics
  desk.hooks.add(analyticsHook);

  // Écouter les événements pour tracker les clics
  desk.on('check-in', (payload) => {
    console.log('[Demo] Item checked in:', payload);
  });

  message.value = 'Desk initialisé avec slots et hooks !';
  setTimeout(() => (message.value = ''), 3000);
};

// ==========================================
// HELPERS
// ==========================================

const addButton = (slotId: string, id: string, button: ToolbarButton) => {
  desk.checkIn(id, button, {
    user: { slotId },
  });
};

const createButtonHandler = (label: string, id: string) => {
  return () => {
    message.value = `${label} cliqué !`;

    // Tracker le clic manuellement
    analyticsHook.getHistory().push({
      type: 'button-click',
      itemId: id,
      timestamp: Date.now(),
      data: { label },
    });

    setTimeout(() => (message.value = ''), 2000);
  };
};

// ==========================================
// COMPUTED
// ==========================================

const headerLeft = computed(() => desk.slots.get('header-left'));
const headerRight = computed(() => desk.slots.get('header-right'));
const footer = computed(() => desk.slots.get('footer'));

const stats = computed(() => analyticsHook.getStats());
const history = computed(() => analyticsHook.getHistory());

const activeHooks = computed(() => desk.hooks.list());
const activeSlots = computed(() => desk.slots.list());

// ==========================================
// ACTIONS
// ==========================================

const addSampleButtons = () => {
  // Header Left
  addButton('header-left', 'btn-new', {
    label: 'Nouveau',
    icon: '➕',
    variant: 'primary',
    onClick: createButtonHandler('Nouveau', 'btn-new'),
  });

  addButton('header-left', 'btn-open', {
    label: 'Ouvrir',
    icon: '📂',
    variant: 'secondary',
    onClick: createButtonHandler('Ouvrir', 'btn-open'),
  });

  addButton('header-left', 'btn-save', {
    label: 'Sauvegarder',
    icon: '💾',
    variant: 'primary',
    onClick: createButtonHandler('Sauvegarder', 'btn-save'),
  });

  // Header Right
  addButton('header-right', 'btn-settings', {
    label: 'Paramètres',
    icon: '⚙️',
    variant: 'secondary',
    onClick: createButtonHandler('Paramètres', 'btn-settings'),
  });

  addButton('header-right', 'btn-help', {
    label: 'Aide',
    icon: '❓',
    variant: 'secondary',
    onClick: createButtonHandler('Aide', 'btn-help'),
  });

  // Footer
  addButton('footer', 'btn-delete', {
    label: 'Supprimer',
    icon: '🗑️',
    variant: 'danger',
    onClick: createButtonHandler('Supprimer', 'btn-delete'),
  });

  addButton('footer', 'btn-close', {
    label: 'Fermer',
    icon: '✖️',
    variant: 'secondary',
    onClick: createButtonHandler('Fermer', 'btn-close'),
  });

  message.value = 'Boutons ajoutés !';
  setTimeout(() => (message.value = ''), 2000);
};

const removeAllButtons = () => {
  desk.clear();
  message.value = 'Tous les boutons supprimés !';
  setTimeout(() => (message.value = ''), 2000);
};

const toggleAnalytics = () => {
  showAnalytics.value = !showAnalytics.value;
};

// ==========================================
// LIFECYCLE
// ==========================================

onMounted(() => {
  initializeDeskFeatures();
  addSampleButtons();
});
</script>

<template>
  <div class="demo-container">
    <!-- En-tête de la démo -->
    <div class="demo-header">
      <h2>🔌 Démo: Slots Natifs + Hooks Runtime</h2>
      <p class="demo-description">
        Cette démo montre les slots intégrés au desk et les hooks comme simple système d'extension.
      </p>
    </div>

    <!-- Message de feedback -->
    <Transition name="fade">
      <div v-if="message" class="message">
        {{ message }}
      </div>
    </Transition>

    <!-- Informations sur les hooks et slots -->
    <div class="plugins-info">
      <div class="info-section">
        <h3>🎣 Hooks actifs</h3>
        <div class="plugins-list">
          <span v-for="hook in activeHooks" :key="hook" class="plugin-badge plugin-custom">
            {{ hook }}
          </span>
        </div>
      </div>

      <div class="info-section">
        <h3>📦 Slots enregistrés</h3>
        <div class="plugins-list">
          <span
            v-for="slot in activeSlots"
            :key="slot.id"
            class="plugin-badge plugin-core"
            :title="`Type: ${slot.type}`"
          >
            {{ slot.id }}
          </span>
        </div>
      </div>
    </div>

    <!-- Toolbar principale -->
    <div class="toolbar-demo">
      <!-- Header avec slots -->
      <header class="toolbar-header">
        <div class="toolbar-section left">
          <button
            v-for="item in headerLeft"
            :key="item.id"
            :class="['toolbar-btn', `btn-${item.data.variant}`]"
            :disabled="item.data.disabled"
            @click="item.data.onClick"
          >
            <span v-if="item.data.icon" class="btn-icon">{{ item.data.icon }}</span>
            {{ item.data.label }}
          </button>
        </div>

        <div class="toolbar-section right">
          <button
            v-for="item in headerRight"
            :key="item.id"
            :class="['toolbar-btn', `btn-${item.data.variant}`]"
            :disabled="item.data.disabled"
            @click="item.data.onClick"
          >
            <span v-if="item.data.icon" class="btn-icon">{{ item.data.icon }}</span>
            {{ item.data.label }}
          </button>
        </div>
      </header>

      <!-- Zone de contenu -->
      <main class="toolbar-content">
        <div class="content-placeholder">
          <h3>📋 Zone de contenu</h3>
          <p>Les boutons de la toolbar sont organisés dynamiquement via le plugin Slots.</p>
          <p>Chaque interaction est trackée par le plugin Analytics.</p>

          <div class="stats-summary" v-if="stats">
            <div class="stat-item">
              <strong>{{ stats.totalEvents }}</strong>
              <span>événements</span>
            </div>
            <div class="stat-item">
              <strong>{{ stats.buttonClicks }}</strong>
              <span>clics</span>
            </div>
            <div class="stat-item">
              <strong>{{ stats.checkIns }}</strong>
              <span>check-ins</span>
            </div>
            <div class="stat-item">
              <strong>{{ stats.checkOuts }}</strong>
              <span>check-outs</span>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer avec slots -->
      <footer class="toolbar-footer">
        <button
          v-for="item in footer"
          :key="item.id"
          :class="['toolbar-btn', `btn-${item.data.variant}`]"
          :disabled="item.data.disabled"
          @click="item.data.onClick"
        >
          <span v-if="item.data.icon" class="btn-icon">{{ item.data.icon }}</span>
          {{ item.data.label }}
        </button>
      </footer>
    </div>

    <!-- Actions de contrôle -->
    <div class="demo-controls">
      <button @click="addSampleButtons" class="control-btn">➕ Ajouter des boutons</button>
      <button @click="removeAllButtons" class="control-btn danger">🗑️ Tout supprimer</button>
      <button @click="toggleAnalytics" class="control-btn">
        📊 {{ showAnalytics ? 'Masquer' : 'Afficher' }} Analytics
      </button>
    </div>

    <!-- Panel Analytics -->
    <Transition name="slide">
      <div v-if="showAnalytics" class="analytics-panel">
        <h3>📊 Analytics en temps réel</h3>

        <div class="analytics-stats">
          <h4>Statistiques</h4>
          <pre>{{ stats }}</pre>
        </div>

        <div class="analytics-history">
          <h4>Historique des événements ({{ history.length }} derniers)</h4>
          <div class="events-list">
            <div
              v-for="(event, index) in history.slice(-10).reverse()"
              :key="index"
              class="event-item"
              :class="`event-${event.type}`"
            >
              <span class="event-type">{{ event.type }}</span>
              <span class="event-id">{{ event.itemId }}</span>
              <span class="event-time">
                {{ new Date(event.timestamp).toLocaleTimeString() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Code source -->
    <details class="code-section">
      <summary>📝 Voir le code source</summary>
      <div class="code-example">
        <h4>Initialisation du desk avec slots et hooks</h4>
        <pre><code>const { createDesk } = useCheckIn&lt;ToolbarButton&gt;();
const { desk } = createDesk({ debug: true });

// Enregistrer des slots natifs
desk.slots.register('header-left', 'toolbar', { align: 'left' });
desk.slots.register('header-right', 'toolbar', { align: 'right' });

// Ajouter un hook simple
const analyticsHook = createAnalyticsHook();
desk.hooks.add(analyticsHook);</code></pre>

        <h4>Utilisation des slots</h4>
        <pre><code>// Récupérer les items d'un slot
const headerLeft = computed(() => desk.slots.get('header-left'));

// Check-in dans un slot
desk.checkIn('btn-new', buttonData, {
  user: { slotId: 'header-left' }
});</code></pre>

        <h4>Créer un hook simple</h4>
        <pre><code>const createAnalyticsHook = (): DeskHook&lt;T&gt; => ({
  name: 'analytics',
  onCheckIn: (item) => {
    console.log('Item checked in:', item);
  },
  onCheckOut: (id) => {
    console.log('Item checked out:', id);
  },
});</code></pre>
      </div>
    </details>
  </div>
</template>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
}

.demo-header {
  margin-bottom: 2rem;
  text-align: center;
}

.demo-header h2 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.demo-description {
  color: #666;
  margin: 0;
}

.message {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: #4caf50;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-weight: 500;
}

.plugins-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.info-section h3 {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  text-transform: uppercase;
  color: #666;
}

.plugins-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.plugin-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.plugin-core {
  background: #e3f2fd;
  color: #1976d2;
}

.plugin-custom {
  background: #fff3e0;
  color: #f57c00;
}

.toolbar-demo {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.toolbar-header {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.toolbar-section {
  display: flex;
  gap: 0.5rem;
}

.toolbar-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  cursor: pointer;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar-btn:hover:not(:disabled) {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
}

.btn-danger {
  background: #ef5350;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #e53935;
}

.btn-icon {
  font-size: 1rem;
}

.toolbar-content {
  min-height: 300px;
  padding: 2rem;
  background: #fafafa;
}

.content-placeholder {
  text-align: center;
  color: #666;
}

.content-placeholder h3 {
  margin: 0 0 0.5rem;
  color: #333;
}

.stats-summary {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  min-width: 100px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-item strong {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.stat-item span {
  font-size: 0.75rem;
  color: #666;
  text-transform: uppercase;
}

.toolbar-footer {
  padding: 1rem;
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.demo-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.control-btn {
  padding: 0.75rem 1.5rem;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  cursor: pointer;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.control-btn.danger {
  border-color: #ef5350;
  color: #ef5350;
}

.control-btn.danger:hover {
  background: #ef5350;
  color: white;
}

.analytics-panel {
  background: #1e1e1e;
  color: #e0e0e0;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.analytics-panel h3 {
  margin: 0 0 1.5rem;
  color: white;
}

.analytics-panel h4 {
  margin: 0 0 0.75rem;
  color: #64b5f6;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.analytics-stats pre {
  background: #2d2d2d;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0 0 1.5rem;
}

.events-list {
  max-height: 200px;
  overflow-y: auto;
  background: #2d2d2d;
  border-radius: 6px;
  padding: 0.5rem;
}

.event-item {
  display: flex;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}

.event-button-click {
  background: rgba(76, 175, 80, 0.1);
}

.event-check-in {
  background: rgba(33, 150, 243, 0.1);
}

.event-check-out {
  background: rgba(255, 152, 0, 0.1);
}

.event-type {
  color: #64b5f6;
  font-weight: 600;
  min-width: 100px;
}

.event-id {
  color: #81c784;
  flex: 1;
}

.event-time {
  color: #999;
}

.code-section {
  margin-top: 2rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.code-section summary {
  padding: 1rem;
  background: #f5f5f5;
  cursor: pointer;
  font-weight: 600;
  user-select: none;
}

.code-section summary:hover {
  background: #eeeeee;
}

.code-example {
  padding: 1.5rem;
  background: #fafafa;
}

.code-example h4 {
  margin: 1.5rem 0 0.5rem;
  color: #666;
  font-size: 0.875rem;
  text-transform: uppercase;
}

.code-example h4:first-child {
  margin-top: 0;
}

.code-example pre {
  background: #2d2d2d;
  color: #e0e0e0;
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0;
}

.code-example code {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
