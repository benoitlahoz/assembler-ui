---
title: AnimationBounce
description: Un composant pour animer un élément avec un effet bounce façon dock macOS.
---

::ComponentLoader{label="Preview" componentName="AnimationBounceDemo" type="examples"}
::

## Installation via CLI

::InstallationCli{componentId="animation-bounce"}
::

## Installation manuelle

Copiez et collez le code suivant dans le même dossier :

::code-group

:CodeViewerTab{filename="AnimationBounce.vue" language="vue" componentName="AnimationBounce" type="ui" id="animation-bounce"}
:CodeViewerTab{filename="index.ts" language="ts" componentName="index" extension="ts" type="ui" id="animation-bounce"}

::

## API

::steps

### `AnimationBounce`

| Prop Name | Type      | Description                                            |
| --------- | --------- | ------------------------------------------------------ |
| `enabled` | `boolean` | Active ou désactive l'animation (par défaut : `true`). |

| Slot Name | Description                             |
| --------- | --------------------------------------- |
| `default` | Élément à animer (icône, bouton, etc.). |

::

## Crédits

- Inspiré par l'effet bounce du dock de macOS.
