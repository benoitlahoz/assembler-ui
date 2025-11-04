# ControlsToolbar

Composant toolbar qui affiche les contrôles enregistrés dans le registry et permet de les glisser-déposer dans une `ControlsGrid`.

**Note** : Ce composant fait partie du module `controls-grid` et est conçu pour être utilisé dans le slot `toolbar` de `ControlsGrid`, mais peut aussi être utilisé de manière autonome.

## Fonctionnalités

- **Affichage des contrôles** : Liste tous les contrôles enregistrés via `useControlRegistry`
- **Filtrage par catégorie** : Affiche uniquement les contrôles d'une catégorie spécifique
- **Drag & Drop** : Les contrôles peuvent être glissés-déposés dans une `ControlsGrid`
- **Groupement automatique** : Groupe les contrôles par catégorie si aucune catégorie n'est spécifiée
- **Orientations** : Supporte l'orientation horizontale et verticale
- **Aperçus** : Affiche une miniature ou une icône pour chaque contrôle
- **Personnalisable** : Taille des items, espacement, labels configurables

## Usage

### Utilisation avec ControlsGrid (recommandé)

```vue
<script setup lang="ts">
import { ControlsGrid, ControlsToolbar } from '@/components/controls-grid';
import { useControlRegistry } from '@/composables/use-control-registry';
import { ControlButton } from '@/components/control-button';

const { registerControl } = useControlRegistry();

// Enregistrer des contrôles
registerControl({
  id: 'button-primary',
  name: 'Bouton',
  description: 'Bouton de contrôle primaire',
  component: ControlButton,
  defaultSize: { width: 1, height: 1 },
  category: 'Actions',
  color: 'hsl(var(--primary))',
  defaultProps: {
    variant: 'default',
    shape: 'square',
  },
});
</script>

<template>
  <ControlsGrid :cell-size="100" :gap="12">
    <template #toolbar>
      <ControlsToolbar
        orientation="vertical"
        :item-size="80"
        class="w-32"
      />
    </template>
  </ControlsGrid>
</template>
```

### Utilisation standalone

```vue
<script setup lang="ts">
import { ControlsToolbar } from '@/components/controls-grid';
import { useControlRegistry } from '@/composables/use-control-registry';
import { ControlButton } from '@/components/control-button';

const { registerControl } = useControlRegistry();

// Enregistrer des contrôles
registerControl({
  id: 'button-primary',
  name: 'Bouton',
  description: 'Bouton de contrôle primaire',
  component: ControlButton,
  defaultSize: { width: 1, height: 1 },
  category: 'Actions',
  color: 'hsl(var(--primary))',
  defaultProps: {
    variant: 'default',
    shape: 'square',
  },
});
</script>

<template>
  <ControlsToolbar />
</template>
```

### Layout personnalisé

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ControlsGrid, ControlsToolbar } from '@/components/controls-grid';
import type { ControlDefinition } from '@/composables/use-control-registry';

const handleControlSelected = (control: ControlDefinition) => {
  console.log('Contrôle sélectionné:', control);
};
</script>

<template>
  <div class="flex gap-4 h-screen p-4">
    <!-- Toolbar en dehors de la grille -->
    <ControlsToolbar
      orientation="vertical"
      :item-size="80"
      class="w-32"
      @control-selected="handleControlSelected"
    />
    
    <!-- Grille de contrôles -->
    <ControlsGrid
      class="flex-1"
      :cell-size="100"
      :gap="12"
    />
  </div>
</template>
```

### Filtrer par catégorie

```vue
<template>
  <ControlsToolbar 
    category="Actions"
    orientation="horizontal"
  />
</template>
```

### Personnalisation avancée

```vue
<template>
  <ControlsToolbar
    orientation="horizontal"
    :item-size="100"
    :gap="16"
    :show-labels="true"
    label-size="md"
    class="p-4 bg-gradient-to-r from-background to-muted"
  >
    <template #default="{ controls }">
      <div class="p-2 text-xs text-muted-foreground">
        {{ controls.length }} contrôles disponibles
      </div>
    </template>
  </ControlsToolbar>
</template>
```

## Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `category` | `string` | `undefined` | Catégorie de contrôles à afficher (si non spécifié, affiche tous les contrôles) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Orientation de la toolbar |
| `itemSize` | `number` | `60` | Taille des items dans la toolbar (en pixels) |
| `gap` | `number` | `8` | Espacement entre les items (en pixels) |
| `showLabels` | `boolean` | `true` | Afficher les labels des contrôles |
| `labelSize` | `'sm' \| 'md' \| 'lg'` | `'sm'` | Taille des labels |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `control-selected` | `ControlDefinition` | Émis quand un contrôle est cliqué |
| `control-drag-start` | `ControlDefinition, DragEvent` | Émis quand le drag d'un contrôle commence |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ controls: ControlDefinition[] }` | Contenu personnalisé à la fin de la toolbar |

## Exemples de configuration

### Toolbar compacte

```vue
<template>
  <ControlsToolbar
    :item-size="40"
    :gap="4"
    :show-labels="false"
    orientation="horizontal"
  />
</template>
```

### Toolbar avec grandes icônes

```vue
<template>
  <ControlsToolbar
    :item-size="120"
    :gap="16"
    label-size="lg"
    orientation="vertical"
  />
</template>
```

## Styling

Le composant utilise les variables CSS pour la personnalisation :

```css
.controls-toolbar {
  --item-size: 60px;
  --gap-size: 8px;
}
```

Vous pouvez surcharger ces variables via des styles inline ou CSS :

```vue
<template>
  <ControlsToolbar
    :style="{ 
      '--item-size': '80px',
      '--gap-size': '12px'
    }"
  />
</template>
```

## Notes

- Les contrôles doivent être enregistrés via `useControlRegistry()` avant d'apparaître dans la toolbar
- Le drag & drop est compatible avec `ControlsGrid`
- Les aperçus de contrôles utilisent le composant lui-même en version miniature
- Les catégories sont automatiquement groupées si aucune catégorie n'est spécifiée
