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

export const motionVariants = cva({
  variants: {
    gradient: {
      default: 'bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500',
      fire: 'bg-gradient-to-b from-yellow-400 via-red-500 to-pink-600',
      ocean: 'bg-gradient-to-b from-teal-400 via-blue-500 to-indigo-600',
    },
  },
  defaultVariants: {
    gradient: 'default',
  },
});

export type AudioMotionVariants = VariantProps<typeof motionVariants>;

export { type AudioVisualizerMode } from './AudioVisualizer.vue';

export { type AudioVisualizerProps } from './AudioVisualizer.vue';
