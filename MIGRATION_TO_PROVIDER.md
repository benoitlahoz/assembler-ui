# Migration vers DragDropProvider : Exemple TimelineDemo

Ce document montre comment migrer le composant `TimelineDemo.vue` existant pour utiliser le nouveau pattern `DragDropProvider`.

## Version actuelle (sans Provider)

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useDragDrop } from '../useDragDrop';

const timeline = ref<HTMLElement | null>(null);
const events = ref([/* ... */]);

// Créer une instance du composable
const { dragState, startDrag, handleDragOverSimple, endDrag } = useDragDrop({
  containerRef: timeline,
  unitSize: HOUR_HEIGHT,
  gap: 0,
  allowCollision: true,
  validatePlacement: (x, y, width, height) => {
    // Validation...
  },
});

const onDragStart = (event: DragEvent, evt: Event) => {
  startDrag(event, { /* ... */ }, true);
};
// ...
</script>

<template>
  <div
    ref="timeline"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <!-- Events -->
  </div>
</template>
```

## Version avec Provider (Option 1 : Slot Scope)

```vue
<script setup lang="ts">
import { ref } from 'vue';
import DragDropProvider from '@/components/drag-drop-provider';

const timeline = ref<HTMLElement | null>(null);
const events = ref([/* ... */]);

const validatePlacement = (x, y, width, height) => {
  const endHour = y + height;
  return y >= WORK_START && endHour <= WORK_END;
};
</script>

<template>
  <DragDropProvider
    :container-ref="timeline"
    :unit-size="HOUR_HEIGHT"
    :gap="0"
    :allow-collision="true"
    :validate-placement="validatePlacement"
  >
    <template #default="{ dragState, startDrag, handleDragOverSimple, endDrag }">
      <div
        ref="timeline"
        @dragover="(e) => handleDragOverSimple?.(e, (virtualBounds, containerBounds) => {
          // Calcul position...
        })"
        @drop="(e) => {
          e.preventDefault();
          if (dragState.value.item && dragState.value.isValid) {
            // Update event...
          }
          endDrag();
        }"
      >
        <div
          v-for="event in events"
          :key="event.id"
          draggable="true"
          @dragstart="(e) => startDrag(e, {
            id: event.id,
            width: 1,
            height: event.duration,
            data: event
          }, true)"
          @dragend="endDrag"
        >
          {{ event.title }}
        </div>
      </div>
    </template>
  </DragDropProvider>
</template>
```

## Version avec Provider (Option 2 : Composants modulaires)

### ParentComponent.vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import DragDropProvider from '@/components/drag-drop-provider';
import TimelineContainer from './TimelineContainer.vue';
import TimelineEvent from './TimelineEvent.vue';

const events = ref([/* ... */]);

const validatePlacement = (x, y, width, height) => {
  const endHour = y + height;
  return y >= WORK_START && endHour <= WORK_END;
};
</script>

<template>
  <DragDropProvider
    :unit-size="HOUR_HEIGHT"
    :gap="0"
    :allow-collision="true"
    :validate-placement="validatePlacement"
  >
    <TimelineContainer>
      <TimelineEvent
        v-for="event in events"
        :key="event.id"
        :event="event"
      />
    </TimelineContainer>
  </DragDropProvider>
</template>
```

### TimelineEvent.vue (composant enfant)

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useDragDropContext } from '@/composables/use-drag-drop-context';

const props = defineProps({
  event: { type: Object, required: true }
});

// Accéder au contexte fourni par DragDropProvider
const { dragState, startDrag, endDrag } = useDragDropContext();

const onDragStart = (e: DragEvent) => {
  startDrag(e, {
    id: props.event.id,
    width: 1,
    height: props.event.duration,
    data: props.event
  }, true);
};

const isDragging = computed(() => 
  dragState.value.isDragging && dragState.value.item?.id === props.event.id
);
</script>

<template>
  <div
    :class="{ 'opacity-40': isDragging }"
    draggable="true"
    @dragstart="onDragStart"
    @dragend="endDrag"
  >
    {{ event.title }}
  </div>
</template>
```

### TimelineContainer.vue (composant enfant)

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useDragDropContext } from '@/composables/use-drag-drop-context';

const timeline = ref<HTMLElement | null>(null);
const emit = defineEmits(['update:event']);

const { dragState, handleDragOverSimple, endDrag } = useDragDropContext();

const onDragOver = (event: DragEvent) => {
  handleDragOverSimple?.(event, (virtualBounds, containerBounds) => {
    const relativeY = virtualBounds.top - containerBounds.top;
    const hour = START_HOUR + relativeY / HOUR_HEIGHT;
    const roundedHour = Math.round(hour * 4) / 4;
    
    return {
      x: 0,
      y: Math.max(START_HOUR, Math.min(END_HOUR, roundedHour))
    };
  });
};

const onDrop = (event: DragEvent) => {
  event.preventDefault();
  
  if (dragState.value.item && dragState.value.hoverPosition && dragState.value.isValid) {
    emit('update:event', {
      id: dragState.value.item.id,
      startHour: dragState.value.hoverPosition.y
    });
  }
  
  endDrag();
};
</script>

<template>
  <div
    ref="timeline"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <slot />
  </div>
</template>
```

## Avantages de la migration

### Option 1 : Slot Scope
✅ Migration minimale  
✅ Tout reste dans un fichier  
✅ Bon pour des composants simples  
❌ Moins modulaire  

### Option 2 : Composants modulaires
✅ Composants réutilisables (`TimelineEvent`, `TimelineContainer`)  
✅ Meilleure séparation des responsabilités  
✅ Plus facile à tester  
✅ Scalable pour applications complexes  
❌ Plus de fichiers à créer  

## Quand utiliser chaque approche ?

| Cas d'usage | Recommandation |
|-------------|----------------|
| Timeline simple, un seul type d'événement | Option 1 (Slot Scope) |
| Timeline avec multiples types d'événements | Option 2 (Modulaire) |
| Composant réutilisé dans plusieurs pages | Option 2 (Modulaire) |
| Prototype / POC rapide | Option 1 (Slot Scope) |
| Application en production | Option 2 (Modulaire) |

## Checklist de migration

- [ ] Identifier tous les appels à `useDragDrop()`
- [ ] Extraire les options communes (unitSize, gap, etc.)
- [ ] Créer le `DragDropProvider` avec ces options
- [ ] Choisir l'approche (Slot Scope ou Modulaire)
- [ ] Si modulaire : créer les composants enfants
- [ ] Remplacer `useDragDrop()` par `useDragDropContext()` dans les enfants
- [ ] Tester le drag-drop fonctionne
- [ ] Vérifier la validation de placement
- [ ] Tester les edge cases
- [ ] Supprimer l'ancien code

## Compatibilité

Le `DragDropProvider` est **100% compatible** avec l'API existante de `useDragDrop`. Vous pouvez :

- Garder les anciens composants qui utilisent `useDragDrop` directement
- Migrer progressivement vers `DragDropProvider`
- Mixer les deux approches dans la même application

Il n'y a **aucune breaking change** ! 🎉
