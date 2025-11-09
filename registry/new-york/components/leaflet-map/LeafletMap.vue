<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch,
  provide,
  type HTMLAttributes,
  type Ref,
} from 'vue';
import * as L from 'leaflet';
import { cn } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';
import { LeafletMapKey, LeafletTileLayersKey } from '.';

export interface LeafletMapProps {
  class?: HTMLAttributes['class'];
  style?: HTMLAttributes['style'];

  name?: string;
  tileLayer: string;
  centerLat?: number | string;
  centerLng?: number | string;
  zoom?: number | string;
}

const props = withDefaults(defineProps<LeafletMapProps>(), {
  name: 'map',
  centerLat: 43.280608,
  centerLng: 5.350242,
  zoom: 13,
});

const mapName = computed(() => props.name || 'map');

const map = ref<L.Map | null>(null);
const tileLayers = ref<Array<L.TileLayerOptions & { name: string } & { urlTemplate: string }>>([]);
const currentTileLayer = ref<L.TileLayer | null>(null);

provide<Ref<L.Map | null>>(LeafletMapKey, map as any);
provide<Ref<Array<L.TileLayerOptions & { name: string } & { urlTemplate: string }>>>(
  LeafletTileLayersKey,
  tileLayers as any
);

const centerLat = computed(() => Number(props.centerLat) || 43.280608);
const centerLng = computed(() => Number(props.centerLng) || 5.350242);
const zoom = computed(() => Number(props.zoom) || 13);

const tileLayerForName = () => {
  console.log('Tile layers available:', tileLayers.value, props.tileLayer);
  return tileLayers.value.find((layerOptions) => (layerOptions as any).name === props.tileLayer);
};

watch(
  () => [centerLat.value, centerLng.value],
  ([newLat, newLng]) => {
    if (map.value && newLat && newLng) {
      map.value.setView([Number(newLat), Number(newLng)], zoom.value);
    }
  },
  { immediate: true }
);

watch(
  () => zoom.value,
  (newZoom) => {
    if (map.value) {
      map.value.setZoom(Number(newZoom));
    }
  },
  { immediate: true }
);

watch(
  () => props.tileLayer,
  () => {
    if (map.value) {
      const layerOptions = tileLayerForName();
      if (layerOptions) {
        if (currentTileLayer.value) {
          currentTileLayer.value.remove();
        }
        currentTileLayer.value = L.tileLayer(layerOptions.urlTemplate, layerOptions).addTo(
          map.value as any
        );
      }
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  nextTick(() => {
    map.value = L.map(mapName.value).setView([centerLat.value, centerLng.value], zoom.value);
    if (props.tileLayer) {
      const layerOptions = tileLayerForName();
      if (layerOptions) {
        if (currentTileLayer.value) {
          currentTileLayer.value.remove();
        }
        currentTileLayer.value = L.tileLayer(layerOptions.urlTemplate, layerOptions).addTo(
          map.value as any
        );
      }
    }
  });
});
</script>

<template>
  <div :id="mapName" :class="cn('w-full h-full', props.class)" :style="props.style">
    <slot />
  </div>
</template>
