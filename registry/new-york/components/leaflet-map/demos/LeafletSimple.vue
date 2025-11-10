<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { ref, type ComponentPublicInstance } from 'vue';
import { ClientOnly } from '#components';
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletMarker,
  LeafletCircle,
  type LeafletMapExposed,
} from '~~/registry/new-york/components/leaflet-map';

type LeafletMapInstance = ComponentPublicInstance & LeafletMapExposed;

const mapRef = ref<LeafletMapInstance | null>(null);
const zoom = ref(13);
const locationCoords = ref<{ lat: number; lng: number; accuracy: number } | null>(null);
const onLocate = () => {
  // Ugly way to call the locate method on the LeafletMap component.
  // https://www.answeroverflow.com/m/1398747077265064026
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
        center-lat="44.280608"
        center-lng="5.350242"
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

        <!-- Adds a circle at location -->
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
