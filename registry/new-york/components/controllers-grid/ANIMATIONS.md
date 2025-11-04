# Animations du ControllersGrid

Ce composant utilise `@vueuse/motion` pour des animations fluides et naturelles.

## Animations implémentées

### 1. Placement des items (v-motion sur .grid-item)

Quand un item est déposé dans la grille :
- **Initial** : `opacity: 0, scale: 0.8`
- **Enter** : `opacity: 1, scale: 1` avec transition spring
- **Effet** : L'item apparaît avec un effet de zoom élastique

```vue
:initial="{ opacity: 0, scale: 0.8 }"
:enter="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }"
```

### 2. Preview de placement (v-motion sur .grid-item-preview)

Quand vous survolez la grille en draggant :
- **Initial** : `opacity: 0, scale: 0.95`
- **Enter** : `opacity: 1, scale: 1` avec transition de 150ms
- **Effet** : Le preview apparaît en douceur avec un léger zoom

```vue
:initial="{ opacity: 0, scale: 0.95 }"
:enter="{ opacity: 1, scale: 1, transition: { duration: 150 } }"
```

### 3. Bouton de suppression (CSS)

Le bouton "×" pour supprimer un item :
- **Au repos** : `opacity: 0, scale: 0.8`
- **Au hover du parent** : `opacity: 1, scale: 1`
- **Au hover du bouton** : `scale: 1.1`
- **Au clic** : `scale: 0.95`
- **Effet** : Le bouton apparaît et réagit aux interactions

### 4. Animation pulse (CSS @keyframes)

Le preview pulse légèrement pour attirer l'attention :
- **0% et 100%** : `opacity: 0.5`
- **50%** : `opacity: 0.8`
- **Durée** : 1.5s en boucle infinie

## Technologies utilisées

- **@vueuse/motion** : Pour les animations d'entrée/sortie des items
- **CSS transitions** : Pour les micro-interactions (hover, active)
- **CSS @keyframes** : Pour l'animation pulse du preview

## Configuration

Les animations utilisent des paramètres spring pour un effet naturel :
- `stiffness: 300` : Réactivité de l'animation
- `damping: 20` : Amortissement pour un effet élastique

## Personnalisation

Vous pouvez ajuster les paramètres d'animation directement dans le composant :

```vue
<!-- Pour un effet plus rapide -->
:enter="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 25 } }"

<!-- Pour un effet plus doux -->
:enter="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 15 } }"
```
