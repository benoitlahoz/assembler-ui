---
title: Dock
description: A macOS-style dock with magnifying icons on hover.
---

::ComponentLoader{label="Preview" componentName="SimpleDockDemoHorizontalBottom" type="examples"}
::

## Installation

### With the CLI

::InstallationCli{componentId="dock"}
::

### Manual installation

Copy and paste the following files into the same folder:

::code-group

:CodeViewerTab{filename="Dock.vue" language="vue" componentName="Dock" type="ui" id="dock"}
:CodeViewerTab{filename="DockItem.vue" language="vue" componentName="DockItem" type="ui" id="dock"}
:CodeViewerTab{filename="DockSeparator.vue" language="vue" componentName="DockSeparator" type="ui" id="dock"}
:CodeViewerTab{filename="index.ts" language="ts" componentName="index" extension="ts" type="ui" id="dock"}

::

### Using the CLI

::InstallationCli{componentId="dock"}
::

### Manual installation

Copy and paste the following files into the same folder:

::code-group

:CodeViewerTab{filename="Dock.vue" language="vue" componentName="Dock" type="ui" id="dock"}
:CodeViewerTab{filename="DockItem.vue" language="vue" componentName="DockItem" type="ui" id="dock"}
:CodeViewerTab{filename="DockSeparator.vue" language="vue" componentName="DockSeparator" type="ui" id="dock"}
:CodeViewerTab{filename="index.ts" language="ts" componentName="index" extension="ts" type="ui" id="dock"}

::

### Horizontal expands from top to bottom

::ComponentLoader{label="Preview" componentName="SimpleDockDemoHorizontalTop" type="examples"}
::

### Horizontal expands from center

::ComponentLoader{label="Preview" componentName="SimpleDockDemoHorizontalCenter" type="examples"}
::

### Vertical Dock (left)

::ComponentLoader{label="Preview" componentName="SimpleDockDemoVerticalLeft" type="examples"}
::

### Vertical Dock (right)

::ComponentLoader{label="Preview" componentName="SimpleDockDemoVerticalRight" type="examples"}
::

### macOS Style Dock

::ComponentLoader{label="Preview" componentName="MacOsDockDemo" type="examples"}
::

## API & Properties

### Dock

| Prop          | Type   | Description                                                         |
| ------------- | ------ | ------------------------------------------------------------------- |
| `class`       | string | Additional CSS classes to apply to the dock.                        |
| `magnify`     | number | Magnification factor on hover (default: 60).                        |
| `orientation` | string | Dock orientation (`vertical`, `horizontal`). Default: `horizontal`. |
| `expand`      | string | Expansion area (`start`, `center`, `end`).                          |

**Slots**

| Slot    | Description                                       |
| ------- | ------------------------------------------------- |
| default | The DockItem or DockSeparator elements to display |

### DockItem

| Prop      | Type    | Description                                       |
| --------- | ------- | ------------------------------------------------- |
| `class`   | string  | Additional CSS classes for the item.              |
| `animate` | boolean | Enable or disable item animation (default: false) |

**Slots**

| Slot    | Description                                   |
| ------- | --------------------------------------------- |
| default | Icon or component to display in the DockItem. |

### DockSeparator

Allows you to add a visual separator between two DockItems.

| Prop    | Type   | Description                              |
| ------- | ------ | ---------------------------------------- |
| `class` | string | Additional CSS classes for the separator |

## Credits

- Inspired by shadcn-io: https://www.shadcn.io/components/dock/mac-os-dock
- Adapted from NuxtLego: https://nuxt-lego.vercel.app/blueprints/magnified-dock
