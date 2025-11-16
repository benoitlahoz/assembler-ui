# useCheckIn - Architecture Modulaire avec Plugins

## 📐 Architecture

Le système `useCheckIn` a été refactorisé avec une **architecture modulaire basée sur des plugins** pour améliorer la maintenabilité, la testabilité et l'extensibilité.

### Structure des fichiers

```
use-check-in/
├── types.ts                 # Types TypeScript centralisés
├── plugin-manager.ts        # Gestionnaire de plugins
├── plugins/
│   ├── index.ts            # Barrel export des plugins
│   ├── events.plugin.ts    # Gestion des événements
│   ├── registry.plugin.ts  # Opérations CRUD sur le registre
│   ├── sorting.plugin.ts   # Tri et filtrage optimisés
│   └── id.plugin.ts        # Génération d'IDs sécurisés
├── useCheckIn.ts           # Composable principal
└── demos/                  # Exemples d'utilisation
```

## 🔌 Système de Plugins

### Plugins par défaut

#### 1. **EventsPlugin** (`events.plugin.ts`)
Gère le système d'événements typé.

**Caractéristiques :**
- Events typés par payload (`DeskEventPayload<T>`)
- Support de l'autocomplétion TypeScript
- Unsubscribe automatique via fonction de retour

**API :**
```ts
interface EventsPlugin<T> {
  on<E extends DeskEventType>(event: E, callback: DeskEventCallback<T, E>): () => void;
  off<E extends DeskEventType>(event: E, callback: DeskEventCallback<T, E>): void;
  emit<E extends DeskEventType>(event: E, payload: Omit<DeskEventPayload<T>[E], 'timestamp'>): void;
}
```

#### 2. **RegistryPlugin** (`registry.plugin.ts`)
Gère les opérations CRUD sur le registre.

**Caractéristiques :**
- Séparation des responsabilités (CRUD uniquement)
- Intégration avec le système d'événements
- Lifecycle hooks (onBeforeCheckIn, onCheckIn, etc.)

**API :**
```ts
interface RegistryPlugin<T> {
  checkIn(id: string | number, data: T, meta?: CheckInItemMeta): boolean;
  checkOut(id: string | number): boolean;
  update(id: string | number, data: Partial<T>): boolean;
  get(id: string | number): CheckInItem<T> | undefined;
  has(id: string | number): boolean;
  clear(): void;
  checkInMany(...): void;
  checkOutMany(...): void;
  updateMany(...): void;
}
```

#### 3. **SortingPlugin** (`sorting.plugin.ts`)
Fournit des fonctions optimisées de tri et filtrage.

**Caractéristiques :**
- **Cache de fonctions de tri** pour meilleures performances
- Support du tri par clés `meta.*` (ex: `meta.order`, `meta.priority`)
- Filtrage par groupe
- Filtrage custom via fonction

**API :**
```ts
interface SortingPlugin<T> {
  getAll(options?: GetAllOptions<T>): CheckInItem<T>[];
}

interface GetAllOptions<T> {
  sortBy?: keyof T | 'timestamp' | `meta.${string}`;
  order?: 'asc' | 'desc';
  group?: string;
  filter?: (item: CheckInItem<T>) => boolean;
}
```

#### 4. **IdPlugin** (`id.plugin.ts`)
Génère des IDs sécurisés et mémorisés.

**Caractéristiques :**
- IDs cryptographiquement sécurisés (crypto.randomUUID)
- Mémorisation via WeakMap (instance Vue) ou Map (custom ID)
- Fallback pour anciens environnements

**API :**
```ts
interface IdPlugin {
  generateId(prefix?: string): string;
  memoizedId(instanceOrId: object | string | number | null | undefined, prefix?: string): string;
  clearCache(): void;
}
```

### Métadonnées structurées

Les métadonnées sont maintenant **typées et structurées** :

```ts
interface CheckInItemMeta {
  group?: string;           // Groupe de l'item
  order?: number;           // Position/ordre
  priority?: number;        // Priorité pour tri
  user?: Record<string, any>; // Données utilisateur custom
}
```

**Avant :**
```ts
checkIn(id, data, {
  group: 'primary',
  position: 1,
  priority: 10,
  customData: 'value'  // Non typé, mélangé
});
```

**Après :**
```ts
checkIn(id, data, {
  group: 'primary',
  order: 1,           // Renommé pour clarté
  priority: 10,
  user: {             // Données custom isolées
    customData: 'value'
  }
});
```

## 🎯 Avantages de l'architecture

### 1. **Modularité**
Chaque fonctionnalité est isolée dans son propre plugin :
- Plus facile à comprendre
- Plus facile à tester
- Plus facile à maintenir

### 2. **Extensibilité**
Création de plugins personnalisés facilitée :

```ts
const myCustomPlugin: Plugin<MyType> = {
  name: 'my-plugin',
  install: (context) => {
    // Accès au registry, options, debug
    context.debug('[MyPlugin] Installed');
  },
  cleanup: () => {
    // Nettoyage si nécessaire
  }
};

const desk = createDesk({
  plugins: [myCustomPlugin]
});
```

### 3. **Performance**
- **Cache de tri** : fonctions compilées une seule fois
- **Lazy evaluation** : computed values uniquement quand nécessaire
- **Optimisations ciblées** : chaque plugin peut être optimisé indépendamment

### 4. **Type Safety**
- Events typés par payload
- Métadonnées structurées
- Autocomplétion complète

### 5. **Testabilité**
Chaque plugin peut être testé indépendamment :

```ts
import { createSortingPlugin } from './plugins';

describe('SortingPlugin', () => {
  it('should sort by meta.order', () => {
    const plugin = createSortingPlugin();
    // ... tests
  });
});
```

## 📚 Utilisation

### Utilisation de base (inchangée)

```ts
// Parent component
const { createDesk } = useCheckIn<TabItem>();
const { desk } = createDesk();

// Child component
const { checkIn } = useCheckIn<TabItem>();
checkIn(desk, {
  autoCheckIn: true,
  id: props.id,
  data: { label: props.label },
  meta: {
    group: 'primary',
    order: 1
  }
});
```

### Utilisation avancée avec plugins custom

```ts
import { createDesk, type Plugin } from './useCheckIn';

// Plugin de logging
const loggingPlugin: Plugin<MyType> = {
  name: 'logging',
  install: (context) => {
    // Intercepte tous les check-ins
    const originalCheckIn = context.registry.value.set;
    // ... logique custom
  }
};

const { desk } = createDesk({
  plugins: [loggingPlugin],
  debug: true
});
```

### Tri optimisé

```ts
// Tri par clé de data
desk.getAll({ sortBy: 'name', order: 'asc' });

// Tri par timestamp
desk.getAll({ sortBy: 'timestamp', order: 'desc' });

// Tri par meta
desk.getAll({ sortBy: 'meta.order', order: 'asc' });

// Filtrage + tri
desk.getAll({
  group: 'primary',
  sortBy: 'meta.priority',
  order: 'desc',
  filter: (item) => item.data.active === true
});
```

## 🔄 Migration depuis l'ancienne version

### Changements majeurs

1. **Métadonnées structurées**
   ```ts
   // Avant
   meta: { group: 'x', position: 1, custom: 'value' }
   
   // Après
   meta: { group: 'x', order: 1, user: { custom: 'value' } }
   ```

2. **Registry en lecture seule**
   ```ts
   // ⚠️ NE PLUS FAIRE
   desk.registry.value.clear();
   
   // ✅ FAIRE
   desk.clear();
   ```

3. **Events typés**
   ```ts
   desk.on('check-in', (payload) => {
     payload.id;   // string | number
     payload.data; // T
     payload.timestamp; // number (toujours présent)
   });
   ```

### Compatibilité

✅ **Entièrement rétrocompatible** pour l'utilisation de base
⚠️ Quelques ajustements pour usage avancé (registry, meta structure)

## 🚀 Prochaines améliorations possibles

- [ ] Plugin de persistence (localStorage, IndexedDB)
- [ ] Plugin de synchronisation (WebSocket, SSE)
- [ ] Plugin de validation (Zod, Yup)
- [ ] Plugin de undo/redo
- [ ] Hooks de lifecycle supplémentaires
- [ ] Support SSR amélioré

## 📖 Références

- [Types](./types.ts)
- [Plugin Manager](./plugin-manager.ts)
- [Plugins](./plugins/)
