<script setup lang="ts">
import { watch, inject, type HTMLAttributes, ref } from 'vue';
import { cn } from '@/lib/utils';
import { useCssParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { LeafletStylesKey } from '.';
import { removeWhitespaces } from '@assemblerjs/core';

export interface LeafletFeatureRectangleStyle {
  color: string;
  weight: number;
  fill: boolean;
  fillColor?: string;
  dashArray?: string;
  interactive: boolean;
}

export interface LeafletFeatureRectangleProps {
  class?: HTMLAttributes['class'];
  dashed?: number[];
}

const props = withDefaults(defineProps<LeafletFeatureRectangleProps>(), {
  class: 'border-2 border-blue-500',
});

const stylesOptions = inject(LeafletStylesKey, ref());

const { fetchStylesFromElementClass, getTailwindBaseCssValues } = useCssParser();

const tailwindToBoxOptions = (className: string, dashed?: number[]) => {
  const style = fetchStylesFromElementClass((el: HTMLElement): LeafletFeatureRectangleStyle => {
    const config = getTailwindBaseCssValues(el, [
      'background-color',
      'border-color',
      'border-width',
      'opacity',
    ]);

    const color = config['border-color'] || '#3388ff';
    const weight = config['border-width'] ? parseInt(config['border-width']) : 2;
    const fill: boolean =
      !!config['background-color'] &&
      removeWhitespaces(config['background-color']) !== 'rgba(0,0,0,0)' &&
      config['opacity'] !== '0';
    const fillColor = fill ? config['background-color'] : undefined;

    return {
      color,
      weight,
      fill,
      fillColor,
      dashArray: dashed ? dashed.join(', ') : undefined,
      interactive: false,
    };
  }, className);

  return style;
};

watch(
  () => [stylesOptions.value, props.class, props.dashed],
  () => {
    const options = tailwindToBoxOptions(props.class || '', props.dashed);
    if (stylesOptions.value) {
      stylesOptions.value.rectangle = options;
    }
  },
  { immediate: true }
);
</script>

<template>
  <!-- To enable Tailwind classes computing -->
  <div data-slot="leaflet-handle-rectangle" :class="cn('hidden -z-50', props.class)"></div>
</template>
