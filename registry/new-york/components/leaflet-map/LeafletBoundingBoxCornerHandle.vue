<script setup lang="ts">
import { watch, type HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { useCssParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';

export interface LeafletCornerHandleProps {
  class?: HTMLAttributes['class'];
  size?: number | string;
}

const props = withDefaults(defineProps<LeafletCornerHandleProps>(), {
  class:
    'bg-red-500 border-2 border-red-500 opacity-30 rounded-full shadow-[0_0_4px_0_rgba(0,0,0,0.2)]',
  size: 8,
});

const { withHiddenElement, getTailwindBaseCssValues } = useCssParser();

const tailwindToMarkerHtml = (className: string, size: number | string) => {
  const styles = withHiddenElement((el: HTMLElement) => {
    const config = getTailwindBaseCssValues(el, [
      'background-color',
      'border',
      'border-radius',
      'box-shadow',
      'opacity',
    ]);

    const styleString = Object.entries(config)
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');

    return styleString;
  }, className);

  return `<div style="${styles} width: ${size}px; height: ${size}px;"></div>`;
};

watch(
  () => [props.class, props.size],
  () => {
    // No-op: just to trigger reactivity
    console.log('Props changed:', props.class, props.size);

    const options = {
      html: tailwindToMarkerHtml(props.class || '', props.size || 8),
      iconSize: [props.size || 8, props.size || 8],
    };
    console.log('Marker options:', options);
  },
  { immediate: true }
);
</script>

<template>
  <!-- To enable Tailwind classes computing -->
  <div
    data-slot="leaflet-bounding-box-corner-handle"
    :class="cn('hidden -z-50', props.class)"
  ></div>
</template>
