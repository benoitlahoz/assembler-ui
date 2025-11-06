/**
 * @type registry:ui
 * @category audio
 *
 * @demo AudioMotionSimple
 * @demo AudioVisualizerSimple
 */

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

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
