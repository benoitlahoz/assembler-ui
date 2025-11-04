# Démos useDragDrop

Ce dossier contient des exemples d'utilisation du composable `useDragDrop` dans différents contextes **en-dehors d'une grille**.

## 📋 Démos disponibles

### 1. KanbanDemo.vue - Tableau Kanban
**Cas d'usage** : Liste de tâches réorganisables entre colonnes (Todo, Doing, Done)

**Fonctionnalités** :
- Drag & drop entre colonnes
- Changement de statut automatique
- Compteur de tâches par colonne
- Interface style Trello/Jira

**Points clés** :
```typescript
unitSize: 60,  // Hauteur approximative d'une tâche
gap: 8,
```

---

### 2. FreeLayoutDemo.vue - Éditeur de Layout Libre
**Cas d'usage** : Canvas libre avec positionnement pixel-perfect (style Figma/Canva)

**Fonctionnalités** :
- Positionnement libre sur canvas
- Ajout/suppression de widgets
- Sélection et mise en avant
- Grid de fond optionnel
- Toolbar avec types de widgets

**Points clés** :
```typescript
unitSize: 1,  // Pixel par pixel
gap: 0,       // Positionnement libre
```

---

### 3. FileListDemo.vue - Explorateur de Fichiers
**Cas d'usage** : Réorganisation d'une liste de fichiers (style Finder/Explorer)

**Fonctionnalités** :
- Réorganisation par drag & drop
- Maintien de l'ordre (property `order`)
- Affichage icônes, taille, type
- Sélection de fichier
- Interface liste structurée

**Points clés** :
```typescript
unitSize: 48,  // Hauteur d'un élément de liste
gap: 4,
```

---

### 4. PaletteCanvasDemo.vue - Palette vers Canvas
**Cas d'usage** : Drag depuis une palette externe vers un canvas (style outils de design)

**Fonctionnalités** :
- Palette de formes/widgets
- Drag depuis palette (création)
- Drag sur canvas (déplacement)
- Détection `fromContainer`
- Double-click pour supprimer
- Prévisualisation en hover

**Points clés** :
```typescript
// Depuis palette
startDrag(event, item, false)  // fromContainer = false

// Depuis canvas
startDrag(event, item, true)   // fromContainer = true
```

---

### 5. TimelineDemo.vue - Planificateur Horaire
**Cas d'usage** : Calendrier/timeline avec slots horaires

**Fonctionnalités** :
- Grille horaire (6 AM - 10 PM)
- Événements avec durée variable
- Snap to 15 minutes (0.25h)
- Validation heures de travail (8h-18h)
- Formatage heures AM/PM
- Types d'événements (meeting, task, break, personal)

**Points clés** :
```typescript
unitSize: 80,  // pixels par heure
gap: 0,
validatePlacement: (x, y, width, height) => {
  return y >= 8 && y + height <= 18;  // Heures de travail
}
```

---

## 🎯 Caractéristiques communes

Toutes les démos utilisent les features de `useDragDrop` :

✅ **Offset précis** : Grâce à `dragOffset`, l'élément suit le curseur naturellement  
✅ **État de drag** : `dragState` pour feedback visuel  
✅ **Validation** : `validatePlacement` pour règles métier  
✅ **fromContainer** : Distinction entre création et déplacement  
✅ **Hover preview** : Feedback visuel pendant le drag  

## 🚀 Comment utiliser ces démos

### Installation
```bash
npx shadcn-vue@latest add use-drag-drop
```

### Intégration
```vue
<script setup lang="ts">
// Importer la démo souhaitée
import KanbanDemo from '@/composables/use-drag-drop/demos/KanbanDemo.vue';
</script>

<template>
  <KanbanDemo />
</template>
```

## 📚 Points d'apprentissage

### 1. Positionnement flexible
Le `unitSize` s'adapte au contexte :
- `1px` pour canvas libre
- `48px` pour liste d'items
- `60px` pour cards
- `80px` pour timeline horaire

### 2. Calcul de position
Chaque démo implémente sa propre logique dans `getPosition` :
```typescript
handleDragOver(event, bounds, (virtualBounds) => {
  // Logique personnalisée selon le contexte
  return { x, y };
});
```

### 3. Validation contextuelle
`validatePlacement` adapté aux règles métier :
- Timeline : heures de travail uniquement
- Grid : collision detection
- Canvas libre : aucune restriction

### 4. fromContainer
Distinction cruciale entre :
- Création (depuis palette) : `fromContainer = false`
- Déplacement (dans conteneur) : `fromContainer = true`

## 🎨 Styling

Toutes les démos utilisent Tailwind CSS et montrent :
- États hover/active
- Transitions fluides
- Feedback visuel (opacity, scale, ring)
- Indicateurs de validation (couleurs)

## 🔧 Extensibilité

Chaque démo peut être étendue avec :
- Persistance (localStorage, API)
- Undo/Redo
- Raccourcis clavier
- Multi-sélection
- Groupement
- Snap to grid personnalisé
