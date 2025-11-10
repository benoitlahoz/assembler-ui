<script setup lang="ts">
import { computed, inject, ref, watch, type HTMLAttributes } from 'vue';
import { LeafletModuleKey, LeafletTileLayersKey } from '.';

export interface LeafletTileLayerProps {
  name: string;
  urlTemplate: string;
  attribution?: string | undefined;
  class?: HTMLAttributes['class'];
}

const props = defineProps<LeafletTileLayerProps>();

const L = inject(LeafletModuleKey, ref());
const tileLayers = inject(LeafletTileLayersKey, ref([] as any));
const className = computed(() => props.class);

watch(
  () => [L.value, props.name, props.urlTemplate, props.attribution, className.value],
  () => {
    console.warn('LeafletTileLayer watchEffect triggered', L);
    if (!L.value) return;

    const options: L.TileLayerOptions & { name: string } & { urlTemplate: string } = {
      name: props.name,
      attribution: props.attribution,
      urlTemplate: props.urlTemplate,
      className: className.value,
    };

    const existingLayer = tileLayers.value.find(
      (layer: L.TileLayerOptions & { name: string }) => (layer as any).name === props.name
    );

    if (existingLayer) {
      const index = tileLayers.value.indexOf(existingLayer);
      tileLayers.value[index] = options;
      return;
    }

    tileLayers.value.push(options);
  }
);
</script>

<template><slot /></template>
