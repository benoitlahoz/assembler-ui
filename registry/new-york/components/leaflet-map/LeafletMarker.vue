<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick } from 'vue';
import * as L from 'leaflet';
import { LeafletMapKey } from '.';

export interface LeafletMarkerProps {
  lat?: number | string;
  lng?: number | string;
}

const props = withDefaults(defineProps<LeafletMarkerProps>(), {
  lat: 43.280608,
  lng: 5.350242,
});

const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const marker = ref(L.marker([Number(props.lat), Number(props.lng)]));

watch(
  () => [props.lat, props.lng],
  ([newLat, newLng]) => {
    nextTick(() => {
      if (map.value && newLat && newLng) {
        if (marker.value) {
          marker.value.setLatLng([Number(newLat), Number(newLng)]);
        } else {
          marker.value = L.marker([Number(newLat), Number(newLng)]);
          marker.value.addTo(map.value);
        }
      } else {
        if (marker.value) {
          marker.value.remove();
          marker.value = null as any;
        }
      }
    });
  },
  { immediate: true, deep: true, flush: 'post' }
);

watch(
  () => map.value,
  (newMap) => {
    if (newMap) {
      if (!marker.value) {
        marker.value = L.marker([Number(props.lat), Number(props.lng)]);
      }
      marker.value.addTo(newMap);
    }
  },
  { immediate: true }
);
</script>

<template><slot /></template>
