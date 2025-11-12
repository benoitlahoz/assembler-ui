# Refactoring : Virtualisation indépendante

## Changements effectués

### 1. Nouveau composant `LeafletVirtualize`

**Fichier** : `LeafletVirtualize.vue`

Composant standalone de virtualisation qui :
- ✅ Ne dépend PAS de `LeafletFeaturesSelector`
- ✅ Peut être utilisé partout dans l'arbre de composants
- ✅ Filtre les VNodes enfants basé sur leur visibilité
- ✅ Émet des événements pour le monitoring (`update:visible-count`, `bounds-changed`)
- ✅ Support de `alwaysVisible` pour forcer le rendu de certaines features

**API** :
```vue
<LeafletVirtualize
  :enabled="true"
  :margin="0.1"
  :always-visible="[selectedId]"
  @update:visible-count="count => ..."
  @bounds-changed="bounds => ..."
>
  <!-- Features enfants -->
</LeafletVirtualize>
```

### 2. Nettoyage de `LeafletFeaturesSelector`

**Changements** :
- ❌ Supprimé les props `virtualize` et `virtualizeMargin`
- ❌ Supprimé la logique de virtualisation (bounds tracking, filtering)
- ❌ Supprimé les imports `LeafletMapKey`, `LeafletModuleKey`, `onMounted`, `onBeforeUnmount`
- ✅ Retour à l'état d'origine : focus uniquement sur la sélection

**Avant** :
```vue
<LeafletFeaturesSelector
  :virtualize="true"
  :virtualize-margin="0.1"
>
```

**Après** (n'accepte plus ces props) :
```vue
<LeafletFeaturesSelector :enabled="true" :mode="selectionMode">
```

### 3. Mise à jour de `LeafletVirtualizationDemo`

**Changements** :
- Utilise maintenant `LeafletVirtualize` au lieu de props sur `FeaturesSelector`
- Supprimé le mode de sélection (pas nécessaire pour la démo de virtualisation)
- Ajouté compteur de shapes rendues
- Simplifié le code

**Structure** :
```vue
<LeafletMap>
  <LeafletVirtualize
    :enabled="virtualizationEnabled"
    :margin="virtualizationMargin"
    @update:visible-count="visibleShapesCount = $event"
  >
    <LeafletMarker v-for="..." />
    <LeafletCircle v-for="..." />
    <LeafletPolygon v-for="..." />
  </LeafletVirtualize>
</LeafletMap>
```

### 4. Mise à jour de `LeafletEditionDemo`

**Changements** :
- Retiré les props de virtualisation (plus supportées)
- Peut être complétée avec `LeafletVirtualize` si nécessaire

### 5. Documentation mise à jour

**Fichiers** :
- `VIRTUALIZATION.md` : Mise à jour complète avec la nouvelle API
- `LeafletVirtualize.md` : Nouvelle documentation détaillée du composant

**Nouveaux exemples** :
- Utilisation basique
- Utilisation avec sélection
- Toggle dynamique
- Benchmark de performance
- Exemples avancés

### 6. Exports mis à jour

**Fichier** : `index.ts`

```typescript
export { default as LeafletVirtualize } from './LeafletVirtualize.vue';
export type { LeafletVirtualizeProps } from './LeafletVirtualize.vue';
```

## Avantages du refactoring

### Séparation des responsabilités

| Composant | Responsabilité |
|-----------|----------------|
| `LeafletFeaturesSelector` | Sélection, bounding box, transformation, rotation |
| `LeafletVirtualize` | Optimisation du rendu par virtualisation |

### Flexibilité accrue

```vue
<!-- Virtualisation SANS sélection -->
<LeafletVirtualize>
  <LeafletMarker ... />
</LeafletVirtualize>

<!-- Sélection SANS virtualisation -->
<LeafletFeaturesSelector>
  <LeafletMarker ... />
</LeafletFeaturesSelector>

<!-- Les deux combinés -->
<LeafletFeaturesSelector>
  <LeafletVirtualize>
    <LeafletMarker ... />
  </LeafletVirtualize>
</LeafletFeaturesSelector>

<!-- Virtualisation à différents niveaux -->
<LeafletFeaturesEditor>
  <LeafletVirtualize>  <!-- Virtualise tout -->
    <LeafletFeaturesSelector>
      <LeafletMarker ... />
    </LeafletFeaturesSelector>
  </LeafletVirtualize>
</LeafletFeaturesEditor>
```

### API plus claire

**Avant** (couplage) :
```vue
<LeafletFeaturesSelector
  :enabled="true"
  :mode="select"
  :virtualize="true"           <!-- Mélange de concepts -->
  :virtualize-margin="0.1"      <!-- Mélange de concepts -->
>
```

**Après** (séparation) :
```vue
<LeafletFeaturesSelector :enabled="true" :mode="select">
  <LeafletVirtualize :enabled="true" :margin="0.1">
    <!-- Props claires et focalisées -->
  </LeafletVirtualize>
</LeafletFeaturesSelector>
```

### Réutilisabilité

Le composant `LeafletVirtualize` peut maintenant être utilisé :
- Sans sélection
- Sans édition
- Dans d'autres contextes (futurs composants)
- À différents niveaux de l'arbre

### Testabilité

- Tests de virtualisation isolés de la sélection
- Tests de sélection isolés de la virtualisation
- Mocks plus simples
- Moins de dépendances dans chaque test

## Migration

### Pour les utilisateurs existants

Si vous utilisiez la virtualisation via `LeafletFeaturesSelector` :

**Avant** :
```vue
<LeafletFeaturesSelector
  :enabled="true"
  :mode="select"
  :virtualize="true"
  :virtualize-margin="0.15"
>
  <LeafletMarker ... />
</LeafletFeaturesSelector>
```

**Après** :
```vue
<LeafletFeaturesSelector :enabled="true" :mode="select">
  <LeafletVirtualize :enabled="true" :margin="0.15">
    <LeafletMarker ... />
  </LeafletVirtualize>
</LeafletFeaturesSelector>
```

### Nouveaux projets

Utilisez `LeafletVirtualize` dès que vous avez > 1000 shapes :

```vue
<LeafletMap>
  <LeafletVirtualize :enabled="true">
    <!-- Vos milliers de shapes -->
  </LeafletVirtualize>
</LeafletMap>
```

## Statistiques

### Lignes de code

| Fichier | Avant | Après | Δ |
|---------|-------|-------|---|
| `LeafletFeaturesSelector.vue` | 327 | 238 | -89 |
| `LeafletVirtualize.vue` | 0 | 168 | +168 |
| **Total** | 327 | 406 | +79 |

### Complexité

- `LeafletFeaturesSelector` : Simplifié, focus sélection uniquement
- `LeafletVirtualize` : Nouvelle responsabilité claire
- Total : Meilleure séparation des préoccupations

## Conclusion

Ce refactoring améliore significativement :
- ✅ **Modularité** : Composants indépendants
- ✅ **Réutilisabilité** : Virtualisation disponible partout
- ✅ **Clarté** : API plus intuitive
- ✅ **Maintenabilité** : Code mieux organisé
- ✅ **Testabilité** : Tests plus simples
- ✅ **Documentation** : Docs séparées et focalisées
