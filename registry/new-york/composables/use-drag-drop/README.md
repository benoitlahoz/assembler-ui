# useDragDrop

Composable réutilisable pour gérer le drag and drop avec calcul d'intersection précis.

## Caractéristiques

✨ **Drag précis** : Calcule l'offset du clic initial pour un drag naturel  
🎯 **Intersection intelligente** : Trouve la cellule avec la plus grande surface d'intersection  
🔧 **Validation personnalisable** : Fonction de validation de placement optionnelle  
📦 **Réutilisable** : Fonctionne avec n'importe quel système de grille ou disposition  
🎨 **Agnostique du framework** : Logique pure, pas de dépendances sur la structure DOM  
⚡ **Mode adaptatif** : Fonctionne avec ou sans `unitSize` pour une flexibilité maximale  

## Installation

Le composable est disponible dans le registry :

```bash
npx shadcn-vue@latest add use-drag-drop
```

## Utilisation basique

### Mode grille (avec unitSize)

```typescript
import { useDragDrop } from '@/composables/use-drag-drop';

const { dragState, startDrag, handleDragOver, endDrag } = useDragDrop({
  unitSize: 80,  // Taille d'une unité en pixels
  gap: 8,        // Espacement entre les unités
});
```

### Mode adaptatif (sans unitSize)

```typescript
import { useDragDrop } from '@/composables/use-drag-drop';

// En mode adaptatif, width et height sont en pixels directement
const { dragState, startDrag, handleDragOver, endDrag } = useDragDrop({
  gap: 0, // Optionnel
});

// Les dimensions sont maintenant en pixels
startDrag(event, {
  id: 'item-1',
  width: 250,  // 250 pixels
  height: 150, // 150 pixels
}, true);
```

## API

### useDragDrop(options)

#### Options

```typescript
interface UseDragDropOptions {
  /** 
   * Taille de l'unité de base (ex: taille d'une cellule en pixels).
   * Si non fourni, utilise les dimensions de l'item draggé (mode adaptatif)
   */
  unitSize?: number;
  /** Espacement entre les unités (en pixels) */
  gap?: number;
  /** Fonction de validation de placement */
  validatePlacement?: (
    x: number,
    y: number,
    width: number,
    height: number,
    excludeId?: string
  ) => boolean;
}
```

#### Retour

```typescript
interface UseDragDropReturn<T> {
  /** État du drag */
  dragState: Ref<DragDropState<T>>;
  /** Offset du clic initial */
  dragOffset: Ref<{ x: number; y: number } | null>;
  /** Démarre le drag */
  startDrag: (event: DragEvent, item: DragDropItem<T>, fromContainer?: boolean) => void;
  /** Gère le survol */
  handleDragOver: (
    event: DragEvent,
    containerBounds: DragDropBounds,
    getPosition: (bounds: DragDropBounds) => DragDropPosition | null
  ) => DragDropPosition | null;
  /** Termine le drag */
  endDrag: () => void;
  /** Calcule le rectangle virtuel de l'item en cours de drag */
  getVirtualBounds: (clientX: number, clientY: number) => DragDropBounds | null;
  /** Récupère les données de l'item depuis le dataTransfer */
  getItemFromDataTransfer: (dataTransfer: DataTransfer | null) => DragDropItem<T> | null;
}
```

## Exemple avec grille

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useElementBounding } from '@vueuse/core';
import { useDragDrop, DragDropUtils } from '@/composables/use-drag-drop';

const gridContainer = ref<HTMLElement | null>(null);
const gridBounds = useElementBounding(gridContainer);

const { dragState, startDrag, handleDragOver, endDrag } = useDragDrop({
  unitSize: 80,
  gap: 8,
  validatePlacement: (x, y, width, height) => {
    // Votre logique de validation
    return x >= 0 && y >= 0 && x + width <= columns && y + height <= rows;
  },
});

const onDragOver = (event: DragEvent) => {
  const containerBounds = {
    left: gridBounds.left.value,
    top: gridBounds.top.value,
    right: gridBounds.right.value,
    bottom: gridBounds.bottom.value,
    width: gridBounds.width.value,
    height: gridBounds.height.value,
  };

  const position = handleDragOver(event, containerBounds, (virtualBounds) => {
    return DragDropUtils.getPositionByIntersection(
      virtualBounds,
      containerBounds,
      80, // unitSize
      8,  // gap
      12, // columns
      8   // rows
    );
  });

  console.log('Position calculée:', position);
};
</script>

<template>
  <div
    ref="gridContainer"
    @dragover="onDragOver"
    @drop="handleDrop"
  >
    <div
      v-for="item in items"
      :key="item.id"
      draggable="true"
      @dragstart="startDrag($event, item, true)"
      @dragend="endDrag"
    >
      {{ item.id }}
    </div>
  </div>
</template>
```

## Utilitaires

### DragDropUtils

Classe avec des méthodes statiques pour les calculs de grille :

#### getPositionByIntersection

Calcule la cellule avec la plus grande surface d'intersection.

```typescript
DragDropUtils.getPositionByIntersection(
  elementBounds,    // Bounds de l'élément à placer
  containerBounds,  // Bounds du conteneur
  unitSize,         // Taille d'une unité
  gap,             // Espacement
  columns,         // Nombre de colonnes
  rows             // Nombre de lignes
);
```

#### pixelToGrid

Convertit une position en pixels en position de grille.

```typescript
const gridPos = DragDropUtils.pixelToGrid(pixelX, pixelY, unitSize, gap);
```

#### gridToPixel

Convertit une position de grille en position en pixels.

```typescript
const pixelPos = DragDropUtils.gridToPixel(gridX, gridY, unitSize, gap);
```

## Types

### DragDropItem

```typescript
interface DragDropItem<T = any> {
  id: string;
  width: number;
  height: number;
  data?: T;
}
```

### DragDropState

```typescript
interface DragDropState<T = any> {
  item: DragDropItem<T> | null;
  fromContainer: boolean;
  hoverPosition: DragDropPosition | null;
  isValid: boolean;
  isDragging: boolean;
}
```

### DragDropPosition

```typescript
interface DragDropPosition {
  x: number;
  y: number;
}
```

### DragDropBounds

```typescript
interface DragDropBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}
```

## Avantages

### 1. Drag précis basé sur l'offset

Le composable calcule où exactement vous avez cliqué sur l'élément et maintient cette position pendant le drag.

### 2. Intersection intelligente

Au lieu de se baser uniquement sur la position du curseur, le composable calcule un rectangle virtuel et trouve la cellule avec la plus grande surface d'intersection.

### 3. Réutilisable

Fonctionne avec n'importe quel système de grille, liste, ou disposition. Pas lié à un composant spécifique.

### 4. Extensible

La fonction `validatePlacement` permet d'ajouter votre logique de validation personnalisée.

## Exemples d'utilisation

- ✅ Grilles de contrôles drag & drop (mode grille)
- ✅ Tableaux de bord personnalisables (mode grille)
- ✅ Planificateurs visuels (mode grille)
- ✅ Éditeurs de mise en page (mode grille)
- ✅ Systèmes de gestion de tâches Kanban (mode adaptatif)
- ✅ Canvas libre style Figma (mode adaptatif)
- ✅ Listes réorganisables (mode adaptatif)

## Modes de fonctionnement

### Mode Grille (unitSize défini)

Idéal pour les layouts structurés avec des cellules de taille fixe.

```typescript
// Mode grille : les dimensions sont en unités
const { dragState, startDrag, endDrag } = useDragDrop({
  unitSize: 80, // Chaque unité = 80px
  gap: 8,
});

startDrag(event, {
  id: 'widget-1',
  width: 2,  // 2 unités = 2 × (80 + 8) - 8 = 168px
  height: 3, // 3 unités = 3 × (80 + 8) - 8 = 256px
}, true);
```

**Cas d'usage** :
- Grilles de dashboard
- Systèmes de contrôles
- Planificateurs horaires avec slots fixes

### Mode Adaptatif (unitSize non défini)

Idéal pour les layouts libres où chaque élément a sa propre taille.

```typescript
// Mode adaptatif : les dimensions sont en pixels
const { dragState, startDrag, endDrag } = useDragDrop({
  gap: 0, // Optionnel
});

startDrag(event, {
  id: 'card-1',
  width: 250,  // 250 pixels directement
  height: 150, // 150 pixels directement
}, true);
```

**Cas d'usage** :
- Canvas libres (Figma, Canva)
- Notes post-it
- Listes de fichiers
- Cartes Kanban de tailles variables
