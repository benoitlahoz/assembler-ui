---
title: useCheckIn
description: Generic check-in system for parent/child component registration pattern.
---

  <p class="text-pretty mt-4">Like an airport check-in desk: parent components provide a check-in counter<br>where child components register themselves with their data.</p>

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <plugins-runtime-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">


import { ref, computed, onMounted } from 'vue';
import { useCheckIn } from '../useCheckIn';
import type { DeskHook, CheckInItem } from '../types';





interface ToolbarButton {
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}





interface AnalyticsEvent {
  type: 'button-click' | 'check-in' | 'check-out';
  itemId: string | number;
  timestamp: number;
  data?: any;
}

const createAnalyticsHook = (): DeskHook<ToolbarButton> & {
  getStats: () => { totalEvents: number; buttonClicks: number; checkIns: number; checkOuts: number };
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





const { createDesk } = useCheckIn<ToolbarButton>();
const { desk } = createDesk({ debug: true });


const analyticsHook = createAnalyticsHook();


const showAnalytics = ref(false);
const message = ref('');





const initializeDeskFeatures = () => {
  
  desk.slots.register('header-left', 'toolbar', { align: 'left' });
  desk.slots.register('header-right', 'toolbar', { align: 'right' });
  desk.slots.register('footer', 'toolbar', { align: 'center' });

  
  desk.hooks.add(analyticsHook);

  
  desk.on('check-in', (payload) => {
    console.log('[Demo] Item checked in:', payload);
  });

  message.value = 'Desk initialisé avec slots et hooks !';
  setTimeout(() => message.value = '', 3000);
};





const addButton = (slotId: string, id: string, button: ToolbarButton) => {
  desk.checkIn(id, button, {
    user: { slotId }
  });
};

const createButtonHandler = (label: string, id: string) => {
  return () => {
    message.value = `${label} cliqué !`;
    
    
    analyticsHook.getHistory().push({
      type: 'button-click',
      itemId: id,
      timestamp: Date.now(),
      data: { label }
    });
    
    setTimeout(() => message.value = '', 2000);
  };
};





const headerLeft = computed(() => desk.slots.get('header-left'));
const headerRight = computed(() => desk.slots.get('header-right'));
const footer = computed(() => desk.slots.get('footer'));

const stats = computed(() => analyticsHook.getStats());
const history = computed(() => analyticsHook.getHistory());

const activeHooks = computed(() => desk.hooks.list());
const activeSlots = computed(() => desk.slots.list());





const addSampleButtons = () => {
  
  addButton('header-left', 'btn-new', {
    label: 'Nouveau',
    icon: '➕',
    variant: 'primary',
    onClick: createButtonHandler('Nouveau', 'btn-new')
  });

  addButton('header-left', 'btn-open', {
    label: 'Ouvrir',
    icon: '📂',
    variant: 'secondary',
    onClick: createButtonHandler('Ouvrir', 'btn-open')
  });

  addButton('header-left', 'btn-save', {
    label: 'Sauvegarder',
    icon: '💾',
    variant: 'primary',
    onClick: createButtonHandler('Sauvegarder', 'btn-save')
  });

  
  addButton('header-right', 'btn-settings', {
    label: 'Paramètres',
    icon: '⚙️',
    variant: 'secondary',
    onClick: createButtonHandler('Paramètres', 'btn-settings')
  });

  addButton('header-right', 'btn-help', {
    label: 'Aide',
    icon: '❓',
    variant: 'secondary',
    onClick: createButtonHandler('Aide', 'btn-help')
  });

  
  addButton('footer', 'btn-delete', {
    label: 'Supprimer',
    icon: '🗑️',
    variant: 'danger',
    onClick: createButtonHandler('Supprimer', 'btn-delete')
  });

  addButton('footer', 'btn-close', {
    label: 'Fermer',
    icon: '✖️',
    variant: 'secondary',
    onClick: createButtonHandler('Fermer', 'btn-close')
  });

  message.value = 'Boutons ajoutés !';
  setTimeout(() => message.value = '', 2000);
};

const removeAllButtons = () => {
  desk.clear();
  message.value = 'Tous les boutons supprimés !';
  setTimeout(() => message.value = '', 2000);
};

const toggleAnalytics = () => {
  showAnalytics.value = !showAnalytics.value;
};





onMounted(() => {
  initializeDeskFeatures();
  addSampleButtons();
});
</script>

<template>
  <div class="demo-container">
    
    <div class="demo-header">
      <h2>🔌 Démo: Slots Natifs + Hooks Runtime</h2>
      <p class="demo-description">
        Cette démo montre les slots intégrés au desk et les hooks comme simple système d'extension.
      </p>
    </div>

    
    <Transition name="fade">
      <div v-if="message" class="message">
        {{ message }}
      </div>
    </Transition>

    
    <div class="plugins-info">
      <div class="info-section">
        <h3>🎣 Hooks actifs</h3>
        <div class="plugins-list">
          <span
            v-for="hook in activeHooks"
            :key="hook"
            class="plugin-badge plugin-custom"
          >
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

    
    <div class="toolbar-demo">
      
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

    
    <div class="demo-controls">
      <button @click="addSampleButtons" class="control-btn">
        ➕ Ajouter des boutons
      </button>
      <button @click="removeAllButtons" class="control-btn danger">
        🗑️ Tout supprimer
      </button>
      <button @click="toggleAnalytics" class="control-btn">
        📊 {{ showAnalytics ? 'Masquer' : 'Afficher' }} Analytics
      </button>
    </div>

    
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

    
    <details class="code-section">
      <summary>📝 Voir le code source</summary>
      <div class="code-example">
        <h4>Initialisation du desk avec slots et hooks</h4>
        <pre><code>const { createDesk } = useCheckIn<ToolbarButton>();
const { desk } = createDesk({ debug: true });


desk.slots.register('header-left', 'toolbar', { align: 'left' });
desk.slots.register('header-right', 'toolbar', { align: 'right' });


const analyticsHook = createAnalyticsHook();
desk.hooks.add(analyticsHook);</code></pre>

        <h4>Utilisation des slots</h4>
        <pre><code>
const headerLeft = computed(() => desk.slots.get('header-left'));


desk.checkIn('btn-new', buttonData, {
  user: { slotId: 'header-left' }
});</code></pre>

        <h4>Créer un hook simple</h4>
        <pre><code>const createAnalyticsHook = (): DeskHook<T> => ({
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
  font-family: system-ui, -apple-system, sans-serif;
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
```
  :::
::

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-check-in/useCheckIn.ts"}

```ts [src/composables/use-check-in/useCheckIn.ts]
import {
  ref,
  provide,
  inject,
  onUnmounted,
  watch,
  computed,
  triggerRef,
  type InjectionKey,
  type Ref,
  type ComputedRef,
} from "vue";

export type {
  DeskEventType,
  DeskEventPayload,
  DeskEventCallback,
  CheckInItem,
  CheckInItemMeta,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
  GetAllOptions,
  SortOptions,
  DeskProvider,
  CheckInReturn,
  DeskHook,
  HooksAPI,
  SlotsAPI,
  SlotConfig,
} from "./types";

import type {
  CheckInItem,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
  DeskProvider,
  CheckInReturn,
  CheckInItemMeta,
  DeskEventType,
  DeskEventCallback,
  DeskEventPayload,
  DeskHook,
  SlotsAPI,
  HooksAPI,
  SlotConfig,
  GetAllOptions,
} from "./types";

const NoOpDebug = (_message: string, ..._args: any[]) => {};

const Debug = (message: string, ...args: any[]) => {
  console.log(`[useCheckIn] ${message}`, ...args);
};

const instanceIdMap = new WeakMap<object, string>();
const customIdMap = new Map<string, string>();

const sortFnCache = new Map<
  string,
  (a: CheckInItem<any>, b: CheckInItem<any>) => number
>();

const generateSecureId = (prefix = "item"): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${prefix}-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16)}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const compileSortFn = <T = any,>(
  sortBy: keyof T | "timestamp" | `meta.${string}`,
  order: "asc" | "desc" = "asc",
): ((a: CheckInItem<T>, b: CheckInItem<T>) => number) => {
  const cacheKey = `${String(sortBy)}-${order}`;
  const cached = sortFnCache.get(cacheKey);
  if (cached) return cached;

  const fn = (a: CheckInItem<T>, b: CheckInItem<T>) => {
    let aVal: any;
    let bVal: any;

    if (sortBy === "timestamp") {
      aVal = a.timestamp || 0;
      bVal = b.timestamp || 0;
    } else if (String(sortBy).startsWith("meta.")) {
      const metaKey = String(sortBy).slice(5);
      aVal = (a.meta as any)?.[metaKey];
      bVal = (b.meta as any)?.[metaKey];
    } else {
      aVal = a.data[sortBy as keyof T];
      bVal = b.data[sortBy as keyof T];
    }

    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    const result = aVal < bVal ? -1 : 1;
    return order === "asc" ? result : -result;
  };

  sortFnCache.set(cacheKey, fn);
  return fn;
};

export const useCheckIn = <
  T = any,
  TContext extends Record<string, any> = {},
>() => {
  const createDeskContext = <
    T = any,
    TContext extends Record<string, any> = {},
  >(
    options?: CheckInDeskOptions<T, TContext>,
  ): CheckInDesk<T, TContext> => {
    const registry = ref<Map<string | number, CheckInItem<T>>>(
      new Map(),
    ) as Ref<Map<string | number, CheckInItem<T>>>;

    const debug = options?.debug ? Debug : NoOpDebug;

    const eventListeners = new Map<
      DeskEventType,
      Set<DeskEventCallback<T, any>>
    >();

    const emit = <E extends DeskEventType>(
      event: E,
      payload: Omit<DeskEventPayload<T>[E], "timestamp">,
    ) => {
      const listeners = eventListeners.get(event);
      if (!listeners) return;

      const eventPayload = {
        ...payload,
        timestamp: Date.now(),
      } as DeskEventPayload<T>[E];

      debug(`[Event] ${event}`, eventPayload);
      listeners.forEach((callback) => callback(eventPayload));
    };

    const on = <E extends DeskEventType>(
      event: E,
      callback: DeskEventCallback<T, E>,
    ) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
      }
      eventListeners.get(event)!.add(callback);

      debug(
        `[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`,
      );

      return () => off(event, callback);
    };

    const off = <E extends DeskEventType>(
      event: E,
      callback: DeskEventCallback<T, E>,
    ) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        debug(
          `[Event] Listener removed for '${event}', remaining: ${listeners.size}`,
        );
      }
    };

    const checkIn = (
      id: string | number,
      data: T,
      meta?: CheckInItemMeta,
    ): boolean => {
      debug("checkIn", { id, data, meta });

      if (options?.onBeforeCheckIn) {
        const result = options.onBeforeCheckIn(id, data);
        if (result === false) {
          debug("checkIn cancelled by onBeforeCheckIn", id);
          return false;
        }
      }

      const item: CheckInItem<T> = {
        id,
        data: data as any,
        timestamp: Date.now(),
        meta,
      };

      registry.value.set(id, item);
      triggerRef(registry);

      emit("check-in", { id, data });

      options?.onCheckIn?.(id, data);

      hooks.trigger("onCheckIn", item);

      if (options?.debug) {
        debug("Registry state after check-in:", {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const checkOut = (id: string | number): boolean => {
      debug("checkOut", id);

      const existed = registry.value.has(id);
      if (!existed) return false;

      if (options?.onBeforeCheckOut) {
        const result = options.onBeforeCheckOut(id);
        if (result === false) {
          debug("checkOut cancelled by onBeforeCheckOut", id);
          return false;
        }
      }

      registry.value.delete(id);
      triggerRef(registry);

      emit("check-out", { id });

      options?.onCheckOut?.(id);

      hooks.trigger("onCheckOut", id);

      if (options?.debug) {
        debug("Registry state after check-out:", {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const get = (id: string | number) => registry.value.get(id);

    const has = (id: string | number) => registry.value.has(id);

    const update = (id: string | number, data: Partial<T>): boolean => {
      const item = registry.value.get(id);
      if (!item) return false;

      const updatedItem = {
        ...item,
        data: { ...item.data, ...data },
      };

      registry.value.set(id, updatedItem);
      triggerRef(registry);

      emit("update", { id, data: updatedItem.data });
      hooks.trigger("onUpdate", updatedItem);

      debug("update", { id, data });
      return true;
    };

    const clear = () => {
      registry.value.clear();
      triggerRef(registry);
      emit("clear", {});
      hooks.trigger("onClear");
      debug("clear");
    };

    const checkInMany = (
      items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
    ) => {
      items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
    };

    const checkOutMany = (ids: Array<string | number>) => {
      ids.forEach((id) => checkOut(id));
    };

    const updateMany = (
      updates: Array<{ id: string | number; data: Partial<T> }>,
    ) => {
      updates.forEach(({ id, data }) => update(id, data));
    };

    const getAll = (opts?: GetAllOptions<T>): CheckInItem<T>[] => {
      let items = Array.from(registry.value.values());

      if (opts?.group) {
        items = items.filter((item) => item.meta?.group === opts.group);
      }

      if (opts?.filter) {
        items = items.filter(opts.filter);
      }

      if (opts?.sortBy) {
        const sortFn = compileSortFn<T>(opts.sortBy, opts.order);
        items.sort(sortFn);
      }

      return items;
    };

    const getGroup = (
      group: string,
      sortOptions?: {
        sortBy?: keyof T | "timestamp" | `meta.${string}`;
        order?: "asc" | "desc";
      },
    ) => {
      return computed(() => getAll({ ...sortOptions, group }));
    };

    const items = computed(() => getAll());

    const slotsRegistry = new Map<string, SlotConfig>();

    const slots: SlotsAPI<T> = {
      register: (
        slotId: string,
        slotType: string,
        meta?: Record<string, any>,
      ) => {
        slotsRegistry.set(slotId, { id: slotId, type: slotType, meta });
        debug(`[Slots] Registered slot '${slotId}' of type '${slotType}'`);
      },
      unregister: (slotId: string) => {
        slotsRegistry.delete(slotId);
        debug(`[Slots] Unregistered slot '${slotId}'`);
      },
      get: (slotId: string): CheckInItem<T>[] => {
        return getAll({
          filter: (item) => item.meta?.user?.slotId === slotId,
        });
      },
      has: (slotId: string): boolean => {
        return slotsRegistry.has(slotId);
      },
      list: (): SlotConfig[] => {
        return Array.from(slotsRegistry.values());
      },
      clear: () => {
        slotsRegistry.clear();
        debug("[Slots] All slots cleared");
      },
    };

    const hooksRegistry = new Map<string, DeskHook<T>>();

    const hooks: HooksAPI<T> & {
      trigger: (method: keyof DeskHook<T>, ...args: any[]) => void;
    } = {
      add: (hook: DeskHook<T>) => {
        hooksRegistry.set(hook.name, hook);
        debug(`[Hooks] Added hook '${hook.name}'`);
      },
      remove: (name: string): boolean => {
        const hook = hooksRegistry.get(name);
        if (hook) {
          hook.cleanup?.();
          hooksRegistry.delete(name);
          debug(`[Hooks] Removed hook '${name}'`);
          return true;
        }
        return false;
      },
      list: (): string[] => {
        return Array.from(hooksRegistry.keys());
      },
      trigger: (method: keyof DeskHook<T>, ...args: any[]) => {
        hooksRegistry.forEach((hook) => {
          const fn = hook[method];
          if (typeof fn === "function") {
            (fn as any)(...args);
          }
        });
      },
    };

    if (options?.hooks) {
      options.hooks.forEach((hook) => hooks.add(hook));
    }

    const readonlyRegistry = computed(() => registry.value);

    return {
      registry: readonlyRegistry as any,
      slots,
      hooks,
      checkIn,
      checkOut,
      get,
      getAll,
      update,
      has,
      clear,
      checkInMany,
      checkOutMany,
      updateMany,
      on,
      off,
      emit,
      getGroup,
      items,
    };
  };

  const createDesk = (options?: CheckInDeskOptions<T, TContext>) => {
    const DeskInjectionKey = Symbol("CheckInDesk") as InjectionKey<
      CheckInDesk<T, TContext> & TContext
    >;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.context || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(DeskInjectionKey, fullContext);

    if (options?.debug) {
      Debug("Desk opened with injection key:", DeskInjectionKey.description);
    }

    return {
      desk: fullContext,
      DeskInjectionKey,
    };
  };

  const checkIn = <
    TDesk extends CheckInDesk<T, TContext> & TContext = CheckInDesk<
      T,
      TContext
    > &
      TContext,
  >(
    parentDeskOrSymbol:
      | (CheckInDesk<T, TContext> & TContext)
      | InjectionKey<CheckInDesk<T, TContext> & TContext>
      | null
      | undefined,
    checkInOptions?: CheckInOptions<T>,
  ) => {
    const debug = checkInOptions?.debug ? Debug : NoOpDebug;

    if (!parentDeskOrSymbol) {
      debug("[useCheckIn] No parent desk provided - skipping check-in");

      return {
        desk: null as TDesk | null,
        checkOut: () => {},
        updateSelf: () => {},
      };
    }

    let desk: (CheckInDesk<T, TContext> & TContext) | null | undefined;

    if (typeof parentDeskOrSymbol === "symbol") {
      desk = inject(parentDeskOrSymbol);
      if (!desk) {
        debug("[useCheckIn] Could not inject desk from symbol");

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else {
      desk = parentDeskOrSymbol;
    }

    const itemId = checkInOptions?.id || `item-${Date.now()}-${Math.random()}`;
    let isCheckedIn = ref(false);
    let conditionStopHandle: (() => void) | null = null;

    const getCurrentData = async (): Promise<T> => {
      if (!checkInOptions?.data) return undefined as T;

      const dataValue =
        typeof checkInOptions.data === "function"
          ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
          : checkInOptions.data;

      return dataValue instanceof Promise ? await dataValue : dataValue;
    };

    const performCheckIn = async (): Promise<boolean> => {
      if (isCheckedIn.value) return true;

      const data = await getCurrentData();

      const meta = {
        ...checkInOptions?.meta,
        ...(checkInOptions?.group !== undefined && {
          group: checkInOptions.group,
        }),
        ...(checkInOptions?.position !== undefined && {
          position: checkInOptions.position,
        }),
        ...(checkInOptions?.priority !== undefined && {
          priority: checkInOptions.priority,
        }),
      };

      const success = desk!.checkIn(itemId, data, meta);

      if (success) {
        isCheckedIn.value = true;
        debug(`[useCheckIn] Checked in: ${itemId}`, data);
      } else {
        debug(`[useCheckIn] Check-in cancelled for: ${itemId}`);
      }

      return success;
    };

    const performCheckOut = () => {
      if (!isCheckedIn.value) return;

      desk!.checkOut(itemId);
      isCheckedIn.value = false;

      debug(`[useCheckIn] Checked out: ${itemId}`);
    };

    if (checkInOptions?.watchCondition) {
      const condition = checkInOptions.watchCondition;

      const shouldBeCheckedIn =
        typeof condition === "function" ? condition() : condition.value;
      if (shouldBeCheckedIn && checkInOptions?.autoCheckIn !== false) {
        performCheckIn();
      }

      conditionStopHandle = watch(
        () => (typeof condition === "function" ? condition() : condition.value),
        async (shouldCheckIn) => {
          if (shouldCheckIn && !isCheckedIn.value) {
            await performCheckIn();
          } else if (!shouldCheckIn && isCheckedIn.value) {
            performCheckOut();
          }
        },
      );
    } else if (checkInOptions?.autoCheckIn !== false) {
      performCheckIn();
    }

    let watchStopHandle: (() => void) | null = null;
    if (checkInOptions?.watchData && checkInOptions?.data) {
      const watchOptions = checkInOptions.shallow
        ? { deep: false }
        : { deep: true };

      watchStopHandle = watch(
        () => {
          if (!checkInOptions.data) return undefined;
          return typeof checkInOptions.data === "function"
            ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
            : checkInOptions.data;
        },
        async (newData) => {
          if (isCheckedIn.value && newData !== undefined) {
            const resolvedData =
              newData instanceof Promise ? await newData : newData;
            desk!.update(itemId, resolvedData);

            debug(`[useCheckIn] Updated data for: ${itemId}`, resolvedData);
          }
        },
        watchOptions,
      );
    }

    onUnmounted(() => {
      performCheckOut();

      if (watchStopHandle) {
        watchStopHandle();
      }

      if (conditionStopHandle) {
        conditionStopHandle();
      }
    });

    return {
      desk: desk as TDesk,
      checkOut: performCheckOut,
      updateSelf: async (newData?: T) => {
        if (!isCheckedIn.value) return;

        const data = newData !== undefined ? newData : await getCurrentData();
        desk!.update(itemId, data);

        debug(`[useCheckIn] Manual update for: ${itemId}`, data);
      },
    };
  };

  const generateId = (prefix = "item"): string => {
    return generateSecureId(prefix);
  };

  const memoizedId = (
    instanceOrId: object | string | number | null | undefined,
    prefix = "item",
  ): string => {
    if (instanceOrId && typeof instanceOrId === "object") {
      const existing = instanceIdMap.get(instanceOrId);
      if (existing) return existing;

      const newId = generateSecureId(prefix);
      instanceIdMap.set(instanceOrId, newId);
      return newId;
    }

    if (typeof instanceOrId === "string" || typeof instanceOrId === "number") {
      const key = `${prefix}-${instanceOrId}`;
      const existing = customIdMap.get(key);
      if (existing) return existing;

      const newId = `${prefix}-${instanceOrId}`;
      customIdMap.set(key, newId);
      return newId;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[useCheckIn] memoizedId called with null/undefined. Consider passing getCurrentInstance() or a custom ID.",
      );
    }

    return generateSecureId(prefix);
  };

  const standaloneDesk = <T = any,>(options?: CheckInDeskOptions<T>) => {
    return createDeskContext<T>(options);
  };

  const isCheckedIn = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    id: string | number | Ref<string | number>,
  ): ComputedRef<boolean> => {
    return computed(() => {
      const itemId = typeof id === "object" && "value" in id ? id.value : id;
      return desk.has(itemId);
    });
  };

  const getRegistry = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    options?: { sortBy?: keyof T | "timestamp"; order?: "asc" | "desc" },
  ): ComputedRef<CheckInItem<T>[]> => {
    return computed(() => desk.getAll(options));
  };

  return {
    createDesk,
    checkIn,
    generateId,
    memoizedId,
    standaloneDesk,
    isCheckedIn,
    getRegistry,
  };
};
```

```ts [src/composables/use-check-in/plugin-manager.ts]
import type { Plugin, PluginContext } from "./types";

export class PluginManager<T = any> {
  private plugins = new Map<string, Plugin<T>>();
  private context: PluginContext<T> | null = null;

  constructor() {}

  initialize(context: PluginContext<T>) {
    this.context = context;
    context.debug("[PluginManager] Initialized with context");
  }

  install(...plugins: Plugin<T>[]) {
    if (!this.context) {
      throw new Error(
        "[PluginManager] Context not initialized. Call initialize() first.",
      );
    }

    for (const plugin of plugins) {
      if (this.plugins.has(plugin.name)) {
        this.context.debug(
          `[PluginManager] Plugin '${plugin.name}' already installed, skipping`,
        );
        continue;
      }

      this.context.debug(`[PluginManager] Installing plugin '${plugin.name}'`);
      plugin.install(this.context);
      this.plugins.set(plugin.name, plugin);
    }
  }

  get<P extends Plugin<T>>(name: string): P | undefined {
    return this.plugins.get(name) as P | undefined;
  }

  has(name: string): boolean {
    return this.plugins.has(name);
  }

  uninstall(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      this.context?.debug(`[PluginManager] Plugin '${name}' not found`);
      return false;
    }

    this.context?.debug(`[PluginManager] Uninstalling plugin '${name}'`);
    plugin.cleanup?.();
    this.plugins.delete(name);
    return true;
  }

  cleanup() {
    this.context?.debug(
      `[PluginManager] Cleaning up ${this.plugins.size} plugins`,
    );

    for (const [name, plugin] of this.plugins) {
      this.context?.debug(`[PluginManager] Cleaning up plugin '${name}'`);
      plugin.cleanup?.();
    }

    this.plugins.clear();
  }

  list(): string[] {
    return Array.from(this.plugins.keys());
  }
}
```

```ts [src/composables/use-check-in/types.ts]
import type { Ref, ComputedRef, InjectionKey } from "vue";

export type DeskEventType = "check-in" | "check-out" | "update" | "clear";

export type DeskEventPayload<T = any> = {
  "check-in": { id: string | number; data: T; timestamp: number };
  "check-out": { id: string | number; timestamp: number };
  update: { id: string | number; data: T; timestamp: number };
  clear: { timestamp: number };
};

export type DeskEventCallback<
  T = any,
  E extends DeskEventType = DeskEventType,
> = (payload: DeskEventPayload<T>[E]) => void;

export interface CheckInItem<T = any> {
  id: string | number;
  data: T;
  timestamp?: number;
  meta?: CheckInItemMeta;
}

export interface CheckInItemMeta {
  group?: string;

  order?: number;

  priority?: number;

  user?: Record<string, any>;
}

export interface SlotConfig {
  id: string;

  type: string;

  meta?: Record<string, any>;
}

export interface SlotsAPI<T = any> {
  register: (
    slotId: string,
    slotType: string,
    meta?: Record<string, any>,
  ) => void;

  unregister: (slotId: string) => void;

  get: (slotId: string) => CheckInItem<T>[];

  has: (slotId: string) => boolean;

  list: () => SlotConfig[];

  clear: () => void;
}

export interface DeskHook<T = any> {
  name: string;

  onCheckIn?: (item: CheckInItem<T>) => void;

  onCheckOut?: (id: string | number) => void;

  onUpdate?: (item: CheckInItem<T>) => void;

  onClear?: () => void;

  cleanup?: () => void;
}

export interface HooksAPI<T = any> {
  add: (hook: DeskHook<T>) => void;

  remove: (name: string) => boolean;

  list: () => string[];
}

export interface CheckInDesk<
  T = any,
  TContext extends Record<string, any> = {},
> {
  registry: Readonly<Ref<Map<string | number, CheckInItem<T>>>>;

  slots: SlotsAPI<T>;

  hooks: HooksAPI<T>;
  checkIn: (id: string | number, data: T, meta?: CheckInItemMeta) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: GetAllOptions<T>) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (
    items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
  ) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => void;

  on: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => () => void;

  off: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => void;

  emit: <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], "timestamp">,
  ) => void;

  getGroup: (
    group: string,
    options?: SortOptions<T>,
  ) => ComputedRef<CheckInItem<T>[]>;

  items: ComputedRef<CheckInItem<T>[]>;
}

export interface GetAllOptions<T = any> {
  sortBy?: keyof T | "timestamp" | `meta.${string}`;
  order?: "asc" | "desc";
  group?: string;
  filter?: (item: CheckInItem<T>) => boolean;
}

export interface SortOptions<T = any> {
  sortBy?: keyof T | "timestamp" | `meta.${string}`;
  order?: "asc" | "desc";
}

export interface CheckInDeskOptions<
  T = any,
  TContext extends Record<string, any> = {},
> {
  context?: TContext;

  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;

  onCheckIn?: (id: string | number, data: T) => void;

  onBeforeCheckOut?: (id: string | number) => void | boolean;

  onCheckOut?: (id: string | number) => void;

  debug?: boolean;

  hooks?: DeskHook<T>[];
}

export interface CheckInOptions<T = any> {
  required?: boolean;

  autoCheckIn?: boolean;

  id?: string | number;

  data?: T | (() => T) | (() => Promise<T>);

  generateId?: () => string | number;

  watchData?: boolean;

  shallow?: boolean;

  watchCondition?: (() => boolean) | Ref<boolean>;

  meta?: CheckInItemMeta;

  group?: string;

  position?: number;

  priority?: number;

  debug?: boolean;
}

export interface DeskProvider<
  T = any,
  TContext extends Record<string, any> = {},
> {
  desk: CheckInDesk<T, TContext> & TContext;
  DeskInjectionKey: InjectionKey<CheckInDesk<T, TContext> & TContext>;
}

export interface CheckInReturn<
  T = any,
  TContext extends Record<string, any> = {},
> {
  desk: (CheckInDesk<T, TContext> & TContext) | null;
  checkOut: () => void;
  updateSelf: (newData?: T) => void;
}
```

```ts [src/composables/use-check-in/plugins/events.plugin.ts]
import type {
  Plugin,
  PluginContext,
  DeskEventType,
  DeskEventCallback,
  DeskEventPayload,
} from "../types";

export interface EventsPlugin<T = any> extends Plugin<T> {
  on: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => () => void;
  off: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => void;
  emit: <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], "timestamp">,
  ) => void;
}

export const createEventsPlugin = <T = any,>(): EventsPlugin<T> => {
  const eventListeners = new Map<
    DeskEventType,
    Set<DeskEventCallback<T, any>>
  >();
  let context: PluginContext<T> | null = null;

  const emit = <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], "timestamp">,
  ) => {
    const listeners = eventListeners.get(event);
    if (!listeners || listeners.size === 0) return;

    const eventPayload = {
      ...payload,
      timestamp: Date.now(),
    } as DeskEventPayload<T>[E];

    context?.debug(`[Event] ${event}`, eventPayload);
    listeners.forEach((callback) => callback(eventPayload));
  };

  const on = <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, new Set());
    }
    eventListeners.get(event)!.add(callback);

    context?.debug(
      `[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`,
    );

    return () => off(event, callback);
  };

  const off = <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => {
    const listeners = eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      context?.debug(
        `[Event] Listener removed for '${event}', remaining: ${listeners.size}`,
      );
    }
  };

  const cleanup = () => {
    eventListeners.clear();
    context?.debug("[Event] Cleaned up all event listeners");
  };

  return {
    name: "events",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Events plugin installed");
    },
    cleanup,
    on,
    off,
    emit,
  };
};
```

```ts [src/composables/use-check-in/plugins/id.plugin.ts]
import type { Plugin, PluginContext } from "../types";

export interface IdPlugin extends Plugin {
  generateId: (prefix?: string) => string;
  memoizedId: (
    instanceOrId: object | string | number | null | undefined,
    prefix?: string,
  ) => string;
  clearCache: () => void;
}

const instanceIdMap = new WeakMap<object, string>();

const customIdMap = new Map<string, string>();
let instanceCounter = 0;

const generateSecureId = (prefix = "item"): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const id = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return `${prefix}-${id}`;
  }

  const isDev =
    typeof process !== "undefined" && process.env?.NODE_ENV === "development";
  if (isDev) {
    console.warn(
      "[useCheckIn] crypto API not available, using Math.random fallback. " +
        "Consider upgrading to a modern environment.",
    );
  }
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${random}`;
};

export const createIdPlugin = (): IdPlugin => {
  let context: PluginContext | null = null;

  const generateId = (prefix = "item"): string => {
    const id = generateSecureId(prefix);
    context?.debug("[ID] Generated secure ID:", id);
    return id;
  };

  const memoizedId = (
    instanceOrId: object | string | number | null | undefined,
    prefix = "item",
  ): string => {
    if (typeof instanceOrId === "string" || typeof instanceOrId === "number") {
      const key = `${prefix}-${instanceOrId}`;
      let id = customIdMap.get(key);
      if (!id) {
        id = String(instanceOrId);
        customIdMap.set(key, id);
        context?.debug("[ID] Memoized custom ID:", { key, id });
      }
      return id;
    }

    if (instanceOrId && typeof instanceOrId === "object") {
      let id = instanceIdMap.get(instanceOrId);
      if (!id) {
        id = `${prefix}-${++instanceCounter}`;
        instanceIdMap.set(instanceOrId, id);
        context?.debug("[ID] Memoized instance ID:", {
          prefix,
          id,
          counter: instanceCounter,
        });
      }
      return id;
    }

    const isDev =
      typeof process !== "undefined" && process.env?.NODE_ENV === "development";
    if (isDev) {
      console.warn(
        `[useCheckIn] memoizedId: no instance or custom ID provided. ` +
          `Generated cryptographically secure ID. ` +
          `Consider passing getCurrentInstance() or a custom ID (nanoid, uuid, props.id, etc.).`,
      );
    }
    return generateId(prefix);
  };

  const clearCache = () => {
    customIdMap.clear();
    instanceCounter = 0;
    context?.debug("[ID] Cleared ID cache");
  };

  const cleanup = () => {
    clearCache();
    context?.debug("[ID] Plugin cleaned up");
  };

  return {
    name: "id",
    install: (ctx: PluginContext) => {
      context = ctx;
      ctx.debug("[Plugin] ID plugin installed");
    },
    cleanup,
    generateId,
    memoizedId,
    clearCache,
  };
};

export const clearIdCache = () => {
  customIdMap.clear();
  instanceCounter = 0;
};
```

```ts [src/composables/use-check-in/plugins/index.ts]
export { createEventsPlugin, type EventsPlugin } from "./events.plugin";
export { createRegistryPlugin, type RegistryPlugin } from "./registry.plugin";
export {
  createSortingPlugin,
  clearSortCache,
  type SortingPlugin,
} from "./sorting.plugin";
export { createIdPlugin, clearIdCache, type IdPlugin } from "./id.plugin";
```

```ts [src/composables/use-check-in/plugins/registry.plugin.ts]
import { triggerRef } from "vue";
import type {
  Plugin,
  PluginContext,
  CheckInItem,
  CheckInItemMeta,
} from "../types";

export interface RegistryPlugin<T = any> extends Plugin<T> {
  checkIn: (id: string | number, data: T, meta?: CheckInItemMeta) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (
    items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
  ) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => void;
}

export const createRegistryPlugin = <T = any,>(
  emitEvent?: <E extends string>(event: E, payload: any) => void,
): RegistryPlugin<T> => {
  let context: PluginContext<T> | null = null;

  const checkIn = (
    id: string | number,
    data: T,
    meta?: CheckInItemMeta,
  ): boolean => {
    if (!context) return false;

    context.debug("checkIn", { id, data, meta });

    if (context.options?.onBeforeCheckIn) {
      const result = context.options.onBeforeCheckIn(id, data);
      if (result === false) {
        context.debug("checkIn cancelled by onBeforeCheckIn", id);
        return false;
      }
    }

    context.registry.value.set(id, {
      id,
      data: data as any,
      timestamp: Date.now(),
      meta,
    });
    triggerRef(context.registry);

    emitEvent?.("check-in", { id, data });

    context.options?.onCheckIn?.(id, data);

    if (context.options?.debug) {
      context.debug("Registry state after check-in:", {
        total: context.registry.value.size,
        items: Array.from(context.registry.value.keys()),
      });
    }

    return true;
  };

  const checkOut = (id: string | number): boolean => {
    if (!context) return false;

    context.debug("checkOut", id);

    const existed = context.registry.value.has(id);
    if (!existed) return false;

    if (context.options?.onBeforeCheckOut) {
      const result = context.options.onBeforeCheckOut(id);
      if (result === false) {
        context.debug("checkOut cancelled by onBeforeCheckOut", id);
        return false;
      }
    }

    context.registry.value.delete(id);
    triggerRef(context.registry);

    emitEvent?.("check-out", { id });

    context.options?.onCheckOut?.(id);

    if (context.options?.debug) {
      context.debug("Registry state after check-out:", {
        total: context.registry.value.size,
        items: Array.from(context.registry.value.keys()),
      });
    }

    return true;
  };

  const get = (id: string | number) => {
    return context?.registry.value.get(id);
  };

  const update = (id: string | number, data: Partial<T>): boolean => {
    if (!context) return false;

    const existing = context.registry.value.get(id);
    if (!existing) {
      context.debug("update failed: item not found", id);
      return false;
    }

    if (typeof existing.data === "object" && typeof data === "object") {
      const previousData = { ...existing.data };

      Object.assign(existing.data as object, data);
      triggerRef(context.registry);

      emitEvent?.("update", { id, data: existing.data });

      if (context.options?.debug) {
        context.debug("update diff:", {
          id,
          before: previousData,
          after: existing.data,
          changes: data,
        });
      }

      return true;
    }

    return false;
  };

  const has = (id: string | number) => {
    return context?.registry.value.has(id) ?? false;
  };

  const clear = () => {
    if (!context) return;

    context.debug("clear");
    const count = context.registry.value.size;
    context.registry.value.clear();
    triggerRef(context.registry);

    emitEvent?.("clear", {});

    context.debug(`Cleared ${count} items from registry`);
  };

  const checkInMany = (
    items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
  ) => {
    context?.debug("checkInMany", items.length, "items");
    items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
  };

  const checkOutMany = (ids: Array<string | number>) => {
    context?.debug("checkOutMany", ids.length, "items");
    ids.forEach((id) => checkOut(id));
  };

  const updateMany = (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => {
    context?.debug("updateMany", updates.length, "items");
    updates.forEach(({ id, data }) => update(id, data));
  };

  const cleanup = () => {
    if (!context) return;
    context.registry.value.clear();
    context.debug("[Registry] Cleaned up registry");
  };

  return {
    name: "registry",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Registry plugin installed");
    },
    cleanup,
    checkIn,
    checkOut,
    get,
    update,
    has,
    clear,
    checkInMany,
    checkOutMany,
    updateMany,
  };
};
```

```ts [src/composables/use-check-in/plugins/runtime-usage.example.ts]
import type { Plugin, PluginContext, CheckInItem } from "../types";

export interface AnalyticsEvent {
  type: "check-in" | "check-out" | "update";
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
  track: (event: AnalyticsEvent) => void;

  flush: () => Promise<void>;

  getStats: () => {
    totalEvents: number;
    checkIns: number;
    checkOuts: number;
    updates: number;
  };
}

export const createAnalyticsPlugin = <T = any,>(
  options?: AnalyticsPluginOptions,
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

    if (event.type === "check-in") stats.checkIns++;
    else if (event.type === "check-out") stats.checkOuts++;
    else if (event.type === "update") stats.updates++;

    context?.debug("[Analytics] Tracked event:", event);

    if (options?.batchSize && events.length >= options.batchSize) {
      flush();
    }
  };

  const flush = async () => {
    if (events.length === 0) return;

    const endpoint = options?.endpoint || "/api/analytics";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: [...events] }),
      });

      if (response.ok) {
        context?.debug("[Analytics] Flushed", events.length, "events");
        events.length = 0;
      }
    } catch (error) {
      console.error("[Analytics] Failed to flush:", error);
    }
  };

  const getStats = () => ({ ...stats });

  let flushInterval: NodeJS.Timeout | null = null;

  return {
    name: "analytics",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Analytics plugin installed");

      if (options?.flushInterval) {
        flushInterval = setInterval(() => {
          flush();
        }, options.flushInterval);
      }
    },
    cleanup: () => {
      flush();

      if (flushInterval) {
        clearInterval(flushInterval);
      }

      context?.debug("[Analytics] Plugin cleaned up");
    },
    track,
    flush,
    getStats,
  };
};

import { ref, onMounted, onUnmounted } from "vue";
import { useCheckIn, type CheckInDesk } from "../useCheckIn";
import type { SlotsPlugin } from "./slots.plugin.example";

export interface ToolbarItem {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

export function useToolbarWithPlugins() {
  const { createDesk } = useCheckIn<ToolbarItem>();
  const { desk } = createDesk({ debug: true });

  const slotsPlugin = ref<SlotsPlugin<ToolbarItem>>();
  const analyticsPlugin = ref<AnalyticsPlugin<ToolbarItem>>();

  const loadPlugins = async () => {
    const { createSlotsPlugin } = await import("./slots.plugin.example");
    const slots = createSlotsPlugin<ToolbarItem>();
    desk.plugins.install(slots);
    slotsPlugin.value = desk.plugins.get<SlotsPlugin<ToolbarItem>>("slots");

    slotsPlugin.value?.registerSlot("header-left", "toolbar", {
      align: "left",
    });
    slotsPlugin.value?.registerSlot("header-right", "toolbar", {
      align: "right",
    });
    slotsPlugin.value?.registerSlot("footer", "toolbar", { align: "center" });

    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "production"
    ) {
      const analytics = createAnalyticsPlugin<ToolbarItem>({
        endpoint: "/api/analytics",
        batchSize: 10,
        flushInterval: 30000,
      });

      desk.plugins.install(analytics);
      analyticsPlugin.value =
        desk.plugins.get<AnalyticsPlugin<ToolbarItem>>("analytics");

      desk.on("check-in", (payload) => {
        analyticsPlugin.value?.track({
          type: "check-in",
          itemId: payload.id,
          timestamp: payload.timestamp,
          data: payload.data,
        });
      });

      desk.on("check-out", (payload) => {
        analyticsPlugin.value?.track({
          type: "check-out",
          itemId: payload.id,
          timestamp: payload.timestamp,
        });
      });
    }
  };

  const addToSlot = (slotId: string, id: string, item: ToolbarItem) => {
    if (!slotsPlugin.value) {
      console.warn("Slots plugin not loaded");
      return;
    }

    desk.checkIn(id, item, {
      user: { slotId, slotType: "toolbar" },
    });
  };

  const getSlotItems = (slotId: string) => {
    return slotsPlugin.value?.getSlotItems(slotId) ?? [];
  };

  const getAnalyticsStats = () => {
    return analyticsPlugin.value?.getStats() ?? null;
  };

  onMounted(() => {
    loadPlugins();
  });

  onUnmounted(() => {
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


const headerLeft = computed(() => getSlotItems('header-left'));
const headerRight = computed(() => getSlotItems('header-right'));
const footer = computed(() => getSlotItems('footer'));


const stats = computed(() => getAnalyticsStats());


const loadExtraPlugin = async () => {
  
  if (userHasPermission.value) {
    const { createPermissionsPlugin } = await import('./permissions.plugin');
    const permPlugin = createPermissionsPlugin();
    desk.plugins.install(permPlugin);
  }
};


onMounted(() => {
  addSaveButton();
  addCancelButton();
});
</script>

<template>
  <div class="toolbar-container">
    
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

    
    <main class="content">
      <slot />
    </main>

    
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
```

```ts [src/composables/use-check-in/plugins/slots.plugin.example.ts]
import type { Plugin, PluginContext, CheckInItem } from "../types";

export interface SlotMeta {
  slotId?: string;
  slotType?: string;
  slotData?: Record<string, any>;
}

export interface SlotsPlugin<T = any> extends Plugin<T> {
  registerSlot: (
    slotId: string,
    slotType: string,
    config?: Record<string, any>,
  ) => void;

  unregisterSlot: (slotId: string) => void;

  getSlotItems: (slotId: string) => CheckInItem<T>[];

  hasSlot: (slotId: string) => boolean;
}

export const createSlotsPlugin = <T = any,>(): SlotsPlugin<T> => {
  let context: PluginContext<T> | null = null;

  const slots = new Map<
    string,
    {
      slotId: string;
      slotType: string;
      config?: Record<string, any>;
    }
  >();

  const registerSlot = (
    slotId: string,
    slotType: string,
    config?: Record<string, any>,
  ) => {
    if (slots.has(slotId)) {
      context?.debug(
        `[Slots] Slot '${slotId}' already registered, updating config`,
      );
    }

    slots.set(slotId, { slotId, slotType, config });
    context?.debug(
      `[Slots] Registered slot '${slotId}' of type '${slotType}'`,
      config,
    );
  };

  const unregisterSlot = (slotId: string) => {
    const existed = slots.delete(slotId);
    if (existed) {
      context?.debug(`[Slots] Unregistered slot '${slotId}'`);
    }
  };

  const getSlotItems = (slotId: string): CheckInItem<T>[] => {
    if (!context) return [];

    const items = Array.from(context.registry.value.values()).filter(
      (item) => (item.meta as any)?.slotId === slotId,
    );

    context?.debug(
      `[Slots] Retrieved ${items.length} items from slot '${slotId}'`,
    );
    return items;
  };

  const hasSlot = (slotId: string): boolean => {
    return slots.has(slotId);
  };

  const cleanup = () => {
    slots.clear();
    context?.debug("[Slots] Cleaned up all slots");
  };

  return {
    name: "slots",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Slots plugin installed");
    },
    cleanup,
    registerSlot,
    unregisterSlot,
    getSlotItems,
    hasSlot,
  };
};

export const SlotsPluginExample = `

<script setup lang="ts">
import { useCheckIn, createSlotsPlugin } from './useCheckIn';

interface ToolbarItem {
  label: string;
  icon?: string;
  onClick: () => void;
}

const { createDesk } = useCheckIn<ToolbarItem>();
const slotsPlugin = createSlotsPlugin<ToolbarItem>();

const { desk } = createDesk({
  plugins: [slotsPlugin]
});


slotsPlugin.registerSlot('header-left', 'toolbar', { align: 'left' });
slotsPlugin.registerSlot('header-right', 'toolbar', { align: 'right' });
slotsPlugin.registerSlot('footer-actions', 'toolbar', { align: 'center' });


const headerLeftItems = computed(() => slotsPlugin.getSlotItems('header-left'));
const headerRightItems = computed(() => slotsPlugin.getSlotItems('header-right'));
const footerItems = computed(() => slotsPlugin.getSlotItems('footer-actions'));
</script>

<template>
  <div>
    <header>
      <div class="left">
        <ToolbarButton
          v-for="item in headerLeftItems"
          :key="item.id"
          v-bind="item.data"
        />
      </div>
      <div class="right">
        <ToolbarButton
          v-for="item in headerRightItems"
          :key="item.id"
          v-bind="item.data"
        />
      </div>
    </header>
    
    <main>
      <slot /> 
    </main>
    
    <footer>
      <ToolbarButton
        v-for="item in footerItems"
        :key="item.id"
        v-bind="item.data"
      />
    </footer>
  </div>
</template>


<script setup lang="ts">
import { useCheckIn } from './useCheckIn';

const props = defineProps<{
  slotId: 'header-left' | 'header-right' | 'footer-actions';
  label: string;
  icon?: string;
}>();

const { checkIn } = useCheckIn<ToolbarItem>();

checkIn(desk, {
  autoCheckIn: true,
  id: \`btn-\${props.label}\`,
  data: {
    label: props.label,
    icon: props.icon,
    onClick: () => console.log(\`\${props.label} clicked\`)
  },
  meta: {
    slotId: props.slotId,
    slotType: 'toolbar',
    user: {
      
    }
  }
});
</script>
`;
```

```ts [src/composables/use-check-in/plugins/sorting.plugin.ts]
import type {
  Plugin,
  PluginContext,
  CheckInItem,
  GetAllOptions,
} from "../types";

export interface SortingPlugin<T = any> extends Plugin<T> {
  getAll: (options?: GetAllOptions<T>) => CheckInItem<T>[];
}

const sortFnCache = new Map<string, (a: any, b: any) => number>();

const compileSortFn = <T,>(
  sortBy: keyof T | "timestamp" | `meta.${string}`,
  order: "asc" | "desc" = "asc",
): ((a: CheckInItem<T>, b: CheckInItem<T>) => number) => {
  const cacheKey = `${String(sortBy)}-${order}`;
  const cached = sortFnCache.get(cacheKey);
  if (cached) return cached;

  let fn: (a: CheckInItem<T>, b: CheckInItem<T>) => number;

  if (sortBy === "timestamp") {
    fn = (a, b) => {
      const aVal = a.timestamp || 0;
      const bVal = b.timestamp || 0;
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === "desc" ? -comparison : comparison;
    };
  } else if (typeof sortBy === "string" && sortBy.startsWith("meta.")) {
    const metaKey = sortBy.slice(5);
    fn = (a, b) => {
      const aVal = (a.meta as any)?.[metaKey];
      const bVal = (b.meta as any)?.[metaKey];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === "desc" ? -comparison : comparison;
    };
  } else {
    const key = sortBy as keyof T;
    fn = (a, b) => {
      const aVal = a.data[key];
      const bVal = b.data[key];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === "desc" ? -comparison : comparison;
    };
  }

  sortFnCache.set(cacheKey, fn);
  return fn;
};

export const createSortingPlugin = <T = any,>(): SortingPlugin<T> => {
  let context: PluginContext<T> | null = null;

  const getAll = (options?: GetAllOptions<T>): CheckInItem<T>[] => {
    if (!context) return [];

    let items = Array.from(context.registry.value.values());

    if (options?.group !== undefined) {
      items = items.filter((item) => item.meta?.group === options.group);
    }

    if (options?.filter) {
      items = items.filter(options.filter);
    }

    if (options?.sortBy) {
      const sortFn = compileSortFn<T>(options.sortBy, options.order);
      items.sort(sortFn);
    }

    return items;
  };

  const cleanup = () => {
    context?.debug("[Sorting] Plugin cleaned up");
  };

  return {
    name: "sorting",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Sorting plugin installed");
    },
    cleanup,
    getAll,
  };
};

export const clearSortCache = () => {
  sortFnCache.clear();
};
```

```ts [src/composables/use-check-in/useCheckIn.ts]
import {
  ref,
  provide,
  inject,
  onUnmounted,
  watch,
  computed,
  triggerRef,
  type InjectionKey,
  type Ref,
  type ComputedRef,
} from "vue";

export type {
  DeskEventType,
  DeskEventPayload,
  DeskEventCallback,
  CheckInItem,
  CheckInItemMeta,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
  GetAllOptions,
  SortOptions,
  DeskProvider,
  CheckInReturn,
  DeskHook,
  HooksAPI,
  SlotsAPI,
  SlotConfig,
} from "./types";

import type {
  CheckInItem,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
  DeskProvider,
  CheckInReturn,
  CheckInItemMeta,
  DeskEventType,
  DeskEventCallback,
  DeskEventPayload,
  DeskHook,
  SlotsAPI,
  HooksAPI,
  SlotConfig,
  GetAllOptions,
} from "./types";

const NoOpDebug = (_message: string, ..._args: any[]) => {};

const Debug = (message: string, ...args: any[]) => {
  console.log(`[useCheckIn] ${message}`, ...args);
};

const instanceIdMap = new WeakMap<object, string>();
const customIdMap = new Map<string, string>();

const sortFnCache = new Map<
  string,
  (a: CheckInItem<any>, b: CheckInItem<any>) => number
>();

const generateSecureId = (prefix = "item"): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${prefix}-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16)}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const compileSortFn = <T = any,>(
  sortBy: keyof T | "timestamp" | `meta.${string}`,
  order: "asc" | "desc" = "asc",
): ((a: CheckInItem<T>, b: CheckInItem<T>) => number) => {
  const cacheKey = `${String(sortBy)}-${order}`;
  const cached = sortFnCache.get(cacheKey);
  if (cached) return cached;

  const fn = (a: CheckInItem<T>, b: CheckInItem<T>) => {
    let aVal: any;
    let bVal: any;

    if (sortBy === "timestamp") {
      aVal = a.timestamp || 0;
      bVal = b.timestamp || 0;
    } else if (String(sortBy).startsWith("meta.")) {
      const metaKey = String(sortBy).slice(5);
      aVal = (a.meta as any)?.[metaKey];
      bVal = (b.meta as any)?.[metaKey];
    } else {
      aVal = a.data[sortBy as keyof T];
      bVal = b.data[sortBy as keyof T];
    }

    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    const result = aVal < bVal ? -1 : 1;
    return order === "asc" ? result : -result;
  };

  sortFnCache.set(cacheKey, fn);
  return fn;
};

export const useCheckIn = <
  T = any,
  TContext extends Record<string, any> = {},
>() => {
  const createDeskContext = <
    T = any,
    TContext extends Record<string, any> = {},
  >(
    options?: CheckInDeskOptions<T, TContext>,
  ): CheckInDesk<T, TContext> => {
    const registry = ref<Map<string | number, CheckInItem<T>>>(
      new Map(),
    ) as Ref<Map<string | number, CheckInItem<T>>>;

    const debug = options?.debug ? Debug : NoOpDebug;

    const eventListeners = new Map<
      DeskEventType,
      Set<DeskEventCallback<T, any>>
    >();

    const emit = <E extends DeskEventType>(
      event: E,
      payload: Omit<DeskEventPayload<T>[E], "timestamp">,
    ) => {
      const listeners = eventListeners.get(event);
      if (!listeners) return;

      const eventPayload = {
        ...payload,
        timestamp: Date.now(),
      } as DeskEventPayload<T>[E];

      debug(`[Event] ${event}`, eventPayload);
      listeners.forEach((callback) => callback(eventPayload));
    };

    const on = <E extends DeskEventType>(
      event: E,
      callback: DeskEventCallback<T, E>,
    ) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
      }
      eventListeners.get(event)!.add(callback);

      debug(
        `[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`,
      );

      return () => off(event, callback);
    };

    const off = <E extends DeskEventType>(
      event: E,
      callback: DeskEventCallback<T, E>,
    ) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        debug(
          `[Event] Listener removed for '${event}', remaining: ${listeners.size}`,
        );
      }
    };

    const checkIn = (
      id: string | number,
      data: T,
      meta?: CheckInItemMeta,
    ): boolean => {
      debug("checkIn", { id, data, meta });

      if (options?.onBeforeCheckIn) {
        const result = options.onBeforeCheckIn(id, data);
        if (result === false) {
          debug("checkIn cancelled by onBeforeCheckIn", id);
          return false;
        }
      }

      const item: CheckInItem<T> = {
        id,
        data: data as any,
        timestamp: Date.now(),
        meta,
      };

      registry.value.set(id, item);
      triggerRef(registry);

      emit("check-in", { id, data });

      options?.onCheckIn?.(id, data);

      hooks.trigger("onCheckIn", item);

      if (options?.debug) {
        debug("Registry state after check-in:", {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const checkOut = (id: string | number): boolean => {
      debug("checkOut", id);

      const existed = registry.value.has(id);
      if (!existed) return false;

      if (options?.onBeforeCheckOut) {
        const result = options.onBeforeCheckOut(id);
        if (result === false) {
          debug("checkOut cancelled by onBeforeCheckOut", id);
          return false;
        }
      }

      registry.value.delete(id);
      triggerRef(registry);

      emit("check-out", { id });

      options?.onCheckOut?.(id);

      hooks.trigger("onCheckOut", id);

      if (options?.debug) {
        debug("Registry state after check-out:", {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const get = (id: string | number) => registry.value.get(id);

    const has = (id: string | number) => registry.value.has(id);

    const update = (id: string | number, data: Partial<T>): boolean => {
      const item = registry.value.get(id);
      if (!item) return false;

      const updatedItem = {
        ...item,
        data: { ...item.data, ...data },
      };

      registry.value.set(id, updatedItem);
      triggerRef(registry);

      emit("update", { id, data: updatedItem.data });
      hooks.trigger("onUpdate", updatedItem);

      debug("update", { id, data });
      return true;
    };

    const clear = () => {
      registry.value.clear();
      triggerRef(registry);
      emit("clear", {});
      hooks.trigger("onClear");
      debug("clear");
    };

    const checkInMany = (
      items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
    ) => {
      items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
    };

    const checkOutMany = (ids: Array<string | number>) => {
      ids.forEach((id) => checkOut(id));
    };

    const updateMany = (
      updates: Array<{ id: string | number; data: Partial<T> }>,
    ) => {
      updates.forEach(({ id, data }) => update(id, data));
    };

    const getAll = (opts?: GetAllOptions<T>): CheckInItem<T>[] => {
      let items = Array.from(registry.value.values());

      if (opts?.group) {
        items = items.filter((item) => item.meta?.group === opts.group);
      }

      if (opts?.filter) {
        items = items.filter(opts.filter);
      }

      if (opts?.sortBy) {
        const sortFn = compileSortFn<T>(opts.sortBy, opts.order);
        items.sort(sortFn);
      }

      return items;
    };

    const getGroup = (
      group: string,
      sortOptions?: {
        sortBy?: keyof T | "timestamp" | `meta.${string}`;
        order?: "asc" | "desc";
      },
    ) => {
      return computed(() => getAll({ ...sortOptions, group }));
    };

    const items = computed(() => getAll());

    const slotsRegistry = new Map<string, SlotConfig>();

    const slots: SlotsAPI<T> = {
      register: (
        slotId: string,
        slotType: string,
        meta?: Record<string, any>,
      ) => {
        slotsRegistry.set(slotId, { id: slotId, type: slotType, meta });
        debug(`[Slots] Registered slot '${slotId}' of type '${slotType}'`);
      },
      unregister: (slotId: string) => {
        slotsRegistry.delete(slotId);
        debug(`[Slots] Unregistered slot '${slotId}'`);
      },
      get: (slotId: string): CheckInItem<T>[] => {
        return getAll({
          filter: (item) => item.meta?.user?.slotId === slotId,
        });
      },
      has: (slotId: string): boolean => {
        return slotsRegistry.has(slotId);
      },
      list: (): SlotConfig[] => {
        return Array.from(slotsRegistry.values());
      },
      clear: () => {
        slotsRegistry.clear();
        debug("[Slots] All slots cleared");
      },
    };

    const hooksRegistry = new Map<string, DeskHook<T>>();

    const hooks: HooksAPI<T> & {
      trigger: (method: keyof DeskHook<T>, ...args: any[]) => void;
    } = {
      add: (hook: DeskHook<T>) => {
        hooksRegistry.set(hook.name, hook);
        debug(`[Hooks] Added hook '${hook.name}'`);
      },
      remove: (name: string): boolean => {
        const hook = hooksRegistry.get(name);
        if (hook) {
          hook.cleanup?.();
          hooksRegistry.delete(name);
          debug(`[Hooks] Removed hook '${name}'`);
          return true;
        }
        return false;
      },
      list: (): string[] => {
        return Array.from(hooksRegistry.keys());
      },
      trigger: (method: keyof DeskHook<T>, ...args: any[]) => {
        hooksRegistry.forEach((hook) => {
          const fn = hook[method];
          if (typeof fn === "function") {
            (fn as any)(...args);
          }
        });
      },
    };

    if (options?.hooks) {
      options.hooks.forEach((hook) => hooks.add(hook));
    }

    const readonlyRegistry = computed(() => registry.value);

    return {
      registry: readonlyRegistry as any,
      slots,
      hooks,
      checkIn,
      checkOut,
      get,
      getAll,
      update,
      has,
      clear,
      checkInMany,
      checkOutMany,
      updateMany,
      on,
      off,
      emit,
      getGroup,
      items,
    };
  };

  const createDesk = (options?: CheckInDeskOptions<T, TContext>) => {
    const DeskInjectionKey = Symbol("CheckInDesk") as InjectionKey<
      CheckInDesk<T, TContext> & TContext
    >;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.context || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(DeskInjectionKey, fullContext);

    if (options?.debug) {
      Debug("Desk opened with injection key:", DeskInjectionKey.description);
    }

    return {
      desk: fullContext,
      DeskInjectionKey,
    };
  };

  const checkIn = <
    TDesk extends CheckInDesk<T, TContext> & TContext = CheckInDesk<
      T,
      TContext
    > &
      TContext,
  >(
    parentDeskOrSymbol:
      | (CheckInDesk<T, TContext> & TContext)
      | InjectionKey<CheckInDesk<T, TContext> & TContext>
      | null
      | undefined,
    checkInOptions?: CheckInOptions<T>,
  ) => {
    const debug = checkInOptions?.debug ? Debug : NoOpDebug;

    if (!parentDeskOrSymbol) {
      debug("[useCheckIn] No parent desk provided - skipping check-in");

      return {
        desk: null as TDesk | null,
        checkOut: () => {},
        updateSelf: () => {},
      };
    }

    let desk: (CheckInDesk<T, TContext> & TContext) | null | undefined;

    if (typeof parentDeskOrSymbol === "symbol") {
      desk = inject(parentDeskOrSymbol);
      if (!desk) {
        debug("[useCheckIn] Could not inject desk from symbol");

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else {
      desk = parentDeskOrSymbol;
    }

    const itemId = checkInOptions?.id || `item-${Date.now()}-${Math.random()}`;
    let isCheckedIn = ref(false);
    let conditionStopHandle: (() => void) | null = null;

    const getCurrentData = async (): Promise<T> => {
      if (!checkInOptions?.data) return undefined as T;

      const dataValue =
        typeof checkInOptions.data === "function"
          ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
          : checkInOptions.data;

      return dataValue instanceof Promise ? await dataValue : dataValue;
    };

    const performCheckIn = async (): Promise<boolean> => {
      if (isCheckedIn.value) return true;

      const data = await getCurrentData();

      const meta = {
        ...checkInOptions?.meta,
        ...(checkInOptions?.group !== undefined && {
          group: checkInOptions.group,
        }),
        ...(checkInOptions?.position !== undefined && {
          position: checkInOptions.position,
        }),
        ...(checkInOptions?.priority !== undefined && {
          priority: checkInOptions.priority,
        }),
      };

      const success = desk!.checkIn(itemId, data, meta);

      if (success) {
        isCheckedIn.value = true;
        debug(`[useCheckIn] Checked in: ${itemId}`, data);
      } else {
        debug(`[useCheckIn] Check-in cancelled for: ${itemId}`);
      }

      return success;
    };

    const performCheckOut = () => {
      if (!isCheckedIn.value) return;

      desk!.checkOut(itemId);
      isCheckedIn.value = false;

      debug(`[useCheckIn] Checked out: ${itemId}`);
    };

    if (checkInOptions?.watchCondition) {
      const condition = checkInOptions.watchCondition;

      const shouldBeCheckedIn =
        typeof condition === "function" ? condition() : condition.value;
      if (shouldBeCheckedIn && checkInOptions?.autoCheckIn !== false) {
        performCheckIn();
      }

      conditionStopHandle = watch(
        () => (typeof condition === "function" ? condition() : condition.value),
        async (shouldCheckIn) => {
          if (shouldCheckIn && !isCheckedIn.value) {
            await performCheckIn();
          } else if (!shouldCheckIn && isCheckedIn.value) {
            performCheckOut();
          }
        },
      );
    } else if (checkInOptions?.autoCheckIn !== false) {
      performCheckIn();
    }

    let watchStopHandle: (() => void) | null = null;
    if (checkInOptions?.watchData && checkInOptions?.data) {
      const watchOptions = checkInOptions.shallow
        ? { deep: false }
        : { deep: true };

      watchStopHandle = watch(
        () => {
          if (!checkInOptions.data) return undefined;
          return typeof checkInOptions.data === "function"
            ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
            : checkInOptions.data;
        },
        async (newData) => {
          if (isCheckedIn.value && newData !== undefined) {
            const resolvedData =
              newData instanceof Promise ? await newData : newData;
            desk!.update(itemId, resolvedData);

            debug(`[useCheckIn] Updated data for: ${itemId}`, resolvedData);
          }
        },
        watchOptions,
      );
    }

    onUnmounted(() => {
      performCheckOut();

      if (watchStopHandle) {
        watchStopHandle();
      }

      if (conditionStopHandle) {
        conditionStopHandle();
      }
    });

    return {
      desk: desk as TDesk,
      checkOut: performCheckOut,
      updateSelf: async (newData?: T) => {
        if (!isCheckedIn.value) return;

        const data = newData !== undefined ? newData : await getCurrentData();
        desk!.update(itemId, data);

        debug(`[useCheckIn] Manual update for: ${itemId}`, data);
      },
    };
  };

  const generateId = (prefix = "item"): string => {
    return generateSecureId(prefix);
  };

  const memoizedId = (
    instanceOrId: object | string | number | null | undefined,
    prefix = "item",
  ): string => {
    if (instanceOrId && typeof instanceOrId === "object") {
      const existing = instanceIdMap.get(instanceOrId);
      if (existing) return existing;

      const newId = generateSecureId(prefix);
      instanceIdMap.set(instanceOrId, newId);
      return newId;
    }

    if (typeof instanceOrId === "string" || typeof instanceOrId === "number") {
      const key = `${prefix}-${instanceOrId}`;
      const existing = customIdMap.get(key);
      if (existing) return existing;

      const newId = `${prefix}-${instanceOrId}`;
      customIdMap.set(key, newId);
      return newId;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[useCheckIn] memoizedId called with null/undefined. Consider passing getCurrentInstance() or a custom ID.",
      );
    }

    return generateSecureId(prefix);
  };

  const standaloneDesk = <T = any,>(options?: CheckInDeskOptions<T>) => {
    return createDeskContext<T>(options);
  };

  const isCheckedIn = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    id: string | number | Ref<string | number>,
  ): ComputedRef<boolean> => {
    return computed(() => {
      const itemId = typeof id === "object" && "value" in id ? id.value : id;
      return desk.has(itemId);
    });
  };

  const getRegistry = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    options?: { sortBy?: keyof T | "timestamp"; order?: "asc" | "desc" },
  ): ComputedRef<CheckInItem<T>[]> => {
    return computed(() => desk.getAll(options));
  };

  return {
    createDesk,
    checkIn,
    generateId,
    memoizedId,
    standaloneDesk,
    isCheckedIn,
    getRegistry,
  };
};
```

```ts [src/composables/use-check-in/plugin-manager.ts]
import type { Plugin, PluginContext } from "./types";

export class PluginManager<T = any> {
  private plugins = new Map<string, Plugin<T>>();
  private context: PluginContext<T> | null = null;

  constructor() {}

  initialize(context: PluginContext<T>) {
    this.context = context;
    context.debug("[PluginManager] Initialized with context");
  }

  install(...plugins: Plugin<T>[]) {
    if (!this.context) {
      throw new Error(
        "[PluginManager] Context not initialized. Call initialize() first.",
      );
    }

    for (const plugin of plugins) {
      if (this.plugins.has(plugin.name)) {
        this.context.debug(
          `[PluginManager] Plugin '${plugin.name}' already installed, skipping`,
        );
        continue;
      }

      this.context.debug(`[PluginManager] Installing plugin '${plugin.name}'`);
      plugin.install(this.context);
      this.plugins.set(plugin.name, plugin);
    }
  }

  get<P extends Plugin<T>>(name: string): P | undefined {
    return this.plugins.get(name) as P | undefined;
  }

  has(name: string): boolean {
    return this.plugins.has(name);
  }

  uninstall(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      this.context?.debug(`[PluginManager] Plugin '${name}' not found`);
      return false;
    }

    this.context?.debug(`[PluginManager] Uninstalling plugin '${name}'`);
    plugin.cleanup?.();
    this.plugins.delete(name);
    return true;
  }

  cleanup() {
    this.context?.debug(
      `[PluginManager] Cleaning up ${this.plugins.size} plugins`,
    );

    for (const [name, plugin] of this.plugins) {
      this.context?.debug(`[PluginManager] Cleaning up plugin '${name}'`);
      plugin.cleanup?.();
    }

    this.plugins.clear();
  }

  list(): string[] {
    return Array.from(this.plugins.keys());
  }
}
```

```ts [src/composables/use-check-in/types.ts]
import type { Ref, ComputedRef, InjectionKey } from "vue";

export type DeskEventType = "check-in" | "check-out" | "update" | "clear";

export type DeskEventPayload<T = any> = {
  "check-in": { id: string | number; data: T; timestamp: number };
  "check-out": { id: string | number; timestamp: number };
  update: { id: string | number; data: T; timestamp: number };
  clear: { timestamp: number };
};

export type DeskEventCallback<
  T = any,
  E extends DeskEventType = DeskEventType,
> = (payload: DeskEventPayload<T>[E]) => void;

export interface CheckInItem<T = any> {
  id: string | number;
  data: T;
  timestamp?: number;
  meta?: CheckInItemMeta;
}

export interface CheckInItemMeta {
  group?: string;

  order?: number;

  priority?: number;

  user?: Record<string, any>;
}

export interface SlotConfig {
  id: string;

  type: string;

  meta?: Record<string, any>;
}

export interface SlotsAPI<T = any> {
  register: (
    slotId: string,
    slotType: string,
    meta?: Record<string, any>,
  ) => void;

  unregister: (slotId: string) => void;

  get: (slotId: string) => CheckInItem<T>[];

  has: (slotId: string) => boolean;

  list: () => SlotConfig[];

  clear: () => void;
}

export interface DeskHook<T = any> {
  name: string;

  onCheckIn?: (item: CheckInItem<T>) => void;

  onCheckOut?: (id: string | number) => void;

  onUpdate?: (item: CheckInItem<T>) => void;

  onClear?: () => void;

  cleanup?: () => void;
}

export interface HooksAPI<T = any> {
  add: (hook: DeskHook<T>) => void;

  remove: (name: string) => boolean;

  list: () => string[];
}

export interface CheckInDesk<
  T = any,
  TContext extends Record<string, any> = {},
> {
  registry: Readonly<Ref<Map<string | number, CheckInItem<T>>>>;

  slots: SlotsAPI<T>;

  hooks: HooksAPI<T>;
  checkIn: (id: string | number, data: T, meta?: CheckInItemMeta) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: GetAllOptions<T>) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (
    items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
  ) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => void;

  on: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => () => void;

  off: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => void;

  emit: <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], "timestamp">,
  ) => void;

  getGroup: (
    group: string,
    options?: SortOptions<T>,
  ) => ComputedRef<CheckInItem<T>[]>;

  items: ComputedRef<CheckInItem<T>[]>;
}

export interface GetAllOptions<T = any> {
  sortBy?: keyof T | "timestamp" | `meta.${string}`;
  order?: "asc" | "desc";
  group?: string;
  filter?: (item: CheckInItem<T>) => boolean;
}

export interface SortOptions<T = any> {
  sortBy?: keyof T | "timestamp" | `meta.${string}`;
  order?: "asc" | "desc";
}

export interface CheckInDeskOptions<
  T = any,
  TContext extends Record<string, any> = {},
> {
  context?: TContext;

  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;

  onCheckIn?: (id: string | number, data: T) => void;

  onBeforeCheckOut?: (id: string | number) => void | boolean;

  onCheckOut?: (id: string | number) => void;

  debug?: boolean;

  hooks?: DeskHook<T>[];
}

export interface CheckInOptions<T = any> {
  required?: boolean;

  autoCheckIn?: boolean;

  id?: string | number;

  data?: T | (() => T) | (() => Promise<T>);

  generateId?: () => string | number;

  watchData?: boolean;

  shallow?: boolean;

  watchCondition?: (() => boolean) | Ref<boolean>;

  meta?: CheckInItemMeta;

  group?: string;

  position?: number;

  priority?: number;

  debug?: boolean;
}

export interface DeskProvider<
  T = any,
  TContext extends Record<string, any> = {},
> {
  desk: CheckInDesk<T, TContext> & TContext;
  DeskInjectionKey: InjectionKey<CheckInDesk<T, TContext> & TContext>;
}

export interface CheckInReturn<
  T = any,
  TContext extends Record<string, any> = {},
> {
  desk: (CheckInDesk<T, TContext> & TContext) | null;
  checkOut: () => void;
  updateSelf: (newData?: T) => void;
}
```

```ts [src/composables/use-check-in/plugins/events.plugin.ts]
import type {
  Plugin,
  PluginContext,
  DeskEventType,
  DeskEventCallback,
  DeskEventPayload,
} from "../types";

export interface EventsPlugin<T = any> extends Plugin<T> {
  on: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => () => void;
  off: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => void;
  emit: <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], "timestamp">,
  ) => void;
}

export const createEventsPlugin = <T = any,>(): EventsPlugin<T> => {
  const eventListeners = new Map<
    DeskEventType,
    Set<DeskEventCallback<T, any>>
  >();
  let context: PluginContext<T> | null = null;

  const emit = <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], "timestamp">,
  ) => {
    const listeners = eventListeners.get(event);
    if (!listeners || listeners.size === 0) return;

    const eventPayload = {
      ...payload,
      timestamp: Date.now(),
    } as DeskEventPayload<T>[E];

    context?.debug(`[Event] ${event}`, eventPayload);
    listeners.forEach((callback) => callback(eventPayload));
  };

  const on = <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, new Set());
    }
    eventListeners.get(event)!.add(callback);

    context?.debug(
      `[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`,
    );

    return () => off(event, callback);
  };

  const off = <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => {
    const listeners = eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      context?.debug(
        `[Event] Listener removed for '${event}', remaining: ${listeners.size}`,
      );
    }
  };

  const cleanup = () => {
    eventListeners.clear();
    context?.debug("[Event] Cleaned up all event listeners");
  };

  return {
    name: "events",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Events plugin installed");
    },
    cleanup,
    on,
    off,
    emit,
  };
};
```

```ts [src/composables/use-check-in/plugins/id.plugin.ts]
import type { Plugin, PluginContext } from "../types";

export interface IdPlugin extends Plugin {
  generateId: (prefix?: string) => string;
  memoizedId: (
    instanceOrId: object | string | number | null | undefined,
    prefix?: string,
  ) => string;
  clearCache: () => void;
}

const instanceIdMap = new WeakMap<object, string>();

const customIdMap = new Map<string, string>();
let instanceCounter = 0;

const generateSecureId = (prefix = "item"): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    const id = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return `${prefix}-${id}`;
  }

  const isDev =
    typeof process !== "undefined" && process.env?.NODE_ENV === "development";
  if (isDev) {
    console.warn(
      "[useCheckIn] crypto API not available, using Math.random fallback. " +
        "Consider upgrading to a modern environment.",
    );
  }
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${random}`;
};

export const createIdPlugin = (): IdPlugin => {
  let context: PluginContext | null = null;

  const generateId = (prefix = "item"): string => {
    const id = generateSecureId(prefix);
    context?.debug("[ID] Generated secure ID:", id);
    return id;
  };

  const memoizedId = (
    instanceOrId: object | string | number | null | undefined,
    prefix = "item",
  ): string => {
    if (typeof instanceOrId === "string" || typeof instanceOrId === "number") {
      const key = `${prefix}-${instanceOrId}`;
      let id = customIdMap.get(key);
      if (!id) {
        id = String(instanceOrId);
        customIdMap.set(key, id);
        context?.debug("[ID] Memoized custom ID:", { key, id });
      }
      return id;
    }

    if (instanceOrId && typeof instanceOrId === "object") {
      let id = instanceIdMap.get(instanceOrId);
      if (!id) {
        id = `${prefix}-${++instanceCounter}`;
        instanceIdMap.set(instanceOrId, id);
        context?.debug("[ID] Memoized instance ID:", {
          prefix,
          id,
          counter: instanceCounter,
        });
      }
      return id;
    }

    const isDev =
      typeof process !== "undefined" && process.env?.NODE_ENV === "development";
    if (isDev) {
      console.warn(
        `[useCheckIn] memoizedId: no instance or custom ID provided. ` +
          `Generated cryptographically secure ID. ` +
          `Consider passing getCurrentInstance() or a custom ID (nanoid, uuid, props.id, etc.).`,
      );
    }
    return generateId(prefix);
  };

  const clearCache = () => {
    customIdMap.clear();
    instanceCounter = 0;
    context?.debug("[ID] Cleared ID cache");
  };

  const cleanup = () => {
    clearCache();
    context?.debug("[ID] Plugin cleaned up");
  };

  return {
    name: "id",
    install: (ctx: PluginContext) => {
      context = ctx;
      ctx.debug("[Plugin] ID plugin installed");
    },
    cleanup,
    generateId,
    memoizedId,
    clearCache,
  };
};

export const clearIdCache = () => {
  customIdMap.clear();
  instanceCounter = 0;
};
```

```ts [src/composables/use-check-in/plugins/index.ts]
export { createEventsPlugin, type EventsPlugin } from "./events.plugin";
export { createRegistryPlugin, type RegistryPlugin } from "./registry.plugin";
export {
  createSortingPlugin,
  clearSortCache,
  type SortingPlugin,
} from "./sorting.plugin";
export { createIdPlugin, clearIdCache, type IdPlugin } from "./id.plugin";
```

```ts [src/composables/use-check-in/plugins/registry.plugin.ts]
import { triggerRef } from "vue";
import type {
  Plugin,
  PluginContext,
  CheckInItem,
  CheckInItemMeta,
} from "../types";

export interface RegistryPlugin<T = any> extends Plugin<T> {
  checkIn: (id: string | number, data: T, meta?: CheckInItemMeta) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (
    items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
  ) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => void;
}

export const createRegistryPlugin = <T = any,>(
  emitEvent?: <E extends string>(event: E, payload: any) => void,
): RegistryPlugin<T> => {
  let context: PluginContext<T> | null = null;

  const checkIn = (
    id: string | number,
    data: T,
    meta?: CheckInItemMeta,
  ): boolean => {
    if (!context) return false;

    context.debug("checkIn", { id, data, meta });

    if (context.options?.onBeforeCheckIn) {
      const result = context.options.onBeforeCheckIn(id, data);
      if (result === false) {
        context.debug("checkIn cancelled by onBeforeCheckIn", id);
        return false;
      }
    }

    context.registry.value.set(id, {
      id,
      data: data as any,
      timestamp: Date.now(),
      meta,
    });
    triggerRef(context.registry);

    emitEvent?.("check-in", { id, data });

    context.options?.onCheckIn?.(id, data);

    if (context.options?.debug) {
      context.debug("Registry state after check-in:", {
        total: context.registry.value.size,
        items: Array.from(context.registry.value.keys()),
      });
    }

    return true;
  };

  const checkOut = (id: string | number): boolean => {
    if (!context) return false;

    context.debug("checkOut", id);

    const existed = context.registry.value.has(id);
    if (!existed) return false;

    if (context.options?.onBeforeCheckOut) {
      const result = context.options.onBeforeCheckOut(id);
      if (result === false) {
        context.debug("checkOut cancelled by onBeforeCheckOut", id);
        return false;
      }
    }

    context.registry.value.delete(id);
    triggerRef(context.registry);

    emitEvent?.("check-out", { id });

    context.options?.onCheckOut?.(id);

    if (context.options?.debug) {
      context.debug("Registry state after check-out:", {
        total: context.registry.value.size,
        items: Array.from(context.registry.value.keys()),
      });
    }

    return true;
  };

  const get = (id: string | number) => {
    return context?.registry.value.get(id);
  };

  const update = (id: string | number, data: Partial<T>): boolean => {
    if (!context) return false;

    const existing = context.registry.value.get(id);
    if (!existing) {
      context.debug("update failed: item not found", id);
      return false;
    }

    if (typeof existing.data === "object" && typeof data === "object") {
      const previousData = { ...existing.data };

      Object.assign(existing.data as object, data);
      triggerRef(context.registry);

      emitEvent?.("update", { id, data: existing.data });

      if (context.options?.debug) {
        context.debug("update diff:", {
          id,
          before: previousData,
          after: existing.data,
          changes: data,
        });
      }

      return true;
    }

    return false;
  };

  const has = (id: string | number) => {
    return context?.registry.value.has(id) ?? false;
  };

  const clear = () => {
    if (!context) return;

    context.debug("clear");
    const count = context.registry.value.size;
    context.registry.value.clear();
    triggerRef(context.registry);

    emitEvent?.("clear", {});

    context.debug(`Cleared ${count} items from registry`);
  };

  const checkInMany = (
    items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
  ) => {
    context?.debug("checkInMany", items.length, "items");
    items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
  };

  const checkOutMany = (ids: Array<string | number>) => {
    context?.debug("checkOutMany", ids.length, "items");
    ids.forEach((id) => checkOut(id));
  };

  const updateMany = (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => {
    context?.debug("updateMany", updates.length, "items");
    updates.forEach(({ id, data }) => update(id, data));
  };

  const cleanup = () => {
    if (!context) return;
    context.registry.value.clear();
    context.debug("[Registry] Cleaned up registry");
  };

  return {
    name: "registry",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Registry plugin installed");
    },
    cleanup,
    checkIn,
    checkOut,
    get,
    update,
    has,
    clear,
    checkInMany,
    checkOutMany,
    updateMany,
  };
};
```

```ts [src/composables/use-check-in/plugins/runtime-usage.example.ts]
import type { Plugin, PluginContext, CheckInItem } from "../types";

export interface AnalyticsEvent {
  type: "check-in" | "check-out" | "update";
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
  track: (event: AnalyticsEvent) => void;

  flush: () => Promise<void>;

  getStats: () => {
    totalEvents: number;
    checkIns: number;
    checkOuts: number;
    updates: number;
  };
}

export const createAnalyticsPlugin = <T = any,>(
  options?: AnalyticsPluginOptions,
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

    if (event.type === "check-in") stats.checkIns++;
    else if (event.type === "check-out") stats.checkOuts++;
    else if (event.type === "update") stats.updates++;

    context?.debug("[Analytics] Tracked event:", event);

    if (options?.batchSize && events.length >= options.batchSize) {
      flush();
    }
  };

  const flush = async () => {
    if (events.length === 0) return;

    const endpoint = options?.endpoint || "/api/analytics";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: [...events] }),
      });

      if (response.ok) {
        context?.debug("[Analytics] Flushed", events.length, "events");
        events.length = 0;
      }
    } catch (error) {
      console.error("[Analytics] Failed to flush:", error);
    }
  };

  const getStats = () => ({ ...stats });

  let flushInterval: NodeJS.Timeout | null = null;

  return {
    name: "analytics",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Analytics plugin installed");

      if (options?.flushInterval) {
        flushInterval = setInterval(() => {
          flush();
        }, options.flushInterval);
      }
    },
    cleanup: () => {
      flush();

      if (flushInterval) {
        clearInterval(flushInterval);
      }

      context?.debug("[Analytics] Plugin cleaned up");
    },
    track,
    flush,
    getStats,
  };
};

import { ref, onMounted, onUnmounted } from "vue";
import { useCheckIn, type CheckInDesk } from "../useCheckIn";
import type { SlotsPlugin } from "./slots.plugin.example";

export interface ToolbarItem {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

export function useToolbarWithPlugins() {
  const { createDesk } = useCheckIn<ToolbarItem>();
  const { desk } = createDesk({ debug: true });

  const slotsPlugin = ref<SlotsPlugin<ToolbarItem>>();
  const analyticsPlugin = ref<AnalyticsPlugin<ToolbarItem>>();

  const loadPlugins = async () => {
    const { createSlotsPlugin } = await import("./slots.plugin.example");
    const slots = createSlotsPlugin<ToolbarItem>();
    desk.plugins.install(slots);
    slotsPlugin.value = desk.plugins.get<SlotsPlugin<ToolbarItem>>("slots");

    slotsPlugin.value?.registerSlot("header-left", "toolbar", {
      align: "left",
    });
    slotsPlugin.value?.registerSlot("header-right", "toolbar", {
      align: "right",
    });
    slotsPlugin.value?.registerSlot("footer", "toolbar", { align: "center" });

    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "production"
    ) {
      const analytics = createAnalyticsPlugin<ToolbarItem>({
        endpoint: "/api/analytics",
        batchSize: 10,
        flushInterval: 30000,
      });

      desk.plugins.install(analytics);
      analyticsPlugin.value =
        desk.plugins.get<AnalyticsPlugin<ToolbarItem>>("analytics");

      desk.on("check-in", (payload) => {
        analyticsPlugin.value?.track({
          type: "check-in",
          itemId: payload.id,
          timestamp: payload.timestamp,
          data: payload.data,
        });
      });

      desk.on("check-out", (payload) => {
        analyticsPlugin.value?.track({
          type: "check-out",
          itemId: payload.id,
          timestamp: payload.timestamp,
        });
      });
    }
  };

  const addToSlot = (slotId: string, id: string, item: ToolbarItem) => {
    if (!slotsPlugin.value) {
      console.warn("Slots plugin not loaded");
      return;
    }

    desk.checkIn(id, item, {
      user: { slotId, slotType: "toolbar" },
    });
  };

  const getSlotItems = (slotId: string) => {
    return slotsPlugin.value?.getSlotItems(slotId) ?? [];
  };

  const getAnalyticsStats = () => {
    return analyticsPlugin.value?.getStats() ?? null;
  };

  onMounted(() => {
    loadPlugins();
  });

  onUnmounted(() => {
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


const headerLeft = computed(() => getSlotItems('header-left'));
const headerRight = computed(() => getSlotItems('header-right'));
const footer = computed(() => getSlotItems('footer'));


const stats = computed(() => getAnalyticsStats());


const loadExtraPlugin = async () => {
  
  if (userHasPermission.value) {
    const { createPermissionsPlugin } = await import('./permissions.plugin');
    const permPlugin = createPermissionsPlugin();
    desk.plugins.install(permPlugin);
  }
};


onMounted(() => {
  addSaveButton();
  addCancelButton();
});
</script>

<template>
  <div class="toolbar-container">
    
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

    
    <main class="content">
      <slot />
    </main>

    
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
```

```ts [src/composables/use-check-in/plugins/slots.plugin.example.ts]
import type { Plugin, PluginContext, CheckInItem } from "../types";

export interface SlotMeta {
  slotId?: string;
  slotType?: string;
  slotData?: Record<string, any>;
}

export interface SlotsPlugin<T = any> extends Plugin<T> {
  registerSlot: (
    slotId: string,
    slotType: string,
    config?: Record<string, any>,
  ) => void;

  unregisterSlot: (slotId: string) => void;

  getSlotItems: (slotId: string) => CheckInItem<T>[];

  hasSlot: (slotId: string) => boolean;
}

export const createSlotsPlugin = <T = any,>(): SlotsPlugin<T> => {
  let context: PluginContext<T> | null = null;

  const slots = new Map<
    string,
    {
      slotId: string;
      slotType: string;
      config?: Record<string, any>;
    }
  >();

  const registerSlot = (
    slotId: string,
    slotType: string,
    config?: Record<string, any>,
  ) => {
    if (slots.has(slotId)) {
      context?.debug(
        `[Slots] Slot '${slotId}' already registered, updating config`,
      );
    }

    slots.set(slotId, { slotId, slotType, config });
    context?.debug(
      `[Slots] Registered slot '${slotId}' of type '${slotType}'`,
      config,
    );
  };

  const unregisterSlot = (slotId: string) => {
    const existed = slots.delete(slotId);
    if (existed) {
      context?.debug(`[Slots] Unregistered slot '${slotId}'`);
    }
  };

  const getSlotItems = (slotId: string): CheckInItem<T>[] => {
    if (!context) return [];

    const items = Array.from(context.registry.value.values()).filter(
      (item) => (item.meta as any)?.slotId === slotId,
    );

    context?.debug(
      `[Slots] Retrieved ${items.length} items from slot '${slotId}'`,
    );
    return items;
  };

  const hasSlot = (slotId: string): boolean => {
    return slots.has(slotId);
  };

  const cleanup = () => {
    slots.clear();
    context?.debug("[Slots] Cleaned up all slots");
  };

  return {
    name: "slots",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Slots plugin installed");
    },
    cleanup,
    registerSlot,
    unregisterSlot,
    getSlotItems,
    hasSlot,
  };
};

export const SlotsPluginExample = `

<script setup lang="ts">
import { useCheckIn, createSlotsPlugin } from './useCheckIn';

interface ToolbarItem {
  label: string;
  icon?: string;
  onClick: () => void;
}

const { createDesk } = useCheckIn<ToolbarItem>();
const slotsPlugin = createSlotsPlugin<ToolbarItem>();

const { desk } = createDesk({
  plugins: [slotsPlugin]
});


slotsPlugin.registerSlot('header-left', 'toolbar', { align: 'left' });
slotsPlugin.registerSlot('header-right', 'toolbar', { align: 'right' });
slotsPlugin.registerSlot('footer-actions', 'toolbar', { align: 'center' });


const headerLeftItems = computed(() => slotsPlugin.getSlotItems('header-left'));
const headerRightItems = computed(() => slotsPlugin.getSlotItems('header-right'));
const footerItems = computed(() => slotsPlugin.getSlotItems('footer-actions'));
</script>

<template>
  <div>
    <header>
      <div class="left">
        <ToolbarButton
          v-for="item in headerLeftItems"
          :key="item.id"
          v-bind="item.data"
        />
      </div>
      <div class="right">
        <ToolbarButton
          v-for="item in headerRightItems"
          :key="item.id"
          v-bind="item.data"
        />
      </div>
    </header>
    
    <main>
      <slot /> 
    </main>
    
    <footer>
      <ToolbarButton
        v-for="item in footerItems"
        :key="item.id"
        v-bind="item.data"
      />
    </footer>
  </div>
</template>


<script setup lang="ts">
import { useCheckIn } from './useCheckIn';

const props = defineProps<{
  slotId: 'header-left' | 'header-right' | 'footer-actions';
  label: string;
  icon?: string;
}>();

const { checkIn } = useCheckIn<ToolbarItem>();

checkIn(desk, {
  autoCheckIn: true,
  id: \`btn-\${props.label}\`,
  data: {
    label: props.label,
    icon: props.icon,
    onClick: () => console.log(\`\${props.label} clicked\`)
  },
  meta: {
    slotId: props.slotId,
    slotType: 'toolbar',
    user: {
      
    }
  }
});
</script>
`;
```

```ts [src/composables/use-check-in/plugins/sorting.plugin.ts]
import type {
  Plugin,
  PluginContext,
  CheckInItem,
  GetAllOptions,
} from "../types";

export interface SortingPlugin<T = any> extends Plugin<T> {
  getAll: (options?: GetAllOptions<T>) => CheckInItem<T>[];
}

const sortFnCache = new Map<string, (a: any, b: any) => number>();

const compileSortFn = <T,>(
  sortBy: keyof T | "timestamp" | `meta.${string}`,
  order: "asc" | "desc" = "asc",
): ((a: CheckInItem<T>, b: CheckInItem<T>) => number) => {
  const cacheKey = `${String(sortBy)}-${order}`;
  const cached = sortFnCache.get(cacheKey);
  if (cached) return cached;

  let fn: (a: CheckInItem<T>, b: CheckInItem<T>) => number;

  if (sortBy === "timestamp") {
    fn = (a, b) => {
      const aVal = a.timestamp || 0;
      const bVal = b.timestamp || 0;
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === "desc" ? -comparison : comparison;
    };
  } else if (typeof sortBy === "string" && sortBy.startsWith("meta.")) {
    const metaKey = sortBy.slice(5);
    fn = (a, b) => {
      const aVal = (a.meta as any)?.[metaKey];
      const bVal = (b.meta as any)?.[metaKey];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === "desc" ? -comparison : comparison;
    };
  } else {
    const key = sortBy as keyof T;
    fn = (a, b) => {
      const aVal = a.data[key];
      const bVal = b.data[key];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === "desc" ? -comparison : comparison;
    };
  }

  sortFnCache.set(cacheKey, fn);
  return fn;
};

export const createSortingPlugin = <T = any,>(): SortingPlugin<T> => {
  let context: PluginContext<T> | null = null;

  const getAll = (options?: GetAllOptions<T>): CheckInItem<T>[] => {
    if (!context) return [];

    let items = Array.from(context.registry.value.values());

    if (options?.group !== undefined) {
      items = items.filter((item) => item.meta?.group === options.group);
    }

    if (options?.filter) {
      items = items.filter(options.filter);
    }

    if (options?.sortBy) {
      const sortFn = compileSortFn<T>(options.sortBy, options.order);
      items.sort(sortFn);
    }

    return items;
  };

  const cleanup = () => {
    context?.debug("[Sorting] Plugin cleaned up");
  };

  return {
    name: "sorting",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Sorting plugin installed");
    },
    cleanup,
    getAll,
  };
};

export const clearSortCache = () => {
  sortFnCache.clear();
};
```
:::

## API
::hr-underline
::

  ### Returns

Return both the desk and its symbol for children to inject

| Property | Type | Description |
|----------|------|-------------|
| `createDesk`{.primary .text-primary} | `any` | — |
| `checkIn`{.primary .text-primary} | `any` | — |
| `generateId`{.primary .text-primary} | `any` | — |
| `memoizedId`{.primary .text-primary} | `any` | — |
| `standaloneDesk`{.primary .text-primary} | `any` | — |
| `isCheckedIn`{.primary .text-primary} | `Ref<any>` | — |
| `getRegistry`{.primary .text-primary} | `any` | — |

---

## pluginManager
::hr-underline
::

Gestionnaire de plugins pour le système de check-in
Coordonne l&#39;installation et le cycle de vie des plugins

---

## types
::hr-underline
::

Types et interfaces pour le système de check-in

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `DeskEventType`{.primary .text-primary} | `type` | — |
| `DeskEventPayload`{.primary .text-primary} | `type` | — |
| `DeskEventCallback`{.primary .text-primary} | `type` | — |
| `CheckInItem`{.primary .text-primary} | `interface` | — |
| `CheckInItemMeta`{.primary .text-primary} | `interface` | — |
| `SlotConfig`{.primary .text-primary} | `interface` | — |
| `SlotsAPI`{.primary .text-primary} | `interface` | — |
| `DeskHook`{.primary .text-primary} | `interface` | — |
| `HooksAPI`{.primary .text-primary} | `interface` | — |
| `CheckInDesk`{.primary .text-primary} | `interface` | — |
| `GetAllOptions`{.primary .text-primary} | `interface` | — |
| `SortOptions`{.primary .text-primary} | `interface` | — |
| `CheckInDeskOptions`{.primary .text-primary} | `interface` | — |
| `CheckInOptions`{.primary .text-primary} | `interface` | — |
| `DeskProvider`{.primary .text-primary} | `interface` | — |
| `CheckInReturn`{.primary .text-primary} | `interface` | — |

---

## plugins/events.plugin
::hr-underline
::

---

## plugins/id.plugin
::hr-underline
::

---

## plugins/index
::hr-underline
::

---

## plugins/registry.plugin
::hr-underline
::

---

## plugins/runtime-usage.example
::hr-underline
::

---

## plugins/slots.plugin.example
::hr-underline
::

---

## plugins/sorting.plugin
::hr-underline
::

---

::tip
You can copy and adapt this template for any composable documentation.
::
