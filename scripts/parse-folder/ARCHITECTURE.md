# Architecture du Parsing

Ce document décrit la nouvelle architecture de parsing qui sépare clairement les composants Vue des composables TypeScript.

## Vue d'ensemble

Le système de parsing traite les dossiers de composants/composables et génère des fichiers JSON de description. Le parsing se fait maintenant en **5 étapes distinctes** :

### 1. Parse de `index.ts`
- Extrait les types, interfaces, variants CVA
- Ces informations sont utilisées par les étapes suivantes
- Position finale : **premier fichier** dans le résultat

### 2. Parse des composants Vue (`.vue`)
- Utilise `extractVueSfcComposition` ou `extractVueSfcOptions`
- Extrait props, slots, emits, exposes, etc.
- Injecte les variants de `index.ts` dans les props
- Position finale : **après index.ts**

### 3. Parse des composables (fichiers `.ts` commençant par `use`)
- **NOUVEAU** : utilise `extractComposable`
- Extrait params, return type, types
- Position finale : **après les composants Vue**

### 4. Parse des autres fichiers TS
- Fichiers utilitaires, types, etc.
- Utilise `extractTs` générique
- Position finale : **après les composables**

### 5. Construction finale
- Ordre : `index.ts` → Vue → Composables → Autres TS
- Extraction et consolidation des démos
- Génération du fichier JSON

## Fichiers clés

### `parse-folder/index.ts`
Point d'entrée principal qui orchestre les 5 étapes.

### `parse-folder/parse-composable.ts`
Nouveau parseur dédié aux composables, utilise :
- `composables/params.ts` - extraction des paramètres
- `composables/returns.ts` - extraction du type de retour
- `composables/types.ts` - extraction des types

### `parse-folder/parse-vue-sfc-composition.ts`
Parseur pour les composants Vue en Composition API.

### `parse-folder/parse-vue-sfc-options.ts`
Parseur pour les composants Vue en Options API.

### `parse-folder/ts/extract-ts.ts`
Parseur générique pour les fichiers TypeScript (types, utilitaires).

## Différences clés

| Aspect | Composants Vue | Composables TS |
|--------|---------------|----------------|
| **Identification** | Extension `.vue` | Nom commence par `use` |
| **Parseur** | `extractVueSfcComposition/Options` | `extractComposable` |
| **Données extraites** | props, slots, emits, exposes, etc. | params, returns, types |
| **Nommage** | PascalCase | camelCase |
| **Position** | Après index.ts | Après composants Vue |

## Exemple de structure générée

```json
{
  "name": "screen-share-provider",
  "title": "ScreenShareProvider",
  "files": [
    {
      "name": "index",
      "title": "index",
      "path": "...",
      "doc": { "types": [...], "variants": {...} }
    },
    {
      "name": "ScreenShareProvider",
      "title": "ScreenShareProvider",
      "path": "...",
      "api": "composition",
      "doc": { "props": [...], "slots": [...] }
    },
    {
      "name": "useScreenShare",
      "title": "useScreenShare",
      "path": "...",
      "doc": { "params": [...], "returns": {...}, "types": [...] }
    }
  ]
}
```

## Migration

Cette nouvelle architecture est rétrocompatible. Les fichiers existants continueront de fonctionner, mais les composables bénéficieront maintenant d'un parsing plus précis et structuré.
