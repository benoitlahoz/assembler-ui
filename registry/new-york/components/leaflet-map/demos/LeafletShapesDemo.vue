<script setup lang="ts">
import { ref } from 'vue';
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletDrawControl,
  LeafletMarker,
  LeafletCircle,
  LeafletPolyline,
  LeafletPolygon,
  LeafletRectangle,
  type LeafletMapExposed,
} from '..';

const mapRef = ref<LeafletMapExposed | null>(null);

// Mode édition global
const editMode = ref(false);

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

// État d'édition
const editableShapes = ref({
  markers: false,
  circles: false,
  polylines: false,
  polygons: false,
  rectangles: false,
});

// Basculer le mode édition (géré par le contrôle maintenant)
const handleEditModeChange = (enabled: boolean) => {
  editMode.value = enabled;
  // Synchroniser tous les types de shapes avec le mode global
  editableShapes.value.markers = enabled;
  editableShapes.value.circles = enabled;
  editableShapes.value.polylines = enabled;
  editableShapes.value.polygons = enabled;
  editableShapes.value.rectangles = enabled;
};

// Gestion des mises à jour
const updateMarker = (id: number, lat: number, lng: number) => {
  const marker = markers.value.find((m) => m.id === id);
  if (marker) {
    marker.lat = lat;
    marker.lng = lng;
    console.log(`Marker ${id} updated:`, { lat, lng });
  }
};

const updateCircle = (id: number, updates: { lat?: number; lng?: number; radius?: number }) => {
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

const updateRectangle = (id: number, bounds: [[number, number], [number, number]]) => {
  const rectangle = rectangles.value.find((r) => r.id === id);
  if (rectangle) {
    rectangle.bounds = bounds;
    console.log(`Rectangle ${id} updated:`, bounds);
  }
};

// Gestion de la fermeture du polygone
const onPolygonClosed = (id: number) => {
  console.log(`Polygon ${id} closed!`);
  // Désactiver l'édition après fermeture
  editableShapes.value.polygons = false;
};
</script>

<template>
  <div class="w-full h-full flex flex-col gap-4">
    <!-- Info du mode actuel -->
    <div class="p-4 bg-gray-100 rounded">
      <h3 class="font-semibold">Démonstration des formes Leaflet</h3>
      <p class="text-sm text-gray-600">
        {{
          editMode
            ? 'Mode édition activé - Déplacez les formes'
            : 'Mode dessin - Créez de nouvelles formes'
        }}
      </p>
    </div>

    <div
      class="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800"
      v-if="editMode"
    >
      💡 <strong>Mode édition :</strong> Déplacez les marqueurs et modifiez les cercles (points
      blancs). Les polylignes, polygones et rectangles sont déplaçables - cliquez et faites glisser.
    </div>

    <!-- Carte -->
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

        <!-- Contrôle de dessin avec bouton Edit intégré -->
        <LeafletDrawControl
          position="topright"
          :draw="{
            marker: true,
            circle: true,
            polyline: true,
            polygon: true,
            rectangle: true,
          }"
          @edit-mode-change="handleEditModeChange"
        />

        <!-- Marqueurs avec v-for -->
        <LeafletMarker
          v-for="marker in markers"
          :key="`marker-${marker.id}`"
          :lat="marker.lat"
          :lng="marker.lng"
          :editable="editableShapes.markers"
          @update:lat="(lat) => updateMarker(marker.id, lat, marker.lng)"
          @update:lng="(lng) => updateMarker(marker.id, marker.lat, lng)"
        />

        <!-- Cercles avec v-for -->
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

        <!-- Polylignes avec v-for -->
        <LeafletPolyline
          v-for="polyline in polylines"
          :key="`polyline-${polyline.id}`"
          :latlngs="polyline.latlngs"
          :weight="polyline.weight"
          :class="polyline.class"
          :editable="editableShapes.polylines"
          @update:latlngs="(latlngs) => updatePolyline(polyline.id, latlngs)"
        />

        <!-- Polygones avec v-for -->
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

        <!-- Rectangles avec v-for -->
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

    <!-- Statistiques -->
    <div class="p-4 bg-gray-50 rounded">
      <h4 class="font-semibold mb-2">Statistiques</h4>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div>
          <div class="text-gray-500">Marqueurs</div>
          <div class="text-lg font-bold text-blue-600">{{ markers.length }}</div>
        </div>
        <div>
          <div class="text-gray-500">Cercles</div>
          <div class="text-lg font-bold text-green-600">{{ circles.length }}</div>
        </div>
        <div>
          <div class="text-gray-500">Polylignes</div>
          <div class="text-lg font-bold text-red-600">{{ polylines.length }}</div>
        </div>
        <div>
          <div class="text-gray-500">Polygones</div>
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
