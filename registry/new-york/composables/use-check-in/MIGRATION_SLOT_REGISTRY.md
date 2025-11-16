# Migration : useSlotRegistry → useCheckIn

Ce document explique la migration du pattern `useSlotRegistry` vers `useCheckIn` enrichi.

## TL;DR

**useSlotRegistry a été supprimé.** Toutes ses fonctionnalités sont maintenant **intégrées directement dans `useCheckIn`**.

## Différences clés

### Avant (useSlotRegistry)

```vue
<script setup>
import { useSlotRegistry } from '~/composables/use-slot-registry';

// Créer un registry séparé
const { registry, registerSlot, renderGroup } = useSlotRegistry({
  id: 'toolbar',
});

// Provider
provide('toolbar-registry', registry);

// Enregistrer des slots
registerSlot({
  id: 'save-button',
  group: 'start',
  component: SaveButton,
  props: { label: 'Save' },
});

// Rendu avec component :is (pas idéal)
const startSlots = renderGroup('start');
</script>

<template>
  <component :is="() => startSlots" />
</template>
```

**Problèmes** :
- ❌ Composable séparé nécessaire
- ❌ Utilisation de `<component :is>` (pattern rejeté par l'utilisateur)
- ❌ Render functions/VNodes
- ❌ Pas de v-model natif
- ❌ Duplication de fonctionnalités avec useCheckIn

### Après (useCheckIn enrichi)

```vue
<!-- Provider -->
<script setup>
import { provide } from 'vue';
import { useCheckIn } from '~/composables/use-check-in/useCheckIn';

const { desk, DeskInjectionKey } = useCheckIn<ToolbarItemData>().createDesk({
  context: {},
});

provide(DeskInjectionKey, desk);

// Récupérer les items par groupe
const startItems = desk.getGroup('start', { sortBy: 'meta.position' });
</script>

<template>
  <div>
    <slot />
    
    <!-- Rendu natif avec v-for -->
    <button
      v-for="item in startItems"
      :key="item.id"
      @click="item.data.onClick"
    >
      {{ item.data.label }}
    </button>
  </div>
</template>

<!-- Consumer -->
<script setup>
import { inject } from 'vue';
import { useCheckIn } from '~/composables/use-check-in/useCheckIn';

const props = defineProps<{
  id?: string;
  label: string;
  group?: string;
  position?: number;
}>();

const desk = inject('__check_in_desk__');

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
  <!-- Transparent - ne rend rien -->
</template>
```

**Avantages** :
- ✅ Un seul composable (`useCheckIn`)
- ✅ Pas de `<component :is>` - v-for natif
- ✅ Pas de render functions/VNodes
- ✅ Support v-model natif
- ✅ Tous les patterns utilisent la même base

## Fonctionnalités migrées

| Fonctionnalité | useSlotRegistry | useCheckIn |
|----------------|-----------------|------------|
| **Groupes** | `registry.getGroup('name')` | `desk.getGroup('name')` |
| **Tri** | `sortBy: 'position'` | `sortBy: 'meta.position'` |
| **Filtrage** | `filter: (slot) => ...` | `filter: (item) => ...` |
| **Computed** | `getSlots()` | `desk.items` |
| **Hooks** | Options du registry | Options du desk |
| **Événements** | ❌ Non disponible | `desk.on/off/emit` |
| **Réactivité** | Via refs manuels | `watchData: true` |
| **Lifecycle** | Manuel | Automatique |

## Mapping API

### Création

```typescript
// Avant
const { registry } = useSlotRegistry({ id: 'toolbar' });

// Après
const { desk } = useCheckIn<T>().createDesk({ context: {} });
```

### Enregistrement

```typescript
// Avant
registerSlot({
  id: 'item-1',
  group: 'main',
  position: 1,
  component: MyComponent,
  props: { ... },
});

// Après
useCheckIn<T>().checkIn(desk, {
  id: 'item-1',
  group: 'main',
  position: 1,
  data: () => ({ ... }),
  watchData: true,
});
```

### Récupération

```typescript
// Avant
const slots = registry.getSlots({ group: 'main', sortBy: 'position' });

// Après
const items = desk.getGroup('main', { sortBy: 'meta.position' });
```

### Rendu

```typescript
// Avant
const rendered = renderGroup('main');
return () => h('div', rendered);

// Après
const items = desk.getGroup('main');
// Dans template: <div v-for="item in items">
```

## Nouveautés dans useCheckIn

### 1. Groupes natifs

```typescript
interface CheckInOptions {
  group?: string;        // NOUVEAU
  position?: number;     // NOUVEAU
  priority?: number;     // NOUVEAU
}
```

### 2. Tri enrichi

```typescript
// Tri par data
desk.getAll({ sortBy: 'label' })

// Tri par timestamp
desk.getAll({ sortBy: 'timestamp' })

// Tri par meta
desk.getAll({ sortBy: 'meta.position' })
desk.getAll({ sortBy: 'meta.priority' })
```

### 3. Helpers computed

```typescript
interface CheckInDesk<T> {
  getGroup: (group: string, options?) => ComputedRef<CheckInItem<T>[]>;
  items: ComputedRef<CheckInItem<T>[]>;
}
```

### 4. Événements

```typescript
desk.on('check-in', ({ id, data }) => { ... });
desk.on('check-out', ({ id }) => { ... });
desk.on('update', ({ id, data }) => { ... });
desk.on('clear', () => { ... });
```

## Exemples de migration

### Toolbar

**Avant** :
```vue
<SlotRegistry id="toolbar">
  <SlotItem id="save" group="start" :component="SaveButton" />
</SlotRegistry>
```

**Après** :
```vue
<ToolbarContainer>
  <ToolbarButton id="save" group="start" label="Save" />
</ToolbarContainer>
```

### Breadcrumb

**Avant** :
```vue
<SlotRegistry id="breadcrumb">
  <SlotItem v-for="segment in path" :component="BreadcrumbSegment" />
</SlotRegistry>
```

**Après** :
```vue
<BreadcrumbContainer>
  <BreadcrumbItem v-for="segment in path" :label="segment" />
</BreadcrumbContainer>
```

### Notifications

**Avant** :
```vue
<SlotRegistry id="notifications">
  <SlotItem :component="Toast" :props="{ duration: 5000 }" />
</SlotRegistry>
```

**Après** :
```vue
<NotificationProvider>
  <NotificationItem :message="msg" :duration="5000" />
</NotificationProvider>
```

## Checklist de migration

- [ ] Supprimer tous les imports de `useSlotRegistry`
- [ ] Remplacer par `useCheckIn`
- [ ] Convertir `registerSlot()` en `checkIn(desk, { ... })`
- [ ] Remplacer `getSlots()` par `desk.getGroup()` ou `desk.items`
- [ ] Supprimer les `<component :is>` et utiliser `v-for`
- [ ] Ajouter `group`, `position` dans les options si nécessaire
- [ ] Utiliser `sortBy: 'meta.position'` au lieu de `sortBy: 'position'`
- [ ] Tester la réactivité avec `watchData: true`

## FAQ

### Q: Dois-je garder useSlotRegistry pour la compatibilité ?

**R:** Non. `useSlotRegistry` a été créé mais immédiatement rejeté. Utilisez `useCheckIn` directement.

### Q: Comment trier par position maintenant ?

**R:** Utilisez `sortBy: 'meta.position'` au lieu de `sortBy: 'position'`.

### Q: Les render functions sont-elles toujours nécessaires ?

**R:** Non. Utilisez `v-for` sur `desk.getGroup()` ou `desk.items`.

### Q: Comment gérer les événements ?

**R:** Utilisez le système d'événements natif : `desk.on('check-in', ...)`, etc.

### Q: Le pattern object-composer utilise-t-il useSlotRegistry ?

**R:** Non. Il utilise `useCheckIn` directement, comme tous les patterns maintenant.

## Conclusion

**useSlotRegistry n'existe plus.** Toutes les fonctionnalités sont dans `useCheckIn`.

Le nouveau pattern est :
1. Plus simple (un seul composable)
2. Plus transparent (pas de wrappers)
3. Plus flexible (v-for natif)
4. Plus puissant (événements, hooks, etc.)
5. Cohérent avec object-composer

Tous les patterns (Toolbar, Breadcrumb, Notification, ContextMenu, Form) suivent cette architecture.
