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
import {
  useTailwindClassParser,
  type GradientColorStop,
} from '~~/registry/new-york/composables/use-tailwind-class-parser/useTailwindClassParser';

export const gradientFromClasses = (classes: string = ''): AudioMotionGradientProperties | null => {
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

  let gradient: AudioMotionGradientProperties | null = null;

  if (computedGradient) {
    gradient = { bgColor: 'rgba(0, 0, 0, 0, 0)', dir: 'v', colorStops: [] };
    gradient.dir = (
      computedGradient.direction.includes('bottom') || computedGradient.direction.includes('top')
        ? 'v'
        : 'h'
    ) as 'h' | 'v';
    gradient.colorStops = computedGradient.stops;
  }

  document.body.removeChild(el);
  return gradient;
};

export const gradientFromElement = (
  el: HTMLElement | null
): AudioMotionGradientProperties | null => {
  if (!el) return null;

  const classes = el?.className || '';
  const styles = el?.getAttribute('style');

  if (styles) {
    const { parseGradient } = useTailwindClassParser();
    const result = parseGradient(styles);
    if (result) {
      const gradient = {
        bgColor: 'rgba(0, 0, 0, 0, 0)',
        dir: 'v' as 'h' | 'v',
        colorStops: [] as any[],
      };
      gradient.dir =
        result.direction.includes('bottom') || result.direction.includes('top')
          ? ('v' as const)
          : ('h' as const);
      gradient.colorStops = result.stops;
      return gradient;
    }
  }

  return gradientFromClasses(classes);
};

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

export enum AudioMotionMode {
  Discrete = 0,
  OctaveBands24th = 1,
  OctaveBands12th = 2,
  OctaveBands8th = 3,
  OctaveBands6th = 4,
  OctaveBands4th = 5,
  OctaveBands3rd = 6,
  HalfOctaveBands = 7,
  FullOctaveBands = 8,
  Graph = 10,
}

export enum AudioMotionMirror {
  Left = -1,
  None = 0,
  Right = 1,
}

export enum AudioMotionFrequencyScale {
  Bark = 'bark',
  Linear = 'linear',
  Log = 'log',
  Mel = 'mel',
}

export type AudioMotionFftSize =
  | 32
  | 64
  | 128
  | 256
  | 512
  | 1024
  | 2048
  | 4096
  | 8192
  | 16384
  | 32768;

export interface AudioMotionGradientDefinition {
  name: string;
  gradient: AudioMotionGradientProperties;
}

export interface AudioMotionGradientProperties {
  bgColor: string;
  dir?: 'h' | 'v' | undefined;
  colorStops: GradientColorStop[];
}

export enum AudioMotionWeightingFilter {
  None = '',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  ItuR468 = '468',
}

export enum AudioMotionEnergyPreset {
  Peak = 'peak',
  Bass = 'bass',
  LowMid = 'lowMid',
  Mid = 'mid',
  HighMid = 'highMid',
  Treble = 'treble',
}

export { default as AudioVisualizer } from './AudioVisualizer.vue';
export { default as AudioMotionAnalyzer } from './AudioMotionAnalyzer.vue';
export { default as AudioMotionGradient } from './AudioMotionGradient.vue';

export type { AudioMotionAnalyzerProps } from './AudioMotionAnalyzer.vue';
export type { AudioMotionGradientProps } from './AudioMotionGradient.vue';

export const AudioMotionGradientsKey: InjectionKey<Ref<AudioMotionGradientDefinition[]>> =
  Symbol('AudioMotionGradients');

export { type AudioVisualizerMode } from './AudioVisualizer.vue';
export { type AudioVisualizerProps } from './AudioVisualizer.vue';
