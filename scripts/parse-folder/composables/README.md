# Composables Parsing

Ce dossier contient les utilitaires pour parser les composables TypeScript (fonctions `use*`).

## Structure

- **`params.ts`** : Extraction des paramètres des fonctions composables
- **`returns.ts`** : Extraction du type de retour des composables
- **`types.ts`** : Extraction des types, interfaces et enums

## Fonctionnement

Les composables sont identifiés comme des fichiers TypeScript dont le nom commence par `use` (convention Vue/Nuxt).

### Extraction des paramètres

La fonction `extractParams` analyse l'AST TypeScript pour extraire :
- Le nom du paramètre
- Son type
- Sa valeur par défaut (si présente)
- La description JSDoc associée

### Extraction du type de retour

La fonction `extractReturns` extrait :
- Le type de retour annoté
- La description du tag `@returns` ou `@return` dans la JSDoc

### Extraction des types

La fonction `extractComposableTypes` extrait tous les types, interfaces et enums définis dans le fichier composable.

## Utilisation

Ces utilitaires sont appelés par `parse-composable.ts` qui orchestre l'extraction complète d'un composable.
