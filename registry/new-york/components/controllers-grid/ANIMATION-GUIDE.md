# Guide de personnalisation des animations

Ce guide vous aide à personnaliser les animations du `ControllersGrid` selon vos besoins.

## 🎯 Animations disponibles

### 1. Animation de placement des items

**Localisation** : `ControllersGrid.vue`, ligne ~410

```vue
<div
  v-for="item in placedItems"
  v-motion
  :initial="{ opacity: 0, scale: 0.8 }"
  :enter="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } }"
>
```

**Personnalisations courantes** :

#### Plus rapide et énergique
```vue
:enter="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 25 } }"
```

#### Plus doux et lent
```vue
:enter="{ opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 150, damping: 15 } }"
```

#### Sans rebond (ease simple)
```vue
:enter="{ opacity: 1, scale: 1, transition: { duration: 300, ease: 'easeOut' } }"
```

#### Avec rotation
```vue
:initial="{ opacity: 0, scale: 0.8, rotate: -10 }"
:enter="{ opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', stiffness: 300, damping: 20 } }"
```

### 2. Animation du preview

**Localisation** : `ControllersGrid.vue`, ligne ~375

```vue
<div
  v-if="hoverCell && (draggedItem || previewSize)"
  class="grid-item-preview"
  v-motion
  :initial="{ opacity: 0, scale: 0.95 }"
  :enter="{ opacity: 1, scale: 1, transition: { duration: 150 } }"
>
```

**Personnalisations** :

#### Apparition instantanée
```vue
:initial="{ opacity: 0 }"
:enter="{ opacity: 1, transition: { duration: 50 } }"
```

#### Avec effet de slide
```vue
:initial="{ opacity: 0, y: -10 }"
:enter="{ opacity: 1, y: 0, transition: { duration: 200 } }"
```

### 3. Animation du bouton de suppression

**Localisation** : `ControllersGrid.vue`, ligne ~540 (CSS)

```css
.grid-item-remove {
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
}

.grid-item:hover .grid-item-remove {
  opacity: 1;
  transform: scale(1);
}
```

**Personnalisations** :

#### Apparition depuis le haut
```css
.grid-item-remove {
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.2s ease;
}

.grid-item:hover .grid-item-remove {
  opacity: 1;
  transform: translateY(0);
}
```

#### Rotation au hover
```css
.grid-item-remove:hover {
  background-color: hsl(var(--destructive) / 0.9);
  transform: scale(1.1) rotate(90deg);
}
```

## 🎨 Exemples avancés

### Animation différente selon la taille de l'item

```vue
<script setup lang="ts">
const getItemAnimation = (item: GridItem) => {
  const isLarge = item.width >= 2 || item.height >= 2;
  
  return {
    initial: { opacity: 0, scale: isLarge ? 0.9 : 0.8 },
    enter: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: isLarge ? 200 : 300,
        damping: isLarge ? 15 : 20,
      },
    },
  };
};
</script>

<template>
  <div
    v-for="item in placedItems"
    v-motion="getItemAnimation(item)"
  >
</template>
```

### Animation avec delay pour effet cascade

```vue
<div
  v-for="(item, index) in placedItems"
  v-motion
  :initial="{ opacity: 0, y: -20 }"
  :enter="{
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 50, // 50ms entre chaque item
      duration: 300,
    },
  }"
>
```

### Animation de sortie lors de la suppression

```vue
<div
  v-for="item in placedItems"
  v-motion
  :initial="{ opacity: 0, scale: 0.8 }"
  :enter="{ opacity: 1, scale: 1 }"
  :leave="{ opacity: 0, scale: 0.5, transition: { duration: 200 } }"
>
```

## 📚 Paramètres de transition

### Type Spring
- `stiffness` : 50-1000 (défaut: 300) - Rigidité du ressort
- `damping` : 1-100 (défaut: 20) - Amortissement
- `mass` : 0.1-10 (défaut: 1) - Masse de l'objet

### Type Duration
- `duration` : millisecondes (défaut: 300)
- `ease` : 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | [bezier]
- `delay` : millisecondes de délai avant l'animation

## 🔧 Désactiver les animations

Si vous voulez désactiver complètement les animations :

```vue
<!-- Retirer les directives v-motion -->
<div
  v-for="item in placedItems"
  :key="item.id"
  class="grid-item"
  <!-- v-motion supprimé -->
>
```

Ou créer une prop :

```vue
<script setup lang="ts">
interface Props {
  enableAnimations?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  enableAnimations: true,
});
</script>

<template>
  <div
    v-for="item in placedItems"
    v-motion="props.enableAnimations ? animationConfig : undefined"
  >
</template>
```

## 🎯 Ressources

- [Documentation @vueuse/motion](https://motion.vueuse.org/)
- [Easing functions](https://easings.net/)
- [Spring physics explained](https://www.joshwcomeau.com/animation/a-friendly-introduction-to-spring-physics/)
