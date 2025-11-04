# Changelog

Toutes les modifications notables de ce composant seront documentées ici.

## [2.0.0] - 2025-11-04

### ✨ Améliorations majeures

#### Intégration VueUse
- **@vueuse/core** : Remplacé le ResizeObserver manuel par `useElementSize`
- **@vueuse/motion** : Ajout d'animations fluides et naturelles
- Meilleure performance et maintenabilité du code

#### Animations
- ✨ Animation spring sur le placement des items (scale + opacity)
  - Effet de zoom élastique naturel
  - Paramètres : `stiffness: 300, damping: 20`
- 🎯 Animation du preview pendant le drag
  - Apparition douce en 150ms
  - Scale subtle pour attirer l'attention
- 🔘 Micro-interactions sur le bouton de suppression
  - Scale au hover (1.1x)
  - Scale au clic (0.95x)
  - Transition fluide de 200ms

#### Optimisations CSS
- Amélioré les transitions du bouton de suppression
- Ajout du state `:active` pour feedback tactile
- Variables CSS mieux organisées

### 📝 Documentation
- Nouveau fichier `ANIMATIONS.md` détaillant toutes les animations
- README mis à jour avec section animations
- Exemples de personnalisation des animations

### 🔧 Technique
- Import de `useMotion` depuis `@vueuse/motion`
- Import de `useElementSize` depuis `@vueuse/core`
- Ajout des directives `v-motion` sur les éléments animés
- Conservation de l'implémentation HTML5 Drag and Drop (performante)

---

## [1.0.0] - 2025-11-03

### 🎉 Version initiale

#### Fonctionnalités
- ✅ Drag and drop HTML5 natif
- ✅ Grille responsive avec ResizeObserver
- ✅ Validation de placement (anti-chevauchement)
- ✅ Preview visuel pendant le drag
- ✅ Support multi-tailles (1x1, 2x1, 2x2, etc.)
- ✅ Suppression d'items
- ✅ TypeScript complet

#### Visuel
- Points de grille aux coins uniquement (design minimaliste)
- Preview avec bordure dashed et animation pulse CSS
- Bouton de suppression avec transition opacity

#### Structure
- Composable `useControllersGrid` pour la logique
- Composable `useComponentPalette` pour la palette
- Types dans `types.ts`
- Demos complètes (Simple, Advanced, SampleControllers)
- Documentation complète (README, CUSTOMIZATION, PROJECT)

#### Bugs résolus
- ❌ Drag depuis palette externe ne fonctionnait pas
  - Solution : Ajout de `previewSize` ref pour les drags externes
  - Solution : Gestion séparée de `effectAllowed` (copy vs move)
- ❌ Grille interférait avec le drag
  - Solution : Aplatissement de la structure des cellules
  - Solution : `pointer-events: none` sur les cellules
- ❌ Preview ne s'affichait pas pour les drags externes
  - Solution : Détection de `effectAllowed === 'copy'`
- ❌ `getData()` ne fonctionnait pas dans `dragover`
  - Solution : Utilisation uniquement dans l'événement `drop`
