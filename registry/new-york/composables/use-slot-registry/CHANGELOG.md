# Changelog - useSlotRegistry

## [1.0.0] - 2025-11-16

### 🎉 Création initiale

Premier release du **Slot Registry Pattern**, extension du système `useCheckIn` pour la gestion dynamique de slots/templates.

### ✨ Features

#### Core

- ✅ **Extension complète de useCheckIn**
  - Hérite tous les événements (on, off, emit)
  - Hérite tous les lifecycle hooks (onBeforeCheckIn, onCheckIn, etc.)
  - Hérite toutes les méthodes batch (checkInMany, updateMany, etc.)
  - 100% compatible et interopérable

- ✅ **Système de rendu flexible**
  - Support des **render functions** réactives
  - Support des **components** Vue avec props
  - Support des **VNodes** pré-générés
  - Rendu automatique via `renderSlots()` et `renderGroup()`

- ✅ **Scoped Slots typés**
  - Génériques TypeScript pour le scope (`TScope`)
  - Passage de données contextuelles aux slots
  - Type safety complet

- ✅ **Groupes natifs**
  - Organisation par groupes sémantiques
  - Rendu par groupe via `renderGroup(group)`
  - Computed par groupe via `getSlotsByGroup(group)`

- ✅ **Tri avancé**
  - Tri par **position** (ordre dans le rendu)
  - Tri par **priority** (importance relative)
  - Tri par **timestamp** (ordre d'enregistrement)
  - Ordre ascendant ou descendant

- ✅ **Visibilité conditionnelle**
  - Boolean statique ou fonction réactive
  - Filtrage automatique des slots invisibles
  - Réactivité complète

#### API

```ts
// Création
const { createSlotRegistry } = useSlotRegistry<TScope>();
const { registry, renderSlots, renderGroup } = createSlotRegistry(options);

// Enregistrement
registerSlot(registry, {
  id, component, vnode, render, props,
  position, priority, visible, group,
  autoRegister, watchProps, meta
});

// Helpers
createSlot.fromComponent(component, props, options);
createSlot.fromRender(renderFn, options);
createSlot.fromVNode(vnode, options);

// Rendu
renderSlots(scope?, options?);
renderGroup(group, scope?);
getSlots(options?);
getSlotsByGroup(group);
```

### 📚 Documentation

- ✅ **Documentation principale** (`use-slot-registry.md`)
  - Vue d'ensemble et architecture
  - Installation et utilisation
  - 4 exemples avancés complets
  - API Reference exhaustive
  - Patterns courants
  - Cas d'usage réels

- ✅ **README** (`README.md`)
  - Guide rapide
  - Cas d'usage
  - Exemples concis
  - Bonnes pratiques

- ✅ **Guide de migration** (`MIGRATION.md`)
  - Migration depuis useCheckIn
  - Checklist étape par étape
  - Migration progressive
  - Pièges à éviter

- ✅ **Comparaison des patterns** (`../PATTERNS.md`)
  - useCheckIn vs useSlotRegistry
  - Tableau comparatif
  - Patterns de combinaison
  - Principes de design

### 🎨 Démos

4 exemples complets et fonctionnels :

1. **Dynamic Toolbar** (`DynamicToolbarDemo.vue`)
   - Toolbar avec 3 groupes (start/main/end)
   - Boutons dynamiques avec état disabled
   - Séparateurs visuels

2. **Breadcrumb Manager** (`BreadcrumbManagerDemo.vue`)
   - Navigation dynamique avec scoped slots
   - Séparateurs conditionnels (pas pour le dernier)
   - Type safety pour le scope

3. **Notification Provider** (`NotificationProviderDemo.vue`)
   - Système de toasts avec 4 types
   - Auto-remove après duration
   - Visibilité animée

4. **Context Menu** (`ContextMenuDemo.vue`)
   - Menu au clic droit avec Teleport
   - Position dynamique
   - Groupes d'actions

### 🧪 Tests

- ✅ Tests unitaires complets (`useSlotRegistry.test.ts`)
  - Création et configuration
  - Enregistrement de slots
  - Filtrage et tri
  - Rendu et scoped slots
  - Réactivité
  - Compatibilité avec useCheckIn
  - Edge cases

### 📦 Configuration

- ✅ `assemblerjs.json` - Métadonnées du registry
- ✅ `use-slot-registry.json` - Configuration publique
- ✅ `index.ts` - Exports TypeScript

### 📖 Exemples avancés

Fichier `.private/examples.ts` avec 5 patterns sophistiqués :

1. **Command Palette** avec recherche filtrée
2. **Dialog Manager** avec z-index automatique
3. **Layout extensible** avec zones multiples
4. **Notification System** avec positions
5. **Dynamic Form Builder** avec validation

### 🎯 Cas d'usage supportés

- Toolbars dynamiques
- Breadcrumbs
- Notifications/Toasts
- Menus contextuels
- Command palettes
- Layouts extensibles
- Dialog managers
- Form builders
- Plugin systems

### 🔧 Compatibilité

- ✅ 100% compatible avec `useCheckIn`
- ✅ Vue 3.x
- ✅ TypeScript 5.x
- ✅ Type safety complet
- ✅ Tree-shakeable

### 📝 Notes

- Inspiré par la suggestion de ChatGPT pour compléter le check-in system
- Conçu pour coexister avec `useCheckIn` (données vs UI)
- Pattern extensible pour futurs besoins (ActionRegistry, RouteRegistry, etc.)

### 🚀 Installation

```bash
npx @assembler-ui/cli add use-slot-registry
```

**Note:** `use-check-in` sera installé automatiquement comme dépendance.

---

**Auteur:** GitHub Copilot  
**Date:** 16 novembre 2025  
**Version:** 1.0.0
