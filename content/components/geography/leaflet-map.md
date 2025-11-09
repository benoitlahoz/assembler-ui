---
title: LeafletMap
description: 
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <leaflet-simple />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletMarker,
} from "@/components/ui/leaflet-map";
</script>

<template>
  <ClientOnly>
    <div class="mb-4">This is a simple example of a Leaflet map component.</div>
    <div class="h-128 min-h-128 mb-4">
      <LeafletMap
        name="marseille"
        tile-layer="openstreetmap"
        class="rounded-lg"
      >
        <LeafletTileLayer
          name="openstreetmap"
          url-template="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LeafletMarker />
      </LeafletMap>
    </div>
  </ClientOnly>
</template>
```
  :::
::

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/leaflet-map.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/leaflet-map.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/leaflet-map.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/leaflet-map.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/leaflet-map/index.ts"}

```ts [src/components/ui/leaflet-map/index.ts]
import type { InjectionKey, Ref } from "vue";
import type { Map, TileLayerOptions } from "leaflet";

export { default as LeafletMap } from "./LeafletMap.vue";
export { default as LeafletTileLayer } from "./LeafletTileLayer.vue";
export { default as LeafletMarker } from "./LeafletMarker.vue";

export const LeafletMapKey: InjectionKey<Ref<Map | null>> =
  Symbol("LeafletMap");
export const LeafletTileLayersKey: InjectionKey<
  Ref<TileLayerOptions & { name: string } & { urlTemplate: string }>
> = Symbol("LeafletTileLayerOptions");

export type { LeafletMapProps } from "./LeafletMap.vue";
export type { LeafletTileLayerProps } from "./LeafletTileLayer.vue";
export type { LeafletMarkerProps } from "./LeafletMarker.vue";
```

```vue [src/components/ui/leaflet-map/LeafletMap.vue]
<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch,
  provide,
  type HTMLAttributes,
  type Ref,
} from "vue";
import * as L from "leaflet";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";
import { LeafletMapKey, LeafletTileLayersKey } from ".";

export interface LeafletMapProps {
  class?: HTMLAttributes["class"];
  style?: HTMLAttributes["style"];

  name?: string;
  tileLayer: string;
  centerLat?: number | string;
  centerLng?: number | string;
  zoom?: number | string;
}

const props = withDefaults(defineProps<LeafletMapProps>(), {
  name: "map",
  centerLat: 43.280608,
  centerLng: 5.350242,
  zoom: 13,
});

const mapName = computed(() => props.name || "map");

const map = ref<L.Map | null>(null);
const tileLayers = ref<
  Array<L.TileLayerOptions & { name: string } & { urlTemplate: string }>
>([]);
const currentTileLayer = ref<L.TileLayer | null>(null);

provide<Ref<L.Map | null>>(LeafletMapKey, map as any);
provide<
  Ref<Array<L.TileLayerOptions & { name: string } & { urlTemplate: string }>>
>(LeafletTileLayersKey, tileLayers as any);

const centerLat = computed(() => Number(props.centerLat) || 43.280608);
const centerLng = computed(() => Number(props.centerLng) || 5.350242);
const zoom = computed(() => Number(props.zoom) || 13);

const tileLayerForName = () => {
  console.log("Tile layers available:", tileLayers.value, props.tileLayer);
  return tileLayers.value.find(
    (layerOptions) => (layerOptions as any).name === props.tileLayer,
  );
};

watch(
  () => [centerLat.value, centerLng.value],
  ([newLat, newLng]) => {
    if (map.value && newLat && newLng) {
      map.value.setView([Number(newLat), Number(newLng)], zoom.value);
    }
  },
  { immediate: true },
);

watch(
  () => zoom.value,
  (newZoom) => {
    if (map.value) {
      map.value.setZoom(Number(newZoom));
    }
  },
  { immediate: true },
);

watch(
  () => props.tileLayer,
  () => {
    if (map.value) {
      const layerOptions = tileLayerForName();
      if (layerOptions) {
        if (currentTileLayer.value) {
          currentTileLayer.value.remove();
        }
        currentTileLayer.value = L.tileLayer(
          layerOptions.urlTemplate,
          layerOptions,
        ).addTo(map.value as any);
      }
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  nextTick(() => {
    map.value = L.map(mapName.value).setView(
      [centerLat.value, centerLng.value],
      zoom.value,
    );
    if (props.tileLayer) {
      const layerOptions = tileLayerForName();
      if (layerOptions) {
        if (currentTileLayer.value) {
          currentTileLayer.value.remove();
        }
        currentTileLayer.value = L.tileLayer(
          layerOptions.urlTemplate,
          layerOptions,
        ).addTo(map.value as any);
      }
    }
  });
});
</script>

<template>
  <div
    :id="mapName"
    :class="cn('w-full h-full', props.class)"
    :style="props.style"
  >
    <slot />
  </div>
</template>
```

```vue [src/components/ui/leaflet-map/LeafletMarker.vue]
<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick } from "vue";
import * as L from "leaflet";
import { LeafletMapKey } from ".";

export interface LeafletMarkerProps {
  lat?: number | string;
  lng?: number | string;
}

const props = withDefaults(defineProps<LeafletMarkerProps>(), {
  lat: 43.280608,
  lng: 5.350242,
});

const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const marker = ref(L.marker([Number(props.lat), Number(props.lng)]));

watch(
  () => [props.lat, props.lng],
  ([newLat, newLng]) => {
    nextTick(() => {
      if (map.value && newLat && newLng) {
        if (marker.value) {
          marker.value.setLatLng([Number(newLat), Number(newLng)]);
        } else {
          marker.value = L.marker([Number(newLat), Number(newLng)]);
          marker.value.addTo(map.value);
        }
      } else {
        if (marker.value) {
          marker.value.remove();
          marker.value = null as any;
        }
      }
    });
  },
  { immediate: true, deep: true, flush: "post" },
);

watch(
  () => map.value,
  (newMap) => {
    if (newMap) {
      if (!marker.value) {
        marker.value = L.marker([Number(props.lat), Number(props.lng)]);
      }
      marker.value.addTo(newMap);
    }
  },
  { immediate: true },
);
</script>

<template><slot /></template>
```

```vue [src/components/ui/leaflet-map/LeafletTileLayer.vue]
<script setup lang="ts">
import { computed, inject, ref, watchEffect, type HTMLAttributes } from "vue";
import * as L from "leaflet";
import { LeafletTileLayersKey } from ".";

export interface LeafletTileLayerProps {
  name: string;
  urlTemplate: string;
  attribution?: string | undefined;
  class?: HTMLAttributes["class"];
}

const props = defineProps<LeafletTileLayerProps>();

const tileLayers = inject(LeafletTileLayersKey, ref([] as any));

const className = computed(() => props.class);

watchEffect(() => {
  const options: L.TileLayerOptions & { name: string } & {
    urlTemplate: string;
  } = {
    name: props.name,
    attribution: props.attribution,
    urlTemplate: props.urlTemplate,
    className: className.value,
  };

  const existingLayer = tileLayers.value.find(
    (layer: L.TileLayerOptions & { name: string }) =>
      (layer as any).name === props.name,
  );

  if (existingLayer) {
    const index = tileLayers.value.indexOf(existingLayer);
    tileLayers.value[index] = options;
    return;
  }

  tileLayers.value.push(options);
});
</script>

<template><slot /></template>
```
:::

## LeafletMap
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |
| `style`{.primary .text-primary} | `HTMLAttributes['style']` | - |  |
| `name`{.primary .text-primary} | `string` | map |  |
| `tileLayer`{.primary .text-primary} | `string` | - |  |
| `centerLat`{.primary .text-primary} | `number \| string` | 43.280608 |  |
| `centerLng`{.primary .text-primary} | `number \| string` | 5.350242 |  |
| `zoom`{.primary .text-primary} | `number \| string` | 13 |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `LeafletMapKey`{.primary .text-primary} | `map as any` | `Ref<L.Map \| null>` | — |
| `LeafletTileLayersKey`{.primary .text-primary} | `tileLayers as any` | `Ref<Array<L.TileLayerOptions & { name: string } & { urlTemplate: string }>>` | — |

---

## LeafletMarker
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `lat`{.primary .text-primary} | `number \| string` | 43.280608 |  |
| `lng`{.primary .text-primary} | `number \| string` | 5.350242 |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |

---

## LeafletTileLayer
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name`{.primary .text-primary} | `string` | - |  |
| `urlTemplate`{.primary .text-primary} | `string` | - |  |
| `attribution`{.primary .text-primary} | `string \| undefined` | - |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletTileLayersKey`{.primary .text-primary} | `ref([] as any)` | `any` | — |

---

::tip
You can copy and adapt this template for any component documentation.
::