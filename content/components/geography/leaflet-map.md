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
  LeafletCircle,
  type LeafletMapExposed,
} from "@/components/ui/leaflet-map";

type LeafletMapInstance = ComponentPublicInstance & LeafletMapExposed;

const mapRef = ref<LeafletMapInstance | null>(null);
const zoom = ref(13);
const locationCoords = ref<{ lat: number; lng: number; accuracy: number }>({
  lat: 43.3026,
  lng: 5.3691,
  accuracy: 500,
});
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
        :center-lat="locationCoords.lat"
        :center-lng="locationCoords.lng"
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
export { default as LeafletPolyline } from "./LeafletPolyline.vue";
export { default as LeafletPolygon } from "./LeafletPolygon.vue";
export { default as LeafletRectangle } from "./LeafletRectangle.vue";

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
export type { LeafletPolylineProps } from "./LeafletPolyline.vue";
export type { LeafletPolygonProps } from "./LeafletPolygon.vue";
export type { LeafletRectangleProps } from "./LeafletRectangle.vue";
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
import "./leaflet-editing.css";

export interface LeafletCircleProps {
  lat?: number | string;
  lng?: number | string;
  radius?: number | string;
  editable?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletCircleProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  radius: 100,
  editable: false,
});

const emit = defineEmits<{
  "update:lat": [lat: number];
  "update:lng": [lng: number];
  "update:radius": [radius: number];
}>();

const { getTailwindBaseCssValues } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const circle = ref<L.Circle | null>(null);
const centerMarker = ref<L.Marker | null>(null);
const radiusMarker = ref<L.Marker | null>(null);

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

const clearEditMarkers = () => {
  if (centerMarker.value) {
    centerMarker.value.remove();
    centerMarker.value = null;
  }
  if (radiusMarker.value) {
    radiusMarker.value.remove();
    radiusMarker.value = null;
  }
};

const enableEditing = () => {
  if (!circle.value || !L.value || !map.value) return;

  clearEditMarkers();

  const center = circle.value.getLatLng();
  const radius = circle.value.getRadius();

  centerMarker.value = L.value
    .marker(center, {
      draggable: true,
      icon: L.value.divIcon({
        className: "leaflet-editing-icon",
        html: '<div style="width:10px;height:10px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: [10, 10],
      }),
    })
    .addTo(map.value);

  centerMarker.value.on("drag", () => {
    const newCenter = centerMarker.value!.getLatLng();
    circle.value!.setLatLng(newCenter);
    if (radiusMarker.value) {
      const bearing = 90;
      const radiusLatLng = L.value!.latLng(
        newCenter.lat,
        newCenter.lng +
          radius / 111320 / Math.cos((newCenter.lat * Math.PI) / 180),
      );
      radiusMarker.value.setLatLng(radiusLatLng);
    }
  });

  centerMarker.value.on("dragend", () => {
    const newCenter = centerMarker.value!.getLatLng();
    emit("update:lat", newCenter.lat);
    emit("update:lng", newCenter.lng);
  });

  const radiusLatLng = L.value.latLng(
    center.lat,
    center.lng + radius / 111320 / Math.cos((center.lat * Math.PI) / 180),
  );
  radiusMarker.value = L.value
    .marker(radiusLatLng, {
      draggable: true,
      icon: L.value.divIcon({
        className: "leaflet-editing-icon",
        html: '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: [8, 8],
      }),
    })
    .addTo(map.value);

  radiusMarker.value.on("drag", () => {
    const center = circle.value!.getLatLng();
    const radiusPoint = radiusMarker.value!.getLatLng();
    const newRadius = center.distanceTo(radiusPoint);
    circle.value!.setRadius(newRadius);
  });

  radiusMarker.value.on("dragend", () => {
    const newRadius = circle.value!.getRadius();
    emit("update:radius", newRadius);
  });
};

watch(
  () => [map.value, props.lat, props.lng, props.radius, props.editable],
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

        if (props.editable) {
          enableEditing();
        } else {
          clearEditMarkers();
        }
      } else {
        if (circle.value) {
          circle.value.remove();
          circle.value = null as any;
        }
        clearEditMarkers();
      }
    });
  },
  { immediate: true, flush: "post" },
);

onBeforeUnmount(() => {
  clearEditMarkers();
  if (circle.value) {
    circle.value.remove();
  }
});
</script>

<template><slot /></template>
```

```vue [src/components/ui/leaflet-map/LeafletDrawControl.vue]
<script setup lang="ts">
import { ref, inject, type Ref, watch, onBeforeUnmount, nextTick } from "vue";
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

    if (drawnItems.value) {
      drawnItems.value.addLayer(marker);
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

        if (drawnItems.value) {
          drawnItems.value.addLayer(circle);
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

      if (drawnItems.value) {
        drawnItems.value.addLayer(polyline);
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

      if (drawnItems.value) {
        drawnItems.value.addLayer(polygon);
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

      if (drawnItems.value) {
        drawnItems.value.addLayer(rectangle);
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
  async (newMap) => {
    if (!newMap || !L.value) return;

    await nextTick();
    await nextTick();

    try {
      if (!drawnItems.value) {
        drawnItems.value = L.value.featureGroup().addTo(newMap);
      }

      control.value = createDrawControl();
      if (control.value) {
        control.value.addTo(newMap);
      }
    } catch (error) {
      console.error("Error creating draw control:", error);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  disableAllHandlers();
  if (control.value && map.value) {
    map.value.removeControl(control.value);
  }
  if (drawnItems.value && map.value) {
    map.value.removeLayer(drawnItems.value);
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
  editable?: boolean;
  draggable?: boolean;
}

const props = withDefaults(defineProps<LeafletMarkerProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  editable: false,
  draggable: false,
});

const emit = defineEmits<{
  "update:lat": [lat: number];
  "update:lng": [lng: number];
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const marker = ref<L.Marker | null>(null);

watch(
  () => [props.lat, props.lng, props.editable, props.draggable],
  ([newLat, newLng]) => {
    nextTick(() => {
      if (!L.value) return;
      if (map.value && !isNaN(Number(newLat)) && !isNaN(Number(newLng))) {
        const isDraggable = props.editable || props.draggable;

        if (marker.value) {
          marker.value.setLatLng([Number(newLat), Number(newLng)]);
          marker.value.options.draggable = isDraggable;
          if (isDraggable) {
            marker.value.dragging?.enable();
          } else {
            marker.value.dragging?.disable();
          }
        } else {
          marker.value = L.value.marker([Number(newLat), Number(newLng)], {
            draggable: isDraggable,
          });

          if (isDraggable) {
            marker.value.on("dragend", () => {
              const latlng = marker.value!.getLatLng();
              emit("update:lat", latlng.lat);
              emit("update:lng", latlng.lng);
            });
          }

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
    if (newMap && L.value && !marker.value) {
      const isDraggable = props.editable || props.draggable;
      marker.value = L.value.marker([Number(props.lat), Number(props.lng)], {
        draggable: isDraggable,
      });

      if (isDraggable) {
        marker.value.on("dragend", () => {
          const latlng = marker.value!.getLatLng();
          emit("update:lat", latlng.lat);
          emit("update:lng", latlng.lng);
        });
      }

      marker.value.addTo(newMap);
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (map.value && L.value && !marker.value) {
    const isDraggable = props.editable || props.draggable;
    marker.value = L.value.marker([Number(props.lat), Number(props.lng)], {
      draggable: isDraggable,
    });

    if (isDraggable) {
      marker.value.on("dragend", () => {
        const latlng = marker.value!.getLatLng();
        emit("update:lat", latlng.lat);
        emit("update:lng", latlng.lng);
      });
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

```vue [src/components/ui/leaflet-map/LeafletPolygon.vue]
<script setup lang="ts">
import {
  inject,
  watch,
  ref,
  type Ref,
  nextTick,
  onBeforeUnmount,
  type HTMLAttributes,
} from "vue";
import { useTailwindClassParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletMapKey, LeafletModuleKey } from ".";
import "./leaflet-editing.css";

export interface LeafletPolygonProps {
  latlngs?: Array<[number, number]> | Array<{ lat: number; lng: number }>;
  editable?: boolean;
  draggable?: boolean;
  interactive?: boolean;
  autoClose?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletPolygonProps>(), {
  latlngs: () => [],
  editable: false,
  draggable: false,
  interactive: true,
  autoClose: true,
});

const emit = defineEmits<{
  "update:latlngs": [latlngs: Array<[number, number]>];
  closed: [];
}>();

const { getTailwindBaseCssValues } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const polygon = ref<L.Polygon | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const firstPointMarker = ref<L.Marker | null>(null);
const isDragging = ref(false);

const normalizeLatLngs = (
  latlngs: Array<[number, number]> | Array<{ lat: number; lng: number }>,
): Array<[number, number]> => {
  return latlngs.map((point) => {
    if (Array.isArray(point)) {
      return point;
    }
    return [point.lat, point.lng] as [number, number];
  });
};

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
    color: cssValues["color"] || "#3388ff",
    fillColor: cssValues["background-color"] || "#3388ff",
    fillOpacity: cssValues["opacity"] ? parseFloat(cssValues["opacity"]) : 0.2,
  };
};

const clearEditMarkers = () => {
  editMarkers.value.forEach((marker) => marker.remove());
  editMarkers.value = [];
  if (firstPointMarker.value) {
    firstPointMarker.value.remove();
    firstPointMarker.value = null;
  }
};

const enableEditing = () => {
  if (!polygon.value || !L.value || !map.value) return;

  clearEditMarkers();

  const latlngs = polygon.value.getLatLngs()[0] as L.LatLng[];

  latlngs.forEach((latlng, index) => {
    const isFirstPoint = index === 0;
    const marker = L.value!.marker(latlng, {
      draggable: true,
      icon: L.value!.divIcon({
        className: isFirstPoint
          ? "leaflet-editing-icon leaflet-editing-icon-first"
          : "leaflet-editing-icon",
        html: isFirstPoint
          ? '<div style="width:12px;height:12px;border-radius:50%;background:#fff;border:2px solid #3388ff;cursor:pointer;"></div>'
          : '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: isFirstPoint ? [12, 12] : [8, 8],
      }),
    }).addTo(map.value!);

    if (isFirstPoint && props.autoClose) {
      firstPointMarker.value = marker;

      marker.on("click", () => {
        emit("closed");
      });
    }

    marker.on("drag", () => {
      const newLatLngs = [...latlngs];
      newLatLngs[index] = marker.getLatLng();
      polygon.value!.setLatLngs([newLatLngs]);
    });

    marker.on("dragend", () => {
      const updatedLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map(
        (ll) => [ll.lat, ll.lng],
      ) as Array<[number, number]>;
      emit("update:latlngs", updatedLatLngs);
    });

    editMarkers.value.push(marker);
  });
};

const enableDragging = () => {
  if (!polygon.value || !L.value || !map.value) return;

  let startLatLngs: L.LatLng[] = [];
  let startMousePos: L.LatLng | null = null;

  polygon.value.on("mousedown", (e: any) => {
    if (!props.draggable || props.editable) return;
    isDragging.value = true;
    startLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map((ll) =>
      L.value!.latLng(ll.lat, ll.lng),
    );
    startMousePos = e.latlng;
    map.value!.dragging.disable();
    e.originalEvent.stopPropagation();
  });

  map.value.on("mousemove", (e: any) => {
    if (!isDragging.value || !startMousePos) return;

    const deltaLat = e.latlng.lat - startMousePos.lat;
    const deltaLng = e.latlng.lng - startMousePos.lng;

    const newLatLngs = startLatLngs.map((ll) =>
      L.value!.latLng(ll.lat + deltaLat, ll.lng + deltaLng),
    );

    polygon.value!.setLatLngs([newLatLngs]);
  });

  map.value.on("mouseup", () => {
    if (!isDragging.value) return;
    isDragging.value = false;
    map.value!.dragging.enable();

    const updatedLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map(
      (ll) => [ll.lat, ll.lng],
    ) as Array<[number, number]>;
    emit("update:latlngs", updatedLatLngs);
  });
};

watch(
  () => [
    map.value,
    props.latlngs,
    props.editable,
    props.draggable,
    props.interactive,
  ],
  () => {
    nextTick(() => {
      if (map.value && L.value && props.latlngs && props.latlngs.length >= 3) {
        const normalizedLatLngs = normalizeLatLngs(props.latlngs);

        if (polygon.value) {
          polygon.value.setLatLngs([normalizedLatLngs]);
          const colors = getColors();
          polygon.value.setStyle({
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
        } else {
          const colors = getColors();
          polygon.value = L.value.polygon([normalizedLatLngs], {
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
            interactive: props.interactive,
          });
          polygon.value.addTo(map.value);
        }

        if (props.editable) {
          enableEditing();
        } else {
          clearEditMarkers();
        }

        if (props.draggable || props.editable) {
          enableDragging();
        }
      } else {
        if (polygon.value) {
          polygon.value.remove();
          polygon.value = null;
        }
        clearEditMarkers();
      }
    });
  },
  { immediate: true, flush: "post" },
);

onBeforeUnmount(() => {
  clearEditMarkers();
  if (polygon.value) {
    polygon.value.remove();
  }
});
</script>

<template><slot /></template>
```

```vue [src/components/ui/leaflet-map/LeafletPolyline.vue]
<script setup lang="ts">
import {
  inject,
  watch,
  ref,
  type Ref,
  nextTick,
  onBeforeUnmount,
  type HTMLAttributes,
} from "vue";
import { useTailwindClassParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletMapKey, LeafletModuleKey } from ".";
import "./leaflet-editing.css";

export interface LeafletPolylineProps {
  latlngs?: Array<[number, number]> | Array<{ lat: number; lng: number }>;
  weight?: number;
  editable?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletPolylineProps>(), {
  latlngs: () => [],
  weight: 3,
  editable: false,
});

const emit = defineEmits<{
  "update:latlngs": [latlngs: Array<[number, number]>];
}>();

const { getTailwindBaseCssValues } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const polyline = ref<L.Polyline | null>(null);
const editMarkers = ref<L.Marker[]>([]);

const normalizeLatLngs = (
  latlngs: Array<[number, number]> | Array<{ lat: number; lng: number }>,
): Array<[number, number]> => {
  return latlngs.map((point) => {
    if (Array.isArray(point)) {
      return point;
    }
    return [point.lat, point.lng] as [number, number];
  });
};

const getColors = () => {
  const classNames = props.class ? props.class.toString().split(" ") : [];
  const el = document.createElement("div");
  el.className = classNames.join(" ");
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.zIndex = "-9999";
  document.body.appendChild(el);
  const cssValues = getTailwindBaseCssValues(el, ["color", "opacity"]);
  document.body.removeChild(el);
  return {
    color: cssValues["color"] || "#3388ff",
    opacity: cssValues["opacity"] ? parseFloat(cssValues["opacity"]) : 1,
  };
};

const clearEditMarkers = () => {
  editMarkers.value.forEach((marker) => marker.remove());
  editMarkers.value = [];
};

const enableEditing = () => {
  if (!polyline.value || !L.value || !map.value) return;

  clearEditMarkers();

  const latlngs = polyline.value.getLatLngs() as L.LatLng[];
  latlngs.forEach((latlng, index) => {
    const marker = L.value!.marker(latlng, {
      draggable: true,
      icon: L.value!.divIcon({
        className: "leaflet-editing-icon",
        iconSize: [8, 8],
      }),
    }).addTo(map.value!);

    marker.on("drag", () => {
      const newLatLngs = [...latlngs];
      newLatLngs[index] = marker.getLatLng();
      polyline.value!.setLatLngs(newLatLngs);
    });

    marker.on("dragend", () => {
      const updatedLatLngs = polyline.value!.getLatLngs() as L.LatLng[];
      emit(
        "update:latlngs",
        updatedLatLngs.map((ll) => [ll.lat, ll.lng]),
      );
    });

    editMarkers.value.push(marker);
  });
};

watch(
  () => [map.value, props.latlngs, props.weight, props.editable],
  () => {
    nextTick(() => {
      if (map.value && L.value && props.latlngs && props.latlngs.length > 0) {
        const normalizedLatLngs = normalizeLatLngs(props.latlngs);

        if (polyline.value) {
          polyline.value.setLatLngs(normalizedLatLngs);
          const colors = getColors();
          polyline.value.setStyle({
            color: colors.color,
            weight: props.weight,
            opacity: colors.opacity,
          });
        } else {
          const colors = getColors();
          polyline.value = L.value.polyline(normalizedLatLngs, {
            color: colors.color,
            weight: props.weight,
            opacity: colors.opacity,
          });
          polyline.value.addTo(map.value);
        }

        if (props.editable) {
          enableEditing();
        } else {
          clearEditMarkers();
        }
      } else {
        if (polyline.value) {
          polyline.value.remove();
          polyline.value = null;
        }
        clearEditMarkers();
      }
    });
  },
  { immediate: true, flush: "post" },
);

onBeforeUnmount(() => {
  clearEditMarkers();
  if (polyline.value) {
    polyline.value.remove();
  }
});
</script>

<template><slot /></template>
```

```vue [src/components/ui/leaflet-map/LeafletRectangle.vue]
<script setup lang="ts">
import {
  inject,
  watch,
  ref,
  type Ref,
  nextTick,
  onBeforeUnmount,
  type HTMLAttributes,
} from "vue";
import { useTailwindClassParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletMapKey, LeafletModuleKey } from ".";
import "./leaflet-editing.css";

export interface LeafletRectangleProps {
  bounds?: [[number, number], [number, number]];
  editable?: boolean;
  draggable?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletRectangleProps>(), {
  bounds: () => [
    [0, 0],
    [0, 0],
  ],
  editable: false,
  draggable: false,
});

const emit = defineEmits<{
  "update:bounds": [bounds: [[number, number], [number, number]]];
}>();

const { getTailwindBaseCssValues } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const rectangle = ref<L.Rectangle | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const isDragging = ref(false);

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
    color: cssValues["color"] || "#3388ff",
    fillColor: cssValues["background-color"] || "#3388ff",
    fillOpacity: cssValues["opacity"] ? parseFloat(cssValues["opacity"]) : 0.2,
  };
};

const clearEditMarkers = () => {
  editMarkers.value.forEach((marker) => marker.remove());
  editMarkers.value = [];
};

const enableEditing = () => {
  if (!rectangle.value || !L.value || !map.value) return;

  clearEditMarkers();

  const bounds = rectangle.value.getBounds();
  const corners = [
    bounds.getSouthWest(),
    bounds.getNorthWest(),
    bounds.getNorthEast(),
    bounds.getSouthEast(),
  ];

  corners.forEach((corner, index) => {
    const marker = L.value!.marker(corner, {
      draggable: true,
      icon: L.value!.divIcon({
        className: "leaflet-editing-icon",
        iconSize: [8, 8],
      }),
    }).addTo(map.value!);

    marker.on("drag", () => {
      const currentBounds = rectangle.value!.getBounds();
      const newCorner = marker.getLatLng();

      let newBounds: L.LatLngBounds;
      switch (index) {
        case 0:
          newBounds = L.value!.latLngBounds(
            newCorner,
            currentBounds.getNorthEast(),
          );
          break;
        case 1:
          newBounds = L.value!.latLngBounds(
            [currentBounds.getSouth(), newCorner.lng],
            [newCorner.lat, currentBounds.getEast()],
          );
          break;
        case 2:
          newBounds = L.value!.latLngBounds(
            currentBounds.getSouthWest(),
            newCorner,
          );
          break;
        case 3:
          newBounds = L.value!.latLngBounds(
            [newCorner.lat, currentBounds.getWest()],
            [currentBounds.getNorth(), newCorner.lng],
          );
          break;
        default:
          return;
      }

      rectangle.value!.setBounds(newBounds);

      const updatedCorners = [
        newBounds.getSouthWest(),
        newBounds.getNorthWest(),
        newBounds.getNorthEast(),
        newBounds.getSouthEast(),
      ];
      editMarkers.value.forEach((m, i) => {
        if (i !== index && updatedCorners[i]) {
          m.setLatLng(updatedCorners[i]!);
        }
      });
    });

    marker.on("dragend", () => {
      const updatedBounds = rectangle.value!.getBounds();
      emit("update:bounds", [
        [updatedBounds.getSouth(), updatedBounds.getWest()],
        [updatedBounds.getNorth(), updatedBounds.getEast()],
      ]);
    });

    editMarkers.value.push(marker);
  });
};

const enableDragging = () => {
  if (!rectangle.value || !L.value || !map.value) return;

  let startBounds: L.LatLngBounds | null = null;
  let startMousePos: L.LatLng | null = null;

  rectangle.value.on("mousedown", (e: any) => {
    if (!props.draggable || props.editable) return;
    isDragging.value = true;
    startBounds = rectangle.value!.getBounds();
    startMousePos = e.latlng;
    map.value!.dragging.disable();
    e.originalEvent.stopPropagation();
  });

  map.value.on("mousemove", (e: any) => {
    if (!isDragging.value || !startBounds || !startMousePos) return;

    const deltaLat = e.latlng.lat - startMousePos.lat;
    const deltaLng = e.latlng.lng - startMousePos.lng;

    const newBounds = L.value!.latLngBounds(
      [startBounds.getSouth() + deltaLat, startBounds.getWest() + deltaLng],
      [startBounds.getNorth() + deltaLat, startBounds.getEast() + deltaLng],
    );

    rectangle.value!.setBounds(newBounds);
  });

  map.value.on("mouseup", () => {
    if (!isDragging.value) return;
    isDragging.value = false;
    map.value!.dragging.enable();

    const updatedBounds = rectangle.value!.getBounds();
    emit("update:bounds", [
      [updatedBounds.getSouth(), updatedBounds.getWest()],
      [updatedBounds.getNorth(), updatedBounds.getEast()],
    ]);
  });
};

watch(
  () => [map.value, props.bounds, props.editable, props.draggable],
  () => {
    nextTick(() => {
      if (
        map.value &&
        L.value &&
        props.bounds &&
        props.bounds.length === 2 &&
        props.bounds[0].length === 2 &&
        props.bounds[1].length === 2
      ) {
        if (rectangle.value) {
          rectangle.value.setBounds(props.bounds);
          const colors = getColors();
          rectangle.value.setStyle({
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
        } else {
          const colors = getColors();
          rectangle.value = L.value.rectangle(props.bounds, {
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
          rectangle.value.addTo(map.value);
        }

        if (props.editable) {
          enableEditing();
        } else {
          clearEditMarkers();
        }

        if (props.draggable || props.editable) {
          enableDragging();
        }
      } else {
        if (rectangle.value) {
          rectangle.value.remove();
          rectangle.value = null;
        }
        clearEditMarkers();
      }
    });
  },
  { immediate: true, flush: "post" },
);

onBeforeUnmount(() => {
  clearEditMarkers();
  if (rectangle.value) {
    rectangle.value.remove();
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
| `editable`{.primary .text-primary} | `boolean` | false |  |
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
| `editable`{.primary .text-primary} | `boolean` | false |  |
| `draggable`{.primary .text-primary} | `boolean` | false |  |

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

## LeafletPolygon
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `latlngs`{.primary .text-primary} | `Array<[number, number]> \| Array<{ lat: number; lng: number }>` |  |  |
| `editable`{.primary .text-primary} | `boolean` | false |  |
| `draggable`{.primary .text-primary} | `boolean` | false |  |
| `interactive`{.primary .text-primary} | `boolean` | true |  |
| `autoClose`{.primary .text-primary} | `boolean` | true |  |
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

## LeafletPolyline
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `latlngs`{.primary .text-primary} | `Array<[number, number]> \| Array<{ lat: number; lng: number }>` |  |  |
| `weight`{.primary .text-primary} | `number` | 3 |  |
| `editable`{.primary .text-primary} | `boolean` | false |  |
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

## LeafletRectangle
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `bounds`{.primary .text-primary} | `[[number, number], [number, number]]` | 0,0,0,0 |  |
| `editable`{.primary .text-primary} | `boolean` | false |  |
| `draggable`{.primary .text-primary} | `boolean` | false |  |
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
  type LeafletMapExposed,
} from "..";

const mapRef = ref<LeafletMapExposed | null>(null);
const createdLayers = ref<Array<{ type: string; layer: any }>>([]);

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
  const map = mapRef.value?.map;
  if (map) {
    map.eachLayer((layer: any) => {
      if (layer instanceof (window as any).L.FeatureGroup && layer !== map) {
        layer.clearLayers();
      }
    });
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
        name="draw-demo"
        class="w-full h-[600px] rounded-lg shadow-lg"
        tile-layer="osm"
        :center-lat="48.8566"
        :center-lng="2.3522"
        :zoom="12"
      >
        <LeafletTileLayer
          name="osm"
          url-template="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <LeafletZoomControl position="topleft" />

        <LeafletDrawControl
          position="topleft"
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

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <leaflet-shapes-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletMarker,
  LeafletCircle,
  LeafletPolyline,
  LeafletPolygon,
  LeafletRectangle,
  type LeafletMapExposed,
} from "..";

const mapRef = ref<LeafletMapExposed | null>(null);

const editMode = ref(false);

const markers = ref([
  { id: 1, lat: 48.8566, lng: 2.3522, label: "Paris" },
  { id: 2, lat: 48.8738, lng: 2.295, label: "Arc de Triomphe" },
  { id: 3, lat: 48.8584, lng: 2.2945, label: "Tour Eiffel" },
]);

const circles = ref([
  {
    id: 1,
    lat: 48.8566,
    lng: 2.3522,
    radius: 500,
    class: "text-blue-500 bg-blue-500/20",
  },
  {
    id: 2,
    lat: 48.8738,
    lng: 2.295,
    radius: 300,
    class: "text-green-500 bg-green-500/30",
  },
]);

const polylines = ref([
  {
    id: 1,
    latlngs: [
      [48.8566, 2.3522],
      [48.8738, 2.295],
      [48.8584, 2.2945],
    ] as Array<[number, number]>,
    class: "text-red-500",
    weight: 4,
  },
]);

const polygons = ref([
  {
    id: 1,
    latlngs: [
      [48.86, 2.34],
      [48.86, 2.36],
      [48.85, 2.36],
      [48.85, 2.34],
    ] as Array<[number, number]>,
    class: "text-purple-500 bg-purple-500/30",
  },
]);

const rectangles = ref([
  {
    id: 1,
    bounds: [
      [48.84, 2.28],
      [48.845, 2.29],
    ] as [[number, number], [number, number]],
    class: "text-orange-500 bg-orange-500/20",
  },
]);

const editableShapes = ref({
  markers: false,
  circles: false,
  polylines: false,
  polygons: false,
  rectangles: false,
});

const toggleEditMode = () => {
  editMode.value = !editMode.value;

  editableShapes.value.markers = editMode.value;
  editableShapes.value.circles = editMode.value;
  editableShapes.value.polylines = editMode.value;
  editableShapes.value.polygons = editMode.value;
  editableShapes.value.rectangles = editMode.value;
};

const updateMarker = (id: number, lat: number, lng: number) => {
  const marker = markers.value.find((m) => m.id === id);
  if (marker) {
    marker.lat = lat;
    marker.lng = lng;
    console.log(`Marker ${id} updated:`, { lat, lng });
  }
};

const updateCircle = (
  id: number,
  updates: { lat?: number; lng?: number; radius?: number },
) => {
  const circle = circles.value.find((c) => c.id === id);
  if (circle) {
    if (updates.lat !== undefined) circle.lat = updates.lat;
    if (updates.lng !== undefined) circle.lng = updates.lng;
    if (updates.radius !== undefined) circle.radius = updates.radius;
    console.log(`Circle ${id} updated:`, updates);
  }
};

const updatePolyline = (id: number, latlngs: Array<[number, number]>) => {
  const polyline = polylines.value.find((p) => p.id === id);
  if (polyline) {
    polyline.latlngs = latlngs;
    console.log(`Polyline ${id} updated:`, latlngs);
  }
};

const updatePolygon = (id: number, latlngs: Array<[number, number]>) => {
  const polygon = polygons.value.find((p) => p.id === id);
  if (polygon) {
    polygon.latlngs = latlngs;
    console.log(`Polygon ${id} updated:`, latlngs);
  }
};

const updateRectangle = (
  id: number,
  bounds: [[number, number], [number, number]],
) => {
  const rectangle = rectangles.value.find((r) => r.id === id);
  if (rectangle) {
    rectangle.bounds = bounds;
    console.log(`Rectangle ${id} updated:`, bounds);
  }
};

const onPolygonClosed = (id: number) => {
  console.log(`Polygon ${id} closed!`);

  editableShapes.value.polygons = false;
};
</script>

<template>
  <div class="w-full h-full flex flex-col gap-4">
    <div class="p-4 bg-gray-100 rounded flex items-center justify-between">
      <div>
        <h3 class="font-semibold">Démonstration des formes Leaflet</h3>
        <p class="text-sm text-gray-600">
          {{
            editMode
              ? "Mode édition activé - Déplacez les formes"
              : "Mode visualisation"
          }}
        </p>
      </div>
      <button
        @click="toggleEditMode"
        :class="[
          'px-6 py-2 rounded-lg font-medium transition-colors',
          editMode
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-blue-500 hover:bg-blue-600 text-white',
        ]"
      >
        {{ editMode ? "✓ Édition active" : "Activer l'édition" }}
      </button>
    </div>

    <div
      class="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800"
      v-if="editMode"
    >
      💡 <strong>Mode édition :</strong> Déplacez les marqueurs et modifiez les
      cercles (points blancs). Les polylignes, polygones et rectangles sont
      déplaçables - cliquez et faites glisser.
    </div>

    <div class="flex-1 relative">
      <LeafletMap
        ref="mapRef"
        name="shapes-demo"
        class="w-full h-[600px] rounded-lg shadow-lg"
        tile-layer="osm"
        :center-lat="48.8566"
        :center-lng="2.3522"
        :zoom="13"
      >
        <LeafletTileLayer
          name="osm"
          url-template="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        <LeafletZoomControl position="topleft" />

        <LeafletMarker
          v-for="marker in markers"
          :key="`marker-${marker.id}`"
          :lat="marker.lat"
          :lng="marker.lng"
          :editable="editableShapes.markers"
          @update:lat="(lat) => updateMarker(marker.id, lat, marker.lng)"
          @update:lng="(lng) => updateMarker(marker.id, marker.lat, lng)"
        />

        <LeafletCircle
          v-for="circle in circles"
          :key="`circle-${circle.id}`"
          :lat="circle.lat"
          :lng="circle.lng"
          :radius="circle.radius"
          :class="circle.class"
          :editable="editableShapes.circles"
          @update:lat="(lat) => updateCircle(circle.id, { lat })"
          @update:lng="(lng) => updateCircle(circle.id, { lng })"
          @update:radius="(radius) => updateCircle(circle.id, { radius })"
        />

        <LeafletPolyline
          v-for="polyline in polylines"
          :key="`polyline-${polyline.id}`"
          :latlngs="polyline.latlngs"
          :weight="polyline.weight"
          :class="polyline.class"
          :editable="editableShapes.polylines"
          @update:latlngs="(latlngs) => updatePolyline(polyline.id, latlngs)"
        />

        <LeafletPolygon
          v-for="polygon in polygons"
          :key="`polygon-${polygon.id}`"
          :latlngs="polygon.latlngs"
          :class="polygon.class"
          :draggable="editableShapes.polygons"
          :auto-close="true"
          @update:latlngs="(latlngs) => updatePolygon(polygon.id, latlngs)"
          @closed="() => onPolygonClosed(polygon.id)"
        />

        <LeafletRectangle
          v-for="rectangle in rectangles"
          :key="`rectangle-${rectangle.id}`"
          :bounds="rectangle.bounds"
          :class="rectangle.class"
          :draggable="editableShapes.rectangles"
          @update:bounds="(bounds) => updateRectangle(rectangle.id, bounds)"
        />
      </LeafletMap>
    </div>

    <div class="p-4 bg-gray-50 rounded">
      <h4 class="font-semibold mb-2">Statistiques</h4>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div>
          <div class="text-gray-500">Marqueurs</div>
          <div class="text-lg font-bold text-blue-600">
            {{ markers.length }}
          </div>
        </div>
        <div>
          <div class="text-gray-500">Cercles</div>
          <div class="text-lg font-bold text-green-600">
            {{ circles.length }}
          </div>
        </div>
        <div>
          <div class="text-gray-500">Polylignes</div>
          <div class="text-lg font-bold text-red-600">
            {{ polylines.length }}
          </div>
        </div>
        <div>
          <div class="text-gray-500">Polygones</div>
          <div class="text-lg font-bold text-purple-600">
            {{ polygons.length }}
          </div>
        </div>
        <div>
          <div class="text-gray-500">Rectangles</div>
          <div class="text-lg font-bold text-orange-600">
            {{ rectangles.length }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
```
  :::
::

::tip
You can copy and adapt this template for any component documentation.
::