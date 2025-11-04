# ControllersGrid - Structure du projet

## 📁 Fichiers créés

```
controllers-grid/
├── ControllersGrid.vue         # Composant principal
├── index.ts                    # Point d'entrée pour les imports
├── types.ts                    # Types TypeScript et utilitaires
├── composables.ts              # Composables réutilisables
├── example.vue                 # Exemple d'utilisation basique
├── advanced-example.vue        # Exemple avancé avec toutes les fonctionnalités
├── grid.test.ts               # Tests unitaires
├── README.md                   # Documentation principale
└── CUSTOMIZATION.md           # Guide de personnalisation
```

## 🚀 Démarrage rapide

### 1. Import simple

```vue
<script setup>
import { ControllersGrid } from './controllers-grid'
import { ref } from 'vue'

const items = ref([])
</script>

<template>
  <ControllersGrid v-model:items="items" />
</template>
```

### 2. Avec composables

```vue
<script setup>
import { ControllersGrid, useControllersGrid } from './controllers-grid'

const { items, addItem, removeItem, undo, redo } = useControllersGrid()
</script>

<template>
  <ControllersGrid v-model:items="items" />
</template>
```

### 3. Exemple complet

Voir `example.vue` et `advanced-example.vue` pour des exemples complets.

## 📚 Documentation

### [README.md](./README.md)
- Fonctionnalités principales
- Props, événements, méthodes
- Exemples d'utilisation
- Types TypeScript

### [CUSTOMIZATION.md](./CUSTOMIZATION.md)
- Variables CSS
- Thèmes
- Animations personnalisées
- Layouts prédéfinis
- Intégrations

## 🎯 Fonctionnalités implémentées

### ✅ Core
- [x] Grille responsive basée sur la taille du conteneur
- [x] Drag & Drop natif HTML5
- [x] Support multi-tailles (1x1, 2x1, 1x2, 2x2, etc.)
- [x] Validation de placement (pas de chevauchement)
- [x] Aperçu visuel pendant le drag
- [x] Suppression d'items
- [x] Événements complets

### ✅ API
- [x] Props configurables
- [x] Événements (placed, moved, removed, update:items)
- [x] Méthodes exposées (addItem, removeItem, clearGrid)
- [x] Types TypeScript complets

### ✅ Composables
- [x] `useControllersGrid` - Gestion d'état avec historique
- [x] `useComponentPalette` - Gestion de templates
- [x] `useGridConfig` - Configuration de la grille

### ✅ Utilitaires
- [x] GridUtils - Fonctions utilitaires
- [x] Conversion pixel ↔ grille
- [x] Détection de chevauchements
- [x] Tri et recherche d'items
- [x] Génération d'IDs uniques

### ✅ Fonctionnalités avancées
- [x] Historique Undo/Redo
- [x] Sauvegarde/Chargement localStorage
- [x] Export/Import JSON
- [x] Sélection d'items
- [x] Duplication
- [x] Raccourcis clavier

## 🎨 Personnalisation

Le composant est hautement personnalisable via :

1. **Props** : `cellSize`, `gap`, `minColumns`, `showGrid`
2. **CSS Variables** : Toutes les couleurs et espacements
3. **Slots** : Contenu personnalisé
4. **Composables** : Logique réutilisable
5. **Events** : Intégration complète

## 📦 Dépendances

Le composant n'a **aucune dépendance externe** ! Il utilise uniquement :
- Vue 3 (Composition API)
- TypeScript (optionnel)
- CSS moderne (Grid, Flexbox)

## 🧪 Tests

Des tests unitaires sont fournis dans `grid.test.ts` pour :
- Utilitaires de conversion
- Détection de chevauchements
- Validation d'items
- Tri et recherche

Pour lancer les tests (nécessite vitest) :
```bash
npm run test
```

## 💡 Suggestions d'amélioration futures

### Phase 2 - Interactions
- [ ] Redimensionnement des items (poignées de resize)
- [ ] Rotation des items
- [ ] Snap magnétique amélioré
- [ ] Multi-sélection (Ctrl+click)
- [ ] Copier/Coller (Ctrl+C/V)

### Phase 3 - Organisation
- [ ] Groupes d'items
- [ ] Layers (z-index)
- [ ] Verrouillage d'items
- [ ] Grille adaptative intelligente
- [ ] Templates sauvegardables

### Phase 4 - Collaboration
- [ ] Synchronisation temps réel
- [ ] Curseurs multi-utilisateurs
- [ ] Commentaires sur items
- [ ] Historique collaboratif

### Phase 5 - Export
- [ ] Export PNG/SVG
- [ ] Export code (JSON, YAML)
- [ ] Presets et bibliothèque
- [ ] API REST pour sauvegardes

## 🎓 Exemples d'utilisation

### Contrôleur MIDI
```ts
const midiController = [
  { id: 'pad-1', x: 0, y: 0, width: 1, height: 1, type: 'pad' },
  { id: 'fader-1', x: 1, y: 0, width: 1, height: 2, type: 'fader' },
  // ...
]
```

### Dashboard IoT
```ts
const dashboard = [
  { id: 'temp', x: 0, y: 0, width: 2, height: 1, sensor: 'temperature' },
  { id: 'humid', x: 2, y: 0, width: 2, height: 1, sensor: 'humidity' },
  // ...
]
```

### Layout Builder
```ts
const pageLayout = [
  { id: 'header', x: 0, y: 0, width: 4, height: 1, component: 'Header' },
  { id: 'sidebar', x: 0, y: 1, width: 1, height: 3, component: 'Sidebar' },
  { id: 'main', x: 1, y: 1, width: 3, height: 3, component: 'Main' },
  // ...
]
```

## 🤝 Contribution

Pour ajouter de nouvelles fonctionnalités :

1. Créer une nouvelle branche
2. Implémenter la fonctionnalité
3. Ajouter des tests
4. Mettre à jour la documentation
5. Créer une PR

## 📄 Licence

MIT

## 👨‍💻 Auteur

Créé pour assembler-ui

---

**Note** : Ce composant a été conçu pour être flexible et extensible. N'hésitez pas à l'adapter à vos besoins spécifiques !
