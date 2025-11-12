# Plan d'intégration de la sélection dans les shapes

## Objectif
Intégrer la logique de sélection et transformation directement dans les composants de shapes (Marker, Circle, Polyline, Polygon, Rectangle) tout en préservant l'utilisation des slots pour la customisation de la bounding box.

## Architecture

### Système de contexte (provide/inject)
- ✅ **Fichier** : `LeafletSelectionManager.vue`
- ✅ **Contenu** :
  - Tous les types exportés : `LeafletSelectionContext`, `SelectedFeature`, `FeatureReference`
  - `LeafletSelectionKey` : InjectionKey pour provide/inject
  - `useLeafletSelection()` : Hook pour injecter le contexte
  - Le composant `LeafletSelectionManager` avec slots
  - Gestion du registre des features
  - Calcul automatique de la bounding box
  - Gestion de la sélection et des transformations

### Prochaines étapes

#### ✅ Étape 1 : Créer LeafletSelectionManager
- [x] Composant `LeafletSelectionManager.vue` qui crée le contexte
- [x] Tous les types dans le même fichier
- [x] Fournit le contexte via provide/inject
- [x] Affiche la `LeafletBoundingBox` avec le système de slots
- [x] Gère les transformations et rotations
- [x] Trois slots : `default`, `bounding-box`, `bounding-box-styles`
- [x] Export de `useLeafletSelection()` depuis le composant

#### ✅ Étape 2 : Intégrer dans LeafletMarker
- [x] Ajouter prop `selectable?: boolean`
- [x] Ajouter prop `id?: string | number`
- [x] Injecter le contexte de sélection
- [x] S'enregistrer automatiquement dans le registre si `selectable`
- [x] Appeler `selectFeature` au click/dragstart
- [x] Implémenter `FeatureReference` (getBounds, applyTransform)

#### ✅ Étape 3 : Intégrer dans les autres shapes
- [x] LeafletCircle
- [x] LeafletPolyline  
- [x] LeafletPolygon
- [x] LeafletRectangle
- [x] Démo complète `LeafletSelectionDemo.vue` avec tous les types

#### Étape 4 : Simplifier la démo complète
- [ ] Utiliser `LeafletSelectionManager` dans LeafletEditionDemo
- [ ] Supprimer toute la logique manuelle de sélection
- [ ] Ajouter simplement `selectable` sur les shapes
- [ ] Préserver les slots de customisation

## Avantages de cette approche

1. **Opt-in** : Les shapes ne sont sélectionnables que si `selectable="true"`
2. **Découplé** : Pas besoin de wrappers, logique optionnelle dans les composants de base
3. **Slots préservés** : Les slots de customisation de la bounding box fonctionnent exactement comme avant
4. **Progressif** : Peut être intégré shape par shape
5. **Rétro-compatible** : Les shapes existantes fonctionnent sans changement

## État actuel

✅ Contexte de sélection créé
⏳ Integration dans les shapes en cours
