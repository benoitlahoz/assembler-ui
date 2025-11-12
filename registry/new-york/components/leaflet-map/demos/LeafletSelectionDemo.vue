<script setup lang="ts">
import { ref } from 'vue';
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletMarker,
  LeafletCircle,
  LeafletPolyline,
  LeafletPolygon,
  LeafletRectangle,
  LeafletFeaturesSelector,
  LeafletBoundingBoxRectangle,
  LeafletFeatureHandle,
} from '~~/registry/new-york/components/leaflet-map';

const center = ref([43.280608, 5.350242]);
const zoom = ref(16);

// Markers data
const markers = ref([
  { id: 'marker-1', lat: 43.280608, lng: 5.350242 },
  { id: 'marker-2', lat: 43.282, lng: 5.352 },
]);

// Circles data
const circles = ref([
  { id: 'circle-1', lat: 43.281, lng: 5.349, radius: 200 },
  { id: 'circle-2', lat: 43.2795, lng: 5.351, radius: 150 },
]);

// Polylines data
const polylines = ref([
  {
    id: 'polyline-1',
    latlngs: [
      [43.279, 5.351],
      [43.28, 5.353],
      [43.281, 5.352],
    ] as Array<[number, number]>,
  },
]);

// Polygons data
const polygons = ref([
  {
    id: 'polygon-1',
    latlngs: [
      [43.278, 5.348],
      [43.279, 5.349],
      [43.2795, 5.35],
      [43.2785, 5.3495],
    ] as Array<[number, number]>,
  },
]);

// Rectangles data
const rectangles = ref([
  {
    id: 'rectangle-1',
    bounds: [
      [43.277, 5.345],
      [43.2785, 5.347],
    ] as [[number, number], [number, number]],
  },
]);

const editMode = ref(true);
const selectMode = ref<'select' | 'directSelect' | null>('select');
</script>

<template>
  <div class="h-[600px] w-full flex flex-col">
    <!-- Controls -->
    <div class="p-4 border-b">
      <div class="flex gap-4 items-center">
        <label class="flex items-center gap-2">
          <input v-model="editMode" type="checkbox" />
          <span>Edit Mode</span>
        </label>

        <label class="flex items-center gap-2">
          <span>Select Mode:</span>
          <select v-model="selectMode" class="border rounded px-2 py-1">
            <option :value="null">None</option>
            <option value="select">Select</option>
            <option value="directSelect">Direct Select</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Map -->
    <div class="flex-1">
      <LeafletMap tile-layer="osm" :center-lat="center[0]" :center-lng="center[1]" :zoom="zoom">
        <LeafletTileLayer
          name="osm"
          url-template="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LeafletFeaturesSelector :enabled="editMode" :mode="selectMode">
          <!-- Markers -->
          <LeafletMarker
            v-for="marker in markers"
            :key="marker.id"
            :id="marker.id"
            v-model:lat="marker.lat"
            v-model:lng="marker.lng"
            :selectable="selectMode === 'select'"
            :draggable="editMode"
          />

          <!-- Circles -->
          <LeafletCircle
            v-for="circle in circles"
            :key="circle.id"
            :id="circle.id"
            v-model:lat="circle.lat"
            v-model:lng="circle.lng"
            v-model:radius="circle.radius"
            :selectable="selectMode === 'select'"
            :editable="selectMode === 'directSelect'"
            :draggable="selectMode === 'select' && editMode"
            class="bg-red-500/30 border border-red-500"
          />

          <!-- Polylines -->
          <LeafletPolyline
            v-for="polyline in polylines"
            :key="polyline.id"
            :id="polyline.id"
            v-model:latlngs="polyline.latlngs"
            :selectable="selectMode === 'select'"
            :editable="selectMode === 'directSelect'"
            :draggable="selectMode === 'select' && editMode"
            :weight="4"
            class="border border-blue-500"
          />

          <!-- Polygons -->
          <LeafletPolygon
            v-for="polygon in polygons"
            :key="polygon.id"
            :id="polygon.id"
            v-model:latlngs="polygon.latlngs"
            :selectable="selectMode === 'select'"
            :editable="selectMode === 'directSelect'"
            :draggable="selectMode === 'select' && editMode"
            class="bg-green-500/30 border border-green-500/50"
          />

          <!-- Rectangles -->
          <LeafletRectangle
            v-for="rectangle in rectangles"
            :key="rectangle.id"
            :id="rectangle.id"
            v-model:bounds="rectangle.bounds"
            :selectable="selectMode === 'select'"
            :editable="selectMode === 'directSelect'"
            :draggable="selectMode === 'select' && editMode"
            class="bg-purple-500/50 border border-purple-600"
          />

          <!-- Bounding box with custom styles -->
          <template #bounding-box-styles>
            <LeafletBoundingBoxRectangle class="border-2 border-orange-400" :dashed="[5, 5]" />

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
      </LeafletMap>
    </div>
  </div>
</template>
