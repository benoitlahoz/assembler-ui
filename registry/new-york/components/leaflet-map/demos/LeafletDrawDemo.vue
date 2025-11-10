<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletDrawControl,
  type DrawEvent,
  type LeafletMapExposed,
} from '..';

const mapRef = ref<LeafletMapExposed | null>(null);
const drawnItems = ref<any>(null);
const createdLayers = ref<Array<{ type: string; layer: any }>>([]);

// Surveiller quand la carte est prête
watch(
  () => mapRef.value?.map,
  async (mapInstance) => {
    if (!mapInstance) return;

    // Petite attente pour s'assurer que Leaflet est complètement initialisé
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Importer dynamiquement Leaflet pour créer le FeatureGroup
    const L = (await import('leaflet')).default;
    drawnItems.value = L.featureGroup().addTo(mapInstance);
  },
  { immediate: true }
);

const onDrawCreated = (event: DrawEvent) => {
  console.log('Shape created:', event.layerType, event.layer);
  createdLayers.value.push({
    type: event.layerType,
    layer: event.layer,
  });
};

const onDrawStart = (event: { layerType: string }) => {
  console.log('Drawing started:', event.layerType);
};

const onDrawStop = (event: { layerType: string }) => {
  console.log('Drawing stopped:', event.layerType);
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
      <span class="text-sm text-gray-600"> Formes dessinées : {{ createdLayers.length }} </span>
    </div>

    <div class="flex-1 relative">
      <LeafletMap
        ref="mapRef"
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
          v-if="drawnItems"
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
        <li v-if="createdLayers.length === 0" class="text-gray-400 text-sm italic">
          Aucune forme dessinée pour le moment
        </li>
      </ul>
    </div>
  </div>
</template>
