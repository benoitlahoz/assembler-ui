/**
 * Exemple complet d'utilisation des plugins au runtime
 * Démontre le chargement dynamique et l'accès typesafe
 */

// ============================================
// 1. DÉFINITION D'UN PLUGIN CUSTOM
// ============================================

import type { Plugin, PluginContext, CheckInItem } from '../types';

export interface AnalyticsEvent {
  type: 'check-in' | 'check-out' | 'update';
  itemId: string | number;
  timestamp: number;
  data?: any;
}

export interface AnalyticsPluginOptions {
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

export interface AnalyticsPlugin<T = any> extends Plugin<T> {
  /** Track un événement custom */
  track: (event: AnalyticsEvent) => void;
  /** Flush les événements en attente */
  flush: () => Promise<void>;
  /** Récupère les statistiques */
  getStats: () => {
    totalEvents: number;
    checkIns: number;
    checkOuts: number;
    updates: number;
  };
}

export const createAnalyticsPlugin = <T = any>(
  options?: AnalyticsPluginOptions
): AnalyticsPlugin<T> => {
  let context: PluginContext<T> | null = null;
  const events: AnalyticsEvent[] = [];
  let stats = {
    totalEvents: 0,
    checkIns: 0,
    checkOuts: 0,
    updates: 0,
  };

  const track = (event: AnalyticsEvent) => {
    events.push(event);
    stats.totalEvents++;

    if (event.type === 'check-in') stats.checkIns++;
    else if (event.type === 'check-out') stats.checkOuts++;
    else if (event.type === 'update') stats.updates++;

    context?.debug('[Analytics] Tracked event:', event);

    // Auto-flush si batch size atteinte
    if (options?.batchSize && events.length >= options.batchSize) {
      flush();
    }
  };

  const flush = async () => {
    if (events.length === 0) return;

    const endpoint = options?.endpoint || '/api/analytics';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: [...events] }),
      });

      if (response.ok) {
        context?.debug('[Analytics] Flushed', events.length, 'events');
        events.length = 0; // Clear après succès
      }
    } catch (error) {
      console.error('[Analytics] Failed to flush:', error);
    }
  };

  const getStats = () => ({ ...stats });

  let flushInterval: NodeJS.Timeout | null = null;

  return {
    name: 'analytics',
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug('[Plugin] Analytics plugin installed');

      // Setup auto-flush interval
      if (options?.flushInterval) {
        flushInterval = setInterval(() => {
          flush();
        }, options.flushInterval);
      }
    },
    cleanup: () => {
      // Flush avant cleanup
      flush();

      if (flushInterval) {
        clearInterval(flushInterval);
      }

      context?.debug('[Analytics] Plugin cleaned up');
    },
    track,
    flush,
    getStats,
  };
};

// ============================================
// 2. UTILISATION DANS UN COMPOSABLE
// ============================================

import { ref, onMounted, onUnmounted } from 'vue';
import { useCheckIn, type CheckInDesk } from '../useCheckIn';
import type { SlotsPlugin } from './slots.plugin.example';

export interface ToolbarItem {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

export function useToolbarWithPlugins() {
  const { createDesk } = useCheckIn<ToolbarItem>();
  const { desk } = createDesk({ debug: true });

  // Références typées aux plugins
  const slotsPlugin = ref<SlotsPlugin<ToolbarItem>>();
  const analyticsPlugin = ref<AnalyticsPlugin<ToolbarItem>>();

  // Fonction pour charger les plugins au runtime
  const loadPlugins = async () => {
    // 1. Charger le plugin de slots (toujours)
    const { createSlotsPlugin } = await import('./slots.plugin.example');
    const slots = createSlotsPlugin<ToolbarItem>();
    desk.plugins.install(slots);
    slotsPlugin.value = desk.plugins.get<SlotsPlugin<ToolbarItem>>('slots');

    // Configurer les slots
    slotsPlugin.value?.registerSlot('header-left', 'toolbar', { align: 'left' });
    slotsPlugin.value?.registerSlot('header-right', 'toolbar', { align: 'right' });
    slotsPlugin.value?.registerSlot('footer', 'toolbar', { align: 'center' });

    // 2. Charger analytics seulement en production
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
      const analytics = createAnalyticsPlugin<ToolbarItem>({
        endpoint: '/api/analytics',
        batchSize: 10,
        flushInterval: 30000, // 30 secondes
      });

      desk.plugins.install(analytics);
      analyticsPlugin.value = desk.plugins.get<AnalyticsPlugin<ToolbarItem>>('analytics');

      // Tracker les événements automatiquement
      desk.on('check-in', (payload) => {
        analyticsPlugin.value?.track({
          type: 'check-in',
          itemId: payload.id,
          timestamp: payload.timestamp,
          data: payload.data,
        });
      });

      desk.on('check-out', (payload) => {
        analyticsPlugin.value?.track({
          type: 'check-out',
          itemId: payload.id,
          timestamp: payload.timestamp,
        });
      });
    }
  };

  // Helper pour ajouter un item dans un slot
  const addToSlot = (slotId: string, id: string, item: ToolbarItem) => {
    if (!slotsPlugin.value) {
      console.warn('Slots plugin not loaded');
      return;
    }

    desk.checkIn(id, item, {
      user: { slotId, slotType: 'toolbar' },
    });
  };

  // Helper pour obtenir les items d'un slot
  const getSlotItems = (slotId: string) => {
    return slotsPlugin.value?.getSlotItems(slotId) ?? [];
  };

  // Helper pour obtenir les stats analytics
  const getAnalyticsStats = () => {
    return analyticsPlugin.value?.getStats() ?? null;
  };

  onMounted(() => {
    loadPlugins();
  });

  onUnmounted(() => {
    // Flush analytics avant de quitter
    analyticsPlugin.value?.flush();
  });

  return {
    desk,
    slotsPlugin,
    analyticsPlugin,
    addToSlot,
    getSlotItems,
    getAnalyticsStats,
    loadPlugins,
  };
}

// ============================================
// 3. UTILISATION DANS UN COMPOSANT VUE
// ============================================

/**
 * Exemple de composant Vue utilisant les plugins
 */
export const ToolbarWithPluginsExample = `
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useToolbarWithPlugins } from './useToolbarWithPlugins';

const {
  desk,
  slotsPlugin,
  analyticsPlugin,
  addToSlot,
  getSlotItems,
  getAnalyticsStats
} = useToolbarWithPlugins();

// Ajouter des items dans différents slots
const addSaveButton = () => {
  addToSlot('header-left', 'btn-save', {
    label: 'Save',
    icon: 'save',
    onClick: () => console.log('Save clicked')
  });
};

const addCancelButton = () => {
  addToSlot('header-right', 'btn-cancel', {
    label: 'Cancel',
    icon: 'close',
    onClick: () => console.log('Cancel clicked')
  });
};

// Computed pour les items de chaque slot
const headerLeft = computed(() => getSlotItems('header-left'));
const headerRight = computed(() => getSlotItems('header-right'));
const footer = computed(() => getSlotItems('footer'));

// Stats analytics
const stats = computed(() => getAnalyticsStats());

// Charger un plugin supplémentaire au runtime
const loadExtraPlugin = async () => {
  // Exemple de chargement conditionnel
  if (userHasPermission.value) {
    const { createPermissionsPlugin } = await import('./permissions.plugin');
    const permPlugin = createPermissionsPlugin();
    desk.plugins.install(permPlugin);
  }
};

// Lifecycle
onMounted(() => {
  addSaveButton();
  addCancelButton();
});
</script>

<template>
  <div class="toolbar-container">
    <!-- Header avec slots -->
    <header class="toolbar-header">
      <div class="toolbar-section left">
        <button
          v-for="item in headerLeft"
          :key="item.id"
          :disabled="item.data.disabled"
          @click="item.data.onClick"
          class="toolbar-button"
        >
          <span v-if="item.data.icon" class="icon">{{ item.data.icon }}</span>
          {{ item.data.label }}
        </button>
      </div>

      <div class="toolbar-section right">
        <button
          v-for="item in headerRight"
          :key="item.id"
          :disabled="item.data.disabled"
          @click="item.data.onClick"
          class="toolbar-button"
        >
          <span v-if="item.data.icon" class="icon">{{ item.data.icon }}</span>
          {{ item.data.label }}
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="content">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="toolbar-footer">
      <button
        v-for="item in footer"
        :key="item.id"
        :disabled="item.data.disabled"
        @click="item.data.onClick"
        class="toolbar-button"
      >
        {{ item.data.label }}
      </button>
    </footer>

    <!-- Analytics Debug (dev only) -->
    <div v-if="import.meta.env.DEV && stats" class="analytics-debug">
      <h4>Analytics Stats</h4>
      <pre>{{ stats }}</pre>
    </div>
  </div>
</template>

<style scoped>
.toolbar-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.toolbar-header {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.toolbar-section {
  display: flex;
  gap: 0.5rem;
}

.toolbar-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.toolbar-button:hover {
  background: #f0f0f0;
}

.toolbar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.content {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}

.toolbar-footer {
  padding: 1rem;
  background: #f5f5f5;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.analytics-debug {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
}
</style>
`;

// ============================================
// 4. TESTS AVEC PLUGINS RUNTIME
// ============================================

export const PluginRuntimeTests = `
import { describe, it, expect, vi } from 'vitest';
import { useCheckIn } from '../useCheckIn';
import { createAnalyticsPlugin } from './analytics.plugin';

describe('Plugin Runtime Loading', () => {
  it('should load plugin at runtime', () => {
    const { desk } = useCheckIn<any>().createDesk();
    
    expect(desk.plugins.has('analytics')).toBe(false);
    
    const analytics = createAnalyticsPlugin();
    desk.plugins.install(analytics);
    
    expect(desk.plugins.has('analytics')).toBe(true);
  });

  it('should provide typesafe access to plugin', () => {
    const { desk } = useCheckIn<any>().createDesk();
    
    const analytics = createAnalyticsPlugin();
    desk.plugins.install(analytics);
    
    const plugin = desk.plugins.get<AnalyticsPlugin>('analytics');
    
    expect(plugin).toBeDefined();
    expect(typeof plugin?.track).toBe('function');
    expect(typeof plugin?.flush).toBe('function');
  });

  it('should track events', () => {
    const { desk } = useCheckIn<any>().createDesk();
    
    const analytics = createAnalyticsPlugin();
    desk.plugins.install(analytics);
    
    const plugin = desk.plugins.get<AnalyticsPlugin>('analytics')!;
    
    plugin.track({
      type: 'check-in',
      itemId: 'test',
      timestamp: Date.now()
    });
    
    const stats = plugin.getStats();
    expect(stats.totalEvents).toBe(1);
    expect(stats.checkIns).toBe(1);
  });

  it('should uninstall plugin', () => {
    const { desk } = useCheckIn<any>().createDesk();
    
    const analytics = createAnalyticsPlugin();
    desk.plugins.install(analytics);
    
    expect(desk.plugins.has('analytics')).toBe(true);
    
    desk.plugins.uninstall('analytics');
    
    expect(desk.plugins.has('analytics')).toBe(false);
  });
});
`;
