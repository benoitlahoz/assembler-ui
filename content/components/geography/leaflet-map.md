---
title: LeafletMap
description: Quadtree composable return value for spatial indexing (required)
---

  <p class="text-pretty mt-4">Uses O(log n) quadtree queries for efficient virtualization<br>   </p>

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
          class="bg-red-500/20 border border-red-500"
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
import type { LeafletBoundingBoxStyles } from "./LeafletBoundingBox.vue";
import type { LeafletSelectionContext } from "./LeafletFeaturesSelector.vue";
import type { LeafletControlsContext } from "./LeafletControls.vue";
type L = typeof L;

export { default as LeafletMap } from "./LeafletMap.vue";
export { default as LeafletZoomControl } from "./LeafletZoomControl.vue";
export { default as LeafletDrawControl } from "./LeafletDrawControl.vue";
export { default as LeafletControls } from "./LeafletControls.vue";
export { default as LeafletControlItem } from "./LeafletControlItem.vue";
export { default as LeafletFeaturesEditor } from "./LeafletFeaturesEditor.vue";
export { default as LeafletFeaturesSelector } from "./LeafletFeaturesSelector.vue";
export { default as LeafletVirtualize } from "./LeafletVirtualize.vue";
export { default as LeafletBoundingBox } from "./LeafletBoundingBox.vue";
export { default as LeafletBoundingBoxRectangle } from "./LeafletBoundingBoxRectangle.vue";
export { default as LeafletFeatureHandle } from "./LeafletFeatureHandle.vue";
export { default as LeafletTileLayer } from "./LeafletTileLayer.vue";
export { default as LeafletMarker } from "./LeafletMarker.vue";
export { default as LeafletCircle } from "./LeafletCircle.vue";
export { default as LeafletPolyline } from "./LeafletPolyline.vue";
export { default as LeafletPolygon } from "./LeafletPolygon.vue";
export { default as LeafletRectangle } from "./LeafletRectangle.vue";
export { default as LeafletMeasureTool } from "./LeafletMeasureTool.vue";

export const LeafletModuleKey: InjectionKey<Ref<L | undefined>> =
  Symbol("LeafletModule");
export const LeafletMapKey: InjectionKey<Ref<Map | null>> =
  Symbol("LeafletMap");
export const LeafletTileLayersKey: InjectionKey<
  Ref<TileLayerOptions & { name: string } & { urlTemplate: string }>
> = Symbol("LeafletTileLayerOptions");
export const LeafletErrorsKey: InjectionKey<Ref<Error[]>> =
  Symbol("LeafletErrors");
export const LeafletBoundingBoxStylesKey: InjectionKey<
  Ref<LeafletBoundingBoxStyles | undefined>
> = Symbol("LeafletFeatureHandles");
export const LeafletSelectionKey: InjectionKey<LeafletSelectionContext> =
  Symbol("LeafletSelection");
export const LeafletControlsKey: InjectionKey<
  LeafletControlsContext | undefined
> = Symbol("LeafletControls");

export type { LeafletMapProps } from "./LeafletMap.vue";
export type { LeafletMapExposed } from "./LeafletMap.vue";
export type { LeafletZoomControlProps } from "./LeafletZoomControl.vue";
export type { LeafletDrawControlProps } from "./LeafletDrawControl.vue";
export type {
  LeafletFeaturesEditorProps,
  FeatureDrawEvent,
  FeatureShapeType,
} from "./LeafletFeaturesEditor.vue";
export {
  type FeatureSelectMode,
  type LeafletSelectionContext,
  type SelectedFeature,
  type FeatureReference,
  type LeafletFeaturesSelectorProps,
} from "./LeafletFeaturesSelector.vue";
export type {
  LeafletBoundingBoxProps,
  LeafletBoundingBoxStyles,
  LeafletBoxStyle,
  LeafletHandleStyle,
} from "./LeafletBoundingBox.vue";
export type {
  LeafletFeatureHandleProps,
  LeafletFeatureHandleRole,
} from "./LeafletFeatureHandle.vue";
export type { LeafletTileLayerProps } from "./LeafletTileLayer.vue";
export type { LeafletMarkerProps } from "./LeafletMarker.vue";
export type { LeafletCircleProps } from "./LeafletCircle.vue";
export type { LeafletPolylineProps } from "./LeafletPolyline.vue";
export type { LeafletPolygonProps } from "./LeafletPolygon.vue";
export type { LeafletRectangleProps } from "./LeafletRectangle.vue";
export type { LeafletVirtualizeProps } from "./LeafletVirtualize.vue";
export type { LeafletMeasureToolProps } from "./LeafletMeasureTool.vue";
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
import { useLeaflet } from "~~/registry/new-york/composables/use-leaflet/useLeaflet";
import {
  LeafletErrorsKey,
  LeafletMapKey,
  LeafletModuleKey,
  LeafletTileLayersKey,
} from ".";
import type Leaflet from "leaflet";
import type { LeafletMouseEvent } from "leaflet";
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
const mapContainer = ref<HTMLElement | null>(null);
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

      const { L: ImportedLeaflet } = await useLeaflet();
      L.value = ImportedLeaflet.value;

      nextTick(() => {
        if (!L.value || !mapContainer.value) return;

        map.value = L.value
          .map(mapContainer.value, { zoomControl: false })
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
    ref="mapContainer"
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
import { inject, watch, ref, type Ref, onBeforeUnmount, provide } from "vue";
import {
  LeafletBoundingBoxStylesKey,
  LeafletMapKey,
  LeafletModuleKey,
} from ".";

export interface LeafletHandleStyle {
  className: string;
  html: string;
  iconSize: [number, number];
}

export interface LeafletBoxStyle {
  color: string;
  weight: number;
  fill: boolean;
  fillColor?: string;
  dashArray?: string;
  interactive: boolean;
}

export interface LeafletBoundingBoxStyles {
  box: LeafletBoxStyle;
  corner: LeafletHandleStyle;
  edge: LeafletHandleStyle;
  rotate: LeafletHandleStyle;
  center: LeafletHandleStyle;
}

export interface LeafletBoundingBoxProps {
  bounds?: L.LatLngBounds | null;
  visible?: boolean;
  showRotateHandle?: boolean;
  constrainSquare?: boolean;
}

const props = withDefaults(defineProps<LeafletBoundingBoxProps>(), {
  bounds: null,
  visible: false,
  showRotateHandle: true,
  constrainSquare: false,
});

const emit = defineEmits<{
  "update:bounds": [bounds: L.LatLngBounds];
  rotate: [angle: number];
  "rotate-end": [];
  scale: [scaleX: number, scaleY: number];
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const stylesOptions = ref<LeafletBoundingBoxStyles>({
  box: {
    color: "#3388ff",
    weight: 2,
    fill: false,
    fillColor: undefined,
    dashArray: "5, 5",
    interactive: false,
  },
  corner: {
    className: "leaflet-bounding-box-handle leaflet-bounding-box-corner",
    html: '<div style="width:8px;height:8px;background:#fff;border:2px solid #3388ff;border-radius:2px;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [8, 8],
  },
  edge: {
    className: "leaflet-bounding-box-handle leaflet-bounding-box-edge",
    html: '<div style="width:8px;height:8px;background:#fff;border:2px solid #3388ff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [8, 8],
  },
  rotate: {
    className: "leaflet-bounding-box-handle leaflet-bounding-box-rotate",
    html: '<div style="width:12px;height:12px;background:#fff;border:2px solid #3388ff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [12, 12],
  },
  center: {
    className: "leaflet-bounding-box-handle leaflet-bounding-box-center",
    html: '<div style="width:12px;height:12px;background:#ff8800;border:2px solid #fff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [12, 12],
  },
});

provide(LeafletBoundingBoxStylesKey, stylesOptions);

const boundingBox = ref<L.Rectangle | null>(null);
const cornerHandles = ref<L.Marker[]>([]);
const edgeHandles = ref<L.Marker[]>([]);
const rotateHandle = ref<L.Marker | null>(null);
const centerHandle = ref<L.Marker | null>(null);

const isDragging = ref(false);
const isRotating = ref(false);
const isScaling = ref(false);

let scaleStartBounds: L.LatLngBounds | null = null;
let scaleCornerIndex = -1;
let rotationStartAngle = 0;

const clearHandles = () => {
  cornerHandles.value.forEach((h) => h.remove());
  cornerHandles.value = [];
  edgeHandles.value.forEach((h) => h.remove());
  edgeHandles.value = [];
  if (rotateHandle.value) {
    rotateHandle.value.remove();
    rotateHandle.value = null;
  }
  if (centerHandle.value) {
    centerHandle.value.remove();
    centerHandle.value = null;
  }
  if (boundingBox.value) {
    boundingBox.value.remove();
    boundingBox.value = null;
  }
};

const constrainToSquare = (
  bounds: L.LatLngBounds,
  center?: L.LatLng,
  originalBounds?: L.LatLngBounds,
): L.LatLngBounds => {
  if (!L.value) return bounds;

  const currentCenter = center || bounds.getCenter();
  const latDiff = bounds.getNorth() - bounds.getSouth();
  const lngDiff = bounds.getEast() - bounds.getWest();

  const latMeters = latDiff * 111320;
  const lngMeters =
    lngDiff * 111320 * Math.cos((currentCenter.lat * Math.PI) / 180);

  let targetMeters = latMeters;
  if (originalBounds) {
    const origLatDiff = originalBounds.getNorth() - originalBounds.getSouth();
    const origLngDiff = originalBounds.getEast() - originalBounds.getWest();
    const origLatMeters = origLatDiff * 111320;
    const origLngMeters =
      origLngDiff * 111320 * Math.cos((currentCenter.lat * Math.PI) / 180);

    const latChange = Math.abs(latMeters - origLatMeters);
    const lngChange = Math.abs(lngMeters - origLngMeters);

    targetMeters = lngChange > latChange ? lngMeters : latMeters;
  } else {
    targetMeters = (latMeters + lngMeters) / 2;
  }

  const halfLatDiff = targetMeters / 2 / 111320;
  const halfLngDiff =
    targetMeters / 2 / (111320 * Math.cos((currentCenter.lat * Math.PI) / 180));

  return L.value.latLngBounds(
    [currentCenter.lat - halfLatDiff, currentCenter.lng - halfLngDiff],
    [currentCenter.lat + halfLatDiff, currentCenter.lng + halfLngDiff],
  );
};

const createBoundingBox = () => {
  if (!props.bounds || !L.value || !map.value || !props.visible) {
    clearHandles();
    return;
  }

  clearHandles();

  boundingBox.value = L.value
    .rectangle(props.bounds, stylesOptions.value.box)
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
      icon: L.value!.divIcon(stylesOptions.value.corner),
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

      if (props.constrainSquare) {
        newBounds = constrainToSquare(
          newBounds,
          scaleStartBounds.getCenter(),
          scaleStartBounds,
        );
      }

      if (boundingBox.value) {
        boundingBox.value.setBounds(newBounds);
      }

      updateHandlePositions(newBounds);

      emit("update:bounds", newBounds);
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
      icon: L.value!.divIcon(stylesOptions.value.edge),
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

      if (props.constrainSquare) {
        newBounds = constrainToSquare(
          newBounds,
          scaleStartBounds.getCenter(),
          scaleStartBounds,
        );
      }

      if (boundingBox.value) {
        boundingBox.value.setBounds(newBounds);
      }

      updateHandlePositions(newBounds);

      emit("update:bounds", newBounds);
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

  if (props.showRotateHandle) {
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
        icon: L.value.divIcon(stylesOptions.value.rotate),
      })
      .addTo(map.value);

    rotateHandle.value.on("mousedown", () => {
      if (map.value) {
        map.value.getContainer().style.cursor = "grabbing";
      }
    });

    rotateHandle.value.on("dragstart", () => {
      isRotating.value = true;
      if (map.value && props.bounds) {
        map.value.dragging.disable();

        if (boundingBox.value) boundingBox.value.setStyle({ opacity: 0 });
        cornerHandles.value.forEach((h) => h.setOpacity(0));
        edgeHandles.value.forEach((h) => h.setOpacity(0));

        const center = props.bounds.getCenter();
        const handlePos = rotateHandle.value!.getLatLng();
        const dx = handlePos.lng - center.lng;
        const dy = handlePos.lat - center.lat;
        rotationStartAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      }
    });

    rotateHandle.value.on("drag", () => {
      if (!isRotating.value || !props.bounds) return;

      const center = props.bounds.getCenter();
      const handlePos = rotateHandle.value!.getLatLng();

      const dx = handlePos.lng - center.lng;
      const dy = handlePos.lat - center.lat;
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      const rotationAngle = currentAngle - rotationStartAngle;

      emit("rotate", rotationAngle);
    });

    rotateHandle.value.on("dragend", () => {
      isRotating.value = false;
      if (map.value) {
        map.value.getContainer().style.cursor = "";
        map.value.dragging.enable();
      }

      if (boundingBox.value) boundingBox.value.setStyle({ opacity: 1 });
      cornerHandles.value.forEach((h) => h.setOpacity(1));
      edgeHandles.value.forEach((h) => h.setOpacity(1));

      emit("rotate-end");

      setTimeout(() => {
        if (props.bounds) {
          createBoundingBox();
        }
      }, 0);
    });

    rotateHandle.value.on("mouseup", () => {
      if (map.value) {
        map.value.getContainer().style.cursor = "";
      }
    });
  }

  const center = props.bounds.getCenter();
  centerHandle.value = L.value
    .marker(center, {
      draggable: false,
      icon: L.value.divIcon(stylesOptions.value.center),
    })
    .addTo(map.value);
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

  if (centerHandle.value) {
    const center = bounds.getCenter();
    centerHandle.value.setLatLng(center);
  }
};

watch(
  () => {
    if (props.bounds) {
      return {
        visible: props.visible,
        showRotateHandle: props.showRotateHandle,
        south: props.bounds.getSouth(),
        north: props.bounds.getNorth(),
        west: props.bounds.getWest(),
        east: props.bounds.getEast(),
      };
    }
    return {
      visible: props.visible,
      showRotateHandle: props.showRotateHandle,
      south: 0,
      north: 0,
      west: 0,
      east: 0,
    };
  },
  (newVal, oldVal) => {
    if (isRotating.value || isScaling.value) {
      return;
    }

    const boundsChanged =
      oldVal &&
      newVal &&
      (oldVal.south !== newVal.south ||
        oldVal.north !== newVal.north ||
        oldVal.west !== newVal.west ||
        oldVal.east !== newVal.east);

    const showRotateHandleChanged =
      oldVal && newVal && oldVal.showRotateHandle !== newVal.showRotateHandle;

    if (
      boundingBox.value &&
      props.bounds &&
      props.visible &&
      !isDragging.value &&
      cornerHandles.value.length > 0 &&
      boundsChanged &&
      !showRotateHandleChanged
    ) {
      boundingBox.value.setBounds(props.bounds);
      updateHandlePositions(props.bounds);
    } else if (
      newVal.visible !== oldVal?.visible ||
      !boundingBox.value ||
      showRotateHandleChanged
    ) {
      createBoundingBox();
    }
  },
  { immediate: true, deep: true },
);

onBeforeUnmount(() => {
  clearHandles();
});
</script>

<template>
  <div data-slot="leaflet-bounding-box"><slot /></div>
</template>
```

```vue [src/components/ui/leaflet-map/LeafletBoundingBoxRectangle.vue]
<script setup lang="ts">
import { watch, inject, type HTMLAttributes, ref } from "vue";
import { cn } from "@/lib/utils";
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletBoundingBoxStylesKey, type LeafletBoxStyle } from ".";
import { removeWhitespaces } from "@assemblerjs/core";

export interface LeafletBoundingBoxRectangleProps {
  class?: HTMLAttributes["class"];
  dashed?: number[];
}

const props = withDefaults(defineProps<LeafletBoundingBoxRectangleProps>(), {
  class: "border-2 border-blue-500",
});

const stylesOptions = inject(LeafletBoundingBoxStylesKey, ref());

const { withHiddenElement, getTailwindBaseCssValues } = useCssParser();

const tailwindToBoxOptions = (className: string, dashed?: number[]) => {
  const style = withHiddenElement((el: HTMLElement): LeafletBoxStyle => {
    const config = getTailwindBaseCssValues(el, [
      "background-color",
      "border-color",
      "border-width",
      "opacity",
    ]);

    const color = config["border-color"] || "#3388ff";
    const weight = config["border-width"]
      ? parseInt(config["border-width"])
      : 2;
    const fill: boolean =
      !!config["background-color"] &&
      removeWhitespaces(config["background-color"]) !== "rgba(0,0,0,0)" &&
      config["opacity"] !== "0";
    const fillColor = fill ? config["background-color"] : undefined;

    return {
      color,
      weight,
      fill,
      fillColor,
      dashArray: dashed ? dashed.join(", ") : undefined,
      interactive: false,
    };
  }, className);

  return style;
};

watch(
  () => [stylesOptions.value, props.class, props.dashed],
  () => {
    const options = tailwindToBoxOptions(props.class || "", props.dashed);
    if (stylesOptions.value) {
      stylesOptions.value.box = options;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    data-slot="leaflet-bounding-box-rectangle"
    :class="cn('hidden -z-50', props.class)"
  ></div>
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
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletMapKey, LeafletModuleKey, LeafletSelectionKey } from ".";
import type { FeatureReference } from "./LeafletFeaturesSelector.vue";
import "./leaflet-editing.css";

export interface LeafletCircleProps {
  id?: string | number;
  lat?: number | string;
  lng?: number | string;
  radius?: number | string;
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletCircleProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  radius: 100,
  editable: false,
  draggable: false,
  selectable: false,
});

const emit = defineEmits<{
  "update:lat": [lat: number];
  "update:lng": [lng: number];
  "update:radius": [radius: number];
  click: [];
  dragstart: [];
}>();

const { getLeafletShapeColors } = useCssParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const circle = ref<L.Circle | null>(null);
const centerMarker = ref<L.Marker | null>(null);
const radiusMarker = ref<L.Marker | null>(null);
const circleId = ref<string | number>(
  props.id ?? `circle-${Date.now()}-${Math.random()}`,
);

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

    emit("dragstart");
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

    emit("update:lat", newLatLng.lat);
    emit("update:lng", newLatLng.lng);

    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(circleId.value);
    }

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
  }
};

const registerWithSelection = () => {
  if (!props.selectable || !selectionContext || !circle.value) return;

  const featureRef: FeatureReference = {
    id: circleId.value,
    type: "circle",
    getBounds: () => {
      if (!circle.value || !L.value) return null;

      const center = circle.value.getLatLng();
      const radius = circle.value.getRadius();

      const radiusInLatDegrees = radius / 111320;
      const radiusInLngDegrees =
        radius / (111320 * Math.cos((center.lat * Math.PI) / 180));

      return L.value.latLngBounds(
        [center.lat - radiusInLatDegrees, center.lng - radiusInLngDegrees],
        [center.lat + radiusInLatDegrees, center.lng + radiusInLngDegrees],
      );
    },
    applyTransform: (bounds: L.LatLngBounds) => {
      if (!circle.value) return;
      const center = bounds.getCenter();

      const latDiff = bounds.getNorth() - bounds.getSouth();
      const lngDiff = bounds.getEast() - bounds.getWest();

      const radiusLat = (latDiff / 2) * 111320;
      const radiusLng =
        (lngDiff / 2) * 111320 * Math.cos((center.lat * Math.PI) / 180);
      const radius = (radiusLat + radiusLng) / 2;

      circle.value.setLatLng(center);
      circle.value.setRadius(radius);

      emit("update:lat", center.lat);
      emit("update:lng", center.lng);
      emit("update:radius", radius);
    },
  };

  selectionContext.registerFeature(featureRef);
};

watch(
  () => [
    map.value,
    props.lat,
    props.lng,
    props.radius,
    props.editable,
    props.draggable,
    props.selectable,
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

            if (radiusMarker.value && props.editable) {
              const center = circle.value.getLatLng();
              const radius = circle.value.getRadius();
              const radiusLatLng = L.value.latLng(
                center.lat,
                center.lng +
                  radius / 111320 / Math.cos((center.lat * Math.PI) / 180),
              );
              radiusMarker.value.setLatLng(radiusLatLng);
            }
          }
        } else {
          circle.value = L.value.circle(
            [Number(props.lat), Number(props.lng)],
            {
              radius: Number(props.radius),
            },
          );
          circle.value.addTo(map.value);

          if (props.selectable && selectionContext) {
            circle.value.on("click", () => {
              selectionContext.selectFeature("circle", circleId.value);
              emit("click");
            });
            circle.value.on("mousedown", (e: any) => {
              if (props.draggable) {
                selectionContext.selectFeature("circle", circleId.value);
              }
            });
          } else {
            circle.value.on("click", () => {
              emit("click");
            });
          }

          setupMapDragHandlers();

          if (props.selectable && selectionContext) {
            registerWithSelection();
          }
        }

        if (circle.value) {
          const selectableChanged =
            oldVal && Boolean(oldVal[6]) !== Boolean(newVal[6]);
          if (selectableChanged) {
            circle.value.off("click");
            circle.value.off("mousedown");

            if (props.selectable && selectionContext) {
              circle.value.on("click", () => {
                selectionContext.selectFeature("circle", circleId.value);
                emit("click");
              });
              circle.value.on("mousedown", (e: any) => {
                if (props.draggable) {
                  selectionContext.selectFeature("circle", circleId.value);
                }
              });
              registerWithSelection();
            } else {
              circle.value.on("click", () => {
                emit("click");
              });
              if (selectionContext) {
                selectionContext.unregisterFeature(circleId.value);
              }
            }
          }
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
  if (props.selectable && selectionContext) {
    selectionContext.unregisterFeature(circleId.value);
  }

  clearEditMarkers();
  if (circle.value) {
    circle.value.remove();
  }
});
</script>

<template><slot /></template>
```

```vue [src/components/ui/leaflet-map/LeafletControlItem.vue]
<script setup lang="ts">
import {
  inject,
  unref,
  useTemplateRef,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { LeafletControlsKey } from ".";

export interface LeafletControlItemProps {
  name: string;
  title?: string;
  type?: "push" | "toggle";
  active?: boolean;
}

const props = withDefaults(defineProps<LeafletControlItemProps>(), {
  title: "A control button",
  type: "toggle",
  active: false,
});

const emit = defineEmits<{
  (e: "click", name: string): void;
}>();

const wrapperRef = useTemplateRef("wrapperRef");

const controlsContext = inject(LeafletControlsKey);

let observer: MutationObserver | null = null;

const getContentHtml = () => {
  const wrapper = unref(wrapperRef);
  if (wrapper) {
    const firstChild = wrapper.firstElementChild;
    if (firstChild) {
      if (firstChild.tagName === "svg" || firstChild.querySelector("svg")) {
        const svg =
          firstChild.tagName === "svg"
            ? firstChild
            : firstChild.querySelector("svg");

        if (svg && svg.children.length > 0) {
          const clone = firstChild.cloneNode(true) as HTMLElement;
          const svgElement =
            clone.tagName === "svg" ? clone : clone.querySelector("svg");

          if (svgElement) {
            const computedColor = window.getComputedStyle(firstChild).color;

            svgElement
              .querySelectorAll("path, circle, rect, polygon, polyline, line")
              .forEach((el) => {
                const element = el as SVGElement;
                if (
                  element.hasAttribute("fill") &&
                  element.getAttribute("fill") !== "none"
                ) {
                  element.setAttribute("fill", computedColor || "currentColor");
                }
                if (
                  element.hasAttribute("stroke") &&
                  element.getAttribute("stroke") !== "none"
                ) {
                  element.setAttribute(
                    "stroke",
                    computedColor || "currentColor",
                  );
                }
              });
          }

          return clone.outerHTML;
        }
      } else {
        return firstChild.outerHTML;
      }
    }
  }
  return "";
};

const registerContent = () => {
  if (!controlsContext) return;

  const html = getContentHtml();
  if (html) {
    controlsContext.registerItem({
      name: props.name,
      title: props.title || "A control button",
      html,
      type: props.type,
      active: props.active,
    });
  }
};

watch(
  () => wrapperRef.value,
  (wrapper) => {
    if (!wrapper) return;

    nextTick(() => {
      registerContent();

      observer = new MutationObserver((mutations) => {
        const hasContent = mutations.some((mutation) => {
          return (
            mutation.addedNodes.length > 0 || mutation.type === "attributes"
          );
        });

        if (hasContent) {
          registerContent();
        }
      });

      const firstChild = wrapper.firstElementChild;
      if (firstChild) {
        observer.observe(firstChild, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["viewBox", "width", "height"],
        });
      }
    });
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<template>
  <div class="hidden">
    <div ref="wrapperRef">
      <slot>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
      </slot>
    </div>
  </div>
</template>
```

```vue [src/components/ui/leaflet-map/LeafletControls.vue]
<script setup lang="ts">
import {
  ref,
  provide,
  type Ref,
  type HTMLAttributes,
  inject,
  watch,
  nextTick,
} from "vue";
import { cn } from "@/lib/utils";
import type { ControlOptions } from "leaflet";
import { LeafletControlsKey, LeafletMapKey, LeafletModuleKey } from ".";

export interface ControlItemReference {
  name: string;
  title: string;
  html: string;
  type?: "push" | "toggle";
  active?: boolean;
}

export interface LeafletControlsContext {
  controlsRegistry: Ref<Map<string, ControlItemReference>>;
  registerItem: (item: ControlItemReference) => void;
  unregisterItem: (name: string) => void;
}

export interface LeafletControlsProps {
  position?: ControlOptions["position"];
  class?: HTMLAttributes["class"];
  style?: HTMLAttributes["style"];
  activeItem?: string | null;
  enabled?: boolean;
}

const props = withDefaults(defineProps<LeafletControlsProps>(), {
  position: "topleft",
  class: "rounded-[4px] shadow-(--leaflet-control-bar-shadow) bg-white",
  style: "",
  activeItem: null,
  enabled: true,
});

const emit = defineEmits<{
  (e: "item-clicked", name: string): void;
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const control = ref<any>(null);

const controlsRegistry = ref<Map<string, ControlItemReference>>(new Map());

const registerItem = (item: ControlItemReference) => {
  const existing = controlsRegistry.value.get(item.name);

  if (!existing || existing.html !== item.html) {
    controlsRegistry.value.set(item.name, item);

    controlsRegistry.value = new Map(controlsRegistry.value);
  }
};

const unregisterItem = (name: string) => {
  controlsRegistry.value.delete(name);
};

const createButton = (container: HTMLElement, name: string, title: string) => {
  if (!L.value) return;

  const controlItem = controlsRegistry.value.get(name);
  if (!controlItem) {
    return;
  }
  const button = L.value!.DomUtil.create(
    "div",
    "leaflet-draw-button",
    container,
  );
  button.title = title;
  button.innerHTML = controlItem.html;
  button.setAttribute("role", "button");
  button.setAttribute("aria-label", title);
  button.setAttribute("tabindex", "0");
  button.dataset.toolType = name;
  button.dataset.buttonType = controlItem.type || "toggle";

  if (
    controlItem.type === "toggle" &&
    (controlItem.active || props.activeItem === name)
  ) {
    button.classList.add("leaflet-draw-toolbar-button-enabled");
  }

  L.value!.DomEvent.on(button, "click", (e: Event) => {
    L.value!.DomEvent.preventDefault(e);
    handleButtonClick(name, controlItem.type || "toggle");
  });

  return button;
};

const handleButtonClick = (name: string, type: "push" | "toggle") => {
  if (type === "toggle") {
    emit("item-clicked", name);
  } else {
    emit("item-clicked", name);
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
    const buttonType = htmlButton.dataset.buttonType;

    if (buttonType === "toggle") {
      if (toolType === props.activeItem) {
        htmlButton.classList.add("leaflet-draw-toolbar-button-enabled");
      } else {
        htmlButton.classList.remove("leaflet-draw-toolbar-button-enabled");
      }
    }
  });
};

const createControl = () => {
  if (!L.value || !map.value) return;

  const items = Array.from(controlsRegistry.value.values());

  const Controls = L.value.Control.extend({
    options: {
      position: props.position,
    },

    onAdd() {
      const container = L.value!.DomUtil.create(
        "div",
        "leaflet-controls-bar leaflet-control leaflet-bar",
      );

      L.value!.DomEvent.disableClickPropagation(container);
      L.value!.DomEvent.disableScrollPropagation(container);

      controlsRegistry.value.forEach((control, name) => {
        createButton(container, name, control.title);
      });

      return container;
    },

    onRemove() {},
  });

  control.value = new Controls();
  control.value.addTo(map.value);
};

const tryCreateControl = () => {
  const itemsCount = controlsRegistry.value.size;

  if (map.value && props.enabled && itemsCount > 0 && !control.value) {
    nextTick(() => {
      createControl();
    });
  }
};

watch(
  [() => map.value, () => props.enabled],
  ([newMap, newEnabled]) => {
    if (newMap && newEnabled) {
      if (!control.value) {
        tryCreateControl();
      } else if (!control.value._map) {
        control.value.addTo(newMap);
      }
    } else if (control.value && control.value._map) {
      control.value.remove();
    }
  },
  { immediate: true },
);

watch(
  () => props.activeItem,
  () => {
    nextTick(() => {
      updateActiveButton();
    });
  },
);

watch(
  controlsRegistry,
  () => {
    if (!control.value) {
      tryCreateControl();
    }
  },
  { deep: true },
);

const context: LeafletControlsContext = {
  controlsRegistry,
  registerItem,
  unregisterItem,
};

provide(LeafletControlsKey, context);
</script>

<template>
  <slot />
  <div :class="cn('hidden', props.class)" :style="props.style"></div>
</template>

<style>
:root {
  --leaflet-control-bar-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
}
</style>
```

```vue [src/components/ui/leaflet-map/LeafletDrawControl.vue]
<script setup lang="ts">
import { ref, inject, watch, onBeforeUnmount, nextTick } from "vue";
import type { ControlOptions } from "leaflet";
import {
  LeafletMapKey,
  LeafletModuleKey,
  type FeatureSelectMode,
  type FeatureShapeType,
} from ".";

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
      | "direct-select"
      | null,
  ): void;
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const control = ref<any>(null);

const shouldEnableButton = (type: string): boolean => {
  if (!props.modes) return false;
  const config =
    type === "direct-select"
      ? props.modes["directSelect"]
      : props.modes[type as keyof typeof props.modes];
  if (config === undefined) return false;
  if (typeof config === "boolean") return config;
  return config.enabled !== false;
};

const getIconSvg = (type: FeatureShapeType | FeatureSelectMode): string => {
  const color = "#333";
  const svgs: Record<string, string> = {
    marker: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}"/></svg>`,
    circle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="2.5" fill="none"/></svg>`,
    polyline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17 L8 12 L13 15 L21 7" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="3" cy="17" r="2.5" fill="${color}"/><circle cx="8" cy="12" r="2.5" fill="${color}"/><circle cx="13" cy="15" r="2.5" fill="${color}"/><circle cx="21" cy="7" r="2.5" fill="${color}"/></svg>`,
    polygon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3 L21 8 L18 17 L6 17 L3 8 Z" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="3" r="2.5" fill="${color}"/><circle cx="21" cy="8" r="2.5" fill="${color}"/><circle cx="18" cy="17" r="2.5" fill="${color}"/><circle cx="6" cy="17" r="2.5" fill="${color}"/><circle cx="3" cy="8" r="2.5" fill="${color}"/></svg>`,
    rectangle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="16" height="12" stroke="${color}" stroke-width="2.5" rx="1" fill="none"/></svg>`,
    select: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 4 L5 17 L10 12.5 L13 18 L15 17 L12 11.5 L18 11.5 Z" fill="${color}" stroke="${color}" stroke-width="1" stroke-linejoin="round"/></svg>`,
    "direct-select": `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 4 L5 17 L10 12.5 L13 18 L15 17 L12 11.5 L18 11.5 Z" fill="white" stroke="${color}" stroke-width="2" stroke-linejoin="round"/></svg>`,
  };
  return svgs[type] || "";
};

const createButton = (
  container: HTMLElement,
  type: FeatureShapeType | FeatureSelectMode,
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

const toggleDrawMode = (type: FeatureShapeType | FeatureSelectMode) => {
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
        if (shouldEnableButton("direct-select")) {
          createButton(container, "direct-select", "Direct Selection Tool (A)");
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

```vue [src/components/ui/leaflet-map/LeafletFeatureHandle.vue]
<script setup lang="ts">
import { watch, inject, type HTMLAttributes, ref } from "vue";
import { cn } from "@/lib/utils";
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletBoundingBoxStylesKey } from ".";

export type LeafletFeatureHandleRole = "corner" | "edge" | "center" | "rotate";

export interface LeafletFeatureHandleProps {
  role: LeafletFeatureHandleRole;
  class?: HTMLAttributes["class"];
  size?: number | string;
}

const props = withDefaults(defineProps<LeafletFeatureHandleProps>(), {
  class:
    "bg-red-500 border-2 border-red-500 opacity-30 rounded-full shadow-[0_0_4px_0_rgba(0,0,0,0.2)]",
  size: 8,
});

const { withHiddenElement, getTailwindBaseCssValues } = useCssParser();

const stylesOptions = inject(LeafletBoundingBoxStylesKey, ref());

const tailwindToMarkerHtml = (className: string, size: number | string) => {
  const styles = withHiddenElement((el: HTMLElement) => {
    const config = getTailwindBaseCssValues(el, [
      "background-color",
      "border",
      "border-radius",
      "box-shadow",
    ]);

    const styleString = Object.entries(config ?? {})
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => `${key}: ${value};`)
      .join(" ");

    return styleString;
  }, className);

  return `<div style="${styles} width: ${size}px; height: ${size}px;"></div>`;
};

watch(
  () => [stylesOptions.value, props.class, props.size],
  () => {
    const options = {
      className: `leaflet-bounding-box-handle leaflet-bounding-box-${props.role}`,
      html: tailwindToMarkerHtml(props.class || "", props.size || 8),
      iconSize: [Number(props.size) || 8, Number(props.size) || 8] as [
        number,
        number,
      ],
    };

    if (stylesOptions.value) {
      stylesOptions.value[props.role] = options;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    data-slot="leaflet-bounding-box-corner-handle"
    :class="cn('hidden -z-50', props.class)"
  ></div>
</template>
```

```vue [src/components/ui/leaflet-map/LeafletFeaturesEditor.vue]
<script setup lang="ts">
import { ref, inject, watch, onBeforeUnmount } from "vue";
import type { Layer, LatLng, LeafletMouseEvent } from "leaflet";
import { LeafletMapKey, LeafletModuleKey, type FeatureSelectMode } from ".";

export interface FeatureDrawEvent {
  layer: Layer;
  layerType: string;
  type: string;
}

export interface FeatureDrawHandlerOptions {
  enabled?: boolean;
  shapeOptions?: any;
  repeatMode?: boolean;
}

export type FeatureShapeType =
  | "marker"
  | "circle"
  | "polyline"
  | "polygon"
  | "rectangle";
export type FeatureShapeOptions =
  | {
      type: "marker";
      id: string;
      lat: number;
      lng: number;
    }
  | {
      type: "circle";
      id: string;
      lat: number;
      lng: number;
      radius: number;
    }
  | {
      type: "polyline";
      id: string;
      latlngs: Array<{ lat: number; lng: number }>;
    }
  | {
      type: "polygon";
      id: string;
      latlngs: Array<{ lat: number; lng: number }>;
    }
  | {
      type: "rectangle";
      id: string;
      bounds: {
        southWest: { lat: number; lng: number };
        northEast: { lat: number; lng: number };
      };
    };

export interface LeafletFeaturesEditorProps {
  enabled?: boolean;
  mode?: FeatureShapeType | FeatureSelectMode | null;
  shapeOptions?: any;
  repeatMode?: boolean;
}

const props = withDefaults(defineProps<LeafletFeaturesEditorProps>(), {
  enabled: false,
  mode: null,
  repeatMode: false,
});

const emit = defineEmits<{
  (e: "draw:created", event: FeatureDrawEvent): void;
  (e: "draw:drawstart", event: { layerType: string }): void;
  (e: "draw:drawstop", event: { layerType: string }): void;
  (e: "mode-changed", mode: FeatureShapeType | null): void;
  (e: "edit-mode-changed", mode: FeatureSelectMode | null): void;
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

    const event: FeatureDrawEvent = {
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
  let isDrawing = false;

  const mouseDownHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || isDrawing) return;

    isDrawing = true;
    centerLatLng = e.latlng;
    tempCircle = L.value.circle(centerLatLng, {
      ...props.shapeOptions,
      radius: 1,
    });
    tempCircle.addTo(map.value);

    if (map.value.dragging) {
      map.value.dragging.disable();
    }
  };

  const mouseUpHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || !isDrawing || !centerLatLng)
      return;

    const radius = map.value.distance(centerLatLng, e.latlng);

    if (radius > 1) {
      const circle = L.value.circle(centerLatLng, {
        ...props.shapeOptions,
        radius,
      });

      const event: FeatureDrawEvent = {
        layer: circle,
        layerType: "circle",
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
    if (!enabled || !isDrawing || !centerLatLng || !tempCircle || !map.value)
      return;
    const radius = map.value.distance(centerLatLng, e.latlng);
    tempCircle.setRadius(radius);
  };

  const cleanup = () => {
    if (tempCircle) {
      tempCircle.remove();
      tempCircle = null;
    }
    centerLatLng = null;
    isDrawing = false;

    if (map.value && map.value.dragging) {
      map.value.dragging.enable();
    }
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("mousedown", mouseDownHandler);
    map.value.on("mouseup", mouseUpHandler);
    map.value.on("mousemove", mouseMoveHandler);
    emit("draw:drawstart", { layerType: "circle" });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("mousedown", mouseDownHandler);
    map.value.off("mouseup", mouseUpHandler);
    map.value.off("mousemove", mouseMoveHandler);
    cleanup();

    if (map.value.dragging) {
      map.value.dragging.enable();
    }

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

      const event: FeatureDrawEvent = {
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

    if (map.value.doubleClickZoom) {
      map.value.doubleClickZoom.disable();
    }

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

    if (map.value.doubleClickZoom) {
      map.value.doubleClickZoom.enable();
    }

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

    const event: FeatureDrawEvent = {
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

      const event: FeatureDrawEvent = {
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

    if (map.value.doubleClickZoom) {
      map.value.doubleClickZoom.disable();
    }

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

    if (map.value.doubleClickZoom) {
      map.value.doubleClickZoom.enable();
    }

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
  let isDrawing = false;

  const mouseDownHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || isDrawing) return;

    isDrawing = true;
    startLatLng = e.latlng;
    const bounds = L.value.latLngBounds(startLatLng, startLatLng);
    tempRectangle = L.value.rectangle(bounds, {
      ...props.shapeOptions,
      dashArray: "5, 5",
    });
    tempRectangle.addTo(map.value);

    if (map.value.dragging) {
      map.value.dragging.disable();
    }
  };

  const mouseUpHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || !isDrawing || !startLatLng)
      return;

    const bounds = L.value.latLngBounds(startLatLng, e.latlng);

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    if (
      Math.abs(sw.lat - ne.lat) > 0.00001 ||
      Math.abs(sw.lng - ne.lng) > 0.00001
    ) {
      const rectangle = L.value.rectangle(bounds, props.shapeOptions);

      const event: FeatureDrawEvent = {
        layer: rectangle,
        layerType: "rectangle",
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
    if (!enabled || !isDrawing || !startLatLng || !tempRectangle || !L.value)
      return;
    const bounds = L.value.latLngBounds(startLatLng, e.latlng);
    tempRectangle.setBounds(bounds);
  };

  const cleanup = () => {
    if (tempRectangle) {
      tempRectangle.remove();
      tempRectangle = null;
    }
    startLatLng = null;
    isDrawing = false;

    if (map.value && map.value.dragging) {
      map.value.dragging.enable();
    }
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = "crosshair";
    map.value.on("mousedown", mouseDownHandler);
    map.value.on("mouseup", mouseUpHandler);
    map.value.on("mousemove", mouseMoveHandler);
    emit("draw:drawstart", { layerType: "rectangle" });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = "";
    map.value.off("mousedown", mouseDownHandler);
    map.value.off("mouseup", mouseUpHandler);
    map.value.off("mousemove", mouseMoveHandler);
    cleanup();

    if (map.value.dragging) {
      map.value.dragging.enable();
    }

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

    if (newMode === "select" || newMode === "direct-select") {
      emit("edit-mode-changed", newMode);
      return;
    }

    if (oldMode === "select" || oldMode === "direct-select") {
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

<template>
  <slot />
</template>
```

```vue [src/components/ui/leaflet-map/LeafletFeaturesSelector.vue]
<script setup lang="ts">
import { ref, computed, provide, watch, nextTick, type Ref } from "vue";
import LeafletBoundingBox from "./LeafletBoundingBox.vue";
import type { FeatureShapeType } from "./LeafletFeaturesEditor.vue";
import { LeafletSelectionKey } from ".";

export type FeatureSelectMode = "select" | "direct-select";

export interface SelectedFeature {
  type: FeatureShapeType;
  id: string | number;
}

export interface FeatureReference {
  id: string | number;
  type: FeatureShapeType;
  getBounds: () => L.LatLngBounds | null;
  getInitialData?: () => any;
  applyTransform: (bounds: L.LatLngBounds) => void;
  applyRotation?: (
    angle: number,
    center: { lat: number; lng: number },
    initialData: any,
  ) => void;
}

export interface LeafletSelectionContext {
  selectedFeature: Ref<SelectedFeature | null>;
  featuresRegistry: Ref<Map<string | number, FeatureReference>>;
  selectFeature: (type: FeatureShapeType, id: string | number) => void;
  deselectAll: () => void;
  registerFeature: (feature: FeatureReference) => void;
  unregisterFeature: (id: string | number) => void;
  notifyFeatureUpdate: (id: string | number) => void;
}

export interface LeafletFeaturesSelectorProps {
  enabled?: boolean;
  mode?: "select" | "direct-select" | null;
}

const props = withDefaults(defineProps<LeafletFeaturesSelectorProps>(), {
  enabled: false,
  mode: null,
});

const emit = defineEmits<{
  "update:selectedFeature": [feature: SelectedFeature | null];
  "selection-changed": [feature: SelectedFeature | null];
}>();

const selectedFeature = ref<SelectedFeature | null>(null);
const featuresRegistry = ref<Map<string | number, FeatureReference>>(new Map());
const boundingBoxTrigger = ref(0);

const rotationStartPositions = ref<any>(null);
const rotationCenter = ref<{ lat: number; lng: number } | null>(null);

const selectFeature = (type: FeatureShapeType, id: string | number) => {
  if (props.mode !== "select") {
    deselectAll();
    return;
  }

  rotationStartPositions.value = null;
  rotationCenter.value = null;

  const isSameFeature =
    selectedFeature.value?.type === type && selectedFeature.value?.id === id;

  if (!isSameFeature) {
    selectedFeature.value = { type, id };
    emit("update:selectedFeature", selectedFeature.value);
    emit("selection-changed", selectedFeature.value);

    nextTick(() => {
      boundingBoxTrigger.value++;
    });
  }
};

const deselectAll = () => {
  selectedFeature.value = null;
  rotationStartPositions.value = null;
  rotationCenter.value = null;
  emit("update:selectedFeature", null);
  emit("selection-changed", null);
};

const registerFeature = (feature: FeatureReference) => {
  featuresRegistry.value.set(feature.id, feature);
};

const unregisterFeature = (id: string | number) => {
  featuresRegistry.value.delete(id);
  if (selectedFeature.value?.id === id) {
    deselectAll();
  }
};

const notifyFeatureUpdate = (id: string | number) => {
  if (selectedFeature.value?.id === id) {
    boundingBoxTrigger.value++;
  }
};

watch(
  () => props.mode,
  (mode) => {
    if (mode !== "select") {
      deselectAll();
    }
  },
);

watch(
  () => props.enabled,
  (enabled) => {
    if (!enabled) {
      deselectAll();
    }
  },
);

const boundingBox = computed(() => {
  boundingBoxTrigger.value;

  if (!selectedFeature.value || !props.enabled || props.mode !== "select") {
    return null;
  }

  if (selectedFeature.value.type === "marker") {
    return null;
  }

  const feature = featuresRegistry.value.get(selectedFeature.value.id);
  if (!feature) return null;

  return feature.getBounds();
});

const showRotateHandle = computed(() => {
  if (!selectedFeature.value) return false;

  return (
    selectedFeature.value.type === "polyline" ||
    selectedFeature.value.type === "polygon"
  );
});

const constrainSquare = computed(() => {
  if (!selectedFeature.value) return false;

  return selectedFeature.value.type === "circle";
});

const saveRotationStartPositions = () => {
  if (!selectedFeature.value) return;

  const bounds = boundingBox.value;
  if (bounds) {
    const center = bounds.getCenter();
    rotationCenter.value = { lat: center.lat, lng: center.lng };
  }

  const feature = featuresRegistry.value.get(selectedFeature.value.id);
  if (feature && feature.getInitialData) {
    rotationStartPositions.value = feature.getInitialData();
  }
};

const handleBoundingBoxUpdate = (newBounds: L.LatLngBounds) => {
  if (!selectedFeature.value) return;

  const feature = featuresRegistry.value.get(selectedFeature.value.id);
  if (feature) {
    feature.applyTransform(newBounds);
  }
};

const handleBoundingBoxRotate = (angle: number) => {
  if (!selectedFeature.value) return;

  if (rotationStartPositions.value === null) {
    saveRotationStartPositions();
  }

  if (!rotationCenter.value || !rotationStartPositions.value) return;

  const feature = featuresRegistry.value.get(selectedFeature.value.id);
  if (feature && feature.applyRotation) {
    feature.applyRotation(
      angle,
      rotationCenter.value,
      rotationStartPositions.value,
    );
  }
};

const handleBoundingBoxRotateEnd = () => {
  rotationStartPositions.value = null;
  rotationCenter.value = null;
};

const context: LeafletSelectionContext = {
  selectedFeature,
  featuresRegistry,
  selectFeature,
  deselectAll,
  registerFeature,
  unregisterFeature,
  notifyFeatureUpdate,
};

provide(LeafletSelectionKey, context);
</script>

<template>
  <slot :selection="context" />

  <slot
    name="bounding-box"
    :bounds="boundingBox"
    :visible="boundingBox !== null && mode === 'select'"
    :show-rotate-handle="showRotateHandle"
    :constrain-square="constrainSquare"
    :on-update="handleBoundingBoxUpdate"
    :on-rotate="handleBoundingBoxRotate"
    :on-rotate-end="handleBoundingBoxRotateEnd"
  >
    <LeafletBoundingBox
      :bounds="boundingBox"
      :visible="boundingBox !== null && mode === 'select'"
      :show-rotate-handle="showRotateHandle"
      :constrain-square="constrainSquare"
      @update:bounds="handleBoundingBoxUpdate"
      @rotate="handleBoundingBoxRotate"
      @rotate-end="handleBoundingBoxRotateEnd"
    >
      <slot name="bounding-box-styles" />
    </LeafletBoundingBox>
  </slot>
</template>
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
import { LeafletMapKey, LeafletModuleKey, LeafletSelectionKey } from ".";
import type { FeatureReference } from "./LeafletFeaturesSelector.vue";

export interface LeafletMarkerProps {
  id?: string | number;
  lat?: number | string;
  lng?: number | string;
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
}

const props = withDefaults(defineProps<LeafletMarkerProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  editable: false,
  draggable: false,
  selectable: false,
});

const emit = defineEmits<{
  "update:lat": [lat: number];
  "update:lng": [lng: number];
  click: [];
  dragstart: [];
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const marker = ref<L.Marker | null>(null);
const markerId = ref<string | number>(
  props.id ?? `marker-${Date.now()}-${Math.random()}`,
);

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

const registerWithSelection = () => {
  if (!props.selectable || !selectionContext || !marker.value) return;

  const featureRef: FeatureReference = {
    id: markerId.value,
    type: "marker",
    getBounds: () => {
      if (!marker.value || !L.value) return null;
      const latlng = marker.value.getLatLng();
      const offset = 0.0001;
      return L.value.latLngBounds(
        [latlng.lat - offset, latlng.lng - offset],
        [latlng.lat + offset, latlng.lng + offset],
      );
    },
    applyTransform: (bounds: L.LatLngBounds) => {
      if (!marker.value) return;
      const center = bounds.getCenter();
      marker.value.setLatLng(center);
      emit("update:lat", center.lat);
      emit("update:lng", center.lng);
    },
  };

  selectionContext.registerFeature(featureRef);
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
      marker.value.on("drag", onDrag);
      marker.value.on("dragstart", () => emit("dragstart"));
      marker.value.on("dragend", onDragEnd);
    }

    if (props.selectable && selectionContext) {
      marker.value.on("click", () => {
        selectionContext.selectFeature("marker", markerId.value);
        emit("click");
      });

      marker.value.on("dragstart", () => {
        selectionContext.selectFeature("marker", markerId.value);
        emit("dragstart");
      });
    } else {
      marker.value.on("click", () => emit("click"));
    }

    marker.value.addTo(map.value);

    if (props.selectable && selectionContext) {
      registerWithSelection();
    }
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

const onDrag = () => {
  if (marker.value) {
    const latlng = marker.value.getLatLng();
    emit("update:lat", latlng.lat);
    emit("update:lng", latlng.lng);

    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(markerId.value);
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
  () => [
    props.lat,
    props.lng,
    props.editable,
    props.draggable,
    props.selectable,
  ],
  ([newLat, newLng], oldVal) => {
    nextTick(() => {
      if (!L.value) return;

      if (map.value && !isNaN(Number(newLat)) && !isNaN(Number(newLng))) {
        if (marker.value) {
          const latChanged = oldVal && Number(oldVal[0]) !== Number(newLat);
          const lngChanged = oldVal && Number(oldVal[1]) !== Number(newLng);
          updateMarker(latChanged, lngChanged);

          const selectableChanged =
            oldVal && Boolean(oldVal[4]) !== Boolean(props.selectable);
          if (selectableChanged) {
            marker.value.off("click");
            marker.value.off("dragstart");

            if (props.selectable && selectionContext) {
              marker.value.on("click", () => {
                selectionContext.selectFeature("marker", markerId.value);
                emit("click");
              });
              marker.value.on("dragstart", () => {
                selectionContext.selectFeature("marker", markerId.value);
                emit("dragstart");
              });
              registerWithSelection();
            } else {
              marker.value.on("click", () => emit("click"));
              if (selectionContext) {
                selectionContext.unregisterFeature(markerId.value);
              }
            }
          }
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
  if (props.selectable && selectionContext) {
    selectionContext.unregisterFeature(markerId.value);
  }

  if (marker.value) {
    marker.value.remove();
  }
});
</script>

<template><slot /></template>
```

```vue [src/components/ui/leaflet-map/LeafletMeasureTool.vue]
<script setup lang="ts">
import { ref, inject, watch, onBeforeUnmount, nextTick, type Ref } from "vue";
import { LeafletMapKey, LeafletModuleKey } from ".";
import type { LatLng, Polyline, Marker, Circle, DivIcon } from "leaflet";
import { useLeaflet } from "../../composables/use-leaflet/useLeaflet";

const {
  calculateLineDistance,
  calculatePolygonArea,
  calculateCentroid,
  formatDistance: formatDistanceUtil,
  formatArea: formatAreaUtil,
} = await useLeaflet();

export interface LeafletMeasureToolProps {
  enabled?: boolean;
  unit?: "metric" | "imperial";
  showArea?: boolean;
  showPerimeter?: boolean;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
}

const props = withDefaults(defineProps<LeafletMeasureToolProps>(), {
  enabled: false,
  unit: "metric",
  showArea: true,
  showPerimeter: true,
  color: "#ff6600",
  fillColor: "#ff6600",
  fillOpacity: 0.2,
});

const emit = defineEmits<{
  "measurement-start": [];
  "measurement-update": [{ distance: number; area?: number }];
  "measurement-complete": [
    { distance: number; area?: number; points: LatLng[] },
  ];
  "measurement-cancel": [];
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const measurementPoints = ref<LatLng[]>([]);
const polyline = ref<Polyline | null>(null);
const markers = ref<Marker[]>([]);
const measurementLabels = ref<Marker[]>([]);
const tempLine = ref<Polyline | null>(null);
const snapCircle = ref<Circle | null>(null);

let isActive = false;

const calculateDistance = (latlngs: LatLng[]): number => {
  return calculateLineDistance(latlngs, props.unit);
};

const calculateArea = (latlngs: LatLng[]): number | undefined => {
  if (!props.showArea) return undefined;
  return calculatePolygonArea(latlngs, props.unit);
};

const formatDistance = (distanceInMeters: number): string => {
  return formatDistanceUtil(distanceInMeters, props.unit);
};

const formatArea = (areaInM2: number): string => {
  return formatAreaUtil(areaInM2, props.unit);
};

const createMeasureMarker = (latlng: LatLng, index: number): Marker | null => {
  if (!L.value || !map.value) return null;

  return L.value
    .marker(latlng, {
      icon: L.value.divIcon({
        className: "leaflet-measure-marker",
        html: `<div style="
        width: 10px;
        height: 10px;
        background: ${props.color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      "></div>`,
        iconSize: [10, 10],
      }),
    })
    .addTo(map.value);
};

const createDistanceLabel = (latlng: LatLng, text: string): Marker | null => {
  if (!L.value || !map.value) return null;

  return L.value
    .marker(latlng, {
      icon: L.value.divIcon({
        className: "leaflet-measure-label",
        html: `<div style="
        background: white;
        padding: 4px 8px;
        border-radius: 4px;
        border: 2px solid ${props.color};
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">${text}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, -10],
      }) as DivIcon,
    })
    .addTo(map.value);
};

const handleMapClick = (e: L.LeafletMouseEvent) => {
  if (!isActive || !L.value || !map.value) return;

  const latlng = e.latlng;
  measurementPoints.value.push(latlng);

  const marker = createMeasureMarker(
    latlng,
    measurementPoints.value.length - 1,
  );
  if (marker) markers.value.push(marker);

  if (!polyline.value) {
    polyline.value = L.value
      .polyline([latlng], {
        color: props.color,
        weight: 3,
        dashArray: "10, 5",
      })
      .addTo(map.value);
  } else {
    polyline.value.addLatLng(latlng);
  }

  if (measurementPoints.value.length >= 2) {
    const distance = calculateDistance(measurementPoints.value);
    const prevPoint =
      measurementPoints.value[measurementPoints.value.length - 2];
    if (!prevPoint) return;
    const midpoint = L.value.latLng(
      (latlng.lat + prevPoint.lat) / 2,
      (latlng.lng + prevPoint.lng) / 2,
    );

    const label = createDistanceLabel(midpoint, formatDistance(distance));
    if (label) measurementLabels.value.push(label);

    const area = calculateArea(measurementPoints.value);
    emit("measurement-update", { distance, area });
  }

  if (measurementPoints.value.length === 1) {
    emit("measurement-start");
  }
};

const handleMouseMove = (e: L.LeafletMouseEvent) => {
  if (
    !isActive ||
    measurementPoints.value.length === 0 ||
    !L.value ||
    !map.value
  )
    return;

  const latlng = e.latlng;
  const points = [...measurementPoints.value, latlng];

  if (!tempLine.value) {
    tempLine.value = L.value
      .polyline(points, {
        color: props.color,
        weight: 2,
        dashArray: "5, 5",
        opacity: 0.5,
      })
      .addTo(map.value);
  } else {
    tempLine.value.setLatLngs(points);
  }

  if (measurementPoints.value.length >= 3) {
    const firstPoint = measurementPoints.value[0];
    if (!firstPoint) return;
    const distance = firstPoint.distanceTo(latlng);

    if (distance < 50000) {
      if (!snapCircle.value) {
        snapCircle.value = L.value
          .circle(firstPoint, {
            radius: 50,
            color: props.color,
            fillColor: props.fillColor,
            fillOpacity: 0.3,
            weight: 2,
          })
          .addTo(map.value);
      }
    } else if (snapCircle.value) {
      snapCircle.value.remove();
      snapCircle.value = null;
    }
  }
};

const handleDoubleClick = (e: L.LeafletMouseEvent) => {
  if (!isActive || measurementPoints.value.length < 2) return;

  L.value!.DomEvent.stop(e.originalEvent);
  finishMeasurement();
};

const handleContextMenu = (e: L.LeafletMouseEvent) => {
  if (!isActive || measurementPoints.value.length < 2) return;

  L.value!.DomEvent.stop(e.originalEvent);
  finishMeasurement();
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!isActive) return;

  if (e.key === "Escape") {
    emit("measurement-cancel");
    cleanup();
  } else if (e.key === "Enter" && measurementPoints.value.length >= 2) {
    finishMeasurement();
  }
};

const finishMeasurement = () => {
  const distance = calculateDistance(measurementPoints.value);
  const area = calculateArea(measurementPoints.value);

  if (area !== undefined && measurementPoints.value.length >= 3) {
    const center = calculateCentroid(measurementPoints.value);
    if (center) {
      const [lng, lat] = center;
      const totalLabel = createDistanceLabel(
        L.value!.latLng(lat, lng),
        `${formatDistance(distance)} | ${formatArea(area)}`,
      );
      if (totalLabel) measurementLabels.value.push(totalLabel);
    }
  }

  emit("measurement-complete", {
    distance,
    area,
    points: [...measurementPoints.value],
  });

  cleanup();

  if (props.enabled) {
    nextTick(() => {
      isActive = true;
    });
  }
};

const cleanup = () => {
  polyline.value?.remove();
  polyline.value = null;

  tempLine.value?.remove();
  tempLine.value = null;

  snapCircle.value?.remove();
  snapCircle.value = null;

  markers.value.forEach((m) => m.remove());
  markers.value = [];

  measurementLabels.value.forEach((l) => l.remove());
  measurementLabels.value = [];

  measurementPoints.value = [];
};

const enable = () => {
  if (!map.value) return;

  isActive = true;
  map.value.getContainer().style.cursor = "crosshair";

  if (map.value.dragging) {
    map.value.dragging.disable();
  }

  if (map.value.doubleClickZoom) {
    map.value.doubleClickZoom.disable();
  }

  map.value.on("click", handleMapClick);
  map.value.on("mousemove", handleMouseMove);
  map.value.on("dblclick", handleDoubleClick);
  map.value.on("contextmenu", handleContextMenu);
  document.addEventListener("keydown", handleKeyDown);
};

const disable = () => {
  if (!map.value) return;

  isActive = false;
  map.value.getContainer().style.cursor = "";

  map.value.off("click", handleMapClick);
  map.value.off("mousemove", handleMouseMove);
  map.value.off("dblclick", handleDoubleClick);
  map.value.off("contextmenu", handleContextMenu);
  document.removeEventListener("keydown", handleKeyDown);

  if (map.value.dragging) {
    map.value.dragging.enable();
  }

  if (map.value.doubleClickZoom) {
    map.value.doubleClickZoom.enable();
  }

  cleanup();
};

watch(
  () => props.enabled,
  (enabled) => {
    if (enabled) {
      enable();
    } else {
      disable();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  disable();
});

defineExpose({
  finishMeasurement,
  cleanup,
});
</script>

<template>
  <slot />
</template>
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
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletMapKey, LeafletModuleKey, LeafletSelectionKey } from ".";
import type { FeatureReference } from "./LeafletFeaturesSelector.vue";
import "./leaflet-editing.css";

export interface LeafletPolygonProps {
  id?: string | number;
  latlngs?: Array<[number, number]> | Array<{ lat: number; lng: number }>;
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  interactive?: boolean;
  autoClose?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletPolygonProps>(), {
  latlngs: () => [],
  editable: false,
  draggable: false,
  selectable: false,
  interactive: true,
  autoClose: true,
});

const emit = defineEmits<{
  "update:latlngs": [latlngs: Array<[number, number]>];
  closed: [];
  click: [];
  dragstart: [];
}>();

const { getLeafletShapeColors } = useCssParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const polygon = ref<L.Polygon | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const midpointMarkers = ref<L.Marker[]>([]);
const firstPointMarker = ref<L.Marker | null>(null);
const isDragging = ref(false);
const polygonId = ref<string | number>(
  props.id ?? `polygon-${Date.now()}-${Math.random()}`,
);

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

    emit("dragstart");

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

    const updatedLatLngs = newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<
      [number, number]
    >;
    emit("update:latlngs", updatedLatLngs);

    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(polygonId.value);
    }
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

const registerWithSelection = () => {
  if (!props.selectable || !selectionContext || !polygon.value) return;

  const featureRef: FeatureReference = {
    id: polygonId.value,
    type: "polygon",
    getBounds: () => {
      if (!polygon.value) return null;
      return polygon.value.getBounds();
    },
    getInitialData: () => {
      if (!polygon.value) return null;
      const latlngs = polygon.value.getLatLngs()[0] as L.LatLng[];
      return latlngs.map((ll) => [ll.lat, ll.lng] as [number, number]);
    },
    applyTransform: (bounds: L.LatLngBounds) => {
      if (!polygon.value || !L.value) return;

      const currentBounds = polygon.value.getBounds();
      const currentCenter = currentBounds.getCenter();
      const newCenter = bounds.getCenter();

      const currentLatLngs = polygon.value.getLatLngs()[0] as L.LatLng[];
      const scaleX =
        (bounds.getEast() - bounds.getWest()) /
        (currentBounds.getEast() - currentBounds.getWest());
      const scaleY =
        (bounds.getNorth() - bounds.getSouth()) /
        (currentBounds.getNorth() - currentBounds.getSouth());

      const newLatLngs = currentLatLngs.map((latlng) => {
        const relativeX = (latlng.lng - currentCenter.lng) * scaleX;
        const relativeY = (latlng.lat - currentCenter.lat) * scaleY;
        return L.value!.latLng(
          newCenter.lat + relativeY,
          newCenter.lng + relativeX,
        );
      });

      polygon.value.setLatLngs([newLatLngs]);
      emit(
        "update:latlngs",
        newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<[number, number]>,
      );
    },
    applyRotation: (
      angle: number,
      center: { lat: number; lng: number },
      initialLatLngs: Array<[number, number]>,
    ) => {
      if (!polygon.value || !L.value || !initialLatLngs) return;

      const angleRad = (-angle * Math.PI) / 180;

      const metersPerDegreeLat = 111320;
      const metersPerDegreeLng =
        111320 * Math.cos((center.lat * Math.PI) / 180);

      const newLatLngs = initialLatLngs.map((latlng) => {
        const lat = latlng[0];
        const lng = latlng[1];

        const relMetersY = (lat - center.lat) * metersPerDegreeLat;
        const relMetersX = (lng - center.lng) * metersPerDegreeLng;

        const newRelMetersY =
          relMetersY * Math.cos(angleRad) - relMetersX * Math.sin(angleRad);
        const newRelMetersX =
          relMetersY * Math.sin(angleRad) + relMetersX * Math.cos(angleRad);

        return L.value!.latLng(
          center.lat + newRelMetersY / metersPerDegreeLat,
          center.lng + newRelMetersX / metersPerDegreeLng,
        );
      });

      polygon.value.setLatLngs([newLatLngs]);
      emit(
        "update:latlngs",
        newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<[number, number]>,
      );
    },
  };

  selectionContext.registerFeature(featureRef);
};

watch(
  () => [
    map.value,
    props.latlngs,
    props.editable,
    props.draggable,
    props.interactive,
    props.selectable,
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

          if (props.selectable && selectionContext) {
            polygon.value.on("click", () => {
              selectionContext.selectFeature("polygon", polygonId.value);
              emit("click");
            });
            polygon.value.on("mousedown", (e: any) => {
              if (props.draggable) {
                selectionContext.selectFeature("polygon", polygonId.value);
              }
            });
          } else {
            polygon.value.on("click", () => {
              emit("click");
            });
          }

          if (props.selectable && selectionContext) {
            registerWithSelection();
          }
        }

        if (polygon.value) {
          const selectableChanged =
            oldVal && Boolean(oldVal[5]) !== Boolean(newVal[5]);
          if (selectableChanged) {
            polygon.value.off("click");
            polygon.value.off("mousedown");

            if (props.selectable && selectionContext) {
              polygon.value.on("click", () => {
                selectionContext.selectFeature("polygon", polygonId.value);
                emit("click");
              });
              polygon.value.on("mousedown", (e: any) => {
                if (props.draggable) {
                  selectionContext.selectFeature("polygon", polygonId.value);
                }
              });
              registerWithSelection();
            } else {
              polygon.value.on("click", () => {
                emit("click");
              });
              if (selectionContext) {
                selectionContext.unregisterFeature(polygonId.value);
              }
            }
          }
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
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletMapKey, LeafletModuleKey, LeafletSelectionKey } from ".";
import type { FeatureReference } from "./LeafletFeaturesSelector.vue";
import "./leaflet-editing.css";

export interface LeafletPolylineProps {
  id?: string | number;
  latlngs?: Array<[number, number]> | Array<{ lat: number; lng: number }>;
  weight?: number;
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletPolylineProps>(), {
  latlngs: () => [],
  weight: 3,
  editable: false,
  draggable: false,
  selectable: false,
});

const emit = defineEmits<{
  "update:latlngs": [latlngs: Array<[number, number]>];
  click: [];
  dragstart: [];
}>();

const { getLeafletLineColors } = useCssParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const polyline = ref<L.Polyline | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const midpointMarkers = ref<L.Marker[]>([]);
const isDragging = ref(false);
const polylineId = ref<string | number>(
  props.id ?? `polyline-${Date.now()}-${Math.random()}`,
);

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

    emit("dragstart");

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

    const updatedLatLngs = newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<
      [number, number]
    >;
    emit("update:latlngs", updatedLatLngs);

    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(polylineId.value);
    }
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

const registerWithSelection = () => {
  if (!props.selectable || !selectionContext || !polyline.value) return;

  const featureRef: FeatureReference = {
    id: polylineId.value,
    type: "polyline",
    getBounds: () => {
      if (!polyline.value) return null;
      return polyline.value.getBounds();
    },
    getInitialData: () => {
      if (!polyline.value) return null;
      const latlngs = polyline.value.getLatLngs() as L.LatLng[];
      return latlngs.map((ll) => [ll.lat, ll.lng] as [number, number]);
    },
    applyTransform: (bounds: L.LatLngBounds) => {
      if (!polyline.value || !L.value) return;

      const currentBounds = polyline.value.getBounds();
      const currentCenter = currentBounds.getCenter();
      const newCenter = bounds.getCenter();

      const currentLatLngs = polyline.value.getLatLngs() as L.LatLng[];
      const scaleX =
        (bounds.getEast() - bounds.getWest()) /
        (currentBounds.getEast() - currentBounds.getWest());
      const scaleY =
        (bounds.getNorth() - bounds.getSouth()) /
        (currentBounds.getNorth() - currentBounds.getSouth());

      const newLatLngs = currentLatLngs.map((latlng) => {
        const relativeX = (latlng.lng - currentCenter.lng) * scaleX;
        const relativeY = (latlng.lat - currentCenter.lat) * scaleY;
        return L.value!.latLng(
          newCenter.lat + relativeY,
          newCenter.lng + relativeX,
        );
      });

      polyline.value.setLatLngs(newLatLngs);
      emit(
        "update:latlngs",
        newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<[number, number]>,
      );
    },
    applyRotation: (
      angle: number,
      center: { lat: number; lng: number },
      initialLatLngs: Array<[number, number]>,
    ) => {
      if (!polyline.value || !L.value || !initialLatLngs) return;

      const angleRad = (-angle * Math.PI) / 180;

      const metersPerDegreeLat = 111320;
      const metersPerDegreeLng =
        111320 * Math.cos((center.lat * Math.PI) / 180);

      const newLatLngs = initialLatLngs.map((latlng) => {
        const lat = latlng[0];
        const lng = latlng[1];

        const relMetersY = (lat - center.lat) * metersPerDegreeLat;
        const relMetersX = (lng - center.lng) * metersPerDegreeLng;

        const newRelMetersY =
          relMetersY * Math.cos(angleRad) - relMetersX * Math.sin(angleRad);
        const newRelMetersX =
          relMetersY * Math.sin(angleRad) + relMetersX * Math.cos(angleRad);

        return L.value!.latLng(
          center.lat + newRelMetersY / metersPerDegreeLat,
          center.lng + newRelMetersX / metersPerDegreeLng,
        );
      });

      polyline.value.setLatLngs(newLatLngs);
      emit(
        "update:latlngs",
        newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<[number, number]>,
      );
    },
  };

  selectionContext.registerFeature(featureRef);
};

watch(
  () => [
    map.value,
    props.latlngs,
    props.weight,
    props.editable,
    props.draggable,
    props.selectable,
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

          if (props.selectable && selectionContext) {
            polyline.value.on("click", () => {
              selectionContext.selectFeature("polyline", polylineId.value);
              emit("click");
            });
            polyline.value.on("mousedown", (e: any) => {
              if (props.draggable) {
                selectionContext.selectFeature("polyline", polylineId.value);
              }
            });
          } else {
            polyline.value.on("click", () => {
              emit("click");
            });
          }

          if (props.selectable && selectionContext) {
            registerWithSelection();
          }
        }

        if (polyline.value) {
          const selectableChanged =
            oldVal && Boolean(oldVal[5]) !== Boolean(newVal[5]);
          if (selectableChanged) {
            polyline.value.off("click");
            polyline.value.off("mousedown");

            if (props.selectable && selectionContext) {
              polyline.value.on("click", () => {
                selectionContext.selectFeature("polyline", polylineId.value);
                emit("click");
              });
              polyline.value.on("mousedown", (e: any) => {
                if (props.draggable) {
                  selectionContext.selectFeature("polyline", polylineId.value);
                }
              });
              registerWithSelection();
            } else {
              polyline.value.on("click", () => {
                emit("click");
              });
              if (selectionContext) {
                selectionContext.unregisterFeature(polylineId.value);
              }
            }
          }
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
  if (props.selectable && selectionContext) {
    selectionContext.unregisterFeature(polylineId.value);
  }

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
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletMapKey, LeafletModuleKey, LeafletSelectionKey } from ".";
import type { FeatureReference } from "./LeafletFeaturesSelector.vue";
import "./leaflet-editing.css";

export interface LeafletRectangleProps {
  id?: string | number;
  bounds?: [[number, number], [number, number]];
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletRectangleProps>(), {
  bounds: () => [
    [0, 0],
    [0, 0],
  ],
  editable: false,
  draggable: false,
  selectable: false,
});

const emit = defineEmits<{
  "update:bounds": [bounds: [[number, number], [number, number]]];
  click: [];
  dragstart: [];
}>();

const { getLeafletShapeColors } = useCssParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const rectangle = ref<L.Rectangle | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const isDragging = ref(false);
const rectangleId = ref<string | number>(
  props.id ?? `rectangle-${Date.now()}-${Math.random()}`,
);

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

    emit("dragstart");

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

    emit("update:bounds", [
      [newBounds.getSouth(), newBounds.getWest()],
      [newBounds.getNorth(), newBounds.getEast()],
    ]);

    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(rectangleId.value);
    }
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

const registerWithSelection = () => {
  if (!props.selectable || !selectionContext || !rectangle.value) return;

  const featureRef: FeatureReference = {
    id: rectangleId.value,
    type: "rectangle",
    getBounds: () => {
      if (!rectangle.value) return null;
      return rectangle.value.getBounds();
    },
    applyTransform: (bounds: L.LatLngBounds) => {
      if (!rectangle.value) return;

      rectangle.value.setBounds(bounds);
      emit("update:bounds", [
        [bounds.getSouth(), bounds.getWest()],
        [bounds.getNorth(), bounds.getEast()],
      ] as [[number, number], [number, number]]);
    },
  };

  selectionContext.registerFeature(featureRef);
};

watch(
  () => [
    map.value,
    props.bounds,
    props.editable,
    props.draggable,
    props.selectable,
  ],
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

          if (props.selectable && selectionContext) {
            rectangle.value.on("click", () => {
              selectionContext.selectFeature("rectangle", rectangleId.value);
              emit("click");
            });
            rectangle.value.on("mousedown", (e: any) => {
              if (props.draggable) {
                selectionContext.selectFeature("rectangle", rectangleId.value);
              }
            });
          } else {
            rectangle.value.on("click", () => {
              emit("click");
            });
          }

          if (props.selectable && selectionContext) {
            registerWithSelection();
          }
        }

        if (rectangle.value) {
          const selectableChanged =
            oldVal && Boolean(oldVal[4]) !== Boolean(newVal[4]);
          if (selectableChanged) {
            rectangle.value.off("click");
            rectangle.value.off("mousedown");

            if (props.selectable && selectionContext) {
              rectangle.value.on("click", () => {
                selectionContext.selectFeature("rectangle", rectangleId.value);
                emit("click");
              });
              rectangle.value.on("mousedown", (e: any) => {
                if (props.draggable) {
                  selectionContext.selectFeature(
                    "rectangle",
                    rectangleId.value,
                  );
                }
              });
              registerWithSelection();
            } else {
              rectangle.value.on("click", () => {
                emit("click");
              });
              if (selectionContext) {
                selectionContext.unregisterFeature(rectangleId.value);
              }
            }
          }
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
  if (props.selectable && selectionContext) {
    selectionContext.unregisterFeature(rectangleId.value);
  }

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

```vue [src/components/ui/leaflet-map/LeafletVirtualize.vue]
<script setup lang="ts">
import {
  ref,
  inject,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
  type Ref,
} from "vue";
import { LeafletMapKey, LeafletModuleKey } from ".";
import type Leaflet from "leaflet";
import type {
  UseQuadtreeReturn,
  Rect,
} from "~~/registry/new-york/composables/use-quadtree/useQuadtree";
import { useLeaflet } from "../../composables/use-leaflet/useLeaflet";

const { radiusToLatDegrees, radiusToLngDegrees } = await useLeaflet();

export interface LeafletVirtualizeProps {
  quadtree: UseQuadtreeReturn<any>;

  enabled?: boolean;

  marginMeters?: number;

  marginZoomRatio?: number;

  alwaysVisible?: Array<string | number>;

  minZoom?: number;

  maxZoom?: number;

  transitionDelay?: number;
}

const props = withDefaults(defineProps<LeafletVirtualizeProps>(), {
  enabled: true,
  marginMeters: undefined,
  marginZoomRatio: 1.0,
  alwaysVisible: () => [],
  minZoom: undefined,
  maxZoom: undefined,
  transitionDelay: 50,
});

const emit = defineEmits<{
  "update:visible-count": [count: number];
  "bounds-changed": [bounds: Leaflet.LatLngBounds];
  "transition-start": [];
  "transition-end": [];
}>();

const L = inject(LeafletModuleKey, ref<typeof Leaflet | undefined>(undefined));
const map = inject<Ref<Leaflet.Map | null>>(LeafletMapKey, ref(null));

const visibleBounds = ref<Leaflet.LatLngBounds | null>(null);
const visibleFeatureIds = ref<Set<string | number>>(new Set());
const isTransitioning = ref(false);
let updateScheduled = false;

const calculateDynamicMargin = (zoom: number): number => {
  const clampedZoom = Math.max(1, Math.min(20, zoom));

  const baseMargin = (20 - clampedZoom) * 100;

  return baseMargin * props.marginZoomRatio;
};

const updateVisibleBounds = () => {
  if (!map.value || !L.value) return;

  if (updateScheduled) return;
  updateScheduled = true;

  requestAnimationFrame(() => {
    updateScheduled = false;

    if (!map.value || !L.value) return;

    const bounds = map.value.getBounds();

    if (props.enabled) {
      const zoom = map.value.getZoom();
      const marginInMeters = props.marginMeters ?? calculateDynamicMargin(zoom);

      if (marginInMeters > 0) {
        const center = bounds.getCenter();
        const marginLat = radiusToLatDegrees(marginInMeters);
        const marginLng = radiusToLngDegrees(marginInMeters, center.lat);

        const extendedBounds = L.value.latLngBounds(
          L.value.latLng(
            bounds.getSouth() - marginLat,
            bounds.getWest() - marginLng,
          ),
          L.value.latLng(
            bounds.getNorth() + marginLat,
            bounds.getEast() + marginLng,
          ),
        );
        visibleBounds.value = extendedBounds;
      } else {
        visibleBounds.value = bounds;
      }
    } else {
      visibleBounds.value = bounds;
    }

    updateVisibleFeaturesQuadtree();

    emit("bounds-changed", visibleBounds.value);
  });
};

const updateVisibleFeaturesQuadtree = () => {
  if (!visibleBounds.value) {
    visibleFeatureIds.value.clear();
    emit("update:visible-count", 0);
    return;
  }

  if (map.value) {
    const currentZoom = map.value.getZoom();

    if (props.minZoom !== undefined && currentZoom < props.minZoom) {
      visibleFeatureIds.value.clear();
      emit("update:visible-count", 0);
      return;
    }

    if (props.maxZoom !== undefined && currentZoom > props.maxZoom) {
      visibleFeatureIds.value.clear();
      emit("update:visible-count", 0);
      return;
    }
  }

  if (!props.enabled) {
    const allItems = props.quadtree.retrieve({
      x: -180,
      y: -90,
      width: 360,
      height: 180,
    });
    const allIds = new Set<string | number>();
    for (const item of allItems) {
      allIds.add(item.id);
    }
    visibleFeatureIds.value = allIds;
    emit("update:visible-count", allIds.size);
    return;
  }

  const bounds = visibleBounds.value;

  const queryRect: Rect = {
    x: bounds.getWest(),
    y: bounds.getSouth(),
    width: bounds.getEast() - bounds.getWest(),
    height: bounds.getNorth() - bounds.getSouth(),
  };

  const visibleItems = props.quadtree.retrieve(queryRect);

  const newVisibleIds = new Set<string | number>();
  for (const item of visibleItems) {
    newVisibleIds.add(item.id);
  }

  for (const id of props.alwaysVisible) {
    newVisibleIds.add(id);
  }

  visibleFeatureIds.value = newVisibleIds;
  emit("update:visible-count", newVisibleIds.size);
};
onMounted(() => {
  if (map.value) {
    updateVisibleBounds();
    map.value.on("moveend", updateVisibleBounds);
    map.value.on("zoomend", updateVisibleBounds);
  }
});

watch(
  map,
  (newMap) => {
    if (newMap) {
      updateVisibleBounds();
      newMap.on("moveend", updateVisibleBounds);
      newMap.on("zoomend", updateVisibleBounds);
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  if (map.value) {
    map.value.off("moveend", updateVisibleBounds);
    map.value.off("zoomend", updateVisibleBounds);
  }
});

watch(
  () => props.enabled,
  async () => {
    isTransitioning.value = true;
    emit("transition-start");

    await new Promise((resolve) => setTimeout(resolve, props.transitionDelay));
    updateVisibleFeaturesQuadtree();

    await new Promise((resolve) => setTimeout(resolve, 200));

    isTransitioning.value = false;
    emit("transition-end");
  },
);

watch(
  () => props.marginMeters,
  () => {
    updateVisibleBounds();
  },
);

watch(
  () => props.marginZoomRatio,
  () => {
    updateVisibleBounds();
  },
);

watch(
  () => props.minZoom,
  () => {
    updateVisibleFeaturesQuadtree();
  },
);

watch(
  () => props.maxZoom,
  () => {
    updateVisibleFeaturesQuadtree();
  },
);

watch(
  () => props.quadtree,
  () => {
    if (map.value) {
      nextTick(() => {
        updateVisibleBounds();
      });
    }
  },
);

defineExpose({
  visibleBounds,
  visibleFeatureIds,
  isTransitioning,
});
</script>

<template>
  <slot
    :is-visible="(id: string | number) => visibleFeatureIds.has(id)"
    :visible-ids="visibleFeatureIds"
    :visible-count="visibleFeatureIds.size"
  />
</template>
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

export const useCssParser = () => {
  const withHiddenElement = (
    fn: (el: HTMLElement) => any,
    className: string,
  ) => {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.width = "0px";
    el.style.height = "0px";
    el.style.visibility = "hidden";
    el.className = className;
    el.style.overflow = "hidden";
    document.body.appendChild(el);
    const result = fn(el);
    document.body.removeChild(el);
    return result;
  };

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

      const cssValues = withHiddenElement(
        (el) =>
          getTailwindBaseCssValues(el, [
            "border-color",
            "color",
            "background-color",
            "opacity",
          ]),
        classList.join(" "),
      );

      return {
        color: cssValues["border-color"] || cssValues["color"] || "#3388ff",
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

      const cssValues = withHiddenElement(
        (el) =>
          getTailwindBaseCssValues(el, ["border-color", "color", "opacity"]),
        classList.join(" "),
      );

      return {
        color: cssValues["border-color"] || cssValues["color"] || "#3388ff",
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
    withHiddenElement,
    getTailwindBaseCssValues,
    getLeafletShapeColors,
    getLeafletLineColors,
    parseGradient,
  };
};
```

```ts [src/composables/use-leaflet/useLeaflet.ts]
import { ref, type Ref } from "vue";
import type Leaflet from "leaflet";
import area from "@turf/area";
import length from "@turf/length";
import distance from "@turf/distance";
import centroid from "@turf/centroid";
import type { Position } from "geojson";

type Leaflet = typeof Leaflet;
type LatLng = Leaflet.LatLng;

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

  const toGeoJSONCoords = (latlngs: LatLng[]): Position[] => {
    return latlngs.map((ll) => [ll.lng, ll.lat]);
  };

  const calculateLineDistance = (
    latlngs: LatLng[],
    unit: "metric" | "imperial" = "metric",
  ): number => {
    if (latlngs.length < 2) return 0;

    const coords = toGeoJSONCoords(latlngs);
    const line = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: coords,
      },
    };

    const distanceKm = length(line, { units: "kilometers" });
    const distanceMeters = distanceKm * 1000;

    return unit === "metric" ? distanceMeters : distanceMeters * 3.28084;
  };

  const calculatePolygonArea = (
    latlngs: LatLng[],
    unit: "metric" | "imperial" = "metric",
  ): number | undefined => {
    if (latlngs.length < 3) return undefined;

    const coords = toGeoJSONCoords(latlngs);
    const closedCoords = [...coords, coords[0]].filter(
      (c): c is Position => c !== undefined,
    );

    const polygon = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Polygon" as const,
        coordinates: [closedCoords],
      },
    };

    const areaM2 = area(polygon);
    return unit === "metric" ? areaM2 : areaM2 * 10.7639;
  };

  const calculateCentroid = (
    latlngs: LatLng[],
  ): [number, number] | undefined => {
    if (latlngs.length < 3) return undefined;

    const coords = toGeoJSONCoords(latlngs);
    const closedCoords = [...coords, coords[0]].filter(
      (c): c is Position => c !== undefined,
    );

    const polygon = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Polygon" as const,
        coordinates: [closedCoords],
      },
    };

    const center = centroid(polygon);
    return center.geometry.coordinates as [number, number];
  };

  const calculateDistance = (
    from: LatLng | [number, number],
    to: LatLng | [number, number],
    unit: "metric" | "imperial" = "metric",
  ): number => {
    const fromCoords = Array.isArray(from) ? from : [from.lng, from.lat];
    const toCoords = Array.isArray(to) ? to : [to.lng, to.lat];

    const distanceKm = distance(fromCoords, toCoords, { units: "kilometers" });
    const distanceMeters = distanceKm * 1000;

    return unit === "metric" ? distanceMeters : distanceMeters * 3.28084;
  };

  const formatDistance = (
    distanceInMeters: number,
    unit: "metric" | "imperial" = "metric",
  ): string => {
    if (unit === "metric") {
      return distanceInMeters > 1000
        ? `${(distanceInMeters / 1000).toFixed(2)} km`
        : `${distanceInMeters.toFixed(2)} m`;
    } else {
      const distanceFeet = distanceInMeters * 3.28084;
      return distanceFeet > 5280
        ? `${(distanceFeet / 5280).toFixed(2)} mi`
        : `${distanceFeet.toFixed(2)} ft`;
    }
  };

  const formatArea = (
    areaInM2: number,
    unit: "metric" | "imperial" = "metric",
  ): string => {
    if (unit === "metric") {
      return areaInM2 > 10000
        ? `${(areaInM2 / 1000000).toFixed(2)} km²`
        : `${areaInM2.toFixed(2)} m²`;
    } else {
      const areaFt2 = areaInM2 * 10.7639;
      return areaFt2 > 43560
        ? `${(areaFt2 / 43560).toFixed(2)} acres`
        : `${areaFt2.toFixed(2)} ft²`;
    }
  };

  return {
    L,
    LatDegreesMeters,

    radiusToLatDegrees,
    latDegreesToRadius,
    radiusToLngDegrees,
    lngDegreesToRadius,

    toGeoJSONCoords,
    calculateLineDistance,
    calculatePolygonArea,
    calculateCentroid,
    calculateDistance,
    formatDistance,
    formatArea,
  };
};
```

```ts [src/components/ui/use-quadtree/useQuadtree.ts]
import { ref, readonly, type Ref } from "vue";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: any;
}

export interface QuadtreeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuadtreeConfig {
  bounds: QuadtreeBounds;

  maxObjects?: number;

  maxLevels?: number;
}

class QuadtreeNode<T extends Rect = Rect> {
  private maxObjects: number;
  private maxLevels: number;
  private level: number;
  private bounds: QuadtreeBounds;
  private objects: T[] = [];
  private nodes: QuadtreeNode<T>[] = [];

  constructor(
    bounds: QuadtreeBounds,
    maxObjects = 10,
    maxLevels = 4,
    level = 0,
  ) {
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;
    this.bounds = bounds;
  }

  private split(): void {
    const nextLevel = this.level + 1;
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    this.nodes[0] = new QuadtreeNode<T>(
      { x: x + subWidth, y, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel,
    );

    this.nodes[1] = new QuadtreeNode<T>(
      { x, y, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel,
    );

    this.nodes[2] = new QuadtreeNode<T>(
      { x, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel,
    );

    this.nodes[3] = new QuadtreeNode<T>(
      { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxObjects,
      this.maxLevels,
      nextLevel,
    );
  }

  private getIndex(rect: Rect): number[] {
    const indexes: number[] = [];
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    const startIsNorth = rect.y < horizontalMidpoint;
    const startIsWest = rect.x < verticalMidpoint;
    const endIsEast = rect.x + rect.width > verticalMidpoint;
    const endIsSouth = rect.y + rect.height > horizontalMidpoint;

    if (startIsNorth && endIsEast) {
      indexes.push(0);
    }

    if (startIsWest && startIsNorth) {
      indexes.push(1);
    }

    if (startIsWest && endIsSouth) {
      indexes.push(2);
    }

    if (endIsEast && endIsSouth) {
      indexes.push(3);
    }

    return indexes;
  }

  insert(rect: T): void {
    if (this.nodes.length) {
      const indexes = this.getIndex(rect);
      for (const index of indexes) {
        this.nodes[index]?.insert(rect);
      }
      return;
    }

    this.objects.push(rect);

    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      if (!this.nodes.length) {
        this.split();
      }

      for (const obj of this.objects) {
        const indexes = this.getIndex(obj);
        for (const index of indexes) {
          this.nodes[index]?.insert(obj);
        }
      }

      this.objects = [];
    }
  }

  retrieve(rect: Rect): T[] {
    const indexes = this.getIndex(rect);
    let returnObjects = [...this.objects];

    if (this.nodes.length) {
      for (const index of indexes) {
        const nodeResults = this.nodes[index]?.retrieve(rect);
        if (nodeResults) {
          returnObjects = returnObjects.concat(nodeResults);
        }
      }
    }

    if (this.level === 0) {
      return Array.from(new Set(returnObjects));
    }

    return returnObjects;
  }

  clear(): void {
    this.objects = [];

    for (const node of this.nodes) {
      node?.clear();
    }

    this.nodes = [];
  }

  size(): number {
    let count = this.objects.length;

    if (this.nodes.length) {
      for (const node of this.nodes) {
        count += node.size();
      }
    }

    return count;
  }

  getBounds(): QuadtreeBounds {
    return { ...this.bounds };
  }
}

export function useQuadtree<T extends Rect = Rect>(config: QuadtreeConfig) {
  const { bounds, maxObjects = 10, maxLevels = 4 } = config;

  const tree = ref<QuadtreeNode<T>>(
    new QuadtreeNode<T>(bounds, maxObjects, maxLevels, 0),
  ) as Ref<QuadtreeNode<T>>;

  const insert = (rect: T): void => {
    tree.value.insert(rect);
  };

  const retrieve = (rect: Rect): T[] => {
    return tree.value.retrieve(rect);
  };

  const clear = (): void => {
    tree.value.clear();
  };

  const size = (): number => {
    return tree.value.size();
  };

  const getBounds = (): QuadtreeBounds => {
    return tree.value.getBounds();
  };

  const recreate = (newConfig?: Partial<QuadtreeConfig>): void => {
    const cfg = { bounds, maxObjects, maxLevels, ...newConfig };
    tree.value = new QuadtreeNode<T>(
      cfg.bounds,
      cfg.maxObjects,
      cfg.maxLevels,
      0,
    );
  };

  return {
    tree: readonly(tree),
    insert,
    retrieve,
    clear,
    size,
    getBounds,
    recreate,
  };
}

export type UseQuadtreeReturn<T extends Rect = Rect> = ReturnType<
  typeof useQuadtree<T>
>;
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
| `showRotateHandle`{.primary .text-primary} | `boolean` | true |  |
| `constrainSquare`{.primary .text-primary} | `boolean` | false |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `LeafletBoundingBoxStylesKey`{.primary .text-primary} | `stylesOptions` | `any` | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |

---

## LeafletBoundingBoxRectangle
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | border-2 border-blue-500 |  |
| `dashed`{.primary .text-primary} | `number[]` | - |  |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletBoundingBoxStylesKey`{.primary .text-primary} | `ref()` | `any` | — |

---

## LeafletCircle
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id`{.primary .text-primary} | `string \| number` | - |  |
| `lat`{.primary .text-primary} | `number \| string` | 43.280608 |  |
| `lng`{.primary .text-primary} | `number \| string` | 5.350242 |  |
| `radius`{.primary .text-primary} | `number \| string` | 100 |  |
| `editable`{.primary .text-primary} | `boolean` | false |  |
| `draggable`{.primary .text-primary} | `boolean` | false |  |
| `selectable`{.primary .text-primary} | `boolean` | false |  |
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
| `LeafletSelectionKey`{.primary .text-primary} | `undefined` | `any` | — |

---

## LeafletControlItem
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name`{.primary .text-primary} | `string` | - |  |
| `title`{.primary .text-primary} | `string` | A control button |  |
| `type`{.primary .text-primary} | `'push' \| 'toggle'` | toggle |  |
| `active`{.primary .text-primary} | `boolean` | false |  |

  ### Events
| Name | Description |
|------|-------------|
| `click`{.primary .text-primary} | — |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletControlsKey`{.primary .text-primary} | — | — | — |

---

## LeafletControls
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `position`{.primary .text-primary} | `ControlOptions['position']` | topleft |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | rounded-[4px] shadow-(--leaflet-control-bar-shadow) bg-white |  |
| `style`{.primary .text-primary} | `HTMLAttributes['style']` | — |  |
| `activeItem`{.primary .text-primary} | `string \| null` |  |  |
| `enabled`{.primary .text-primary} | `boolean` | true |  |

  ### Events
| Name | Description |
|------|-------------|
| `item-clicked`{.primary .text-primary} | — |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `LeafletControlsKey`{.primary .text-primary} | `context` | `any` | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |

  ### CSS Variables
| Name | Value | Description |
|------|-------|-------------|
| `--leaflet-control-bar-shadow`{.primary .text-primary} | `0 1px 5px rgba(0, 0, 0, 0.65)` | — |

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

## LeafletFeatureHandle
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `role`{.primary .text-primary} | `LeafletFeatureHandleRole` | - |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | bg-red-500 border-2 border-red-500 opacity-30 rounded-full shadow-[0_0_4px_0_rgba(0,0,0,0.2)] |  |
| `size`{.primary .text-primary} | `number \| string` | 8 |  |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletBoundingBoxStylesKey`{.primary .text-primary} | `ref()` | `any` | — |

---

## LeafletFeaturesEditor
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled`{.primary .text-primary} | `boolean` | false |  |
| `mode`{.primary .text-primary} | `FeatureShapeType \| FeatureSelectMode \| null` |  |  |
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

## LeafletFeaturesSelector
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled`{.primary .text-primary} | `boolean` | false |  |
| `mode`{.primary .text-primary} | `'select' \| 'direct-select' \| null` |  |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | Default slot for features |
| `bounding-box`{.primary .text-primary} | Bounding box with customization slot |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `LeafletSelectionKey`{.primary .text-primary} | `context` | `any` | — |

  ### Child Components

  `LeafletBoundingBox`{.primary .text-primary}

---

## LeafletMarker
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id`{.primary .text-primary} | `string \| number` | - |  |
| `lat`{.primary .text-primary} | `number \| string` | 43.280608 |  |
| `lng`{.primary .text-primary} | `number \| string` | 5.350242 |  |
| `editable`{.primary .text-primary} | `boolean` | false |  |
| `draggable`{.primary .text-primary} | `boolean` | false |  |
| `selectable`{.primary .text-primary} | `boolean` | false |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |
| `LeafletSelectionKey`{.primary .text-primary} | `undefined` | `any` | — |

---

## LeafletMeasureTool
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `enabled`{.primary .text-primary} | `boolean` | false |  |
| `unit`{.primary .text-primary} | `'metric' \| 'imperial'` | metric |  |
| `showArea`{.primary .text-primary} | `boolean` | true |  |
| `showPerimeter`{.primary .text-primary} | `boolean` | true |  |
| `color`{.primary .text-primary} | `string` | #ff6600 |  |
| `fillColor`{.primary .text-primary} | `string` | #ff6600 |  |
| `fillOpacity`{.primary .text-primary} | `number` | 0.2 |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |

  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `finishMeasurement`{.primary .text-primary} | `() => void` | — |
| `cleanup`{.primary .text-primary} | `() => void` | — |

---

## LeafletPolygon
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id`{.primary .text-primary} | `string \| number` | - |  |
| `latlngs`{.primary .text-primary} | `Array<[number, number]> \| Array<{ lat: number; lng: number }>` |  |  |
| `editable`{.primary .text-primary} | `boolean` | false |  |
| `draggable`{.primary .text-primary} | `boolean` | false |  |
| `selectable`{.primary .text-primary} | `boolean` | false |  |
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
| `LeafletSelectionKey`{.primary .text-primary} | `undefined` | `any` | — |

---

## LeafletPolyline
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id`{.primary .text-primary} | `string \| number` | - |  |
| `latlngs`{.primary .text-primary} | `Array<[number, number]> \| Array<{ lat: number; lng: number }>` |  |  |
| `weight`{.primary .text-primary} | `number` | 3 |  |
| `editable`{.primary .text-primary} | `boolean` | false |  |
| `draggable`{.primary .text-primary} | `boolean` | false |  |
| `selectable`{.primary .text-primary} | `boolean` | false |  |
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
| `LeafletSelectionKey`{.primary .text-primary} | `undefined` | `any` | — |

---

## LeafletRectangle
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id`{.primary .text-primary} | `string \| number` | - |  |
| `bounds`{.primary .text-primary} | `[[number, number], [number, number]]` | 0,0,0,0 |  |
| `editable`{.primary .text-primary} | `boolean` | false |  |
| `draggable`{.primary .text-primary} | `boolean` | false |  |
| `selectable`{.primary .text-primary} | `boolean` | false |  |
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
| `LeafletSelectionKey`{.primary .text-primary} | `undefined` | `any` | — |

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

## LeafletVirtualize
::hr-underline
::

Quadtree composable return value for spatial indexing (required)
Uses O(log n) quadtree queries for efficient virtualization

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `quadtree`{.primary .text-primary} | `UseQuadtreeReturn<any>` | - | Quadtree composable return value for spatial indexing (required)
Uses O(log n) quadtree queries for efficient virtualization |
| `enabled`{.primary .text-primary} | `boolean` | true | Enable/disable virtualization |
| `marginMeters`{.primary .text-primary} | `number` | — | Margin in meters to add to visible bounds for pre-loading features
Larger margin = more features pre-loaded = less &#34;pop-in&#34; but more DOM elements
If not set, margin will be calculated dynamically based on zoom level
@default undefined (auto-calculated based on zoom) |
| `marginZoomRatio`{.primary .text-primary} | `number` | 1 | Ratio to scale margin based on zoom level (only used when marginMeters is not set)
Higher ratio = larger margin at low zoom levels
Formula: margin = marginZoomRatio * (20 - zoom) * 100 meters
@default 1.0
@example
- zoom 5: margin ≈ 1500m (1.5km)
- zoom 10: margin ≈ 1000m (1km)
- zoom 15: margin ≈ 500m (0.5km)
- zoom 18: margin ≈ 200m |
| `alwaysVisible`{.primary .text-primary} | `Array<string \| number>` |  | Array of feature IDs that should always be rendered, regardless of visibility
Useful for selected features or important landmarks |
| `minZoom`{.primary .text-primary} | `number` | — | Minimum zoom level to render features (inclusive)
Below this zoom, features will not be displayed
@default undefined (no minimum) |
| `maxZoom`{.primary .text-primary} | `number` | — | Maximum zoom level to render features (inclusive)
Above this zoom, features will not be displayed
@default undefined (no maximum) |
| `transitionDelay`{.primary .text-primary} | `number` | 50 | Delay in milliseconds before applying virtualization changes
Helps smooth transitions when toggling virtualization on/off
@default 50 |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `ref<typeof Leaflet \| undefined>(undefined)` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |

  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `visibleBounds`{.primary .text-primary} | `Ref<Leaflet.LatLngBounds \| null>` | — |
| `visibleFeatureIds`{.primary .text-primary} | `Ref<Set<string \| number>>` | — |
| `isTransitioning`{.primary .text-primary} | `Ref<any>` | — |

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
import { ref, computed } from "vue";
import { Button } from "@/components/ui/button";
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletDrawControl,
  LeafletControls,
  LeafletControlItem,
  LeafletFeaturesEditor,
  LeafletFeaturesSelector,
  LeafletFeatureHandle,
  LeafletBoundingBoxRectangle,
  LeafletMarker,
  LeafletCircle,
  LeafletPolyline,
  LeafletPolygon,
  LeafletRectangle,
  LeafletMeasureTool,
  type LeafletMapExposed,
  type FeatureDrawEvent,
  type FeatureShapeType,
  type FeatureSelectMode,
} from "@/components/ui/leaflet-map";
import { Icon } from "@iconify/vue";

const mapRef = ref<LeafletMapExposed | null>(null);

const editMode = ref(true);

const currentMode = ref<FeatureShapeType | FeatureSelectMode | null>("select");

const measureMode = ref(false);
const lastMeasurement = ref<{ distance: number; area?: number } | null>(null);

const selectionMode = computed<FeatureSelectMode | null>(() => {
  if (currentMode.value === "select") return "select";
  if (currentMode.value === "direct-select") return "direct-select";
  return null;
});

const isSelectMode = computed(() => selectionMode.value !== null);

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
    class: "border border-blue-500 bg-blue-500/20",
  },
  {
    id: 2,
    lat: 48.8738,
    lng: 2.295,
    radius: 300,
    class: "border border-green-500 bg-green-500/30",
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
    class: "border border-red-500",
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
    class: "border border-purple-500 bg-purple-500/30",
  },
]);

const rectangles = ref([
  {
    id: 1,
    bounds: [
      [48.84, 2.28],
      [48.845, 2.29],
    ] as [[number, number], [number, number]],
    class: "border border-orange-500 bg-orange-500/20",
  },
]);

const handleModeSelected = (mode: string | null) => {
  if (mode === "measure") {
    measureMode.value = !measureMode.value;
    if (measureMode.value) {
      currentMode.value = null;
    }
    return;
  }

  measureMode.value = false;

  if (currentMode.value === mode) {
    currentMode.value = null;
  } else {
    currentMode.value = mode as FeatureShapeType | FeatureSelectMode | null;
  }
};

const handleMeasurementComplete = (data: {
  distance: number;
  area?: number;
}) => {
  lastMeasurement.value = data;
};

const handleShapeCreated = (event: FeatureDrawEvent) => {
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
        class: "border border-blue-500 bg-blue-500/20",
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
        class: "border border-red-500",
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
        class: "border border-purple-500 bg-purple-500/30",
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
        class: "border border-orange-500 bg-orange-500/20",
      });
      break;
    }
  }

  currentMode.value = "select";
};
</script>

<template>
  <div class="w-full h-full flex flex-col gap-4">
    <div class="rounded flex items-center justify-between gap-4">
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

      <div
        v-if="measureMode && lastMeasurement"
        class="px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg shadow-sm"
      >
        <div class="text-sm font-medium text-orange-900">
          Measurement Result:
        </div>
        <div class="text-xs text-orange-700 mt-1">
          <span class="font-semibold">Distance:</span>
          {{
            lastMeasurement.distance > 1000
              ? `${(lastMeasurement.distance / 1000).toFixed(2)} km`
              : `${lastMeasurement.distance.toFixed(2)} m`
          }}
        </div>
        <div
          v-if="lastMeasurement.area !== undefined"
          class="text-xs text-orange-700"
        >
          <span class="font-semibold">Area:</span>
          {{
            lastMeasurement.area > 10000
              ? `${(lastMeasurement.area / 1000000).toFixed(2)} km²`
              : `${lastMeasurement.area.toFixed(2)} m²`
          }}
        </div>
      </div>
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

        <LeafletControls
          position="topleft"
          :enabled="editMode"
          :active-item="currentMode"
          @item-clicked="handleModeSelected"
        >
          <LeafletControlItem
            name="select"
            type="toggle"
            title="Selection Tool (V)"
          >
            <Icon icon="gis:arrow" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem
            name="direct-select"
            type="toggle"
            title="Direct Selection Tool (A)"
          >
            <Icon icon="gis:arrow-o" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem name="marker" type="toggle" title="Draw Marker">
            <Icon icon="gis:poi" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem
            name="rectangle"
            type="toggle"
            title="Draw Rectangle"
          >
            <Icon icon="gis:rectangle" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem name="circle" type="toggle" title="Draw Circle">
            <Icon icon="gis:circle" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem
            name="polyline"
            type="toggle"
            title="Draw Polyline"
          >
            <Icon icon="gis:polyline" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem name="polygon" type="toggle" title="Draw Polygon">
            <Icon icon="gis:polygon" class="w-4 h-4 text-black" />
          </LeafletControlItem>
        </LeafletControls>

        <LeafletControls
          position="topright"
          :enabled="editMode"
          :active-item="measureMode ? 'measure' : null"
          @item-clicked="handleModeSelected"
        >
          <LeafletControlItem
            name="measure"
            type="toggle"
            title="Measure Distance & Area"
          >
            <Icon icon="raphael:ruler" class="w-4 h-4 text-black" />
          </LeafletControlItem>
        </LeafletControls>

        <LeafletMeasureTool
          :enabled="measureMode"
          unit="metric"
          :show-area="true"
          color="#ff6600"
          @measurement-complete="handleMeasurementComplete"
          @measurement-update="(data) => (lastMeasurement = data)"
        />

        <LeafletFeaturesEditor
          :enabled="editMode"
          :mode="currentMode"
          :shape-options="{ color: '#3388ff', fillOpacity: 0.2 }"
          @draw:created="handleShapeCreated"
        >
          <LeafletFeaturesSelector
            :enabled="isSelectMode"
            :mode="selectionMode"
          >
            <LeafletMarker
              v-for="marker in markers"
              :key="`marker-${marker.id}`"
              :id="`marker-${marker.id}`"
              v-model:lat="marker.lat"
              v-model:lng="marker.lng"
              :selectable="currentMode === 'select'"
              :editable="currentMode === 'direct-select'"
              :draggable="currentMode === 'select'"
            />

            <LeafletCircle
              v-for="circle in circles"
              :key="`circle-${circle.id}`"
              :id="`circle-${circle.id}`"
              v-model:lat="circle.lat"
              v-model:lng="circle.lng"
              v-model:radius="circle.radius"
              :class="circle.class"
              :selectable="currentMode === 'select'"
              :editable="currentMode === 'direct-select'"
              :draggable="currentMode === 'select'"
            />

            <LeafletPolyline
              v-for="polyline in polylines"
              :key="`polyline-${polyline.id}`"
              :id="`polyline-${polyline.id}`"
              v-model:latlngs="polyline.latlngs"
              :weight="polyline.weight"
              :class="polyline.class"
              :selectable="currentMode === 'select'"
              :editable="currentMode === 'direct-select'"
              :draggable="currentMode === 'select'"
            />

            <LeafletPolygon
              v-for="polygon in polygons"
              :key="`polygon-${polygon.id}`"
              :id="`polygon-${polygon.id}`"
              v-model:latlngs="polygon.latlngs"
              :class="polygon.class"
              :selectable="currentMode === 'select'"
              :editable="currentMode === 'direct-select'"
              :draggable="currentMode === 'select'"
              :auto-close="true"
            />

            <LeafletRectangle
              v-for="rectangle in rectangles"
              :key="`rectangle-${rectangle.id}`"
              :id="`rectangle-${rectangle.id}`"
              v-model:bounds="rectangle.bounds"
              :class="rectangle.class"
              :selectable="currentMode === 'select'"
              :editable="currentMode === 'direct-select'"
              :draggable="currentMode === 'select'"
            />

            <template #bounding-box-styles>
              <LeafletBoundingBoxRectangle
                class="border-2 border-orange-400"
                :dashed="[5, 5]"
              />

              <LeafletFeatureHandle
                role="corner"
                class="bg-red-500/30 border border-red-500 rounded-full shadow-[0_0_4px_0_rgba(0,0,0,0.2)]"
                :size="10"
              />

              <LeafletFeatureHandle
                role="edge"
                class="bg-blue-500/20 border border-blue-500 rounded-full shadow-[0_0_4px_0_rgba(0,0,0,0.2)]"
                :size="8"
              />

              <LeafletFeatureHandle
                role="rotate"
                class="bg-blue-500/40 border border-blue-500 rounded-full shadow-[0_0_4px_0_rgba(0,0,0,0.2)]"
                :size="12"
              />

              <LeafletFeatureHandle
                role="center"
                class="bg-orange-500/40 border border-orange-500 rounded-full shadow-[0_0_4px_0_rgba(0,0,0,0.2)]"
                :size="12"
              />
            </template>
          </LeafletFeaturesSelector>
        </LeafletFeaturesEditor>
      </LeafletMap>
    </div>
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <leaflet-virtualization-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref, computed, onMounted, shallowRef } from "vue";
import { Button } from "@/components/ui/button";
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletVirtualize,
  LeafletMarker,
  LeafletCircle,
  LeafletPolygon,
  LeafletPolyline,
  LeafletRectangle,
  type LeafletMapExposed,
} from "@/components/ui/leaflet-map";
import { loadVirtualizationDemoData } from "./fixtures/fixtures.loader";
import type {
  DemoMarker,
  DemoCircle,
  DemoPolygon,
  DemoPolyline,
  DemoRectangle,
} from "./fixtures/fixtures.loader";
import type { UseQuadtreeReturn } from "~~/registry/new-york/composables/use-quadtree/useQuadtree";

const mapRef = ref<LeafletMapExposed | null>(null);

const virtualizationConfig = ref({
  enabled: true,
  isTransitioning: false,
  autoMargin: true,
  marginMeters: 1000,
  marginZoomRatio: 1.0,
});

const zoomLevelsRaw = ref({
  markers: { min: "12" as string | number, max: "" as string | number },
  circles: { min: "" as string | number, max: "" as string | number },
  polygons: { min: "" as string | number, max: "14" as string | number },
  polylines: { min: "" as string | number, max: "" as string | number },
  rectangles: { min: "" as string | number, max: "" as string | number },
});

const zoomLevels = computed(() => ({
  markers: {
    min:
      zoomLevelsRaw.value.markers.min === ""
        ? undefined
        : Number(zoomLevelsRaw.value.markers.min),
    max:
      zoomLevelsRaw.value.markers.max === ""
        ? undefined
        : Number(zoomLevelsRaw.value.markers.max),
  },
  circles: {
    min:
      zoomLevelsRaw.value.circles.min === ""
        ? undefined
        : Number(zoomLevelsRaw.value.circles.min),
    max:
      zoomLevelsRaw.value.circles.max === ""
        ? undefined
        : Number(zoomLevelsRaw.value.circles.max),
  },
  polygons: {
    min:
      zoomLevelsRaw.value.polygons.min === ""
        ? undefined
        : Number(zoomLevelsRaw.value.polygons.min),
    max:
      zoomLevelsRaw.value.polygons.max === ""
        ? undefined
        : Number(zoomLevelsRaw.value.polygons.max),
  },
  polylines: {
    min:
      zoomLevelsRaw.value.polylines.min === ""
        ? undefined
        : Number(zoomLevelsRaw.value.polylines.min),
    max:
      zoomLevelsRaw.value.polylines.max === ""
        ? undefined
        : Number(zoomLevelsRaw.value.polylines.max),
  },
  rectangles: {
    min:
      zoomLevelsRaw.value.rectangles.min === ""
        ? undefined
        : Number(zoomLevelsRaw.value.rectangles.min),
    max:
      zoomLevelsRaw.value.rectangles.max === ""
        ? undefined
        : Number(zoomLevelsRaw.value.rectangles.max),
  },
}));

const visibleCounts = ref({
  markers: 0,
  circles: 0,
  polygons: 0,
  polylines: 0,
  rectangles: 0,
});

const visibleShapesCount = computed(
  () =>
    visibleCounts.value.markers +
    visibleCounts.value.circles +
    visibleCounts.value.polygons +
    visibleCounts.value.polylines +
    visibleCounts.value.rectangles,
);

const loadingState = ref({
  isLoading: true,
  progress: 0,
  stage: "Starting...",
});

const features = ref({
  markers: [] as DemoMarker[],
  circles: [] as DemoCircle[],
  polygons: [] as DemoPolygon[],
  polylines: [] as DemoPolyline[],
  rectangles: [] as DemoRectangle[],
});

const quadtrees = shallowRef({
  markers: null as UseQuadtreeReturn<DemoMarker> | null,
  circles: null as UseQuadtreeReturn<DemoCircle> | null,
  polygons: null as UseQuadtreeReturn<DemoPolygon> | null,
  polylines: null as UseQuadtreeReturn<DemoPolyline> | null,
  rectangles: null as UseQuadtreeReturn<DemoRectangle> | null,
});

const totalShapes = computed(
  () =>
    features.value.markers.length +
    features.value.circles.length +
    features.value.polygons.length +
    features.value.polylines.length +
    features.value.rectangles.length,
);

onMounted(async () => {
  const data = await loadVirtualizationDemoData(
    (progress: number, stage: string) => {
      loadingState.value.progress = progress;
      loadingState.value.stage = stage;
    },
  );
  features.value.markers = data.markers;
  features.value.circles = data.circles;
  features.value.polygons = data.polygons;
  features.value.polylines = data.polylines;
  features.value.rectangles = data.rectangles;
  quadtrees.value.markers = data.quadtrees.markers;
  quadtrees.value.circles = data.quadtrees.circles;
  quadtrees.value.polygons = data.quadtrees.polygons;
  quadtrees.value.polylines = data.quadtrees.polylines;
  quadtrees.value.rectangles = data.quadtrees.rectangles;
  loadingState.value.isLoading = false;
});

const stats = ref({
  fps: 0,
});

const toggleVirtualization = () => {
  virtualizationConfig.value.enabled = !virtualizationConfig.value.enabled;
};

let lastTime = performance.now();
let frames = 0;
const updateFPS = () => {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    stats.value.fps = Math.round((frames * 1000) / (now - lastTime));
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(updateFPS);
};
updateFPS();
</script>

<template>
  <div class="w-full h-full flex flex-col gap-4">
    <div
      v-if="loadingState.isLoading"
      class="flex flex-col items-center justify-center p-8 gap-4"
    >
      <div class="text-lg font-semibold">{{ loadingState.stage }}</div>
      <div class="w-64 h-2 rounded-full overflow-hidden">
        <div
          class="h-full bg-blue-500 transition-all duration-300"
          :style="{ width: `${loadingState.progress}%` }"
        />
      </div>
      <div class="text-sm text-gray-600">{{ loadingState.progress }}%</div>
    </div>

    <template v-else>
      <div class="rounded flex flex-col gap-4 p-4">
        <div class="flex items-center gap-6">
          <div class="text-sm">
            <strong>Total:</strong>
            {{ totalShapes }} shapes
          </div>
          <div
            class="text-sm"
            :class="
              virtualizationConfig.enabled ? 'text-green-600' : 'text-red-600'
            "
          >
            <strong>Rendered:</strong>
            {{ visibleShapesCount }}
            <span class="text-xs"
              >({{
                Math.round((visibleShapesCount / totalShapes) * 100)
              }}%)</span
            >
          </div>
          <div
            class="text-sm"
            :class="
              stats.fps < 30
                ? 'text-red-600'
                : stats.fps < 50
                  ? 'text-orange-600'
                  : 'text-green-600'
            "
          >
            <strong>FPS:</strong>
            {{ stats.fps }}
          </div>
        </div>

        <div class="flex items-center gap-6 text-xs text-gray-600">
          <div>
            <strong>Markers:</strong>
            {{ visibleCounts.markers }} / {{ features.markers.length }}
          </div>
          <div>
            <strong>Circles:</strong>
            {{ visibleCounts.circles }} / {{ features.circles.length }}
          </div>
          <div>
            <strong>Polygons:</strong>
            {{ visibleCounts.polygons }} / {{ features.polygons.length }}
          </div>
          <div>
            <strong>Polylines:</strong>
            {{ visibleCounts.polylines }} / {{ features.polylines.length }}
          </div>
          <div>
            <strong>Rectangles:</strong>
            {{ visibleCounts.rectangles }} / {{ features.rectangles.length }}
          </div>
        </div>

        <div class="flex items-center gap-4">
          <Button
            @click="toggleVirtualization"
            :disabled="virtualizationConfig.isTransitioning"
            :class="
              virtualizationConfig.enabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            "
          >
            <span v-if="virtualizationConfig.isTransitioning"
              >Switching...</span
            >
            <span v-else>{{
              virtualizationConfig.enabled
                ? "Virtualization ON"
                : "Virtualization OFF"
            }}</span>
          </Button>

          <div class="flex items-center gap-2">
            <label class="text-sm">Auto Margin:</label>
            <input
              v-model="virtualizationConfig.autoMargin"
              type="checkbox"
              class="w-4 h-4"
              :disabled="virtualizationConfig.isTransitioning"
            />
          </div>

          <div
            v-if="virtualizationConfig.autoMargin"
            class="flex items-center gap-2"
          >
            <label class="text-sm">Zoom Ratio:</label>
            <input
              v-model.number="virtualizationConfig.marginZoomRatio"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              class="w-32"
              :disabled="virtualizationConfig.isTransitioning"
            />
            <span class="text-sm w-12"
              >{{ virtualizationConfig.marginZoomRatio.toFixed(1) }}x</span
            >
          </div>

          <div v-else class="flex items-center gap-2">
            <label class="text-sm">Margin:</label>
            <input
              v-model.number="virtualizationConfig.marginMeters"
              type="range"
              min="0"
              max="5000"
              step="250"
              class="w-32"
              :disabled="virtualizationConfig.isTransitioning"
            />
            <span class="text-sm w-16"
              >{{ virtualizationConfig.marginMeters }} m</span
            >
          </div>

          <details class="border rounded p-3">
            <summary class="cursor-pointer text-sm font-semibold mb-2">
              🔍 Zoom Levels per Feature Type
            </summary>

            <div class="mt-3 space-y-2">
              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Markers:</span>
                <input
                  v-model="zoomLevelsRaw.markers.min"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model="zoomLevelsRaw.markers.max"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(zoom ≥12)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Circles:</span>
                <input
                  v-model="zoomLevelsRaw.circles.min"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model="zoomLevelsRaw.circles.max"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(always)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Polygons:</span>
                <input
                  v-model="zoomLevelsRaw.polygons.min"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model="zoomLevelsRaw.polygons.max"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(zoom ≤14)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Polylines:</span>
                <input
                  v-model="zoomLevelsRaw.polylines.min"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model="zoomLevelsRaw.polylines.max"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(always)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Rectangles:</span>
                <input
                  v-model="zoomLevelsRaw.rectangles.min"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model="zoomLevelsRaw.rectangles.max"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(always)</span>
              </div>

              <div class="text-xs text-gray-500 mt-2 pt-2 border-t">
                💡 Leave empty for no limit. Example: Markers appear at zoom
                12+, Polygons disappear after zoom 14.
              </div>
            </div>
          </details>
        </div>
      </div>

      <div class="flex-1 relative">
        <div
          v-if="virtualizationConfig.isTransitioning"
          class="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg"
        >
          <div
            class="bg-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3"
          >
            <div
              class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            ></div>
            <span class="text-sm font-medium">
              {{
                virtualizationConfig.enabled ? "Enabling" : "Disabling"
              }}
              virtualization...
            </span>
          </div>
        </div>

        <LeafletMap
          ref="mapRef"
          name="virtualization-demo"
          class="w-full h-[600px] rounded-lg shadow-lg"
          tile-layer="osm"
          :center-lat="48.8566"
          :center-lng="2.3522"
          :zoom="15"
        >
          <LeafletTileLayer
            name="osm"
            url-template="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <LeafletZoomControl position="topleft" />

          <LeafletVirtualize
            v-if="quadtrees.markers"
            :enabled="virtualizationConfig.enabled"
            :quadtree="quadtrees.markers"
            :margin-meters="
              virtualizationConfig.autoMargin
                ? undefined
                : virtualizationConfig.marginMeters
            "
            :margin-zoom-ratio="
              virtualizationConfig.autoMargin
                ? virtualizationConfig.marginZoomRatio
                : undefined
            "
            :min-zoom="zoomLevels.markers.min"
            :max-zoom="zoomLevels.markers.max"
            @update:visible-count="visibleCounts.markers = $event"
            @transition-start="virtualizationConfig.isTransitioning = true"
            @transition-end="virtualizationConfig.isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="marker in features.markers" :key="marker.id">
              <LeafletMarker
                v-if="visibleIds.has(marker.id)"
                :id="marker.id"
                v-model:lat="marker.lat"
                v-model:lng="marker.lng"
              />
            </template>
          </LeafletVirtualize>

          <LeafletVirtualize
            v-if="quadtrees.circles"
            :enabled="virtualizationConfig.enabled"
            :margin-meters="
              virtualizationConfig.autoMargin
                ? undefined
                : virtualizationConfig.marginMeters
            "
            :margin-zoom-ratio="
              virtualizationConfig.autoMargin
                ? virtualizationConfig.marginZoomRatio
                : undefined
            "
            :quadtree="quadtrees.circles"
            :min-zoom="zoomLevels.circles.min"
            :max-zoom="zoomLevels.circles.max"
            @update:visible-count="visibleCounts.circles = $event"
            @transition-start="virtualizationConfig.isTransitioning = true"
            @transition-end="virtualizationConfig.isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="circle in features.circles" :key="circle.id">
              <LeafletCircle
                v-if="visibleIds.has(circle.id)"
                :id="circle.id"
                v-model:lat="circle.lat"
                v-model:lng="circle.lng"
                v-model:radius="circle.radius"
                :class="
                  circle.colorIndex === 0
                    ? 'bg-blue-500/30 border border-blue-700'
                    : circle.colorIndex === 1
                      ? 'bg-green-500/30 border border-green-700'
                      : 'bg-red-500/30 border border-red-700'
                "
              />
            </template>
          </LeafletVirtualize>

          <LeafletVirtualize
            v-if="quadtrees.polygons"
            :enabled="virtualizationConfig.enabled"
            :margin-meters="
              virtualizationConfig.autoMargin
                ? undefined
                : virtualizationConfig.marginMeters
            "
            :margin-zoom-ratio="
              virtualizationConfig.autoMargin
                ? virtualizationConfig.marginZoomRatio
                : undefined
            "
            :quadtree="quadtrees.polygons"
            :min-zoom="zoomLevels.polygons.min"
            :max-zoom="zoomLevels.polygons.max"
            @update:visible-count="visibleCounts.polygons = $event"
            @transition-start="virtualizationConfig.isTransitioning = true"
            @transition-end="virtualizationConfig.isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="polygon in features.polygons" :key="polygon.id">
              <LeafletPolygon
                v-if="visibleIds.has(polygon.id)"
                :id="polygon.id"
                v-model:latlngs="polygon.latlngs"
                :class="
                  polygon.colorIndex === 0
                    ? 'bg-purple-500/30 border border-purple-700'
                    : 'bg-orange-500/30 border border-orange-700'
                "
              />
            </template>
          </LeafletVirtualize>

          <LeafletVirtualize
            v-if="quadtrees.polylines"
            :enabled="virtualizationConfig.enabled"
            :margin-meters="
              virtualizationConfig.autoMargin
                ? undefined
                : virtualizationConfig.marginMeters
            "
            :margin-zoom-ratio="
              virtualizationConfig.autoMargin
                ? virtualizationConfig.marginZoomRatio
                : undefined
            "
            :quadtree="quadtrees.polylines"
            :min-zoom="zoomLevels.polylines.min"
            :max-zoom="zoomLevels.polylines.max"
            @update:visible-count="visibleCounts.polylines = $event"
            @transition-start="virtualizationConfig.isTransitioning = true"
            @transition-end="virtualizationConfig.isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="polyline in features.polylines" :key="polyline.id">
              <LeafletPolyline
                v-if="visibleIds.has(polyline.id)"
                :id="polyline.id"
                v-model:latlngs="polyline.latlngs"
                :class="
                  polyline.colorIndex === 0
                    ? 'border border-yellow-600'
                    : polyline.colorIndex === 1
                      ? 'border border-pink-600'
                      : 'border border-cyan-600'
                "
              />
            </template>
          </LeafletVirtualize>

          <LeafletVirtualize
            v-if="quadtrees.rectangles"
            :enabled="virtualizationConfig.enabled"
            :margin-meters="
              virtualizationConfig.autoMargin
                ? undefined
                : virtualizationConfig.marginMeters
            "
            :margin-zoom-ratio="
              virtualizationConfig.autoMargin
                ? virtualizationConfig.marginZoomRatio
                : undefined
            "
            :quadtree="quadtrees.rectangles"
            :min-zoom="zoomLevels.rectangles.min"
            :max-zoom="zoomLevels.rectangles.max"
            @update:visible-count="visibleCounts.rectangles = $event"
            @transition-start="virtualizationConfig.isTransitioning = true"
            @transition-end="virtualizationConfig.isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template
              v-for="rectangle in features.rectangles"
              :key="rectangle.id"
            >
              <LeafletRectangle
                v-if="visibleIds.has(rectangle.id)"
                :id="rectangle.id"
                v-model:bounds="rectangle.bounds"
                :class="
                  rectangle.colorIndex === 0
                    ? 'bg-indigo-500/30 border border-indigo-700'
                    : 'bg-teal-500/30 border border-teal-700'
                "
              />
            </template>
          </LeafletVirtualize>
        </LeafletMap>
      </div>

      <div class="text-sm text-gray-600 p-4 rounded border">
        <p>
          <strong>Note:</strong> Cette démo utilise {{ totalShapes }} shapes
          pré-générées ({{ features.markers.length }} markers,
          {{ features.circles.length }} circles,
          {{ features.polygons.length }} polygons,
          {{ features.polylines.length }} polylines,
          {{ features.rectangles.length }} rectangles) autour de Paris.
        </p>
        <p class="mt-2">
          Avec la virtualisation
          <strong class="text-green-600">activée</strong>, seules les shapes
          visibles dans la viewport (+ marge) sont rendues. Regardez le compteur
          "Rendered" pour voir combien de shapes sont actuellement montées.
        </p>
        <p class="mt-2">
          Avec la virtualisation
          <strong class="text-red-600">désactivée</strong>, TOUTES les
          {{ totalShapes }} shapes sont rendues en même temps, ce qui peut
          causer des lags importants lors du zoom/déplacement.
        </p>
        <p class="mt-2 text-orange-600 font-semibold">
          <strong>Pour tester:</strong>
        </p>
        <ol class="mt-1 ml-4 list-decimal text-orange-600">
          <li>
            Activez la virtualisation → Déplacez la carte → Notez le FPS et le %
            de shapes rendues
          </li>
          <li>
            Désactivez la virtualisation → Déplacez la carte → Comparez le FPS
            (devrait chuter !)
          </li>
          <li>
            Zoomez/dézoomez pour voir comment le nombre de shapes rendues change
          </li>
        </ol>
      </div>
    </template>
  </div>
</template>
```
  :::
::

::tip
You can copy and adapt this template for any component documentation.
::