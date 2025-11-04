# ControllersGrid - Configuration et Personnalisation

## Variables CSS

Le composant utilise les variables CSS suivantes, héritées du système de design de votre application :

```css
:root {
  /* Couleurs de base */
  --background: ...;        /* Fond principal */
  --foreground: ...;        /* Texte principal */
  --card: ...;             /* Fond des cartes */
  --border: ...;           /* Couleur des bordures */
  
  /* Couleurs sémantiques */
  --primary: ...;          /* Couleur primaire (aperçu drag) */
  --secondary: ...;        /* Couleur secondaire */
  --destructive: ...;      /* Couleur destructive (bouton supprimer) */
  --muted-foreground: ...;  /* Texte atténué */
  
  /* Autres */
  --radius: 8px;           /* Rayon de bordure */
  --spacing: 1rem;         /* Espacement par défaut */
}
```

## Personnalisation du style

### Modifier l'apparence de la grille

```css
.controllers-grid {
  background-color: #f5f5f5;
  border: 2px solid #ddd;
  border-radius: 12px;
}

/* Cellules de la grille */
.show-grid .grid-cell {
  border-color: rgba(0, 0, 0, 0.1);
  border-style: dotted;
}

/* Aperçu du placement */
.grid-item-preview {
  background-color: rgba(59, 130, 246, 0.2);
  border: 2px dashed #3b82f6;
  border-radius: 12px;
}
```

### Modifier l'apparence des items

```css
.grid-item-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.grid-item:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}
```

### Modifier le bouton de suppression

```css
.grid-item-remove {
  width: 28px;
  height: 28px;
  background-color: #ef4444;
  border-radius: 50%;
  top: 8px;
  right: 8px;
}

.grid-item-remove:hover {
  background-color: #dc2626;
  transform: scale(1.1);
}
```

## Configuration recommandée

### Pour un contrôleur MIDI

```vue
<ControllersGrid
  :cell-size="80"
  :gap="8"
  :min-columns="8"
  :show-grid="true"
/>
```

### Pour un dashboard

```vue
<ControllersGrid
  :cell-size="120"
  :gap="16"
  :min-columns="6"
  :show-grid="false"
/>
```

### Pour un layout mobile

```vue
<ControllersGrid
  :cell-size="60"
  :gap="6"
  :min-columns="4"
  :show-grid="true"
/>
```

## Thèmes

### Thème sombre

```css
.controllers-grid[data-theme="dark"] {
  --background: #1a1a1a;
  --foreground: #ffffff;
  --card: #262626;
  --border: #404040;
  --primary: #3b82f6;
  --destructive: #ef4444;
}

.controllers-grid[data-theme="dark"] .grid-cell {
  border-color: rgba(255, 255, 255, 0.1);
}
```

### Thème clair

```css
.controllers-grid[data-theme="light"] {
  --background: #ffffff;
  --foreground: #000000;
  --card: #f5f5f5;
  --border: #e5e5e5;
  --primary: #3b82f6;
  --destructive: #ef4444;
}

.controllers-grid[data-theme="light"] .grid-cell {
  border-color: rgba(0, 0, 0, 0.1);
}
```

## Animations personnalisées

### Animation de placement

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.grid-item {
  animation: slideIn 0.3s ease-out;
}
```

### Animation de l'aperçu

```css
@keyframes breathe {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.02);
  }
}

.grid-item-preview {
  animation: breathe 2s ease-in-out infinite;
}
```

### Animation de suppression

```css
@keyframes fadeOut {
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

.grid-item.removing {
  animation: fadeOut 0.3s ease-out forwards;
}
```

## Configuration avancée

### Grille adaptative selon la résolution

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const cellSize = ref(100)
const gap = ref(12)

const updateGridSize = () => {
  const width = window.innerWidth
  
  if (width < 640) {
    cellSize.value = 60
    gap.value = 6
  } else if (width < 1024) {
    cellSize.value = 80
    gap.value = 8
  } else {
    cellSize.value = 100
    gap.value = 12
  }
}

onMounted(() => {
  updateGridSize()
  window.addEventListener('resize', updateGridSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateGridSize)
})
</script>

<template>
  <ControllersGrid
    :cell-size="cellSize"
    :gap="gap"
  />
</template>
```

### Grille avec zones verrouillées

```vue
<script setup>
const isLocked = (item) => {
  return item.locked === true
}
</script>

<style>
.grid-item[data-locked="true"] {
  cursor: not-allowed;
  opacity: 0.6;
}

.grid-item[data-locked="true"]::after {
  content: "🔒";
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 12px;
}
</style>
```

### Performance optimisée pour grandes grilles

```vue
<script setup>
import { computed } from 'vue'

// Limiter le nombre de cellules visibles
const maxVisibleCells = 1000

const optimizedRows = computed(() => {
  const totalCells = columns.value * rows.value
  if (totalCells > maxVisibleCells) {
    return Math.floor(maxVisibleCells / columns.value)
  }
  return rows.value
})
</script>
```

## Intégration avec d'autres bibliothèques

### Avec VueUse pour les raccourcis clavier

```ts
import { useMagicKeys } from '@vueuse/core'

const { ctrl_z, ctrl_shift_z, delete: del } = useMagicKeys()

watchEffect(() => {
  if (ctrl_z.value) {
    undo()
  }
  if (ctrl_shift_z.value) {
    redo()
  }
  if (del.value && selectedItem.value) {
    removeItem(selectedItem.value.id)
  }
})
```

### Avec Pinia pour la persistance

```ts
import { defineStore } from 'pinia'

export const useGridStore = defineStore('grid', {
  state: () => ({
    items: [] as GridItem[],
    config: {
      cellSize: 100,
      gap: 12,
    }
  }),
  
  actions: {
    saveGrid() {
      localStorage.setItem('grid', JSON.stringify(this.items))
    },
    loadGrid() {
      const data = localStorage.getItem('grid')
      if (data) {
        this.items = JSON.parse(data)
      }
    }
  },
  
  persist: true
})
```

## Exemples de layouts prédéfinis

### Layout DJ

```ts
const djLayout: GridItem[] = [
  { id: 'deck-left', x: 0, y: 0, width: 4, height: 3 },
  { id: 'deck-right', x: 4, y: 0, width: 4, height: 3 },
  { id: 'mixer', x: 2, y: 3, width: 4, height: 2 },
  { id: 'fx-1', x: 0, y: 3, width: 2, height: 1 },
  { id: 'fx-2', x: 6, y: 3, width: 2, height: 1 },
]
```

### Layout Synthétiseur

```ts
const synthLayout: GridItem[] = [
  { id: 'keyboard', x: 0, y: 4, width: 8, height: 2 },
  { id: 'osc-1', x: 0, y: 0, width: 2, height: 2 },
  { id: 'osc-2', x: 2, y: 0, width: 2, height: 2 },
  { id: 'filter', x: 4, y: 0, width: 2, height: 2 },
  { id: 'envelope', x: 6, y: 0, width: 2, height: 2 },
  { id: 'lfo', x: 0, y: 2, width: 2, height: 2 },
  { id: 'effects', x: 2, y: 2, width: 4, height: 2 },
  { id: 'master', x: 6, y: 2, width: 2, height: 2 },
]
```

### Layout Monitoring

```ts
const monitorLayout: GridItem[] = [
  { id: 'cpu', x: 0, y: 0, width: 2, height: 1 },
  { id: 'memory', x: 2, y: 0, width: 2, height: 1 },
  { id: 'disk', x: 4, y: 0, width: 2, height: 1 },
  { id: 'network', x: 0, y: 1, width: 3, height: 2 },
  { id: 'graph', x: 3, y: 1, width: 3, height: 2 },
]
```
