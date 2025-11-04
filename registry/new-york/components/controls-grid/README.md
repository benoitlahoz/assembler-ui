# ControllersGrid

Un composant de grille drag-and-drop intelligent pour placer et organiser des contrôleurs ou composants dans une interface. Optimisé avec **VueUse** et **@vueuse/motion** pour des performances et animations de qualité.

## ✨ Fonctionnalités

- ✅ **Drag and drop fluide** : Glissez des items depuis une palette externe ou déplacez-les dans la grille
- ✅ **Grille responsive** : S'adapte automatiquement à la taille du conteneur
- ✅ **Placement intelligent** : Validation automatique des placements (pas de chevauchement)
- ✅ **Preview visuel** : Aperçu en temps réel pendant le drag avec animation
- ✅ **Animations élégantes** : Animations spring naturelles avec @vueuse/motion
- ✅ **Multi-tailles** : Supporte des items de tailles variées (1x1, 2x1, 2x2, etc.)
- ✅ **Grille visuelle** : Points aux coins des cellules (style minimaliste)
- ✅ **Suppression facile** : Bouton × animé au survol
- ✅ **TypeScript** : Entièrement typé pour une meilleure DX

## 🎨 Technologies

- **Vue 3** Composition API
- **@vueuse/core** : `useElementSize` pour le dimensionnement réactif
- **@vueuse/motion** : Animations fluides et naturelles
- **HTML5 Drag and Drop API** : Drag-drop natif optimisé
- **CSS Grid** : Layout performant et flexible

## 📦 Installation

```bash
# Copiez le composant dans votre projet
cp ControllersGrid.vue ~/votre-projet/components/
```

## Usage de base

```vue
<script setup lang="ts">
import { ref } from 'vue'
import ControllersGrid from '~/components/ControllersGrid.vue'

const items = ref([
  { id: 'btn-1', x: 0, y: 0, width: 1, height: 1 },
  { id: 'slider-1', x: 1, y: 0, width: 2, height: 1 },
])

const handleItemPlaced = (item) => {
  console.log('Nouvel item placé:', item)
}
</script>

<template>
  <ControllersGrid
    v-model:items="items"
    :cell-size="100"
    :gap="12"
    @item-placed="handleItemPlaced"
  />
</template>
```

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `cellSize` | `number` | `80` | Taille de base d'une cellule en pixels |
| `gap` | `number` | `8` | Espacement entre les cellules en pixels |
| `minColumns` | `number` | `4` | Nombre minimum de colonnes |
| `items` | `GridItem[]` | `[]` | Items déjà placés dans la grille |
| `showGrid` | `boolean` | `true` | Afficher la grille en pointillés |
| `snapToGrid` | `boolean` | `true` | Snap automatique à la grille |

## Types

```typescript
interface GridItem {
  id: string           // Identifiant unique
  x: number           // Position X dans la grille (0-based)
  y: number           // Position Y dans la grille (0-based)
  width: number       // Largeur en cellules
  height: number      // Hauteur en cellules
  component?: any     // Composant Vue à rendre (optionnel)
  [key: string]: any  // Propriétés additionnelles
}
```

## Événements

| Événement | Payload | Description |
|-----------|---------|-------------|
| `update:items` | `GridItem[]` | Émis quand les items changent |
| `item-placed` | `GridItem` | Émis quand un nouvel item est placé |
| `item-moved` | `GridItem` | Émis quand un item est déplacé |
| `item-removed` | `string` | Émis quand un item est supprimé (reçoit l'ID) |

## Méthodes exposées

Accessible via `ref` :

```vue
<script setup>
const grid = ref()

// Ajouter un item programmatiquement
const addItem = () => {
  grid.value?.addItem({
    id: 'new-item',
    width: 2,
    height: 1,
  })
}

// Supprimer un item
const removeItem = (id) => {
  grid.value?.removeItem(id)
}

// Vider la grille
const clear = () => {
  grid.value?.clearGrid()
}
</script>

<template>
  <ControllersGrid ref="grid" />
</template>
```

### `addItem(item: Omit<GridItem, 'x' | 'y'>): GridItem | null`

Ajoute un item à la première position disponible. Retourne l'item avec position, ou `null` si aucune place.

### `removeItem(id: string): void`

Supprime un item par son ID.

### `clearGrid(): void`

Supprime tous les items de la grille.

## Exemples avancés

### Avec composants personnalisés

```vue
<script setup>
import { ref } from 'vue'
import ControllersGrid from '~/components/ControllersGrid.vue'
import MyButton from '~/components/MyButton.vue'
import MySlider from '~/components/MySlider.vue'

const items = ref([
  {
    id: 'btn-1',
    x: 0,
    y: 0,
    width: 1,
    height: 1,
    component: MyButton,
    label: 'Play',
  },
  {
    id: 'slider-1',
    x: 1,
    y: 0,
    width: 2,
    height: 1,
    component: MySlider,
    min: 0,
    max: 100,
  },
])
</script>

<template>
  <ControllersGrid v-model:items="items" />
</template>
```

### Avec slot personnalisé

```vue
<template>
  <ControllersGrid v-model:items="items">
    <template #default="{ columns, rows, placedItems }">
      <div class="grid-stats">
        Grille: {{ columns }}×{{ rows }} | Items: {{ placedItems.length }}
      </div>
    </template>
  </ControllersGrid>
</template>
```

### Créer une palette d'items draggables

Pour créer une palette externe, utilisez `effectAllowed: 'copy'` :

```vue
<script setup lang="ts">
const handlePaletteDragStart = (event: DragEvent, template: any) => {
  const item = {
    id: `${template.id}-${Date.now()}`,
    width: template.width,
    height: template.height,
  };
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'; // Important !
    event.dataTransfer.setData('application/json', JSON.stringify(item));
  }
};
</script>

<template>
  <div
    v-for="template in availableComponents"
    :key="template.id"
    :draggable="true"
    @dragstart="handlePaletteDragStart($event, template)"
  >
    {{ template.label }}
  </div>
</template>
```

Voir `demos/SimpleExample.vue` pour un exemple complet avec palette.

## 🎬 Animations

Le composant utilise `@vueuse/motion` pour des animations fluides. Consultez [ANIMATIONS.md](./ANIMATIONS.md) pour plus de détails.

**Animations incluses :**
- ✨ Apparition spring des items placés (scale + fade)
- 🎯 Preview animé pendant le drag
- 🔘 Bouton de suppression avec micro-interactions
- 💫 Animation pulse du preview

## Personnalisation CSS

Le composant utilise des variables CSS pour faciliter la personnalisation :

```css
.controllers-grid {
  --spacing: 1rem;           /* Padding interne */
  --background: ...;         /* Couleur de fond */
  --border: ...;            /* Couleur des bordures */
  --primary: ...;           /* Couleur primaire (preview) */
  --card: ...;              /* Couleur des cards */
  --destructive: ...;       /* Couleur du bouton supprimer */
}
```

## Comportement

1. **Drag depuis l'extérieur** : Crée un nouvel item dans la grille
2. **Drag depuis la grille** : Déplace l'item existant
3. **Validation** : Empêche les placements invalides (hors limites ou chevauchements)
4. **Aperçu** : Montre une prévisualisation en temps réel du placement
5. **Suppression** : Bouton ✕ visible au survol de chaque item

## Notes de performance

- Utilise `ResizeObserver` pour détecter les changements de taille du conteneur
- Calcul optimisé de la disponibilité des cellules
- Transitions CSS pour les animations fluides
- Les items sont rendus avec `v-for` optimisé

## Suggestions d'amélioration

🔮 **Fonctionnalités futures possibles :**

1. **Redimensionnement** : Permettre de redimensionner les items une fois placés (poignées de resize)
2. **Rotation** : Support de la rotation des items
3. **Grille magnétique** : Alignement automatique amélioré
4. **Undo/Redo** : Historique des modifications
5. **Templates** : Sauvegarder/charger des configurations prédéfinies
6. **Groupes** : Organiser les items en groupes déplaçables
7. **Verrouillage** : Verrouiller certains items pour éviter leur déplacement
8. **Grille adaptative** : Ajuster automatiquement la taille des cellules
9. **Export/Import** : JSON, localStorage, etc.
10. **Accessibilité** : Navigation au clavier complète

## Licence

MIT
