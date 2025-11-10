<script setup lang="ts">
import { ref, inject, type Ref, watch, onBeforeUnmount } from 'vue';
import { type ControlOptions } from 'leaflet';
import { LeafletMapKey, LeafletModuleKey } from '.';

export interface LeafletZoomControlProps {
  position?: ControlOptions['position'];
}

const props = withDefaults(defineProps<LeafletZoomControlProps>(), {
  position: 'topright',
});

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const control = ref<L.Control.Zoom | null>(null);

watch(
  () => map.value,
  (newMap) => {
    if (newMap && L.value) {
      control.value = L.value.control.zoom({ position: props.position });
      control.value.addTo(newMap);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (control.value && map.value) {
    map.value.removeControl(control.value);
  }
});
</script>

<template>
  <div></div>
</template>
