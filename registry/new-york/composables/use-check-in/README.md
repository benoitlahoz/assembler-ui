# useCheckIn - Système de Check-in Parent/Enfant

> Système générique d'enregistrement pour les composants Vue avec architecture modulaire basée sur des plugins.

## 🎯 Concept

Comme un comptoir d'enregistrement à l'aéroport : les composants parents ouvrent un "desk" (bureau) où les composants enfants viennent s'enregistrer avec leurs données.

**Cas d'usage :**
- Tabs & Accordions
- Formulaires & Fields
- Toolbars & Menus
- Breadcrumbs & Navigation
- Notifications & Toasts
- Context Menus
- Et bien plus...

## ✨ Caractéristiques

- ✅ **Architecture modulaire** avec système de plugins
- ✅ **TypeScript** complet avec types stricts
- ✅ **Performances optimisées** (cache de tri, lazy computed)
- ✅ **Extensible** via plugins personnalisés
- ✅ **Events typés** avec autocomplétion
- ✅ **Lifecycle hooks** (before/after check-in/out)
- ✅ **Watch reactive** des données
- ✅ **Auto check-in/out** avec cleanup
- ✅ **Tri & filtrage** avancés
- ✅ **Grouping** des items
- ✅ **IDs sécurisés** (crypto.randomUUID)

## 🚀 Utilisation rapide

### Composant Parent

```vue
<script setup lang="ts">
import { useCheckIn } from './useCheckIn';

interface TabItem {
  label: string;
  content: string;
  disabled?: boolean;
}

const { createDesk } = useCheckIn<TabItem>();
const { desk } = createDesk();

// Computed de tous les items
const tabs = desk.items;

// Écouter les events
desk.on('check-in', (payload) => {
  console.log('New tab registered:', payload.data);
});
</script>

<template>
  <div class="tabs">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      :disabled="tab.data.disabled"
    >
      {{ tab.data.label }}
    </button>
    
    <slot /> <!-- Child tabs -->
  </div>
</template>
```

### Composant Enfant

```vue
<script setup lang="ts">
import { useCheckIn } from './useCheckIn';

const props = defineProps<{
  label: string;
  disabled?: boolean;
}>();

const { checkIn } = useCheckIn<TabItem>();

checkIn(parentDesk, {
  autoCheckIn: true,
  id: props.label,
  data: {
    label: props.label,
    disabled: props.disabled
  }
});
</script>

<template>
  <div>{{ label }} content</div>
</template>
```

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture détaillée et système de plugins
- **[MIGRATION.md](./MIGRATION.md)** - Guide de migration depuis v1
- **[types.ts](./types.ts)** - Référence TypeScript complète
- **[plugins/](./plugins/)** - Code source des plugins

## 🔌 Système de Plugins

### Plugins inclus

1. **EventsPlugin** - Système d'événements typé
2. **RegistryPlugin** - Opérations CRUD sur le registre
3. **SortingPlugin** - Tri et filtrage optimisés (avec cache)
4. **IdPlugin** - Génération d'IDs sécurisés

### Créer un plugin personnalisé

```ts
import { type Plugin } from './types';

const myPlugin: Plugin<MyType> = {
  name: 'my-plugin',
  install: (context) => {
    // Accès au registry, options, debug
    context.debug('[MyPlugin] Installed');
    
    // Logique du plugin
    // ...
  },
  cleanup: () => {
    // Nettoyage si nécessaire
  }
};

// Utilisation
const { desk } = createDesk({
  plugins: [myPlugin]
});
```

Voir [slots.plugin.example.ts](./plugins/slots.plugin.example.ts) pour un exemple complet.

## 🎨 Exemples avancés

### Tri et filtrage

```ts
// Tri par nom
desk.getAll({ sortBy: 'name', order: 'asc' });

// Tri par metadata
desk.getAll({ sortBy: 'meta.order', order: 'asc' });

// Filtrage par groupe
desk.getAll({ group: 'primary' });

// Filtrage custom + tri
desk.getAll({
  filter: (item) => !item.data.disabled,
  sortBy: 'meta.priority',
  order: 'desc'
});
```

### Groupes avec computed

```ts
const primaryItems = desk.getGroup('primary', {
  sortBy: 'meta.order',
  order: 'asc'
});

const secondaryItems = desk.getGroup('secondary');
```

### Watch des données

```ts
checkIn(desk, {
  autoCheckIn: true,
  watchData: true,  // Auto-update quand data change
  data: () => ({
    label: props.label,
    count: count.value
  })
});
```

### Conditions réactives

```ts
checkIn(desk, {
  watchCondition: () => isVisible.value,  // Auto check-in/out selon condition
  data: myData
});
```

### Lifecycle hooks

```ts
createDesk({
  onBeforeCheckIn: (id, data) => {
    console.log('Before check-in:', id);
    return true; // false pour annuler
  },
  onCheckIn: (id, data) => {
    console.log('After check-in:', id);
  },
  onBeforeCheckOut: (id) => {
    return confirm('Remove item?');
  },
  onCheckOut: (id) => {
    console.log('Removed:', id);
  }
});
```

## 🏗️ Architecture

```
use-check-in/
├── types.ts                 # Types centralisés
├── plugin-manager.ts        # Gestionnaire de plugins
├── plugins/
│   ├── events.plugin.ts    # Système d'événements
│   ├── registry.plugin.ts  # CRUD operations
│   ├── sorting.plugin.ts   # Tri & filtrage optimisés
│   └── id.plugin.ts        # Génération d'IDs
├── useCheckIn.ts           # Composable principal
├── ARCHITECTURE.md         # Documentation détaillée
├── MIGRATION.md            # Guide de migration
└── README.md               # Ce fichier
```

## 🔄 Migration depuis v1

La nouvelle version est **rétrocompatible à 90%**. Principaux changements :

1. `meta.position` → `meta.order`
2. Props custom dans `meta.user`
3. Registry en lecture seule (utiliser l'API)

Voir [MIGRATION.md](./MIGRATION.md) pour le guide complet.

## 📦 API Principale

### createDesk()

Crée un desk pour que les enfants s'enregistrent.

```ts
const { desk, DeskInjectionKey } = createDesk(options);
```

### checkIn()

Enregistre un composant enfant au desk parent.

```ts
const { desk, checkOut, updateSelf } = checkIn(parentDesk, options);
```

### Méthodes du Desk

- `checkIn(id, data, meta?)` - Enregistre un item
- `checkOut(id)` - Désenregistre un item
- `update(id, data)` - Met à jour un item
- `get(id)` - Récupère un item
- `getAll(options?)` - Récupère tous les items (avec tri/filtre)
- `has(id)` - Vérifie l'existence
- `clear()` - Vide le registre
- `on(event, callback)` - Écoute un événement
- `off(event, callback)` - Retire un listener
- `getGroup(group, options?)` - Computed d'un groupe

### Events disponibles

- `check-in` - Item enregistré
- `check-out` - Item désenregistré
- `update` - Item mis à jour
- `clear` - Registre vidé

## 🎯 Bonnes pratiques

1. ✅ Utilisez `autoCheckIn: true` pour la plupart des cas
2. ✅ Structurez les meta : `{ group, order, priority, user: {...} }`
3. ✅ Utilisez les computed (`desk.items`, `desk.getGroup()`)
4. ✅ Préférez l'API aux manipulations directes du registry
5. ✅ Activez `debug: true` pendant le développement
6. ✅ Typez vos données avec TypeScript

## 🤝 Contribution

Les contributions sont bienvenues ! Particulièrement :

- Nouveaux plugins (persistence, sync, validation...)
- Améliorations de performance
- Documentation et exemples
- Tests

## 📄 Licence

MIT

---

**Made with ❤️ for Vue.js developers**
