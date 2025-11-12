# Virtualisation des Shapes Leaflet

## Vue d'ensemble

Le composant `LeafletVirtualize` permet d'afficher efficacement des milliers de shapes sur une carte Leaflet en ne rendant que les éléments visibles dans la viewport actuelle de la carte (+ une marge configurable).

## Fonctionnement

### Architecture

La virtualisation est implémentée via un composant **indépendant** (`LeafletVirtualize`) qui peut être utilisé avec ou sans `LeafletFeaturesSelector`. Il agit comme un wrapper de virtualisation qui filtre les VNodes enfants.

### Mécanisme

1. **Tracking des bounds visibles**
   - Le composant écoute les événements `moveend` et `zoomend` de la map
   - Les bounds visibles sont calculées et stockées
   - Une marge configurable (`margin`) est ajoutée pour le pré-chargement

2. **Filtrage des VNodes**
   - Lors du rendu, les VNodes enfants du slot sont filtrés
   - Seules les features dont les bounds intersectent avec les bounds visibles sont rendues
   - Les features dans la liste `alwaysVisible` sont toujours rendues

3. **Réactivité**
   - Quand l'utilisateur déplace/zoom la carte, les bounds visibles changent
   - Le filtrage se met à jour automatiquement
   - Les nouvelles features entrent dans la viewport, les anciennes en sortent

## Utilisation

### Exemple basique

```vue
<LeafletMap ...>
  <LeafletVirtualize :enabled="true" :margin="0.1">
    <LeafletMarker
      v-for="marker in markers"
      :key="marker.id"
      :id="marker.id"
      v-model:lat="marker.lat"
      v-model:lng="marker.lng"
    />
    <LeafletCircle
      v-for="circle in circles"
      :key="circle.id"
      :id="circle.id"
      ...
    />
  </LeafletVirtualize>
</LeafletMap>
```

### Utilisation avec FeaturesSelector (édition + virtualisation)

```vue
<LeafletMap ...>
  <LeafletFeaturesEditor :enabled="editMode" :mode="currentMode">
    <LeafletFeaturesSelector :enabled="isSelectMode" :mode="selectionMode">
      <LeafletVirtualize :enabled="true" :margin="0.1" :always-visible="selectedIds">
        <!-- Vos shapes ici -->
        <LeafletMarker v-for="marker in markers" :id="marker.id" ... />
      </LeafletVirtualize>
    </LeafletFeaturesSelector>
  </LeafletFeaturesEditor>
</LeafletMap>
```

### Props

- **`enabled`** (boolean, défaut: `true`)
  - Active/désactive la virtualisation
  - Quand `false`, tous les enfants sont rendus normalement

- **`margin`** (number, défaut: `0.1`)
  - Marge en degrés ajoutée aux bounds visibles
  - Permet de pré-charger les features juste hors de la viewport
  - 0.1° ≈ 11km à l'équateur
  - Plus la marge est grande, plus de features sont pré-chargées (moins de "pop-in" mais plus de shapes rendues)

- **`alwaysVisible`** (Array<string | number>, défaut: `[]`)
  - Liste des IDs de features qui doivent toujours être rendues
  - Utile pour les features sélectionnées ou des landmarks importants
  - Exemple: `:always-visible="[selectedFeatureId]"`

### Events

- **`@update:visible-count`** (number)
  - Émis quand le nombre de features visibles change
  - Permet d'afficher des statistiques de rendu
  
  ```vue
  <LeafletVirtualize @update:visible-count="visibleCount = $event">
  ```

- **`@bounds-changed`** (LatLngBounds)
  - Émis quand les bounds visibles changent
  - Permet de réagir aux changements de viewport
  
  ```vue
  <LeafletVirtualize @bounds-changed="handleBoundsChange">
  ```

## Performance

### Avantages

- **Rendu initial ultra rapide** : Seules les features visibles sont créées
- **Navigation fluide** : Moins de layers Leaflet = meilleur FPS lors du zoom/déplacement
- **Scalabilité** : Peut gérer des dizaines de milliers de shapes sans problème
- **Mémoire optimisée** : Moins de layers DOM = moins de mémoire utilisée
- **Composant indépendant** : Peut être utilisé avec n'importe quel setup (avec ou sans FeaturesSelector)

### Cas d'usage

**Utiliser la virtualisation quand :**
- Vous avez > 1000 shapes sur la carte
- Les shapes couvrent une grande zone géographique
- La performance est critique (mobile, etc.)
- Les utilisateurs zooment/déplacent fréquemment

**Ne pas utiliser la virtualisation quand :**
- Vous avez < 100 shapes
- Toutes les shapes sont visibles en même temps
- Vous devez interagir avec toutes les shapes en même temps

## Démonstration

Voir `LeafletVirtualizationDemo.vue` pour une démo complète avec :
- 8000 shapes (5000 markers, 2000 circles, 1000 polygons)
- Toggle virtualisation ON/OFF
- Ajustement de la marge en temps réel
- Compteur FPS et statistiques de rendu

## Implémentation technique

### Code clé du composant LeafletVirtualize

```typescript
// Tracking des bounds
const updateVisibleBounds = () => {
  if (!map.value || !L.value) return;
  const bounds = map.value.getBounds();
  
  if (props.enabled && props.margin > 0) {
    const margin = props.margin;
    const extendedBounds = L.value.latLngBounds(
      L.value.latLng(bounds.getSouth() - margin, bounds.getWest() - margin),
      L.value.latLng(bounds.getNorth() + margin, bounds.getEast() + margin)
    );
    visibleBounds.value = extendedBounds;
  } else {
    visibleBounds.value = bounds;
  }
  
  emit('bounds-changed', visibleBounds.value);
};

// Vérification de visibilité
const isFeatureVisible = (featureId: string | number): boolean => {
  if (!props.enabled) return true;
  if (!visibleBounds.value) return true;
  if (props.alwaysVisible.includes(featureId)) return true;
  
  const getBounds = featuresRegistry.value.get(featureId);
  if (!getBounds) return true;
  
  const featureBounds = getBounds();
  if (!featureBounds) return true;
  
  return visibleBounds.value.intersects(featureBounds);
};

// Filtrage des VNodes
const filterVisibleSlotChildren = (children: VNode[] | undefined): VNode[] => {
  if (!props.enabled || !children) return children || [];
  
  let visibleCount = 0;
  const filtered = children.filter((vnode) => {
    const featureId = vnode.props?.id;
    if (featureId === undefined) {
      visibleCount++;
      return true;
    }
    
    const visible = isFeatureVisible(featureId);
    if (visible) visibleCount++;
    return visible;
  });
  
  emit('update:visible-count', visibleCount);
  return filtered;
};
```

### Points clés

1. **Composant indépendant** : `LeafletVirtualize` ne dépend d'aucun autre composant de logique métier
2. **API simple** : Props claires et events pour le monitoring
3. **Opt-in** : La virtualisation peut être désactivée facilement
4. **Flexible** : Fonctionne avec ou sans sélection/édition
5. **Aucun impact sur les shapes** : Les composants individuels ne sont pas modifiés

## Limitations

- Les features doivent avoir un `id` unique pour être virtualisables
- Les features sans bounds (ou avec bounds null) sont toujours rendues
- Le premier rendu peut montrer toutes les features brièvement (le temps que le registre se peuple)

## Améliorations futures possibles

- [ ] Cache des bounds pour éviter de les recalculer à chaque filtrage
- [ ] Support du clustering automatique pour les zones denses
- [ ] Virtualisation adaptive basée sur le niveau de zoom
- [ ] Option de lazy-loading des données (fetch on demand)
