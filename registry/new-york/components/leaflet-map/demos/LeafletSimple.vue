<script setup lang="ts">
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletMarker,
} from '~~/registry/new-york/components/leaflet-map';
</script>

<template>
  <ClientOnly>
    <div class="mb-4">This is a simple example of a Leaflet map component.</div>
    <div class="h-128 min-h-128 mb-4">
      <LeafletMap name="marseille" tile-layer="openstreetmap" class="rounded-lg">
        <LeafletTileLayer
          name="openstreetmap"
          url-template="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LeafletMarker />
      </LeafletMap>
    </div>
  </ClientOnly>
</template>
