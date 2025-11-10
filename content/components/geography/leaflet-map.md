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
  LeafletDrawControl,
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
        center-lat="43.3026"
        center-lng="5.3691"
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

        <LeafletDrawControl position="topright" />

        <LeafletCircle
          v-if="locationCoords"
          :key="`circle-${locationCoords.lat}-${locationCoords.lng}`"
          :lat="locationCoords.lat"
          :lng="locationCoords.lng"
          :radius="locationCoords.accuracy"
          class="bg-red-500 text-red-500 opacity-20"
        />
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
export { default as LeafletDrawControl } from "./LeafletDrawControl.vue";
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
export type { LeafletZoomControlProps } from "./LeafletZoomControl.vue";
export type {
  LeafletDrawControlProps,
  DrawEvent,
} from "./LeafletDrawControl.vue";
export type { LeafletTileLayerProps } from "./LeafletTileLayer.vue";
export type { LeafletMarkerProps } from "./LeafletMarker.vue";
export type { LeafletCircleProps } from "./LeafletCircle.vue";
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
  try {
    nextTick(async () => {
      if (typeof window === "undefined") return;

      await import("leaflet/dist/leaflet.css");
      L.value = (await import("leaflet")).default;
      nextTick(() => {
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

```vue [src/components/ui/leaflet-map/LeafletDrawControl.vue]
<script setup lang="ts">
import { ref, inject, type Ref, watch, onBeforeUnmount, computed } from "vue";
import {
  type ControlOptions,
  type Layer,
  type LatLng,
  type LeafletEvent,
  type FeatureGroup,
} from "leaflet";
import { LeafletMapKey, LeafletModuleKey } from ".";

export interface DrawHandlerOptions {
  enabled?: boolean;
  shapeOptions?: any;
  repeatMode?: boolean;
}

export interface LeafletDrawControlProps {
  position?: ControlOptions["position"];
  draw?: {
    marker?: DrawHandlerOptions | boolean;
    circle?: DrawHandlerOptions | boolean;
    polyline?: DrawHandlerOptions | boolean;
    polygon?: DrawHandlerOptions | boolean;
    rectangle?: DrawHandlerOptions | boolean;
  };
  edit?: {
    featureGroup: FeatureGroup;
    edit?: boolean;
    remove?: boolean;
  };
}

export interface DrawEvent {
  layer: Layer;
  layerType: string;
  type: string;
}

const props = withDefaults(defineProps<LeafletDrawControlProps>(), {
  position: "topright",
});

const emit = defineEmits<{
  (e: "draw:created", event: DrawEvent): void;
  (e: "draw:edited", event: { layers: Layer[] }): void;
  (e: "draw:deleted", event: { layers: Layer[] }): void;
  (e: "draw:drawstart", event: { layerType: string }): void;
  (e: "draw:drawstop", event: { layerType: string }): void;
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const control = ref<any>(null);
const activeMode = ref<string | null>(null);
const handlers = ref<Map<string, any>>(new Map());
const drawnItems = ref<any>(null);

const createDrawControl = () => {
  if (!L.value || !map.value) return;

  const DrawControl = L.value.Control.extend({
    options: {
      position: props.position,
    },

    onAdd: function (map: L.Map) {
      const container = L.value!.DomUtil.create(
        "div",
        "leaflet-draw leaflet-control leaflet-bar",
      );

      L.value!.DomEvent.disableClickPropagation(container);
      L.value!.DomEvent.disableScrollPropagation(container);

      if (props.draw) {
        if (shouldEnableHandler("marker")) {
          createButton(container, "marker", "📍", "Dessiner un marqueur");
        }
        if (shouldEnableHandler("circle")) {
          createButton(container, "circle", "⭕", "Dessiner un cercle");
        }
        if (shouldEnableHandler("polyline")) {
          createButton(container, "polyline", "〰️", "Dessiner une ligne");
        }
        if (shouldEnableHandler("polygon")) {
          createButton(container, "polygon", "▽", "Dessiner un polygone");
        }
        if (shouldEnableHandler("rectangle")) {
          createButton(container, "rectangle", "▢", "Dessiner un rectangle");
        }
      }

      return container;
    },

    onRemove: function () {
      disableAllHandlers();
    },
  });

  return new DrawControl();
};

const shouldEnableHandler = (type: string): boolean => {
  if (!props.draw) return false;
  const config = props.draw[type as keyof typeof props.draw];
  if (typeof config === "boolean") return config;
  if (typeof config === "object") return config.enabled !== false;
  return false;
};

const getHandlerOptions = (type: string): DrawHandlerOptions => {
  if (!props.draw) return {};
  const config = props.draw[type as keyof typeof props.draw];
  if (typeof config === "object") return config;
  return {};
};

const createButton = (
  container: HTMLElement,
  type: string,
  icon: string,
  title: string,
) => {
  const button = L.value!.DomUtil.create("a", "leaflet-draw-button", container);
  button.href = "#";
  button.title = title;
  button.innerHTML = icon;
  button.setAttribute("role", "button");
  button.setAttribute("aria-label", title);

  L.value!.DomEvent.on(button, "click", (e: Event) => {
    L.value!.DomEvent.preventDefault(e);
    toggleDrawMode(type);
  });

  return button;
};

const toggleDrawMode = (type: string) => {
  if (activeMode.value === type) {
    disableHandler(type);
    activeMode.value = null;
  } else {
    if (activeMode.value) {
      disableHandler(activeMode.value);
    }
    enableHandler(type);
    activeMode.value = type;
  }
};

const enableHandler = (type: string) => {
  if (!map.value || !L.value) return;

  const options = getHandlerOptions(type);
  let handler: any;

  emit("draw:drawstart", { layerType: type });

  switch (type) {
    case "marker":
      handler = createMarkerHandler(options);
      break;
    case "circle":
      handler = createCircleHandler(options);
      break;
    case "polyline":
      handler = createPolylineHandler(options);
      break;
    case "polygon":
      handler = createPolygonHandler(options);
      break;
    case "rectangle":
      handler = createRectangleHandler(options);
      break;
  }

  if (handler) {
    handlers.value.set(type, handler);
    handler.enable();
  }
};

const disableHandler = (type: string) => {
  const handler = handlers.value.get(type);
  if (handler) {
    handler.disable();
    handlers.value.delete(type);
    emit("draw:drawstop", { layerType: type });
  }
};

const disableAllHandlers = () => {
  handlers.value.forEach((handler, type) => {
    disableHandler(type);
  });
};

const createMarkerHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value) return;

    const marker = L.value.marker(e.latlng, options.shapeOptions);

    const event: DrawEvent = {
      layer: marker,
      layerType: "marker",
      type: "draw:created",
    };

    emit("draw:created", event);

    if (props.edit?.featureGroup) {
      props.edit.featureGroup.addLayer(marker);
    }

    if (!options.repeatMode) {
      disable();
      activeMode.value = null;
    }
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
  };

  return { enable, disable };
};

const createCircleHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let tempCircle: L.Circle | null = null;
  let centerLatLng: LatLng | null = null;

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    if (!centerLatLng) {
      centerLatLng = e.latlng;
      tempCircle = L.value.circle(centerLatLng, {
        radius: 0,
        ...options.shapeOptions,
      });
      tempCircle.addTo(map.value);
    } else {
      if (tempCircle) {
        tempCircle.remove();

        const radius = centerLatLng.distanceTo(e.latlng);
        const circle = L.value.circle(centerLatLng, {
          radius,
          ...options.shapeOptions,
        });

        const event: DrawEvent = {
          layer: circle,
          layerType: "circle",
          type: "draw:created",
        };

        emit("draw:created", event);

        if (props.edit?.featureGroup) {
          props.edit.featureGroup.addLayer(circle);
        }
      }

      centerLatLng = null;
      tempCircle = null;

      if (!options.repeatMode) {
        disable();
        activeMode.value = null;
      }
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !centerLatLng || !tempCircle || !L.value) return;
    const radius = centerLatLng.distanceTo(e.latlng);
    tempCircle.setRadius(radius);
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    map.value.on("mousemove", mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    if (tempCircle) {
      tempCircle.remove();
      tempCircle = null;
    }
    centerLatLng = null;
  };

  return { enable, disable };
};

const createPolylineHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let latlngs: LatLng[] = [];
  let tempPolyline: L.Polyline | null = null;
  let tempMarkers: L.CircleMarker[] = [];

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    latlngs.push(e.latlng);

    const marker = L.value.circleMarker(e.latlng, {
      radius: 4,
      color: "#3388ff",
    });
    marker.addTo(map.value);
    tempMarkers.push(marker);

    if (latlngs.length === 1) {
      tempPolyline = L.value.polyline(latlngs, {
        ...options.shapeOptions,
        dashArray: "5, 5",
      });
      tempPolyline.addTo(map.value);
    } else if (tempPolyline) {
      tempPolyline.setLatLngs(latlngs);
    }
  };

  const dblClickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || latlngs.length < 2) return;

    L.value.DomEvent.stop(e);

    latlngs.pop();

    if (latlngs.length >= 2) {
      const polyline = L.value.polyline(latlngs, options.shapeOptions);

      const event: DrawEvent = {
        layer: polyline,
        layerType: "polyline",
        type: "draw:created",
      };

      emit("draw:created", event);

      if (props.edit?.featureGroup) {
        props.edit.featureGroup.addLayer(polyline);
      }
    }

    cleanup();

    if (!options.repeatMode) {
      disable();
      activeMode.value = null;
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !tempPolyline || latlngs.length === 0) return;
    const previewLatLngs = [...latlngs, e.latlng];
    tempPolyline.setLatLngs(previewLatLngs);
  };

  const cleanup = () => {
    if (tempPolyline) {
      tempPolyline.remove();
      tempPolyline = null;
    }
    tempMarkers.forEach((m) => m.remove());
    tempMarkers = [];
    latlngs = [];
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    map.value.on("dblclick", dblClickHandler);
    map.value.on("mousemove", mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("dblclick", dblClickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    cleanup();
  };

  return { enable, disable };
};

const createPolygonHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let latlngs: LatLng[] = [];
  let tempPolygon: L.Polygon | null = null;
  let tempMarkers: L.CircleMarker[] = [];

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    latlngs.push(e.latlng);

    const marker = L.value.circleMarker(e.latlng, {
      radius: 4,
      color: "#3388ff",
    });
    marker.addTo(map.value);
    tempMarkers.push(marker);

    if (latlngs.length === 1) {
      tempPolygon = L.value.polygon(latlngs, {
        ...options.shapeOptions,
        dashArray: "5, 5",
      });
      tempPolygon.addTo(map.value);
    } else if (tempPolygon) {
      tempPolygon.setLatLngs(latlngs);
    }
  };

  const dblClickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || latlngs.length < 3) return;

    L.value.DomEvent.stop(e);

    latlngs.pop();

    if (latlngs.length >= 3) {
      const polygon = L.value.polygon(latlngs, options.shapeOptions);

      const event: DrawEvent = {
        layer: polygon,
        layerType: "polygon",
        type: "draw:created",
      };

      emit("draw:created", event);

      if (props.edit?.featureGroup) {
        props.edit.featureGroup.addLayer(polygon);
      }
    }

    cleanup();

    if (!options.repeatMode) {
      disable();
      activeMode.value = null;
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !tempPolygon || latlngs.length === 0) return;
    const previewLatLngs = [...latlngs, e.latlng];
    tempPolygon.setLatLngs(previewLatLngs);
  };

  const cleanup = () => {
    if (tempPolygon) {
      tempPolygon.remove();
      tempPolygon = null;
    }
    tempMarkers.forEach((m) => m.remove());
    tempMarkers = [];
    latlngs = [];
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    map.value.on("dblclick", dblClickHandler);
    map.value.on("mousemove", mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("dblclick", dblClickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    cleanup();
  };

  return { enable, disable };
};

const createRectangleHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let startLatLng: LatLng | null = null;
  let tempRectangle: L.Rectangle | null = null;

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    if (!startLatLng) {
      startLatLng = e.latlng;
    } else {
      if (tempRectangle) {
        tempRectangle.remove();
      }

      const bounds = L.value.latLngBounds(startLatLng, e.latlng);
      const rectangle = L.value.rectangle(bounds, options.shapeOptions);

      const event: DrawEvent = {
        layer: rectangle,
        layerType: "rectangle",
        type: "draw:created",
      };

      emit("draw:created", event);

      if (props.edit?.featureGroup) {
        props.edit.featureGroup.addLayer(rectangle);
      }

      startLatLng = null;
      tempRectangle = null;

      if (!options.repeatMode) {
        disable();
        activeMode.value = null;
      }
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !startLatLng || !L.value || !map.value) return;

    if (tempRectangle) {
      tempRectangle.remove();
    }

    const bounds = L.value.latLngBounds(startLatLng, e.latlng);
    tempRectangle = L.value.rectangle(bounds, {
      ...options.shapeOptions,
      dashArray: "5, 5",
    });
    tempRectangle.addTo(map.value);
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    map.value.on("mousemove", mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    if (tempRectangle) {
      tempRectangle.remove();
      tempRectangle = null;
    }
    startLatLng = null;
  };

  return { enable, disable };
};

watch(
  () => map.value,
  (newMap) => {
    if (newMap && L.value) {
      control.value = createDrawControl();
      if (control.value) {
        control.value.addTo(newMap);
      }
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  disableAllHandlers();
  if (control.value && map.value) {
    map.value.removeControl(control.value);
  }
});
</script>

<template>
  <div></div>
</template>

<style>
.leaflet-draw {
  display: flex;
  flex-direction: column;
}

.leaflet-draw-button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #333;
  background: white;
  border-bottom: 1px solid #ccc;
}

.leaflet-draw-button:hover {
  background: #f4f4f4;
}

.leaflet-draw-button:last-child {
  border-bottom: none;
}
</style>
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

export interface LeafletZoomControlProps {
  position?: ControlOptions["position"];
}

const props = withDefaults(defineProps<LeafletZoomControlProps>(), {
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

```ts [src/components/ui/leaflet-map/__tests__/LeafletDrawControl.spec.ts]
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, nextTick } from "vue";
import LeafletDrawControl from "../LeafletDrawControl.vue";
import type { Map as LeafletMap, FeatureGroup } from "leaflet";

vi.mock("leaflet", () => ({
  default: {
    Control: {
      extend: vi.fn(
        (options) =>
          function () {
            return options;
          },
      ),
    },
    DomUtil: {
      create: vi.fn((tag, className) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        return el;
      }),
    },
    DomEvent: {
      disableClickPropagation: vi.fn(),
      disableScrollPropagation: vi.fn(),
      on: vi.fn(),
      stop: vi.fn(),
      preventDefault: vi.fn(),
    },
    marker: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
    })),
    circle: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
      setRadius: vi.fn(),
    })),
    circleMarker: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
    })),
    polyline: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
      setLatLngs: vi.fn(),
    })),
    polygon: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
      setLatLngs: vi.fn(),
    })),
    rectangle: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
    })),
    latLngBounds: vi.fn((start, end) => ({ start, end })),
    featureGroup: vi.fn(() => ({
      addLayer: vi.fn(),
      removeLayer: vi.fn(),
      clearLayers: vi.fn(),
    })),
  },
}));

describe("LeafletDrawControl", () => {
  let mockMap: any;
  let mockL: any;
  let mockFeatureGroup: FeatureGroup;

  beforeEach(async () => {
    const L = (await import("leaflet")).default;
    mockL = L;

    mockMap = {
      on: vi.fn(),
      off: vi.fn(),
      addControl: vi.fn(),
      removeControl: vi.fn(),
      getContainer: vi.fn(() => ({
        style: { cursor: "" },
      })),
    };

    mockFeatureGroup = mockL.featureGroup();
  });

  describe("Props", () => {
    it("should accept position prop", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          position: "topleft",
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      expect(wrapper.props("position")).toBe("topleft");
    });

    it("should use default position when not provided", () => {
      const wrapper = mount(LeafletDrawControl, {
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      expect(wrapper.props("position")).toBe("topright");
    });

    it("should accept draw configuration", () => {
      const drawConfig = {
        marker: true,
        circle: { enabled: true, shapeOptions: { color: "red" } },
      };

      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: drawConfig,
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      expect(wrapper.props("draw")).toEqual(drawConfig);
    });
  });

  describe("Events", () => {
    it("should emit draw:created when a shape is created", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { marker: true },
          edit: { featureGroup: mockFeatureGroup },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      await nextTick();

      const mockMarker = mockL.marker([0, 0]);
      const mockEvent = {
        layer: mockMarker,
        layerType: "marker",
        type: "draw:created",
      };

      wrapper.vm.$emit("draw:created", mockEvent);

      expect(wrapper.emitted("draw:created")).toBeTruthy();
      expect(wrapper.emitted("draw:created")?.[0]).toEqual([mockEvent]);
    });

    it("should emit draw:drawstart when drawing starts", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { polygon: true },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      wrapper.vm.$emit("draw:drawstart", { layerType: "polygon" });

      expect(wrapper.emitted("draw:drawstart")).toBeTruthy();
      expect(wrapper.emitted("draw:drawstart")?.[0]).toEqual([
        { layerType: "polygon" },
      ]);
    });

    it("should emit draw:drawstop when drawing stops", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { circle: true },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      wrapper.vm.$emit("draw:drawstop", { layerType: "circle" });

      expect(wrapper.emitted("draw:drawstop")).toBeTruthy();
      expect(wrapper.emitted("draw:drawstop")?.[0]).toEqual([
        { layerType: "circle" },
      ]);
    });
  });

  describe("Handler Configuration", () => {
    it("should enable only configured handlers", () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: {
            marker: true,
            circle: false,
            polygon: { enabled: true },
          },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      const draw = wrapper.props("draw");
      expect(draw?.marker).toBe(true);
      expect(draw?.circle).toBe(false);
      expect(draw?.polygon).toEqual({ enabled: true });
    });

    it("should pass shapeOptions to handlers", () => {
      const shapeOptions = { color: "blue", weight: 3 };

      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: {
            polyline: {
              enabled: true,
              shapeOptions,
            },
          },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      const draw = wrapper.props("draw");
      expect(draw?.polyline).toEqual({
        enabled: true,
        shapeOptions,
      });
    });

    it("should support repeat mode", () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: {
            marker: {
              enabled: true,
              repeatMode: true,
            },
          },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      const draw = wrapper.props("draw");
      expect((draw?.marker as any).repeatMode).toBe(true);
    });
  });

  describe("FeatureGroup Integration", () => {
    it("should add created layers to featureGroup", async () => {
      const addLayerSpy = vi.fn();
      const customFeatureGroup = {
        ...mockFeatureGroup,
        addLayer: addLayerSpy,
      };

      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { marker: true },
          edit: { featureGroup: customFeatureGroup as any },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      await nextTick();

      expect(wrapper.props("edit")?.featureGroup).toBe(customFeatureGroup);
    });
  });

  describe("Lifecycle", () => {
    it("should create control when map is ready", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { marker: true },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(null),
          },
        },
      });

      await nextTick();

      wrapper.vm.$options.provide = {
        LeafletModuleKey: ref(mockL),
        LeafletMapKey: ref(mockMap),
      };

      await nextTick();
    });

    it("should cleanup handlers on unmount", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { marker: true },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      await nextTick();

      wrapper.unmount();

      expect(mockMap.off).toHaveBeenCalled();
    });
  });

  describe("Multiple Handlers", () => {
    it("should only allow one active handler at a time", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: {
            marker: true,
            circle: true,
            polygon: true,
          },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      await nextTick();
    });
  });

  describe("Cursor Management", () => {
    it("should change cursor to crosshair when drawing", () => {
      mount(LeafletDrawControl, {
        props: {
          draw: { marker: true },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      expect(mockMap.getContainer).toHaveBeenCalled();
    });
  });
});
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

```ts [src/components/ui/leaflet-map/index.ts]
import type { InjectionKey, Ref } from "vue";
import type * as L from "leaflet";
import type { Map, TileLayerOptions } from "leaflet";

type L = typeof L;

export { default as LeafletMap } from "./LeafletMap.vue";
export { default as LeafletZoomControl } from "./LeafletZoomControl.vue";
export { default as LeafletDrawControl } from "./LeafletDrawControl.vue";
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
export type { LeafletZoomControlProps } from "./LeafletZoomControl.vue";
export type {
  LeafletDrawControlProps,
  DrawEvent,
} from "./LeafletDrawControl.vue";
export type { LeafletTileLayerProps } from "./LeafletTileLayer.vue";
export type { LeafletMarkerProps } from "./LeafletMarker.vue";
export type { LeafletCircleProps } from "./LeafletCircle.vue";
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
  try {
    nextTick(async () => {
      if (typeof window === "undefined") return;

      await import("leaflet/dist/leaflet.css");
      L.value = (await import("leaflet")).default;
      nextTick(() => {
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

```vue [src/components/ui/leaflet-map/LeafletDrawControl.vue]
<script setup lang="ts">
import { ref, inject, type Ref, watch, onBeforeUnmount, computed } from "vue";
import {
  type ControlOptions,
  type Layer,
  type LatLng,
  type LeafletEvent,
  type FeatureGroup,
} from "leaflet";
import { LeafletMapKey, LeafletModuleKey } from ".";

export interface DrawHandlerOptions {
  enabled?: boolean;
  shapeOptions?: any;
  repeatMode?: boolean;
}

export interface LeafletDrawControlProps {
  position?: ControlOptions["position"];
  draw?: {
    marker?: DrawHandlerOptions | boolean;
    circle?: DrawHandlerOptions | boolean;
    polyline?: DrawHandlerOptions | boolean;
    polygon?: DrawHandlerOptions | boolean;
    rectangle?: DrawHandlerOptions | boolean;
  };
  edit?: {
    featureGroup: FeatureGroup;
    edit?: boolean;
    remove?: boolean;
  };
}

export interface DrawEvent {
  layer: Layer;
  layerType: string;
  type: string;
}

const props = withDefaults(defineProps<LeafletDrawControlProps>(), {
  position: "topright",
});

const emit = defineEmits<{
  (e: "draw:created", event: DrawEvent): void;
  (e: "draw:edited", event: { layers: Layer[] }): void;
  (e: "draw:deleted", event: { layers: Layer[] }): void;
  (e: "draw:drawstart", event: { layerType: string }): void;
  (e: "draw:drawstop", event: { layerType: string }): void;
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const control = ref<any>(null);
const activeMode = ref<string | null>(null);
const handlers = ref<Map<string, any>>(new Map());
const drawnItems = ref<any>(null);

const createDrawControl = () => {
  if (!L.value || !map.value) return;

  const DrawControl = L.value.Control.extend({
    options: {
      position: props.position,
    },

    onAdd: function (map: L.Map) {
      const container = L.value!.DomUtil.create(
        "div",
        "leaflet-draw leaflet-control leaflet-bar",
      );

      L.value!.DomEvent.disableClickPropagation(container);
      L.value!.DomEvent.disableScrollPropagation(container);

      if (props.draw) {
        if (shouldEnableHandler("marker")) {
          createButton(container, "marker", "📍", "Dessiner un marqueur");
        }
        if (shouldEnableHandler("circle")) {
          createButton(container, "circle", "⭕", "Dessiner un cercle");
        }
        if (shouldEnableHandler("polyline")) {
          createButton(container, "polyline", "〰️", "Dessiner une ligne");
        }
        if (shouldEnableHandler("polygon")) {
          createButton(container, "polygon", "▽", "Dessiner un polygone");
        }
        if (shouldEnableHandler("rectangle")) {
          createButton(container, "rectangle", "▢", "Dessiner un rectangle");
        }
      }

      return container;
    },

    onRemove: function () {
      disableAllHandlers();
    },
  });

  return new DrawControl();
};

const shouldEnableHandler = (type: string): boolean => {
  if (!props.draw) return false;
  const config = props.draw[type as keyof typeof props.draw];
  if (typeof config === "boolean") return config;
  if (typeof config === "object") return config.enabled !== false;
  return false;
};

const getHandlerOptions = (type: string): DrawHandlerOptions => {
  if (!props.draw) return {};
  const config = props.draw[type as keyof typeof props.draw];
  if (typeof config === "object") return config;
  return {};
};

const createButton = (
  container: HTMLElement,
  type: string,
  icon: string,
  title: string,
) => {
  const button = L.value!.DomUtil.create("a", "leaflet-draw-button", container);
  button.href = "#";
  button.title = title;
  button.innerHTML = icon;
  button.setAttribute("role", "button");
  button.setAttribute("aria-label", title);

  L.value!.DomEvent.on(button, "click", (e: Event) => {
    L.value!.DomEvent.preventDefault(e);
    toggleDrawMode(type);
  });

  return button;
};

const toggleDrawMode = (type: string) => {
  if (activeMode.value === type) {
    disableHandler(type);
    activeMode.value = null;
  } else {
    if (activeMode.value) {
      disableHandler(activeMode.value);
    }
    enableHandler(type);
    activeMode.value = type;
  }
};

const enableHandler = (type: string) => {
  if (!map.value || !L.value) return;

  const options = getHandlerOptions(type);
  let handler: any;

  emit("draw:drawstart", { layerType: type });

  switch (type) {
    case "marker":
      handler = createMarkerHandler(options);
      break;
    case "circle":
      handler = createCircleHandler(options);
      break;
    case "polyline":
      handler = createPolylineHandler(options);
      break;
    case "polygon":
      handler = createPolygonHandler(options);
      break;
    case "rectangle":
      handler = createRectangleHandler(options);
      break;
  }

  if (handler) {
    handlers.value.set(type, handler);
    handler.enable();
  }
};

const disableHandler = (type: string) => {
  const handler = handlers.value.get(type);
  if (handler) {
    handler.disable();
    handlers.value.delete(type);
    emit("draw:drawstop", { layerType: type });
  }
};

const disableAllHandlers = () => {
  handlers.value.forEach((handler, type) => {
    disableHandler(type);
  });
};

const createMarkerHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value) return;

    const marker = L.value.marker(e.latlng, options.shapeOptions);

    const event: DrawEvent = {
      layer: marker,
      layerType: "marker",
      type: "draw:created",
    };

    emit("draw:created", event);

    if (props.edit?.featureGroup) {
      props.edit.featureGroup.addLayer(marker);
    }

    if (!options.repeatMode) {
      disable();
      activeMode.value = null;
    }
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
  };

  return { enable, disable };
};

const createCircleHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let tempCircle: L.Circle | null = null;
  let centerLatLng: LatLng | null = null;

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    if (!centerLatLng) {
      centerLatLng = e.latlng;
      tempCircle = L.value.circle(centerLatLng, {
        radius: 0,
        ...options.shapeOptions,
      });
      tempCircle.addTo(map.value);
    } else {
      if (tempCircle) {
        tempCircle.remove();

        const radius = centerLatLng.distanceTo(e.latlng);
        const circle = L.value.circle(centerLatLng, {
          radius,
          ...options.shapeOptions,
        });

        const event: DrawEvent = {
          layer: circle,
          layerType: "circle",
          type: "draw:created",
        };

        emit("draw:created", event);

        if (props.edit?.featureGroup) {
          props.edit.featureGroup.addLayer(circle);
        }
      }

      centerLatLng = null;
      tempCircle = null;

      if (!options.repeatMode) {
        disable();
        activeMode.value = null;
      }
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !centerLatLng || !tempCircle || !L.value) return;
    const radius = centerLatLng.distanceTo(e.latlng);
    tempCircle.setRadius(radius);
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    map.value.on("mousemove", mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    if (tempCircle) {
      tempCircle.remove();
      tempCircle = null;
    }
    centerLatLng = null;
  };

  return { enable, disable };
};

const createPolylineHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let latlngs: LatLng[] = [];
  let tempPolyline: L.Polyline | null = null;
  let tempMarkers: L.CircleMarker[] = [];

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    latlngs.push(e.latlng);

    const marker = L.value.circleMarker(e.latlng, {
      radius: 4,
      color: "#3388ff",
    });
    marker.addTo(map.value);
    tempMarkers.push(marker);

    if (latlngs.length === 1) {
      tempPolyline = L.value.polyline(latlngs, {
        ...options.shapeOptions,
        dashArray: "5, 5",
      });
      tempPolyline.addTo(map.value);
    } else if (tempPolyline) {
      tempPolyline.setLatLngs(latlngs);
    }
  };

  const dblClickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || latlngs.length < 2) return;

    L.value.DomEvent.stop(e);

    latlngs.pop();

    if (latlngs.length >= 2) {
      const polyline = L.value.polyline(latlngs, options.shapeOptions);

      const event: DrawEvent = {
        layer: polyline,
        layerType: "polyline",
        type: "draw:created",
      };

      emit("draw:created", event);

      if (props.edit?.featureGroup) {
        props.edit.featureGroup.addLayer(polyline);
      }
    }

    cleanup();

    if (!options.repeatMode) {
      disable();
      activeMode.value = null;
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !tempPolyline || latlngs.length === 0) return;
    const previewLatLngs = [...latlngs, e.latlng];
    tempPolyline.setLatLngs(previewLatLngs);
  };

  const cleanup = () => {
    if (tempPolyline) {
      tempPolyline.remove();
      tempPolyline = null;
    }
    tempMarkers.forEach((m) => m.remove());
    tempMarkers = [];
    latlngs = [];
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    map.value.on("dblclick", dblClickHandler);
    map.value.on("mousemove", mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("dblclick", dblClickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    cleanup();
  };

  return { enable, disable };
};

const createPolygonHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let latlngs: LatLng[] = [];
  let tempPolygon: L.Polygon | null = null;
  let tempMarkers: L.CircleMarker[] = [];

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    latlngs.push(e.latlng);

    const marker = L.value.circleMarker(e.latlng, {
      radius: 4,
      color: "#3388ff",
    });
    marker.addTo(map.value);
    tempMarkers.push(marker);

    if (latlngs.length === 1) {
      tempPolygon = L.value.polygon(latlngs, {
        ...options.shapeOptions,
        dashArray: "5, 5",
      });
      tempPolygon.addTo(map.value);
    } else if (tempPolygon) {
      tempPolygon.setLatLngs(latlngs);
    }
  };

  const dblClickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || latlngs.length < 3) return;

    L.value.DomEvent.stop(e);

    latlngs.pop();

    if (latlngs.length >= 3) {
      const polygon = L.value.polygon(latlngs, options.shapeOptions);

      const event: DrawEvent = {
        layer: polygon,
        layerType: "polygon",
        type: "draw:created",
      };

      emit("draw:created", event);

      if (props.edit?.featureGroup) {
        props.edit.featureGroup.addLayer(polygon);
      }
    }

    cleanup();

    if (!options.repeatMode) {
      disable();
      activeMode.value = null;
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !tempPolygon || latlngs.length === 0) return;
    const previewLatLngs = [...latlngs, e.latlng];
    tempPolygon.setLatLngs(previewLatLngs);
  };

  const cleanup = () => {
    if (tempPolygon) {
      tempPolygon.remove();
      tempPolygon = null;
    }
    tempMarkers.forEach((m) => m.remove());
    tempMarkers = [];
    latlngs = [];
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    map.value.on("dblclick", dblClickHandler);
    map.value.on("mousemove", mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("dblclick", dblClickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    cleanup();
  };

  return { enable, disable };
};

const createRectangleHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let startLatLng: LatLng | null = null;
  let tempRectangle: L.Rectangle | null = null;

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    if (!startLatLng) {
      startLatLng = e.latlng;
    } else {
      if (tempRectangle) {
        tempRectangle.remove();
      }

      const bounds = L.value.latLngBounds(startLatLng, e.latlng);
      const rectangle = L.value.rectangle(bounds, options.shapeOptions);

      const event: DrawEvent = {
        layer: rectangle,
        layerType: "rectangle",
        type: "draw:created",
      };

      emit("draw:created", event);

      if (props.edit?.featureGroup) {
        props.edit.featureGroup.addLayer(rectangle);
      }

      startLatLng = null;
      tempRectangle = null;

      if (!options.repeatMode) {
        disable();
        activeMode.value = null;
      }
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !startLatLng || !L.value || !map.value) return;

    if (tempRectangle) {
      tempRectangle.remove();
    }

    const bounds = L.value.latLngBounds(startLatLng, e.latlng);
    tempRectangle = L.value.rectangle(bounds, {
      ...options.shapeOptions,
      dashArray: "5, 5",
    });
    tempRectangle.addTo(map.value);
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    map.value.on("mousemove", mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    if (tempRectangle) {
      tempRectangle.remove();
      tempRectangle = null;
    }
    startLatLng = null;
  };

  return { enable, disable };
};

watch(
  () => map.value,
  (newMap) => {
    if (newMap && L.value) {
      control.value = createDrawControl();
      if (control.value) {
        control.value.addTo(newMap);
      }
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  disableAllHandlers();
  if (control.value && map.value) {
    map.value.removeControl(control.value);
  }
});
</script>

<template>
  <div></div>
</template>

<style>
.leaflet-draw {
  display: flex;
  flex-direction: column;
}

.leaflet-draw-button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #333;
  background: white;
  border-bottom: 1px solid #ccc;
}

.leaflet-draw-button:hover {
  background: #f4f4f4;
}

.leaflet-draw-button:last-child {
  border-bottom: none;
}
</style>
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

export interface LeafletZoomControlProps {
  position?: ControlOptions["position"];
}

const props = withDefaults(defineProps<LeafletZoomControlProps>(), {
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

```ts [src/components/ui/leaflet-map/__tests__/LeafletDrawControl.spec.ts]
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref, nextTick } from "vue";
import LeafletDrawControl from "../LeafletDrawControl.vue";
import type { Map as LeafletMap, FeatureGroup } from "leaflet";

vi.mock("leaflet", () => ({
  default: {
    Control: {
      extend: vi.fn(
        (options) =>
          function () {
            return options;
          },
      ),
    },
    DomUtil: {
      create: vi.fn((tag, className) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        return el;
      }),
    },
    DomEvent: {
      disableClickPropagation: vi.fn(),
      disableScrollPropagation: vi.fn(),
      on: vi.fn(),
      stop: vi.fn(),
      preventDefault: vi.fn(),
    },
    marker: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
    })),
    circle: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
      setRadius: vi.fn(),
    })),
    circleMarker: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
    })),
    polyline: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
      setLatLngs: vi.fn(),
    })),
    polygon: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
      setLatLngs: vi.fn(),
    })),
    rectangle: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
    })),
    latLngBounds: vi.fn((start, end) => ({ start, end })),
    featureGroup: vi.fn(() => ({
      addLayer: vi.fn(),
      removeLayer: vi.fn(),
      clearLayers: vi.fn(),
    })),
  },
}));

describe("LeafletDrawControl", () => {
  let mockMap: any;
  let mockL: any;
  let mockFeatureGroup: FeatureGroup;

  beforeEach(async () => {
    const L = (await import("leaflet")).default;
    mockL = L;

    mockMap = {
      on: vi.fn(),
      off: vi.fn(),
      addControl: vi.fn(),
      removeControl: vi.fn(),
      getContainer: vi.fn(() => ({
        style: { cursor: "" },
      })),
    };

    mockFeatureGroup = mockL.featureGroup();
  });

  describe("Props", () => {
    it("should accept position prop", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          position: "topleft",
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      expect(wrapper.props("position")).toBe("topleft");
    });

    it("should use default position when not provided", () => {
      const wrapper = mount(LeafletDrawControl, {
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      expect(wrapper.props("position")).toBe("topright");
    });

    it("should accept draw configuration", () => {
      const drawConfig = {
        marker: true,
        circle: { enabled: true, shapeOptions: { color: "red" } },
      };

      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: drawConfig,
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      expect(wrapper.props("draw")).toEqual(drawConfig);
    });
  });

  describe("Events", () => {
    it("should emit draw:created when a shape is created", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { marker: true },
          edit: { featureGroup: mockFeatureGroup },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      await nextTick();

      const mockMarker = mockL.marker([0, 0]);
      const mockEvent = {
        layer: mockMarker,
        layerType: "marker",
        type: "draw:created",
      };

      wrapper.vm.$emit("draw:created", mockEvent);

      expect(wrapper.emitted("draw:created")).toBeTruthy();
      expect(wrapper.emitted("draw:created")?.[0]).toEqual([mockEvent]);
    });

    it("should emit draw:drawstart when drawing starts", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { polygon: true },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      wrapper.vm.$emit("draw:drawstart", { layerType: "polygon" });

      expect(wrapper.emitted("draw:drawstart")).toBeTruthy();
      expect(wrapper.emitted("draw:drawstart")?.[0]).toEqual([
        { layerType: "polygon" },
      ]);
    });

    it("should emit draw:drawstop when drawing stops", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { circle: true },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      wrapper.vm.$emit("draw:drawstop", { layerType: "circle" });

      expect(wrapper.emitted("draw:drawstop")).toBeTruthy();
      expect(wrapper.emitted("draw:drawstop")?.[0]).toEqual([
        { layerType: "circle" },
      ]);
    });
  });

  describe("Handler Configuration", () => {
    it("should enable only configured handlers", () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: {
            marker: true,
            circle: false,
            polygon: { enabled: true },
          },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      const draw = wrapper.props("draw");
      expect(draw?.marker).toBe(true);
      expect(draw?.circle).toBe(false);
      expect(draw?.polygon).toEqual({ enabled: true });
    });

    it("should pass shapeOptions to handlers", () => {
      const shapeOptions = { color: "blue", weight: 3 };

      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: {
            polyline: {
              enabled: true,
              shapeOptions,
            },
          },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      const draw = wrapper.props("draw");
      expect(draw?.polyline).toEqual({
        enabled: true,
        shapeOptions,
      });
    });

    it("should support repeat mode", () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: {
            marker: {
              enabled: true,
              repeatMode: true,
            },
          },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      const draw = wrapper.props("draw");
      expect((draw?.marker as any).repeatMode).toBe(true);
    });
  });

  describe("FeatureGroup Integration", () => {
    it("should add created layers to featureGroup", async () => {
      const addLayerSpy = vi.fn();
      const customFeatureGroup = {
        ...mockFeatureGroup,
        addLayer: addLayerSpy,
      };

      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { marker: true },
          edit: { featureGroup: customFeatureGroup as any },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      await nextTick();

      expect(wrapper.props("edit")?.featureGroup).toBe(customFeatureGroup);
    });
  });

  describe("Lifecycle", () => {
    it("should create control when map is ready", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { marker: true },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(null),
          },
        },
      });

      await nextTick();

      wrapper.vm.$options.provide = {
        LeafletModuleKey: ref(mockL),
        LeafletMapKey: ref(mockMap),
      };

      await nextTick();
    });

    it("should cleanup handlers on unmount", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: { marker: true },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      await nextTick();

      wrapper.unmount();

      expect(mockMap.off).toHaveBeenCalled();
    });
  });

  describe("Multiple Handlers", () => {
    it("should only allow one active handler at a time", async () => {
      const wrapper = mount(LeafletDrawControl, {
        props: {
          draw: {
            marker: true,
            circle: true,
            polygon: true,
          },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      await nextTick();
    });
  });

  describe("Cursor Management", () => {
    it("should change cursor to crosshair when drawing", () => {
      mount(LeafletDrawControl, {
        props: {
          draw: { marker: true },
        },
        global: {
          provide: {
            LeafletModuleKey: ref(mockL),
            LeafletMapKey: ref(mockMap),
          },
        },
      });

      expect(mockMap.getContainer).toHaveBeenCalled();
    });
  });
});
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

## LeafletDrawControl
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `position`{.primary .text-primary} | `ControlOptions['position']` | topright |  |
| `draw`{.primary .text-primary} | `{
    marker?: DrawHandlerOptions \| boolean;
    circle?: DrawHandlerOptions \| boolean;
    polyline?: DrawHandlerOptions \| boolean;
    polygon?: DrawHandlerOptions \| boolean;
    rectangle?: DrawHandlerOptions \| boolean;
  }` | - |  |
| `edit`{.primary .text-primary} | `{
    featureGroup: FeatureGroup;
    edit?: boolean;
    remove?: boolean;
  }` | - |  |

  ### Events
| Name | Description |
|------|-------------|
| `draw:created`{.primary .text-primary} | — |
| `draw:edited`{.primary .text-primary} | — |
| `draw:deleted`{.primary .text-primary} | — |
| `draw:drawstart`{.primary .text-primary} | — |
| `draw:drawstop`{.primary .text-primary} | — |

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

  ## Examples
  ::hr-underline
  ::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <leaflet-draw-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletDrawControl,
  type DrawEvent,
} from "..";

const drawnItems = ref<any>(null);
const createdLayers = ref<Array<{ type: string; layer: any }>>([]);

const onMapReady = (mapInstance: any) => {
  if (!mapInstance || !mapInstance.map.value) return;

  import("leaflet").then((L) => {
    drawnItems.value = L.default.featureGroup().addTo(mapInstance.map.value);
  });
};

const onDrawCreated = (event: DrawEvent) => {
  console.log("Shape created:", event.layerType, event.layer);
  createdLayers.value.push({
    type: event.layerType,
    layer: event.layer,
  });
};

const onDrawStart = (event: { layerType: string }) => {
  console.log("Drawing started:", event.layerType);
};

const onDrawStop = (event: { layerType: string }) => {
  console.log("Drawing stopped:", event.layerType);
};

const clearAllLayers = () => {
  if (drawnItems.value) {
    drawnItems.value.clearLayers();
    createdLayers.value = [];
  }
};
</script>

<template>
  <div class="w-full h-full flex flex-col gap-4">
    <div class="flex gap-2 items-center p-4 bg-gray-100 rounded">
      <h3 class="font-semibold">Contrôle de dessin Leaflet</h3>
      <button
        @click="clearAllLayers"
        class="ml-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Effacer tout
      </button>
      <span class="text-sm text-gray-600">
        Formes dessinées : {{ createdLayers.length }}
      </span>
    </div>

    <div class="flex-1 relative">
      <LeafletMap
        ref="mapRef"
        class="w-full h-[600px] rounded-lg shadow-lg"
        tile-layer="osm"
        :center-lat="48.8566"
        :center-lng="2.3522"
        :zoom="12"
        @vue:mounted="onMapReady"
      >
        <LeafletTileLayer
          name="osm"
          url-template="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <LeafletZoomControl position="topleft" />

        <LeafletDrawControl
          v-if="drawnItems"
          position="topright"
          :draw="{
            marker: {
              enabled: true,
              repeatMode: false,
            },
            circle: {
              enabled: true,
              shapeOptions: {
                color: '#3388ff',
                fillColor: '#3388ff',
                fillOpacity: 0.2,
              },
            },
            polyline: {
              enabled: true,
              shapeOptions: {
                color: '#f03',
                weight: 4,
              },
            },
            polygon: {
              enabled: true,
              shapeOptions: {
                color: '#0f3',
                fillColor: '#0f3',
                fillOpacity: 0.3,
              },
            },
            rectangle: {
              enabled: true,
              shapeOptions: {
                color: '#f90',
                fillColor: '#f90',
                fillOpacity: 0.2,
              },
            },
          }"
          :edit="{
            featureGroup: drawnItems,
            edit: false,
            remove: false,
          }"
          @draw:created="onDrawCreated"
          @draw:drawstart="onDrawStart"
          @draw:drawstop="onDrawStop"
        />
      </LeafletMap>
    </div>

    <div class="p-4 bg-gray-50 rounded max-h-48 overflow-auto">
      <h4 class="font-semibold mb-2">Formes créées :</h4>
      <ul class="space-y-1">
        <li
          v-for="(item, index) in createdLayers"
          :key="index"
          class="text-sm flex items-center gap-2"
        >
          <span class="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
          <span class="font-medium">{{ item.type }}</span>
          <span class="text-gray-500">- Forme #{{ index + 1 }}</span>
        </li>
        <li
          v-if="createdLayers.length === 0"
          class="text-gray-400 text-sm italic"
        >
          Aucune forme dessinée pour le moment
        </li>
      </ul>
    </div>
  </div>
</template>
```
  :::
::

::tip
You can copy and adapt this template for any component documentation.
::