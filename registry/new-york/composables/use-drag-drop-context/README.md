# useDragDropContext

Composable pour accéder au contexte drag-drop fourni par `DragDropProvider` dans les composants enfants.

## Description

Ce composable permet aux composants enfants d'accéder à la configuration et l'état du drag-drop fournis par un `DragDropProvider` parent, sans avoir à passer des props manuellement.

## Utilisation

### Basique

```vue
<script setup>
import { useDragDropContext } from '@/composables/use-drag-drop-context'

const { dragState, startDrag, endDrag } = useDragDropContext()
</script>

<template>
  <div 
    draggable="true"
    @dragstart="startDrag($event, item, true)"
    @dragend="endDrag"
  >
    Drag me!
  </div>
</template>
```

### Avec validation d'erreur

```vue
<script setup>
import { useDragDropContext } from '@/composables/use-drag-drop-context'

// Lance une erreur si utilisé en dehors d'un DragDropProvider
const context = useDragDropContext()
</script>
```

### Usage optionnel

```vue
<script setup>
import { useDragDropContextOptional, useDragDrop } from '@/composables'

// Utilise le contexte s'il existe, sinon crée sa propre instance
const context = useDragDropContextOptional()
const dragDrop = context ?? useDragDrop({ unitSize: 50 })
</script>
```

## API

### `useDragDropContext<T>()`

Accède au contexte drag-drop. **Lance une erreur** si utilisé en dehors d'un `DragDropProvider`.

**Retour :**
```typescript
interface DragDropContext<T> {
  // État réactif
  dragState: Ref<DragDropState<T>>
  dragOffset: Ref<{ x: number; y: number } | null>
  containerBounds?: UseElementBoundingReturn
  
  // Méthodes
  startDrag: (event: DragEvent, item: DragDropItem<T>, fromContainer?: boolean) => void
  handleDragOver: (...) => DragDropPosition | null
  handleDragOverSimple?: (...) => DragDropPosition | null
  endDrag: () => void
  getVirtualBounds: (clientX: number, clientY: number) => DragDropBounds | null
  getItemFromDataTransfer: (dataTransfer: DataTransfer | null) => DragDropItem<T> | null
  
  // Options (readonly)
  options: Readonly<UseDragDropOptions & { mode?: 'drag' | 'resize' | 'both' }>
}
```

### `useDragDropContextOptional<T>()`

Accède au contexte drag-drop de manière optionnelle. Retourne `undefined` si utilisé en dehors d'un `DragDropProvider`.

**Retour :** `DragDropContext<T> | undefined`

## Types de données

### DragDropState

```typescript
interface DragDropState<T> {
  item: DragDropItem<T> | null
  fromContainer: boolean
  hoverPosition: DragDropPosition | null
  isValid: boolean
  isDragging: boolean
}
```

### DragDropItem

```typescript
interface DragDropItem<T> {
  id: string
  width: number   // En unités
  height: number  // En unités
  data?: T
}
```

### DragDropPosition

```typescript
interface DragDropPosition {
  x: number
  y: number
}
```

## Exemples

### Carte draggable

```vue
<script setup>
import { useDragDropContext } from '@/composables/use-drag-drop-context'

const props = defineProps({
  card: { type: Object, required: true }
})

const { dragState, startDrag, endDrag } = useDragDropContext()

const onDragStart = (event) => {
  startDrag(event, {
    id: props.card.id,
    width: 1,
    height: 1,
    data: props.card
  }, true)
}

const isDragging = computed(() => 
  dragState.value.isDragging && dragState.value.item?.id === props.card.id
)
</script>

<template>
  <div 
    class="card"
    :class="{ 'opacity-40': isDragging }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="endDrag"
  >
    {{ card.title }}
  </div>
</template>
```

### Zone de drop

```vue
<script setup>
import { useDragDropContext } from '@/composables/use-drag-drop-context'

const emit = defineEmits(['drop'])
const { dragState, handleDragOverSimple, endDrag } = useDragDropContext()

const onDragOver = (event) => {
  handleDragOverSimple?.(event, (virtualBounds, containerBounds) => {
    // Logique de positionnement
    return { x: 0, y: 0 }
  })
}

const onDrop = (event) => {
  event.preventDefault()
  if (dragState.value.item && dragState.value.isValid) {
    emit('drop', dragState.value.item)
  }
  endDrag()
}
</script>

<template>
  <div 
    class="drop-zone"
    :class="{ 'active': dragState.value.isDragging }"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <slot />
  </div>
</template>
```

### Timeline event

```vue
<script setup>
import { useDragDropContext } from '@/composables/use-drag-drop-context'

const props = defineProps({
  event: { type: Object, required: true }
})

const { dragState, startDrag, options } = useDragDropContext()

const onDragStart = (e) => {
  startDrag(e, {
    id: props.event.id,
    width: 1,
    height: props.event.duration, // en heures
    data: props.event
  }, true)
}

// Accès aux options de configuration
const unitSize = computed(() => options.unitSize || 80)
</script>
```

## Injection Key

Si vous devez accéder à l'injection key manuellement :

```typescript
import { DRAG_DROP_INJECTION_KEY } from '@/composables/use-drag-drop-context'
import { inject } from 'vue'

const context = inject(DRAG_DROP_INJECTION_KEY)
```

## Erreurs courantes

### ❌ Utilisation en dehors du Provider

```vue
<script setup>
// ⚠️ ERREUR : pas de DragDropProvider parent
const { dragState } = useDragDropContext()
</script>
```

**Solution :** Envelopper avec `<DragDropProvider>` ou utiliser `useDragDropContextOptional()`

### ✅ Utilisation correcte

```vue
<template>
  <DragDropProvider>
    <MyDraggableComponent />
  </DragDropProvider>
</template>
```

## Pattern Provider/Context

Ce composable suit le pattern **Provider/Consumer** de Vue 3 :

1. **Provider** (`DragDropProvider`) : Fournit le contexte via `provide()`
2. **Consumer** (`useDragDropContext`) : Consomme le contexte via `inject()`
3. **Avantage** : Évite le prop drilling dans les arbres de composants profonds

## Voir aussi

- [`DragDropProvider`](../components/drag-drop-provider/) - Composant wrapper
- [`useDragDrop`](../use-drag-drop/) - Composable de base
