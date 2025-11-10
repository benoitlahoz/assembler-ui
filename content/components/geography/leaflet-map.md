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
import { Button } from "@/components/ui/button";
import { ref, type ComponentPublicInstance } from "vue";
import { ClientOnly } from "#components";
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletMarker,
  LeafletCircle,
  type LeafletMapExposed,
} from "@/components/ui/leaflet-map";

type LeafletMapInstance = ComponentPublicInstance & LeafletMapExposed;

const mapRef = ref<LeafletMapInstance | null>(null);
const zoom = ref(13);
const locationCoords = ref<{
  lat: number;
  lng: number;
  accuracy: number;
} | null>(null);
const onLocate = () => {
  const locate = mapRef.value?.locate || mapRef.value?.$.exposed?.locate;
  if (locate) {
    locate();
  }
};

const onLocationFound = (event: any) => {
  locationCoords.value = {
    lat: event.latitude,
    lng: event.longitude,
    accuracy: event.accuracy,
  };
};
</script>

<template>
  <ClientOnly>
    <div class="mb-4"><Button @click="onLocate">Locate</Button></div>
    <div class="h-128 min-h-128 mb-4">
      <LeafletMap
        ref="mapRef"
        name="marseille"
        tile-layer="openstreetmap"
        center-lat="44.280608"
        center-lng="5.350242"
        :zoom="zoom"
        class="rounded-lg"
        @location:found="onLocationFound"
      >
        <LeafletTileLayer
          name="openstreetmap"
          url-template="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LeafletZoomControl position="topleft" />
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
import type * as L from "leaflet";
import type { Map, TileLayerOptions } from "leaflet";

type L = typeof L;

export { default as LeafletMap } from "./LeafletMap.vue";
export { default as LeafletZoomControl } from "./LeafletZoomControl.vue";
export { default as LeafletTileLayer } from "./LeafletTileLayer.vue";
export { default as LeafletMarker } from "./LeafletMarker.vue";
export { default as LeafletCircle } from "./LeafletCircle.vue";

export const LeafletModuleKey: InjectionKey<Ref<L | undefined>> =
  Symbol("LeafletModule");
export const LeafletMapKey: InjectionKey<Ref<Map | null>> =
  Symbol("LeafletMap");
export const LeafletTileLayersKey: InjectionKey<
  Ref<TileLayerOptions & { name: string } & { urlTemplate: string }>
> = Symbol("LeafletTileLayerOptions");
export const LeafletErrorsKey: InjectionKey<Ref<Error[]>> =
  Symbol("LeafletErrors");

export type { LeafletMapProps } from "./LeafletMap.vue";
export type { LeafletMapExposed } from "./LeafletMap.vue";
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
  onBeforeUnmount,
} from "vue";
import { cn } from "@/lib/utils";
import {
  LeafletErrorsKey,
  LeafletMapKey,
  LeafletModuleKey,
  LeafletTileLayersKey,
} from ".";
import type Leaflet from "leaflet";
import type { LeafletMouseEvent, Map } from "leaflet";
type Leaflet = typeof Leaflet;

export interface LeafletMapExposed {
  map: Ref<Leaflet.Map | null | any>;
  errors: Ref<Error[]>;
  locate: () => Leaflet.Map | null;
}

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

const emit = defineEmits<{
  (e: "click", event: LeafletMouseEvent): void;
  (e: "location:found", event: Leaflet.LocationEvent): void;
  (e: "location:error", event: Leaflet.ErrorEvent): void;
}>();

const L = ref<Leaflet | undefined>(undefined);
provide(LeafletModuleKey, L);

const mapName = computed(() => props.name || "map");

const map = ref<Leaflet.Map | null>(null);
const errors = ref<Error[]>([]);
const tileLayers = ref<
  Array<Leaflet.TileLayerOptions & { name: string } & { urlTemplate: string }>
>([]);
const currentTileLayer = ref<Leaflet.TileLayer | null>(null);

provide<Ref<Leaflet.Map | null>>(LeafletMapKey, map as any);
provide<
  Ref<
    Array<Leaflet.TileLayerOptions & { name: string } & { urlTemplate: string }>
  >
>(LeafletTileLayersKey, tileLayers as any);
provide<Ref<Error[]>>(LeafletErrorsKey, errors);

const centerLat = computed(() => Number(props.centerLat) || 43.280608);
const centerLng = computed(() => Number(props.centerLng) || 5.350242);
const zoom = computed(() => Number(props.zoom) || 13);

const tileLayerForName = () => {
  const layer = tileLayers.value.find(
    (layerOptions) => (layerOptions as any).name === props.tileLayer,
  );
  if (layer) {
    return { ...layer, crossOrigin: true };
  }
};

const locate = () => {
  if (map.value && map.value.locate) {
    return map.value.locate({ setView: true, maxZoom: zoom.value });
  }
  return null;
};

const onLocationFound = (event: Leaflet.LocationEvent) => {
  if (map.value && L) {
    emit("location:found", event);
  }
};

const onLocationError = (event: Leaflet.ErrorEvent) => {
  emit("location:error", event);
  errors.value.push(new Error(event.message));
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
    if (map.value && L.value && props.tileLayer) {
      const layerOptions = tileLayerForName();
      if (layerOptions) {
        if (currentTileLayer.value) {
          currentTileLayer.value.remove();
        }
        currentTileLayer.value = L.value
          .tileLayer(layerOptions.urlTemplate, layerOptions)
          .addTo(map.value as any);
      }
    }
  },
  { immediate: true, deep: true },
);

onMounted(() => {
  console.log("LeafletMap onMounted - SSR:", process.server);
  try {
    nextTick(async () => {
      console.log(
        "LeafletMap onMounted - inside nextTick - SSR:",
        process.server,
      );
      if (typeof window === "undefined") return;
      console.log("Loading Leaflet library...");

      await import("leaflet/dist/leaflet.css");
      L.value = (await import("leaflet")).default;
      console.log("Leaflet loaded:", L.value);
      nextTick(() => {
        console.log(
          "LeafletMap nextTick - initializing map...",
          process.server,
        );
        console.log("Initializing map with Leaflet:", L.value);
        if (!L.value) return;
        map.value = L.value
          .map(mapName.value, { zoomControl: false })
          .setView([centerLat.value, centerLng.value], zoom.value);

        map.value.on("click", (event: LeafletMouseEvent) => {
          emit("click", event);
        });
        map.value.on("locationfound", onLocationFound);
        map.value.on("locationerror", onLocationError);

        if (props.tileLayer) {
          const layerOptions = tileLayerForName();
          if (layerOptions) {
            if (currentTileLayer.value) {
              currentTileLayer.value.remove();
            }
            currentTileLayer.value = L.value
              .tileLayer(layerOptions.urlTemplate, layerOptions)
              .addTo(map.value as any);
          }
        }
      });
    });
  } catch (error) {
    console.error("Error loading Leaflet:", error);
    errors.value.push(error as Error);
  }
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.off();
    map.value.remove();
    map.value = null;
  }
});

defineExpose<LeafletMapExposed>({
  map,
  errors,
  locate,
});
</script>

<template>
  <div
    :id="mapName"
    :class="cn('w-full h-full', props.class)"
    :style="props.style"
  >
    <slot :map="map" :errors="errors" :locate="locate" />
  </div>
</template>
```

```vue [src/components/ui/leaflet-map/LeafletCircle.vue]
<script setup lang="ts">
import {
  inject,
  watch,
  ref,
  type Ref,
  nextTick,
  onBeforeUnmount,
  type HTMLAttributes,
  onMounted,
} from "vue";
import { useTailwindClassParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletMapKey, LeafletModuleKey } from ".";

export interface LeafletCircleProps {
  lat?: number | string;
  lng?: number | string;
  radius?: number | string;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletCircleProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  radius: 100,
});

const { getTailwindBaseCssValues } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const circle = ref<L.Circle | null>(null);

const getColors = () => {
  const classNames = props.class ? props.class.toString().split(" ") : [];
  const el = document.createElement("div");
  el.className = classNames.join(" ");
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.zIndex = "-9999";
  document.body.appendChild(el);
  const cssValues = getTailwindBaseCssValues(el, [
    "color",
    "background-color",
    "opacity",
  ]);
  document.body.removeChild(el);
  return {
    color: cssValues["color"] || "blue",
    fillColor: cssValues["background-color"] || "blue",
    fillOpacity: cssValues["opacity"] ? parseFloat(cssValues["opacity"]) : 0.2,
  };
};

watch(
  () => [map.value, props.lat, props.lng, props.radius],
  () => {
    nextTick(() => {
      if (
        map.value &&
        L.value &&
        !isNaN(Number(props.lat)) &&
        !isNaN(Number(props.lng)) &&
        !isNaN(Number(props.radius))
      ) {
        if (circle.value) {
          circle.value.setLatLng([Number(props.lat), Number(props.lng)]);
          circle.value.setRadius(Number(props.radius));
        } else {
          circle.value = L.value.circle(
            [Number(props.lat), Number(props.lng)],
            {
              radius: Number(props.radius),
            },
          );
          circle.value.addTo(map.value);
        }
        const colors = getColors();
        circle.value.setStyle({
          color: colors.color,
          fillColor: colors.fillColor,
          fillOpacity: colors.fillOpacity,
        });
      } else {
        if (circle.value) {
          circle.value.remove();
          circle.value = null as any;
        }
      }
    });
  },
  { immediate: true, flush: "post" },
);

onBeforeUnmount(() => {
  if (circle.value) {
    circle.value.remove();
  }
});
</script>

<template><slot /></template>
```

```vue [src/components/ui/leaflet-map/LeafletMarker.vue]
<script setup lang="ts">
import {
  inject,
  watch,
  ref,
  type Ref,
  nextTick,
  onBeforeUnmount,
  onMounted,
} from "vue";
import { LeafletMapKey, LeafletModuleKey } from ".";

export interface LeafletMarkerProps {
  lat?: number | string;
  lng?: number | string;
}

const props = withDefaults(defineProps<LeafletMarkerProps>(), {
  lat: 43.280608,
  lng: 5.350242,
});

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const marker = ref<L.Marker | null>(null);

watch(
  () => [props.lat, props.lng],
  ([newLat, newLng]) => {
    nextTick(() => {
      if (!L.value) return;
      if (map.value && !isNaN(Number(newLat)) && !isNaN(Number(newLng))) {
        if (marker.value) {
          marker.value.setLatLng([Number(newLat), Number(newLng)]);
        } else {
          marker.value = L.value.marker([Number(newLat), Number(newLng)]);
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
  { immediate: true },
);

watch(
  () => map.value,
  (newMap) => {
    if (newMap && L.value) {
      if (!marker.value) {
        marker.value = L.value.marker([Number(props.lat), Number(props.lng)]);
      }
      marker.value.addTo(newMap);
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (map.value && L.value) {
    if (!marker.value) {
      marker.value = L.value.marker([Number(props.lat), Number(props.lng)]);
    }
    marker.value.addTo(map.value);
  }
});

onBeforeUnmount(() => {
  if (marker.value) {
    marker.value.remove();
  }
});
</script>

<template><slot /></template>
```

```vue [src/components/ui/leaflet-map/LeafletTileLayer.vue]
<script setup lang="ts">
import { computed, inject, ref, watch, type HTMLAttributes } from "vue";
import { LeafletModuleKey, LeafletTileLayersKey } from ".";

export interface LeafletTileLayerProps {
  name: string;
  urlTemplate: string;
  attribution?: string | undefined;
  class?: HTMLAttributes["class"];
}

const props = defineProps<LeafletTileLayerProps>();

const L = inject(LeafletModuleKey, ref());
const tileLayers = inject(LeafletTileLayersKey, ref([] as any));
const className = computed(() => props.class);

watch(
  () => [
    L.value,
    props.name,
    props.urlTemplate,
    props.attribution,
    className.value,
  ],
  () => {
    console.warn("LeafletTileLayer watchEffect triggered", L);
    if (!L.value) return;

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
  },
);
</script>

<template><slot /></template>
```

```vue [src/components/ui/leaflet-map/LeafletZoomControl.vue]
<script setup lang="ts">
import { ref, inject, type Ref, watch, onBeforeUnmount } from "vue";
import { type ControlOptions } from "leaflet";
import { LeafletMapKey, LeafletModuleKey } from ".";

export interface LeafletControlProps {
  position?: ControlOptions["position"];
}

const props = withDefaults(defineProps<LeafletControlProps>(), {
  position: "topright",
});

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const control = ref<L.Control.Zoom | null>(null);

watch(
  () => map.value,
  (newMap) => {
    if (newMap && L.value) {
      control.value = L.value.control.zoom({ position: props.position });
      control.value.addTo(newMap);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (control.value && map.value) {
    map.value.removeControl(control.value);
  }
});
</script>

<template>
  <div></div>
</template>
```

```ts [src/composables/use-css-parser/useCssParser.ts]
export interface GradientColorStop {
  color: string;
  pos: number;
}

export interface GradientParseResult {
  stops: GradientColorStop[];
  direction: string;
}

const combineRegExp = (regexpList: (RegExp[] | string)[], flags: string) => {
  let i,
    source = "";
  for (i = 0; i < regexpList.length; i++) {
    if (typeof regexpList[i] === "string") {
      source += regexpList[i];
    } else {
      source += (regexpList[i] as any).source;
    }
  }
  return new RegExp(source, flags);
};

const buildGradientRegExp = () => {
  const searchFlags = "gi";
  const rAngle = /(?:[+-]?\d*\.?\d+)(?:deg|grad|rad|turn)/;

  const rSideCornerCapture =
    /to\s+((?:left|right|top|bottom)(?:\s+(?:left|right|top|bottom))?)/;
  const rComma = /\s*,\s*/;
  const rColorHex = /\#(?:[a-f0-9]{6}|[a-f0-9]{3})/;
  const rColorOklch = /oklch\(\s*(?:[+-]?\d*\.?\d+\s*){3}\)/;
  const rDigits3 = /\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\)/;
  const rDigits4 = /\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*,\s*\d*\.?\d+\)/;
  const rValue = /(?:[+-]?\d*\.?\d+)(?:%|[a-z]+)?/;
  const rKeyword = /[_a-z-][_a-z0-9-]*/;
  const rColor = combineRegExp(
    [
      "(?:",
      rColorHex.source,
      "|",
      "(?:rgb|hsl)",
      rDigits3.source,
      "|",
      "(?:rgba|hsla)",
      rDigits4.source,
      "|",
      rColorOklch.source,
      "|",
      rKeyword.source,
      ")",
    ],
    "",
  );
  const rColorStop = combineRegExp(
    [rColor.source, "(?:\\s+", rValue.source, "(?:\\s+", rValue.source, ")?)?"],
    "",
  );
  const rColorStopList = combineRegExp(
    ["(?:", rColorStop.source, rComma.source, ")*", rColorStop.source],
    "",
  );
  const rLineCapture = combineRegExp(
    ["(?:(", rAngle.source, ")|", rSideCornerCapture.source, ")"],
    "",
  );
  const rGradientSearch = combineRegExp(
    [
      "(?:(",
      rLineCapture.source,
      ")",
      rComma.source,
      ")?(",
      rColorStopList.source,
      ")",
    ],
    searchFlags,
  );
  const rColorStopSearch = combineRegExp(
    [
      "\\s*(",
      rColor.source,
      ")",
      "(?:\\s+",
      "(",
      rValue.source,
      "))?",
      "(?:",
      rComma.source,
      "\\s*)?",
    ],
    searchFlags,
  );

  return {
    gradientSearch: rGradientSearch,
    colorStopSearch: rColorStopSearch,
  };
};

const RegExpLib = buildGradientRegExp();

export const useTailwindClassParser = () => {
  const getTailwindBaseCssValues = (
    el: HTMLElement,
    properties?: string[],
  ): Record<string, string> => {
    if (typeof window === "undefined") {
      return {};
    }

    const computed = window.getComputedStyle(el);
    const result: Record<string, string> = {};
    if (properties && properties.length > 0) {
      for (const prop of properties) {
        result[prop] = computed.getPropertyValue(prop);
      }
    } else {
      for (let i = 0; i < computed.length; i++) {
        const prop = computed.item(i);
        if (typeof prop === "string") {
          result[prop] = computed.getPropertyValue(prop);
        }
      }
    }

    return result;
  };

  const parseGradient = function (
    input: string,
  ): GradientParseResult | undefined {
    const rGradientEnclosedInBrackets =
      /.*gradient\s*\(((?:\([^\)]*\)|[^\)\(]*)*)\)/;
    const matchGradientType = rGradientEnclosedInBrackets.exec(input);

    let strToParse = input;
    if (matchGradientType && matchGradientType[1]) {
      strToParse = matchGradientType[1];
    }

    let result: GradientParseResult | undefined;
    let matchGradient: RegExpExecArray | null;
    let matchColorStop: RegExpExecArray | null;
    let stopResult: GradientColorStop;

    RegExpLib.gradientSearch.lastIndex = 0;

    matchGradient = RegExpLib.gradientSearch.exec(strToParse);
    if (matchGradient !== null) {
      result = {
        stops: [],
        direction: "to bottom",
      };

      if (!!matchGradient[1]) {
        result.direction = matchGradient[1] || "to bottom";
      }

      if (!!matchGradient[2]) {
        result.direction = matchGradient[2];
      }

      if (!!matchGradient[3]) {
        result.direction = matchGradient[3] || "to bottom";
      }

      RegExpLib.colorStopSearch.lastIndex = 0;

      if (typeof matchGradient[4] === "string") {
        matchColorStop = RegExpLib.colorStopSearch.exec(matchGradient[4]);
        while (matchColorStop !== null) {
          stopResult = {
            color: matchColorStop[1] || "rgba(0,0,0,0)",
            pos: 0,
          };

          if (!!matchColorStop[2]) {
            let pos = matchColorStop[2];
            if (pos && pos.endsWith("%")) {
              stopResult.pos = parseFloat(pos) / 100;
            } else {
              stopResult.pos = Number(pos);
            }
          }
          result.stops.push(stopResult);

          matchColorStop = RegExpLib.colorStopSearch.exec(matchGradient[4]);
        }
      }
    }

    return result;
  };

  return {
    getTailwindBaseCssValues,
    parseGradient,
  };
};
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

  ### Events
| Name | Description |
|------|-------------|
| `click`{.primary .text-primary} | — |
| `location:found`{.primary .text-primary} | — |
| `location:error`{.primary .text-primary} | — |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `L` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `map as any` | `Ref<Leaflet.Map \| null>` | — |
| `LeafletTileLayersKey`{.primary .text-primary} | `tileLayers as any` | `Ref<Array<Leaflet.TileLayerOptions & { name: string } & { urlTemplate: string }>>` | — |
| `LeafletErrorsKey`{.primary .text-primary} | `errors` | `Ref<Error[]>` | — |

  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `map`{.primary .text-primary} | `Ref<Leaflet.Map \| null>` | — |
| `errors`{.primary .text-primary} | `Ref<Error[]>` | — |
| `locate`{.primary .text-primary} | `() => any` | — |

---

## LeafletCircle
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `lat`{.primary .text-primary} | `number \| string` | 43.280608 |  |
| `lng`{.primary .text-primary} | `number \| string` | 5.350242 |  |
| `radius`{.primary .text-primary} | `number \| string` | 100 |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |

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
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
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
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
| `LeafletTileLayersKey`{.primary .text-primary} | `ref([] as any)` | `any` | — |

---

## LeafletZoomControl
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `position`{.primary .text-primary} | `ControlOptions['position']` | topright |  |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |

---

::tip
You can copy and adapt this template for any component documentation.
::