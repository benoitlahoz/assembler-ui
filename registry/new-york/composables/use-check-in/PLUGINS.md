# useCheckIn Plugin System

Le système de plugins permet d'étendre les fonctionnalités d'un `CheckInDesk` sans modifier le code core.

## Installation de plugins

```typescript
import { useCheckIn, createActiveItemPlugin, createLoggerPlugin } from './useCheckIn';

const { createDesk } = useCheckIn<MyData>();

const { desk } = createDesk('myDesk', {
  plugins: [
    createActiveItemPlugin(),
    createLoggerPlugin({ prefix: '[MyDesk]' })
  ]
});

// Les méthodes du plugin sont maintenant disponibles
desk.setActive('item-1');
const active = desk.getActive();
```

## Plugins disponibles

### `createActiveItemPlugin()`

Gère un item actif dans le desk.

**Méthodes ajoutées :**
- `setActive(id)` - Définir l'item actif
- `getActive()` - Obtenir l'item actif
- `clearActive()` - Effacer l'item actif

**Propriétés ajoutées :**
- `activeId` - Ref contenant l'ID de l'item actif
- `hasActive` - Computed indiquant si un item est actif

**Événements émis :**
- `active-changed` - Quand l'item actif change

```typescript
const { desk } = createDesk('handlers', {
  plugins: [createActiveItemPlugin()]
});

desk.setActive('marker');
console.log(desk.activeId.value); // 'marker'
console.log(desk.hasActive); // true

watch(() => desk.activeId.value, (id) => {
  console.log('Active item changed:', id);
});
```

### `createValidationPlugin(options)`

Valide les données avant le check-in.

**Options :**
- `required` - Liste des champs requis
- `validate` - Fonction de validation custom

```typescript
const { desk } = createDesk('users', {
  plugins: [
    createValidationPlugin({
      required: ['name', 'email'],
      validate: (data) => {
        if (!data.email.includes('@')) {
          return 'Invalid email format';
        }
        return true;
      }
    })
  ]
});

// ❌ Check-in annulé - champs manquants
desk.checkIn('user1', { name: 'John' }); // false

// ✅ Check-in réussi
desk.checkIn('user1', { name: 'John', email: 'john@example.com' }); // true
```

### `createLoggerPlugin(options)`

Log les opérations de check-in/check-out.

**Options :**
- `prefix` - Préfixe pour les messages de log
- `verbose` - Activer les logs détaillés

```typescript
const { desk } = createDesk('items', {
  plugins: [
    createLoggerPlugin({
      prefix: '[MyApp]',
      verbose: true
    })
  ]
});

// Console: [MyApp] ✅ Item checked in: { id: 'item1', data: {...} }
desk.checkIn('item1', { name: 'Item 1' });
```

### `createHistoryPlugin(options)`

Historique des opérations.

**Options :**
- `maxHistory` - Nombre max d'entrées (défaut: 50)

**Méthodes ajoutées :**
- `getHistory()` - Obtenir l'historique complet
- `clearHistory()` - Effacer l'historique
- `getLastHistory(n)` - Obtenir les N dernières entrées
- `getHistoryByAction(action)` - Filtrer par type d'action

**Propriétés ajoutées :**
- `history` - Ref contenant l'historique

```typescript
const { desk } = createDesk('items', {
  plugins: [
    createHistoryPlugin({ maxHistory: 100 })
  ]
});

desk.checkIn('item1', { name: 'Item 1' });
desk.checkOut('item1');

const history = desk.getHistory();
// [
//   { action: 'check-in', id: 'item1', data: {...}, timestamp: 1234567890 },
//   { action: 'check-out', id: 'item1', timestamp: 1234567891 }
// ]

const last5 = desk.getLastHistory(5);
const checkIns = desk.getHistoryByAction('check-in');
```

## Créer un plugin custom

```typescript
import type { CheckInPlugin } from './useCheckIn';

export const createMyPlugin = <T = any>(): CheckInPlugin<T> => ({
  name: 'my-plugin',
  version: '1.0.0',

  // Appelé lors de l'installation
  install: (desk) => {
    // Setup
    const myState = ref(0);
    (desk as any).myState = myState;

    // Retourner une fonction de cleanup (optionnel)
    return () => {
      myState.value = 0;
    };
  },

  // Hook avant check-in (peut annuler)
  onBeforeCheckIn: (id, data) => {
    if (/* condition */) {
      return false; // Annule le check-in
    }
    return true;
  },

  // Hook après check-in
  onCheckIn: (id, data) => {
    console.log('Item checked in:', id);
  },

  // Hook avant check-out (peut annuler)
  onBeforeCheckOut: (id) => {
    return true;
  },

  // Hook après check-out
  onCheckOut: (id) => {
    console.log('Item checked out:', id);
  },

  // Méthodes custom
  methods: {
    myMethod(desk, arg1, arg2) {
      // Premier param est toujours le desk
      return desk.get(arg1);
    }
  },

  // Propriétés computed
  computed: {
    myComputed(desk) {
      return desk.getAll().length > 0;
    }
  }
});
```

## Ordre d'exécution

1. **onBeforeCheckIn** des plugins (dans l'ordre)
2. **onBeforeCheckIn** de l'utilisateur
3. Check-in effectué
4. Événement `check-in` émis
5. **onCheckIn** de l'utilisateur
6. **onCheckIn** des plugins (via event listeners)

Les hooks `onBeforeCheckIn` et `onBeforeCheckOut` peuvent annuler l'opération en retournant `false`.

## Combinaison de plugins

```typescript
const { desk } = createDesk('handlers', {
  plugins: [
    createActiveItemPlugin(),
    createValidationPlugin({
      required: ['type', 'enable', 'disable']
    }),
    createLoggerPlugin({ prefix: '[Handlers]' }),
    createHistoryPlugin({ maxHistory: 50 })
  ]
});

// Toutes les fonctionnalités sont disponibles
desk.setActive('marker');
const history = desk.getHistory();
console.log(desk.hasActive);
```

## TypeScript

Les plugins ajoutent dynamiquement des méthodes au desk. Pour avoir le typage :

```typescript
interface MyDesk extends CheckInDesk<MyData> {
  // Plugin active-item
  activeId: Ref<string | number | null>;
  setActive: (id: string | number | null) => boolean;
  getActive: () => CheckInItem<MyData> | null;
  clearActive: () => void;
  hasActive: boolean;

  // Plugin history
  history: Ref<HistoryEntry<MyData>[]>;
  getHistory: () => HistoryEntry<MyData>[];
  clearHistory: () => void;
}

const { desk } = createDesk('myDesk', { plugins: [...] });
const typedDesk = desk as MyDesk;

typedDesk.setActive('item1'); // ✅ Typé
```
