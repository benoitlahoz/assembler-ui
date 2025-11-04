# Guide d'utilisation - Control Registry & Controllers Grid

## Vue d'ensemble

Ce système permet de créer, enregistrer et utiliser des contrôles interactifs dans une grille drag-and-drop.

## Architecture

```
registry/new-york/
├── components/
│   ├── control-button/          # Composant bouton de contrôle
│   │   ├── ControlButton.vue
│   │   └── demos/
│   │       ├── ControlButtonDemo.vue      # Démo avec grille
│   │       └── PlaygroundDemo.vue         # Playground de test
│   └── controllers-grid/        # Système de grille
│       ├── ControllersGrid.vue
│       ├── controls/            # Contrôles prédéfinis
│       │   ├── ButtonControl.vue
│       │   └── index.ts         # Définitions de contrôles
│       └── demos/
│           └── ControlRegistryDemo.vue    # Démo complète
└── composables/
    └── use-control-registry/    # Système d'enregistrement
        └── index.ts
```

## Utilisation rapide

### 1. Créer un contrôle personnalisé

```vue
<!-- MonControle.vue -->
<script setup lang="ts">
import { ControlButton } from '~/components/control-button';

interface Props {
  id?: string;
  color?: string;
  label?: string;
}

const props = defineProps<Props>();

const handleClick = () => {
  console.log('Contrôle cliqué:', props.id);
};
</script>

<template>
  <ControlButton 
    :color="color" 
    variant="default"
    @click="handleClick"
  >
    {{ label }}
  </ControlButton>
</template>
```

### 2. Enregistrer le contrôle

```typescript
import { useControlRegistry } from '~/composables/use-control-registry';
import MonControle from './MonControle.vue';

const { registerControl } = useControlRegistry();

registerControl({
  id: 'mon-controle',
  name: 'Mon Contrôle',
  description: 'Un contrôle personnalisé',
  component: MonControle,
  defaultSize: { width: 1, height: 1 },
  defaultProps: {
    color: '#3b82f6',
    label: 'Click',
  },
  category: 'custom',
  icon: '🎮',
  color: '#3b82f6',
});
```

### 3. Utiliser dans une grille

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ControllersGrid } from '~/components/controllers-grid';
import { useControlRegistry } from '~/composables/use-control-registry';
import { controlDefinitions } from '~/components/controllers-grid/controls';

const { registerControls, getAllControls, createControlInstance } = useControlRegistry();
const gridItems = ref([]);

onMounted(() => {
  // Enregistrer les contrôles prédéfinis
  registerControls(controlDefinitions);
});

const availableControls = getAllControls();

const handleDragStart = (event: DragEvent, controlId: string) => {
  const instance = createControlInstance(controlId);
  if (instance && event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(instance));
  }
};
</script>

<template>
  <div class="flex gap-4">
    <!-- Palette -->
    <div class="w-64 space-y-2">
      <div
        v-for="control in availableControls"
        :key="control.id"
        class="p-4 bg-card rounded cursor-grab"
        :draggable="true"
        @dragstart="handleDragStart($event, control.id)"
      >
        {{ control.icon }} {{ control.name }}
      </div>
    </div>

    <!-- Grille -->
    <ControllersGrid
      v-model:items="gridItems"
      :cell-size="80"
      :gap="8"
      class="flex-1"
    />
  </div>
</template>
```

## Contrôles prédéfinis disponibles

| ID | Nom | Taille | Description |
|----|-----|--------|-------------|
| `button-control` | Button Control | 1×1 | Bouton play simple |
| `button-stop` | Stop Button | 1×1 | Bouton stop rouge |
| `button-record` | Record Button | 1×1 | Bouton enregistrement circulaire |
| `button-wide` | Wide Button | 2×1 | Bouton large |
| `button-tall` | Tall Button | 1×2 | Bouton haut |
| `button-big` | Big Button | 2×2 | Grand bouton |

## ControlButton API

### Props

```typescript
{
  variant?: 'default' | 'outline' | 'ghost' | 'solid';  // Style du bouton
  shape?: 'square' | 'circle';                          // Forme
  color?: string;                                       // Couleur (CSS ou variable)
  class?: string;                                       // Classes additionnelles
}
```

### Exemples de couleurs

```vue
<!-- Couleur CSS directe -->
<ControlButton color="#ff5500" />
<ControlButton color="rgb(255, 85, 0)" />
<ControlButton color="blue" />

<!-- Variable CSS -->
<ControlButton color="--primary" />
<ControlButton color="--destructive" />

<!-- Avec variantes -->
<ControlButton color="#3b82f6" variant="default" />  <!-- Fond bleu -->
<ControlButton color="#3b82f6" variant="outline" />  <!-- Bordure bleue -->
<ControlButton color="#3b82f6" variant="ghost" />    <!-- Transparent -->
```

## Événements ControllersGrid

```typescript
// Nouvel item placé
@item-placed="(item) => console.log('Placed:', item)"

// Item déplacé
@item-moved="(item) => console.log('Moved:', item)"

// Item supprimé
@item-removed="(id) => console.log('Removed:', id)"

// Liste mise à jour
@update:items="(items) => console.log('Items:', items)"
```

## Méthodes exposées ControllersGrid

```typescript
const gridRef = ref<InstanceType<typeof ControllersGrid>>();

// Ajouter un item programmatiquement
gridRef.value?.addItem({
  id: 'custom-1',
  width: 2,
  height: 1,
  component: MyComponent,
  props: { ... }
});

// Supprimer un item
gridRef.value?.removeItem('item-id');

// Vider la grille
gridRef.value?.clearGrid();
```

## Exemple complet

Voir les démos :
- `ControlButtonDemo.vue` - Utilisation de ControlButton avec ControllersGrid
- `ControlRegistryDemo.vue` - Système complet d'enregistrement
- `PlaygroundDemo.vue` - Playground de test des variantes

## Bonnes pratiques

1. **Enregistrer les contrôles au démarrage** : Utilisez `onMounted` pour enregistrer vos contrôles
2. **Utiliser shallowRef pour les composants** : Le système le fait automatiquement
3. **IDs uniques** : `createControlInstance` génère des IDs uniques automatiquement
4. **Tailles cohérentes** : Respectez les multiples de la cellule de base (80px)
5. **Couleurs** : Préférez les variables CSS pour la cohérence du thème

## Personnalisation

### Thème de la grille

```vue
<ControllersGrid
  :cell-size="100"      <!-- Cellules plus grandes -->
  :gap="12"             <!-- Plus d'espacement -->
  :min-columns="8"      <!-- Grille plus large -->
  class="custom-grid"   <!-- Classes personnalisées -->
/>
```

### Styles personnalisés

```vue
<style>
.custom-grid {
  background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%);
  border-radius: 16px;
}
</style>
```
