# Guide de Migration - useCheckIn v2

## 🎯 Objectif

Ce guide vous aide à migrer du code existant vers la nouvelle architecture modulaire de `useCheckIn`.

## ✅ Bonne nouvelle : Rétrocompatibilité

**90% du code existant fonctionne sans modification !**

La majorité des changements sont internes. L'API publique reste largement compatible.

## 🔄 Changements à faire

### 1. Métadonnées structurées (Recommandé)

**Avant :**
```ts
checkIn(desk, {
  id: 'item-1',
  data: myData,
  meta: {
    group: 'primary',
    position: 1,
    priority: 10,
    customProp: 'value',
    anotherCustom: 123
  }
});
```

**Après :**
```ts
checkIn(desk, {
  id: 'item-1',
  data: myData,
  meta: {
    group: 'primary',
    order: 1,        // Renommé de 'position' pour clarté
    priority: 10,
    user: {          // Propriétés custom isolées
      customProp: 'value',
      anotherCustom: 123
    }
  }
});
```

**Migration automatique :**
```ts
// Si vous utilisiez 'position', renommez en 'order'
// Si vous utilisiez 'meta.position', utilisez 'meta.order'
```

### 2. Accès au registry (Important)

**❌ Avant (ne fonctionne plus) :**
```ts
// Manipulation directe du registry
desk.registry.value.clear();
desk.registry.value.delete(id);

// Boucle directe
for (const [id, item] of desk.registry.value) {
  // ...
}
```

**✅ Après (utiliser l'API) :**
```ts
// Utiliser les méthodes dédiées
desk.clear();
desk.checkOut(id);

// Utiliser getAll() pour itérer
for (const item of desk.getAll()) {
  // ...
}

// Ou le computed items
for (const item of desk.items.value) {
  // ...
}
```

### 3. Events typés (Amélioration)

**Avant :**
```ts
desk.on('check-in', (payload) => {
  const id = payload.id;      // Type: string | number | undefined
  const data = payload.data;  // Type: T | undefined
});
```

**Après :**
```ts
desk.on('check-in', (payload) => {
  const id = payload.id;       // Type: string | number (non-undefined)
  const data = payload.data;   // Type: T (non-undefined)
  const ts = payload.timestamp; // Toujours présent
});
```

### 4. Tri par clé meta (Amélioration)

**Avant :**
```ts
// Supporté mais moins optimisé
desk.getAll({ sortBy: 'meta.position' });
```

**Après :**
```ts
// Optimisé avec cache de tri
desk.getAll({ sortBy: 'meta.order' }); // Utiliser 'order' au lieu de 'position'
```

## 📦 Nouveautés utilisables immédiatement

### 1. Plugins personnalisés

```ts
import { createDesk, type Plugin } from './useCheckIn';

const myPlugin: Plugin<MyType> = {
  name: 'my-plugin',
  install: (context) => {
    // Accès au registry, options, debug
  }
};

const { desk } = createDesk({
  plugins: [myPlugin]
});
```

### 2. Métadonnées utilisateur typées

```ts
interface MyMeta {
  customField: string;
  anotherField: number;
}

checkIn(desk, {
  meta: {
    user: {
      customField: 'value',
      anotherField: 123
    } as MyMeta
  }
});
```

### 3. Tri optimisé avec cache

```ts
// Premier appel : compile la fonction de tri
const sorted1 = desk.getAll({ sortBy: 'name', order: 'asc' });

// Appels suivants : utilise le cache (plus rapide)
const sorted2 = desk.getAll({ sortBy: 'name', order: 'asc' });
const sorted3 = desk.getAll({ sortBy: 'name', order: 'asc' });
```

## 🛠️ Checklist de migration

- [ ] Renommer `meta.position` → `meta.order` (si utilisé)
- [ ] Déplacer les props custom de `meta` → `meta.user` (recommandé)
- [ ] Remplacer accès direct à `registry.value` par méthodes API
- [ ] Vérifier les tri par `meta.*` (utiliser `meta.order` au lieu de `meta.position`)
- [ ] Tester les events (types améliorés, devrait juste marcher)

## 🔍 Patterns de migration

### Pattern 1 : Filtrage par groupe

**Avant & Après (identique) :**
```ts
const primaryItems = desk.getAll({ group: 'primary' });
```

### Pattern 2 : Tri custom

**Avant :**
```ts
const sorted = desk.getAll({ sortBy: 'name' });
```

**Après (identique, mais plus rapide) :**
```ts
const sorted = desk.getAll({ sortBy: 'name' });
```

### Pattern 3 : Computed groups

**Avant :**
```ts
const primaryItems = computed(() => 
  desk.getAll({ group: 'primary', sortBy: 'timestamp' })
);
```

**Après (méthode dédiée) :**
```ts
const primaryItems = desk.getGroup('primary', { 
  sortBy: 'timestamp' 
});
```

## 🚨 Breaking Changes (peu nombreux)

### 1. Registry en lecture seule

```ts
// ❌ Ne fonctionne plus
desk.registry.value = new Map();
desk.registry.value.clear();

// ✅ Utiliser
desk.clear();
```

### 2. Position → Order

```ts
// ❌ Déprécié
meta: { position: 1 }
sortBy: 'meta.position'

// ✅ Nouveau
meta: { order: 1 }
sortBy: 'meta.order'
```

### 3. Meta non structurée

```ts
// ⚠️ Fonctionne mais non recommandé
meta: { 
  group: 'x',
  customProp: 'value'  // Mélangé avec les props système
}

// ✅ Recommandé
meta: {
  group: 'x',
  user: {
    customProp: 'value'  // Isolé et typé
  }
}
```

## 📊 Impact estimé par usage

| Usage | Changements requis | Impact |
|-------|-------------------|--------|
| Check-in/out basique | **Aucun** | ✅ 0% |
| Tri et filtrage | **Minimes** (position → order) | ⚠️ 5% |
| Events | **Aucun** (types améliorés) | ✅ 0% |
| Accès registry direct | **Refactor** (utiliser API) | 🔴 100% |
| Meta personnalisée | **Recommandé** (structurer) | ⚠️ 20% |

## 💡 Conseils

1. **Commencez par les tests** : Si vous avez des tests, mettez-les à jour en premier
2. **Migration incrémentale** : Migrez composant par composant
3. **Utilisez TypeScript** : Les types vous guideront
4. **Activez debug** : `createDesk({ debug: true })` pour voir ce qui se passe
5. **Lisez ARCHITECTURE.md** : Pour comprendre les nouveaux concepts

## 🆘 Problèmes courants

### "Property 'position' does not exist on type 'CheckInItemMeta'"

**Solution :** Renommer `position` → `order`

### "Cannot assign to 'registry' because it is a read-only property"

**Solution :** Ne pas modifier directement, utiliser les méthodes API

### "Type 'X' is not assignable to type 'CheckInItemMeta'"

**Solution :** Encapsuler les props custom dans `user: { ... }`

## 📚 Ressources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architecture détaillée
- [plugins/](./plugins/) - Code source des plugins
- [types.ts](./types.ts) - Tous les types TypeScript
- [slots.plugin.example.ts](./plugins/slots.plugin.example.ts) - Exemple de plugin custom

## ✉️ Support

Si vous rencontrez des problèmes :
1. Vérifiez ce guide
2. Lisez ARCHITECTURE.md
3. Activez le mode debug
4. Créez une issue avec un exemple reproductible
