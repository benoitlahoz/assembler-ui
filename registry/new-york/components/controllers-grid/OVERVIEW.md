# 🎯 ControllersGrid - Vue d'ensemble

## 📁 Structure du composant

```
controllers-grid/
├── ControllersGrid.vue       # Composant principal avec animations
├── index.ts                   # Exports
├── types.ts                   # Types TypeScript + GridUtils
├── composables.ts            # Hooks Vue réutilisables
├── demos/
│   ├── SimpleExample.vue     # ✨ Exemple avec palette drag-drop
│   ├── AdvancedExample.vue   # Exemple avancé
│   └── SampleControllers.vue # Composants de démo
├── README.md                 # Documentation principale
├── CUSTOMIZATION.md          # Guide de personnalisation
├── PROJECT.md                # Contexte du projet
├── ANIMATIONS.md             # 🆕 Documentation des animations
├── ANIMATION-GUIDE.md        # 🆕 Guide de personnalisation animations
└── CHANGELOG.md              # 🆕 Historique des versions
```

## 🚀 Quick Start

### 1. Installation des dépendances

```bash
yarn add @vueuse/core @vueuse/motion
```

### 2. Import du composant

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ControllersGrid } from '@/components/controllers-grid';

const items = ref([]);
</script>

<template>
  <ControllersGrid v-model:items="items" />
</template>
```

### 3. Créer une palette drag-drop

```vue
<script setup lang="ts">
const availableComponents = [
  { id: 'btn', width: 1, height: 1, label: 'Bouton' },
  { id: 'slider', width: 2, height: 1, label: 'Slider' },
];

const handleDragStart = (event: DragEvent, template: any) => {
  const item = {
    id: `${template.id}-${Date.now()}`,
    width: template.width,
    height: template.height,
  };
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('application/json', JSON.stringify(item));
  }
};
</script>

<template>
  <div class="palette">
    <div
      v-for="comp in availableComponents"
      :key="comp.id"
      draggable="true"
      @dragstart="handleDragStart($event, comp)"
    >
      {{ comp.label }}
    </div>
  </div>
  
  <ControllersGrid v-model:items="items" />
</template>
```

## 🎨 Fonctionnalités clés

### ✨ Animations (@vueuse/motion)

```vue
<!-- Placement avec animation spring -->
<div v-motion :initial="{ opacity: 0, scale: 0.8 }" :enter="{ opacity: 1, scale: 1 }">
```

- **Items** : Animation spring élastique au placement
- **Preview** : Apparition douce pendant le drag
- **Bouton suppression** : Micro-interactions scale

→ Voir [ANIMATIONS.md](./ANIMATIONS.md) pour plus de détails

### 📐 Dimensionnement réactif (@vueuse/core)

```typescript
import { useElementSize } from '@vueuse/core';

const { width: gridWidth, height: gridHeight } = useElementSize(gridContainer);
```

- Remplace ResizeObserver manuel
- Performance optimale
- Code plus propre et maintenable

### 🎯 Drag and Drop HTML5

- Drag depuis palette externe (`effectAllowed: 'copy'`)
- Drag au sein de la grille (`effectAllowed: 'move'`)
- Preview visuel temps réel
- Validation anti-chevauchement

## 🔧 Props principales

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `cellSize` | `number` | `80` | Taille d'une cellule en px |
| `gap` | `number` | `8` | Espacement entre cellules |
| `minColumns` | `number` | `4` | Nombre min de colonnes |
| `items` | `GridItem[]` | `[]` | Items placés (v-model) |
| `showGrid` | `boolean` | `true` | Afficher les points de grille |
| `snapToGrid` | `boolean` | `true` | Snap automatique |

## 📤 Events émis

| Event | Payload | Description |
|-------|---------|-------------|
| `update:items` | `GridItem[]` | Items mis à jour |
| `item-placed` | `GridItem` | Nouvel item placé |
| `item-moved` | `GridItem` | Item déplacé |
| `item-removed` | `string` | ID de l'item supprimé |

## 🎓 Exemples d'utilisation

### Basique avec v-model

```vue
<ControllersGrid v-model:items="items" />
```

### Avec configuration personnalisée

```vue
<ControllersGrid
  v-model:items="items"
  :cell-size="120"
  :gap="16"
  :min-columns="8"
  :show-grid="true"
  @item-placed="handlePlaced"
/>
```

### Avec slot pour afficher des infos

```vue
<ControllersGrid v-model:items="items">
  <template #default="{ columns, rows, placedItems }">
    <div class="stats">{{ columns }}×{{ rows }} ({{ placedItems.length }} items)</div>
  </template>
</ControllersGrid>
```

## 🧩 Type GridItem

```typescript
interface GridItem {
  id: string;           // Identifiant unique
  x: number;            // Position X (0-based)
  y: number;            // Position Y (0-based)
  width: number;        // Largeur en cellules
  height: number;       // Hauteur en cellules
  component?: any;      // Composant Vue à rendre
  [key: string]: any;   // Props custom
}
```

## 📚 Documentation complète

- **[README.md](./README.md)** - Documentation principale
- **[ANIMATIONS.md](./ANIMATIONS.md)** - Détails des animations
- **[ANIMATION-GUIDE.md](./ANIMATION-GUIDE.md)** - Personnaliser les animations
- **[CUSTOMIZATION.md](./CUSTOMIZATION.md)** - Guide de personnalisation
- **[PROJECT.md](./PROJECT.md)** - Contexte du projet
- **[CHANGELOG.md](./CHANGELOG.md)** - Historique des versions

## 🎯 Cas d'usage

- 🎛️ Interface de contrôle MIDI/OSC
- 🎨 Builder de dashboard personnalisable
- 🎮 Layout de contrôleurs de jeu
- 📊 Disposition de widgets
- 🎵 Interface DAW/séquenceur
- 🤖 Panneau de contrôle robotique

## 🚦 Prochaines étapes

1. ✅ **Commencer simple** : Testez avec `demos/SimpleExample.vue`
2. 🎨 **Personnaliser** : Ajustez les animations dans `ANIMATION-GUIDE.md`
3. 🔧 **Configurer** : Props et CSS dans `CUSTOMIZATION.md`
4. 🚀 **Déployer** : Intégrez dans votre application

## 💡 Tips

- Utilisez `effectAllowed: 'copy'` pour les palettes externes
- Utilisez `effectAllowed: 'move'` pour les drags internes
- Le preview s'adapte automatiquement à la taille de l'item
- Les animations sont personnalisables via les props v-motion
- La grille est entièrement responsive

## 🐛 Problèmes courants

### Le drag depuis la palette ne fonctionne pas
→ Vérifiez que `effectAllowed: 'copy'` est bien défini

### Le preview ne s'affiche pas
→ Assurez-vous de passer `width` et `height` dans les data

### Les items se chevauchent
→ La validation est automatique, vérifiez la logique de placement

## 📞 Support

- Issues GitHub : [votre-repo/issues]
- Documentation : Consultez les fichiers `.md` du composant
