<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Button } from '@/components/ui/button';
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
} from '~~/registry/new-york/components/leaflet-map';

const mapRef = ref<LeafletMapExposed | null>(null);

// Shape selection for bounding box
const selectedShape = ref<{
  type: 'marker' | 'circle' | 'polyline' | 'polygon' | 'rectangle';
  id: number;
} | null>(null);

// Mode édition global
const editMode = ref(false);

// Current drawing/editing mode
const currentMode = ref<
  'marker' | 'circle' | 'polyline' | 'polygon' | 'rectangle' | 'select' | 'directSelect' | null
>(null);

// Current edit mode (select or directSelect)
const currentEditMode = ref<'select' | 'directSelect' | null>(null);

// Données pour les différentes shapes
const markers = ref([
  { id: 1, lat: 48.8566, lng: 2.3522, label: 'Paris' },
  { id: 2, lat: 48.8738, lng: 2.295, label: 'Arc de Triomphe' },
  { id: 3, lat: 48.8584, lng: 2.2945, label: 'Tour Eiffel' },
]);

const circles = ref([
  { id: 1, lat: 48.8566, lng: 2.3522, radius: 500, class: 'text-blue-500 bg-blue-500/20' },
  { id: 2, lat: 48.8738, lng: 2.295, radius: 300, class: 'text-green-500 bg-green-500/30' },
]);

const polylines = ref([
  {
    id: 1,
    latlngs: [
      [48.8566, 2.3522],
      [48.8738, 2.295],
      [48.8584, 2.2945],
    ] as Array<[number, number]>,
    class: 'text-red-500',
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
    class: 'text-purple-500 bg-purple-500/30',
  },
]);

const rectangles = ref([
  {
    id: 1,
    bounds: [
      [48.84, 2.28],
      [48.845, 2.29],
    ] as [[number, number], [number, number]],
    class: 'text-orange-500 bg-orange-500/20',
  },
]);

// État d'édition - separate move and edit
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

// Synchroniser l'état d'édition des shapes avec le mode global
watch(editMode, (enabled) => {
  if (!enabled) {
    // Reset all edit states when disabling edit mode
    Object.keys(moveableShapes.value).forEach((key) => {
      moveableShapes.value[key as keyof typeof moveableShapes.value] = false;
    });
    Object.keys(editableShapes.value).forEach((key) => {
      editableShapes.value[key as keyof typeof editableShapes.value] = false;
    });
  }
});

// Watch edit mode changes from features editor
const handleEditModeChanged = (mode: 'select' | 'directSelect' | null) => {
  currentEditMode.value = mode;

  // Clear selection when changing modes
  if (mode !== 'select') {
    selectedShape.value = null;
  }

  if (mode === 'select') {
    // Enable select (draggable + transform) for all shapes
    Object.keys(moveableShapes.value).forEach((key) => {
      moveableShapes.value[key as keyof typeof moveableShapes.value] = true;
    });
    // Disable direct edit for all shapes
    Object.keys(editableShapes.value).forEach((key) => {
      editableShapes.value[key as keyof typeof editableShapes.value] = false;
    });
  } else if (mode === 'directSelect') {
    // Disable select for all shapes
    Object.keys(moveableShapes.value).forEach((key) => {
      moveableShapes.value[key as keyof typeof moveableShapes.value] = false;
    });
    // Enable direct edit (points/radius) for all shapes
    Object.keys(editableShapes.value).forEach((key) => {
      editableShapes.value[key as keyof typeof editableShapes.value] = true;
    });
  } else {
    // Disable both select and direct edit
    Object.keys(moveableShapes.value).forEach((key) => {
      moveableShapes.value[key as keyof typeof moveableShapes.value] = false;
    });
    Object.keys(editableShapes.value).forEach((key) => {
      editableShapes.value[key as keyof typeof editableShapes.value] = false;
    });
  }
};

// Handle mode selection from control
const handleModeSelected = (
  mode:
    | 'marker'
    | 'circle'
    | 'polyline'
    | 'polygon'
    | 'rectangle'
    | 'select'
    | 'directSelect'
    | null
) => {
  currentMode.value = mode;
};

// Handle mode change from editor (for sync)
const handleModeChanged = (
  mode: 'marker' | 'circle' | 'polyline' | 'polygon' | 'rectangle' | null
) => {
  currentMode.value = mode;
};

// Gestion de la création de nouvelles formes
const handleShapeCreated = (event: DrawEvent) => {
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
        class: 'text-blue-500 bg-blue-500/20',
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
        class: 'text-red-500',
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
        class: 'text-purple-500 bg-purple-500/30',
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
        class: 'text-orange-500 bg-orange-500/20',
      });
      break;
    }
  }
};

// Gestion des mises à jour
const updateMarker = (id: number, lat: number, lng: number) => {
  const marker = markers.value.find((m) => m.id === id);
  if (marker) {
    marker.lat = lat;
    marker.lng = lng;
  }
};

const updateCircle = (id: number, updates: { lat?: number; lng?: number; radius?: number }) => {
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

const updateRectangle = (id: number, bounds: [[number, number], [number, number]]) => {
  const rectangle = rectangles.value.find((r) => r.id === id);
  if (rectangle) {
    rectangle.bounds = bounds;
  }
};

const onPolygonClosed = (id: number) => {
  editableShapes.value.polygons = false;
};

// Shape selection handlers
const selectShape = (
  type: 'marker' | 'circle' | 'polyline' | 'polygon' | 'rectangle',
  id: number
) => {
  if (currentEditMode.value === 'select') {
    selectedShape.value = { type, id };
  }
};

// Computed bounding box
const boundingBox = computed(() => {
  if (!selectedShape.value || !mapRef.value?.map) return null;

  const L = (window as any).L;
  if (!L) return null;

  const { type, id } = selectedShape.value;

  try {
    switch (type) {
      case 'marker': {
        const marker = markers.value.find((m) => m.id === id);
        if (!marker) return null;
        const point = L.latLng(marker.lat, marker.lng);
        // Create a small bounds around the marker
        const offset = 0.001;
        return L.latLngBounds(
          [marker.lat - offset, marker.lng - offset],
          [marker.lat + offset, marker.lng + offset]
        );
      }
      case 'circle': {
        const circle = circles.value.find((c) => c.id === id);
        if (!circle) return null;
        const center = L.latLng(circle.lat, circle.lng);
        const radiusInDegrees = circle.radius / 111320; // Approximate conversion
        return L.latLngBounds(
          [circle.lat - radiusInDegrees, circle.lng - radiusInDegrees],
          [circle.lat + radiusInDegrees, circle.lng + radiusInDegrees]
        );
      }
      case 'polyline': {
        const polyline = polylines.value.find((p) => p.id === id);
        if (!polyline || polyline.latlngs.length === 0) return null;
        return L.latLngBounds(polyline.latlngs.map((ll) => L.latLng(ll[0], ll[1])));
      }
      case 'polygon': {
        const polygon = polygons.value.find((p) => p.id === id);
        if (!polygon || polygon.latlngs.length === 0) return null;
        return L.latLngBounds(polygon.latlngs.map((ll) => L.latLng(ll[0], ll[1])));
      }
      case 'rectangle': {
        const rectangle = rectangles.value.find((r) => r.id === id);
        if (!rectangle) return null;
        return L.latLngBounds(rectangle.bounds[0], rectangle.bounds[1]);
      }
    }
  } catch (error) {
    console.error('Error computing bounding box:', error);
    return null;
  }

  return null;
});

// Handle bounding box updates (transform operations)
const handleBoundingBoxUpdate = (newBounds: any) => {
  if (!selectedShape.value) return;

  const { type, id } = selectedShape.value;
  const L = (window as any).L;
  if (!L) return;

  // Calculate transformation ratios
  const oldBounds = boundingBox.value;
  if (!oldBounds) return;

  const scaleX =
    (newBounds.getEast() - newBounds.getWest()) / (oldBounds.getEast() - oldBounds.getWest());
  const scaleY =
    (newBounds.getNorth() - newBounds.getSouth()) / (oldBounds.getNorth() - oldBounds.getSouth());
  const centerOld = oldBounds.getCenter();
  const centerNew = newBounds.getCenter();
  const deltaLat = centerNew.lat - centerOld.lat;
  const deltaLng = centerNew.lng - centerOld.lng;

  // Apply transformation to the selected shape
  switch (type) {
    case 'marker': {
      const marker = markers.value.find((m) => m.id === id);
      if (marker) {
        marker.lat = centerNew.lat;
        marker.lng = centerNew.lng;
      }
      break;
    }
    case 'circle': {
      const circle = circles.value.find((c) => c.id === id);
      if (circle) {
        circle.lat += deltaLat;
        circle.lng += deltaLng;
        circle.radius *= (scaleX + scaleY) / 2; // Average scale
      }
      break;
    }
    case 'polyline': {
      const polyline = polylines.value.find((p) => p.id === id);
      if (polyline) {
        polyline.latlngs = polyline.latlngs.map((ll) => {
          const relLat = (ll[0] - centerOld.lat) * scaleY;
          const relLng = (ll[1] - centerOld.lng) * scaleX;
          return [centerNew.lat + relLat, centerNew.lng + relLng] as [number, number];
        });
      }
      break;
    }
    case 'polygon': {
      const polygon = polygons.value.find((p) => p.id === id);
      if (polygon) {
        polygon.latlngs = polygon.latlngs.map((ll) => {
          const relLat = (ll[0] - centerOld.lat) * scaleY;
          const relLng = (ll[1] - centerOld.lng) * scaleX;
          return [centerNew.lat + relLat, centerNew.lng + relLng] as [number, number];
        });
      }
      break;
    }
    case 'rectangle': {
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

        <!-- Draw Control - UI only -->
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

        <!-- Features Editor - Logic only -->
        <LeafletFeaturesEditor
          :enabled="editMode"
          :mode="currentMode"
          :shape-options="{ color: '#3388ff', fillOpacity: 0.2 }"
          @draw:created="handleShapeCreated"
          @mode-changed="handleModeChanged"
          @edit-mode-changed="handleEditModeChanged"
        />

        <!-- Bounding Box for selected shape in select mode -->
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
          <div class="text-lg font-bold text-blue-600">{{ markers.length }}</div>
        </div>
        <div>
          <div class="text-gray-500">Circles</div>
          <div class="text-lg font-bold text-green-600">{{ circles.length }}</div>
        </div>
        <div>
          <div class="text-gray-500">Polylines</div>
          <div class="text-lg font-bold text-red-600">{{ polylines.length }}</div>
        </div>
        <div>
          <div class="text-gray-500">Polygons</div>
          <div class="text-lg font-bold text-purple-600">{{ polygons.length }}</div>
        </div>
        <div>
          <div class="text-gray-500">Rectangles</div>
          <div class="text-lg font-bold text-orange-600">{{ rectangles.length }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
