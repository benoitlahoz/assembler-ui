# Démos LeafletMap

Ce dossier contient les démonstrations des composants Leaflet.

## Structure

### Fichiers de démo

- **`LeafletSimple.vue`** : Démo basique d'utilisation de la carte
- **`LeafletEditionDemo.vue`** : Démo complète avec édition, sélection, et transformations
- **`LeafletVirtualizationDemo.vue`** : Démo de performance avec 8000 shapes virtualisées

### Fichiers de données

- **`virtualization-demo-data.ts`** : Données pré-générées pour la démo de virtualisation (813 KB)
  - 5000 markers
  - 2000 circles
  - 1000 polygons
  - Zone : autour de Paris (48.8566, 2.3522)
  - **Pré-calculées** : Les données sont déjà générées dans le fichier

- **`generate-demo-data.mjs`** : Script de génération des données
  - Utilise Node.js (pas de dépendances)
  - Génère aléatoirement 8000 shapes
  - Sortie au format TypeScript

## Virtualisation Demo

La démo de virtualisation utilise des données **pré-générées et statiques** stockées directement dans `virtualization-demo-data.ts`. Cela évite de bloquer l'UI lors du chargement et garantit des performances optimales.

### Pourquoi des données pré-générées ?

1. **Performance** : Chargement instantané (pas de calcul au runtime)
2. **Cohérence** : Mêmes données à chaque fois
3. **Simplicité** : Code de démo minimal
4. **Réalisme** : Représente un cas d'usage réel (données depuis une API/DB)

### Régénérer les données

Si vous souhaitez régénérer les données avec de nouvelles valeurs aléatoires :

```bash
# Depuis le dossier demos/
node generate-demo-data.mjs > virtualization-demo-data.ts
```

Le script génère :
- 5000 markers avec positions aléatoires
- 2000 circles avec positions et rayons aléatoires
- 1000 polygons rectangulaires avec tailles variables

Toutes les shapes sont distribuées aléatoirement dans un rayon de ~55km autour de Paris.

## Utilisation des démos

### Development

Les démos sont automatiquement détectées par le système de documentation et affichées dans l'interface.

### Intégration dans vos projets

Vous pouvez vous inspirer de ces démos pour intégrer les composants Leaflet dans vos propres projets :

```vue
<script setup lang="ts">
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletVirtualize,
  LeafletMarker,
} from '~~/registry/new-york/components/leaflet-map';

// Vos données
const myMarkers = [...];
</script>

<template>
  <LeafletMap>
    <LeafletTileLayer ... />
    <LeafletVirtualize :enabled="myMarkers.length > 1000">
      <LeafletMarker v-for="m in myMarkers" :id="m.id" ... />
    </LeafletVirtualize>
  </LeafletMap>
</template>
```

## Notes de performance

### Virtualisation

| Nombre de shapes | Sans virtualisation | Avec virtualisation |
|------------------|---------------------|---------------------|
| < 100 | Pas nécessaire | Pas nécessaire |
| 100-1000 | Recommandé | Recommandé |
| > 1000 | **Requis** | Fluide |

La virtualisation est **fortement recommandée** dès que vous avez plus de 1000 shapes sur votre carte.

### FPS typiques

- **Avec virtualisation** : 60 FPS constant (même avec 10,000+ shapes)
- **Sans virtualisation** : 
  - 1000 shapes : ~30 FPS
  - 5000 shapes : ~10 FPS
  - 8000+ shapes : ~3 FPS (quasi inutilisable)

## Voir aussi

- [LeafletVirtualize.md](../LeafletVirtualize.md) - Documentation du composant de virtualisation
- [VIRTUALIZATION.md](../VIRTUALIZATION.md) - Guide technique complet
