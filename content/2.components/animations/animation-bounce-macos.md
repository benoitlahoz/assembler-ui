title: AnimationBounce
description: A component to animate an element with a MacOS dock-style bounce effect.

---

::ComponentLoader{label="Preview" componentName="AnimationBounceMacOsDemo" type="examples"}
::

## Installation via CLI

::InstallationCli{componentId="animation-bounce-macos"}
::

## Manual installation

Copy and paste the following code into the same folder:

::code-group

:CodeViewerTab{filename="AnimationBounceMacOs.vue" language="vue" componentName="AnimationBounceMacOs" type="ui" id="animation-bounce-macos"}
:CodeViewerTab{filename="index.ts" language="ts" componentName="index" extension="ts" type="ui" id="animation-bounce-macos"}

::

## API

::steps

### Props

| Prop Name     | Type      | Description                                                                                      |
| ------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `enabled`     | `boolean` | Enables or disables the animation (default: `true`).                                             |
| `expand`      | `string`  | Bounce direction or type: `'start'` (up/right), `'end'` (down/left), `'center'` (scale).         |
| `orientation` | `string`  | Animation direction: `'vertical'` (up/down), `'horizontal'` (right/left). Default: `'vertical'`. |
| `amplitude`   | `number`  | Bounce amplitude (proportion of slot size, e.g., `0.5` for 50%). Default: `0.5`.                 |

### Slots

| Slot Name | Description                              |
| --------- | ---------------------------------------- |
| `default` | Element to animate (icon, button, etc.). |

### Events

| Event    | Description                                                                  |
| -------- | ---------------------------------------------------------------------------- |
| `start`  | Animation bounce started                                                     |
| `end`    | Animation actually ended (when enabled becomes false AND animation finishes) |
| `cancel` | Immediate stop requested (as soon as enabled becomes false)                  |

::

## Credits

- Inspired by the bounce effect of the macOS dock.
