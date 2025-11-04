````mdc
# Simplification du système de contrôles

## ✅ Changements effectués

### Suppression du dossier `controls/`
- ❌ Supprimé `controls-grid/controls/ButtonControl.vue`
- ❌ Supprimé `controls-grid/controls/index.ts`
- ❌ Supprimé tout le dossier `controls-grid/controls/`

### Utilisation directe de ControlButton

Au lieu d'avoir un composant intermédiaire `ButtonControl.vue`, les contrôles sont maintenant créés directement avec des **render functions** dans `ControlRegistryDemo.vue` :

```typescript
// Créer un composant wrapper pour ControlButton avec icône
const createButtonComponent = (icon: string) => {
  return {
    name: 'GridControlButton',
    props: ['color', 'variant', 'shape'],
    setup(props: any) {
      return () =>
        h(
          ControlButton,
          {
            color: props.color,
            variant: props.variant || 'default',
            shape: props.shape || 'square',
          },
          () => h('span', { class: 'text-lg font-bold' }, icon)
        );
    },
  };
};
```

### Définition des contrôles dans la démo

Les 6 contrôles sont maintenant définis directement dans `ControlRegistryDemo.vue` :

```typescript
const controlDefinitions: ControlDefinition[] = [
  {
    id: 'button-control',
    component: shallowRef(createButtonComponent('▶')),
    defaultProps: { color: '#3b82f6', variant: 'default', shape: 'square' },
    // ...
  },
  // ... autres contrôles
];
```

## 🎨 Amélioration du Drag & Drop avec VueUse

### Migration vers VueUse et @vueuse/motion

Le système de drag and drop a été modernisé pour utiliser les composables VueUse :

#### Composables utilisés
- ✅ `useElementSize` : Taille réactive de la grille
- ✅ `useElementBounding` : Bounds réactifs du conteneur (remplace `getBoundingClientRect()`)
- ✅ `useMouse` : Position de la souris réactive
- ✅ `useMotion` : Animations fluides avec spring physics

#### Système d'intersection amélioré

Au lieu de se baser uniquement sur la position de la souris, le système calcule maintenant l'intersection d'un **rectangle virtuel** avec les cellules de la grille :

```typescript
// Créer un rectangle virtuel centré sur la souris avec les dimensions de l'item
const itemWidth = dragState.value.item.width * (props.cellSize + props.gap) - props.gap;
const itemHeight = dragState.value.item.height * (props.cellSize + props.gap) - props.gap;

const virtualBounds = {
  left: event.clientX - itemWidth / 2,
  top: event.clientY - itemHeight / 2,
  right: event.clientX + itemWidth / 2,
  bottom: event.clientY + itemHeight / 2,
  width: itemWidth,
  height: itemHeight,
};

// Calculer la cellule avec la plus grande intersection
pos = getGridPositionByIntersection(virtualBounds);
```

#### Animations avec @vueuse/motion

Les animations sont maintenant gérées par `@vueuse/motion` avec des variantes prédéfinies :

```typescript
const itemVariants = {
  initial: { scale: 1, opacity: 1 },
  placed: {
    scale: [0.95, 1.05, 1],  // Animation de bounce
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
      duration: 400,
    },
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: { type: 'spring', stiffness: 400, damping: 30 },
  },
  dragging: {
    scale: 1.05,
    opacity: 0.7,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};
```

#### Template avec directives v-motion

```vue
<div
  v-for="item in placedItems"
  v-motion
  :initial="itemVariants.initial"
  @mouseenter="(e) => {
    const motion = useMotion(e.currentTarget, itemVariants);
    motion.apply('hover');
  }"
  @mouseleave="(e) => {
    const motion = useMotion(e.currentTarget, itemVariants);
    motion.apply('initial');
  }"
>
```

### Avantages de cette approche

1. **Plus précis** : L'intersection de l'élément entier détermine la position, pas juste le curseur
2. **Animations fluides** : Spring physics pour des mouvements naturels
3. **Code plus propre** : Pas de manipulation DOM manuelle pour les éléments fantômes
4. **Performances** : Bounds réactifs mis à jour automatiquement
5. **UX améliorée** : 
   - Animation de bounce quand un item est placé
   - Hover avec élévation légère
   - Preview animé lors du drag
   - Feedback visuel pour placements invalides

### Avantages

1. **Moins de fichiers** : Plus besoin d'un dossier `controls/` séparé
2. **Plus simple** : ControlButton est utilisé directement
3. **Plus flexible** : Les wrappers sont créés à la volée selon les besoins
4. **Moins de couches d'abstraction** : Moins de composants intermédiaires
5. **Code plus localisé** : Tout est dans la démo qui l'utilise
6. **Animations natives** : @vueuse/motion pour des transitions fluides
7. **Drag & drop intelligent** : Basé sur l'intersection réelle des éléments

## 📝 Architecture finale

```
registry/new-york/
├── components/
│   ├── control-button/
│   │   ├── ControlButton.vue          # Composant de base
│   │   ├── index.ts
│   │   └── demos/
│   │       ├── ControlButtonDemo.vue  # Wrapper avec template string
│   │       └── PlaygroundDemo.vue
│   └── controls-grid/
│       ├── ControlsGrid.vue           # Avec VueUse et @vueuse/motion
│       ├── index.ts
│       └── demos/
│           ├── ControlRegistryDemo.vue  # Wrapper avec render function
│           ├── SimpleExample.vue
│           └── AdvancedExample.vue
└── composables/
    └── use-control-registry/
        └── index.ts                   # Système d'enregistrement
```

## 🎯 Utilisation

### Dans ControlRegistryDemo

Les contrôles sont créés avec `createButtonComponent()` qui retourne un composant wrapper utilisant `h()` (render function).

### Dans ControlButtonDemo

Les contrôles utilisent un wrapper avec template string pour plus de lisibilité.

Les deux approches sont valides et montrent différentes façons d'utiliser `ControlButton` dans la grille !

## 🚀 Résultat

- ✅ Pas de dossier `controls/` à maintenir
- ✅ ControlButton utilisé directement
- ✅ Système d'enregistrement toujours fonctionnel
- ✅ Deux exemples différents de wrappers (template vs render)
- ✅ Architecture simplifiée et plus claire
- ✅ Drag & drop basé sur l'intersection d'éléments
- ✅ Animations fluides avec spring physics
- ✅ Utilisation optimale de VueUse et @vueuse/motion

````
