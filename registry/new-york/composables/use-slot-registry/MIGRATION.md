# Migration Guide: useCheckIn → useSlotRegistry

Ce guide montre comment migrer progressivement de `useCheckIn` vers `useSlotRegistry` quand vous avez besoin de rendu dynamique.

## 🎯 Quand migrer ?

Migrez vers `useSlotRegistry` quand :

- ✅ Vous devez **rendre dynamiquement** des composants/templates
- ✅ Vous avez besoin de **scoped slots** avec données
- ✅ Les items ont une **position/ordre** dans le rendu
- ✅ Certains items peuvent être **conditionnellement visibles**
- ✅ Vous voulez **grouper** les items pour un rendu séparé

**Ne migrez PAS** si vous n'avez besoin que d'enregistrement de données.

## 📊 Exemple : Toolbar

### Avant (useCheckIn)

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { useCheckIn } from '~/composables/useCheckIn';

interface ToolbarButton {
  id: string;
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

const { createDesk } = useCheckIn<ToolbarButton>();
const { desk } = createDesk();

// On doit manuellement rendre les boutons
const buttons = computed(() => desk.getAll());
</script>

<template>
  <div class="toolbar">
    <!-- Rendu manuel avec v-for -->
    <button
      v-for="btn in buttons"
      :key="btn.id"
      :disabled="btn.data.disabled"
      @click="btn.data.onClick"
    >
      <span v-if="btn.data.icon" :class="`i-lucide-${btn.data.icon}`" />
      {{ btn.data.label }}
    </button>
  </div>

  <!-- Enfants s'enregistrent -->
  <ToolbarButton
    :desk="desk"
    label="Save"
    icon="save"
    @click="save"
  />
</template>
```

```vue
<!-- ToolbarButton.vue (enfant) -->
<script setup lang="ts">
import { useCheckIn } from '~/composables/useCheckIn';

const props = defineProps<{
  desk: CheckInDesk<ToolbarButton>;
  label: string;
  icon?: string;
}>();

const emit = defineEmits<{ click: [] }>();

const { checkIn } = useCheckIn<ToolbarButton>();

checkIn(props.desk, {
  autoCheckIn: true,
  id: `btn-${Date.now()}`,
  data: {
    id: `btn-${Date.now()}`,
    label: props.label,
    icon: props.icon,
    onClick: () => emit('click'),
    disabled: false,
  },
});
</script>

<template>
  <!-- Pas de template, juste enregistrement -->
</template>
```

### ❌ Problèmes avec cette approche

1. **Rendu manuel** : Le parent doit gérer le v-for et la structure HTML
2. **Pas de groupes** : Impossible de séparer start/main/end facilement
3. **Pas de visibilité conditionnelle** : Doit filtrer manuellement
4. **Couplage fort** : Le parent connaît la structure exacte du bouton
5. **Pas de scoped slots** : Impossible de passer des données contextuelles

### Après (useSlotRegistry)

```vue
<!-- Parent.vue -->
<script setup lang="ts">
import { useSlotRegistry } from '~/composables/useSlotRegistry';

const { createSlotRegistry } = useSlotRegistry();
const { registry, renderGroup } = createSlotRegistry({
  defaultSort: { by: 'position', order: 'asc' },
});
</script>

<template>
  <div class="toolbar flex gap-2">
    <!-- Rendu automatique par groupe -->
    <div class="flex gap-1">
      <component :is="() => renderGroup('start')" />
    </div>

    <div class="flex flex-1 gap-1">
      <component :is="() => renderGroup('main')" />
    </div>

    <div class="flex gap-1">
      <component :is="() => renderGroup('end')" />
    </div>
  </div>

  <!-- Enfants s'enregistrent avec groupe et position -->
  <ToolbarButton
    :registry="registry"
    label="Save"
    icon="save"
    group="main"
    :position="10"
    @click="save"
  />
</template>
```

```vue
<!-- ToolbarButton.vue (enfant) -->
<script setup lang="ts">
import { h, getCurrentInstance } from 'vue';
import { useSlotRegistry } from '~/composables/useSlotRegistry';
import UiButton from '~/components/ui/button/Button.vue';

const props = defineProps<{
  registry: SlotRegistry;
  label: string;
  icon?: string;
  group?: string;
  position?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{ click: [] }>();

const { registerSlot, memoizedId } = useSlotRegistry();

registerSlot(props.registry, {
  id: memoizedId(getCurrentInstance(), 'toolbar-btn'),
  autoRegister: true,
  group: props.group || 'main',
  position: props.position || 0,
  visible: () => !props.disabled, // Visibilité conditionnelle !
  render: () => {
    return h(
      UiButton,
      {
        variant: 'ghost',
        size: 'sm',
        onClick: () => emit('click'),
      },
      {
        default: () => [
          props.icon && h('span', { class: `i-lucide-${props.icon} mr-1.5 h-4 w-4` }),
          props.label,
        ],
      }
    );
  },
});
</script>

<template>
  <!-- Pas de template -->
</template>
```

### ✅ Avantages de la migration

1. **Rendu automatique** : Plus besoin de v-for, le registry s'en charge
2. **Groupes natifs** : `renderGroup('start')` vs filtrage manuel
3. **Visibilité conditionnelle** : `visible: () => !disabled`
4. **Découplage** : Le parent ne connaît pas la structure du bouton
5. **Scoped slots** : Possibilité de passer des données contextuelles
6. **Tri automatique** : Position et priorité gérées automatiquement

## 📋 Checklist de migration

### Étape 1 : Identifier les besoins

- [ ] Ai-je besoin de **rendu dynamique** ?
- [ ] Ai-je besoin de **groupes** ?
- [ ] Ai-je besoin de **visibilité conditionnelle** ?
- [ ] Ai-je besoin de **scoped slots** ?

Si **OUI** à au moins 2 questions → Migrez vers `useSlotRegistry`

### Étape 2 : Mettre à jour le parent

```diff
- import { useCheckIn } from '~/composables/useCheckIn';
+ import { useSlotRegistry } from '~/composables/useSlotRegistry';

- const { createDesk } = useCheckIn<MyData>();
+ const { createSlotRegistry } = useSlotRegistry<MyScope>();

- const { desk } = createDesk();
+ const { registry, renderSlots } = createSlotRegistry();

- <div v-for="item in desk.getAll()" :key="item.id">
-   {{ item.data }}
- </div>
+ <component :is="() => renderSlots()" />
```

### Étape 3 : Mettre à jour les enfants

```diff
- const { checkIn } = useCheckIn<MyData>();
+ const { registerSlot } = useSlotRegistry();

- checkIn(props.desk, {
-   id: 'my-id',
-   data: { ... },
- });
+ registerSlot(props.registry, {
+   id: 'my-id',
+   render: () => h(MyComponent, { ... }),
+ });
```

### Étape 4 : Tester

- [ ] Les items s'enregistrent correctement
- [ ] Le rendu fonctionne
- [ ] Les groupes sont respectés
- [ ] La visibilité conditionnelle fonctionne
- [ ] Les événements sont émis correctement

## 🔄 Migration progressive

Vous pouvez utiliser **les deux en même temps** pendant la migration :

```vue
<script setup lang="ts">
// Ancien système (données)
const { createDesk } = useCheckIn<ItemData>();
const dataDesk = createDesk();

// Nouveau système (rendu)
const { createSlotRegistry } = useSlotRegistry();
const { registry: uiRegistry } = createSlotRegistry();
</script>

<template>
  <!-- Ancien système toujours fonctionnel -->
  <div v-for="item in dataDesk.desk.getAll()">
    {{ item.data.name }}
  </div>

  <!-- Nouveau système -->
  <component :is="() => uiRegistry.renderSlots()" />

  <!-- Enfants migrent progressivement -->
  <OldChild :desk="dataDesk" />
  <NewChild :registry="uiRegistry" />
</template>
```

## 🎓 Bonnes pratiques

### 1. Préférer les render functions

```ts
// ✅ BON : Render function réactive
registerSlot(registry, {
  render: () => h('span', count.value), // Se met à jour automatiquement
});

// ❌ MAUVAIS : VNode statique
const vnode = h('span', count.value); // Capturé au moment de la création
registerSlot(registry, {
  vnode, // Ne se met JAMAIS à jour
});
```

### 2. Utiliser memoizedId pour la stabilité

```ts
// ✅ BON : ID stable au remontage
const id = memoizedId(getCurrentInstance(), 'my-slot');

// ❌ MAUVAIS : ID change à chaque render
const id = `slot-${Date.now()}`;
```

### 3. Grouper logiquement

```ts
// ✅ BON : Groupes sémantiques
registerSlot(registry, { group: 'primary-actions' });
registerSlot(registry, { group: 'secondary-actions' });

// ❌ MAUVAIS : Pas de groupes ou groupes arbitraires
registerSlot(registry, { group: 'group1' });
```

### 4. Utiliser visible pour conditionnel

```ts
// ✅ BON : Visibilité conditionnelle
registerSlot(registry, {
  visible: () => user.isAdmin,
});

// ❌ MAUVAIS : Enregistrement/désenregistrement manuel
if (user.isAdmin) {
  registerSlot(registry, { ... });
} else {
  registry.checkOut('slot-id');
}
```

## 🚨 Pièges à éviter

### Piège 1 : Oublier autoRegister

```ts
// ❌ MAUVAIS : Le slot ne s'enregistre jamais
registerSlot(registry, {
  render: () => h('div', 'Hello'),
  // autoRegister: false par défaut !
});

// ✅ BON
registerSlot(registry, {
  autoRegister: true, // ← Important !
  render: () => h('div', 'Hello'),
});
```

### Piège 2 : Mutation directe du registry

```ts
// ❌ MAUVAIS
registry.registry.value.set('id', { ... });

// ✅ BON
registry.checkIn('id', { ... });
```

### Piège 3 : Oublier de passer le scope

```ts
// ❌ MAUVAIS : Scope non passé
const vnodes = registry.renderSlots();

// ✅ BON
const vnodes = registry.renderSlots(scope.value);
```

## 📚 Ressources

- [Documentation useCheckIn](../use-check-in/README.md)
- [Documentation useSlotRegistry](./README.md)
- [Patterns Guide](../PATTERNS.md)
- [Exemples avancés](./.private/examples.ts)

## 🤝 Besoin d'aide ?

Si vous rencontrez des difficultés lors de la migration :

1. Vérifiez les exemples dans `/demos`
2. Consultez les exemples avancés dans `.private/examples.ts`
3. Ouvrez une issue sur GitHub
4. Rejoignez notre Discord
