# Pattern Toolbar avec useCheckIn

## Concept

Ce pattern montre comment utiliser `useCheckIn` pour créer un système de toolbar dynamique **sans wrappers** ni `<component :is>`.

### Architecture

```
ToolbarContainer (Provider)
├── Fournit le desk via provide/inject
├── Lit les items enregistrés par groupe
└── Rend les boutons avec v-for

ToolbarButton (Consumer)
├── Injecte le desk fourni par le Container
├── S'enregistre automatiquement via useCheckIn().checkIn()
└── Ne rend rien (transparent)
```

## Comment ça marche

### 1. ToolbarContainer crée et fournit le desk

```vue
<script setup>
import { provide } from 'vue';
import { useCheckIn } from '~/composables/use-check-in/useCheckIn';

// Créer le desk
const { desk, DeskInjectionKey } = useCheckIn<ToolbarItemData>().createDesk({
  context: {},
  onBeforeCheckIn: (id, data) => {
    console.log('Button checking in:', id, data);
    return true;
  },
});

// Fournir le desk aux enfants
provide(DeskInjectionKey, desk);

// Récupérer les items par groupe
const startItems = desk.getGroup('start', { sortBy: 'meta.position', order: 'asc' });
const mainItems = desk.getGroup('main', { sortBy: 'meta.position', order: 'asc' });
const endItems = desk.getGroup('end', { sortBy: 'meta.position', order: 'asc' });
</script>

<template>
  <div class="toolbar-container">
    <!-- Le slot contient les ToolbarButton qui s'enregistrent -->
    <slot />

    <!-- Rendu des boutons par groupe -->
    <div class="toolbar-groups">
      <div v-if="startItems.length > 0" class="toolbar-group toolbar-start">
        <button
          v-for="item in startItems"
          :key="item.id"
          :disabled="item.data.disabled"
          @click="item.data.onClick"
        >
          {{ item.data.label }}
        </button>
      </div>
      <!-- ... autres groupes -->
    </div>
  </div>
</template>
```

### 2. ToolbarButton s'enregistre auprès du desk

```vue
<script setup>
import { inject } from 'vue';
import { useCheckIn } from '~/composables/use-check-in/useCheckIn';

const props = defineProps<{
  id?: string;
  label: string;
  group?: 'start' | 'main' | 'end';
  position?: number;
}>();

// Injecter le desk (n'importe quel type de desk)
const desk = inject('__check_in_desk__');

// S'enregistrer avec auto check-in
useCheckIn<ToolbarItemData>().checkIn(desk, {
  autoCheckIn: true,
  id: props.id,
  group: props.group,
  position: props.position,
  data: () => ({
    label: props.label,
    onClick: () => emit('click'),
  }),
  watchData: true,
});
</script>

<template>
  <!-- Ne rend rien - transparent -->
</template>
```

### 3. Utilisation dans l'app

```vue
<template>
  <ToolbarContainer desk-id="main-toolbar">
    <!-- Les boutons sont dans le slot et s'enregistrent automatiquement -->
    <ToolbarButton
      id="save"
      label="Save"
      group="start"
      :position="1"
      @click="handleSave"
    />
    <ToolbarButton
      id="undo"
      label="Undo"
      group="start"
      :position="2"
      @click="handleUndo"
    />
    <ToolbarButton
      id="settings"
      label="Settings"
      group="end"
      :position="1"
      @click="handleSettings"
    />
  </ToolbarContainer>
</template>
```

## Fonctionnalités intégrées de useCheckIn

### ✅ Groupes

Les items peuvent être organisés en groupes via `group: 'start' | 'main' | 'end'`.

```typescript
const startItems = desk.getGroup('start');
const mainItems = desk.getGroup('main');
```

### ✅ Tri automatique

Tri par `meta.position`, `meta.priority`, ou n'importe quelle clé de data :

```typescript
const items = desk.getGroup('start', {
  sortBy: 'meta.position',
  order: 'asc'
});
```

### ✅ Réactivité

`watchData: true` met à jour automatiquement l'item quand les props changent.

### ✅ Lifecycle automatique

- `autoCheckIn: true` → enregistrement au montage
- `onUnmounted` → check-out automatique

### ✅ Hooks

```typescript
createDesk({
  onBeforeCheckIn: (id, data) => {
    // Validation, logging...
    return true; // ou false pour annuler
  },
  onCheckIn: (id, data) => {
    // Actions post-enregistrement
  },
})
```

## Avantages de ce pattern

1. **Pas de wrapper** - Les composants `shadcn-vue` ne sont pas wrappés
2. **Transparent** - `ToolbarButton` ne rend rien, tout est géré par le composable
3. **Flexible** - Le rendering est fait par `ToolbarContainer` avec v-for natif
4. **Réactif** - Les changements de props se propagent automatiquement
5. **Type-safe** - TypeScript infère les types correctement
6. **Extensible** - Facile d'ajouter de nouveaux groupes, filtres, etc.

## Comparaison avec le pattern object-composer

Ce pattern suit exactement la même philosophie que `object-composer` :

| Aspect | object-composer | toolbar |
|--------|----------------|---------|
| Provider | ObjectComposer | ToolbarContainer |
| Consumer | ObjectComposerField | ToolbarButton |
| Desk | useCheckIn().createDesk() | useCheckIn().createDesk() |
| Injection | inject + DeskInjectionKey | inject + DeskInjectionKey |
| Rendu | Scoped slots natifs | v-for sur desk.getGroup() |
| Transparent | ✅ asChild pattern | ✅ Pas de template |

## Extension possible

Ce pattern peut être utilisé pour :

- **Breadcrumbs** - Enregistrement dynamique de segments
- **Navigation** - Menu items avec groupes (primary, secondary)
- **Notifications** - Toast system avec auto-remove
- **Context Menu** - Items de menu par groupe
- **Forms** - Fields avec validation centralisée

Toutes les fonctionnalités de `useSlotRegistry` sont maintenant **intégrées directement dans `useCheckIn`** :

- `desk.getGroup(name)` - Récupère un groupe
- `desk.getAll({ group, sortBy, filter })` - Filtre et trie
- `desk.items` - Computed de tous les items
- Tri par `meta.*` (position, priority, etc.)
- Hooks lifecycle
- Événements (on/off/emit)
