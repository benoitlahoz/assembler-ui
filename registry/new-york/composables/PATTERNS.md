# Check-in System & Slot Registry Pattern

## 🎯 Vision d'ensemble

Ce document explique comment `useCheckIn` et `useSlotRegistry` se complètent pour couvrir tous les besoins de communication parent-enfant dans les UI modernes.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    useCheckIn (base)                     │
│                                                          │
│  • Enregistrement de données                            │
│  • Lifecycle management (onBeforeCheckIn, onCheckOut)   │
│  • Event system (on, off, emit)                         │
│  • Updates (update, updateMany)                         │
│  • Batch operations (checkInMany, checkOutMany)         │
│  • Memoized IDs                                         │
└─────────────────────────────────────────────────────────┘
                            ↓
                    extends & adds
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 useSlotRegistry (extension)              │
│                                                          │
│  • Tout ce qui précède (100% compatible)                │
│  • + Enregistrement de slots renderables                │
│  • + Scoped slots avec données typées                   │
│  • + Groupes de slots (group: 'header', 'footer')       │
│  • + Tri avancé (position, priority, timestamp)         │
│  • + Visibilité conditionnelle (visible: () => bool)    │
│  • + Helpers de rendu (renderSlots, renderGroup)        │
└─────────────────────────────────────────────────────────┘
```

## 🤔 Quel pattern utiliser ?

### Utilisez `useCheckIn` quand :

✅ Vous avez besoin d'**enregistrer des données** (pas d'UI)
✅ Les enfants doivent juste **déclarer leur existence**
✅ Le parent doit **collecter des informations** des enfants
✅ Vous construisez un **système de validation** (formulaires)
✅ Vous gérez des **états partagés** entre composants

**Exemples :**
- Form avec validation des champs
- Accordion avec gestion des items
- Tabs avec navigation
- Stepper avec progression
- Feature flags registry

### Utilisez `useSlotRegistry` quand :

✅ Les enfants doivent **fournir du contenu UI** au parent
✅ Vous avez besoin de **rendu dynamique** de slots
✅ Les slots ont une **position/priorité** dans le rendu
✅ Vous voulez des **scoped slots** avec données typées
✅ Les slots peuvent être **conditionnellement visibles**

**Exemples :**
- Toolbar avec boutons dynamiques
- Breadcrumb construit dynamiquement
- Système de notifications/toasts
- Menu contextuel
- Command palette
- Layout avec zones extensibles

## 📊 Tableau comparatif

| Critère | useCheckIn | useSlotRegistry |
|---------|-----------|----------------|
| **Données** | ✅ Enregistrement de `T` générique | ✅ Enregistrement de `SlotDefinition<TScope>` |
| **Rendu** | ❌ Données brutes uniquement | ✅ Via `renderSlots()` |
| **Scoped data** | ❌ Non | ✅ Oui, via `TScope` |
| **Groupes** | ⚠️ Via métadonnées | ✅ Natif via `group` |
| **Tri** | ⚠️ Timestamp uniquement | ✅ Position, priority, timestamp |
| **Visibilité** | ❌ Non | ✅ Oui, via `visible` |
| **Events** | ✅ check-in, check-out, update | ✅ Hérite tous les événements |
| **Lifecycle** | ✅ onBeforeCheckIn, onCheckIn, etc. | ✅ Hérite tous les hooks |
| **Batch ops** | ✅ checkInMany, updateMany | ✅ Hérite toutes les méthodes |
| **Use case** | 📊 Données & état | 🎨 UI & rendu |

## 🔗 Compatibilité

**`useSlotRegistry` est 100% compatible avec `useCheckIn`** car il l'étend.

Tout ce qui fonctionne avec `useCheckIn` fonctionne avec `useSlotRegistry` :

```ts
// ✅ Events
slotRegistry.on('check-in', (payload) => {
  console.log('Nouveau slot:', payload);
});

// ✅ Lifecycle hooks
createSlotRegistry({
  onBeforeCheckIn: (id, data) => true,
  onCheckIn: (id, data) => console.log('Slot enregistré'),
});

// ✅ Batch operations
slotRegistry.checkInMany([...]);
slotRegistry.updateMany([...]);

// ✅ Direct data access
const slot = slotRegistry.get('slot-id');
const allSlots = slotRegistry.getAll();
```

## 💡 Patterns de combinaison

### Pattern 1 : Data + UI

Combinez les deux pour séparer logique et présentation :

```vue
<script setup lang="ts">
// Check-in pour les données
const { createDesk: createDataDesk } = useCheckIn<TabData>();
const dataDesk = createDataDesk();

// Slot registry pour l'UI
const { createSlotRegistry } = useSlotRegistry();
const { registry: uiRegistry } = createSlotRegistry();
</script>

<template>
  <!-- Enfants s'enregistrent dans les deux -->
  <TabItem
    :data-desk="dataDesk"
    :ui-registry="uiRegistry"
    data="{ ... }"
    component="TabPanel"
  />
</template>
```

### Pattern 2 : Progressive Enhancement

Commencez avec `useCheckIn`, upgrader vers `useSlotRegistry` si besoin :

```ts
// V1: Simple data
const { createDesk } = useCheckIn<MenuItem>();

// V2: Besoin de rendu dynamique
const { createSlotRegistry } = useSlotRegistry<MenuItem>();
// Migration facile car compatible !
```

### Pattern 3 : Hybrid Registry

Un seul registre qui gère données ET rendu :

```ts
interface PluginData {
  id: string;
  name: string;
  version: string;
  // ... métadonnées
}

// Slot registry qui inclut les données
const { createSlotRegistry } = useSlotRegistry<PluginData>();
const { registry } = createSlotRegistry();

// L'enfant fournit données + UI
registerSlot(registry, {
  id: 'my-plugin',
  component: PluginUI,
  props: { data: { name: 'My Plugin', version: '1.0' } },
  meta: { /* métadonnées accessibles via .get() */ },
});
```

## 📚 Exemples par cas d'usage

### Formulaire (useCheckIn)

```vue
<!-- Parent -->
<script setup lang="ts">
interface FieldData {
  id: string;
  value: any;
  isValid: boolean;
  errors: string[];
}

const { createDesk } = useCheckIn<FieldData>();
const formDesk = createDesk({
  onCheckIn: (id, data) => {
    console.log(`Champ ${id} enregistré`);
  },
});

const validate = () => {
  const fields = formDesk.desk.getAll();
  return fields.every((f) => f.data.isValid);
};
</script>

<template>
  <form>
    <FormField :desk="formDesk" name="email" />
    <FormField :desk="formDesk" name="password" />
  </form>
</template>
```

### Toolbar (useSlotRegistry)

```vue
<!-- Parent -->
<script setup lang="ts">
const { createSlotRegistry } = useSlotRegistry();
const { registry, renderGroup } = createSlotRegistry();
</script>

<template>
  <div class="toolbar">
    <component :is="() => renderGroup('start')" />
    <component :is="() => renderGroup('end')" />
  </div>

  <!-- Plugins ajoutent des boutons -->
  <ToolbarButton :registry="registry" label="Save" group="start" />
  <ToolbarButton :registry="registry" label="Settings" group="end" />
</template>
```

### Plugin System (Les deux !)

```vue
<!-- Parent -->
<script setup lang="ts">
// Data registry pour les métadonnées
interface PluginMeta {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
}

const { createDesk } = useCheckIn<PluginMeta>();
const pluginData = createDesk();

// Slot registry pour l'UI
const { createSlotRegistry } = useSlotRegistry();
const { registry: pluginUI } = createSlotRegistry();
</script>

<template>
  <div>
    <!-- Liste des plugins (données) -->
    <div v-for="plugin in pluginData.desk.getAll()">
      {{ plugin.data.name }} v{{ plugin.data.version }}
    </div>

    <!-- UI des plugins (rendu) -->
    <div class="plugin-toolbar">
      <component :is="() => pluginUI.renderSlots()" />
    </div>
  </div>

  <!-- Plugin s'enregistre dans les deux -->
  <MyPlugin
    :data-desk="pluginData"
    :ui-registry="pluginUI"
  />
</template>
```

## 🎓 Principes de design

### Principe 1 : Single Responsibility

- `useCheckIn` → **Gestion de données**
- `useSlotRegistry` → **Gestion de rendu**

### Principe 2 : Progressive Disclosure

Commencez simple avec `useCheckIn`, ajoutez `useSlotRegistry` si besoin.

### Principe 3 : Composition over Inheritance

Les deux patterns sont composables et peuvent coexister.

### Principe 4 : Type Safety

Les deux utilisent TypeScript pour garantir la sécurité des types.

## 🚀 Quand créer un nouveau pattern ?

Créez un nouveau pattern (extension de `useCheckIn`) si :

1. ✅ Le cas d'usage n'est **pas couvert** par les patterns existants
2. ✅ Le pattern est **réutilisable** dans plusieurs contextes
3. ✅ Il apporte une **vraie valeur ajoutée** par rapport à l'usage direct
4. ✅ Il respecte la **philosophie** du check-in system

**Exemples de futurs patterns :**
- `useActionRegistry` : Actions/commandes enregistrables (command palette)
- `useRouteRegistry` : Routes dynamiques enregistrées par modules
- `useValidatorRegistry` : Validateurs réutilisables
- `useMiddlewareRegistry` : Pipeline de middlewares

## 📖 Ressources

- [Documentation useCheckIn](/content/composables/data/use-check-in.md)
- [Documentation useSlotRegistry](/content/composables/data/use-slot-registry.md)
- [Source Code useCheckIn](./use-check-in/)
- [Source Code useSlotRegistry](./use-slot-registry/)

## 🤝 Contribution

Pour proposer un nouveau pattern :

1. Vérifier qu'il n'existe pas déjà
2. Créer une issue avec le cas d'usage
3. Soumettre un PR avec :
   - Le composable
   - Les démos
   - La documentation
   - Les tests

## 📝 License

MIT
