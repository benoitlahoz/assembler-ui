/**
 * @type registry:ui
 * @category audio
 *
 * @demo AudioMotionSimple
 * @demo AudioVisualizerSimple
 */

import type { InjectionKey, Ref } from 'vue';
import {
  type AudioMotionAnalyzer,
  type CanvasDrawInfo,
  type CanvasResizeReason,
  type LedParameters,
} from 'audiomotion-analyzer';
import { type GradientColorStop } from '~~/registry/new-york/composables/use-css-parser/useCssParser';

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

export interface AudioMotionLedParametersDefinition {
  name: string;
  params: LedParameters;
}

export { default as AudioVisualizer } from './AudioVisualizer.vue';
export { default as AudioMotionAnalyzer } from './AudioMotionAnalyzer.vue';
export { default as AudioMotionGradient } from './AudioMotionGradient.vue';
export { default as AudioMotionLedParameters } from './AudioMotionLedParameters.vue';

export type { AudioMotionAnalyzerProps } from './AudioMotionAnalyzer.vue';
export type { AudioMotionGradientProps } from './AudioMotionGradient.vue';

export const AudioMotionGradientsKey: InjectionKey<Ref<AudioMotionGradientDefinition[]>> =
  Symbol('AudioMotionGradients');
export const AudioMotionLedParametersKey: InjectionKey<Ref<AudioMotionLedParametersDefinition[]>> =
  Symbol('AudioMotionLedParametersKey');

export type AudioMotionAnalyzerInstance = AudioMotionAnalyzer;
export type OnCanvasDrawFunction = (
  instance: AudioMotionAnalyzerInstance,
  info: CanvasDrawInfo
) => unknown;

export type OnCanvasResizeFunction = (
  reason: CanvasResizeReason,
  instance: AudioMotionAnalyzerInstance
) => unknown;

export type {
  CanvasDrawInfo,
  CanvasResizeReason,
  LedParameters,
  FrequencyScale,
} from 'audiomotion-analyzer';

export { type AudioVisualizerMode } from './AudioVisualizer.vue';
export { type AudioVisualizerProps } from './AudioVisualizer.vue';
