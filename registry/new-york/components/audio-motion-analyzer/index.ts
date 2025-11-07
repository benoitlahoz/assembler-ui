/**
 * @type registry:ui
 * @category audio
 *
 * @demo AudioMotionSimple
 * @demo AudioVisualizerSimple
 */

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';
import { type GradientOptions } from 'audiomotion-analyzer';
import { useTailwindClassParser } from '~~/registry/new-york/composables/use-tailwind-class-parser/useTailwindClassParser';

export { default as AudioVisualizer } from './AudioVisualizer.vue';
export { default as AudioMotionAnalyzer } from './AudioMotionAnalyzer.vue';
export { default as AudioMotionGradient } from './AudioMotionGradient.vue';

export const motionVariants = cva('', {
  variants: {
    gradient: {
      classic: 'classic',
      orangered: 'orangered',
      prism: 'prism',
      rainbow: 'rainbow',
      steelblue: 'steelblue',
    },
  },
  defaultVariants: {
    gradient: 'classic',
  },
});

export type AudioMotionVariants = VariantProps<typeof motionVariants>;
export interface AudioMotionGradientDefinition {
  name: string;
  gradient: GradientOptions;
}

export type { AudioMotionAnalyzerProps } from './AudioMotionAnalyzer.vue';
export type { AudioMotionGradientProps } from './AudioMotionGradient.vue';

export const AudioMotionGradientsKey: InjectionKey<Ref<AudioMotionGradientDefinition[]>> =
  Symbol('AudioMotionGradients');

export { type AudioVisualizerMode } from './AudioVisualizer.vue';
export { type AudioVisualizerProps } from './AudioVisualizer.vue';

export const gradientFromClasses = (classes: string = '') => {
  const { getTailwindBaseCssValues, parseGradient } = useTailwindClassParser();

  const el = document.createElement('div');
  el.className = classes;
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.zIndex = '-9999';
  document.body.appendChild(el);

  const computedClass = getTailwindBaseCssValues(el, ['background-image']);
  const computedGradient =
    computedClass['background-image'] && computedClass['background-image'] !== 'none'
      ? parseGradient(computedClass['background-image'])
      : null;

  let gradient: {
    bgColor: string;
    dir?: 'h' | 'v' | undefined;
    colorStops: Array<{ color: string; pos: number }>;
  } | null = null;

  if (computedGradient) {
    gradient = { bgColor: 'rgba(0, 0, 0, 0, 0)', dir: 'v', colorStops: [] };
    gradient.dir =
      computedGradient.direction.includes('bottom') || computedGradient.direction.includes('top')
        ? 'v'
        : 'h';
    gradient.colorStops = computedGradient.stops;
  }

  document.body.removeChild(el);
  return gradient;
};

export const gradientFromElement = (el: HTMLElement | null) => {
  if (!el) return null;

  const classes = el?.className || '';
  const styles = el?.getAttribute('style');

  if (styles) {
    const { parseGradient } = useTailwindClassParser();
    const result = parseGradient(styles);
    if (result) {
      const gradient = { bgColor: 'rgba(0, 0, 0, 0, 0)', dir: 'v', colorStops: [] as any[] };
      gradient.dir =
        result.direction.includes('bottom') || result.direction.includes('top') ? 'v' : 'h';
      gradient.colorStops = result.stops;
      return gradient;
    }
  }

  return gradientFromClasses(classes);
};
