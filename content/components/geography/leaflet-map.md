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
export { default as LeafletFeaturesEditor } from "./LeafletFeaturesEditor.vue";
export { default as LeafletBoundingBox } from "./LeafletBoundingBox.vue";
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
export type { LeafletDrawControlProps } from "./LeafletDrawControl.vue";
export type {
  LeafletFeaturesEditorProps,
  DrawEvent,
} from "./LeafletFeaturesEditor.vue";
export type { LeafletBoundingBoxProps } from "./LeafletBoundingBox.vue";
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

```vue [src/components/ui/leaflet-map/LeafletBoundingBox.vue]
<script setup lang="ts">
import { inject, watch, ref, type Ref, onBeforeUnmount } from "vue";
import { LeafletMapKey, LeafletModuleKey } from ".";

export interface LeafletBoundingBoxProps {
  bounds?: L.LatLngBounds | null;
  visible?: boolean;
}

const props = withDefaults(defineProps<LeafletBoundingBoxProps>(), {
  bounds: null,
  visible: false,
});

const emit = defineEmits<{
  "update:bounds": [bounds: L.LatLngBounds];
  rotate: [angle: number];
  scale: [scaleX: number, scaleY: number];
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const boundingBox = ref<L.Rectangle | null>(null);
const cornerHandles = ref<L.Marker[]>([]);
const edgeHandles = ref<L.Marker[]>([]);
const rotateHandle = ref<L.Marker | null>(null);

const isDragging = ref(false);
const isRotating = ref(false);
const isScaling = ref(false);

let dragStartBounds: L.LatLngBounds | null = null;
let dragStartMousePoint: L.Point | null = null;
let scaleStartBounds: L.LatLngBounds | null = null;
let scaleCornerIndex = -1;

const clearHandles = () => {
  cornerHandles.value.forEach((h) => h.remove());
  cornerHandles.value = [];
  edgeHandles.value.forEach((h) => h.remove());
  edgeHandles.value = [];
  if (rotateHandle.value) {
    rotateHandle.value.remove();
    rotateHandle.value = null;
  }
  if (boundingBox.value) {
    boundingBox.value.remove();
    boundingBox.value = null;
  }
};

const createBoundingBox = () => {
  if (!props.bounds || !L.value || !map.value || !props.visible) {
    clearHandles();
    return;
  }

  clearHandles();

  boundingBox.value = L.value
    .rectangle(props.bounds, {
      color: "#3388ff",
      weight: 2,
      fill: false,
      dashArray: "5, 5",
      interactive: false,
    })
    .addTo(map.value);

  const corners = [
    props.bounds.getSouthWest(),
    props.bounds.getNorthWest(),
    props.bounds.getNorthEast(),
    props.bounds.getSouthEast(),
  ];

  const cornerCursors = [
    "nwse-resize",
    "nesw-resize",
    "nwse-resize",
    "nesw-resize",
  ];

  corners.forEach((corner, index) => {
    const handle = L.value!.marker(corner, {
      draggable: true,
      icon: L.value!.divIcon({
        className: "leaflet-bounding-box-handle leaflet-bounding-box-corner",
        html: '<div style="width:8px;height:8px;background:#fff;border:2px solid #3388ff;border-radius:2px;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [8, 8],
      }),
    }).addTo(map.value!);

    handle.on("mousedown", () => {
      if (map.value && cornerCursors[index]) {
        map.value.getContainer().style.cursor = cornerCursors[index];
      }
    });

    handle.on("dragstart", () => {
      isScaling.value = true;
      scaleStartBounds = props.bounds;
      scaleCornerIndex = index;
      if (map.value) {
        map.value.dragging.disable();
      }
    });

    handle.on("drag", () => {
      if (!isScaling.value || !scaleStartBounds) return;

      const newCorner = handle.getLatLng();
      let newBounds: L.LatLngBounds;

      switch (index) {
        case 0:
          newBounds = L.value!.latLngBounds(
            newCorner,
            scaleStartBounds.getNorthEast(),
          );
          break;
        case 1:
          newBounds = L.value!.latLngBounds(
            [scaleStartBounds.getSouth(), newCorner.lng],
            [newCorner.lat, scaleStartBounds.getEast()],
          );
          break;
        case 2:
          newBounds = L.value!.latLngBounds(
            scaleStartBounds.getSouthWest(),
            newCorner,
          );
          break;
        case 3:
          newBounds = L.value!.latLngBounds(
            [newCorner.lat, scaleStartBounds.getWest()],
            [scaleStartBounds.getNorth(), newCorner.lng],
          );
          break;
        default:
          return;
      }

      if (boundingBox.value) {
        boundingBox.value.setBounds(newBounds);
      }

      updateHandlePositions(newBounds);
    });

    handle.on("dragend", () => {
      isScaling.value = false;
      if (map.value) {
        map.value.getContainer().style.cursor = "";
        map.value.dragging.enable();
      }
      if (boundingBox.value) {
        emit("update:bounds", boundingBox.value.getBounds());
      }
    });

    cornerHandles.value.push(handle);
  });

  const edges = [
    L.value!.latLng(
      (props.bounds.getSouth() + props.bounds.getNorth()) / 2,
      props.bounds.getWest(),
    ),
    L.value!.latLng(
      props.bounds.getNorth(),
      (props.bounds.getWest() + props.bounds.getEast()) / 2,
    ),
    L.value!.latLng(
      (props.bounds.getSouth() + props.bounds.getNorth()) / 2,
      props.bounds.getEast(),
    ),
    L.value!.latLng(
      props.bounds.getSouth(),
      (props.bounds.getWest() + props.bounds.getEast()) / 2,
    ),
  ];

  const edgeCursors = ["ew-resize", "ns-resize", "ew-resize", "ns-resize"];

  edges.forEach((edge, index) => {
    const handle = L.value!.marker(edge, {
      draggable: true,
      icon: L.value!.divIcon({
        className: "leaflet-bounding-box-handle leaflet-bounding-box-edge",
        html: '<div style="width:8px;height:8px;background:#fff;border:2px solid #3388ff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [8, 8],
      }),
    }).addTo(map.value!);

    handle.on("mousedown", () => {
      if (map.value && edgeCursors[index]) {
        map.value.getContainer().style.cursor = edgeCursors[index];
      }
    });

    handle.on("dragstart", () => {
      isScaling.value = true;
      scaleStartBounds = props.bounds;
      if (map.value) {
        map.value.dragging.disable();
      }
    });

    handle.on("drag", () => {
      if (!isScaling.value || !scaleStartBounds) return;

      const newPos = handle.getLatLng();
      let newBounds: L.LatLngBounds = scaleStartBounds;

      switch (index) {
        case 0:
          newBounds = L.value!.latLngBounds(
            [scaleStartBounds.getSouth(), newPos.lng],
            [scaleStartBounds.getNorth(), scaleStartBounds.getEast()],
          );
          break;
        case 1:
          newBounds = L.value!.latLngBounds(
            [scaleStartBounds.getSouth(), scaleStartBounds.getWest()],
            [newPos.lat, scaleStartBounds.getEast()],
          );
          break;
        case 2:
          newBounds = L.value!.latLngBounds(
            [scaleStartBounds.getSouth(), scaleStartBounds.getWest()],
            [scaleStartBounds.getNorth(), newPos.lng],
          );
          break;
        case 3:
          newBounds = L.value!.latLngBounds(
            [newPos.lat, scaleStartBounds.getWest()],
            [scaleStartBounds.getNorth(), scaleStartBounds.getEast()],
          );
          break;
      }

      if (boundingBox.value) {
        boundingBox.value.setBounds(newBounds);
      }

      updateHandlePositions(newBounds);
    });

    handle.on("dragend", () => {
      isScaling.value = false;
      if (map.value) {
        map.value.getContainer().style.cursor = "";
        map.value.dragging.enable();
      }
      if (boundingBox.value) {
        emit("update:bounds", boundingBox.value.getBounds());
      }
    });

    edgeHandles.value.push(handle);
  });

  const centerTop = L.value!.latLng(
    props.bounds.getNorth(),
    (props.bounds.getWest() + props.bounds.getEast()) / 2,
  );

  const centerTopPoint = map.value.latLngToLayerPoint(centerTop);
  const rotateHandlePoint = L.value!.point(
    centerTopPoint.x,
    centerTopPoint.y - 30,
  );
  const rotateHandleLatLng = map.value.layerPointToLatLng(rotateHandlePoint);

  rotateHandle.value = L.value
    .marker(rotateHandleLatLng, {
      draggable: true,
      icon: L.value.divIcon({
        className: "leaflet-bounding-box-handle leaflet-bounding-box-rotate",
        html: '<div style="width:12px;height:12px;background:#fff;border:2px solid #3388ff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);cursor:url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAxOGMtNC40MSAwLTgtMy41OS04LThzMy41OS04IDgtOCA4IDMuNTkgOCA4LTMuNTkgOC04IDh6IiBmaWxsPSIjMzM4OGZmIi8+PHBhdGggZD0iTTEyIDZWMTJsNCAyIiBzdHJva2U9IiMzMzg4ZmYiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==) 12 12, auto;"></div>',
        iconSize: [12, 12],
      }),
    })
    .addTo(map.value);

  rotateHandle.value.on("dragstart", () => {
    isRotating.value = true;
    if (map.value) {
      map.value.dragging.disable();
    }
  });

  rotateHandle.value.on("drag", () => {
    if (!isRotating.value || !props.bounds) return;

    const center = props.bounds.getCenter();
    const handlePos = rotateHandle.value!.getLatLng();

    const dx = handlePos.lng - center.lng;
    const dy = handlePos.lat - center.lat;
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    emit("rotate", angle);
  });

  rotateHandle.value.on("dragend", () => {
    isRotating.value = false;
    if (map.value) {
      map.value.getContainer().style.cursor = "";
      map.value.dragging.enable();
    }
  });
};

const updateHandlePositions = (bounds: L.LatLngBounds) => {
  if (!L.value || !map.value) return;

  const corners = [
    bounds.getSouthWest(),
    bounds.getNorthWest(),
    bounds.getNorthEast(),
    bounds.getSouthEast(),
  ];
  cornerHandles.value.forEach((handle, i) => {
    if (corners[i]) handle.setLatLng(corners[i]);
  });

  const edges = [
    L.value.latLng(
      (bounds.getSouth() + bounds.getNorth()) / 2,
      bounds.getWest(),
    ),
    L.value.latLng(
      bounds.getNorth(),
      (bounds.getWest() + bounds.getEast()) / 2,
    ),
    L.value.latLng(
      (bounds.getSouth() + bounds.getNorth()) / 2,
      bounds.getEast(),
    ),
    L.value.latLng(
      bounds.getSouth(),
      (bounds.getWest() + bounds.getEast()) / 2,
    ),
  ];
  edgeHandles.value.forEach((handle, i) => {
    if (edges[i]) handle.setLatLng(edges[i]);
  });

  if (rotateHandle.value) {
    const centerTop = L.value.latLng(
      bounds.getNorth(),
      (bounds.getWest() + bounds.getEast()) / 2,
    );
    const centerTopPoint = map.value.latLngToLayerPoint(centerTop);
    const rotateHandlePoint = L.value.point(
      centerTopPoint.x,
      centerTopPoint.y - 30,
    );
    const rotateHandleLatLng = map.value.layerPointToLatLng(rotateHandlePoint);
    rotateHandle.value.setLatLng(rotateHandleLatLng);
  }
};

watch(
  () => [props.bounds, props.visible],
  () => {
    createBoundingBox();
  },
  { immediate: true, deep: true },
);

onBeforeUnmount(() => {
  clearHandles();
});
</script>

<template><slot /></template>
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
  draggable?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletCircleProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  radius: 100,
  editable: false,
  draggable: false,
});

const emit = defineEmits<{
  "update:lat": [lat: number];
  "update:lng": [lng: number];
  "update:radius": [radius: number];
  click: [];
}>();

const { getLeafletShapeColors } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const circle = ref<L.Circle | null>(null);
const centerMarker = ref<L.Marker | null>(null);
const radiusMarker = ref<L.Marker | null>(null);

const isDragging = ref(false);
let dragStartLatLng: any = null;
let dragStartMousePoint: any = null;

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

const enableDragging = () => {
  if (!circle.value || !L.value || !map.value) return;

  const onMouseDown = (e: any) => {
    if (!map.value || !circle.value) return;
    isDragging.value = true;
    dragStartLatLng = circle.value.getLatLng();
    dragStartMousePoint = e.containerPoint;
    L.value!.DomEvent.stopPropagation(e);
    map.value.dragging.disable();
    map.value.getContainer().style.cursor = "move";
  };

  circle.value.on("mousedown", onMouseDown);
};

const disableDragging = () => {
  if (!circle.value) return;
  circle.value.off("mousedown");
  isDragging.value = false;
};

const setupMapDragHandlers = () => {
  if (!map.value || !L.value) return;

  const onMouseMove = (e: any) => {
    if (!isDragging.value || !map.value || !circle.value) return;

    const currentPoint = e.containerPoint;
    const dx = currentPoint.x - dragStartMousePoint.x;
    const dy = currentPoint.y - dragStartMousePoint.y;

    const startPoint = map.value.latLngToContainerPoint(dragStartLatLng);
    const newPoint = L.value!.point(startPoint.x + dx, startPoint.y + dy);
    const newLatLng = map.value.containerPointToLatLng(newPoint);

    circle.value.setLatLng(newLatLng);

    if (radiusMarker.value && props.editable) {
      const radius = circle.value.getRadius();
      const radiusLatLng = L.value!.latLng(
        newLatLng.lat,
        newLatLng.lng +
          radius / 111320 / Math.cos((newLatLng.lat * Math.PI) / 180),
      );
      radiusMarker.value.setLatLng(radiusLatLng);
    }
  };

  const onMouseUp = () => {
    if (!isDragging.value || !map.value || !circle.value) return;
    isDragging.value = false;
    const newLatLng = circle.value.getLatLng();
    emit("update:lat", newLatLng.lat);
    emit("update:lng", newLatLng.lng);
    map.value.dragging.enable();
    map.value.getContainer().style.cursor = "";
  };

  map.value.on("mousemove", onMouseMove);
  map.value.on("mouseup", onMouseUp);

  if (circle.value) {
    circle.value.on("mouseup", onMouseUp);
  }
};

const enableEditing = () => {
  if (!circle.value || !L.value || !map.value) return;

  clearEditMarkers();

  const center = circle.value.getLatLng();
  const radius = circle.value.getRadius();

  if (props.editable) {
    const radiusLatLng = L.value.latLng(
      center.lat,
      center.lng + radius / 111320 / Math.cos((center.lat * Math.PI) / 180),
    );
    radiusMarker.value = L.value
      .marker(radiusLatLng, {
        draggable: true,
        icon: L.value.divIcon({
          className: "leaflet-editing-icon",
          html: "<div></div>",
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
  }
};

watch(
  () => [
    map.value,
    props.lat,
    props.lng,
    props.radius,
    props.editable,
    props.draggable,
  ],
  (newVal, oldVal) => {
    nextTick(() => {
      if (
        map.value &&
        L.value &&
        !isNaN(Number(props.lat)) &&
        !isNaN(Number(props.lng)) &&
        !isNaN(Number(props.radius))
      ) {
        if (circle.value) {
          const latChanged = oldVal && Number(oldVal[1]) !== Number(newVal[1]);
          const lngChanged = oldVal && Number(oldVal[2]) !== Number(newVal[2]);
          const radiusChanged =
            oldVal && Number(oldVal[3]) !== Number(newVal[3]);

          if (latChanged || lngChanged) {
            circle.value.setLatLng([Number(props.lat), Number(props.lng)]);
          }
          if (radiusChanged) {
            circle.value.setRadius(Number(props.radius));
          }
        } else {
          circle.value = L.value.circle(
            [Number(props.lat), Number(props.lng)],
            {
              radius: Number(props.radius),
            },
          );
          circle.value.addTo(map.value);

          circle.value.on("click", () => {
            emit("click");
          });

          setupMapDragHandlers();
        }

        const colors = getLeafletShapeColors(props.class);
        circle.value.setStyle({
          color: colors.color,
          fillColor: colors.fillColor,
          fillOpacity: colors.fillOpacity,
        });

        if (props.draggable) {
          enableDragging();
          clearEditMarkers();
        } else {
          disableDragging();
        }

        if (props.editable && !props.draggable) {
          enableEditing();
        } else if (!props.draggable) {
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
import { ref, inject, watch, onBeforeUnmount, nextTick } from "vue";
import type { ControlOptions } from "leaflet";
import { LeafletMapKey, LeafletModuleKey } from ".";

export interface DrawButton {
  enabled?: boolean;
}

export interface LeafletDrawControlProps {
  position?: ControlOptions["position"];
  editMode?: boolean;
  activeMode?: string | null;
  modes?: {
    select?: DrawButton | boolean;
    directSelect?: DrawButton | boolean;
    marker?: DrawButton | boolean;
    circle?: DrawButton | boolean;
    polyline?: DrawButton | boolean;
    polygon?: DrawButton | boolean;
    rectangle?: DrawButton | boolean;
  };
}

const props = withDefaults(defineProps<LeafletDrawControlProps>(), {
  position: "topright",
  editMode: false,
  activeMode: null,
});

const emit = defineEmits<{
  (
    e: "mode-selected",
    mode:
      | "marker"
      | "circle"
      | "polyline"
      | "polygon"
      | "rectangle"
      | "select"
      | "directSelect"
      | null,
  ): void;
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const control = ref<any>(null);

const shouldEnableButton = (type: string): boolean => {
  if (!props.modes) return false;
  const config = props.modes[type as keyof typeof props.modes];
  if (config === undefined) return false;
  if (typeof config === "boolean") return config;
  return config.enabled !== false;
};

const getIconSvg = (
  type:
    | "marker"
    | "circle"
    | "polyline"
    | "polygon"
    | "rectangle"
    | "select"
    | "directSelect",
): string => {
  const color = "#333";
  const svgs: Record<string, string> = {
    marker: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}"/></svg>`,
    circle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="2.5" fill="none"/></svg>`,
    polyline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17 L8 12 L13 15 L21 7" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="3" cy="17" r="2.5" fill="${color}"/><circle cx="8" cy="12" r="2.5" fill="${color}"/><circle cx="13" cy="15" r="2.5" fill="${color}"/><circle cx="21" cy="7" r="2.5" fill="${color}"/></svg>`,
    polygon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3 L21 8 L18 17 L6 17 L3 8 Z" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="3" r="2.5" fill="${color}"/><circle cx="21" cy="8" r="2.5" fill="${color}"/><circle cx="18" cy="17" r="2.5" fill="${color}"/><circle cx="6" cy="17" r="2.5" fill="${color}"/><circle cx="3" cy="8" r="2.5" fill="${color}"/></svg>`,
    rectangle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="16" height="12" stroke="${color}" stroke-width="2.5" rx="1" fill="none"/></svg>`,
    select: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3 L3 15 L7 11 L10 16 L12 15 L9 10 L15 10 Z" fill="${color}" stroke="${color}" stroke-width="1" stroke-linejoin="round"/></svg>`,
    directSelect: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3 L3 15 L7 11 L10 16 L12 15 L9 10 L15 10 Z" fill="white" stroke="${color}" stroke-width="2" stroke-linejoin="round"/></svg>`,
  };
  return svgs[type] || "";
};

const createButton = (
  container: HTMLElement,
  type:
    | "marker"
    | "circle"
    | "polyline"
    | "polygon"
    | "rectangle"
    | "select"
    | "directSelect",
  title: string,
) => {
  const button = L.value!.DomUtil.create(
    "div",
    "leaflet-draw-button",
    container,
  );
  button.title = title;
  button.innerHTML = getIconSvg(type);
  button.setAttribute("role", "button");
  button.setAttribute("aria-label", title);
  button.setAttribute("tabindex", "0");
  button.dataset.toolType = type;

  L.value!.DomEvent.on(button, "click", (e: Event) => {
    L.value!.DomEvent.preventDefault(e);
    toggleDrawMode(type);
  });

  return button;
};

const toggleDrawMode = (
  type:
    | "marker"
    | "circle"
    | "polyline"
    | "polygon"
    | "rectangle"
    | "select"
    | "directSelect",
) => {
  if (props.activeMode === type) {
    emit("mode-selected", null);
  } else {
    emit("mode-selected", type);
  }
};

const updateActiveButton = () => {
  if (!control.value) return;

  const container = control.value.getContainer();
  if (!container) return;

  const buttons = container.querySelectorAll(".leaflet-draw-button");
  buttons.forEach((button: Element) => {
    const htmlButton = button as HTMLElement;
    const toolType = htmlButton.dataset.toolType;
    if (toolType === props.activeMode) {
      htmlButton.classList.add("leaflet-draw-toolbar-button-enabled");
    } else {
      htmlButton.classList.remove("leaflet-draw-toolbar-button-enabled");
    }
  });
};

const createDrawControl = () => {
  if (!L.value || !map.value) return;

  const DrawControl = L.value.Control.extend({
    options: {
      position: props.position,
    },

    onAdd: function () {
      const container = L.value!.DomUtil.create(
        "div",
        "leaflet-draw leaflet-control leaflet-bar",
      );

      L.value!.DomEvent.disableClickPropagation(container);
      L.value!.DomEvent.disableScrollPropagation(container);

      if (props.modes) {
        if (shouldEnableButton("select")) {
          createButton(container, "select", "Selection Tool (V)");
        }
        if (shouldEnableButton("directSelect")) {
          createButton(container, "directSelect", "Direct Selection Tool (A)");
        }
        if (shouldEnableButton("marker")) {
          createButton(container, "marker", "Draw a marker");
        }
        if (shouldEnableButton("circle")) {
          createButton(container, "circle", "Draw a circle");
        }
        if (shouldEnableButton("polyline")) {
          createButton(container, "polyline", "Draw a polyline");
        }
        if (shouldEnableButton("polygon")) {
          createButton(container, "polygon", "Draw a polygon");
        }
        if (shouldEnableButton("rectangle")) {
          createButton(container, "rectangle", "Draw a rectangle");
        }
      }

      return container;
    },

    onRemove: function () {},
  });

  control.value = new DrawControl();
  control.value.addTo(map.value);
};

watch(
  () => props.activeMode,
  () => {
    nextTick(() => {
      updateActiveButton();
    });
  },
);

watch(
  [map, () => props.editMode],
  ([newMap, newEditMode]) => {
    if (newMap && newEditMode) {
      if (!control.value) {
        nextTick(() => {
          createDrawControl();
        });
      } else if (!control.value._map) {
        control.value.addTo(newMap);
      }
    } else if (control.value && control.value._map) {
      control.value.remove();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (control.value && map.value) {
    try {
      control.value.remove();
    } catch (e) {}
  }
});
</script>

<template></template>

<style>
.leaflet-draw-button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: white;
  border: none;
  transition: background-color 0.2s;
}

.leaflet-draw-button:hover {
  background-color: #f4f4f4;
}

.leaflet-draw-button:active {
  background-color: #e0e0e0;
}

.leaflet-draw-toolbar-button-enabled {
  background-color: #e8f4f8;
}

.leaflet-draw-toolbar-button-enabled:hover {
  background-color: #d4e9f2;
}

.leaflet-bar {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
  border-radius: 4px;
}

.leaflet-bar .leaflet-draw-button:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.leaflet-bar .leaflet-draw-button:last-child {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.leaflet-bar .leaflet-draw-button:not(:last-child) {
  border-bottom: 1px solid #ccc;
}
</style>
```

```vue [src/components/ui/leaflet-map/LeafletFeaturesEditor.vue]
<script setup lang="ts">
import { ref, inject, watch, onBeforeUnmount } from "vue";
import type { Layer, LatLng, LeafletMouseEvent } from "leaflet";
import { LeafletMapKey, LeafletModuleKey } from ".";

export interface DrawHandlerOptions {
  enabled?: boolean;
  shapeOptions?: any;
  repeatMode?: boolean;
}

export interface LeafletFeaturesEditorProps {
  enabled?: boolean;
  mode?:
    | "marker"
    | "circle"
    | "polyline"
    | "polygon"
    | "rectangle"
    | "select"
    | "directSelect"
    | null;
  shapeOptions?: any;
  repeatMode?: boolean;
}

export interface DrawEvent {
  layer: Layer;
  layerType: string;
  type: string;
}

const props = withDefaults(defineProps<LeafletFeaturesEditorProps>(), {
  enabled: false,
  mode: null,
  repeatMode: false,
});

const emit = defineEmits<{
  (e: "draw:created", event: DrawEvent): void;
  (e: "draw:drawstart", event: { layerType: string }): void;
  (e: "draw:drawstop", event: { layerType: string }): void;
  (
    e: "mode-changed",
    mode: "marker" | "circle" | "polyline" | "polygon" | "rectangle" | null,
  ): void;
  (e: "edit-mode-changed", mode: "select" | "directSelect" | null): void;
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const activeHandler = ref<any>(null);

const createMarkerHandler = () => {
  if (!map.value || !L.value) return null;

  let enabled = false;

  const clickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value) return;

    const marker = L.value.marker(e.latlng, props.shapeOptions || {});

    const event: DrawEvent = {
      layer: marker,
      layerType: "marker",
      type: "draw:created",
    };

    emit("draw:created", event);

    if (!props.repeatMode) {
      disable();
    }
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    emit("draw:drawstart", { layerType: "marker" });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    emit("draw:drawstop", { layerType: "marker" });
    emit("mode-changed", null);
  };

  return { enable, disable };
};

const createCircleHandler = () => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let centerLatLng: LatLng | null = null;
  let tempCircle: L.Circle | null = null;

  const clickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    if (!centerLatLng) {
      centerLatLng = e.latlng;
      tempCircle = L.value.circle(centerLatLng, {
        ...props.shapeOptions,
        radius: 1,
      });
      tempCircle.addTo(map.value);
    } else {
      const radius = map.value.distance(centerLatLng, e.latlng);
      const circle = L.value.circle(centerLatLng, {
        ...props.shapeOptions,
        radius,
      });

      const event: DrawEvent = {
        layer: circle,
        layerType: "circle",
        type: "draw:created",
      };

      emit("draw:created", event);

      cleanup();

      if (!props.repeatMode) {
        disable();
      }
    }
  };

  const mouseMoveHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !centerLatLng || !tempCircle || !map.value) return;
    const radius = map.value.distance(centerLatLng, e.latlng);
    tempCircle.setRadius(radius);
  };

  const cleanup = () => {
    if (tempCircle) {
      tempCircle.remove();
      tempCircle = null;
    }
    centerLatLng = null;
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    map.value.on("mousemove", mouseMoveHandler);
    emit("draw:drawstart", { layerType: "circle" });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    cleanup();
    emit("draw:drawstop", { layerType: "circle" });
    emit("mode-changed", null);
  };

  return { enable, disable };
};

const createPolylineHandler = () => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let latlngs: LatLng[] = [];
  let tempPolyline: L.Polyline | null = null;
  let tempMarkers: L.CircleMarker[] = [];

  const clickHandler = (e: LeafletMouseEvent) => {
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
        ...props.shapeOptions,
        dashArray: "5, 5",
      });
      tempPolyline.addTo(map.value);
    } else if (tempPolyline) {
      tempPolyline.setLatLngs(latlngs);
    }
  };

  const dblClickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || latlngs.length < 2) return;

    L.value.DomEvent.stop(e);

    latlngs.pop();

    if (latlngs.length >= 2) {
      const polyline = L.value.polyline(latlngs, props.shapeOptions);

      const event: DrawEvent = {
        layer: polyline,
        layerType: "polyline",
        type: "draw:created",
      };

      emit("draw:created", event);
    }

    cleanup();

    if (!props.repeatMode) {
      disable();
    }
  };

  const mouseMoveHandler = (e: LeafletMouseEvent) => {
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
    emit("draw:drawstart", { layerType: "polyline" });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("dblclick", dblClickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    cleanup();
    emit("draw:drawstop", { layerType: "polyline" });
    emit("mode-changed", null);
  };

  return { enable, disable };
};

const createPolygonHandler = () => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let latlngs: LatLng[] = [];
  let tempPolygon: L.Polygon | null = null;
  let tempMarkers: L.CircleMarker[] = [];
  let firstPointMarker: L.CircleMarker | null = null;
  let snapCircle: L.CircleMarker | null = null;

  const finishPolygon = () => {
    if (!L.value || !map.value || latlngs.length < 3) return;

    const polygon = L.value.polygon(latlngs, props.shapeOptions);

    const event: DrawEvent = {
      layer: polygon,
      layerType: "polygon",
      type: "draw:created",
    };

    emit("draw:created", event);
    cleanup();

    if (!props.repeatMode) {
      disable();
    }
  };

  const clickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    if (latlngs.length >= 3 && firstPointMarker && latlngs[0]) {
      const clickPixel = map.value.latLngToContainerPoint(e.latlng);
      const firstPixel = map.value.latLngToContainerPoint(latlngs[0]);
      const distance = Math.sqrt(
        Math.pow(clickPixel.x - firstPixel.x, 2) +
          Math.pow(clickPixel.y - firstPixel.y, 2),
      );

      if (distance < 15) {
        finishPolygon();
        return;
      }
    }

    latlngs.push(e.latlng);

    const marker = L.value.circleMarker(e.latlng, {
      radius: 4,
      color: "#3388ff",
    });
    marker.addTo(map.value);
    tempMarkers.push(marker);

    if (latlngs.length === 1) {
      firstPointMarker = marker;
      firstPointMarker.setStyle({
        radius: 6,
        color: "#3388ff",
        fillColor: "#ffffff",
        fillOpacity: 1,
        weight: 3,
      });

      tempPolygon = L.value.polygon(latlngs, {
        ...props.shapeOptions,
        dashArray: "5, 5",
      });
      tempPolygon.addTo(map.value);
    } else if (tempPolygon) {
      tempPolygon.setLatLngs(latlngs);
    }
  };

  const dblClickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || latlngs.length < 3) return;

    L.value.DomEvent.stop(e);

    latlngs.pop();

    if (latlngs.length >= 3) {
      const polygon = L.value.polygon(latlngs, props.shapeOptions);

      const event: DrawEvent = {
        layer: polygon,
        layerType: "polygon",
        type: "draw:created",
      };

      emit("draw:created", event);
    }

    cleanup();

    if (!props.repeatMode) {
      disable();
    }
  };

  const mouseMoveHandler = (e: LeafletMouseEvent) => {
    if (
      !enabled ||
      !tempPolygon ||
      latlngs.length === 0 ||
      !map.value ||
      !L.value
    )
      return;

    let mousePos = e.latlng;

    if (latlngs.length >= 3 && firstPointMarker && latlngs[0]) {
      const mousePixel = map.value.latLngToContainerPoint(e.latlng);
      const firstPixel = map.value.latLngToContainerPoint(latlngs[0]);
      const distance = Math.sqrt(
        Math.pow(mousePixel.x - firstPixel.x, 2) +
          Math.pow(mousePixel.y - firstPixel.y, 2),
      );

      const snapThreshold = 30;
      const isNearFirstPoint = distance < snapThreshold;

      if (isNearFirstPoint) {
        mousePos = latlngs[0];

        if (!snapCircle) {
          snapCircle = L.value.circleMarker(latlngs[0], {
            radius: 20,
            color: "#ff0000",
            fillColor: "#ff0000",
            fillOpacity: 0.3,
            weight: 3,
            opacity: 0.8,
            interactive: false,
          });
          snapCircle.addTo(map.value);
        } else {
          snapCircle.setStyle({ opacity: 0.8, fillOpacity: 0.3 });
        }

        firstPointMarker.setStyle({ radius: 9 });

        map.value.getContainer().style.cursor = "pointer";
      } else {
        if (snapCircle) {
          snapCircle.setStyle({ opacity: 0, fillOpacity: 0 });
        }

        if (firstPointMarker) {
          firstPointMarker.setStyle({ radius: 6 });
        }

        map.value.getContainer().style.cursor = "crosshair";
      }
    }

    const previewLatLngs = [...latlngs, mousePos];
    tempPolygon.setLatLngs(previewLatLngs);
  };

  const cleanup = () => {
    if (tempPolygon) {
      tempPolygon.remove();
      tempPolygon = null;
    }
    tempMarkers.forEach((m) => m.remove());
    tempMarkers = [];
    if (snapCircle) {
      snapCircle.remove();
      snapCircle = null;
    }
    firstPointMarker = null;
    latlngs = [];
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    map.value.on("dblclick", dblClickHandler);
    map.value.on("mousemove", mouseMoveHandler);
    emit("draw:drawstart", { layerType: "polygon" });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("dblclick", dblClickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    cleanup();
    emit("draw:drawstop", { layerType: "polygon" });
    emit("mode-changed", null);
  };

  return { enable, disable };
};

const createRectangleHandler = () => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let startLatLng: LatLng | null = null;
  let tempRectangle: L.Rectangle | null = null;

  const clickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    if (!startLatLng) {
      startLatLng = e.latlng;
      const bounds = L.value.latLngBounds(startLatLng, startLatLng);
      tempRectangle = L.value.rectangle(bounds, {
        ...props.shapeOptions,
        dashArray: "5, 5",
      });
      tempRectangle.addTo(map.value);
    } else {
      const bounds = L.value.latLngBounds(startLatLng, e.latlng);
      const rectangle = L.value.rectangle(bounds, props.shapeOptions);

      const event: DrawEvent = {
        layer: rectangle,
        layerType: "rectangle",
        type: "draw:created",
      };

      emit("draw:created", event);

      cleanup();

      if (!props.repeatMode) {
        disable();
      }
    }
  };

  const mouseMoveHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !startLatLng || !tempRectangle || !L.value) return;
    const bounds = L.value.latLngBounds(startLatLng, e.latlng);
    tempRectangle.setBounds(bounds);
  };

  const cleanup = () => {
    if (tempRectangle) {
      tempRectangle.remove();
      tempRectangle = null;
    }
    startLatLng = null;
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("click", clickHandler);
    map.value.on("mousemove", mouseMoveHandler);
    emit("draw:drawstart", { layerType: "rectangle" });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("click", clickHandler);
    map.value.off("mousemove", mouseMoveHandler);
    cleanup();
    emit("draw:drawstop", { layerType: "rectangle" });
    emit("mode-changed", null);
  };

  return { enable, disable };
};

watch(
  () => props.mode,
  (newMode, oldMode) => {
    if (!props.enabled) return;

    if (activeHandler.value) {
      activeHandler.value.disable();
      activeHandler.value = null;
    }

    if (newMode === "select" || newMode === "directSelect") {
      emit("edit-mode-changed", newMode);
      return;
    }

    if (oldMode === "select" || oldMode === "directSelect") {
      emit("edit-mode-changed", null);
    }

    if (newMode) {
      let handler = null;
      switch (newMode) {
        case "marker":
          handler = createMarkerHandler();
          break;
        case "circle":
          handler = createCircleHandler();
          break;
        case "polyline":
          handler = createPolylineHandler();
          break;
        case "polygon":
          handler = createPolygonHandler();
          break;
        case "rectangle":
          handler = createRectangleHandler();
          break;
      }

      if (handler) {
        activeHandler.value = handler;
        handler.enable();
      }
    }
  },
  { immediate: true },
);

watch(
  () => props.enabled,
  (enabled) => {
    if (!enabled && activeHandler.value) {
      activeHandler.value.disable();
      activeHandler.value = null;
      emit("mode-changed", null);
    } else if (enabled && props.mode && !activeHandler.value) {
      const modeValue = props.mode;
      let handler = null;
      switch (modeValue) {
        case "marker":
          handler = createMarkerHandler();
          break;
        case "circle":
          handler = createCircleHandler();
          break;
        case "polyline":
          handler = createPolylineHandler();
          break;
        case "polygon":
          handler = createPolygonHandler();
          break;
        case "rectangle":
          handler = createRectangleHandler();
          break;
      }

      if (handler) {
        activeHandler.value = handler;
        handler.enable();
      }
    }
  },
);

onBeforeUnmount(() => {
  if (activeHandler.value) {
    activeHandler.value.disable();
  }
});
</script>

<template></template>
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
  click: [];
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const marker = ref<L.Marker | null>(null);

let Icon: any;
const iconOptions = {
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
};

const setupMarker = () => {
  if (map.value && L.value && !marker.value) {
    if (!Icon) {
      Icon = L.value.Icon.extend({
        options: iconOptions,
      });
    }

    const isDraggable = props.editable || props.draggable;
    marker.value = L.value.marker([Number(props.lat), Number(props.lng)], {
      draggable: isDraggable,
      icon: new Icon(),
    });

    if (isDraggable) {
      marker.value.on("dragend", onDragEnd);
    }

    marker.value.addTo(map.value);
  }
};

const updateMarker = (latChanged = false, lngChanged = false) => {
  if (marker.value) {
    const isDraggable = props.editable || props.draggable;

    if (latChanged || lngChanged) {
      marker.value.setLatLng([Number(props.lat), Number(props.lng)]);
    }

    marker.value.options.draggable = isDraggable;
    if (isDraggable) {
      marker.value.dragging?.enable();
    } else {
      marker.value.dragging?.disable();
    }
  }
};

const onDragEnd = () => {
  if (marker.value) {
    const latlng = marker.value.getLatLng();
    emit("update:lat", latlng.lat);
    emit("update:lng", latlng.lng);
  }
};

watch(
  () => [props.lat, props.lng, props.editable, props.draggable],
  ([newLat, newLng], oldVal) => {
    nextTick(() => {
      if (!L.value) return;

      if (map.value && !isNaN(Number(newLat)) && !isNaN(Number(newLng))) {
        if (marker.value) {
          const latChanged = oldVal && Number(oldVal[0]) !== Number(newLat);
          const lngChanged = oldVal && Number(oldVal[1]) !== Number(newLng);
          updateMarker(latChanged, lngChanged);
        } else {
          setupMarker();
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
  () => {
    setupMarker();
  },
  { immediate: true },
);

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
  click: [];
}>();

const { getLeafletShapeColors } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const polygon = ref<L.Polygon | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const midpointMarkers = ref<L.Marker[]>([]);
const firstPointMarker = ref<L.Marker | null>(null);
const isDragging = ref(false);

let dragStartLatLngs: L.LatLng[] = [];
let dragStartMousePoint: L.Point | null = null;

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

const clearEditMarkers = () => {
  editMarkers.value.forEach((marker) => marker.remove());
  editMarkers.value = [];
  midpointMarkers.value.forEach((marker) => marker.remove());
  midpointMarkers.value = [];
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
      let currentPos = marker.getLatLng();

      newLatLngs[index] = currentPos;
      polygon.value!.setLatLngs([newLatLngs]);

      updateMidpoints(newLatLngs);
    });

    marker.on("dragend", () => {
      const updatedLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map(
        (ll) => [ll.lat, ll.lng],
      ) as Array<[number, number]>;
      emit("update:latlngs", updatedLatLngs);
    });

    editMarkers.value.push(marker);
  });

  createMidpoints();
};

const createMidpoints = () => {
  if (!polygon.value || !L.value || !map.value) return;

  const latlngs = polygon.value.getLatLngs()[0] as L.LatLng[];

  for (let i = 0; i < latlngs.length; i++) {
    const nextIndex = (i + 1) % latlngs.length;
    const current = latlngs[i];
    const next = latlngs[nextIndex];

    if (!current || !next) continue;

    const midLat = (current.lat + next.lat) / 2;
    const midLng = (current.lng + next.lng) / 2;

    const midMarker = L.value
      .marker([midLat, midLng], {
        draggable: true,
        icon: L.value.divIcon({
          className: "leaflet-editing-icon-midpoint",
          html: "<div></div>",
          iconSize: [14, 14],
        }),
      })
      .addTo(map.value);

    let pointAdded = false;

    midMarker.on("dragstart", () => {
      if (map.value) map.value.getContainer().style.cursor = "copy";
    });

    midMarker.on("drag", () => {
      const newPos = midMarker.getLatLng();
      const currentLatlngs = polygon.value!.getLatLngs()[0] as L.LatLng[];

      if (!pointAdded) {
        const newLatlngs = [...currentLatlngs];
        newLatlngs.splice(nextIndex, 0, newPos);
        polygon.value!.setLatLngs([newLatlngs]);
        pointAdded = true;
      } else {
        const newLatlngs = [...currentLatlngs];
        newLatlngs[nextIndex] = newPos;
        polygon.value!.setLatLngs([newLatlngs]);
      }
    });

    midMarker.on("dragend", () => {
      if (map.value) map.value.getContainer().style.cursor = "";
      const updatedLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map(
        (ll) => [ll.lat, ll.lng],
      ) as Array<[number, number]>;
      emit("update:latlngs", updatedLatLngs);
      enableEditing();
    });

    midMarker.on("mouseover", () => {
      if (map.value) map.value.getContainer().style.cursor = "copy";
    });

    midMarker.on("mouseout", () => {
      if (map.value) {
        map.value.getContainer().style.cursor = "";
      }
    });

    midpointMarkers.value.push(midMarker);
  }
};

const updateMidpoints = (latlngs: L.LatLng[]) => {
  midpointMarkers.value.forEach((midMarker, i) => {
    const nextIndex = (i + 1) % latlngs.length;
    if (latlngs[i] && latlngs[nextIndex]) {
      const midLat = (latlngs[i].lat + latlngs[nextIndex].lat) / 2;
      const midLng = (latlngs[i].lng + latlngs[nextIndex].lng) / 2;
      midMarker.setLatLng(L.value!.latLng(midLat, midLng));
    }
  });
};

const enableDragging = () => {
  if (!polygon.value || !map.value) return;

  polygon.value.on("mousedown", (e: L.LeafletMouseEvent) => {
    L.value!.DomEvent.stopPropagation(e);
    isDragging.value = true;

    dragStartLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map(
      (ll) => L.value!.latLng(ll.lat, ll.lng),
    );
    dragStartMousePoint = map.value!.latLngToContainerPoint(e.latlng);

    setupMapDragHandlers();

    if (map.value) {
      map.value.getContainer().style.cursor = "move";
      map.value.dragging.disable();
    }
  });
};

const disableDragging = () => {
  if (!polygon.value) return;
  polygon.value.off("mousedown");
};

const setupMapDragHandlers = () => {
  if (!map.value) return;

  const onMouseMove = (e: L.LeafletMouseEvent) => {
    if (!isDragging.value || !dragStartMousePoint || !map.value) return;

    const currentPoint = map.value.latLngToContainerPoint(e.latlng);
    const deltaX = currentPoint.x - dragStartMousePoint.x;
    const deltaY = currentPoint.y - dragStartMousePoint.y;

    const newLatLngs = dragStartLatLngs.map((startLatLng) => {
      const startPoint = map.value!.latLngToContainerPoint(startLatLng);
      const newPoint = L.value!.point(
        startPoint.x + deltaX,
        startPoint.y + deltaY,
      );
      return map.value!.containerPointToLatLng(newPoint);
    });

    polygon.value!.setLatLngs([newLatLngs]);
  };

  const onMouseUp = () => {
    if (!isDragging.value) return;

    isDragging.value = false;

    if (map.value) {
      map.value.getContainer().style.cursor = "";
      map.value.dragging.enable();
      map.value.off("mousemove", onMouseMove);
      map.value.off("mouseup", onMouseUp);
    }

    if (polygon.value) {
      const updatedLatLngs = (polygon.value.getLatLngs()[0] as L.LatLng[]).map(
        (ll) => [ll.lat, ll.lng],
      ) as Array<[number, number]>;
      emit("update:latlngs", updatedLatLngs);
    }
  };

  map.value.on("mousemove", onMouseMove);
  map.value.on("mouseup", onMouseUp);

  if (polygon.value) {
    polygon.value.once("mouseup", onMouseUp);
  }
};

watch(
  () => [
    map.value,
    props.latlngs,
    props.editable,
    props.draggable,
    props.interactive,
  ],
  (newVal, oldVal) => {
    nextTick(() => {
      if (map.value && L.value && props.latlngs && props.latlngs.length >= 3) {
        const normalizedLatLngs = normalizeLatLngs(props.latlngs);

        if (polygon.value) {
          const oldLatlngs = oldVal?.[1];
          const newLatlngs = newVal[1];
          const latlngsChanged =
            JSON.stringify(oldLatlngs) !== JSON.stringify(newLatlngs);

          if (latlngsChanged) {
            polygon.value.setLatLngs([normalizedLatLngs]);
          }

          const colors = getLeafletShapeColors(props.class);
          polygon.value.setStyle({
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
        } else {
          const colors = getLeafletShapeColors(props.class);
          polygon.value = L.value.polygon([normalizedLatLngs], {
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
            interactive: props.interactive,
          });
          polygon.value.addTo(map.value);

          polygon.value.on("click", () => {
            emit("click");
          });
        }

        if (props.draggable && !props.editable) {
          clearEditMarkers();
          enableDragging();
        } else if (props.editable && !props.draggable) {
          disableDragging();
          enableEditing();
        } else {
          clearEditMarkers();
          disableDragging();
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
  draggable?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletPolylineProps>(), {
  latlngs: () => [],
  weight: 3,
  editable: false,
  draggable: false,
});

const emit = defineEmits<{
  "update:latlngs": [latlngs: Array<[number, number]>];
  click: [];
}>();

const { getLeafletLineColors } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const polyline = ref<L.Polyline | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const midpointMarkers = ref<L.Marker[]>([]);
const isDragging = ref(false);

let dragStartLatLngs: L.LatLng[] = [];
let dragStartMousePoint: L.Point | null = null;

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

const clearEditMarkers = () => {
  editMarkers.value.forEach((marker) => marker.remove());
  editMarkers.value = [];
  midpointMarkers.value.forEach((marker) => marker.remove());
  midpointMarkers.value = [];
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
        html: '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: [8, 8],
      }),
    }).addTo(map.value!);

    marker.on("drag", () => {
      const newLatLngs = [...latlngs];
      newLatLngs[index] = marker.getLatLng();
      polyline.value!.setLatLngs(newLatLngs);

      updateMidpoints(newLatLngs);
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

  createMidpoints();
};

const createMidpoints = () => {
  if (!polyline.value || !L.value || !map.value) return;

  const latlngs = polyline.value.getLatLngs() as L.LatLng[];

  for (let i = 0; i < latlngs.length - 1; i++) {
    const current = latlngs[i];
    const next = latlngs[i + 1];

    if (!current || !next) continue;

    const midLat = (current.lat + next.lat) / 2;
    const midLng = (current.lng + next.lng) / 2;

    const midMarker = L.value
      .marker([midLat, midLng], {
        draggable: true,
        icon: L.value.divIcon({
          className: "leaflet-editing-icon-midpoint",
          html: "<div></div>",
          iconSize: [14, 14],
        }),
      })
      .addTo(map.value);

    let pointAdded = false;

    midMarker.on("dragstart", () => {
      if (map.value) map.value.getContainer().style.cursor = "copy";
    });

    midMarker.on("drag", () => {
      const newPos = midMarker.getLatLng();
      const currentLatlngs = polyline.value!.getLatLngs() as L.LatLng[];

      if (!pointAdded) {
        const newLatlngs = [...currentLatlngs];
        newLatlngs.splice(i + 1, 0, newPos);
        polyline.value!.setLatLngs(newLatlngs);
        pointAdded = true;
      } else {
        const newLatlngs = [...currentLatlngs];
        newLatlngs[i + 1] = newPos;
        polyline.value!.setLatLngs(newLatlngs);
      }
    });

    midMarker.on("dragend", () => {
      if (map.value) map.value.getContainer().style.cursor = "";
      const updatedLatLngs = (polyline.value!.getLatLngs() as L.LatLng[]).map(
        (ll) => [ll.lat, ll.lng],
      ) as Array<[number, number]>;
      emit("update:latlngs", updatedLatLngs);
      enableEditing();
    });

    midMarker.on("mouseover", () => {
      if (map.value) map.value.getContainer().style.cursor = "copy";
    });

    midMarker.on("mouseout", () => {
      if (map.value) {
        map.value.getContainer().style.cursor = "";
      }
    });

    midpointMarkers.value.push(midMarker);
  }
};

const updateMidpoints = (latlngs: L.LatLng[]) => {
  midpointMarkers.value.forEach((midMarker, i) => {
    const current = latlngs[i];
    const next = latlngs[i + 1];
    if (current && next) {
      const midLat = (current.lat + next.lat) / 2;
      const midLng = (current.lng + next.lng) / 2;
      midMarker.setLatLng(L.value!.latLng(midLat, midLng));
    }
  });
};

const enableDragging = () => {
  if (!polyline.value || !map.value) return;

  polyline.value.on("mousedown", (e: L.LeafletMouseEvent) => {
    L.value!.DomEvent.stopPropagation(e);
    isDragging.value = true;

    dragStartLatLngs = (polyline.value!.getLatLngs() as L.LatLng[]).map((ll) =>
      L.value!.latLng(ll.lat, ll.lng),
    );
    dragStartMousePoint = map.value!.latLngToContainerPoint(e.latlng);

    setupMapDragHandlers();

    if (map.value) {
      map.value.getContainer().style.cursor = "move";
      map.value.dragging.disable();
    }
  });
};

const disableDragging = () => {
  if (!polyline.value) return;
  polyline.value.off("mousedown");
};

const setupMapDragHandlers = () => {
  if (!map.value) return;

  const onMouseMove = (e: L.LeafletMouseEvent) => {
    if (!isDragging.value || !dragStartMousePoint || !map.value) return;

    const currentPoint = map.value.latLngToContainerPoint(e.latlng);
    const deltaX = currentPoint.x - dragStartMousePoint.x;
    const deltaY = currentPoint.y - dragStartMousePoint.y;

    const newLatLngs = dragStartLatLngs.map((startLatLng) => {
      const startPoint = map.value!.latLngToContainerPoint(startLatLng);
      const newPoint = L.value!.point(
        startPoint.x + deltaX,
        startPoint.y + deltaY,
      );
      return map.value!.containerPointToLatLng(newPoint);
    });

    polyline.value!.setLatLngs(newLatLngs);
  };

  const onMouseUp = () => {
    if (!isDragging.value) return;

    isDragging.value = false;

    if (map.value) {
      map.value.getContainer().style.cursor = "";
      map.value.dragging.enable();
      map.value.off("mousemove", onMouseMove);
      map.value.off("mouseup", onMouseUp);
    }

    if (polyline.value) {
      const updatedLatLngs = (polyline.value.getLatLngs() as L.LatLng[]).map(
        (ll) => [ll.lat, ll.lng],
      ) as Array<[number, number]>;
      emit("update:latlngs", updatedLatLngs);
    }
  };

  map.value.on("mousemove", onMouseMove);
  map.value.on("mouseup", onMouseUp);

  if (polyline.value) {
    polyline.value.once("mouseup", onMouseUp);
  }
};

watch(
  () => [
    map.value,
    props.latlngs,
    props.weight,
    props.editable,
    props.draggable,
  ],
  (newVal, oldVal) => {
    nextTick(() => {
      if (map.value && L.value && props.latlngs && props.latlngs.length > 0) {
        const normalizedLatLngs = normalizeLatLngs(props.latlngs);

        if (polyline.value) {
          const oldLatlngs = oldVal?.[1];
          const newLatlngs = newVal[1];
          const latlngsChanged =
            JSON.stringify(oldLatlngs) !== JSON.stringify(newLatlngs);

          if (latlngsChanged) {
            polyline.value.setLatLngs(normalizedLatLngs);
          }

          const colors = getLeafletLineColors(props.class);
          polyline.value.setStyle({
            color: colors.color,
            weight: props.weight,
            opacity: colors.opacity,
          });
        } else {
          const colors = getLeafletLineColors(props.class);
          polyline.value = L.value.polyline(normalizedLatLngs, {
            color: colors.color,
            weight: props.weight,
            opacity: colors.opacity,
          });
          polyline.value.addTo(map.value);

          polyline.value.on("click", () => {
            emit("click");
          });
        }

        if (props.draggable && !props.editable) {
          clearEditMarkers();
          enableDragging();
        } else if (props.editable && !props.draggable) {
          disableDragging();
          enableEditing();
        } else {
          clearEditMarkers();
          disableDragging();
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
  click: [];
}>();

const { getLeafletShapeColors } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const rectangle = ref<L.Rectangle | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const isDragging = ref(false);

let dragStartBounds: L.LatLngBounds | null = null;
let dragStartMousePoint: L.Point | null = null;

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
        html: '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
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
  if (!rectangle.value || !map.value) return;

  rectangle.value.on("mousedown", (e: L.LeafletMouseEvent) => {
    L.value!.DomEvent.stopPropagation(e);
    isDragging.value = true;

    dragStartBounds = rectangle.value!.getBounds();
    dragStartMousePoint = map.value!.latLngToContainerPoint(e.latlng);

    setupMapDragHandlers();

    if (map.value) {
      map.value.getContainer().style.cursor = "move";
      map.value.dragging.disable();
    }
  });
};

const disableDragging = () => {
  if (!rectangle.value) return;
  rectangle.value.off("mousedown");
};

const setupMapDragHandlers = () => {
  if (!map.value) return;

  const onMouseMove = (e: L.LeafletMouseEvent) => {
    if (
      !isDragging.value ||
      !dragStartMousePoint ||
      !dragStartBounds ||
      !map.value
    )
      return;

    const currentPoint = map.value.latLngToContainerPoint(e.latlng);
    const deltaX = currentPoint.x - dragStartMousePoint.x;
    const deltaY = currentPoint.y - dragStartMousePoint.y;

    const swPoint = map.value.latLngToContainerPoint(
      dragStartBounds.getSouthWest(),
    );
    const nePoint = map.value.latLngToContainerPoint(
      dragStartBounds.getNorthEast(),
    );

    const newSW = map.value.containerPointToLatLng(
      L.value!.point(swPoint.x + deltaX, swPoint.y + deltaY),
    );
    const newNE = map.value.containerPointToLatLng(
      L.value!.point(nePoint.x + deltaX, nePoint.y + deltaY),
    );

    const newBounds = L.value!.latLngBounds(newSW, newNE);

    rectangle.value!.setBounds(newBounds);
  };

  const onMouseUp = () => {
    if (!isDragging.value) return;

    isDragging.value = false;

    if (map.value) {
      map.value.getContainer().style.cursor = "";
      map.value.dragging.enable();
      map.value.off("mousemove", onMouseMove);
      map.value.off("mouseup", onMouseUp);
    }

    if (rectangle.value) {
      const updatedBounds = rectangle.value.getBounds();
      emit("update:bounds", [
        [updatedBounds.getSouth(), updatedBounds.getWest()],
        [updatedBounds.getNorth(), updatedBounds.getEast()],
      ]);
    }
  };

  map.value.on("mousemove", onMouseMove);
  map.value.on("mouseup", onMouseUp);

  if (rectangle.value) {
    rectangle.value.once("mouseup", onMouseUp);
  }
};

watch(
  () => [map.value, props.bounds, props.editable, props.draggable],
  (newVal, oldVal) => {
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
          const oldBounds = oldVal?.[1];
          const newBounds = newVal[1];
          const boundsChanged =
            JSON.stringify(oldBounds) !== JSON.stringify(newBounds);

          if (boundsChanged) {
            rectangle.value.setBounds(props.bounds);
          }

          const colors = getLeafletShapeColors(props.class);
          rectangle.value.setStyle({
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
        } else {
          const colors = getLeafletShapeColors(props.class);
          rectangle.value = L.value.rectangle(props.bounds, {
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
          rectangle.value.addTo(map.value);

          rectangle.value.on("click", () => {
            emit("click");
          });
        }

        if (props.draggable && !props.editable) {
          clearEditMarkers();
          enableDragging();
        } else if (props.editable && !props.draggable) {
          disableDragging();
          enableEditing();
        } else {
          clearEditMarkers();
          disableDragging();
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

  const getLeafletShapeColors = (
    classNames?: string | string[] | Record<string, boolean>,
  ) => {
    if (typeof window === "undefined") {
      return {
        color: "#3388ff",
        fillColor: "#3388ff",
        fillOpacity: 0.2,
      };
    }

    try {
      let classList: string[] = [];
      if (typeof classNames === "string") {
        classList = classNames.split(" ");
      } else if (Array.isArray(classNames)) {
        classList = classNames;
      } else if (classNames && typeof classNames === "object") {
        classList = Object.keys(classNames).filter((key) => classNames[key]);
      }

      const el = document.createElement("div");
      el.className = classList.join(" ");
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
        fillOpacity: cssValues["opacity"]
          ? parseFloat(cssValues["opacity"])
          : 0.2,
      };
    } catch (err) {
      console.error("Error in getLeafletShapeColors:", err);
      return {
        color: "#3388ff",
        fillColor: "#3388ff",
        fillOpacity: 0.2,
      };
    }
  };

  const getLeafletLineColors = (
    classNames?: string | string[] | Record<string, boolean>,
  ) => {
    if (typeof window === "undefined") {
      return {
        color: "#3388ff",
        opacity: 1,
      };
    }

    try {
      let classList: string[] = [];
      if (typeof classNames === "string") {
        classList = classNames.split(" ");
      } else if (Array.isArray(classNames)) {
        classList = classNames;
      } else if (classNames && typeof classNames === "object") {
        classList = Object.keys(classNames).filter((key) => classNames[key]);
      }

      const el = document.createElement("div");
      el.className = classList.join(" ");
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
    } catch (err) {
      console.error("Error in getLeafletLineColors:", err);
      return {
        color: "#3388ff",
        opacity: 1,
      };
    }
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
    getLeafletShapeColors,
    getLeafletLineColors,
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

## LeafletBoundingBox
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `bounds`{.primary .text-primary} | `L.LatLngBounds \| null` |  |  |
| `visible`{.primary .text-primary} | `boolean` | false |  |

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

## LeafletDrawControl
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `position`{.primary .text-primary} | `ControlOptions['position']` | topright |  |
| `editMode`{.primary .text-primary} | `boolean` | false |  |
| `activeMode`{.primary .text-primary} | `string \| null` |  |  |
| `modes`{.primary .text-primary} | `{
    select?: DrawButton \| boolean;
    directSelect?: DrawButton \| boolean;
    marker?: DrawButton \| boolean;
    circle?: DrawButton \| boolean;
    polyline?: DrawButton \| boolean;
    polygon?: DrawButton \| boolean;
    rectangle?: DrawButton \| boolean;
  }` | - |  |

  ### Events
| Name | Description |
|------|-------------|
| `mode-selected`{.primary .text-primary} | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |

---

## LeafletFeaturesEditor
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled`{.primary .text-primary} | `boolean` | false |  |
| `mode`{.primary .text-primary} | `\| 'marker'
    \| 'circle'
    \| 'polyline'
    \| 'polygon'
    \| 'rectangle'
    \| 'select'
    \| 'directSelect'
    \| null` |  |  |
| `shapeOptions`{.primary .text-primary} | `any` | - |  |
| `repeatMode`{.primary .text-primary} | `boolean` | false |  |

  ### Events
| Name | Description |
|------|-------------|
| `draw:created`{.primary .text-primary} | — |
| `draw:drawstart`{.primary .text-primary} | — |
| `draw:drawstop`{.primary .text-primary} | — |
| `mode-changed`{.primary .text-primary} | — |
| `edit-mode-changed`{.primary .text-primary} | — |

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
    <leaflet-edition-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Button } from "@/components/ui/button";
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletDrawControl,
  LeafletFeaturesEditor,
  LeafletBoundingBox,
  LeafletMarker,
  LeafletCircle,
  LeafletPolyline,
  LeafletPolygon,
  LeafletRectangle,
  type LeafletMapExposed,
  type DrawEvent,
} from "@/components/ui/leaflet-map";

const mapRef = ref<LeafletMapExposed | null>(null);

const selectedShape = ref<{
  type: "marker" | "circle" | "polyline" | "polygon" | "rectangle";
  id: number;
} | null>(null);

const editMode = ref(false);

const currentMode = ref<
  | "marker"
  | "circle"
  | "polyline"
  | "polygon"
  | "rectangle"
  | "select"
  | "directSelect"
  | null
>(null);

const currentEditMode = ref<"select" | "directSelect" | null>(null);

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

const moveableShapes = ref({
  markers: false,
  circles: false,
  polylines: false,
  polygons: false,
  rectangles: false,
});

const editableShapes = ref({
  markers: false,
  circles: false,
  polylines: false,
  polygons: false,
  rectangles: false,
});

watch(editMode, (enabled) => {
  if (!enabled) {
    Object.keys(moveableShapes.value).forEach((key) => {
      moveableShapes.value[key as keyof typeof moveableShapes.value] = false;
    });
    Object.keys(editableShapes.value).forEach((key) => {
      editableShapes.value[key as keyof typeof editableShapes.value] = false;
    });
  }
});

const handleEditModeChanged = (mode: "select" | "directSelect" | null) => {
  currentEditMode.value = mode;

  if (mode !== "select") {
    selectedShape.value = null;
  }

  if (mode === "select") {
    Object.keys(moveableShapes.value).forEach((key) => {
      moveableShapes.value[key as keyof typeof moveableShapes.value] = true;
    });

    Object.keys(editableShapes.value).forEach((key) => {
      editableShapes.value[key as keyof typeof editableShapes.value] = false;
    });
  } else if (mode === "directSelect") {
    Object.keys(moveableShapes.value).forEach((key) => {
      moveableShapes.value[key as keyof typeof moveableShapes.value] = false;
    });

    Object.keys(editableShapes.value).forEach((key) => {
      editableShapes.value[key as keyof typeof editableShapes.value] = true;
    });
  } else {
    Object.keys(moveableShapes.value).forEach((key) => {
      moveableShapes.value[key as keyof typeof moveableShapes.value] = false;
    });
    Object.keys(editableShapes.value).forEach((key) => {
      editableShapes.value[key as keyof typeof editableShapes.value] = false;
    });
  }
};

const handleModeSelected = (
  mode:
    | "marker"
    | "circle"
    | "polyline"
    | "polygon"
    | "rectangle"
    | "select"
    | "directSelect"
    | null,
) => {
  currentMode.value = mode;
};

const handleModeChanged = (
  mode: "marker" | "circle" | "polyline" | "polygon" | "rectangle" | null,
) => {
  currentMode.value = mode;
};

const handleShapeCreated = (event: DrawEvent) => {
  const { layer, layerType } = event;

  switch (layerType) {
    case "marker": {
      const latlng = (layer as any).getLatLng();
      const newId =
        markers.value.length > 0
          ? Math.max(...markers.value.map((m) => m.id)) + 1
          : 1;
      markers.value.push({
        id: newId,
        lat: latlng.lat,
        lng: latlng.lng,
        label: `Marker ${newId}`,
      });
      break;
    }
    case "circle": {
      const latlng = (layer as any).getLatLng();
      const radius = (layer as any).getRadius();
      const newId =
        circles.value.length > 0
          ? Math.max(...circles.value.map((c) => c.id)) + 1
          : 1;
      circles.value.push({
        id: newId,
        lat: latlng.lat,
        lng: latlng.lng,
        radius: radius,
        class: "text-blue-500 bg-blue-500/20",
      });
      break;
    }
    case "polyline": {
      const latlngs = (layer as any)
        .getLatLngs()
        .map((ll: any) => [ll.lat, ll.lng] as [number, number]);
      const newId =
        polylines.value.length > 0
          ? Math.max(...polylines.value.map((p) => p.id)) + 1
          : 1;
      polylines.value.push({
        id: newId,
        latlngs: latlngs,
        class: "text-red-500",
        weight: 4,
      });
      break;
    }
    case "polygon": {
      const latlngs = (layer as any)
        .getLatLngs()[0]
        .map((ll: any) => [ll.lat, ll.lng] as [number, number]);
      const newId =
        polygons.value.length > 0
          ? Math.max(...polygons.value.map((p) => p.id)) + 1
          : 1;
      polygons.value.push({
        id: newId,
        latlngs: latlngs,
        class: "text-purple-500 bg-purple-500/30",
      });
      break;
    }
    case "rectangle": {
      const bounds = (layer as any).getBounds();
      const newId =
        rectangles.value.length > 0
          ? Math.max(...rectangles.value.map((r) => r.id)) + 1
          : 1;
      rectangles.value.push({
        id: newId,
        bounds: [
          [bounds.getSouth(), bounds.getWest()],
          [bounds.getNorth(), bounds.getEast()],
        ] as [[number, number], [number, number]],
        class: "text-orange-500 bg-orange-500/20",
      });
      break;
    }
  }
};

const updateMarker = (id: number, lat: number, lng: number) => {
  const marker = markers.value.find((m) => m.id === id);
  if (marker) {
    marker.lat = lat;
    marker.lng = lng;
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
  }
};

const updatePolyline = (id: number, latlngs: Array<[number, number]>) => {
  const polyline = polylines.value.find((p) => p.id === id);
  if (polyline) {
    polyline.latlngs = latlngs;
  }
};

const updatePolygon = (id: number, latlngs: Array<[number, number]>) => {
  const polygon = polygons.value.find((p) => p.id === id);
  if (polygon) {
    polygon.latlngs = latlngs;
  }
};

const updateRectangle = (
  id: number,
  bounds: [[number, number], [number, number]],
) => {
  const rectangle = rectangles.value.find((r) => r.id === id);
  if (rectangle) {
    rectangle.bounds = bounds;
  }
};

const onPolygonClosed = (id: number) => {
  editableShapes.value.polygons = false;
};

const selectShape = (
  type: "marker" | "circle" | "polyline" | "polygon" | "rectangle",
  id: number,
) => {
  if (currentEditMode.value === "select") {
    selectedShape.value = { type, id };
  }
};

const boundingBox = computed(() => {
  if (!selectedShape.value || !mapRef.value?.map) return null;

  const L = (window as any).L;
  if (!L) return null;

  const { type, id } = selectedShape.value;

  try {
    switch (type) {
      case "marker": {
        const marker = markers.value.find((m) => m.id === id);
        if (!marker) return null;
        const point = L.latLng(marker.lat, marker.lng);

        const offset = 0.001;
        return L.latLngBounds(
          [marker.lat - offset, marker.lng - offset],
          [marker.lat + offset, marker.lng + offset],
        );
      }
      case "circle": {
        const circle = circles.value.find((c) => c.id === id);
        if (!circle) return null;
        const center = L.latLng(circle.lat, circle.lng);
        const radiusInDegrees = circle.radius / 111320;
        return L.latLngBounds(
          [circle.lat - radiusInDegrees, circle.lng - radiusInDegrees],
          [circle.lat + radiusInDegrees, circle.lng + radiusInDegrees],
        );
      }
      case "polyline": {
        const polyline = polylines.value.find((p) => p.id === id);
        if (!polyline || polyline.latlngs.length === 0) return null;
        return L.latLngBounds(
          polyline.latlngs.map((ll) => L.latLng(ll[0], ll[1])),
        );
      }
      case "polygon": {
        const polygon = polygons.value.find((p) => p.id === id);
        if (!polygon || polygon.latlngs.length === 0) return null;
        return L.latLngBounds(
          polygon.latlngs.map((ll) => L.latLng(ll[0], ll[1])),
        );
      }
      case "rectangle": {
        const rectangle = rectangles.value.find((r) => r.id === id);
        if (!rectangle) return null;
        return L.latLngBounds(rectangle.bounds[0], rectangle.bounds[1]);
      }
    }
  } catch (error) {
    console.error("Error computing bounding box:", error);
    return null;
  }

  return null;
});

const handleBoundingBoxUpdate = (newBounds: any) => {
  if (!selectedShape.value) return;

  const { type, id } = selectedShape.value;
  const L = (window as any).L;
  if (!L) return;

  const oldBounds = boundingBox.value;
  if (!oldBounds) return;

  const scaleX =
    (newBounds.getEast() - newBounds.getWest()) /
    (oldBounds.getEast() - oldBounds.getWest());
  const scaleY =
    (newBounds.getNorth() - newBounds.getSouth()) /
    (oldBounds.getNorth() - oldBounds.getSouth());
  const centerOld = oldBounds.getCenter();
  const centerNew = newBounds.getCenter();
  const deltaLat = centerNew.lat - centerOld.lat;
  const deltaLng = centerNew.lng - centerOld.lng;

  switch (type) {
    case "marker": {
      const marker = markers.value.find((m) => m.id === id);
      if (marker) {
        marker.lat = centerNew.lat;
        marker.lng = centerNew.lng;
      }
      break;
    }
    case "circle": {
      const circle = circles.value.find((c) => c.id === id);
      if (circle) {
        circle.lat += deltaLat;
        circle.lng += deltaLng;
        circle.radius *= (scaleX + scaleY) / 2;
      }
      break;
    }
    case "polyline": {
      const polyline = polylines.value.find((p) => p.id === id);
      if (polyline) {
        polyline.latlngs = polyline.latlngs.map((ll) => {
          const relLat = (ll[0] - centerOld.lat) * scaleY;
          const relLng = (ll[1] - centerOld.lng) * scaleX;
          return [centerNew.lat + relLat, centerNew.lng + relLng] as [
            number,
            number,
          ];
        });
      }
      break;
    }
    case "polygon": {
      const polygon = polygons.value.find((p) => p.id === id);
      if (polygon) {
        polygon.latlngs = polygon.latlngs.map((ll) => {
          const relLat = (ll[0] - centerOld.lat) * scaleY;
          const relLng = (ll[1] - centerOld.lng) * scaleX;
          return [centerNew.lat + relLat, centerNew.lng + relLng] as [
            number,
            number,
          ];
        });
      }
      break;
    }
    case "rectangle": {
      const rectangle = rectangles.value.find((r) => r.id === id);
      if (rectangle) {
        rectangle.bounds = [
          [newBounds.getSouth(), newBounds.getWest()],
          [newBounds.getNorth(), newBounds.getEast()],
        ] as [[number, number], [number, number]];
      }
      break;
    }
  }
};
</script>

<template>
  <div class="w-full h-full flex flex-col gap-4">
    <div class="rounded flex items-center justify-between">
      <Button
        @click="editMode = !editMode"
        class="px-4 py-2 rounded transition-colors"
        :class="
          editMode
            ? 'bg-blue-500 text-white hover:bg-blue-600'
            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
        "
      >
        {{ editMode ? "Disable edition" : "Enable edition" }}
      </Button>
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

        <LeafletDrawControl
          position="topright"
          :edit-mode="editMode"
          :active-mode="currentMode"
          :modes="{
            select: true,
            directSelect: true,
            marker: true,
            circle: true,
            polyline: true,
            polygon: true,
            rectangle: true,
          }"
          @mode-selected="handleModeSelected"
        />

        <LeafletFeaturesEditor
          :enabled="editMode"
          :mode="currentMode"
          :shape-options="{ color: '#3388ff', fillOpacity: 0.2 }"
          @draw:created="handleShapeCreated"
          @mode-changed="handleModeChanged"
          @edit-mode-changed="handleEditModeChanged"
        />

        <LeafletBoundingBox
          :bounds="boundingBox"
          :visible="currentEditMode === 'select' && !!selectedShape"
          @update:bounds="handleBoundingBoxUpdate"
        />

        <LeafletMarker
          v-for="marker in markers"
          :key="`marker-${marker.id}`"
          :lat="marker.lat"
          :lng="marker.lng"
          :draggable="moveableShapes.markers"
          :editable="editableShapes.markers"
          @update:lat="(lat) => updateMarker(marker.id, lat, marker.lng)"
          @update:lng="(lng) => updateMarker(marker.id, marker.lat, lng)"
          @click="selectShape('marker', marker.id)"
        />

        <LeafletCircle
          v-for="circle in circles"
          :key="`circle-${circle.id}`"
          :lat="circle.lat"
          :lng="circle.lng"
          :radius="circle.radius"
          :class="circle.class"
          :draggable="moveableShapes.circles"
          :editable="editableShapes.circles"
          @update:lat="(lat) => updateCircle(circle.id, { lat })"
          @update:lng="(lng) => updateCircle(circle.id, { lng })"
          @update:radius="(radius) => updateCircle(circle.id, { radius })"
          @click="selectShape('circle', circle.id)"
        />

        <LeafletPolyline
          v-for="polyline in polylines"
          :key="`polyline-${polyline.id}`"
          :latlngs="polyline.latlngs"
          :weight="polyline.weight"
          :class="polyline.class"
          :draggable="moveableShapes.polylines"
          :editable="editableShapes.polylines"
          @update:latlngs="(latlngs) => updatePolyline(polyline.id, latlngs)"
          @click="selectShape('polyline', polyline.id)"
        />

        <LeafletPolygon
          v-for="polygon in polygons"
          :key="`polygon-${polygon.id}`"
          :latlngs="polygon.latlngs"
          :class="polygon.class"
          :draggable="moveableShapes.polygons"
          :editable="editableShapes.polygons"
          :auto-close="true"
          @update:latlngs="(latlngs) => updatePolygon(polygon.id, latlngs)"
          @closed="() => onPolygonClosed(polygon.id)"
          @click="selectShape('polygon', polygon.id)"
        />

        <LeafletRectangle
          v-for="rectangle in rectangles"
          :key="`rectangle-${rectangle.id}`"
          :bounds="rectangle.bounds"
          :class="rectangle.class"
          :draggable="moveableShapes.rectangles"
          :editable="editableShapes.rectangles"
          @update:bounds="(bounds) => updateRectangle(rectangle.id, bounds)"
          @click="selectShape('rectangle', rectangle.id)"
        />
      </LeafletMap>
    </div>

    <div class="p-4 bg-gray-50 rounded">
      <h4 class="font-semibold mb-2">Statistics</h4>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div>
          <div class="text-gray-500">Markers</div>
          <div class="text-lg font-bold text-blue-600">
            {{ markers.length }}
          </div>
        </div>
        <div>
          <div class="text-gray-500">Circles</div>
          <div class="text-lg font-bold text-green-600">
            {{ circles.length }}
          </div>
        </div>
        <div>
          <div class="text-gray-500">Polylines</div>
          <div class="text-lg font-bold text-red-600">
            {{ polylines.length }}
          </div>
        </div>
        <div>
          <div class="text-gray-500">Polygons</div>
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