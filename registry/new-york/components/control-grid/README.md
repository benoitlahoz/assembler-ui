# ControlGrid - Système de grille drag-and-drop

Un composant de grille drag-and-drop flexible utilisant le pattern provider/consumer pour une architecture propre et maintenable.

## 📦 Composants

### ControlGrid
Le composant principal qui fournit la grille et toutes les fonctionnalités via `provide` et slot props.

### ControlGridItem
Un composant exemple qui wrappe un control enregistré et accède à l'état de la grille via `inject`.

### ControlGridToolbar
Une toolbar pour interagir avec la grille (à mettre à jour pour utiliser inject).

## 🚀 Utilisation rapide

### Option 1 : Slot Props (Simple)

```vue
<script setup>
import { ref } from 'vue';
import { ControlGrid, type GridItem } from '...';

const items = ref<GridItem[]>([]);
</script>

<template>
  <ControlGrid v-model:items="items">
    <template #toolbar="{ addItem, clearGrid, placedItems, config }">
      <div>
        <p>{{ placedItems.length }} items - {{ config.columns }}×{{ config.rows }}</p>
        <button @click="addItem({ id: 'item-' + Date.now(), width: 1, height: 1 })">
          Add Item
        </button>
        <button @click="clearGrid()">Clear</button>
      </div>
    </template>
  </ControlGrid>
</template>
```

### Option 2 : Inject (Avancé)

```vue
<!-- Parent.vue -->
<script setup>
import { ControlGrid, ControlGridItem } from '...';
</script>

<template>
  <ControlGrid>
    <template #toolbar>
      <ControlGridItem />
    </template>
  </ControlGrid>
</template>

<!-- ControlGridItem.vue (ou votre composant personnalisé) -->
<script setup>
import { inject, type Ref } from 'vue';
import { 
  ControlGridItemsKey,
  ControlGridAddItemKey,
  ControlGridClearGridKey,
  type GridItem 
} from '...';

const items = inject(ControlGridItemsKey) as Ref<GridItem[]> | undefined;
const addItem = inject(ControlGridAddItemKey);
const clearGrid = inject(ControlGridClearGridKey);
</script>

<template>
  <div>
    <p>Items: {{ items?.length }}</p>
    <button @click="addItem?.({ id: 'new', width: 1, height: 1 })">Add</button>
    <button @click="clearGrid?.()">Clear</button>
  </div>
</template>
```

## 🎯 Props

```typescript
interface ControlGridProps {
  cellSize?: number;        // Taille d'une cellule en px (défaut: 80)
  gap?: number;             // Espacement entre cellules (défaut: 8)
  minColumns?: number;      // Nombre minimum de colonnes (défaut: 4)
  items?: GridItem[];       // Items placés dans la grille
  showGrid?: boolean;       // Afficher la grille (défaut: true)
  snapToGrid?: boolean;     // Snap automatique (défaut: true)
  components?: ComponentToRegister[]; // Composants à enregistrer
}
```

## 📤 Events

- `update:items` - Émis quand les items changent
- `item-placed` - Émis quand un item est placé
- `item-moved` - Émis quand un item est déplacé
- `item-removed` - Émis quand un item est supprimé
- `config-changed` - Émis quand la config de la grille change

## 💉 Clés d'injection

### État
- `ControlGridItemsKey` - `Ref<GridItem[]>`
- `ControlGridConfigKey` - `Ref<GridConfig>`
- `ControlGridHoverKey` - `Ref<GridPosition | null>`
- `ControlGridDragStateKey` - `Ref<DragState>`
- `ControlGridComponentRegistryKey` - `Ref<Map<string, Component>>`

### Méthodes
- `ControlGridAddItemKey` - `(item: Omit<GridItem, 'x' | 'y'>) => GridItem | null`
- `ControlGridRemoveItemKey` - `(id: string) => void`
- `ControlGridClearGridKey` - `() => void`
- `ControlGridGetComponentKey` - `(name: string) => Component | undefined`
- `ControlGridGetRegisteredComponentsKey` - `() => string[]`
- `ControlGridAddItemByComponentKey` - `(name: string, w?: number, h?: number, props?: any) => GridItem | null`

## 🔧 Méthodes exposées (ref)

```typescript
const gridRef = ref<InstanceType<typeof ControlGrid>>();

// Utilisation
gridRef.value?.addItem({ id: 'test', width: 2, height: 1 });
gridRef.value?.removeItem('item-id');
gridRef.value?.clearGrid();
gridRef.value?.getComponent('ControlButton');
```

## 📚 Documentation complète

- **[CONTROL_GRID_RENAMING.md](../../CONTROL_GRID_RENAMING.md)** - Guide de renommage
- **[CONTROLS_GRID_REFACTORING.md](../../CONTROLS_GRID_REFACTORING.md)** - Pattern et architecture
- **[CONTROLS_GRID_COMPARISON.md](../../CONTROLS_GRID_COMPARISON.md)** - Avant/Après
- **[CONTROLS_GRID_API.md](../../CONTROLS_GRID_API.md)** - Référence API complète

## 🎓 Exemples

Voir `examples/ProviderPatternExample.vue` pour des exemples complets.

## ✨ Pattern Provider/Consumer

ControlGrid suit le même pattern que `MediaDevicesProvider` :

1. **Provider** (ControlGrid) : Fournit l'état et les méthodes via `provide`
2. **Consumer** (ControlGridItem ou composants personnalisés) : Consomme via `inject`
3. **Flexibilité** : Choix entre slot props (simple) ou inject (avancé)

## 🎯 ControlGridItem

`ControlGridItem` est un composant exemple qui :
- Wrappe un composant control enregistré
- Est au courant de tout ce que peut fournir ControlGrid
- Peut accéder à l'état complet via inject
- Sert de template pour créer vos propres composants

## 🔍 Types principaux

```typescript
interface GridItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  component?: any;
  color?: string;
  [key: string]: any;
}

interface GridConfig {
  cellSize: number;
  gap: number;
  columns: number;
  rows: number;
  width: number;
  height: number;
}
```

## 🛠️ Utilitaires

```typescript
import { GridUtils } from '...';

GridUtils.generateId('button');  // "button-123456789-abc"
GridUtils.doItemsOverlap(item1, item2);  // boolean
GridUtils.calculateArea(item);  // width * height
GridUtils.cloneItemAtPosition(item, 5, 3);  // GridItem
```

---

**Statut :** ✅ Refactorisé avec pattern provider/consumer  
**Version :** 2.0 (renommage ControlGrid)  
**Date :** 4 novembre 2025
