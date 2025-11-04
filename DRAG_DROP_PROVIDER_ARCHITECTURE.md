# Généralisation de use-drag-drop : Architecture Provider/Context

## 📋 Résumé de l'implémentation

J'ai généralisé l'approche `use-drag-drop` en créant un pattern **Provider/Context** qui permet de partager la configuration et l'état du drag-drop entre un composant parent et ses enfants.

## 🏗️ Architecture

### Composants créés

```
registry/new-york/
├── components/
│   └── drag-drop-provider/
│       ├── DragDropProvider.vue        # Composant wrapper
│       ├── index.ts
│       ├── README.md
│       └── demos/
│           ├── BasicDemo.vue           # Démo simple
│           └── GridLayoutDemo.vue      # Démo avancée (grille)
│
└── composables/
    └── use-drag-drop-context/
        ├── useDragDropContext.ts       # Hook pour accéder au contexte
        ├── index.ts
        └── README.md
```

### Flux de données

```
┌─────────────────────────────────────┐
│      DragDropProvider               │
│  (Fournit le contexte via provide)  │
│                                     │
│  - Configuration (props)            │
│  - Instance useDragDrop()           │
│  - Provide au contexte              │
└──────────────┬──────────────────────┘
               │ provide/inject
               │
        ┌──────┴──────┐
        │             │
   ┌────▼───┐   ┌────▼────┐
   │ Child 1│   │ Child 2 │
   │        │   │         │
   │ inject │   │ inject  │
   └────────┘   └─────────┘
   
   useDragDropContext()
```

## 🎯 Nomenclature choisie

### ✅ Noms retenus

- **`useDragDrop`** : Composable de base (inchangé)
- **`DragDropProvider`** : Composant wrapper
- **`useDragDropContext`** : Hook pour accéder au contexte

### Pourquoi ces noms ?

1. **`useDragDrop`** reste pertinent car :
   - Descriptif et clair
   - Universellement compris
   - Déjà établi dans la codebase
   - Spécifique à son cas d'usage

2. **`DragDropProvider`** suit le pattern :
   - Cohérent avec `MediaDevicesProvider`, `ScreenShareProvider`
   - Le suffixe "Provider" indique clairement le rôle
   - Pattern reconnu dans l'écosystème Vue/React

3. **`useDragDropContext`** est explicite :
   - Indique qu'on accède à un contexte fourni
   - Suit la convention `use*` des composables
   - Distingue clairement de `useDragDrop`

### ❌ Alternatives considérées (rejetées)

| Alternative | Raison du rejet |
|------------|-----------------|
| `useInteractiveDrag` | Trop générique, perd la clarté de "drag-drop" |
| `useInteraction` | Beaucoup trop vague |
| `InteractionProvider` | N'indique pas le type d'interaction |
| `useDragDropInjection` | Trop technique, moins user-friendly |

## 💡 Avantages de l'approche Provider

### Avant (sans Provider)

```vue
<script setup>
import { useDragDrop } from '@/composables/use-drag-drop'

// Chaque composant doit créer sa propre instance
const dragDrop1 = useDragDrop({ unitSize: 50, gap: 10 })
const dragDrop2 = useDragDrop({ unitSize: 50, gap: 10 }) // duplication!
const dragDrop3 = useDragDrop({ unitSize: 50, gap: 10 }) // duplication!
</script>

<template>
  <Container1 :drag-drop="dragDrop1" />
  <Container2 :drag-drop="dragDrop2" />
  <Container3 :drag-drop="dragDrop3" />
</template>
```

### Après (avec Provider)

```vue
<script setup>
import DragDropProvider from '@/components/drag-drop-provider'
</script>

<template>
  <!-- Configuration centralisée -->
  <DragDropProvider :unit-size="50" :gap="10">
    <!-- Les enfants accèdent automatiquement au contexte -->
    <Container1 />
    <Container2 />
    <Container3 />
  </DragDropProvider>
</template>
```

## 🔧 Utilisation

### 1. Approche Slot Scope (Simple)

Idéal pour des cas simples où tout est dans un seul composant.

```vue
<template>
  <DragDropProvider :allow-collision="true">
    <template #default="{ dragState, startDrag, endDrag }">
      <div 
        draggable="true"
        @dragstart="startDrag($event, item, true)"
        @dragend="endDrag"
      >
        Item
      </div>
    </template>
  </DragDropProvider>
</template>
```

### 2. Approche Context (Modulaire)

Idéal pour des composants réutilisables et des architectures complexes.

```vue
<!-- ParentComponent.vue -->
<template>
  <DragDropProvider :unit-size="80" :gap="8">
    <GridContainer>
      <DraggableCard v-for="item in items" :key="item.id" :item="item" />
    </GridContainer>
  </DragDropProvider>
</template>

<!-- DraggableCard.vue -->
<script setup>
import { useDragDropContext } from '@/composables/use-drag-drop-context'

const { dragState, startDrag, endDrag } = useDragDropContext()
</script>
```

## 🎨 Cas d'usage

### Timeline/Calendrier

```vue
<DragDropProvider 
  :unit-size="HOUR_HEIGHT"
  :allow-collision="true"
  :validate-placement="validateWorkHours"
>
  <TimelineEvent v-for="event in events" :event="event" />
</DragDropProvider>
```

### Grille/Dashboard

```vue
<DragDropProvider 
  :unit-size="cellSize"
  :gap="8"
  :validate-placement="preventCollisions"
>
  <DashboardWidget v-for="widget in widgets" :widget="widget" />
</DragDropProvider>
```

### Canvas libre

```vue
<DragDropProvider :allow-collision="true">
  <CanvasElement v-for="el in elements" :element="el" />
</DragDropProvider>
```

## 📊 Comparaison

| Aspect | useDragDrop direct | DragDropProvider |
|--------|-------------------|------------------|
| **Configuration** | Répétée dans chaque composant | Centralisée au parent |
| **État partagé** | Difficile (prop drilling) | Automatique via inject |
| **Réutilisabilité** | Composants couplés | Composants découplés |
| **Complexité** | Simple pour usage unique | Meilleur pour apps complexes |
| **Maintenance** | Changements multiples | Changement unique |
| **Testabilité** | Nécessite setup de chaque instance | Provider mockable |

## 🚀 Évolutions possibles

### Extension multi-modes

Le Provider peut évoluer pour supporter plusieurs modes d'interaction :

```typescript
interface Props extends UseDragDropOptions {
  mode?: 'drag' | 'resize' | 'rotate' | 'both'
}
```

### Plugins et middlewares

```vue
<DragDropProvider 
  :plugins="[snapToGrid, preventOverlap, autoScroll]"
>
  ...
</DragDropProvider>
```

### Gestion d'état avancée

```vue
<DragDropProvider 
  :on-drag-start="trackAnalytics"
  :on-drop="saveToBackend"
>
  ...
</DragDropProvider>
```

## ✅ Conclusion

Le pattern Provider/Context est **parfaitement adapté** pour généraliser `use-drag-drop` car :

1. ✅ Respecte les patterns Vue existants
2. ✅ Suit la nomenclature de votre codebase
3. ✅ Offre flexibilité (slot scope OU context)
4. ✅ Facilite la réutilisation
5. ✅ Simplifie la maintenance
6. ✅ Reste rétro-compatible (`useDragDrop` fonctionne toujours en standalone)

Les noms choisis (`DragDropProvider` / `useDragDropContext`) sont **clairs, cohérents et explicites** ! 🎯
