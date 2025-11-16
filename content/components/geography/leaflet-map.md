---
title: LeafletMap
description: Quadtree composable return value for spatial indexing (required)
---

  <p class="text-pretty mt-4">Uses O(log n) quadtree queries for efficient virtualization<br>   </p>

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <leaflet-edition-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed, type ComponentPublicInstance } from "vue";
import { Button } from "@/components/ui/button";
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletControls,
  LeafletControlItem,
  LeafletFeaturesEditor,
  LeafletFeaturesSelector,
  LeafletFeatureHandle,
  LeafletFeatureRectangle,
  LeafletMarker,
  LeafletCircle,
  LeafletPolyline,
  LeafletPolygon,
  LeafletRectangle,
  LeafletMeasureTool,
  LeafletCanvasGL,
  type LeafletMapExposed,
  type FeatureDrawEvent,
  type FeatureShapeType,
  type FeatureSelectMode,
} from "@/components/ui/leaflet-map";
import { Icon } from "@iconify/vue";

type LeafletCanvasInstance = ComponentPublicInstance & {
  sourceCanvas: HTMLCanvasElement | null;
  redraw: () => void;
};

const mapRef = ref<LeafletMapExposed | null>(null);

const editMode = ref(true);

const currentMode = ref<FeatureShapeType | FeatureSelectMode | null>("select");

const measureMode = ref<"line" | "polygon" | false>(false);
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

const canvasRef = ref<LeafletCanvasInstance | null>(null);
const canvasCorners = ref([
  { lat: 48.865, lng: 2.34 },
  { lat: 48.865, lng: 2.365 },
  { lat: 48.85, lng: 2.365 },
  { lat: 48.85, lng: 2.34 },
]);
const canvasOpacity = ref(0.7);
const sourceCanvas = ref<HTMLCanvasElement | null>(null);

const onCanvasReady = (canvas: HTMLCanvasElement) => {
  sourceCanvas.value = canvas;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#667eea");
  gradient.addColorStop(1, "#764ba2");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Canvas Overlay", canvas.width / 2, canvas.height / 2 - 10);

  ctx.font = "16px Arial";
  ctx.fillText(
    "Editable & Draggable",
    canvas.width / 2,
    canvas.height / 2 + 20,
  );
};

const handleModeSelected = (mode: string | null) => {
  if (mode === "measure-line" || mode === "measure-polygon") {
    const newMode = mode === "measure-line" ? "line" : "polygon";

    if (measureMode.value === newMode) {
      measureMode.value = false;
    } else {
      measureMode.value = newMode;
      currentMode.value = null;
    }
    return;
  }

  if (measureMode.value) {
    measureMode.value = false;
  }

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
    <div class="rounded flex items-center justify-between gap-4 flex-wrap">
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
          :active-item="
            measureMode === 'line'
              ? 'measure-line'
              : measureMode === 'polygon'
                ? 'measure-polygon'
                : null
          "
          @item-clicked="handleModeSelected"
        >
          <LeafletControlItem
            name="measure-line"
            type="toggle"
            title="Measure Distance (Line)"
          >
            <Icon icon="ri:ruler-line" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem
            name="measure-polygon"
            type="toggle"
            title="Measure Distance & Area (Polygon)"
          >
            <Icon icon="raphael:ruler" class="w-4 h-4 text-black" />
          </LeafletControlItem>
        </LeafletControls>

        <LeafletMeasureTool
          :enabled="!!measureMode"
          :mode="measureMode || 'polygon'"
          unit="metric"
          :show-area="true"
          class="border border-blue-500 bg-blue-500/20"
          @measurement-complete="handleMeasurementComplete"
          @measurement-update="(data) => (lastMeasurement = data)"
        >
          <LeafletFeatureHandle
            role="corner"
            class="bg-blue-500/20 border border-blue-500 rounded-full shadow-[0_0_4px_0_rgba(0,0,0,0.2)]"
            :size="12"
          />
        </LeafletMeasureTool>

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

            <LeafletCanvasGL
              ref="canvasRef"
              :corners="canvasCorners"
              :width="400"
              :height="300"
              :selectable="currentMode === 'select'"
              :editable="currentMode === 'direct-select'"
              :draggable="currentMode === 'select'"
              :subdivisions="20"
              :opacity="canvasOpacity"
              class="border-2 border-red-500"
              @canvas-ready="onCanvasReady"
              @update:corners="(corners) => (canvasCorners = corners)"
            >
              <LeafletFeatureHandle
                role="corner"
                class="bg-white border-2 border-red-500 rounded-full shadow-[0_0_4px_0_rgba(0,0,0,0.2)]"
                :size="10"
              />
            </LeafletCanvasGL>

            <template #bounding-box-styles>
              <LeafletFeatureRectangle
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
import type { LeafletSelectionContext } from "./LeafletFeaturesSelector.vue";
import type { LeafletControlsContext } from "./LeafletControls.vue";
type L = typeof L;

export { default as LeafletMap } from "./LeafletMap.vue";
export { default as LeafletZoomControl } from "./LeafletZoomControl.vue";
export { default as LeafletControls } from "./LeafletControls.vue";
export { default as LeafletControlItem } from "./LeafletControlItem.vue";
export { default as LeafletFeaturesEditor } from "./LeafletFeaturesEditor.vue";
export { default as LeafletFeaturesSelector } from "./LeafletFeaturesSelector.vue";
export { default as LeafletVirtualize } from "./LeafletVirtualize.vue";
export { default as LeafletBoundingBox } from "./LeafletBoundingBox.vue";
export { default as LeafletFeatureRectangle } from "./LeafletFeatureRectangle.vue";
export { default as LeafletFeatureHandle } from "./LeafletFeatureHandle.vue";
export { default as LeafletTileLayer } from "./LeafletTileLayer.vue";
export { default as LeafletMarker } from "./LeafletMarker.vue";
export { default as LeafletCircle } from "./LeafletCircle.vue";
export { default as LeafletPolyline } from "./LeafletPolyline.vue";
export { default as LeafletPolygon } from "./LeafletPolygon.vue";
export { default as LeafletRectangle } from "./LeafletRectangle.vue";
export { default as LeafletCanvas } from "./LeafletCanvas.vue";
export { default as LeafletCanvasGL } from "./LeafletCanvasGL.vue";
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
export const LeafletStylesKey: InjectionKey<
  Ref<Record<string, any> | undefined>
> = Symbol("LeafletFeatureHandles");
export const LeafletSelectionKey: InjectionKey<LeafletSelectionContext> =
  Symbol("LeafletSelection");
export const LeafletControlsKey: InjectionKey<
  LeafletControlsContext | undefined
> = Symbol("LeafletControls");

export type { LeafletMapProps } from "./LeafletMap.vue";
export type { LeafletMapExposed } from "./LeafletMap.vue";
export type { LeafletZoomControlProps } from "./LeafletZoomControl.vue";
export type {
  LeafletControlsProps,
  LeafletControlsContext,
  ControlItemReference,
} from "./LeafletControls.vue";
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
} from "./LeafletBoundingBox.vue";
export type {
  LeafletFeatureRectangleProps,
  LeafletFeatureRectangleStyle,
} from "./LeafletFeatureRectangle.vue";
export type {
  LeafletFeatureHandleProps,
  LeafletFeatureHandleRole,
  LeafletFeatureHandleStyle,
} from "./LeafletFeatureHandle.vue";
export type { LeafletTileLayerProps } from "./LeafletTileLayer.vue";
export type { LeafletMarkerProps } from "./LeafletMarker.vue";
export type { LeafletCircleProps } from "./LeafletCircle.vue";
export type { LeafletPolylineProps } from "./LeafletPolyline.vue";
export type { LeafletPolygonProps } from "./LeafletPolygon.vue";
export type { LeafletRectangleProps } from "./LeafletRectangle.vue";
export type {
  LeafletCanvasProps,
  LeafletCanvasStyles,
} from "./LeafletCanvas.vue";
export type { LeafletCanvasGLProps } from "./LeafletCanvasGL.vue";
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
import type Leaflet from "leaflet";
import type { LeafletMouseEvent } from "leaflet";
import { cn } from "@/lib/utils";
import { useLeaflet } from "~~/registry/new-york/composables/use-leaflet/useLeaflet";
import {
  LeafletErrorsKey,
  LeafletMapKey,
  LeafletModuleKey,
  LeafletTileLayersKey,
} from ".";

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

        const onMapClick = (event: LeafletMouseEvent) => {
          emit("click", event);
        };

        map.value.on("click", onMapClick);
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
import { useLeaflet } from "~~/registry/new-york/composables/use-leaflet/useLeaflet";
import {
  LeafletStylesKey,
  LeafletMapKey,
  LeafletModuleKey,
  type LeafletFeatureRectangleStyle,
  type LeafletFeatureHandleStyle,
} from ".";

const {
  constrainToSquare,
  calculateHandlePositions,
  calculateBoundsFromHandle,
  setMapCursor,
  resetMapCursor,
  createStyledMarker,
} = await useLeaflet();

export interface LeafletBoundingBoxStyles {
  rectangle: LeafletFeatureRectangleStyle;
  corner: LeafletFeatureHandleStyle;
  edge: LeafletFeatureHandleStyle;
  rotate: LeafletFeatureHandleStyle;
  center: LeafletFeatureHandleStyle;
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
  rectangle: {
    color: "#3388ff",
    weight: 2,
    fill: false,
    fillColor: undefined,
    dashArray: "5, 5",
    interactive: false,
  },
  corner: {
    className: "leaflet-feature-handle leaflet-handle-corner",
    html: '<div style="width:8px;height:8px;background:#fff;border:2px solid #3388ff;border-radius:2px;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [8, 8],
  },
  edge: {
    className: "leaflet-feature-handle leaflet-handle-edge",
    html: '<div style="width:8px;height:8px;background:#fff;border:2px solid #3388ff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [8, 8],
  },
  rotate: {
    className: "leaflet-feature-handle leaflet-handle-rotate",
    html: '<div style="width:12px;height:12px;background:#fff;border:2px solid #3388ff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [12, 12],
  },
  center: {
    className: "leaflet-feature-handle leaflet-handle-center",
    html: '<div style="width:12px;height:12px;background:#ff8800;border:2px solid #fff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [12, 12],
  },
});

provide(LeafletStylesKey, stylesOptions);

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

const createBoundingBox = () => {
  if (!props.bounds || !L.value || !map.value || !props.visible) {
    clearHandles();
    return;
  }

  clearHandles();

  boundingBox.value = L.value
    .rectangle(props.bounds, stylesOptions.value.rectangle)
    .addTo(map.value);

  const handlePositions = calculateHandlePositions(props.bounds, map.value, {
    corners: true,
    edges: true,
    rotate: props.showRotateHandle,
    center: true,
    rotateOffsetPx: 30,
  });

  const cornerCursors = [
    "nesw-resize",
    "nwse-resize",
    "nesw-resize",
    "nwse-resize",
  ];
  const edgeCursors = ["ew-resize", "ns-resize", "ew-resize", "ns-resize"];
  const rotateCursor = "ew-resize";

  handlePositions.corners?.forEach((corner, index) => {
    const handle = createStyledMarker(
      corner,
      stylesOptions.value.corner,
      { draggable: true },
      map.value!,
    );
    if (!handle) return;

    const handleElement = handle.getElement();
    if (handleElement && cornerCursors[index]) {
      handleElement.style.cursor = cornerCursors[index];
    }

    const onCornerMouseDown = () => {
      if (map.value) setMapCursor(map.value, cornerCursors[index] || "");
    };

    const onCornerDragStart = () => {
      isScaling.value = true;
      scaleStartBounds = props.bounds;
      scaleCornerIndex = index;
      if (map.value) {
        map.value.dragging.disable();
      }
    };

    const onCornerDrag = () => {
      if (!isScaling.value || !scaleStartBounds) return;

      const newCorner = handle.getLatLng();
      let newBounds = calculateBoundsFromHandle(
        "corner",
        index,
        newCorner,
        scaleStartBounds,
      );
      if (!newBounds) return;

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
    };

    const onCornerDragEnd = () => {
      isScaling.value = false;
      if (map.value) {
        resetMapCursor(map.value);
        map.value.dragging.enable();
      }
      if (boundingBox.value) {
        emit("update:bounds", boundingBox.value.getBounds());
      }
    };

    handle.on("mousedown", onCornerMouseDown);
    handle.on("dragstart", onCornerDragStart);
    handle.on("drag", onCornerDrag);
    handle.on("dragend", onCornerDragEnd);

    cornerHandles.value.push(handle);
  });

  handlePositions.edges?.forEach((edge, index) => {
    const handle = createStyledMarker(
      edge,
      stylesOptions.value.edge,
      { draggable: true },
      map.value!,
    );
    if (!handle) return;

    const handleElement = handle.getElement();
    if (handleElement && edgeCursors[index]) {
      handleElement.style.cursor = edgeCursors[index];
    }

    const onEdgeMouseDown = () => {
      if (map.value) setMapCursor(map.value, edgeCursors[index] || "");
    };

    const onEdgeDragStart = () => {
      isScaling.value = true;
      scaleStartBounds = props.bounds;
      if (map.value) {
        map.value.dragging.disable();
      }
    };

    const onEdgeDrag = () => {
      if (!isScaling.value || !scaleStartBounds) return;

      const newPos = handle.getLatLng();
      let newBounds = calculateBoundsFromHandle(
        "edge",
        index,
        newPos,
        scaleStartBounds,
      );
      if (!newBounds) return;

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
    };

    const onEdgeDragEnd = () => {
      isScaling.value = false;
      if (map.value) {
        resetMapCursor(map.value);
        map.value.dragging.enable();
      }
      if (boundingBox.value) {
        emit("update:bounds", boundingBox.value.getBounds());
      }
    };

    handle.on("mousedown", onEdgeMouseDown);
    handle.on("dragstart", onEdgeDragStart);
    handle.on("drag", onEdgeDrag);
    handle.on("dragend", onEdgeDragEnd);

    edgeHandles.value.push(handle);
  });

  if (props.showRotateHandle && handlePositions.rotate) {
    rotateHandle.value = createStyledMarker(
      handlePositions.rotate,
      stylesOptions.value.rotate,
      { draggable: true },
      map.value,
    );

    if (!rotateHandle.value) return;

    const handleElement = rotateHandle.value.getElement();
    if (handleElement) {
      handleElement.style.cursor = rotateCursor;
    }

    const onRotateMouseDown = () => {
      if (map.value) setMapCursor(map.value, rotateCursor);

      const handleElement = rotateHandle.value?.getElement();
      if (handleElement) {
        handleElement.style.cursor = rotateCursor;
      }
    };

    const onRotateDragStart = () => {
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
    };

    const onRotateDrag = () => {
      if (!isRotating.value || !props.bounds) return;

      const center = props.bounds.getCenter();
      const handlePos = rotateHandle.value!.getLatLng();

      const dx = handlePos.lng - center.lng;
      const dy = handlePos.lat - center.lat;
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      const rotationAngle = currentAngle - rotationStartAngle;

      emit("rotate", rotationAngle);
    };

    const onRotateDragEnd = () => {
      isRotating.value = false;
      if (map.value) {
        resetMapCursor(map.value);
        map.value.dragging.enable();
      }

      const handleElement = rotateHandle.value?.getElement();
      if (handleElement) {
        handleElement.style.cursor = "grab";
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
    };

    const onRotateMouseUp = () => {
      resetMapCursor(map.value);
    };

    rotateHandle.value.on("mousedown", onRotateMouseDown);
    rotateHandle.value.on("dragstart", onRotateDragStart);
    rotateHandle.value.on("drag", onRotateDrag);
    rotateHandle.value.on("dragend", onRotateDragEnd);
    rotateHandle.value.on("mouseup", onRotateMouseUp);
  }

  if (handlePositions.center) {
    centerHandle.value = createStyledMarker(
      handlePositions.center,
      stylesOptions.value.center,
      { draggable: false },
      map.value,
    );
  }
};

const updateHandlePositions = (bounds: L.LatLngBounds) => {
  if (!L.value || !map.value) return;

  const handlePositions = calculateHandlePositions(bounds, map.value, {
    corners: true,
    edges: true,
    rotate: props.showRotateHandle,
    center: true,
    rotateOffsetPx: 30,
  });

  handlePositions.corners?.forEach((corner, i) => {
    if (cornerHandles.value[i]) cornerHandles.value[i].setLatLng(corner);
  });

  handlePositions.edges?.forEach((edge, i) => {
    if (edgeHandles.value[i]) edgeHandles.value[i].setLatLng(edge);
  });

  if (rotateHandle.value && handlePositions.rotate) {
    rotateHandle.value.setLatLng(handlePositions.rotate);
  }

  if (centerHandle.value && handlePositions.center) {
    centerHandle.value.setLatLng(handlePositions.center);
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

```vue [src/components/ui/leaflet-map/LeafletCanvas.vue]
<script setup lang="ts">
import {
  inject,
  watch,
  ref,
  type Ref,
  nextTick,
  onBeforeUnmount,
  type HTMLAttributes,
  provide,
} from "vue";
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { useLeaflet } from "~~/registry/new-york/composables/use-leaflet/useLeaflet";
import { useCheckIn } from "~~/registry/new-york/composables/use-check-in/useCheckIn";
import {
  LeafletMapKey,
  LeafletModuleKey,
  LeafletSelectionKey,
  LeafletStylesKey,
  type LeafletFeatureHandleStyle,
  type FeatureReference,
} from ".";

import "./leaflet-editing.css";

const { checkIn } = useCheckIn<FeatureReference>();
const { LatDegreesMeters, lngDegreesToRadius } = await useLeaflet();

export interface LeafletCanvasStyles {
  corner: LeafletFeatureHandleStyle;
}

export interface LeafletCanvasProps {
  id?: string | number;
  corners?: Array<{ lat: number; lng: number }>;
  width?: number;
  height?: number;
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  subdivisions?: number;
  opacity?: number;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletCanvasProps>(), {
  corners: () => [
    { lat: 48.86, lng: 2.35 },
    { lat: 48.86, lng: 2.36 },
    { lat: 48.85, lng: 2.36 },
    { lat: 48.85, lng: 2.35 },
  ],
  width: 400,
  height: 300,
  editable: false,
  draggable: false,
  selectable: false,
  subdivisions: 20,
  opacity: 1,
});

const emit = defineEmits<{
  "update:corners": [corners: Array<{ lat: number; lng: number }>];
  "canvas-ready": [canvas: HTMLCanvasElement];
  click: [];
  dragstart: [];
}>();

const { getLeafletShapeColors } = useCssParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const stylesOptions = ref<LeafletCanvasStyles>({
  corner: {
    className: "leaflet-feature-handle leaflet-handle-corner-canvas",
    html: '<div style="background:#3388ff;border:2px solid #fff;"></div>',
    iconSize: [10, 10],
  },
});

provide(LeafletStylesKey, stylesOptions);

const canvasLayer = ref<HTMLCanvasElement | null>(null);
const sourceCanvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const canvasId = ref<string | number>(
  props.id ?? `canvas-${Date.now()}-${Math.random()}`,
);
const isDragging = ref(false);

const { desk } = selectionContext
  ? checkIn("leafletFeatures", {
      autoCheckIn: props.selectable,
      id: canvasId.value,
      data: () => ({
        id: canvasId.value,
        type: "polygon" as const,
        getBounds: () => {
          if (!L.value) return null;
          const latlngs = props.corners.map((c) =>
            L.value!.latLng(c.lat, c.lng),
          );
          return L.value!.latLngBounds(latlngs);
        },
        getInitialData: () => {
          return props.corners.map((c) => [c.lat, c.lng] as [number, number]);
        },
        applyTransform: (bounds: L.LatLngBounds) => {
          if (!L.value) return;

          const currentBounds = L.value.latLngBounds(
            props.corners.map((c) => L.value!.latLng(c.lat, c.lng)),
          );
          const currentCenter = currentBounds.getCenter();
          const newCenter = bounds.getCenter();

          const scaleX =
            (bounds.getEast() - bounds.getWest()) /
            (currentBounds.getEast() - currentBounds.getWest());
          const scaleY =
            (bounds.getNorth() - bounds.getSouth()) /
            (currentBounds.getNorth() - currentBounds.getSouth());

          const newCorners = props.corners.map((corner) => {
            const relativeX = (corner.lng - currentCenter.lng) * scaleX;
            const relativeY = (corner.lat - currentCenter.lat) * scaleY;
            return {
              lat: newCenter.lat + relativeY,
              lng: newCenter.lng + relativeX,
            };
          });

          emit("update:corners", newCorners);
        },
        applyRotation: (
          angle: number,
          center: { lat: number; lng: number },
          initialData: any,
        ) => {
          if (!L.value || !initialData) return;

          const initialCorners = initialData as Array<[number, number]>;
          const angleRad = (-angle * Math.PI) / 180;

          const metersPerDegreeLat = LatDegreesMeters;
          const metersPerDegreeLng = lngDegreesToRadius(1, center.lat);

          const newCorners = initialCorners.map((corner) => {
            const lat = corner[0];
            const lng = corner[1];

            const relMetersY = (lat - center.lat) * metersPerDegreeLat;
            const relMetersX = (lng - center.lng) * metersPerDegreeLng;

            const newRelMetersY =
              relMetersY * Math.cos(angleRad) - relMetersX * Math.sin(angleRad);
            const newRelMetersX =
              relMetersY * Math.sin(angleRad) + relMetersX * Math.cos(angleRad);

            return {
              lat: center.lat + newRelMetersY / metersPerDegreeLat,
              lng: center.lng + newRelMetersX / metersPerDegreeLng,
            };
          });

          emit("update:corners", newCorners);
        },
      }),
      watchData: true,
    })
  : { desk: ref(null) };

let dragStartCorners: Array<{ lat: number; lng: number }> = [];
let dragStartMousePoint: L.Point | null = null;

const isPointInPolygon = (
  point: { x: number; y: number },
  polygon: Array<{ x: number; y: number }>,
) => {
  if (polygon.length < 3) {
    return false;
  }

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];
    if (!pi || !pj) continue;

    const intersects =
      pi.y > point.y !== pj.y > point.y &&
      point.x <
        ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y || 1e-6) + pi.x;

    if (intersects) inside = !inside;
  }

  return inside;
};

const createSourceCanvas = () => {
  if (sourceCanvas.value) return sourceCanvas.value;

  sourceCanvas.value = document.createElement("canvas");
  sourceCanvas.value.width = props.width;
  sourceCanvas.value.height = props.height;

  emit("canvas-ready", sourceCanvas.value);
  return sourceCanvas.value;
};

const clearEditMarkers = () => {
  editMarkers.value.forEach((marker) => marker.remove());
  editMarkers.value = [];
};

const enableEditing = () => {
  if (!L.value || !map.value) return;

  clearEditMarkers();

  props.corners.forEach((corner, index) => {
    const marker = L.value!.marker([corner.lat, corner.lng], {
      draggable: true,
      icon: L.value!.divIcon(stylesOptions.value.corner),
    }).addTo(map.value!);

    const onMarkerDrag = () => {
      const newCorners = [...props.corners];
      const newPos = marker.getLatLng();
      newCorners[index] = { lat: newPos.lat, lng: newPos.lng };
      emit("update:corners", newCorners);

      if (selectionContext) {
        selectionContext.notifyFeatureUpdate(canvasId.value);
      }
    };

    const onMarkerDragEnd = () => {
      const newCorners = [...props.corners];
      const newPos = marker.getLatLng();
      newCorners[index] = { lat: newPos.lat, lng: newPos.lng };
      emit("update:corners", newCorners);
    };

    marker.on("drag", onMarkerDrag);
    marker.on("dragend", onMarkerDragEnd);

    editMarkers.value.push(marker);
  });
};

let mouseDownHandler: ((e: MouseEvent) => void) | null = null;
let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;

const enableDragging = () => {
  if (!canvasLayer.value || !map.value || !L.value) return;

  if (mouseDownHandler) {
    canvasLayer.value.removeEventListener("mousedown", mouseDownHandler);
  }
  if (mouseMoveHandler) {
    canvasLayer.value.removeEventListener("mousemove", mouseMoveHandler);
  }

  mouseMoveHandler = (e: MouseEvent) => {
    if (!map.value || !L.value || isDragging.value) return;

    const containerPoint = map.value.mouseEventToContainerPoint(e as any);
    const corners = props.corners.map((corner) => {
      const point = map.value!.latLngToContainerPoint([corner.lat, corner.lng]);
      return { x: point.x, y: point.y };
    });

    if (
      isPointInPolygon({ x: containerPoint.x, y: containerPoint.y }, corners)
    ) {
      map.value.getContainer().style.cursor = "pointer";
    } else {
      map.value.getContainer().style.cursor = "";
    }
  };

  mouseDownHandler = (e: MouseEvent) => {
    if (!map.value || !L.value) return;

    const containerPoint = map.value.mouseEventToContainerPoint(e as any);
    const corners = props.corners.map((corner) => {
      const point = map.value!.latLngToContainerPoint([corner.lat, corner.lng]);
      return { x: point.x, y: point.y };
    });

    if (
      !isPointInPolygon({ x: containerPoint.x, y: containerPoint.y }, corners)
    ) {
      return;
    }

    L.value.DomEvent.stopPropagation(e as any);

    if (props.selectable && selectionContext) {
      selectionContext.selectFeature("polygon", canvasId.value);
    }

    isDragging.value = true;

    emit("dragstart");

    dragStartCorners = JSON.parse(JSON.stringify(props.corners));
    dragStartMousePoint = L.value.point(e.clientX, e.clientY);

    setupMapDragHandlers();

    if (map.value) {
      map.value.getContainer().style.cursor = "move";
      map.value.dragging.disable();
    }
  };

  canvasLayer.value.addEventListener("mousedown", mouseDownHandler);
  canvasLayer.value.addEventListener("mousemove", mouseMoveHandler);
};

const disableDragging = () => {
  if (!canvasLayer.value) return;

  if (mouseDownHandler) {
    canvasLayer.value.removeEventListener("mousedown", mouseDownHandler);
    mouseDownHandler = null;
  }

  if (mouseMoveHandler) {
    canvasLayer.value.removeEventListener("mousemove", mouseMoveHandler);
    mouseMoveHandler = null;
  }
};

const setupMapDragHandlers = () => {
  if (!map.value || !L.value) return;

  const onMouseMove = (e: L.LeafletMouseEvent) => {
    if (!isDragging.value || !dragStartMousePoint || !map.value || !L.value)
      return;

    const currentPoint = L.value.point(
      e.originalEvent.clientX,
      e.originalEvent.clientY,
    );
    const deltaX = currentPoint.x - dragStartMousePoint.x;
    const deltaY = currentPoint.y - dragStartMousePoint.y;

    const newCorners = dragStartCorners.map((corner) => {
      const startPoint = map.value!.latLngToContainerPoint([
        corner.lat,
        corner.lng,
      ]);
      const newPoint = L.value!.point(
        startPoint.x + deltaX,
        startPoint.y + deltaY,
      );
      const newLatLng = map.value!.containerPointToLatLng(newPoint);
      return { lat: newLatLng.lat, lng: newLatLng.lng };
    });

    emit("update:corners", newCorners);

    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(canvasId.value);
    }
  };

  const onMouseUp = () => {
    if (!isDragging.value) return;

    isDragging.value = false;

    if (map.value) {
      map.value.getContainer().style.cursor = "";
      map.value.dragging.enable();
      map.value.off("mousemove", onMouseMove as any);
      map.value.off("mouseup", onMouseUp);
    }

    emit("update:corners", [...props.corners]);
  };

  map.value.on("mousemove", onMouseMove as any);
  map.value.on("mouseup", onMouseUp);
};

const bilinearInterp = (
  corners: Array<{ x: number; y: number }>,
  u: number,
  v: number,
) => {
  if (!corners[0] || !corners[1] || !corners[2] || !corners[3]) {
    return { x: 0, y: 0 };
  }

  const x =
    (1 - u) * (1 - v) * corners[0].x +
    u * (1 - v) * corners[1].x +
    u * v * corners[2].x +
    (1 - u) * v * corners[3].x;

  const y =
    (1 - u) * (1 - v) * corners[0].y +
    u * (1 - v) * corners[1].y +
    u * v * corners[2].y +
    (1 - u) * v * corners[3].y;

  return { x, y };
};

const getAffineTransform = (
  src: Array<{ x: number; y: number }>,
  dst: Array<{ x: number; y: number }>,
) => {
  if (!src[0] || !src[1] || !src[2] || !dst[0] || !dst[1] || !dst[2]) {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  }

  const x0 = src[0].x,
    y0 = src[0].y;
  const x1 = src[1].x,
    y1 = src[1].y;
  const x2 = src[2].x,
    y2 = src[2].y;

  const u0 = dst[0].x,
    v0 = dst[0].y;
  const u1 = dst[1].x,
    v1 = dst[1].y;
  const u2 = dst[2].x,
    v2 = dst[2].y;

  const delta = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);

  const a = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) / delta;
  const b = ((u2 - u0) * (x1 - x0) - (u1 - u0) * (x2 - x0)) / delta;
  const c = ((v1 - v0) * (y2 - y0) - (v2 - v0) * (y1 - y0)) / delta;
  const d = ((v2 - v0) * (x1 - x0) - (v1 - v0) * (x2 - x0)) / delta;
  const e = u0 - (a * x0 + b * y0);
  const f = v0 - (c * x0 + d * y0);

  return { a, b, c, d, e, f };
};

const drawTriangle = (
  src: Array<{ x: number; y: number }>,
  dst: Array<{ x: number; y: number }>,
) => {
  if (!ctx.value || !sourceCanvas.value || !dst[0] || !dst[1] || !dst[2])
    return;

  const transform = getAffineTransform(src, dst);

  ctx.value.save();
  ctx.value.beginPath();
  ctx.value.moveTo(dst[0].x, dst[0].y);
  ctx.value.lineTo(dst[1].x, dst[1].y);
  ctx.value.lineTo(dst[2].x, dst[2].y);
  ctx.value.closePath();
  ctx.value.clip();

  ctx.value.transform(
    transform.a,
    transform.c,
    transform.b,
    transform.d,
    transform.e,
    transform.f,
  );

  ctx.value.drawImage(sourceCanvas.value, 0, 0);
  ctx.value.restore();
};

const drawWarpedGrid = (corners: Array<{ x: number; y: number }>) => {
  if (!ctx.value || !sourceCanvas.value || !canvasLayer.value) return;

  const subs = props.subdivisions;
  const sw = sourceCanvas.value.width;
  const sh = sourceCanvas.value.height;

  ctx.value.clearRect(0, 0, canvasLayer.value.width, canvasLayer.value.height);

  ctx.value.globalAlpha = props.opacity;

  for (let i = 0; i < subs; i++) {
    for (let j = 0; j < subs; j++) {
      const u0 = i / subs,
        v0 = j / subs;
      const u1 = (i + 1) / subs,
        v1 = (j + 1) / subs;

      const srcQuad = [
        { x: u0 * sw, y: v0 * sh },
        { x: u1 * sw, y: v0 * sh },
        { x: u1 * sw, y: v1 * sh },
        { x: u0 * sw, y: v1 * sh },
      ];

      const dstQuad = [
        bilinearInterp(corners, u0, v0),
        bilinearInterp(corners, u1, v0),
        bilinearInterp(corners, u1, v1),
        bilinearInterp(corners, u0, v1),
      ];

      if (
        srcQuad[0] &&
        srcQuad[1] &&
        srcQuad[2] &&
        dstQuad[0] &&
        dstQuad[1] &&
        dstQuad[2]
      ) {
        drawTriangle(
          [srcQuad[0], srcQuad[1], srcQuad[2]],
          [dstQuad[0], dstQuad[1], dstQuad[2]],
        );
      }
      if (
        srcQuad[0] &&
        srcQuad[2] &&
        srcQuad[3] &&
        dstQuad[0] &&
        dstQuad[2] &&
        dstQuad[3]
      ) {
        drawTriangle(
          [srcQuad[0], srcQuad[2], srcQuad[3]],
          [dstQuad[0], dstQuad[2], dstQuad[3]],
        );
      }
    }
  }

  ctx.value.globalAlpha = 1;
};

const drawOutline = (corners: Array<{ x: number; y: number }>) => {
  if (!ctx.value) return;

  const colors = getLeafletShapeColors(props.class);

  ctx.value.beginPath();

  if (corners[0]) {
    ctx.value.moveTo(corners[0].x, corners[0].y);
  }
  if (corners[1]) {
    ctx.value.lineTo(corners[1].x, corners[1].y);
  }
  if (corners[2]) {
    ctx.value.lineTo(corners[2].x, corners[2].y);
  }
  if (corners[3]) {
    ctx.value.lineTo(corners[3].x, corners[3].y);
  }

  ctx.value.closePath();

  ctx.value.strokeStyle = colors.color || "#3388ff";
  ctx.value.lineWidth = colors.weight || 2;
  ctx.value.stroke();
};

const reset = () => {
  if (!canvasLayer.value || !map.value) return;

  const topLeft = map.value.containerPointToLayerPoint([0, 0]);
  canvasLayer.value.style.transform = `translate(${topLeft.x}px, ${topLeft.y}px)`;

  draw();
};

const draw = () => {
  if (!map.value || !ctx.value || !sourceCanvas.value) return;

  const corners = props.corners.map((corner) => {
    const point = map.value!.latLngToContainerPoint([corner.lat, corner.lng]);
    return { x: point.x, y: point.y };
  });

  drawWarpedGrid(corners);

  if (props.editable || props.draggable) {
    drawOutline(corners);
  }
};

let isUpdating = false;

watch(
  () =>
    [
      L.value,
      map.value,
      props.corners,
      props.editable,
      props.draggable,
      props.selectable,
    ] as const,
  async (
    [newL, newMap, newCorners, newEditable, newDraggable, newSelectable],
    oldVal,
  ) => {
    if (isUpdating) return;
    isUpdating = true;

    try {
      await nextTick();

      if (newL && newMap && newCorners && newCorners.length === 4) {
        createSourceCanvas();

        const isInitialCreation = !canvasLayer.value;

        if (canvasLayer.value) {
          draw();
        } else {
          canvasLayer.value = document.createElement("canvas");
          const size = newMap.getSize();
          canvasLayer.value.width = size.x;
          canvasLayer.value.height = size.y;
          canvasLayer.value.style.position = "absolute";
          canvasLayer.value.style.pointerEvents = "auto";
          canvasLayer.value.className = "leaflet-canvas-layer";

          ctx.value = canvasLayer.value.getContext("2d");

          const leafletPane = newMap.getPanes().overlayPane;
          leafletPane.appendChild(canvasLayer.value);

          newMap.on("move", reset);
          newMap.on("moveend", reset);
          newMap.on("zoom", reset);
          newMap.on("viewreset", reset);

          reset();
        }

        if (
          isInitialCreation ||
          (oldVal && (oldVal[3] !== newEditable || oldVal[4] !== newDraggable))
        ) {
          if (newDraggable && !newEditable) {
            clearEditMarkers();
            enableDragging();
          } else if (newEditable && !newDraggable) {
            disableDragging();
            enableEditing();
          } else {
            clearEditMarkers();
            disableDragging();
          }
        }
      } else {
        if (canvasLayer.value) {
          canvasLayer.value.remove();
          canvasLayer.value = null;
        }
        clearEditMarkers();
      }
    } finally {
      isUpdating = false;
    }
  },
  { immediate: true, deep: true, flush: "post" },
);

onBeforeUnmount(() => {
  clearEditMarkers();

  if (canvasLayer.value) {
    canvasLayer.value.remove();
  }

  if (map.value) {
    map.value.off("move", reset);
    map.value.off("moveend", reset);
    map.value.off("zoom", reset);
    map.value.off("viewreset", reset);
  }
});

defineExpose({
  sourceCanvas,
  redraw: () => {
    if (canvasLayer.value && sourceCanvas.value) {
      draw();
    }
  },
});
</script>

<template>
  <slot />
</template>
```

```vue [src/components/ui/leaflet-map/LeafletCanvasGL.vue]
<script setup lang="ts">
import {
  inject,
  watch,
  ref,
  type Ref,
  nextTick,
  onBeforeUnmount,
  type HTMLAttributes,
  provide,
} from "vue";
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { useColors } from "~~/registry/new-york/composables/use-colors/useColors";
import { useLeaflet } from "~~/registry/new-york/composables/use-leaflet/useLeaflet";
import { useCheckIn } from "~~/registry/new-york/composables/use-check-in/useCheckIn";
import {
  LeafletMapKey,
  LeafletModuleKey,
  LeafletSelectionKey,
  LeafletStylesKey,
  type LeafletCanvasStyles,
  type FeatureReference,
} from ".";

import "./leaflet-editing.css";

const { checkIn } = useCheckIn<FeatureReference>();

const { LatDegreesMeters, lngDegreesToRadius } = await useLeaflet();

export interface LeafletCanvasGLProps {
  id?: string | number;
  corners?: Array<{ lat: number; lng: number }>;
  width?: number;
  height?: number;
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  subdivisions?: number;
  opacity?: number;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletCanvasGLProps>(), {
  corners: () => [
    { lat: 48.86, lng: 2.35 },
    { lat: 48.86, lng: 2.36 },
    { lat: 48.85, lng: 2.36 },
    { lat: 48.85, lng: 2.35 },
  ],
  width: 400,
  height: 300,
  editable: false,
  draggable: false,
  selectable: false,
  subdivisions: 20,
  opacity: 1,
});

const emit = defineEmits<{
  "update:corners": [corners: Array<{ lat: number; lng: number }>];
  "canvas-ready": [canvas: HTMLCanvasElement];
  click: [];
  dragstart: [];
}>();

const { getLeafletShapeColors } = useCssParser();
const { parseColor: parseColorUtil } = useColors();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const stylesOptions = ref<LeafletCanvasStyles>({
  corner: {
    className: "leaflet-feature-handle leaflet-handle-corner-canvas",
    html: '<div style="background:#3388ff;border:2px solid #fff;"></div>',
    iconSize: [10, 10],
  },
});

provide(LeafletStylesKey, stylesOptions);

const canvasLayer = ref<HTMLCanvasElement | null>(null);
const sourceCanvas = ref<HTMLCanvasElement | null>(null);
const gl = ref<WebGLRenderingContext | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const canvasId = ref<string | number>(
  props.id ?? `canvas-${Date.now()}-${Math.random()}`,
);
const isDragging = ref(false);

const { desk } = selectionContext
  ? checkIn("leafletFeatures", {
      autoCheckIn: props.selectable,
      id: canvasId.value,
      data: () => ({
        id: canvasId.value,
        type: "polygon" as const,
        getBounds: () => {
          if (!L.value) return null;
          const latlngs = props.corners.map((c) =>
            L.value!.latLng(c.lat, c.lng),
          );
          return L.value!.latLngBounds(latlngs);
        },
        getInitialData: () => {
          return props.corners.map((c) => [c.lat, c.lng] as [number, number]);
        },
        applyTransform: (bounds: L.LatLngBounds) => {
          if (!L.value) return;

          const currentBounds = L.value.latLngBounds(
            props.corners.map((c) => L.value!.latLng(c.lat, c.lng)),
          );
          const currentCenter = currentBounds.getCenter();
          const newCenter = bounds.getCenter();

          const scaleX =
            (bounds.getEast() - bounds.getWest()) /
            (currentBounds.getEast() - currentBounds.getWest());
          const scaleY =
            (bounds.getNorth() - bounds.getSouth()) /
            (currentBounds.getNorth() - currentBounds.getSouth());

          const newCorners = props.corners.map((corner) => {
            const relativeX = (corner.lng - currentCenter.lng) * scaleX;
            const relativeY = (corner.lat - currentCenter.lat) * scaleY;
            return {
              lat: newCenter.lat + relativeY,
              lng: newCenter.lng + relativeX,
            };
          });

          emit("update:corners", newCorners);
        },
        applyRotation: (
          angle: number,
          center: { lat: number; lng: number },
          initialData: any,
        ) => {
          if (!L.value || !initialData) return;

          const initialCorners = initialData as Array<[number, number]>;
          const angleRad = (-angle * Math.PI) / 180;

          const metersPerDegreeLat = LatDegreesMeters;
          const metersPerDegreeLng = lngDegreesToRadius(1, center.lat);

          const newCorners = initialCorners.map((corner) => {
            const lat = corner[0];
            const lng = corner[1];

            const relMetersY = (lat - center.lat) * metersPerDegreeLat;
            const relMetersX = (lng - center.lng) * metersPerDegreeLng;

            const newRelMetersY =
              relMetersY * Math.cos(angleRad) - relMetersX * Math.sin(angleRad);
            const newRelMetersX =
              relMetersY * Math.sin(angleRad) + relMetersX * Math.cos(angleRad);

            return {
              lat: center.lat + newRelMetersY / metersPerDegreeLat,
              lng: center.lng + newRelMetersX / metersPerDegreeLng,
            };
          });

          emit("update:corners", newCorners);
        },
      }),
      watchData: true,
    })
  : { desk: ref(null) };

let dragStartCorners: Array<{ lat: number; lng: number }> = [];
let dragStartMousePoint: L.Point | null = null;
let texture: WebGLTexture | null = null;
let program: WebGLProgram | null = null;
let positionBuffer: WebGLBuffer | null = null;
let texCoordBuffer: WebGLBuffer | null = null;

const isPointInPolygon = (
  point: { x: number; y: number },
  polygon: Array<{ x: number; y: number }>,
) => {
  if (polygon.length < 3) {
    return false;
  }

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];
    if (!pi || !pj) continue;

    const intersects =
      pi.y > point.y !== pj.y > point.y &&
      point.x <
        ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y || 1e-6) + pi.x;

    if (intersects) inside = !inside;
  }

  return inside;
};

const createSourceCanvas = () => {
  if (sourceCanvas.value) return sourceCanvas.value;

  sourceCanvas.value = document.createElement("canvas");
  sourceCanvas.value.width = props.width;
  sourceCanvas.value.height = props.height;

  emit("canvas-ready", sourceCanvas.value);
  return sourceCanvas.value;
};

const clearEditMarkers = () => {
  editMarkers.value.forEach((marker) => marker.remove());
  editMarkers.value = [];
};

const enableEditing = () => {
  if (!L.value || !map.value) return;

  clearEditMarkers();

  props.corners.forEach((corner, index) => {
    const marker = L.value!.marker([corner.lat, corner.lng], {
      draggable: true,
      icon: L.value!.divIcon(stylesOptions.value.corner),
    }).addTo(map.value!);

    const onMarkerDrag = () => {
      const newCorners = [...props.corners];
      const newPos = marker.getLatLng();
      newCorners[index] = { lat: newPos.lat, lng: newPos.lng };
      emit("update:corners", newCorners);

      if (selectionContext) {
        selectionContext.notifyFeatureUpdate(canvasId.value);
      }
    };

    const onMarkerDragEnd = () => {
      const newCorners = [...props.corners];
      const newPos = marker.getLatLng();
      newCorners[index] = { lat: newPos.lat, lng: newPos.lng };
      emit("update:corners", newCorners);
    };

    marker.on("drag", onMarkerDrag);
    marker.on("dragend", onMarkerDragEnd);

    editMarkers.value.push(marker);
  });
};

let mouseDownHandler: ((e: MouseEvent) => void) | null = null;
let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;

const enableDragging = () => {
  if (!canvasLayer.value || !map.value || !L.value) return;

  if (mouseDownHandler) {
    canvasLayer.value.removeEventListener("mousedown", mouseDownHandler);
  }
  if (mouseMoveHandler) {
    canvasLayer.value.removeEventListener("mousemove", mouseMoveHandler);
  }

  mouseMoveHandler = (e: MouseEvent) => {
    if (!map.value || !L.value || isDragging.value) return;

    const containerPoint = map.value.mouseEventToContainerPoint(e as any);
    const corners = props.corners.map((corner) => {
      const point = map.value!.latLngToContainerPoint([corner.lat, corner.lng]);
      return { x: point.x, y: point.y };
    });

    if (
      isPointInPolygon({ x: containerPoint.x, y: containerPoint.y }, corners)
    ) {
      map.value.getContainer().style.cursor = "pointer";
    } else {
      map.value.getContainer().style.cursor = "";
    }
  };

  mouseDownHandler = (e: MouseEvent) => {
    if (!map.value || !L.value) return;

    const containerPoint = map.value.mouseEventToContainerPoint(e as any);
    const corners = props.corners.map((corner) => {
      const point = map.value!.latLngToContainerPoint([corner.lat, corner.lng]);
      return { x: point.x, y: point.y };
    });

    if (
      !isPointInPolygon({ x: containerPoint.x, y: containerPoint.y }, corners)
    ) {
      return;
    }

    L.value.DomEvent.stopPropagation(e as any);

    if (props.selectable && selectionContext) {
      selectionContext.selectFeature("polygon", canvasId.value);
    }

    isDragging.value = true;

    emit("dragstart");

    dragStartCorners = JSON.parse(JSON.stringify(props.corners));
    dragStartMousePoint = L.value.point(e.clientX, e.clientY);

    setupMapDragHandlers();

    if (map.value) {
      map.value.getContainer().style.cursor = "pointer";
      map.value.dragging.disable();
    }
  };

  canvasLayer.value.addEventListener("mousedown", mouseDownHandler);
  canvasLayer.value.addEventListener("mousemove", mouseMoveHandler);
};

const disableDragging = () => {
  if (!canvasLayer.value) return;

  if (mouseDownHandler) {
    canvasLayer.value.removeEventListener("mousedown", mouseDownHandler);
    mouseDownHandler = null;
  }

  if (mouseMoveHandler) {
    canvasLayer.value.removeEventListener("mousemove", mouseMoveHandler);
    mouseMoveHandler = null;
  }
};

const setupMapDragHandlers = () => {
  if (!map.value || !L.value) return;

  const onMouseMove = (e: L.LeafletMouseEvent) => {
    if (!isDragging.value || !dragStartMousePoint || !map.value || !L.value)
      return;

    const currentPoint = L.value.point(
      e.originalEvent.clientX,
      e.originalEvent.clientY,
    );
    const deltaX = currentPoint.x - dragStartMousePoint.x;
    const deltaY = currentPoint.y - dragStartMousePoint.y;

    const newCorners = dragStartCorners.map((corner) => {
      const startPoint = map.value!.latLngToContainerPoint([
        corner.lat,
        corner.lng,
      ]);
      const newPoint = L.value!.point(
        startPoint.x + deltaX,
        startPoint.y + deltaY,
      );
      const newLatLng = map.value!.containerPointToLatLng(newPoint);
      return { lat: newLatLng.lat, lng: newLatLng.lng };
    });

    emit("update:corners", newCorners);

    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(canvasId.value);
    }
  };

  const onMouseUp = () => {
    if (!isDragging.value) return;

    isDragging.value = false;

    if (map.value) {
      map.value.getContainer().style.cursor = "pointer";
      map.value.dragging.enable();
      map.value.off("mousemove", onMouseMove as any);
      map.value.off("mouseup", onMouseUp);
    }

    emit("update:corners", [...props.corners]);
  };

  map.value.on("mousemove", onMouseMove as any);
  map.value.on("mouseup", onMouseUp);
};

const bilinearInterp = (
  corners: Array<{ x: number; y: number }>,
  u: number,
  v: number,
) => {
  if (!corners[0] || !corners[1] || !corners[2] || !corners[3]) {
    return { x: 0, y: 0 };
  }

  const x =
    (1 - u) * (1 - v) * corners[0].x +
    u * (1 - v) * corners[1].x +
    u * v * corners[2].x +
    (1 - u) * v * corners[3].x;

  const y =
    (1 - u) * (1 - v) * corners[0].y +
    u * (1 - v) * corners[1].y +
    u * v * corners[2].y +
    (1 - u) * v * corners[3].y;

  return { x, y };
};

const initWebGL = () => {
  if (!canvasLayer.value) return false;

  gl.value = canvasLayer.value.getContext("webgl", {
    premultipliedAlpha: false,
    alpha: true,
  });

  if (!gl.value) {
    console.error("WebGL not supported");
    return false;
  }

  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform vec2 u_resolution;
    
    void main() {
      vec2 clipSpace = ((a_position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
      gl_Position = vec4(clipSpace, 0, 1);
      v_texCoord = a_texCoord;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform float u_opacity;
    
    void main() {
      vec4 texColor = texture2D(u_texture, v_texCoord);
      gl_FragColor = vec4(texColor.rgb, texColor.a * u_opacity);
    }
  `;

  const vertexShader = gl.value.createShader(gl.value.VERTEX_SHADER)!;
  gl.value.shaderSource(vertexShader, vertexShaderSource);
  gl.value.compileShader(vertexShader);

  const fragmentShader = gl.value.createShader(gl.value.FRAGMENT_SHADER)!;
  gl.value.shaderSource(fragmentShader, fragmentShaderSource);
  gl.value.compileShader(fragmentShader);

  program = gl.value.createProgram()!;
  gl.value.attachShader(program, vertexShader);
  gl.value.attachShader(program, fragmentShader);
  gl.value.linkProgram(program);
  gl.value.useProgram(program);

  positionBuffer = gl.value.createBuffer();
  texCoordBuffer = gl.value.createBuffer();

  texture = gl.value.createTexture();
  gl.value.bindTexture(gl.value.TEXTURE_2D, texture);
  gl.value.texParameteri(
    gl.value.TEXTURE_2D,
    gl.value.TEXTURE_WRAP_S,
    gl.value.CLAMP_TO_EDGE,
  );
  gl.value.texParameteri(
    gl.value.TEXTURE_2D,
    gl.value.TEXTURE_WRAP_T,
    gl.value.CLAMP_TO_EDGE,
  );
  gl.value.texParameteri(
    gl.value.TEXTURE_2D,
    gl.value.TEXTURE_MIN_FILTER,
    gl.value.LINEAR,
  );
  gl.value.texParameteri(
    gl.value.TEXTURE_2D,
    gl.value.TEXTURE_MAG_FILTER,
    gl.value.LINEAR,
  );

  gl.value.enable(gl.value.BLEND);
  gl.value.blendFunc(gl.value.SRC_ALPHA, gl.value.ONE_MINUS_SRC_ALPHA);

  return true;
};

const updateTexture = () => {
  if (!gl.value || !texture || !sourceCanvas.value) return;

  gl.value.bindTexture(gl.value.TEXTURE_2D, texture);
  gl.value.texImage2D(
    gl.value.TEXTURE_2D,
    0,
    gl.value.RGBA,
    gl.value.RGBA,
    gl.value.UNSIGNED_BYTE,
    sourceCanvas.value,
  );
};

const drawWarpedGrid = (corners: Array<{ x: number; y: number }>) => {
  if (!gl.value || !program || !canvasLayer.value || !sourceCanvas.value)
    return;

  const subs = props.subdivisions;

  gl.value.viewport(0, 0, canvasLayer.value.width, canvasLayer.value.height);
  gl.value.clearColor(0, 0, 0, 0);
  gl.value.clear(gl.value.COLOR_BUFFER_BIT);

  updateTexture();

  const resolutionLocation = gl.value.getUniformLocation(
    program,
    "u_resolution",
  );
  gl.value.uniform2f(
    resolutionLocation,
    canvasLayer.value.width,
    canvasLayer.value.height,
  );

  const opacityLocation = gl.value.getUniformLocation(program, "u_opacity");
  gl.value.uniform1f(opacityLocation, props.opacity);

  const positions: number[] = [];
  const texCoords: number[] = [];

  for (let i = 0; i < subs; i++) {
    for (let j = 0; j < subs; j++) {
      const u0 = i / subs;
      const v0 = j / subs;
      const u1 = (i + 1) / subs;
      const v1 = (j + 1) / subs;

      const p0 = bilinearInterp(corners, u0, v0);
      const p1 = bilinearInterp(corners, u1, v0);
      const p2 = bilinearInterp(corners, u1, v1);
      const p3 = bilinearInterp(corners, u0, v1);

      positions.push(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
      texCoords.push(u0, v0, u1, v0, u1, v1);

      positions.push(p0.x, p0.y, p2.x, p2.y, p3.x, p3.y);
      texCoords.push(u0, v0, u1, v1, u0, v1);
    }
  }

  const positionLocation = gl.value.getAttribLocation(program, "a_position");
  gl.value.bindBuffer(gl.value.ARRAY_BUFFER, positionBuffer);
  gl.value.bufferData(
    gl.value.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.value.STATIC_DRAW,
  );
  gl.value.enableVertexAttribArray(positionLocation);
  gl.value.vertexAttribPointer(
    positionLocation,
    2,
    gl.value.FLOAT,
    false,
    0,
    0,
  );

  const texCoordLocation = gl.value.getAttribLocation(program, "a_texCoord");
  gl.value.bindBuffer(gl.value.ARRAY_BUFFER, texCoordBuffer);
  gl.value.bufferData(
    gl.value.ARRAY_BUFFER,
    new Float32Array(texCoords),
    gl.value.STATIC_DRAW,
  );
  gl.value.enableVertexAttribArray(texCoordLocation);
  gl.value.vertexAttribPointer(
    texCoordLocation,
    2,
    gl.value.FLOAT,
    false,
    0,
    0,
  );

  gl.value.drawArrays(gl.value.TRIANGLES, 0, positions.length / 2);
};

const drawOutline = (corners: Array<{ x: number; y: number }>) => {
  if (!gl.value || !canvasLayer.value || !program) return;

  const colors = getLeafletShapeColors(props.class);

  const rgb = parseColorUtil(colors.color || "#3388ff");

  const lineVertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    
    void main() {
      vec2 clipSpace = ((a_position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
      gl_Position = vec4(clipSpace, 0, 1);
    }
  `;

  const lineFragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    
    void main() {
      gl_FragColor = u_color;
    }
  `;

  const lineVertexShader = gl.value.createShader(gl.value.VERTEX_SHADER)!;
  gl.value.shaderSource(lineVertexShader, lineVertexShaderSource);
  gl.value.compileShader(lineVertexShader);

  const lineFragmentShader = gl.value.createShader(gl.value.FRAGMENT_SHADER)!;
  gl.value.shaderSource(lineFragmentShader, lineFragmentShaderSource);
  gl.value.compileShader(lineFragmentShader);

  const lineProgram = gl.value.createProgram()!;
  gl.value.attachShader(lineProgram, lineVertexShader);
  gl.value.attachShader(lineProgram, lineFragmentShader);
  gl.value.linkProgram(lineProgram);
  gl.value.useProgram(lineProgram);

  const lineWidth = colors.weight || 2;
  const linePositions: number[] = [];

  const addThickLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    width: number,
  ) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;
    const hw = width / 2;

    linePositions.push(
      x1 + nx * hw,
      y1 + ny * hw,
      x1 - nx * hw,
      y1 - ny * hw,
      x2 - nx * hw,
      y2 - ny * hw,
    );

    linePositions.push(
      x1 + nx * hw,
      y1 + ny * hw,
      x2 - nx * hw,
      y2 - ny * hw,
      x2 + nx * hw,
      y2 + ny * hw,
    );
  };

  for (let i = 0; i < corners.length; i++) {
    const current = corners[i];
    const next = corners[(i + 1) % corners.length];
    if (current && next) {
      addThickLine(current.x, current.y, next.x, next.y, lineWidth);
    }
  }

  const linePositionLocation = gl.value.getAttribLocation(
    lineProgram,
    "a_position",
  );
  const lineBuffer = gl.value.createBuffer();
  gl.value.bindBuffer(gl.value.ARRAY_BUFFER, lineBuffer);
  gl.value.bufferData(
    gl.value.ARRAY_BUFFER,
    new Float32Array(linePositions),
    gl.value.STATIC_DRAW,
  );
  gl.value.enableVertexAttribArray(linePositionLocation);
  gl.value.vertexAttribPointer(
    linePositionLocation,
    2,
    gl.value.FLOAT,
    false,
    0,
    0,
  );

  const lineResolutionLocation = gl.value.getUniformLocation(
    lineProgram,
    "u_resolution",
  );
  gl.value.uniform2f(
    lineResolutionLocation,
    canvasLayer.value.width,
    canvasLayer.value.height,
  );

  const lineColorLocation = gl.value.getUniformLocation(lineProgram, "u_color");
  gl.value.uniform4f(lineColorLocation, rgb.r, rgb.g, rgb.b, 1.0);

  gl.value.drawArrays(gl.value.TRIANGLES, 0, linePositions.length / 2);

  gl.value.deleteBuffer(lineBuffer);
  gl.value.deleteShader(lineVertexShader);
  gl.value.deleteShader(lineFragmentShader);
  gl.value.deleteProgram(lineProgram);

  gl.value.useProgram(program);
};

const reset = () => {
  if (!canvasLayer.value || !map.value) return;

  const topLeft = map.value.containerPointToLayerPoint([0, 0]);
  canvasLayer.value.style.transform = `translate(${topLeft.x}px, ${topLeft.y}px)`;

  draw();
};

const draw = () => {
  if (!map.value || !gl.value || !sourceCanvas.value) return;

  const corners = props.corners.map((corner) => {
    const point = map.value!.latLngToContainerPoint([corner.lat, corner.lng]);
    return { x: point.x, y: point.y };
  });

  drawWarpedGrid(corners);

  if (props.editable) {
    drawOutline(corners);
  }
};

let isUpdating = false;

watch(
  () =>
    [
      L.value,
      map.value,
      props.corners,
      props.editable,
      props.draggable,
      props.selectable,
    ] as const,
  async (
    [newL, newMap, newCorners, newEditable, newDraggable, newSelectable],
    oldVal,
  ) => {
    if (isUpdating) return;
    isUpdating = true;

    try {
      await nextTick();

      if (newL && newMap && newCorners && newCorners.length === 4) {
        createSourceCanvas();

        const isInitialCreation = !canvasLayer.value;

        if (canvasLayer.value) {
          draw();
        } else {
          canvasLayer.value = document.createElement("canvas");
          const size = newMap.getSize();
          canvasLayer.value.width = size.x;
          canvasLayer.value.height = size.y;
          canvasLayer.value.style.position = "absolute";
          canvasLayer.value.style.pointerEvents = "auto";
          canvasLayer.value.className = "leaflet-canvas-layer";

          if (!initWebGL()) {
            console.error("Failed to initialize WebGL");
            return;
          }

          const leafletPane = newMap.getPanes().overlayPane;
          leafletPane.appendChild(canvasLayer.value);

          newMap.on("move", reset);
          newMap.on("moveend", reset);
          newMap.on("zoom", reset);
          newMap.on("viewreset", reset);

          reset();
        }

        if (
          isInitialCreation ||
          (oldVal && (oldVal[3] !== newEditable || oldVal[4] !== newDraggable))
        ) {
          if (newDraggable && !newEditable) {
            clearEditMarkers();
            enableDragging();
          } else if (newEditable && !newDraggable) {
            disableDragging();
            enableEditing();
          } else {
            clearEditMarkers();
            disableDragging();
          }
        }
      } else {
        if (canvasLayer.value) {
          canvasLayer.value.remove();
          canvasLayer.value = null;
        }
        clearEditMarkers();
      }
    } finally {
      isUpdating = false;
    }
  },
  { immediate: true, deep: true, flush: "post" },
);

onBeforeUnmount(() => {
  clearEditMarkers();

  if (gl.value) {
    if (texture) {
      gl.value.deleteTexture(texture);
      texture = null;
    }
    if (program) {
      gl.value.deleteProgram(program);
      program = null;
    }
    if (positionBuffer) {
      gl.value.deleteBuffer(positionBuffer);
      positionBuffer = null;
    }
    if (texCoordBuffer) {
      gl.value.deleteBuffer(texCoordBuffer);
      texCoordBuffer = null;
    }
  }

  if (canvasLayer.value) {
    canvasLayer.value.remove();
  }

  if (map.value) {
    map.value.off("move", reset);
    map.value.off("moveend", reset);
    map.value.off("zoom", reset);
    map.value.off("viewreset", reset);
  }
});

defineExpose({
  sourceCanvas,
  redraw: () => {
    if (canvasLayer.value && sourceCanvas.value) {
      draw();
    }
  },
});
</script>

<template>
  <slot />
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
  type HTMLAttributes,
} from "vue";
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { useLeaflet } from "~~/registry/new-york/composables/use-leaflet/useLeaflet";
import { useCheckIn } from "~~/registry/new-york/composables/use-check-in/useCheckIn";
import {
  LeafletMapKey,
  LeafletModuleKey,
  LeafletSelectionKey,
  type FeatureReference,
} from ".";

import "./leaflet-editing.css";

const {
  LatDegreesMeters,
  calculateRadiusPoint,
  calculateCircleBounds,
  lngDegreesToRadius,
  setMapCursor,
  resetMapCursor,
  translatePointByPixels,
  createStyledMarker,
} = await useLeaflet();

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

const { checkIn } = useCheckIn<FeatureReference>();

const { desk: featureDesk } = selectionContext
  ? checkIn("leafletFeatures", {
      autoCheckIn: props.selectable,
      id: circleId.value,
      data: () => ({
        id: circleId.value,
        type: "circle" as const,
        getBounds: () => {
          if (!circle.value || !L.value) return null;
          const center = circle.value.getLatLng();
          const radius = circle.value.getRadius();
          const { southWest, northEast } = calculateCircleBounds(
            center,
            radius,
          );
          return L.value.latLngBounds(southWest, northEast);
        },
        applyTransform: (bounds: L.LatLngBounds) => {
          if (!circle.value) return;
          const center = bounds.getCenter();
          const latDiff = bounds.getNorth() - bounds.getSouth();
          const lngDiff = bounds.getEast() - bounds.getWest();
          const radiusLat = (latDiff / 2) * LatDegreesMeters;
          const radiusLng = lngDegreesToRadius(lngDiff / 2, center.lat);
          const radius = (radiusLat + radiusLng) / 2;
          circle.value.setLatLng(center);
          circle.value.setRadius(radius);
          emit("update:lat", center.lat);
          emit("update:lng", center.lng);
          emit("update:radius", radius);
        },
      }),
      watchData: true,
    })
  : { desk: ref(null) };

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
    setMapCursor(map.value, "move");

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

    const newLatLng = translatePointByPixels(
      dragStartLatLng,
      dx,
      dy,
      map.value,
    );
    if (!newLatLng) return;

    circle.value.setLatLng(newLatLng);

    emit("update:lat", newLatLng.lat);
    emit("update:lng", newLatLng.lng);

    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(circleId.value);
    }

    if (radiusMarker.value && props.editable) {
      const radius = circle.value.getRadius();
      const [lat, lng] = calculateRadiusPoint(newLatLng, radius);
      radiusMarker.value.setLatLng(L.value!.latLng(lat, lng));
    }
  };

  const onMouseUp = () => {
    if (!isDragging.value || !map.value || !circle.value) return;
    isDragging.value = false;
    const newLatLng = circle.value.getLatLng();
    emit("update:lat", newLatLng.lat);
    emit("update:lng", newLatLng.lng);
    map.value.dragging.enable();
    resetMapCursor(map.value);
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
    const [lat, lng] = calculateRadiusPoint(center, radius);
    const radiusLatLng = L.value.latLng(lat, lng);
    radiusMarker.value = createStyledMarker(
      radiusLatLng,
      {
        className: "leaflet-editing-icon",
        html: '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: [8, 8],
      },
      { draggable: true },
      map.value,
    );
    if (!radiusMarker.value) return;

    const onRadiusMarkerDrag = () => {
      const center = circle.value!.getLatLng();
      const radiusPoint = radiusMarker.value!.getLatLng();
      const newRadius = center.distanceTo(radiusPoint);
      circle.value!.setRadius(newRadius);
    };

    const onRadiusMarkerDragEnd = () => {
      const newRadius = circle.value!.getRadius();
      emit("update:radius", newRadius);
    };

    radiusMarker.value.on("drag", onRadiusMarkerDrag);
    radiusMarker.value.on("dragend", onRadiusMarkerDragEnd);
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
              const [lat, lng] = calculateRadiusPoint(center, radius);
              radiusMarker.value.setLatLng(L.value.latLng(lat, lng));
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

          const onCircleClick = () => {
            if (props.selectable && selectionContext) {
              selectionContext.selectFeature("circle", circleId.value);
            }
            emit("click");
          };

          const onCircleMouseDown = (e: any) => {
            if (props.draggable && props.selectable && selectionContext) {
              selectionContext.selectFeature("circle", circleId.value);
            }
          };

          circle.value.on("click", onCircleClick);
          if (props.selectable && selectionContext) {
            circle.value.on("mousedown", onCircleMouseDown);
          }

          setupMapDragHandlers();
        }

        if (circle.value) {
          const selectableChanged =
            oldVal && Boolean(oldVal[6]) !== Boolean(newVal[6]);
          if (selectableChanged) {
            circle.value.off("click");
            circle.value.off("mousedown");

            const onCircleClick = () => {
              if (props.selectable && selectionContext) {
                selectionContext.selectFeature("circle", circleId.value);
              }
              emit("click");
            };

            const onCircleMouseDown = (e: any) => {
              if (props.draggable && props.selectable && selectionContext) {
                selectionContext.selectFeature("circle", circleId.value);
              }
            };

            circle.value.on("click", onCircleClick);
            if (props.selectable && selectionContext) {
              circle.value.on("mousedown", onCircleMouseDown);
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
</script>

<template><slot /></template>
```

```vue [src/components/ui/leaflet-map/LeafletControlItem.vue]
<script setup lang="ts">
import {
  inject,
  unref,
  useTemplateRef,
  ref,
  computed,
  watch,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { useCheckIn } from "~~/registry/new-york/composables/use-check-in/useCheckIn";
import { LeafletControlsKey, type ControlItemReference } from ".";

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
console.log(
  "[LeafletControlItem] Controls context:",
  controlsContext ? "FOUND" : "NOT FOUND",
);

const { checkIn } = useCheckIn<ControlItemReference>();

let observer: MutationObserver | null = null;

const contentVersion = ref(0);

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

const { desk } = controlsContext
  ? checkIn("leafletControls", {
      autoCheckIn: true,
      id: props.name,
      data: () => {
        contentVersion.value;
        const html = getContentHtml();
        console.log(
          `[LeafletControlItem] Generating data for ${props.name}, html length:`,
          html.length,
        );
        return {
          name: props.name,
          title: props.title || "A control button",
          html: html || "",
          type: props.type,
          active: props.active,
        };
      },
      watchData: true,
      debug: false,
    })
  : { desk: ref(null) };

const isActive = computed(() => {
  if (!desk || props.type === "push") return false;

  const activeItemName = (desk as any).activeItem?.();
  return activeItemName === props.name || props.active;
});

watch(
  () => wrapperRef.value,
  (wrapper) => {
    if (!wrapper) return;

    nextTick(() => {
      observer = new MutationObserver((mutations) => {
        const hasContent = mutations.some((mutation) => {
          return (
            mutation.addedNodes.length > 0 || mutation.type === "attributes"
          );
        });

        if (hasContent && controlsContext) {
          contentVersion.value++;
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
  type ComputedRef,
  type HTMLAttributes,
  inject,
  watch,
  nextTick,
  type InjectionKey,
  computed,
} from "vue";
import type { ControlOptions } from "leaflet";
import {
  useCheckIn,
  type CheckInDesk,
} from "~~/registry/new-york/composables/use-check-in/useCheckIn";
import { cn } from "@/lib/utils";
import { LeafletControlsKey, LeafletMapKey, LeafletModuleKey } from ".";

export interface ControlItemReference {
  name: string;
  title: string;
  html: string;
  type?: "push" | "toggle";
  active?: boolean;
}

export interface LeafletControlsContext {}

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

const { createDesk } = useCheckIn<ControlItemReference>();
const { desk } = createDesk("leafletControls", {
  context: {
    activeItem: () => props.activeItem,
  },
  onCheckIn: (id, itemRef) => {
    console.log("[LeafletControls] Control item registered:", id, itemRef.name);
  },
  onCheckOut: (id) => {
    console.log("[LeafletControls] Control item unregistered:", id);
  },
  debug: false,
});

const controlsRegistry = computed(() => {
  const registry = new Map<string, ControlItemReference>();

  desk.registry.value.forEach((item) => {
    registry.set(item.data.name, item.data);
  });
  return registry;
});

const createButton = (container: HTMLElement, name: string, title: string) => {
  if (!L.value) return;

  const controlItem = controlsRegistry.value.get(name);
  if (!controlItem) {
    return;
  }

  const button = L.value!.DomUtil.create("a", "", container);
  button.href = "#";
  button.title = title;

  button.innerHTML = `<div class="flex items-center justify-center h-full">${controlItem.html}</div>`;
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

const updateButtonContent = () => {
  if (!control.value) return;

  const container = control.value.getContainer();
  if (!container) return;

  const buttons = container.querySelectorAll("a[data-tool-type]");
  buttons.forEach((button: Element) => {
    const htmlButton = button as HTMLElement;
    const toolType = htmlButton.dataset.toolType;
    if (toolType) {
      const controlItem = controlsRegistry.value.get(toolType);
      if (controlItem) {
        const wrappedHtml = `<div class="flex items-center justify-center h-full">${controlItem.html}</div>`;
        if (htmlButton.innerHTML !== wrappedHtml) {
          htmlButton.innerHTML = wrappedHtml;
        }
      }
    }
  });
};

const updateActiveButton = () => {
  if (!control.value) return;

  const container = control.value.getContainer();
  if (!container) return;

  const buttons = container.querySelectorAll("a[data-tool-type]");
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

  const allItemsHaveContent = Array.from(controlsRegistry.value.values()).every(
    (item) => item.html && item.html.trim().length > 0,
  );

  if (
    map.value &&
    props.enabled &&
    itemsCount > 0 &&
    !control.value &&
    allItemsHaveContent
  ) {
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

let previousItemCount = 0;
watch(
  controlsRegistry,
  (newRegistry) => {
    const currentItemCount = newRegistry.size;

    if (!control.value) {
      tryCreateControl();
      previousItemCount = currentItemCount;
      return;
    }

    if (currentItemCount !== previousItemCount) {
      if (control.value._map) {
        control.value.remove();
      }
      control.value = null;
      tryCreateControl();
      previousItemCount = currentItemCount;
    } else {
      updateButtonContent();
    }
  },
  { deep: true },
);

const context: LeafletControlsContext = {};

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

.leaflet-draw-toolbar-button-enabled {
  background-color: #e0e0e0 !important;
  background-image: linear-gradient(to bottom, #e0e0e0, #c0c0c0) !important;
}
</style>
```

```vue [src/components/ui/leaflet-map/LeafletFeatureHandle.vue]
<script setup lang="ts">
import { watch, inject, type HTMLAttributes, ref } from "vue";
import { cn } from "@/lib/utils";
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletStylesKey } from ".";

export type LeafletFeatureHandleRole = "corner" | "edge" | "center" | "rotate";

export interface LeafletFeatureHandleStyle {
  className: string;
  html: string;
  iconSize: [number, number];
}

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

const { fetchStylesFromElementClass, getTailwindBaseCssValues } =
  useCssParser();

const stylesOptions = inject(LeafletStylesKey, ref());

const tailwindToMarkerHtml = (className: string, size: number | string) => {
  const styles = fetchStylesFromElementClass((el: HTMLElement) => {
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
      className: `leaflet-feature-handle leaflet-handle-${props.role}`,
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
    data-slot="leaflet-handle-corner"
    :class="cn('hidden -z-50', props.class)"
  ></div>
</template>
```

```vue [src/components/ui/leaflet-map/LeafletFeatureRectangle.vue]
<script setup lang="ts">
import { removeWhitespaces } from "@assemblerjs/core";
import { watch, inject, type HTMLAttributes, ref } from "vue";
import { cn } from "@/lib/utils";
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { LeafletStylesKey } from ".";

export interface LeafletFeatureRectangleStyle {
  color: string;
  weight: number;
  fill: boolean;
  fillColor?: string;
  dashArray?: string;
  interactive: boolean;
}

export interface LeafletFeatureRectangleProps {
  class?: HTMLAttributes["class"];
  dashed?: number[];
}

const props = withDefaults(defineProps<LeafletFeatureRectangleProps>(), {
  class: "border-2 border-blue-500",
});

const stylesOptions = inject(LeafletStylesKey, ref());

const { fetchStylesFromElementClass, getTailwindBaseCssValues } =
  useCssParser();

const tailwindToBoxOptions = (className: string, dashed?: number[]) => {
  const style = fetchStylesFromElementClass(
    (el: HTMLElement): LeafletFeatureRectangleStyle => {
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
    },
    className,
  );

  return style;
};

watch(
  () => [stylesOptions.value, props.class, props.dashed],
  () => {
    const options = tailwindToBoxOptions(props.class || "", props.dashed);
    if (stylesOptions.value) {
      stylesOptions.value.rectangle = options;
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    data-slot="leaflet-handle-rectangle"
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
import {
  ref,
  computed,
  provide,
  watch,
  nextTick,
  type Ref,
  type InjectionKey,
} from "vue";
import {
  useCheckIn,
  type CheckInDesk,
} from "~~/registry/new-york/composables/use-check-in/useCheckIn";
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
const boundingBoxTrigger = ref(0);

const rotationStartPositions = ref<any>(null);
const rotationCenter = ref<{ lat: number; lng: number } | null>(null);

const { createDesk } = useCheckIn<FeatureReference>();

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

const notifyFeatureUpdate = (id: string | number) => {
  if (selectedFeature.value?.id === id) {
    boundingBoxTrigger.value++;
  }
};

const { desk } = createDesk("leafletFeatures", {
  context: {
    selectedFeature,
    selectFeature,
    deselectAll,
    notifyFeatureUpdate,
    mode: () => props.mode,
  },
  onCheckIn: (id, featureRef) => {
    console.log(
      "[LeafletFeaturesSelector] Feature registered:",
      id,
      featureRef.type,
    );
  },
  onCheckOut: (id) => {
    console.log("[LeafletFeaturesSelector] Feature unregistered:", id);

    if (selectedFeature.value?.id === id) {
      deselectAll();
    }
  },
});

const featuresRegistry = computed(() =>
  Array.from(desk.registry.value.values()).reduce((map, item) => {
    map.set(item.id, item.data);
    return map;
  }, new Map<string | number, FeatureReference>()),
);

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
  notifyFeatureUpdate,
};

provide(LeafletSelectionKey, context as any);
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
import { inject, watch, ref, type Ref, nextTick, computed } from "vue";
import { useCheckIn } from "~~/registry/new-york/composables/use-check-in/useCheckIn";
import {
  LeafletMapKey,
  LeafletModuleKey,
  LeafletSelectionKey,
  type FeatureReference,
} from ".";

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

const { checkIn } = useCheckIn<FeatureReference>();

const { desk: featureDesk } = selectionContext
  ? checkIn("leafletFeatures", {
      autoCheckIn: props.selectable,
      id: markerId.value,
      data: () => ({
        id: markerId.value,
        type: "marker" as const,
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
      }),
      watchData: true,
    })
  : { desk: ref(null) };

const isSelected = computed(() => {
  if (!featureDesk || !props.selectable) return false;
  return (
    (featureDesk as any).selectedFeature?.value?.type === "marker" &&
    (featureDesk as any).selectedFeature?.value?.id === markerId.value
  );
});

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

    const onDragStart = () => {
      if (props.selectable && selectionContext) {
        selectionContext.selectFeature("marker", markerId.value);
      }
      emit("dragstart");
    };

    if (isDraggable) {
      marker.value.on("drag", onDrag);
      marker.value.on("dragstart", onDragStart);
      marker.value.on("dragend", onDragEnd);
    }

    const onMarkerClick = () => {
      if (props.selectable && selectionContext) {
        selectionContext.selectFeature("marker", markerId.value);
      }
      emit("click");
    };

    if (props.selectable && selectionContext) {
      marker.value.on("click", onMarkerClick);
      if (!isDraggable) {
        marker.value.on("dragstart", onDragStart);
      }
    } else {
      marker.value.on("click", onMarkerClick);
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

            const onMarkerClick = () => {
              if (props.selectable && selectionContext) {
                selectionContext.selectFeature("marker", markerId.value);
              }
              emit("click");
            };

            const onDragStart = () => {
              if (props.selectable && selectionContext) {
                selectionContext.selectFeature("marker", markerId.value);
              }
              emit("dragstart");
            };

            if (props.selectable && selectionContext) {
              marker.value.on("click", onMarkerClick);
              marker.value.on("dragstart", onDragStart);
            } else {
              marker.value.on("click", onMarkerClick);
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
</script>

<template><slot /></template>
```

```vue [src/components/ui/leaflet-map/LeafletMeasureTool.vue]
<script setup lang="ts">
import {
  ref,
  inject,
  watch,
  onBeforeUnmount,
  type Ref,
  type HTMLAttributes,
  computed,
  provide,
} from "vue";
import type { LatLng, Marker, Circle, DivIcon } from "leaflet";
import { useLeaflet } from "~~/registry/new-york/composables/use-leaflet/useLeaflet";
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import {
  LeafletMapKey,
  LeafletModuleKey,
  LeafletStylesKey,
  type LeafletFeatureHandleStyle,
} from ".";

export interface LeafletMeasureToolStyles {
  corner: LeafletFeatureHandleStyle;
}

export interface LeafletMeasureToolProps {
  enabled?: boolean;
  mode?: "line" | "polygon";
  unit?: "metric" | "imperial";
  showArea?: boolean;
  showPerimeter?: boolean;
  snap?: string | number;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<LeafletMeasureToolProps>(), {
  enabled: false,
  mode: "polygon",
  unit: "metric",
  showArea: true,
  showPerimeter: true,
  snap: 20,
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

const {
  calculateLineDistance,
  calculatePolygonArea,
  formatDistance: formatDistanceUtil,
  pixelsToMeters,
  setMapCursor,
  resetMapCursor,
} = await useLeaflet();

const {
  getLeafletShapeColors,
  parseHTMLToElement,
  fetchStylesFromElementClass,
} = useCssParser();

const stylesOptions = ref<LeafletMeasureToolStyles>({
  corner: {
    className: "leaflet-feature-handle leaflet-measure-marker",
    html: `<div style="
        width: 10px;
        height: 10px;
        background: orange;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      "></div>`,
    iconSize: [12, 12],
  },
});

provide(LeafletStylesKey, stylesOptions);

const measurementPoints = ref<Array<[number, number]>>([]);
const markers = ref<Marker[]>([]);
const measurementLabels = ref<Marker[]>([]);
const snapCircle = ref<Circle | null>(null);
const tempPolygon = ref<L.Polygon | null>(null);
const tempPolyline = ref<L.Polyline | null>(null);
const isClosed = ref(false);

let isActive = false;
let isFinished = false;
let lastClickTime = 0;
const DOUBLE_CLICK_DELAY = 300;

const calculateDistance = (): number => {
  if (measurementPoints.value.length < 2) return 0;
  const latlngs = measurementPoints.value.map(([lat, lng]) =>
    L.value!.latLng(lat, lng),
  );
  return calculateLineDistance(latlngs, props.unit);
};

const calculateArea = (): number | undefined => {
  if (!props.showArea || measurementPoints.value.length < 3) return undefined;
  const latlngs = measurementPoints.value.map(([lat, lng]) =>
    L.value!.latLng(lat, lng),
  );
  return calculatePolygonArea(latlngs, props.unit);
};

const formatDistance = (distanceInMeters: number): string => {
  return formatDistanceUtil(distanceInMeters, props.unit);
};

const colors = computed(() => getLeafletShapeColors(props.class));

const createMeasureMarker = (
  latlng: [number, number],
  index: number,
): Marker | null => {
  if (!L.value || !map.value) return null;

  return L.value
    .marker([latlng[0], latlng[1]], {
      icon: L.value.divIcon(stylesOptions.value.corner) as DivIcon,
    })
    .addTo(map.value);
};

const createDistanceLabel = (
  latlng: [number, number],
  text: string,
): Marker | null => {
  if (!L.value || !map.value) return null;

  const html = `<div style="
        display: flex;
        align-items-center;
        justify-content-center;
        color: black;
        background: white;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid ${colors.value.color};
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">${text}</div>`;

  const [width, height] = parseHTMLToElement((el: HTMLElement) => {
    return [
      el.firstChild ? (el.firstChild as HTMLElement).offsetWidth : 80,
      el.firstChild ? (el.firstChild as HTMLElement).offsetHeight : 20,
    ];
  }, html);

  return L.value
    .marker([latlng[0], latlng[1]], {
      icon: L.value.divIcon({
        className: "leaflet-measure-label",
        html,
        iconSize: [width, height],
        iconAnchor: [width / 2, height / 2],
      }) as DivIcon,
    })
    .addTo(map.value);
};

const handleMapClick = (e: L.LeafletMouseEvent) => {
  if (!L.value || !map.value) return;

  if (isFinished) {
    cleanup();
    isFinished = false;
    isActive = true;
  }

  if (!isActive) return;

  const now = Date.now();
  if (now - lastClickTime < DOUBLE_CLICK_DELAY) {
    return;
  }
  lastClickTime = now;

  const latlng = e.latlng;

  if (props.mode === "polygon" && measurementPoints.value.length >= 3) {
    const firstPoint = measurementPoints.value[0];
    if (!firstPoint) return;
    const firstLatLng = L.value.latLng(firstPoint[0], firstPoint[1]);
    const distance = firstLatLng.distanceTo(latlng);

    const zoom = map.value.getZoom();
    const metersPerPixel = pixelsToMeters(zoom, latlng.lat);
    const snapThreshold = Number(props.snap) * metersPerPixel;

    if (distance < snapThreshold) {
      isClosed.value = true;

      const firstPt = measurementPoints.value[0];
      const lastPt =
        measurementPoints.value[measurementPoints.value.length - 1];

      if (firstPt && lastPt) {
        const lastLatLng = L.value.latLng(lastPt[0], lastPt[1]);
        const firstLatLng = L.value.latLng(firstPt[0], firstPt[1]);
        const closingDistance = lastLatLng.distanceTo(firstLatLng);

        if (closingDistance > 0) {
          const midpoint: [number, number] = [
            (firstPt[0] + lastPt[0]) / 2,
            (firstPt[1] + lastPt[1]) / 2,
          ];
          const label = createDistanceLabel(
            midpoint,
            formatDistance(closingDistance),
          );
          if (label) measurementLabels.value.push(label);
        }
      }

      finishMeasurement();
      return;
    }
  }

  measurementPoints.value.push([latlng.lat, latlng.lng]);

  const marker = createMeasureMarker(
    [latlng.lat, latlng.lng],
    measurementPoints.value.length - 1,
  );
  if (marker) markers.value.push(marker);

  if (props.mode === "polygon") {
    if (!tempPolygon.value && L.value && map.value) {
      const colors = getLeafletShapeColors(props.class);
      tempPolygon.value = L.value.polygon(
        measurementPoints.value as L.LatLngExpression[],
        {
          color: colors.color,
          fillColor: colors.fillColor,
          fillOpacity: colors.fillOpacity,
          weight: 3,
          dashArray: "10, 5",
          interactive: false,
        },
      );
      tempPolygon.value.addTo(map.value);
    } else if (tempPolygon.value) {
      tempPolygon.value.setLatLngs(
        measurementPoints.value as L.LatLngExpression[],
      );
    }
  } else {
    if (!tempPolyline.value && L.value && map.value) {
      const colors = getLeafletShapeColors(props.class);
      tempPolyline.value = L.value.polyline(
        measurementPoints.value as L.LatLngExpression[],
        {
          color: colors.color,
          weight: 3,
          dashArray: "10, 5",
          interactive: false,
        },
      );
      tempPolyline.value.addTo(map.value);
    } else if (tempPolyline.value) {
      tempPolyline.value.setLatLngs(
        measurementPoints.value as L.LatLngExpression[],
      );
    }
  }

  if (measurementPoints.value.length >= 2) {
    const prevPoint =
      measurementPoints.value[measurementPoints.value.length - 2];
    if (!prevPoint) return;

    const prevLatLng = L.value.latLng(prevPoint[0], prevPoint[1]);
    const segmentDistance = prevLatLng.distanceTo(latlng);

    const midpoint: [number, number] = [
      (latlng.lat + prevPoint[0]) / 2,
      (latlng.lng + prevPoint[1]) / 2,
    ];

    const label = createDistanceLabel(
      midpoint,
      formatDistance(segmentDistance),
    );
    if (label) measurementLabels.value.push(label);

    const totalDistance = calculateDistance();
    const area = calculateArea();
    emit("measurement-update", { distance: totalDistance, area });
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
  ) {
    if (snapCircle.value) {
      snapCircle.value.remove();
      snapCircle.value = null;
    }
    return;
  }

  const latlng = e.latlng;

  let isInSnapZone = false;
  if (props.mode === "polygon" && measurementPoints.value.length >= 3) {
    const firstPoint = measurementPoints.value[0];
    if (firstPoint && map.value) {
      const firstLatLng = L.value.latLng(firstPoint[0], firstPoint[1]);
      const distance = firstLatLng.distanceTo(latlng);
      const zoom = map.value.getZoom();
      const metersPerPixel = pixelsToMeters(zoom, latlng.lat);
      const snapThreshold = 20 * metersPerPixel;
      isInSnapZone = distance < snapThreshold;
    }
  }

  if (props.mode === "polygon" && tempPolygon.value) {
    const previewPoint = isInSnapZone
      ? measurementPoints.value[0]
      : [latlng.lat, latlng.lng];

    const previewPoints: Array<[number, number]> = [
      ...measurementPoints.value,
      previewPoint as [number, number],
    ];
    tempPolygon.value.setLatLngs(previewPoints as L.LatLngExpression[]);
  } else if (props.mode === "line" && tempPolyline.value) {
    const previewPoints: Array<[number, number]> = [
      ...measurementPoints.value,
      [latlng.lat, latlng.lng],
    ];
    tempPolyline.value.setLatLngs(previewPoints as L.LatLngExpression[]);
  }

  if (props.mode !== "polygon" || measurementPoints.value.length < 3) {
    if (snapCircle.value) {
      snapCircle.value.remove();
      snapCircle.value = null;
    }
    return;
  }

  const firstPoint = measurementPoints.value[0];
  if (!firstPoint) return;

  const firstLatLng = L.value.latLng(firstPoint[0], firstPoint[1]);
  const distance = firstLatLng.distanceTo(latlng);

  const zoom = map.value.getZoom();
  const metersPerPixel = pixelsToMeters(zoom, latlng.lat);
  const snapThreshold = 20 * metersPerPixel;

  if (distance < snapThreshold) {
    if (!snapCircle.value) {
      const colors = fetchStylesFromElementClass((el: HTMLElement) => {
        return {
          color: getComputedStyle(el).borderColor || "orange",
          fillColor: getComputedStyle(el).backgroundColor || "orange",
        };
      }, props.class);

      snapCircle.value = L.value
        .circle(firstLatLng, {
          radius: snapThreshold,
          color: colors.color,
          fillColor: colors.fillColor,
          fillOpacity: 1,
          weight: 2,
        })
        .addTo(map.value);
    }
  } else if (snapCircle.value) {
    snapCircle.value.remove();
    snapCircle.value = null;
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
  if (
    props.mode === "polygon" &&
    measurementPoints.value.length >= 3 &&
    !isClosed.value
  ) {
    const firstPt = measurementPoints.value[0];
    const lastPt = measurementPoints.value[measurementPoints.value.length - 1];

    if (firstPt && lastPt && L.value) {
      const lastLatLng = L.value.latLng(lastPt[0], lastPt[1]);
      const firstLatLng = L.value.latLng(firstPt[0], firstPt[1]);
      const closingDistance = lastLatLng.distanceTo(firstLatLng);

      const midpoint: [number, number] = [
        (firstPt[0] + lastPt[0]) / 2,
        (firstPt[1] + lastPt[1]) / 2,
      ];
      const label = createDistanceLabel(
        midpoint,
        formatDistance(closingDistance),
      );
      if (label) measurementLabels.value.push(label);

      isClosed.value = true;
    }
  }

  const distance = calculateDistance();
  const area = calculateArea();

  const latlngs = measurementPoints.value.map(([lat, lng]) =>
    L.value!.latLng(lat, lng),
  );
  emit("measurement-complete", {
    distance,
    area,
    points: latlngs,
  });

  isActive = false;
  isFinished = true;
};

const cleanup = () => {
  tempPolygon.value?.remove();
  tempPolygon.value = null;

  tempPolyline.value?.remove();
  tempPolyline.value = null;

  snapCircle.value?.remove();
  snapCircle.value = null;

  markers.value.forEach((m) => m.remove());
  markers.value = [];

  measurementLabels.value.forEach((l) => l.remove());
  measurementLabels.value = [];

  measurementPoints.value = [];
  isClosed.value = false;
  isFinished = false;
};

const enable = () => {
  if (!map.value) return;

  isActive = true;
  setMapCursor(map.value, "crosshair");

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
  resetMapCursor(map.value);

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
  <div data-slot="leaflet-measure-tool"><slot /></div>
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
  type HTMLAttributes,
} from "vue";
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { useLeaflet } from "~~/registry/new-york/composables/use-leaflet/useLeaflet";
import { useCheckIn } from "~~/registry/new-york/composables/use-check-in/useCheckIn";
import {
  LeafletMapKey,
  LeafletModuleKey,
  LeafletSelectionKey,
  type FeatureReference,
} from ".";
import "./leaflet-editing.css";

const {
  calculateMidpoint,
  LatDegreesMeters,
  lngDegreesToRadius,
  normalizeLatLngs,
  setMapCursor,
  resetMapCursor,
  translatePointByPixels,
  createStyledMarker,
} = await useLeaflet();

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

const { checkIn } = useCheckIn<FeatureReference>();

const { desk: featureDesk } = selectionContext
  ? checkIn("leafletFeatures", {
      autoCheckIn: props.selectable,
      id: polygonId.value,
      data: () => ({
        id: polygonId.value,
        type: "polygon" as const,
        getBounds: () => {
          if (!polygon.value || !L.value) return null;
          return polygon.value.getBounds();
        },
        getInitialData: () => {
          if (!polygon.value) return null;
          return polygon.value.getLatLngs()[0] as L.LatLng[];
        },
        applyTransform: (bounds: L.LatLngBounds) => {
          if (!polygon.value) return;
          const currentLatLngs = polygon.value.getLatLngs()[0] as L.LatLng[];
          const currentBounds = polygon.value.getBounds();
          const scaleX =
            (bounds.getEast() - bounds.getWest()) /
            (currentBounds.getEast() - currentBounds.getWest());
          const scaleY =
            (bounds.getNorth() - bounds.getSouth()) /
            (currentBounds.getNorth() - currentBounds.getSouth());
          const newCenter = bounds.getCenter();
          const currentCenter = currentBounds.getCenter();
          const offsetLat = newCenter.lat - currentCenter.lat;
          const offsetLng = newCenter.lng - currentCenter.lng;
          const newLatLngs = currentLatLngs.map((latlng) => {
            const relLat = (latlng.lat - currentCenter.lat) * scaleY;
            const relLng = (latlng.lng - currentCenter.lng) * scaleX;
            return L.value!.latLng(
              newCenter.lat + relLat,
              newCenter.lng + relLng,
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
          initialData: any,
        ) => {
          if (!polygon.value || !L.value) return;
          const initialLatLngs = initialData as L.LatLng[];
          const angleRad = (-angle * Math.PI) / 180;
          const metersPerDegreeLat = LatDegreesMeters;
          const metersPerDegreeLng = lngDegreesToRadius(1, center.lat);
          const newLatLngs = initialLatLngs.map((latlng) => {
            const lat = latlng.lat;
            const lng = latlng.lng;
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
      }),
      watchData: true,
    })
  : { desk: ref(null) };

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
    const marker = createStyledMarker(
      latlng,
      {
        className: isFirstPoint
          ? "leaflet-editing-icon leaflet-editing-icon-first"
          : "leaflet-editing-icon",
        html: isFirstPoint
          ? '<div style="width:12px;height:12px;border-radius:50%;background:#fff;border:2px solid #3388ff;cursor:pointer;"></div>'
          : '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: isFirstPoint ? [12, 12] : [8, 8],
      },
      { draggable: true },
      map.value!,
    );
    if (!marker) return;

    if (isFirstPoint && props.autoClose) {
      firstPointMarker.value = marker;

      const onFirstPointClick = () => {
        emit("closed");
      };

      marker.on("click", onFirstPointClick);
    }

    const onVertexDrag = () => {
      const newLatLngs = [...latlngs];
      let currentPos = marker.getLatLng();

      newLatLngs[index] = currentPos;
      polygon.value!.setLatLngs([newLatLngs]);

      updateMidpoints(newLatLngs);
    };

    const onVertexDragEnd = () => {
      const updatedLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map(
        (ll) => [ll.lat, ll.lng],
      ) as Array<[number, number]>;
      emit("update:latlngs", updatedLatLngs);
    };

    marker.on("drag", onVertexDrag);
    marker.on("dragend", onVertexDragEnd);

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

    const [midLat, midLng] = calculateMidpoint(current, next);

    const midMarker = createStyledMarker(
      [midLat, midLng],
      {
        className: "leaflet-editing-icon-midpoint",
        html: "<div></div>",
        iconSize: [14, 14],
      },
      { draggable: true },
      map.value,
    );
    if (!midMarker) continue;

    let pointAdded = false;

    const onMidpointDragStart = () => {
      if (map.value) setMapCursor(map.value, "copy");
    };

    const onMidpointDrag = () => {
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
    };

    const onMidpointDragEnd = () => {
      resetMapCursor(map.value);
      const updatedLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map(
        (ll) => [ll.lat, ll.lng],
      ) as Array<[number, number]>;
      emit("update:latlngs", updatedLatLngs);
      enableEditing();
    };

    const onMidpointMouseOver = () => {
      if (map.value) setMapCursor(map.value, "copy");
    };

    const onMidpointMouseOut = () => {
      resetMapCursor(map.value);
    };

    midMarker.on("dragstart", onMidpointDragStart);
    midMarker.on("drag", onMidpointDrag);
    midMarker.on("dragend", onMidpointDragEnd);
    midMarker.on("mouseover", onMidpointMouseOver);
    midMarker.on("mouseout", onMidpointMouseOut);

    midpointMarkers.value.push(midMarker);
  }
};

const updateMidpoints = (latlngs: L.LatLng[]) => {
  midpointMarkers.value.forEach((midMarker, i) => {
    const nextIndex = (i + 1) % latlngs.length;
    if (latlngs[i] && latlngs[nextIndex]) {
      const [midLat, midLng] = calculateMidpoint(
        latlngs[i],
        latlngs[nextIndex],
      );
      midMarker.setLatLng(L.value!.latLng(midLat, midLng));
    }
  });
};

const enableDragging = () => {
  if (!polygon.value || !map.value) return;

  const onPolygonMouseDown = (e: L.LeafletMouseEvent) => {
    L.value!.DomEvent.stopPropagation(e);
    isDragging.value = true;

    emit("dragstart");

    dragStartLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map(
      (ll) => L.value!.latLng(ll.lat, ll.lng),
    );
    dragStartMousePoint = map.value!.latLngToContainerPoint(e.latlng);

    setupMapDragHandlers();

    if (map.value) {
      setMapCursor(map.value, "move");
      map.value.dragging.disable();
    }
  };

  polygon.value.on("mousedown", onPolygonMouseDown);
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

    const newLatLngs = dragStartLatLngs
      .map((startLatLng) =>
        translatePointByPixels(startLatLng, deltaX, deltaY, map.value!),
      )
      .filter((ll): ll is L.LatLng => ll !== null);

    if (newLatLngs.length !== dragStartLatLngs.length) return;

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
      resetMapCursor(map.value);
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

          const onPolygonClick = () => {
            if (props.selectable && selectionContext) {
              selectionContext.selectFeature("polygon", polygonId.value);
            }
            emit("click");
          };

          const onPolygonMouseDown = (e: any) => {
            if (props.draggable && props.selectable && selectionContext) {
              selectionContext.selectFeature("polygon", polygonId.value);
            }
          };

          if (props.selectable && selectionContext) {
            polygon.value.on("click", onPolygonClick);
            polygon.value.on("mousedown", onPolygonMouseDown);
          } else {
            polygon.value.on("click", onPolygonClick);
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
  type HTMLAttributes,
} from "vue";
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { useLeaflet } from "~~/registry/new-york/composables/use-leaflet/useLeaflet";
import { useCheckIn } from "~~/registry/new-york/composables/use-check-in/useCheckIn";
import {
  LeafletMapKey,
  LeafletModuleKey,
  LeafletSelectionKey,
  type FeatureReference,
} from ".";

import "./leaflet-editing.css";

const { checkIn } = useCheckIn<FeatureReference>();

const {
  calculateMidpoint,
  LatDegreesMeters,
  lngDegreesToRadius,
  normalizeLatLngs,
  setMapCursor,
  resetMapCursor,
  translatePointByPixels,
  createStyledMarker,
} = await useLeaflet();

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

const { desk: featureDesk } = selectionContext
  ? checkIn("leafletFeatures", {
      autoCheckIn: props.selectable,
      id: polylineId.value,
      data: () => ({
        id: polylineId.value,
        type: "polyline" as const,
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
          initialData: any,
        ) => {
          if (!polyline.value || !L.value || !initialData) return;

          const initialLatLngs = initialData as Array<[number, number]>;
          const angleRad = (-angle * Math.PI) / 180;

          const metersPerDegreeLat = LatDegreesMeters;
          const metersPerDegreeLng = lngDegreesToRadius(1, center.lat);

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
      }),
      watchData: true,
    })
  : { desk: ref(null) };

let dragStartLatLngs: L.LatLng[] = [];
let dragStartMousePoint: L.Point | null = null;

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
    const marker = createStyledMarker(
      latlng,
      {
        className: "leaflet-editing-icon",
        html: '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: [8, 8],
      },
      { draggable: true },
      map.value!,
    );
    if (!marker) return;

    const onVertexDrag = () => {
      const newLatLngs = [...latlngs];
      newLatLngs[index] = marker.getLatLng();
      polyline.value!.setLatLngs(newLatLngs);

      updateMidpoints(newLatLngs);
    };

    const onVertexDragEnd = () => {
      const updatedLatLngs = polyline.value!.getLatLngs() as L.LatLng[];
      emit(
        "update:latlngs",
        updatedLatLngs.map((ll) => [ll.lat, ll.lng]),
      );
    };

    marker.on("drag", onVertexDrag);
    marker.on("dragend", onVertexDragEnd);

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

    const [midLat, midLng] = calculateMidpoint(current, next);

    const midMarker = createStyledMarker(
      [midLat, midLng],
      {
        className: "leaflet-editing-icon-midpoint",
        html: "<div></div>",
        iconSize: [14, 14],
      },
      { draggable: true },
      map.value,
    );
    if (!midMarker) continue;

    let pointAdded = false;

    const onMidpointDragStart = () => {
      if (map.value) setMapCursor(map.value, "copy");
    };

    const onMidpointDrag = () => {
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
    };

    const onMidpointDragEnd = () => {
      resetMapCursor(map.value);
      const updatedLatLngs = (polyline.value!.getLatLngs() as L.LatLng[]).map(
        (ll) => [ll.lat, ll.lng],
      ) as Array<[number, number]>;
      emit("update:latlngs", updatedLatLngs);
      enableEditing();
    };

    const onMidpointMouseOver = () => {
      if (map.value) setMapCursor(map.value, "copy");
    };

    const onMidpointMouseOut = () => {
      resetMapCursor(map.value);
    };

    midMarker.on("dragstart", onMidpointDragStart);
    midMarker.on("drag", onMidpointDrag);
    midMarker.on("dragend", onMidpointDragEnd);
    midMarker.on("mouseover", onMidpointMouseOver);
    midMarker.on("mouseout", onMidpointMouseOut);

    midpointMarkers.value.push(midMarker);
  }
};

const updateMidpoints = (latlngs: L.LatLng[]) => {
  midpointMarkers.value.forEach((midMarker, i) => {
    const current = latlngs[i];
    const next = latlngs[i + 1];
    if (current && next) {
      const [midLat, midLng] = calculateMidpoint(current, next);
      midMarker.setLatLng(L.value!.latLng(midLat, midLng));
    }
  });
};

const enableDragging = () => {
  if (!polyline.value || !map.value) return;

  const onPolylineMouseDown = (e: L.LeafletMouseEvent) => {
    L.value!.DomEvent.stopPropagation(e);
    isDragging.value = true;

    emit("dragstart");

    dragStartLatLngs = (polyline.value!.getLatLngs() as L.LatLng[]).map((ll) =>
      L.value!.latLng(ll.lat, ll.lng),
    );
    dragStartMousePoint = map.value!.latLngToContainerPoint(e.latlng);

    setupMapDragHandlers();

    if (map.value) {
      setMapCursor(map.value, "move");
      map.value.dragging.disable();
    }
  };

  polyline.value.on("mousedown", onPolylineMouseDown);
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

    const newLatLngs = dragStartLatLngs
      .map((startLatLng) =>
        translatePointByPixels(startLatLng, deltaX, deltaY, map.value!),
      )
      .filter((ll): ll is L.LatLng => ll !== null);

    if (newLatLngs.length !== dragStartLatLngs.length) return;

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
      resetMapCursor(map.value);
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

          const onPolylineClick = () => {
            if (props.selectable && selectionContext) {
              selectionContext.selectFeature("polyline", polylineId.value);
            }
            emit("click");
          };

          const onPolylineMouseDown = (e: any) => {
            if (props.draggable && props.selectable && selectionContext) {
              selectionContext.selectFeature("polyline", polylineId.value);
            }
          };

          if (props.selectable && selectionContext) {
            polyline.value.on("click", onPolylineClick);
            polyline.value.on("mousedown", onPolylineMouseDown);
          } else {
            polyline.value.on("click", onPolylineClick);
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
  type HTMLAttributes,
} from "vue";
import { useCssParser } from "~~/registry/new-york/composables/use-css-parser/useCssParser";
import { useLeaflet } from "~~/registry/new-york/composables/use-leaflet/useLeaflet";
import { useCheckIn } from "~~/registry/new-york/composables/use-check-in/useCheckIn";
import {
  LeafletMapKey,
  LeafletModuleKey,
  LeafletSelectionKey,
  type FeatureReference,
} from ".";

import "./leaflet-editing.css";

const { checkIn } = useCheckIn<FeatureReference>();

const {
  calculateBoundsFromHandle,
  setMapCursor,
  resetMapCursor,
  createStyledMarker,
  translatePointByPixels,
} = await useLeaflet();

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

const { desk: featureDesk } = selectionContext
  ? checkIn("leafletFeatures", {
      autoCheckIn: props.selectable,
      id: rectangleId.value,
      data: () => ({
        id: rectangleId.value,
        type: "rectangle" as const,
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
      }),
      watchData: true,
    })
  : { desk: ref(null) };

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
    const marker = createStyledMarker(
      corner,
      {
        className: "leaflet-editing-icon",
        html: '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: [8, 8],
      },
      { draggable: true },
      map.value!,
    );
    if (!marker) return;

    const onCornerDrag = () => {
      const currentBounds = rectangle.value!.getBounds();
      const newCorner = marker.getLatLng();

      const newBounds = calculateBoundsFromHandle(
        "corner",
        index,
        newCorner,
        currentBounds,
      );
      if (!newBounds) return;

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
    };

    const onCornerDragEnd = () => {
      const updatedBounds = rectangle.value!.getBounds();
      emit("update:bounds", [
        [updatedBounds.getSouth(), updatedBounds.getWest()],
        [updatedBounds.getNorth(), updatedBounds.getEast()],
      ]);
    };

    marker.on("drag", onCornerDrag);
    marker.on("dragend", onCornerDragEnd);

    editMarkers.value.push(marker);
  });
};

const enableDragging = () => {
  if (!rectangle.value || !map.value) return;

  const onRectangleMouseDown = (e: L.LeafletMouseEvent) => {
    L.value!.DomEvent.stopPropagation(e);
    isDragging.value = true;

    emit("dragstart");

    dragStartBounds = rectangle.value!.getBounds();
    dragStartMousePoint = map.value!.latLngToContainerPoint(e.latlng);

    setupMapDragHandlers();

    if (map.value) {
      setMapCursor(map.value, "move");
      map.value.dragging.disable();
    }
  };

  rectangle.value.on("mousedown", onRectangleMouseDown);
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

    const newSW = translatePointByPixels(
      dragStartBounds.getSouthWest(),
      deltaX,
      deltaY,
      map.value,
    );
    const newNE = translatePointByPixels(
      dragStartBounds.getNorthEast(),
      deltaX,
      deltaY,
      map.value,
    );

    if (!newSW || !newNE || !L.value) return;

    const newBounds = L.value.latLngBounds(newSW, newNE);

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
      resetMapCursor(map.value);
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

          const onRectangleClick = () => {
            if (props.selectable && selectionContext) {
              selectionContext.selectFeature("rectangle", rectangleId.value);
            }
            emit("click");
          };

          const onRectangleMouseDown = (e: any) => {
            if (props.draggable && props.selectable && selectionContext) {
              selectionContext.selectFeature("rectangle", rectangleId.value);
            }
          };

          if (props.selectable && selectionContext) {
            rectangle.value.on("click", onRectangleClick);
            rectangle.value.on("mousedown", onRectangleMouseDown);
          } else {
            rectangle.value.on("click", onRectangleClick);
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
import { useLeaflet } from "~~/registry/new-york/composables/use-leaflet/useLeaflet";

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
let rafId: number | null = null;

const calculateDynamicMargin = (zoom: number): number => {
  const clampedZoom = Math.max(1, Math.min(20, zoom));

  const baseMargin = (20 - clampedZoom) * 100;

  return baseMargin * props.marginZoomRatio;
};

const updateVisibleBounds = () => {
  if (!map.value || !L.value) return;

  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }

  rafId = requestAnimationFrame(() => {
    rafId = null;

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
const handleMapUpdate = () => {
  updateVisibleBounds();
};

onMounted(() => {
  if (map.value) {
    updateVisibleBounds();
    map.value.on("moveend", handleMapUpdate);
    map.value.on("zoomend", handleMapUpdate);
  }
});

watch(
  map,
  (newMap) => {
    if (newMap) {
      updateVisibleBounds();
      newMap.on("moveend", handleMapUpdate);
      newMap.on("zoomend", handleMapUpdate);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (map.value) {
    map.value.off("moveend", handleMapUpdate);
    map.value.off("zoomend", handleMapUpdate);
  }
});

watch(
  () =>
    [
      props.enabled,
      props.marginMeters,
      props.marginZoomRatio,
      props.minZoom,
      props.maxZoom,
      props.quadtree,
    ] as const,
  async ([enabled], [oldEnabled]) => {
    if (enabled !== oldEnabled) {
      isTransitioning.value = true;
      emit("transition-start");

      await new Promise((resolve) =>
        setTimeout(resolve, props.transitionDelay),
      );
    }

    if (map.value) {
      updateVisibleBounds();
    }

    if (enabled !== oldEnabled) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      isTransitioning.value = false;
      emit("transition-end");
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

  const fromGeoJSONCoords = (coords: Position[]): LatLng[] => {
    return coords
      .filter(
        (c): c is [number, number] | [number, number, number] =>
          c[0] !== undefined && c[1] !== undefined,
      )
      .map((c) => new L.value!.LatLng(c[1], c[0]));
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

  const calculateMidpoint = (
    point1: LatLng,
    point2: LatLng,
  ): [number, number] => {
    const midLat = (point1.lat + point2.lat) / 2;
    const midLng = (point1.lng + point2.lng) / 2;
    return [midLat, midLng];
  };

  const calculateRadiusPoint = (
    center: LatLng,
    radiusInMeters: number,
  ): [number, number] => {
    const lat = center.lat;
    const lng = center.lng + radiusToLngDegrees(radiusInMeters, center.lat);
    return [lat, lng];
  };

  const calculateCircleBounds = (
    center: LatLng,
    radiusInMeters: number,
  ): { southWest: [number, number]; northEast: [number, number] } => {
    const radiusInLatDegrees = radiusToLatDegrees(radiusInMeters);
    const radiusInLngDegrees = radiusToLngDegrees(radiusInMeters, center.lat);

    return {
      southWest: [
        center.lat - radiusInLatDegrees,
        center.lng - radiusInLngDegrees,
      ],
      northEast: [
        center.lat + radiusInLatDegrees,
        center.lng + radiusInLngDegrees,
      ],
    };
  };

  const pixelsToMeters = (zoom: number, latitude: number): number => {
    const earthCircumference = 40075016.686;
    return (
      (earthCircumference * Math.abs(Math.cos((latitude * Math.PI) / 180))) /
      Math.pow(2, zoom + 8)
    );
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

    const latMeters = latDiff * LatDegreesMeters;
    const lngMeters = lngDegreesToRadius(lngDiff, currentCenter.lat);

    let targetMeters = latMeters;
    if (originalBounds) {
      const origLatDiff = originalBounds.getNorth() - originalBounds.getSouth();
      const origLngDiff = originalBounds.getEast() - originalBounds.getWest();
      const origLatMeters = origLatDiff * LatDegreesMeters;
      const origLngMeters = lngDegreesToRadius(origLngDiff, currentCenter.lat);

      const latChange = Math.abs(latMeters - origLatMeters);
      const lngChange = Math.abs(lngMeters - origLngMeters);

      targetMeters = lngChange > latChange ? lngMeters : latMeters;
    } else {
      targetMeters = (latMeters + lngMeters) / 2;
    }

    const halfLatDiff = targetMeters / 2 / LatDegreesMeters;
    const halfLngDiff = radiusToLngDegrees(targetMeters / 2, currentCenter.lat);

    return L.value.latLngBounds(
      [currentCenter.lat - halfLatDiff, currentCenter.lng - halfLngDiff],
      [currentCenter.lat + halfLatDiff, currentCenter.lng + halfLngDiff],
    );
  };

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

  const translatePointByPixels = (
    latlng: L.LatLng,
    deltaX: number,
    deltaY: number,
    map: L.Map,
  ): L.LatLng | null => {
    if (!L.value || !map) return null;
    const point = map.latLngToContainerPoint(latlng);
    const newPoint = L.value.point(point.x + deltaX, point.y + deltaY);
    return map.containerPointToLatLng(newPoint);
  };

  const calculatePixelOffset = (
    from: L.LatLng,
    to: L.LatLng,
    map: L.Map,
  ): { x: number; y: number } | null => {
    if (!L.value || !map) return null;
    const fromPoint = map.latLngToContainerPoint(from);
    const toPoint = map.latLngToContainerPoint(to);
    return {
      x: toPoint.x - fromPoint.x,
      y: toPoint.y - fromPoint.y,
    };
  };

  const calculateHandlePositions = (
    bounds: L.LatLngBounds,
    map: L.Map,
    options: {
      corners?: boolean;
      edges?: boolean;
      rotate?: boolean;
      center?: boolean;
      rotateOffsetPx?: number;
    } = {},
  ): {
    corners?: L.LatLng[];
    edges?: L.LatLng[];
    rotate?: L.LatLng;
    center?: L.LatLng;
  } => {
    if (!L.value) return {};

    const {
      corners = true,
      edges = true,
      rotate = true,
      center = true,
      rotateOffsetPx = 30,
    } = options;

    const result: {
      corners?: L.LatLng[];
      edges?: L.LatLng[];
      rotate?: L.LatLng;
      center?: L.LatLng;
    } = {};

    if (corners) {
      result.corners = [
        bounds.getSouthWest(),
        bounds.getNorthWest(),
        bounds.getNorthEast(),
        bounds.getSouthEast(),
      ];
    }

    if (edges) {
      result.edges = [
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
    }

    if (rotate && map) {
      const centerTop = L.value.latLng(
        bounds.getNorth(),
        (bounds.getWest() + bounds.getEast()) / 2,
      );
      const centerTopPoint = map.latLngToLayerPoint(centerTop);
      const rotateHandlePoint = L.value.point(
        centerTopPoint.x,
        centerTopPoint.y - rotateOffsetPx,
      );
      result.rotate = map.layerPointToLatLng(rotateHandlePoint);
    }

    if (center) {
      result.center = bounds.getCenter();
    }

    return result;
  };

  const calculateBoundsFromHandle = (
    handleType: "corner" | "edge",
    handleIndex: number,
    newPosition: L.LatLng,
    originalBounds: L.LatLngBounds,
  ): L.LatLngBounds | null => {
    if (!L.value) return null;

    let newBounds: L.LatLngBounds;

    if (handleType === "corner") {
      switch (handleIndex) {
        case 0:
          newBounds = L.value.latLngBounds(
            newPosition,
            originalBounds.getNorthEast(),
          );
          break;
        case 1:
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), newPosition.lng],
            [newPosition.lat, originalBounds.getEast()],
          );
          break;
        case 2:
          newBounds = L.value.latLngBounds(
            originalBounds.getSouthWest(),
            newPosition,
          );
          break;
        case 3:
          newBounds = L.value.latLngBounds(
            [newPosition.lat, originalBounds.getWest()],
            [originalBounds.getNorth(), newPosition.lng],
          );
          break;
        default:
          return null;
      }
    } else if (handleType === "edge") {
      switch (handleIndex) {
        case 0:
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), newPosition.lng],
            [originalBounds.getNorth(), originalBounds.getEast()],
          );
          break;
        case 1:
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), originalBounds.getWest()],
            [newPosition.lat, originalBounds.getEast()],
          );
          break;
        case 2:
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), originalBounds.getWest()],
            [originalBounds.getNorth(), newPosition.lng],
          );
          break;
        case 3:
          newBounds = L.value.latLngBounds(
            [newPosition.lat, originalBounds.getWest()],
            [originalBounds.getNorth(), originalBounds.getEast()],
          );
          break;
        default:
          return null;
      }
    } else {
      return null;
    }

    return newBounds;
  };

  const setMapCursor = (map: L.Map | null, cursor: string): void => {
    if (!map) return;
    map.getContainer().style.cursor = cursor;
  };

  const resetMapCursor = (map: L.Map | null): void => {
    setMapCursor(map, "");
  };

  const createStyledMarker = (
    latlng: L.LatLng | [number, number],
    style: {
      html: string;
      className?: string;
      iconSize?: [number, number];
      iconAnchor?: [number, number];
    },
    options: L.MarkerOptions = {},
    map?: L.Map,
  ): L.Marker | null => {
    if (!L.value) return null;

    const {
      html,
      className = "leaflet-styled-marker",
      iconSize = [12, 12],
      iconAnchor,
    } = style;

    const icon = L.value.divIcon({
      className,
      html,
      iconSize,
      iconAnchor,
    });

    const marker = L.value.marker(latlng, {
      ...options,
      icon,
    });

    if (map) {
      marker.addTo(map);
    }

    return marker;
  };

  return {
    L,
    LatDegreesMeters,

    radiusToLatDegrees,
    latDegreesToRadius,
    radiusToLngDegrees,
    lngDegreesToRadius,
    pixelsToMeters,

    toGeoJSONCoords,
    fromGeoJSONCoords,
    calculateLineDistance,
    calculatePolygonArea,
    calculateCentroid,
    calculateDistance,

    formatDistance,
    formatArea,

    calculateMidpoint,
    calculateRadiusPoint,
    calculateCircleBounds,

    constrainToSquare,

    normalizeLatLngs,

    translatePointByPixels,
    calculatePixelOffset,

    calculateHandlePositions,
    calculateBoundsFromHandle,

    setMapCursor,
    resetMapCursor,

    createStyledMarker,
  };
};
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
  const fetchStylesFromElementClass = (
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

  const parseHTMLToElement = (fn: (el: HTMLElement) => any, html: string) => {
    const el = document.createElement("div");
    el.style.visibility = "hidden";
    el.style.zIndex = "-1000";
    el.style.position = "absolute";
    el.style.top = "0";
    el.style.left = "0";
    el.innerHTML = html;
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
        weight: 2,
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

      const cssValues = fetchStylesFromElementClass(
        (el) =>
          getTailwindBaseCssValues(el, [
            "border-color",
            "color",
            "background-color",
            "opacity",
            "border-width",
          ]),
        classList.join(" "),
      );

      return {
        color: cssValues["border-color"] || cssValues["color"] || "#3388ff",
        fillColor: cssValues["background-color"] || "#3388ff",
        fillOpacity: cssValues["opacity"]
          ? parseFloat(cssValues["opacity"])
          : 0.2,
        weight: cssValues["border-width"]
          ? parseFloat(cssValues["border-width"])
          : 2,
      };
    } catch (err) {
      console.error("Error in getLeafletShapeColors:", err);
      return {
        color: "#3388ff",
        fillColor: "#3388ff",
        fillOpacity: 0.2,
        weight: 2,
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

      const cssValues = fetchStylesFromElementClass(
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
    fetchStylesFromElementClass,
    parseHTMLToElement,
    getTailwindBaseCssValues,
    getLeafletShapeColors,
    getLeafletLineColors,
    parseGradient,
  };
};
```

```ts [src/composables/use-check-in/index.ts]
export { useCheckIn } from "./useCheckIn";

export type {
  DeskEventType,
  DeskEventCallback,
  CheckInItem,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
} from "./useCheckIn";

export type { CheckInPlugin } from "./types";

export {
  createActiveItemPlugin,
  createValidationPlugin,
  createLoggerPlugin,
  createHistoryPlugin,
} from "./plugins";

export type {
  ValidationOptions,
  LoggerOptions,
  HistoryOptions,
  HistoryEntry,
} from "./plugins";
```

```ts [src/composables/use-check-in/useCheckIn.ts]
import {
  ref,
  provide,
  inject,
  onUnmounted,
  watch,
  computed,
  triggerRef,
  type InjectionKey,
  type Ref,
  type ComputedRef,
} from "vue";
import type { CheckInPlugin } from "./types";

export type DeskEventType = "check-in" | "check-out" | "update" | "clear";

export type DeskEventCallback<T = any> = (payload: {
  id?: string | number;
  data?: T;
  timestamp: number;
}) => void;

export interface CheckInItem<T = any> {
  id: string | number;
  data: T;
  timestamp?: number;
  meta?: Record<string, any>;
}

export interface CheckInDesk<
  T = any,
  TContext extends Record<string, any> = {},
> {
  readonly registry: Ref<Map<string | number, CheckInItem<T>>>;
  checkIn: (
    id: string | number,
    data: T,
    meta?: Record<string, any>,
  ) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: {
    sortBy?: keyof T | "timestamp";
    order?: "asc" | "desc";
  }) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (
    items: Array<{ id: string | number; data: T; meta?: Record<string, any> }>,
  ) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => void;
  on: (event: DeskEventType, callback: DeskEventCallback<T>) => () => void;
  off: (event: DeskEventType, callback: DeskEventCallback<T>) => void;
  emit: (
    event: DeskEventType,
    payload: { id?: string | number; data?: T },
  ) => void;
}

export interface CheckInDeskOptions<
  T = any,
  TContext extends Record<string, any> = {},
> {
  context?: TContext;
  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;
  onCheckIn?: (id: string | number, data: T) => void;
  onBeforeCheckOut?: (id: string | number) => void | boolean;
  onCheckOut?: (id: string | number) => void;
  debug?: boolean;
  plugins?: CheckInPlugin<T>[];
}

export interface CheckInOptions<T = any> {
  required?: boolean;
  autoCheckIn?: boolean;
  id?: string | number;
  data?: T | (() => T) | (() => Promise<T>);
  generateId?: () => string | number;
  watchData?: boolean;
  shallow?: boolean;
  watchCondition?: (() => boolean) | Ref<boolean>;
  meta?: Record<string, any>;
  debug?: boolean;
}

const NoOpDebug = (_message: string, ..._args: any[]) => {};

const Debug = (message: string, ...args: any[]) => {
  console.log(`[useCheckIn] ${message}`, ...args);
};

const instanceIdMap = new WeakMap<object, string>();

const customIdMap = new Map<string, string>();
let instanceCounter = 0;

export const useCheckIn = <
  T = any,
  TContext extends Record<string, any> = {},
>() => {
  let debug = NoOpDebug;

  const createDeskContext = <
    T = any,
    TContext extends Record<string, any> = {},
  >(
    options?: CheckInDeskOptions<T, TContext>,
  ): CheckInDesk<T, TContext> => {
    const registry = ref<Map<string | number, CheckInItem<T>>>(
      new Map(),
    ) as Ref<Map<string | number, CheckInItem<T>>>;

    debug = options?.debug ? Debug : NoOpDebug;

    const eventListeners = new Map<DeskEventType, Set<DeskEventCallback<T>>>();

    const pluginCleanups: Array<() => void> = [];

    const emit = (
      event: DeskEventType,
      payload: { id?: string | number; data?: T },
    ) => {
      const listeners = eventListeners.get(event);
      if (!listeners) return;

      const eventPayload = {
        ...payload,
        timestamp: Date.now(),
      };

      debug(`[Event] ${event}`, eventPayload);
      listeners.forEach((callback) => callback(eventPayload));
    };

    const on = (event: DeskEventType, callback: DeskEventCallback<T>) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
      }
      eventListeners.get(event)!.add(callback);

      debug(
        `[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`,
      );

      return () => off(event, callback);
    };

    const off = (event: DeskEventType, callback: DeskEventCallback<T>) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        debug(
          `[Event] Listener removed for '${event}', remaining: ${listeners.size}`,
        );
      }
    };

    const checkIn = (
      id: string | number,
      data: T,
      meta?: Record<string, any>,
    ): boolean => {
      debug("checkIn", { id, data, meta });

      if (options?.plugins) {
        for (const plugin of options.plugins) {
          if (plugin.onBeforeCheckIn) {
            const result = plugin.onBeforeCheckIn(id, data);
            if (result === false) {
              debug("checkIn cancelled by plugin:", plugin.name);
              return false;
            }
          }
        }
      }

      if (options?.onBeforeCheckIn) {
        const result = options.onBeforeCheckIn(id, data);
        if (result === false) {
          debug("checkIn cancelled by onBeforeCheckIn", id);
          return false;
        }
      }

      registry.value.set(id, {
        id,
        data: data as any,
        timestamp: Date.now(),
        meta,
      });
      triggerRef(registry);

      emit("check-in", { id, data });

      options?.onCheckIn?.(id, data);

      if (options?.debug) {
        debug("Registry state after check-in:", {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const checkOut = (id: string | number): boolean => {
      debug("checkOut", id);

      const existed = registry.value.has(id);
      if (!existed) return false;

      if (options?.plugins) {
        for (const plugin of options.plugins) {
          if (plugin.onBeforeCheckOut) {
            const result = plugin.onBeforeCheckOut(id);
            if (result === false) {
              debug("checkOut cancelled by plugin:", plugin.name);
              return false;
            }
          }
        }
      }

      if (options?.onBeforeCheckOut) {
        const result = options.onBeforeCheckOut(id);
        if (result === false) {
          debug("checkOut cancelled by onBeforeCheckOut", id);
          return false;
        }
      }

      registry.value.delete(id);
      triggerRef(registry);

      emit("check-out", { id });

      options?.onCheckOut?.(id);

      if (options?.debug) {
        debug("Registry state after check-out:", {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const get = (id: string | number) => registry.value.get(id);

    const getAll = (sortOptions?: {
      sortBy?: keyof T | "timestamp";
      order?: "asc" | "desc";
    }) => {
      const items = Array.from(registry.value.values());

      if (!sortOptions?.sortBy) return items;

      return items.sort((a, b) => {
        let aVal: any, bVal: any;

        if (sortOptions.sortBy === "timestamp") {
          aVal = a.timestamp || 0;
          bVal = b.timestamp || 0;
        } else {
          const key = sortOptions.sortBy as keyof T;
          aVal = a.data[key];
          bVal = b.data[key];
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortOptions.order === "desc" ? -comparison : comparison;
      });
    };

    const update = (id: string | number, data: Partial<T>): boolean => {
      const existing = registry.value.get(id);
      if (!existing) {
        debug("update failed: item not found", id);
        return false;
      }

      if (typeof existing.data === "object" && typeof data === "object") {
        const previousData = { ...existing.data };

        Object.assign(existing.data as object, data);
        triggerRef(registry);

        emit("update", { id, data: existing.data });

        if (options?.debug) {
          debug("update diff:", {
            id,
            before: previousData,
            after: existing.data,
            changes: data,
          });
        }

        return true;
      }

      return false;
    };

    const has = (id: string | number) => registry.value.has(id);

    const clear = () => {
      debug("clear");
      const count = registry.value.size;
      registry.value.clear();
      triggerRef(registry);

      emit("clear", {});

      pluginCleanups.forEach((cleanup) => cleanup());
      pluginCleanups.length = 0;

      debug(`Cleared ${count} items from registry`);
    };

    const checkInMany = (
      items: Array<{
        id: string | number;
        data: T;
        meta?: Record<string, any>;
      }>,
    ) => {
      debug("checkInMany", items.length, "items");
      items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
    };

    const checkOutMany = (ids: Array<string | number>) => {
      debug("checkOutMany", ids.length, "items");
      ids.forEach((id) => checkOut(id));
    };

    const updateMany = (
      updates: Array<{ id: string | number; data: Partial<T> }>,
    ) => {
      debug("updateMany", updates.length, "items");
      updates.forEach(({ id, data }) => update(id, data));
    };

    const desk: CheckInDesk<T, TContext> = {
      registry,
      checkIn,
      checkOut,
      get,
      getAll,
      update,
      has,
      clear,
      checkInMany,
      checkOutMany,
      updateMany,
      on,
      off,
      emit,
    };

    if (options?.plugins) {
      options.plugins.forEach((plugin) => {
        debug("Installing plugin:", plugin.name);

        if (plugin.install) {
          const cleanup = plugin.install(desk);
          if (cleanup) {
            pluginCleanups.push(cleanup);
          }
        }

        if (plugin.onCheckIn) {
          desk.on("check-in", ({ id, data }) => {
            plugin.onCheckIn!(id!, data!);
          });
        }

        if (plugin.onCheckOut) {
          desk.on("check-out", ({ id }) => {
            plugin.onCheckOut!(id!);
          });
        }

        if (plugin.methods) {
          Object.entries(plugin.methods).forEach(([name, method]) => {
            (desk as any)[name] = (...args: any[]) => method(desk, ...args);
          });
        }

        if (plugin.computed) {
          Object.entries(plugin.computed).forEach(([name, getter]) => {
            Object.defineProperty(desk, name, {
              get: () => getter(desk),
              enumerable: true,
              configurable: true,
            });
          });
        }
      });
    }

    return desk;
  };

  const createDesk = (
    injectionKey: string = "checkInDesk",
    options?: CheckInDeskOptions<T, TContext>,
  ) => {
    const DeskInjectionKey = Symbol(
      `CheckInDesk:${injectionKey}`,
    ) as InjectionKey<CheckInDesk<T, TContext> & TContext>;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.context || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(DeskInjectionKey, fullContext);

    provide(injectionKey, DeskInjectionKey);

    if (options?.debug) {
      Debug("Desk opened with injection key:", injectionKey);
    }

    return {
      desk: fullContext,
      injectionKey,
    };
  };

  const checkIn = <
    TDesk extends CheckInDesk<T, TContext> & TContext = CheckInDesk<
      T,
      TContext
    > &
      TContext,
  >(
    parentDeskOrKey:
      | (CheckInDesk<T, TContext> & TContext)
      | InjectionKey<CheckInDesk<T, TContext> & TContext>
      | string
      | null
      | undefined,
    checkInOptions?: CheckInOptions<T>,
  ) => {
    if (!parentDeskOrKey) {
      debug("[useCheckIn] No parent desk provided - skipping check-in");

      return {
        desk: null as TDesk | null,
        checkOut: () => {},
        updateSelf: () => {},
      };
    }

    let desk: (CheckInDesk<T, TContext> & TContext) | null | undefined;

    if (typeof parentDeskOrKey === "symbol") {
      desk = inject(parentDeskOrKey);
      if (!desk) {
        debug("[useCheckIn] Could not inject desk from symbol");

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else if (typeof parentDeskOrKey === "string") {
      const injectionKey =
        inject<InjectionKey<CheckInDesk<T, TContext> & TContext>>(
          parentDeskOrKey,
        );
      if (!injectionKey) {
        debug("[useCheckIn] Could not find desk with key:", parentDeskOrKey);

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
      desk = inject(injectionKey);
      if (!desk) {
        debug("[useCheckIn] Could not inject desk from key:", parentDeskOrKey);

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else {
      desk = parentDeskOrKey;
    }

    const itemId = checkInOptions?.id || `item-${Date.now()}-${Math.random()}`;
    let isCheckedIn = ref(false);
    let conditionStopHandle: (() => void) | null = null;

    const getCurrentData = async (): Promise<T> => {
      if (!checkInOptions?.data) return undefined as T;

      const dataValue =
        typeof checkInOptions.data === "function"
          ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
          : checkInOptions.data;

      return dataValue instanceof Promise ? await dataValue : dataValue;
    };

    const performCheckIn = async (): Promise<boolean> => {
      if (isCheckedIn.value) return true;

      const data = await getCurrentData();
      const success = desk!.checkIn(itemId, data, checkInOptions?.meta);

      if (success) {
        isCheckedIn.value = true;
        debug(`[useCheckIn] Checked in: ${itemId}`, data);
      } else {
        debug(`[useCheckIn] Check-in cancelled for: ${itemId}`);
      }

      return success;
    };

    const performCheckOut = () => {
      if (!isCheckedIn.value) return;

      desk!.checkOut(itemId);
      isCheckedIn.value = false;

      debug(`[useCheckIn] Checked out: ${itemId}`);
    };

    if (checkInOptions?.watchCondition) {
      const condition = checkInOptions.watchCondition;

      const shouldBeCheckedIn =
        typeof condition === "function" ? condition() : condition.value;
      if (shouldBeCheckedIn && checkInOptions?.autoCheckIn !== false) {
        performCheckIn();
      }

      conditionStopHandle = watch(
        () => (typeof condition === "function" ? condition() : condition.value),
        async (shouldCheckIn) => {
          if (shouldCheckIn && !isCheckedIn.value) {
            await performCheckIn();
          } else if (!shouldCheckIn && isCheckedIn.value) {
            performCheckOut();
          }
        },
      );
    } else if (checkInOptions?.autoCheckIn !== false) {
      performCheckIn();
    }

    let watchStopHandle: (() => void) | null = null;
    if (checkInOptions?.watchData && checkInOptions?.data) {
      const watchOptions = checkInOptions.shallow
        ? { deep: false }
        : { deep: true };

      watchStopHandle = watch(
        () => {
          if (!checkInOptions.data) return undefined;
          return typeof checkInOptions.data === "function"
            ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
            : checkInOptions.data;
        },
        async (newData) => {
          if (isCheckedIn.value && newData !== undefined) {
            const resolvedData =
              newData instanceof Promise ? await newData : newData;
            desk!.update(itemId, resolvedData);

            debug(`[useCheckIn] Updated data for: ${itemId}`, resolvedData);
          }
        },
        watchOptions,
      );
    }

    onUnmounted(() => {
      performCheckOut();

      if (watchStopHandle) {
        watchStopHandle();
      }

      if (conditionStopHandle) {
        conditionStopHandle();
      }
    });

    return {
      desk: desk as TDesk,
      checkOut: performCheckOut,
      updateSelf: async (newData?: T) => {
        if (!isCheckedIn.value) return;

        const data = newData !== undefined ? newData : await getCurrentData();
        desk!.update(itemId, data);

        debug(`[useCheckIn] Manual update for: ${itemId}`, data);
      },
    };
  };

  const generateId = (prefix = "item"): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }

    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      const id = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join(
        "",
      );
      return `${prefix}-${id}`;
    }

    const isDev =
      typeof process !== "undefined" && process.env?.NODE_ENV === "development";
    if (isDev) {
      console.warn(
        "[useCheckIn] crypto API not available, using Math.random fallback. " +
          "Consider upgrading to a modern environment.",
      );
    }
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}-${timestamp}-${random}`;
  };

  const memoizedId = (
    instanceOrId: object | string | number | null | undefined,
    prefix = "item",
  ): string => {
    if (typeof instanceOrId === "string" || typeof instanceOrId === "number") {
      const key = `${prefix}-${instanceOrId}`;
      let id = customIdMap.get(key);
      if (!id) {
        id = String(instanceOrId);
        customIdMap.set(key, id);
      }
      return id;
    }

    if (instanceOrId && typeof instanceOrId === "object") {
      let id = instanceIdMap.get(instanceOrId);
      if (!id) {
        id = `${prefix}-${++instanceCounter}`;
        instanceIdMap.set(instanceOrId, id);
      }
      return id;
    }

    debug(
      `[useCheckIn] memoizedId: no instance or custom ID provided. ` +
        `Generated cryptographically secure ID. ` +
        `Consider passing getCurrentInstance() or a custom ID (nanoid, uuid, props.id, etc.).`,
    );
    return generateId(prefix);
  };

  const standaloneDesk = <T = any,>(options?: CheckInDeskOptions<T>) => {
    return createDeskContext<T>(options);
  };

  const isCheckedIn = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    id: string | number | Ref<string | number>,
  ): ComputedRef<boolean> => {
    return computed(() => {
      const itemId = typeof id === "object" && "value" in id ? id.value : id;
      return desk.has(itemId);
    });
  };

  const getRegistry = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    options?: { sortBy?: keyof T | "timestamp"; order?: "asc" | "desc" },
  ): ComputedRef<CheckInItem<T>[]> => {
    return computed(() => desk.getAll(options));
  };

  const clearIdCache = (resetCounter = false) => {
    const customIdCount = customIdMap.size;
    customIdMap.clear();

    if (resetCounter) {
      instanceCounter = 0;
    }

    debug(
      `[useCheckIn] Cleared ${customIdCount} custom IDs from cache` +
        (resetCounter ? " and reset counter" : ""),
    );
  };

  return {
    createDesk,
    checkIn,
    generateId,
    memoizedId,
    standaloneDesk,
    isCheckedIn,
    getRegistry,
    clearIdCache,
  };
};

export type { CheckInPlugin } from "./types";
export {
  createActiveItemPlugin,
  createValidationPlugin,
  createLoggerPlugin,
  createHistoryPlugin,
  type ValidationOptions,
  type LoggerOptions,
  type HistoryOptions,
  type HistoryEntry,
} from "./plugins";
```

```ts [src/composables/use-check-in/types.ts]
import type { CheckInDesk } from "./useCheckIn";

export interface CheckInPlugin<T = any> {
  name: string;

  version?: string;

  install?: (desk: CheckInDesk<T>) => void | (() => void);

  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;

  onCheckIn?: (id: string | number, data: T) => void;

  onBeforeCheckOut?: (id: string | number) => void | boolean;

  onCheckOut?: (id: string | number) => void;

  methods?: Record<string, (desk: CheckInDesk<T>, ...args: any[]) => any>;

  computed?: Record<string, (desk: CheckInDesk<T>) => any>;
}
```

```ts [src/composables/use-check-in/plugins/activeItem.ts]
import { ref } from "vue";
import type { CheckInPlugin } from "../types";
import type { CheckInDesk } from "../useCheckIn";

export const createActiveItemPlugin = <T = any,>(): CheckInPlugin<T> => ({
  name: "active-item",
  version: "1.0.0",

  install: (desk) => {
    const activeId = ref<string | number | null>(null);
    (desk as any).activeId = activeId;

    return () => {
      activeId.value = null;
    };
  },

  methods: {
    setActive(desk: CheckInDesk<T>, id: string | number | null) {
      const deskWithActive = desk as any;
      const previousId = deskWithActive.activeId?.value;

      if (id === null) {
        deskWithActive.activeId.value = null;

        desk.emit("active-changed" as any, {
          id: undefined,
          data: undefined,
        });
        return true;
      }

      if (!desk.has(id)) return false;

      deskWithActive.activeId.value = id;
      desk.emit("active-changed" as any, {
        id,
        data: desk.get(id)?.data,
      });
      return true;
    },

    getActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      const id = deskWithActive.activeId?.value;
      return id ? desk.get(id) : null;
    },

    clearActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      return deskWithActive.setActive?.(null);
    },
  },

  computed: {
    hasActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      return deskWithActive.activeId?.value !== null;
    },
  },
});
```

```ts [src/composables/use-check-in/plugins/example.ts]
import {
  useCheckIn,
  createActiveItemPlugin,
  createLoggerPlugin,
} from "../../useCheckIn";

interface DrawingHandler {
  type: "marker" | "circle" | "polyline" | "polygon" | "rectangle";
  enable: () => void;
  disable: () => void;
  supportsRepeatMode?: boolean;
}

const { createDesk } = useCheckIn<DrawingHandler>();

const { desk } = createDesk("drawingHandlers", {
  debug: true,

  plugins: [
    createActiveItemPlugin(),

    createLoggerPlugin({
      prefix: "[FeaturesEditor]",
      verbose: true,
    }),
  ],
});

desk.checkIn("marker", {
  type: "marker",
  enable: () => console.log("Marker drawing enabled"),
  disable: () => console.log("Marker drawing disabled"),
  supportsRepeatMode: true,
});

desk.checkIn("circle", {
  type: "circle",
  enable: () => console.log("Circle drawing enabled"),
  disable: () => console.log("Circle drawing disabled"),
  supportsRepeatMode: true,
});

(desk as any).setActive("marker");

const activeHandler = (desk as any).getActive();
console.log(activeHandler?.data.type);

(desk as any).setActive("circle");

watch(
  () => (desk as any).activeId?.value,
  (activeId) => {
    console.log("Active handler changed:", activeId);

    if (activeId) {
      const handler = desk.get(activeId);
      handler?.data.enable();
    }
  },
);
```

```ts [src/composables/use-check-in/plugins/history.ts]
import { ref } from "vue";
import type { CheckInPlugin } from "../types";
import type { CheckInDesk, CheckInItem } from "../useCheckIn";

export interface HistoryEntry<T = any> {
  action: "check-in" | "check-out" | "update";
  id: string | number;
  data?: T;
  timestamp: number;
}

export interface HistoryOptions {
  maxHistory?: number;
}

export const createHistoryPlugin = <T = any,>(
  options?: HistoryOptions,
): CheckInPlugin<T> => {
  const maxHistory = options?.maxHistory || 50;

  return {
    name: "history",
    version: "1.0.0",

    install: (desk) => {
      const history = ref<HistoryEntry<T>[]>([]);

      (desk as any).history = history;

      const unsubCheckIn = desk.on("check-in", ({ id, data, timestamp }) => {
        history.value.push({
          action: "check-in",
          id: id!,
          data: data as any,
          timestamp,
        });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      const unsubCheckOut = desk.on("check-out", ({ id, timestamp }) => {
        history.value.push({ action: "check-out", id: id!, timestamp });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      const unsubUpdate = desk.on("update", ({ id, data, timestamp }) => {
        history.value.push({
          action: "update",
          id: id!,
          data: data as any,
          timestamp,
        });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      return () => {
        unsubCheckIn();
        unsubCheckOut();
        unsubUpdate();
        history.value = [];
      };
    },

    methods: {
      getHistory(desk: CheckInDesk<T>): HistoryEntry<T>[] {
        return (desk as any).history?.value || [];
      },

      clearHistory(desk: CheckInDesk<T>) {
        const deskWithHistory = desk as any;
        if (deskWithHistory.history) {
          deskWithHistory.history.value = [];
        }
      },

      getLastHistory(desk: CheckInDesk<T>, count: number): HistoryEntry<T>[] {
        const history = (desk as any).history?.value || [];
        return history.slice(-count);
      },

      getHistoryByAction(
        desk: CheckInDesk<T>,
        action: "check-in" | "check-out" | "update",
      ): HistoryEntry<T>[] {
        const history = (desk as any).history?.value || [];
        return history.filter(
          (entry: HistoryEntry<T>) => entry.action === action,
        );
      },
    },
  };
};
```

```ts [src/composables/use-check-in/plugins/index.ts]
export { createActiveItemPlugin } from "./activeItem";
export { createValidationPlugin, type ValidationOptions } from "./validation";
export { createLoggerPlugin, type LoggerOptions } from "./logger";
export {
  createHistoryPlugin,
  type HistoryOptions,
  type HistoryEntry,
} from "./history";
```

```ts [src/composables/use-check-in/plugins/logger.ts]
import type { CheckInPlugin } from "../types";

export interface LoggerOptions {
  prefix?: string;

  logLevel?: "info" | "debug";

  verbose?: boolean;
}

export const createLoggerPlugin = <T = any,>(
  options?: LoggerOptions,
): CheckInPlugin<T> => {
  const prefix = options?.prefix || "[CheckIn]";
  const verbose = options?.verbose ?? false;

  return {
    name: "logger",
    version: "1.0.0",

    onCheckIn: (id, data) => {
      if (verbose) {
        console.log(`${prefix} ✅ Item checked in:`, { id, data });
      } else {
        console.log(`${prefix} ✅ Item checked in:`, id);
      }
    },

    onCheckOut: (id) => {
      console.log(`${prefix} ❌ Item checked out:`, id);
    },
  };
};
```

```ts [src/composables/use-check-in/plugins/validation.ts]
import type { CheckInPlugin } from "../types";

export interface ValidationOptions<T = any> {
  required?: (keyof T)[];

  validate?: (data: T) => boolean | string;
}

export const createValidationPlugin = <T = any,>(
  options: ValidationOptions<T>,
): CheckInPlugin<T> => ({
  name: "validation",
  version: "1.0.0",

  onBeforeCheckIn: (id, data) => {
    if (options.required) {
      for (const field of options.required) {
        if (data[field] === undefined || data[field] === null) {
          console.error(
            `[Validation Plugin] Field '${String(field)}' is required for item ${id}`,
          );
          return false;
        }
      }
    }

    if (options.validate) {
      const result = options.validate(data);
      if (result === false) {
        console.error(`[Validation Plugin] Validation failed for item ${id}`);
        return false;
      }
      if (typeof result === "string") {
        console.error(`[Validation Plugin] ${result}`);
        return false;
      }
    }

    return true;
  },
});
```

```ts [src/composables/use-colors/useColors.ts]
export const useColors = () => {
  const oklchToRgb = (
    l: number,
    c: number,
    h: number,
  ): { r: number; g: number; b: number } => {
    const hRad = (h * Math.PI) / 180;

    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    const gammaCorrect = (val: number): number => {
      if (val <= 0.0031308) {
        return 12.92 * val;
      }
      return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
    };

    r = gammaCorrect(r);
    g = gammaCorrect(g);
    bl = gammaCorrect(bl);

    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    bl = Math.max(0, Math.min(1, bl));

    return { r, g, b: bl };
  };

  const oklabToRgb = (
    l: number,
    a: number,
    b: number,
  ): { r: number; g: number; b: number } => {
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    const gammaCorrect = (val: number): number => {
      if (val <= 0.0031308) {
        return 12.92 * val;
      }
      return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
    };

    r = gammaCorrect(r);
    g = gammaCorrect(g);
    bl = gammaCorrect(bl);

    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    bl = Math.max(0, Math.min(1, bl));

    return { r, g, b: bl };
  };

  const parseOklchOrOklab = (
    colorString: string,
  ): { r: number; g: number; b: number } | null => {
    const defaultColor = { r: 0.2, g: 0.53, b: 1.0 };

    const oklchMatch = colorString.match(
      /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+%?))?\s*\)/i,
    );
    if (oklchMatch) {
      let l = parseFloat(oklchMatch[1]!);
      const c = parseFloat(oklchMatch[2]!);
      const h = parseFloat(oklchMatch[3]!);

      if (oklchMatch[1]!.includes("%") || l > 1) {
        l = l / 100;
      }

      return oklchToRgb(l, c, h);
    }

    const oklabMatch = colorString.match(
      /oklab\(\s*([\d.]+)%?\s+([-\d.]+)\s+([-\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)/i,
    );
    if (oklabMatch) {
      let l = parseFloat(oklabMatch[1]!);
      const a = parseFloat(oklabMatch[2]!);
      const b = parseFloat(oklabMatch[3]!);

      if (oklabMatch[1]!.includes("%") || l > 1) {
        l = l / 100;
      }

      return oklabToRgb(l, a, b);
    }

    return null;
  };

  const parseColor = (color: string): { r: number; g: number; b: number } => {
    const defaultColor = { r: 0.2, g: 0.53, b: 1.0 };

    if (!color) return defaultColor;

    if (color.startsWith("oklch") || color.startsWith("oklab")) {
      const result = parseOklchOrOklab(color);
      if (result) return result;
      return defaultColor;
    }

    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      if (hex.length === 3 && hex[0] && hex[1] && hex[2]) {
        return {
          r: parseInt(hex[0] + hex[0], 16) / 255,
          g: parseInt(hex[1] + hex[1], 16) / 255,
          b: parseInt(hex[2] + hex[2], 16) / 255,
        };
      } else if (hex.length === 6) {
        return {
          r: parseInt(hex.substring(0, 2), 16) / 255,
          g: parseInt(hex.substring(2, 4), 16) / 255,
          b: parseInt(hex.substring(4, 6), 16) / 255,
        };
      }
    }

    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
      return {
        r: parseInt(rgbMatch[1]) / 255,
        g: parseInt(rgbMatch[2]) / 255,
        b: parseInt(rgbMatch[3]) / 255,
      };
    }

    return defaultColor;
  };

  return {
    oklchToRgb,
    oklabToRgb,
    parseOklchOrOklab,
    parseColor,
  };
};
```

```ts [src/composables/use-quadtree/useQuadtree.ts]
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
| `LeafletStylesKey`{.primary .text-primary} | `stylesOptions` | `any` | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |

---

## LeafletCanvas
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id`{.primary .text-primary} | `string \| number` | - |  |
| `corners`{.primary .text-primary} | `Array<{ lat: number; lng: number }>` | [object Object],[object Object],[object Object],[object Object] |  |
| `width`{.primary .text-primary} | `number` | 400 |  |
| `height`{.primary .text-primary} | `number` | 300 |  |
| `editable`{.primary .text-primary} | `boolean` | false |  |
| `draggable`{.primary .text-primary} | `boolean` | false |  |
| `selectable`{.primary .text-primary} | `boolean` | false |  |
| `subdivisions`{.primary .text-primary} | `number` | 20 |  |
| `opacity`{.primary .text-primary} | `number` | 1 |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `LeafletStylesKey`{.primary .text-primary} | `stylesOptions` | `any` | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |
| `LeafletSelectionKey`{.primary .text-primary} | `undefined` | `any` | — |

  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `sourceCanvas`{.primary .text-primary} | `Ref<HTMLCanvasElement \| null>` | — |
| `redraw`{.primary .text-primary} | `() => void` | — |

---

## LeafletCanvasGL
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id`{.primary .text-primary} | `string \| number` | - |  |
| `corners`{.primary .text-primary} | `Array<{ lat: number; lng: number }>` | [object Object],[object Object],[object Object],[object Object] |  |
| `width`{.primary .text-primary} | `number` | 400 |  |
| `height`{.primary .text-primary} | `number` | 300 |  |
| `editable`{.primary .text-primary} | `boolean` | false |  |
| `draggable`{.primary .text-primary} | `boolean` | false |  |
| `selectable`{.primary .text-primary} | `boolean` | false |  |
| `subdivisions`{.primary .text-primary} | `number` | 20 |  |
| `opacity`{.primary .text-primary} | `number` | 1 |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `LeafletStylesKey`{.primary .text-primary} | `stylesOptions` | `any` | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `LeafletModuleKey`{.primary .text-primary} | `ref()` | `any` | — |
| `LeafletMapKey`{.primary .text-primary} | `ref(null)` | `any` | — |
| `LeafletSelectionKey`{.primary .text-primary} | `undefined` | `any` | — |

  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `sourceCanvas`{.primary .text-primary} | `Ref<HTMLCanvasElement \| null>` | — |
| `redraw`{.primary .text-primary} | `() => void` | — |

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
| `LeafletStylesKey`{.primary .text-primary} | `ref()` | `any` | — |

---

## LeafletFeatureRectangle
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
| `LeafletStylesKey`{.primary .text-primary} | `ref()` | `any` | — |

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
| `LeafletSelectionKey`{.primary .text-primary} | `context as any` | `any` | — |

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
| `mode`{.primary .text-primary} | `'line' \| 'polygon'` | polygon |  |
| `unit`{.primary .text-primary} | `'metric' \| 'imperial'` | metric |  |
| `showArea`{.primary .text-primary} | `boolean` | true |  |
| `showPerimeter`{.primary .text-primary} | `boolean` | true |  |
| `snap`{.primary .text-primary} | `string \| number` | 20 |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `LeafletStylesKey`{.primary .text-primary} | `stylesOptions` | `any` | — |

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

::tip
You can copy and adapt this template for any component documentation.
::