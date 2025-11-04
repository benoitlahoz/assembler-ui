# Démos useDragDrop

Ce dossier contient des exemples d'utilisation du composable `useDragDrop` dans différents contextes **en-dehors d'une grille**, démontrant à la fois le **mode grille** et le **mode adaptatif**.

## 📋 Démos disponibles

### 1. KanbanDemo.vue - Tableau Kanban
**Mode** : Adaptatif (sans unitSize)  
**Cas d'usage** : Liste de tâches réorganisables entre colonnes (Todo, Doing, Done)

**Fonctionnalités** :
- Drag & drop entre colonnes
- Changement de statut automatique
- Compteur de tâches par colonne
- Interface style Trello/Jira

**Points clés** :
```typescript
// Mode adaptatif
useDragDrop({
  gap: 8,
  // unitSize non défini
});
```

---

### 2. FreeLayoutDemo.vue - Éditeur de Layout Libre
**Mode** : Adaptatif (sans unitSize)  
**Cas d'usage** : Canvas libre avec positionnement pixel-perfect (style Figma/Canva)

**Fonctionnalités** :
- Positionnement libre sur canvas
- Ajout/suppression de widgets
- Sélection et mise en avant
- Grid de fond optionnel
- Toolbar avec types de widgets

**Points clés** :
```typescript
// Mode adaptatif - positionnement libre
useDragDrop({
  gap: 0,
  // width et height en pixels directement
});
```

---

### 3. FileListDemo.vue - Explorateur de Fichiers
**Mode** : Grille (avec unitSize)  
**Cas d'usage** : Réorganisation d'une liste de fichiers (style Finder/Explorer)

**Fonctionnalités** :
- Réorganisation par drag & drop
- Maintien de l'ordre (property `order`)
- Affichage icônes, taille, type
- Sélection de fichier
- Interface liste structurée

**Points clés** :
```typescript
// Mode grille
useDragDrop({
  unitSize: 48,  // Hauteur d'un élément de liste
  gap: 4,
});
```

---

### 4. PaletteCanvasDemo.vue - Palette vers Canvas
**Mode** : Grille (avec unitSize)  
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
// Mode grille avec snap
useDragDrop({
  unitSize: 80,
  gap: 0,
});

// Depuis palette
startDrag(event, item, false)  // fromContainer = false

// Depuis canvas
startDrag(event, item, true)   // fromContainer = true
```

---

### 5. TimelineDemo.vue - Planificateur Horaire
**Mode** : Grille (avec unitSize)  
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
// Mode grille horaire
useDragDrop({
  unitSize: 80,  // pixels par heure
  gap: 0,
  validatePlacement: (x, y, width, height) => {
    return y >= 8 && y + height <= 18;  // Heures de travail
  }
});
```

---

### 6. AdaptiveModeDemo.vue - Mode Adaptatif ✨ NOUVEAU
**Mode** : Adaptatif (sans unitSize)  
**Cas d'usage** : Notes/cartes avec dimensions variables et libres

**Fonctionnalités** :
- Positionnement libre pixel-perfect
- Chaque carte a sa propre taille
- Redimensionnement dynamique
- Pas de contrainte de grille
- Interface style notes post-it

**Points clés** :
```typescript
// Mode adaptatif pur
useDragDrop({
  gap: 0,
  // unitSize NON DÉFINI
});

// width et height en pixels
startDrag(event, {
  id: 'card-1',
  width: 250,   // pixels directement
  height: 150,  // pixels directement
}, true);
```

---

## 🎯 Caractéristiques communes

Toutes les démos utilisent les features de `useDragDrop` :

✅ **Offset précis** : Grâce à `dragOffset`, l'élément suit le curseur naturellement  
✅ **État de drag** : `dragState` pour feedback visuel  
✅ **Validation** : `validatePlacement` pour règles métier  
✅ **fromContainer** : Distinction entre création et déplacement  
✅ **Hover preview** : Feedback visuel pendant le drag  
✨ **Mode adaptatif** : Fonctionne avec ou sans `unitSize`  

## ⚡ Modes de fonctionnement

### Mode Grille (avec unitSize)

Utilisé dans : FileListDemo, PaletteCanvasDemo, TimelineDemo

```typescript
useDragDrop({
  unitSize: 80,  // Taille d'une unité
  gap: 8,
});

// width et height en unités
startDrag(event, { 
  width: 2,   // 2 unités
  height: 3   // 3 unités
});
```

**Avantages** :
- Alignement automatique sur grille
- Calculs simplifiés pour layouts structurés
- Snap naturel aux cellules

### Mode Adaptatif (sans unitSize)

Utilisé dans : KanbanDemo, FreeLayoutDemo, AdaptiveModeDemo

```typescript
useDragDrop({
  gap: 0,
  // unitSize non défini
});

// width et height en pixels directement
startDrag(event, { 
  width: 250,   // 250px
  height: 150   // 150px
});
```

**Avantages** :
- Positionnement libre
- Chaque item peut avoir sa propre taille
- Pas de contrainte de grille
- Idéal pour interfaces fluides

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

### 1. Choix du mode

**Utiliser le mode grille** (`unitSize` défini) quand :
- Layout structuré avec cellules de taille fixe
- Alignement sur grille nécessaire
- Système de coordonnées basé sur unités (colonnes/lignes)
- Exemple : Dashboard, Timeline, Grille de contrôles

**Utiliser le mode adaptatif** (`unitSize` non défini) quand :
- Positionnement libre pixel-perfect
- Chaque élément a sa propre taille
- Pas de contrainte de grille
- Exemple : Canvas libre, Notes, Cartes

### 2. Positionnement flexible

En **mode grille** :
```typescript
const unitSize = 80;
const gap = 8;

// width: 2 unités → 2 × (80 + 8) - 8 = 168px
// height: 3 unités → 3 × (80 + 8) - 8 = 256px
```

En **mode adaptatif** :
```typescript
// width: 250 → 250px directement
// height: 150 → 150px directement
```

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
