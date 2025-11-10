<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick, onBeforeUnmount, onMounted } from 'vue';
import { LeafletMapKey, LeafletModuleKey } from '.';

export interface LeafletMarkerProps {
  lat?: number | string;
  lng?: number | string;
}

const props = withDefaults(defineProps<LeafletMarkerProps>(), {
  lat: 43.280608,
  lng: 5.350242,
});

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const marker = ref<L.Marker | null>(null);

watch(
  () => [props.lat, props.lng],
  ([newLat, newLng]) => {
    nextTick(() => {
      if (!L.value) return;
      if (map.value && !isNaN(Number(newLat)) && !isNaN(Number(newLng))) {
        if (marker.value) {
          marker.value.setLatLng([Number(newLat), Number(newLng)]);
        } else {
          marker.value = L.value.marker([Number(newLat), Number(newLng)]);
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
  { immediate: true }
);

watch(
  () => map.value,
  (newMap) => {
    if (newMap && L.value) {
      if (!marker.value) {
        marker.value = L.value.marker([Number(props.lat), Number(props.lng)]);
      }
      marker.value.addTo(newMap);
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (map.value && L.value) {
    if (!marker.value) {
      marker.value = L.value.marker([Number(props.lat), Number(props.lng)]);
    }
    marker.value.addTo(map.value);
  }
});

onBeforeUnmount(() => {
  if (marker.value) {
    marker.value.remove();
  }
});
</script>

<template><slot /></template>
