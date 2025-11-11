---
title: useLeaflet
description: Composable with Leaflet dynamic import client-side and utilities.
---

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-leaflet.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-leaflet.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-leaflet.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-leaflet.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-leaflet/useLeaflet.ts"}

```ts [src/composables/use-leaflet/useLeaflet.ts]
import { ref, type Ref } from "vue";
import type Leaflet from "leaflet";
type Leaflet = typeof Leaflet;

let L: Ref<Leaflet | undefined> = ref(undefined);

const LatDegreesMeters = 111320;

export const useLeaflet = async () => {
  if (typeof window !== "undefined") {
    await import("leaflet/dist/leaflet.css");
    L.value = (await import("leaflet")).default;
  }

  const radiusToLatDegrees = (radiusInMeters: number) => {
    return radiusInMeters / LatDegreesMeters;
  };

  const latDegreesToRadius = (latDegrees: number) => {
    return latDegrees * LatDegreesMeters;
  };

  const radiusToLngDegrees = (radiusInMeters: number, lat: number) => {
    return (
      radiusInMeters / (LatDegreesMeters * Math.cos((lat * Math.PI) / 180))
    );
  };

  const lngDegreesToRadius = (lngDegrees: number, lat: number) => {
    return lngDegrees * LatDegreesMeters * Math.cos((lat * Math.PI) / 180);
  };

  return {
    L,
    LatDegreesMeters,
    radiusToLatDegrees,
    latDegreesToRadius,
    radiusToLngDegrees,
    lngDegreesToRadius,
  };
};
```
:::

## API
::hr-underline
::

  ### Returns

| Property | Type | Description |
|----------|------|-------------|
| `L`{.primary .text-primary} | `any` | — |
| `LatDegreesMeters`{.primary .text-primary} | `any` | — |
| `radiusToLatDegrees`{.primary .text-primary} | `any` | — |
| `latDegreesToRadius`{.primary .text-primary} | `any` | — |
| `radiusToLngDegrees`{.primary .text-primary} | `any` | — |
| `lngDegreesToRadius`{.primary .text-primary} | `any` | — |

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `Leaflet`{.primary .text-primary} | `type` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
