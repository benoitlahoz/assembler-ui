<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button } from '@/components/ui/button';
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
  type LeafletMapExposed,
  type FeatureDrawEvent,
  type FeatureShapeType,
  type FeatureSelectMode,
} from '~~/registry/new-york/components/leaflet-map';
import { Icon } from '@iconify/vue';

const mapRef = ref<LeafletMapExposed | null>(null);

// Mode édition global
const editMode = ref(true); // Start with edit mode enabled

// Current mode from DrawControl (can be drawing mode or selection mode)
const currentMode = ref<FeatureShapeType | FeatureSelectMode | null>('select'); // Start in select mode

// Computed selection mode for LeafletFeaturesSelector (only 'select' or 'direct-select')
const selectionMode = computed<FeatureSelectMode | null>(() => {
  if (currentMode.value === 'select') return 'select';
  if (currentMode.value === 'direct-select') return 'direct-select';
  return null;
});

// Check if we're in selection mode
const isSelectMode = computed(() => selectionMode.value !== null);

// Données pour les différentes shapes
const markers = ref([
  { id: 1, lat: 48.8566, lng: 2.3522, label: 'Paris' },
  { id: 2, lat: 48.8738, lng: 2.295, label: 'Arc de Triomphe' },
  { id: 3, lat: 48.8584, lng: 2.2945, label: 'Tour Eiffel' },
]);

const circles = ref([
  { id: 1, lat: 48.8566, lng: 2.3522, radius: 500, class: 'border border-blue-500 bg-blue-500/20' },
  {
    id: 2,
    lat: 48.8738,
    lng: 2.295,
    radius: 300,
    class: 'border border-green-500 bg-green-500/30',
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
    class: 'border border-red-500',
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
    class: 'border border-purple-500 bg-purple-500/30',
  },
]);

const rectangles = ref([
  {
    id: 1,
    bounds: [
      [48.84, 2.28],
      [48.845, 2.29],
    ] as [[number, number], [number, number]],
    class: 'border border-orange-500 bg-orange-500/20',
  },
]);

// Handle mode selection from DrawControl and LeafletControls
const handleModeSelected = (mode: string | null) => {
  console.log('Mode selected:', mode, 'Current mode:', currentMode.value);

  // Toggle behavior: if clicking the same mode, deactivate it
  if (currentMode.value === mode) {
    currentMode.value = null;
  } else {
    currentMode.value = mode as FeatureShapeType | FeatureSelectMode | null;
  }

  console.log('New current mode:', currentMode.value);
};

// Gestion de la création de nouvelles formes
const handleShapeCreated = (event: FeatureDrawEvent) => {
  const { layer, layerType } = event;

  switch (layerType) {
    case 'marker': {
      const latlng = (layer as any).getLatLng();
      const newId = markers.value.length > 0 ? Math.max(...markers.value.map((m) => m.id)) + 1 : 1;
      markers.value.push({
        id: newId,
        lat: latlng.lat,
        lng: latlng.lng,
        label: `Marker ${newId}`,
      });
      break;
    }
    case 'circle': {
      const latlng = (layer as any).getLatLng();
      const radius = (layer as any).getRadius();
      const newId = circles.value.length > 0 ? Math.max(...circles.value.map((c) => c.id)) + 1 : 1;
      circles.value.push({
        id: newId,
        lat: latlng.lat,
        lng: latlng.lng,
        radius: radius,
        class: 'border border-blue-500 bg-blue-500/20',
      });
      break;
    }
    case 'polyline': {
      const latlngs = (layer as any)
        .getLatLngs()
        .map((ll: any) => [ll.lat, ll.lng] as [number, number]);
      const newId =
        polylines.value.length > 0 ? Math.max(...polylines.value.map((p) => p.id)) + 1 : 1;
      polylines.value.push({
        id: newId,
        latlngs: latlngs,
        class: 'border border-red-500',
        weight: 4,
      });
      break;
    }
    case 'polygon': {
      const latlngs = (layer as any)
        .getLatLngs()[0]
        .map((ll: any) => [ll.lat, ll.lng] as [number, number]);
      const newId =
        polygons.value.length > 0 ? Math.max(...polygons.value.map((p) => p.id)) + 1 : 1;
      polygons.value.push({
        id: newId,
        latlngs: latlngs,
        class: 'border border-purple-500 bg-purple-500/30',
      });
      break;
    }
    case 'rectangle': {
      const bounds = (layer as any).getBounds();
      const newId =
        rectangles.value.length > 0 ? Math.max(...rectangles.value.map((r) => r.id)) + 1 : 1;
      rectangles.value.push({
        id: newId,
        bounds: [
          [bounds.getSouth(), bounds.getWest()],
          [bounds.getNorth(), bounds.getEast()],
        ] as [[number, number], [number, number]],
        class: 'border border-orange-500 bg-orange-500/20',
      });
      break;
    }
  }

  // After creating a shape, switch back to select mode
  // so the newly created shape becomes selectable immediately
  currentMode.value = 'select';
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
        {{ editMode ? 'Disable edition' : 'Enable edition' }}
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

        <!-- Draw Control - UI for selecting modes -->
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

        <LeafletControls
          position="topleft"
          :active-item="currentMode"
          @item-clicked="handleModeSelected"
        >
          <LeafletControlItem name="select" type="toggle" title="Selection Tool (V)">
            <Icon icon="gis:arrow" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem name="direct-select" type="toggle" title="Direct Selection Tool (A)">
            <Icon icon="gis:arrow-o" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem name="marker" type="toggle" title="Draw Marker">
            <Icon icon="gis:poi" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem name="rectangle" type="toggle" title="Draw Rectangle">
            <Icon icon="gis:rectangle" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem name="circle" type="toggle" title="Draw Circle">
            <Icon icon="gis:circle" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem name="polyline" type="toggle" title="Draw Polyline">
            <Icon icon="gis:polyline" class="w-4 h-4 text-black" />
          </LeafletControlItem>
          <LeafletControlItem name="polygon" type="toggle" title="Draw Polygon">
            <Icon icon="gis:polygon" class="w-4 h-4 text-black" />
          </LeafletControlItem>
        </LeafletControls>

        <!-- Features Editor - Drawing logic -->
        <LeafletFeaturesEditor
          :enabled="editMode"
          :mode="currentMode"
          :shape-options="{ color: '#3388ff', fillOpacity: 0.2 }"
          @draw:created="handleShapeCreated"
        >
          <!-- Selection Manager - Selection, bounding box, transformation, rotation -->
          <LeafletFeaturesSelector :enabled="isSelectMode" :mode="selectionMode">
            <!-- Shapes with conditional props based on currentMode -->
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

            <!-- Custom bounding box styling. Note that a default bounding box component is inserted in the `#bounding-box` slot -->
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
        </LeafletFeaturesEditor>
      </LeafletMap>
    </div>
  </div>
</template>
