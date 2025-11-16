# Chargement de Plugins au Runtime - Guide Typesafe

## 🎯 Concept

Le système `useCheckIn` permet maintenant de **charger et utiliser des plugins au runtime** de manière entièrement **typesafe**. Vous pouvez :

1. Installer des plugins après la création du desk
2. Accéder aux plugins avec autocomplétion TypeScript
3. Utiliser les méthodes du plugin avec typage complet
4. Désinstaller des plugins dynamiquement

## 🔌 Accès au Plugin Manager

Chaque desk expose maintenant une propriété `plugins` qui donne accès au gestionnaire de plugins :

```ts
interface PluginManagerAPI<T> {
  get<P extends Plugin<T>>(name: string): P | undefined;
  has(name: string): boolean;
  list(): string[];
  install(...plugins: Plugin<T>[]): void;
  uninstall(name: string): boolean;
}
```

## 📚 Exemples d'utilisation

### 1. Chargement de plugin au runtime

```ts
import { useCheckIn, type Plugin } from './useCheckIn';
import { createSlotsPlugin, type SlotsPlugin } from './plugins/slots.plugin.example';

// Créer le desk
const { desk } = useCheckIn<MyItem>().createDesk();

// Charger un plugin au runtime
const slotsPlugin = createSlotsPlugin<MyItem>();
desk.plugins.install(slotsPlugin);

// Vérifier que le plugin est chargé
if (desk.plugins.has('slots')) {
  console.log('Slots plugin is ready!');
}
```

### 2. Accès typesafe à un plugin

```ts
// Récupérer un plugin avec typage complet
const slotsPlugin = desk.plugins.get<SlotsPlugin<MyItem>>('slots');

if (slotsPlugin) {
  // Autocomplétion complète des méthodes du plugin
  slotsPlugin.registerSlot('header-left', 'toolbar');
  slotsPlugin.registerSlot('header-right', 'toolbar');
  
  // Utilisation des méthodes spécifiques
  const items = slotsPlugin.getSlotItems('header-left');
  const hasSlot = slotsPlugin.hasSlot('header-right');
}
```

### 3. Plugin conditionnel

```ts
// Charger un plugin seulement si une condition est vraie
const { desk } = useCheckIn<MyItem>().createDesk({
  debug: true
});

// Charger un plugin de debug seulement en développement
if (import.meta.env.DEV) {
  const debugPlugin = createDebugPlugin<MyItem>();
  desk.plugins.install(debugPlugin);
}

// Charger un plugin de persistence seulement si disponible
if (window.localStorage) {
  const persistencePlugin = createPersistencePlugin<MyItem>({
    key: 'my-data'
  });
  desk.plugins.install(persistencePlugin);
}
```

### 4. Plugin lazy-loaded

```ts
const { desk } = useCheckIn<MyItem>().createDesk();

// Charger un plugin de manière asynchrone
async function loadAdvancedFeatures() {
  // Import dynamique
  const { createAnalyticsPlugin } = await import('./plugins/analytics.plugin');
  
  const analyticsPlugin = createAnalyticsPlugin<MyItem>({
    endpoint: '/api/analytics'
  });
  
  desk.plugins.install(analyticsPlugin);
  
  console.log('Advanced features loaded!');
}

// Charger au besoin
button.addEventListener('click', loadAdvancedFeatures);
```

### 5. Utilisation dans un composant

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useCheckIn } from './useCheckIn';
import { createSlotsPlugin, type SlotsPlugin } from './plugins/slots.plugin.example';

interface ToolbarItem {
  label: string;
  icon?: string;
  onClick: () => void;
}

const { createDesk } = useCheckIn<ToolbarItem>();
const { desk } = createDesk({ debug: true });

// Référence typée au plugin
const slotsPlugin = ref<SlotsPlugin<ToolbarItem>>();

onMounted(() => {
  // Charger le plugin au montage
  const plugin = createSlotsPlugin<ToolbarItem>();
  desk.plugins.install(plugin);
  
  // Récupérer la référence typée
  slotsPlugin.value = desk.plugins.get<SlotsPlugin<ToolbarItem>>('slots');
  
  // Configurer les slots
  slotsPlugin.value?.registerSlot('header-left', 'toolbar', { align: 'left' });
  slotsPlugin.value?.registerSlot('header-right', 'toolbar', { align: 'right' });
});

// Computed avec accès au plugin
const headerLeftItems = computed(() => 
  slotsPlugin.value?.getSlotItems('header-left') ?? []
);

const headerRightItems = computed(() => 
  slotsPlugin.value?.getSlotItems('header-right') ?? []
);
</script>

<template>
  <div class="toolbar">
    <div class="left">
      <button
        v-for="item in headerLeftItems"
        :key="item.id"
        @click="item.data.onClick"
      >
        {{ item.data.label }}
      </button>
    </div>
    
    <div class="right">
      <button
        v-for="item in headerRightItems"
        :key="item.id"
        @click="item.data.onClick"
      >
        {{ item.data.label }}
      </button>
    </div>
  </div>
</template>
```

### 6. Désinstallation dynamique

```ts
const { desk } = useCheckIn<MyItem>().createDesk();

// Installer un plugin
const tempPlugin = createTempPlugin<MyItem>();
desk.plugins.install(tempPlugin);

// Utiliser le plugin
const plugin = desk.plugins.get<TempPlugin<MyItem>>('temp');
plugin?.doSomething();

// Désinstaller quand on n'en a plus besoin
desk.plugins.uninstall('temp');

// Le plugin est nettoyé (cleanup appelé)
console.log(desk.plugins.has('temp')); // false
```

### 7. Liste des plugins installés

```ts
const { desk } = useCheckIn<MyItem>().createDesk({
  plugins: [customPlugin1, customPlugin2]
});

// Lister tous les plugins
const installedPlugins = desk.plugins.list();
console.log('Installed plugins:', installedPlugins);
// ['events', 'registry', 'sorting', 'id', 'custom1', 'custom2']

// Vérifier si un plugin spécifique est installé
if (desk.plugins.has('custom1')) {
  const plugin = desk.plugins.get<CustomPlugin1<MyItem>>('custom1');
  // Utiliser le plugin
}
```

## 🎨 Exemple de plugin custom complet

```ts
// persistence.plugin.ts
import type { Plugin, PluginContext, CheckInItem } from '../types';

export interface PersistencePluginOptions {
  key: string;
  storage?: Storage;
}

export interface PersistencePlugin<T = any> extends Plugin<T> {
  save: () => void;
  load: () => CheckInItem<T>[];
  clear: () => void;
  setAutoSave: (enabled: boolean) => void;
}

export const createPersistencePlugin = <T = any>(
  options: PersistencePluginOptions
): PersistencePlugin<T> => {
  const storage = options.storage || localStorage;
  let context: PluginContext<T> | null = null;
  let autoSave = false;

  const save = () => {
    if (!context) return;
    
    const items = Array.from(context.registry.value.values());
    storage.setItem(options.key, JSON.stringify(items));
    context.debug('[Persistence] Saved', items.length, 'items');
  };

  const load = (): CheckInItem<T>[] => {
    const data = storage.getItem(options.key);
    if (!data) return [];
    
    try {
      const items = JSON.parse(data) as CheckInItem<T>[];
      context?.debug('[Persistence] Loaded', items.length, 'items');
      return items;
    } catch (error) {
      console.error('[Persistence] Failed to load:', error);
      return [];
    }
  };

  const clear = () => {
    storage.removeItem(options.key);
    context?.debug('[Persistence] Cleared storage');
  };

  const setAutoSave = (enabled: boolean) => {
    autoSave = enabled;
    context?.debug('[Persistence] Auto-save', enabled ? 'enabled' : 'disabled');
  };

  return {
    name: 'persistence',
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug('[Plugin] Persistence plugin installed');
      
      // Auto-load on install
      const savedItems = load();
      savedItems.forEach(item => {
        ctx.registry.value.set(item.id, item);
      });
    },
    cleanup: () => {
      if (autoSave) {
        save();
      }
      context?.debug('[Persistence] Plugin cleaned up');
    },
    save,
    load,
    clear,
    setAutoSave,
  };
};
```

### Utilisation du plugin de persistence

```ts
import { useCheckIn } from './useCheckIn';
import { createPersistencePlugin, type PersistencePlugin } from './plugins/persistence.plugin';

const { desk } = useCheckIn<MyItem>().createDesk();

// Charger le plugin avec options
const persistencePlugin = createPersistencePlugin<MyItem>({
  key: 'my-app-data',
  storage: localStorage
});

desk.plugins.install(persistencePlugin);

// Récupérer et utiliser le plugin
const persistence = desk.plugins.get<PersistencePlugin<MyItem>>('persistence');

if (persistence) {
  // Activer la sauvegarde automatique
  persistence.setAutoSave(true);
  
  // Sauvegarder manuellement
  persistence.save();
  
  // Charger les données
  const items = persistence.load();
  
  // Effacer le stockage
  persistence.clear();
}
```

## ✨ Avantages du système

### 1. Type Safety
```ts
// ✅ Typage complet avec autocomplétion
const plugin = desk.plugins.get<MyPlugin<T>>('my-plugin');
plugin?.myMethod(); // Autocomplétion de toutes les méthodes

// ❌ TypeScript vous prévient si le type est incorrect
const wrongPlugin = desk.plugins.get<WrongType>('my-plugin');
```

### 2. Flexibilité
```ts
// Chargement conditionnel
if (userIsPremium) {
  desk.plugins.install(premiumFeaturesPlugin);
}

// Lazy loading
async function enableAdvanced() {
  const plugin = await import('./advanced.plugin');
  desk.plugins.install(plugin.default);
}

// Feature flags
if (featureFlags.analytics) {
  desk.plugins.install(analyticsPlugin);
}
```

### 3. Performance
```ts
// Charger seulement ce dont vous avez besoin
const lightDesk = useCheckIn<T>().createDesk();
// Pas de plugins lourds chargés

// Charger au besoin
button.addEventListener('click', () => {
  desk.plugins.install(heavyFeaturePlugin);
});
```

### 4. Testabilité
```ts
// Mock facile des plugins en tests
const mockPlugin: MyPlugin<T> = {
  name: 'my-plugin',
  install: vi.fn(),
  myMethod: vi.fn()
};

desk.plugins.install(mockPlugin);
```

## 🔍 Détection et validation

```ts
// Vérifier qu'un plugin est disponible avant utilisation
function useSlots<T>(desk: CheckInDesk<T>) {
  if (!desk.plugins.has('slots')) {
    throw new Error('Slots plugin is required');
  }
  
  return desk.plugins.get<SlotsPlugin<T>>('slots')!;
}

// Guard type helper
function requirePlugin<T, P extends Plugin<T>>(
  desk: CheckInDesk<T>,
  name: string
): P {
  const plugin = desk.plugins.get<P>(name);
  if (!plugin) {
    throw new Error(`Plugin '${name}' is required but not installed`);
  }
  return plugin;
}

// Usage
const slots = requirePlugin<MyItem, SlotsPlugin<MyItem>>(desk, 'slots');
slots.registerSlot(...); // Pas besoin de vérifier null
```

## 🎯 Best Practices

1. **Typer explicitement** vos plugins pour l'autocomplétion
2. **Vérifier l'existence** avant utilisation (`has()` ou `get()` avec null-check)
3. **Nommer de manière unique** vos plugins
4. **Documenter** les dépendances entre plugins
5. **Cleanup** dans la méthode `cleanup()` du plugin
6. **Auto-save** avant cleanup si nécessaire

## 📦 Résumé

Le système de plugins runtime permet :
- ✅ Chargement dynamique et lazy
- ✅ Type safety complet avec TypeScript
- ✅ Installation/désinstallation à chaud
- ✅ Accès typé aux méthodes des plugins
- ✅ Gestion du cycle de vie
- ✅ Plugins conditionnels et feature flags
- ✅ Performance optimale (charger ce dont vous avez besoin)

🎉 **Vous pouvez maintenant créer des applications modulaires et extensibles !**
