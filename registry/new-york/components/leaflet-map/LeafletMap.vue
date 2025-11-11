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
  onBeforeUnmount,
} from 'vue';
import { cn } from '@/lib/utils';
import { useLeaflet } from '~~/registry/new-york/composables/use-leaflet/useLeaflet';
import { LeafletErrorsKey, LeafletMapKey, LeafletModuleKey, LeafletTileLayersKey } from '.';
import type Leaflet from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
type Leaflet = typeof Leaflet;

export interface LeafletMapExposed {
  map: Ref<Leaflet.Map | null | any>;
  errors: Ref<Error[]>;
  locate: () => Leaflet.Map | null;
}

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

const emit = defineEmits<{
  (e: 'click', event: LeafletMouseEvent): void;
  (e: 'location:found', event: Leaflet.LocationEvent): void;
  (e: 'location:error', event: Leaflet.ErrorEvent): void;
}>();

// Load Leaflet only on client side.
const L = ref<Leaflet | undefined>(undefined);
provide(LeafletModuleKey, L);

const mapName = computed(() => props.name || 'map');

const map = ref<Leaflet.Map | null>(null);
const errors = ref<Error[]>([]);
const tileLayers = ref<
  Array<Leaflet.TileLayerOptions & { name: string } & { urlTemplate: string }>
>([]);
const currentTileLayer = ref<Leaflet.TileLayer | null>(null);

provide<Ref<Leaflet.Map | null>>(LeafletMapKey, map as any);
provide<Ref<Array<Leaflet.TileLayerOptions & { name: string } & { urlTemplate: string }>>>(
  LeafletTileLayersKey,
  tileLayers as any
);
provide<Ref<Error[]>>(LeafletErrorsKey, errors);

const centerLat = computed(() => Number(props.centerLat) || 43.280608);
const centerLng = computed(() => Number(props.centerLng) || 5.350242);
const zoom = computed(() => Number(props.zoom) || 13);

const tileLayerForName = () => {
  const layer = tileLayers.value.find(
    (layerOptions) => (layerOptions as any).name === props.tileLayer
  );
  if (layer) {
    return { ...layer, crossOrigin: true };
  }
};

const locate = () => {
  if (map.value && map.value.locate) {
    return map.value.locate({ setView: true, maxZoom: zoom.value });
  }
  return null;
};

const onLocationFound = (event: Leaflet.LocationEvent) => {
  if (map.value && L) {
    emit('location:found', event);
  }
};

const onLocationError = (event: Leaflet.ErrorEvent) => {
  emit('location:error', event);
  errors.value.push(new Error(event.message));
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
    if (map.value && L.value && props.tileLayer) {
      const layerOptions = tileLayerForName();
      if (layerOptions) {
        if (currentTileLayer.value) {
          currentTileLayer.value.remove();
        }
        currentTileLayer.value = L.value
          .tileLayer(layerOptions.urlTemplate, layerOptions)
          .addTo(map.value as any);
      }
    }
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  try {
    nextTick(async () => {
      if (typeof window === 'undefined') return;

      const { L: ImportedLeaflet } = await useLeaflet();
      L.value = ImportedLeaflet.value;

      nextTick(() => {
        if (!L.value) return;
        map.value = L.value
          .map(mapName.value, { zoomControl: false })
          .setView([centerLat.value, centerLng.value], zoom.value);

        map.value.on('click', (event: LeafletMouseEvent) => {
          emit('click', event);
        });
        map.value.on('locationfound', onLocationFound);
        map.value.on('locationerror', onLocationError);

        if (props.tileLayer) {
          const layerOptions = tileLayerForName();
          if (layerOptions) {
            if (currentTileLayer.value) {
              currentTileLayer.value.remove();
            }
            currentTileLayer.value = L.value
              .tileLayer(layerOptions.urlTemplate, layerOptions)
              .addTo(map.value as any);
          }
        }
      });
    });
  } catch (error) {
    console.error('Error loading Leaflet:', error);
    errors.value.push(error as Error);
  }
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.off();
    map.value.remove();
    map.value = null;
  }
});

defineExpose<LeafletMapExposed>({
  map,
  errors,
  locate,
});
</script>

<template>
  <div :id="mapName" :class="cn('w-full h-full', props.class)" :style="props.style">
    <slot :map="map" :errors="errors" :locate="locate" />
  </div>
</template>
