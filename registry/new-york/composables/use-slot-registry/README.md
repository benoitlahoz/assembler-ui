# useSlotRegistry

**Slot Registry Pattern** - Extension du système `useCheckIn` pour la gestion dynamique de slots/templates.

## 🎯 Vue d'ensemble

Le Slot Registry Pattern permet aux composants enfants d'enregistrer dynamiquement des slots, templates ou render functions que le parent peut collecter et rendre. C'est une extension naturelle du système check-in qui ajoute les capacités de rendu.

## 🏗️ Architecture

```
useCheckIn (base)
    ↓
    └─ Enregistrement de données
    └─ Lifecycle management
    └─ Event system

useSlotRegistry (extension)
    ↓
    └─ Tout ce qui précède +
    └─ Enregistrement de slots renderables
    └─ Scoped slots avec données typées
    └─ Groupes de slots
    └─ Tri par position/priorité
    └─ Visibilité conditionnelle
```

## 📦 Contenu

```
use-slot-registry/
├── useSlotRegistry.ts          # Composable principal
├── assemblerjs.json            # Métadonnées du registry
├── demos/                      # Exemples d'utilisation
│   ├── DynamicToolbarDemo.vue          # Toolbar avec groupes
│   ├── DynamicToolbarButton.vue        # Bouton de toolbar
│   ├── DynamicToolbarSeparator.vue     # Séparateur visuel
│   ├── BreadcrumbManagerDemo.vue       # Breadcrumb avec scoped slots
│   ├── BreadcrumbItem.vue              # Item de breadcrumb
│   ├── NotificationProviderDemo.vue    # Système de notifications
│   ├── NotificationItem.vue            # Notification individuelle
│   ├── ContextMenuDemo.vue             # Menu contextuel
│   └── ContextMenuItem.vue             # Item de menu
└── README.md                   # Cette documentation
```

## 🚀 Installation

```bash
npx @assembler-ui/cli add use-slot-registry
```

**Note:** `use-check-in` sera installé automatiquement comme dépendance.

## 💡 Cas d'usage

### ✅ Parfait pour :

- **Toolbars dynamiques** : Boutons ajoutés par plugins/extensions
- **Breadcrumbs** : Navigation construite dynamiquement
- **Notifications/Toasts** : Système centralisé de messages
- **Menus contextuels** : Items enregistrés par modules
- **Command palettes** : Actions dynamiques
- **Layout slots** : Zones d'UI extensibles
- **Dialog manager** : Modales enregistrées dynamiquement
- **Plugin systems** : Extensions qui ajoutent des UI

### ❌ Pas adapté pour :

- Enregistrement simple de données (utilisez `useCheckIn`)
- Slots statiques (utilisez les slots Vue natifs)
- Rendu de listes simples (utilisez `v-for`)

## 📖 Exemples rapides

### Toolbar avec groupes

```vue
<!-- Parent -->
<script setup lang="ts">
const { createSlotRegistry } = useSlotRegistry();
const { registry, renderGroup } = createSlotRegistry();
</script>

<template>
  <div class="toolbar">
    <component :is="() => renderGroup('start')" />
    <component :is="() => renderGroup('main')" />
    <component :is="() => renderGroup('end')" />
  </div>

  <!-- Boutons s'enregistrent -->
  <ToolbarButton :registry="registry" label="Save" group="main" />
</template>
```

### Breadcrumb avec scoped slots

```vue
<!-- Parent -->
<script setup lang="ts">
interface BreadcrumbScope {
  isLast: boolean;
  index: number;
}

const { createSlotRegistry } = useSlotRegistry<BreadcrumbScope>();
</script>

<!-- Child -->
<script setup lang="ts">
registerSlot(registry, {
  render: (scope) => {
    const nodes = [h('a', {}, label)];
    if (!scope.isLast) nodes.push(h('span', {}, '/'));
    return nodes;
  },
});
</script>
```

### Notifications auto-remove

```vue
<script setup lang="ts">
const activeNotifications = ref<Notification[]>([]);

const showNotification = (message) => {
  const notification = { id: Date.now(), message };
  activeNotifications.value.push(notification);

  // Auto-remove après 5s
  setTimeout(() => {
    activeNotifications.value = activeNotifications.value.filter(
      (n) => n.id !== notification.id
    );
  }, 5000);
};
</script>

<template>
  <NotificationItem
    v-for="notif in activeNotifications"
    :key="notif.id"
    :registry="registry"
    :notification="notif"
  />
</template>
```

## 🎨 API Principale

### `createSlotRegistry(options?)`

Crée un registre de slots.

```ts
const { registry, renderSlots, renderGroup } = createSlotRegistry({
  defaultSort: { by: 'position', order: 'asc' },
});
```

### `registerSlot(registry, options)`

Enregistre un slot dans le registre.

```ts
registerSlot(registry, {
  id: 'my-slot',
  autoRegister: true,
  component: MyComponent,
  props: { foo: 'bar' },
  position: 10,
  group: 'main',
});
```

### `renderSlots(scope?, options?)`

Rend tous les slots enregistrés.

```ts
const vnodes = renderSlots({ data: 'scoped' }, { group: 'header' });
```

### `renderGroup(group, scope?)`

Rend un groupe spécifique de slots.

```ts
const vnodes = renderGroup('toolbar-start', { isEditing: true });
```

## 🔗 Compatibilité avec useCheckIn

Le Slot Registry est **100% compatible** avec `useCheckIn` car il l'étend :

```ts
// Tous les événements fonctionnent
registry.on('check-in', (payload) => {
  console.log('Slot ajouté:', payload);
});

// Tous les lifecycle hooks fonctionnent
createSlotRegistry({
  onBeforeCheckIn: (id, data) => {
    console.log('Avant enregistrement:', id);
  },
});

// Toutes les méthodes batch fonctionnent
registry.checkInMany([...]);
registry.updateMany([...]);
```

## 🎯 Patterns avancés

### Conditional Slots

```ts
registerSlot(registry, {
  visible: () => user.isAdmin, // Seulement pour admins
});
```

### Dynamic Priority

```ts
registerSlot(registry, {
  priority: computed(() => (isPinned.value ? 100 : 10)),
});
```

### Render avec state réactif

```ts
registerSlot(registry, {
  render: () => h('span', `Count: ${count.value}`),
});
```

## 📚 Documentation complète

Voir `/content/composables/data/use-slot-registry.md` pour :
- Exemples détaillés
- API Reference complète
- Patterns courants
- Cas d'usage réels

## 🔄 Différences avec useCheckIn

| Feature | useCheckIn | useSlotRegistry |
|---------|-----------|----------------|
| But | Données | Slots renderables |
| Rendu | ❌ | ✅ |
| Scoped slots | ❌ | ✅ |
| Groupes natifs | ❌ | ✅ |
| Tri avancé | Timestamp | Position, priority, timestamp |
| Visibilité | ❌ | ✅ |

## 🧪 Tests

Les démos servent également de tests d'intégration :
- `DynamicToolbarDemo` : Groupes, position, état disabled
- `BreadcrumbManagerDemo` : Scoped slots, séparateurs conditionnels
- `NotificationProviderDemo` : Auto-remove, visibilité dynamique
- `ContextMenuDemo` : Teleport, position dynamique, groupes

## 📝 License

MIT
