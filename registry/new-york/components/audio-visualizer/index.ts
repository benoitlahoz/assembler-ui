/**
 * @type registry:ui
 * @category audio
 *
 * @demo AudioMotionSimple
 * @demo AudioVisualizerSimple
 */

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { useTailwindClassParser } from '~~/registry/new-york/composables/use-tailwind-class-parser/useTailwindClassParser';

export { default as AudioVisualizer } from './AudioVisualizer.vue';
export { default as AudioMotion } from './AudioMotion.vue';

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

export { type AudioVisualizerMode } from './AudioVisualizer.vue';

export { type AudioVisualizerProps } from './AudioVisualizer.vue';

export const gradientFromClasses = (classes: string = '') => {
  const { getTailwindBaseCssValues, parseLinearGradient } = useTailwindClassParser();

  const el = document.createElement('div');
  el.className = classes;
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.zIndex = '-9999';
  document.body.appendChild(el);

  const computedClass = getTailwindBaseCssValues(el, ['background-image']);

  const computedGradient =
    computedClass['background-image'] && computedClass['background-image'] !== 'none'
      ? parseLinearGradient(computedClass['background-image'])
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
