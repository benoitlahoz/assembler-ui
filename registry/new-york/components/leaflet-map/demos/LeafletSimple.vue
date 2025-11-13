<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue';
import { ClientOnly } from '#components';
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletControls,
  LeafletControlItem,
  LeafletCircle,
  type LeafletMapExposed,
} from '~~/registry/new-york/components/leaflet-map';
import { Icon } from '@iconify/vue';

type LeafletMapInstance = ComponentPublicInstance & LeafletMapExposed;

const mapRef = ref<LeafletMapInstance | null>(null);
const zoom = ref(13);
const locationCoords = ref<{ lat: number; lng: number; accuracy: number }>({
  lat: 43.3026,
  lng: 5.3691,
  accuracy: 500,
});

const onLocate = () => {
  mapRef.value?.locate();
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

        <LeafletControls position="topleft" :enabled="true" @item-clicked="onLocate">
          <LeafletControlItem name="locate" type="push" title="Locate me">
            <Icon icon="gis:location-arrow" class="w-4 h-4 text-black" />
          </LeafletControlItem>
        </LeafletControls>

        <LeafletZoomControl position="topleft" />

        <!-- Adds a circle at location -->
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
