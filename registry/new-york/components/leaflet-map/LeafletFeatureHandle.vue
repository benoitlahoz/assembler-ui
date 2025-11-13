<script setup lang="ts">
import { watch, inject, type HTMLAttributes, ref } from 'vue';
import { cn } from '@/lib/utils';
import { useCssParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { LeafletStylesKey } from '.';

export type LeafletFeatureHandleRole = 'corner' | 'edge' | 'center' | 'rotate';

export interface LeafletFeatureHandleStyle {
  className: string;
  html: string;
  iconSize: [number, number];
}

export interface LeafletFeatureHandleProps {
  role: LeafletFeatureHandleRole;
  class?: HTMLAttributes['class'];
  size?: number | string;
}

const props = withDefaults(defineProps<LeafletFeatureHandleProps>(), {
  class:
    'bg-red-500 border-2 border-red-500 opacity-30 rounded-full shadow-[0_0_4px_0_rgba(0,0,0,0.2)]',
  size: 8,
});

const { fetchStylesFromElementClass, getTailwindBaseCssValues } = useCssParser();

const stylesOptions = inject(LeafletStylesKey, ref());

const tailwindToMarkerHtml = (className: string, size: number | string) => {
  const styles = fetchStylesFromElementClass((el: HTMLElement) => {
    const config = getTailwindBaseCssValues(el, [
      'background-color',
      'border',
      'border-radius',
      'box-shadow',
    ]);

    const styleString = Object.entries(config ?? {})
      .filter(([_, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}: ${value};`)
      .join(' ');

    return styleString;
  }, className);

  return `<div style="${styles} width: ${size}px; height: ${size}px;"></div>`;
};

watch(
  () => [stylesOptions.value, props.class, props.size],
  () => {
    const options = {
      className: `leaflet-feature-handle leaflet-handle-${props.role}`,
      html: tailwindToMarkerHtml(props.class || '', props.size || 8),
      iconSize: [Number(props.size) || 8, Number(props.size) || 8] as [number, number],
    };

    if (stylesOptions.value) {
      stylesOptions.value[props.role] = options;
    }
  },
  { immediate: true }
);
</script>

<template>
  <!-- To enable Tailwind classes computing -->
  <div data-slot="leaflet-handle-corner" :class="cn('hidden -z-50', props.class)"></div>
</template>
