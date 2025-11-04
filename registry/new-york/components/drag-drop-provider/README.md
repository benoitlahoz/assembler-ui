# DragDropProvider

Composant wrapper qui fournit la configuration et l'état du drag-drop à ses composants enfants via le pattern provide/inject de Vue 3.

## Vue d'ensemble

Le `DragDropProvider` encapsule le composable `useDragDrop` et expose son API à tous les composants enfants via le contexte Vue. Cela permet de :

- **Centraliser la configuration** : Définir une fois les options de drag-drop pour tous les enfants
- **Partager l'état** : Tous les composants enfants accèdent au même état de drag
- **Simplifier le code** : Pas besoin de passer les props manuellement à chaque composant
- **Améliorer la réutilisabilité** : Créer des composants drag-drop génériques

## Utilisation

### Approche 1 : Via le slot scope (simple)

```vue
<template>
  <DragDropProvider :allow-collision="true">
    <template #default="{ dragState, startDrag, endDrag }">
      <!-- Utiliser directement les fonctions du slot -->
      <div @dragstart="startDrag($event, item, true)">
        Drag me!
      </div>
    </template>
  </DragDropProvider>
</template>
```

### Approche 2 : Via useDragDropContext (réutilisable)

```vue
<!-- ParentComponent.vue -->
<template>
  <DragDropProvider :unit-size="50" :gap="10">
    <DraggableCard v-for="item in items" :key="item.id" :item="item" />
  </DragDropProvider>
</template>

<!-- DraggableCard.vue -->
<script setup>
import { useDragDropContext } from '@/composables/use-drag-drop-context'

const props = defineProps(['item'])
const { dragState, startDrag, endDrag } = useDragDropContext()

const onDragStart = (event) => {
  startDrag(event, props.item, true)
}
</script>

<template>
  <div 
    draggable="true" 
    @dragstart="onDragStart"
    @dragend="endDrag"
    :class="{ 'opacity-40': dragState.value.isDragging }"
  >
    {{ item.title }}
  </div>
</template>
```

## Props

Toutes les props de `UseDragDropOptions` sont supportées :

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `containerRef` | `Ref<HTMLElement \| null>` | `undefined` | Référence vers le conteneur pour auto-bind avec useElementBounding |
| `unitSize` | `number` | `undefined` | Taille de l'unité de base (ex: cellule de grille en pixels) |
| `gap` | `number` | `0` | Espacement entre les unités |
| `allowCollision` | `boolean` | `false` | Permet aux items de se chevaucher |
| `validatePlacement` | `function` | `undefined` | Fonction de validation personnalisée |
| `mode` | `'drag' \| 'resize' \| 'both'` | `'drag'` | Mode d'interaction (extensible) |

## API du Contexte

Le contexte fourni aux enfants expose :

```typescript
interface DragDropContext {
  // État
  dragState: Ref<DragDropState>
  dragOffset: Ref<{ x: number; y: number } | null>
  containerBounds?: UseElementBoundingReturn
  
  // Méthodes
  startDrag: (event: DragEvent, item: DragDropItem, fromContainer?: boolean) => void
  handleDragOver: (event: DragEvent, containerBounds: DragDropBounds, getPosition: Function) => DragDropPosition | null
  handleDragOverSimple?: (event: DragEvent, getPosition: Function) => DragDropPosition | null
  endDrag: () => void
  getVirtualBounds: (clientX: number, clientY: number) => DragDropBounds | null
  getItemFromDataTransfer: (dataTransfer: DataTransfer | null) => DragDropItem | null
  
  // Options (readonly)
  options: Readonly<UseDragDropOptions & { mode?: 'drag' | 'resize' | 'both' }>
}
```

## Cas d'usage

### Timeline / Calendrier

```vue
<DragDropProvider 
  :container-ref="timeline" 
  :unit-size="HOUR_HEIGHT"
  :allow-collision="true"
>
  <TimelineEvent v-for="event in events" :key="event.id" :event="event" />
</DragDropProvider>
```

### Grille / Kanban

```vue
<DragDropProvider 
  :unit-size="cellSize" 
  :gap="8"
  :validate-placement="validateGridPlacement"
>
  <GridItem v-for="item in items" :key="item.id" :item="item" />
</DragDropProvider>
```

### Layout libre (Canvas)

```vue
<DragDropProvider :allow-collision="true">
  <CanvasElement v-for="el in elements" :key="el.id" :element="el" />
</DragDropProvider>
```

## Avantages vs useDragDrop direct

| Aspect | useDragDrop direct | DragDropProvider |
|--------|-------------------|------------------|
| Configuration | Doit être passée à chaque composant | Définie une fois au niveau parent |
| État partagé | Difficile, nécessite du prop drilling | Automatique via inject |
| Réutilisabilité | Composants couplés à la logique | Composants découplés et réutilisables |
| Complexité | Simple pour usage unique | Mieux pour applications complexes |

## Renommage suggéré ?

### Option 1 : Garder les noms actuels ✅
- `useDragDrop` - Composable de base
- `DragDropProvider` - Composant wrapper
- **Avantage** : Noms clairs et explicites

### Option 2 : Renommer pour plus de cohérence
- `useInteractiveDrag` - Composable de base
- `InteractiveDragProvider` - Composant wrapper  
- **Avantage** : Évoque mieux l'aspect "interaction" et laisse place à d'autres modes (resize, rotate...)

### Option 3 : Renommer pour généricité
- `useInteraction` - Composable de base
- `InteractionProvider` - Composant wrapper
- **Avantage** : Très générique, extensible à d'autres types d'interactions

## Recommandation

Je recommande de **garder `useDragDrop`** car :
1. Le nom est déjà bien établi et descriptif
2. `DragDropProvider` suit le pattern existant (`MediaDevicesProvider`, `ScreenShareProvider`)
3. Le terme "drag-drop" est universellement compris
4. Si besoin d'autres interactions (resize, rotate), on peut créer d'autres composables plutôt que de tout généraliser

Le nom actuel est **parfaitement adapté** ! 🎯
