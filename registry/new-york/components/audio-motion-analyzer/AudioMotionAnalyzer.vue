<script setup lang="ts">
import AudioMotion from 'audiomotion-analyzer';
import {
  type Ref,
  type HTMLAttributes,
  inject,
  ref,
  watch,
  nextTick,
  useTemplateRef,
  unref,
  onUnmounted,
  provide,
  watchEffect,
  computed,
  version,
} from 'vue';
import { cn } from '@/lib/utils';
import { AudioContextInjectionKey } from '~~/registry/new-york/components/audio-context-provider';
import {
  AudioMotionGradientsKey,
  AudioMotionLedParametersKey,
  AudioMotionMode,
  AudioMotionMirror,
  AudioMotionWeightingFilter,
  type AudioMotionGradientDefinition,
  type AudioMotionGradientProperties,
  type AudioMotionFftSize,
  type OnCanvasDrawFunction,
  type OnCanvasResizeFunction,
  type FrequencyScale,
  type AudioMotionLedParametersDefinition,
} from '.';

export interface AudioMotionAnalyzerProps {
  alphaBars?: boolean;
  ansiBands?: boolean;
  barSpace?: number;
  channelLayout?: 'single' | 'dual-combined' | 'dual-horizontal' | 'dual-vertical';
  class?: HTMLAttributes['class'];
  colorMode?: 'gradient' | 'bar-index' | 'bar-level';
  connectSpeakers?: boolean;
  disableReflexFit?: boolean;
  fadePeaks?: boolean;
  fftSize?: AudioMotionFftSize;
  fillAlpha?: number;
  frequencyScale?: string;
  gradient?: 'classic' | 'orangered' | 'prism' | 'rainbow' | 'steelblue' | string;
  gradientLeft?: 'classic' | 'orangered' | 'prism' | 'rainbow' | 'steelblue' | string;
  gradientRight?: 'classic' | 'orangered' | 'prism' | 'rainbow' | 'steelblue' | string;
  gravity?: number;
  // `headless = true` is like `useCanvas = false` in the original library
  headless?: boolean;
  height?: number;
  ledBars?: boolean;
  linearAmplitude?: boolean;
  linearBoost?: number;
  lineWidth?: number;
  loRes?: boolean;
  lumiBars?: boolean;
  maxDecibels?: number;
  minDecibels?: number;
  maxFps?: number;
  maxFreq?: number;
  minFreq?: number;
  mirror?: number;
  mode?: number;
  noteLabels?: boolean;
  outlineBars?: boolean;
  overlay?: boolean;
  peakFadeTime?: number;
  peakHoldTime?: number;
  peakLine?: boolean;
  radial?: boolean;
  radialInvert?: boolean;
  radius?: number;
  reflexAlpha?: number;
  reflexBright?: number;
  reflexRatio?: number;
  roundBars?: boolean;
  showBgColor?: boolean;
  showFps?: boolean;
  showPeaks?: boolean;
  showScaleX?: boolean;
  showScaleY?: boolean;
  smoothing?: number;
  // HTMLMediaElement or AudioNode source.
  source?: AudioNode | HTMLMediaElement | Ref<AudioNode | HTMLMediaElement> | null;
  spinSpeed?: number;
  splitGradient?: boolean;
  start?: boolean;
  // MediaStream source.
  stream?: MediaStream | null;
  trueLeds?: boolean;
  volume?: number;
  weightingFilter?: string;
  width?: number;

  // Events

  onCanvasDraw?: OnCanvasDrawFunction;
  onCanvasResize?: OnCanvasResizeFunction;

  // Custom.
  ledPreset?: string;
}

const props = withDefaults(defineProps<AudioMotionAnalyzerProps>(), {
  barSpace: 0.1,
  channelLayout: 'dual-combined',
  colorMode: 'gradient',
  connectSpeakers: false,
  disableReflexFit: false,
  fadePeaks: false,
  fftSize: 8192,
  fillAlpha: 1,
  frequencyScale: 'log',
  gradient: 'classic',
  gravity: 3.8,
  headless: false,
  ledBars: false,
  linearAmplitude: false,
  linearBoost: 1,
  lineWidth: 0,
  lumiBars: false,
  maxDecibels: -25,
  minDecibels: -85,
  maxFps: 0,
  maxFreq: 22000,
  minFreq: 20,
  mirror: 0,
  mode: 3,
  noteLabels: false,
  outlineBars: false,
  overlay: false,
  peakFadeTime: 750,
  peakHoldTime: 500,
  peakLine: false,
  radial: false,
  radialInvert: false,
  radius: 0.3,
  reflexAlpha: 0.15,
  reflexBright: 1,
  reflexRatio: 0,
  roundBars: false,
  showBgColor: false,
  showFps: false,
  showPeaks: false,
  showScaleX: false,
  showScaleY: false,
  smoothing: 0.5,
  source: undefined,
  spinSpeed: 0,
  splitGradient: false,
  start: false,
  stream: undefined,
  trueLeds: false,
  volume: 1,
  weightingFilter: '',
});

const containerRef = useTemplateRef('containerRef');
const injectedContext = inject<Ref<AudioContext | null>>(AudioContextInjectionKey, ref(null));
const gradients = ref<AudioMotionGradientDefinition[]>([]);
const ledParams = ref<AudioMotionLedParametersDefinition[]>([]);

const canvas = computed(() => analyzer?.canvas || null);
const audioCtx = computed(() => analyzer?.audioCtx || null);
const isAlphaBars = computed(() => (analyzer ? analyzer.isAlphaBars : false));
const isBandsMode = computed(() => (analyzer ? analyzer.isBandsMode : false));
const isDestroyed = computed(() => (analyzer ? analyzer.isDestroyed : true));
const isFullscreen = computed(() => (analyzer ? analyzer.isFullscreen : false));
const isLedBars = computed(() => (analyzer ? analyzer.isLedBars : false));
const isLumiBars = computed(() => (analyzer ? analyzer.isLumiBars : false));
const isOctaveBands = computed(() => (analyzer ? analyzer.isOctaveBands : false));
const isOn = computed(() => (analyzer ? analyzer.isOn : false));
const isOutlineBars = computed(() => (analyzer ? analyzer.isOutlineBars : false));
const isRoundBars = computed(() => (analyzer ? analyzer.isRoundBars : false));
const connectedSources = computed(() => (analyzer ? analyzer.connectedSources : []));

const start = computed(() => (analyzer ? !analyzer.start : null));
const stop = computed(() => (analyzer ? analyzer.stop : null));
const connectInput = computed(() => (analyzer ? analyzer.connectInput : null));
const disconnectInput = computed(() => (analyzer ? analyzer.disconnectInput : null));
const disconnectOutput = computed(() => (analyzer ? analyzer.disconnectOutput : null));
const getBars = computed(() => (analyzer ? analyzer.getBars : null));
const getEnergy = computed(() => (analyzer ? analyzer.getEnergy : null));
const getOptions = computed(() => (analyzer ? analyzer.getOptions : null));
const setLedParams = computed(() => (analyzer ? analyzer.setLedParams : null));

provide<Ref<AudioMotionGradientDefinition[]>>(AudioMotionGradientsKey, gradients);
provide<Ref<AudioMotionLedParametersDefinition[]>>(AudioMotionLedParametersKey, ledParams);

let analyzer: AudioMotion | null = null;
let streamSource: MediaStreamAudioSourceNode | null = null;

const registerGradients = () => {
  if (analyzer) {
    for (const gradientDef of gradients.value) {
      const { name, gradient } = gradientDef;
      analyzer.registerGradient(name, gradient as any & AudioMotionGradientProperties);
    }
  }
};

const setupAnalyzer = async () => {
  cleanUp();

  const container = unref(containerRef);
  if (!container) {
    console.error('No container found for AudioMotionAnalyzer.');
    return;
  }

  if (props.source) {
    const source =
      props.source instanceof HTMLMediaElement || props.source instanceof AudioNode
        ? props.source
        : props.source.value;
    // TODO
  } else if (props.stream) {
    if (streamSource) {
      streamSource.disconnect();
      streamSource = null;
    }
    const context = injectedContext.value || new AudioContext();
    streamSource = context.createMediaStreamSource(props.stream);

    const width = props.width ? props.width / window.devicePixelRatio : undefined;
    const height = props.height ? props.height / window.devicePixelRatio : undefined;

    const options = {
      alphaBars: props.alphaBars,
      ansiBands: props.ansiBands,
      audioCtx: context,
      barSpace: props.barSpace,
      channelLayout: props.channelLayout,
      colorMode: props.colorMode,
      connectSpeakers: props.connectSpeakers,
      fadePeaks: props.fadePeaks,
      fftSize: props.fftSize,
      fillAlpha: props.fillAlpha,
      frequencyScale: props.frequencyScale as FrequencyScale,
      gravity: props.gravity,
      height,
      ledBars: props.ledBars,
      linearAmplitude: props.linearAmplitude,
      linearBoost: Math.max(props.linearBoost, 1),
      lineWidth: Math.max(props.lineWidth || 0, 0),
      loRes: props.loRes,
      lumiBars: props.lumiBars,
      maxDecibels: props.maxDecibels,
      minDecibels: props.minDecibels,
      maxFPS: props.maxFps,
      maxFreq: Math.max(props.maxFreq, 1),
      minFreq: Math.max(props.minFreq, 1),
      mirror: props.mirror,
      mode: props.mode,
      noteLabels: props.noteLabels,
      outlineBars: props.outlineBars,
      overlay: props.overlay,
      peakFadeTime: props.peakFadeTime,
      peakHoldTime: props.peakHoldTime,
      peakLine: props.peakLine,
      radial: props.radial,
      radialInvert: props.radialInvert,
      radius: props.radius,
      reflexAlpha: Math.max(0, Math.min(props.reflexAlpha ?? 0, 1)),
      reflexBright: Math.max(0, props.reflexBright ?? 1),
      reflexFit: !props.disableReflexFit,
      reflexRatio: Math.max(0, Math.min(props.reflexRatio ?? 0, 1)),
      roundBars: props.roundBars,
      showBgColor: props.showBgColor,
      showFPS: props.showFps,
      showPeaks: props.showPeaks,
      showScaleX: props.showScaleX,
      showScaleY: props.showScaleY,
      smoothing: Math.max(0, Math.min(props.smoothing ?? 0, 1)),
      spinSpeed: props.spinSpeed || 0,
      splitGradient: props.splitGradient || false,
      start: props.start || false,
      trueLeds: props.trueLeds || false,
      useCanvas: !props.headless,
      volume: Math.max(0, props.volume || 1),
      weightingFilter: props.weightingFilter as AudioMotionWeightingFilter,
      width,
    };

    analyzer = new AudioMotion(container, options);

    if (analyzer) {
      registerGradients();

      analyzer.gradient = props.gradient;
      if (props.gradientLeft) analyzer.gradientLeft = props.gradientLeft;
      if (props.gradientRight) analyzer.gradientRight = props.gradientRight;

      if (props.ledPreset) {
        const params = ledParams.value.find((p) => p.name === props.ledPreset);
        if (params) {
          analyzer.setLedParams(params.params);
        }
      }

      if (props.onCanvasDraw) {
        analyzer.onCanvasDraw = props.onCanvasDraw;
      }
      if (props.onCanvasResize) {
        analyzer.onCanvasResize = props.onCanvasResize;
      }

      analyzer.connectInput(streamSource);
    } else {
      console.error(
        'No valid container or canvas found for AudioMotionAnalyzer with media stream.'
      );
    }
  } else {
    console.error(
      'No audio source (audio element or media stream) provided to AudioMotionAnalyzer.'
    );
  }
};

const cleanUp = () => {
  if (analyzer) {
    analyzer.destroy();
    analyzer = null;
  }
  if (streamSource) {
    streamSource.disconnect();
    streamSource = null;
  }
};

watch(
  () => [props.onCanvasDraw, props.onCanvasResize],
  ([newDrawHandler, newResizeHandler]) => {
    nextTick(() => {
      if (analyzer) {
        analyzer.onCanvasDraw = newDrawHandler as OnCanvasDrawFunction | undefined;
        analyzer.onCanvasResize = newResizeHandler as OnCanvasResizeFunction | undefined;
      }
    });
  },
  {
    immediate: true,
  }
);

watch(
  () => [props.stream, props.source, injectedContext.value],
  () => {
    nextTick(async () => {
      await setupAnalyzer();
    });
  },
  { immediate: true }
);

watch(
  () => gradients.value,
  () => {
    if (analyzer) {
      registerGradients();
    }
  },
  { immediate: true }
);

watch(
  () => [props.ledPreset, ledParams.value],
  () => {
    nextTick(() => {
      if (analyzer) {
        const params = ledParams.value.find((p) => p.name === props.ledPreset);
        if (params) {
          analyzer.setLedParams(params.params);
        }
      }
    });
  },
  { immediate: true, deep: true }
);

watch(
  () => props.connectSpeakers,
  async () => {
    if (analyzer) {
      const ctx = analyzer.audioCtx;
      const destination = ctx.destination;
      // Only connect or disconnect from speakers node.
      props.connectSpeakers ? analyzer.connectOutput() : analyzer.disconnectOutput(destination);
    }
  }
);

watchEffect(
  () => {
    if (analyzer) {
      analyzer.alphaBars = !!props.alphaBars;
      analyzer.ansiBands = !!props.ansiBands;
      analyzer.barSpace = props.barSpace || 0.1;
      analyzer.channelLayout = props.channelLayout;
      analyzer.colorMode = props.colorMode || 'gradient';
      analyzer.fadePeaks = !!props.fadePeaks;
      analyzer.fftSize = props.fftSize as AudioMotionFftSize;
      analyzer.fillAlpha = props.fillAlpha || 1;
      analyzer.frequencyScale = props.frequencyScale as FrequencyScale;
      if (props.gradientLeft) analyzer.gradientLeft = props.gradientLeft;
      if (props.gradientRight) analyzer.gradientRight = props.gradientRight;
      analyzer.gravity = props.gravity || 3.8;
      if (props.height) analyzer.height = props.height / window.devicePixelRatio;
      analyzer.ledBars = !!props.ledBars;
      analyzer.linearAmplitude = !!props.linearAmplitude;
      analyzer.linearBoost = Math.max(props.linearBoost, 1);
      analyzer.lineWidth = Math.max(props.lineWidth || 0, 0);
      analyzer.loRes = !!props.loRes;
      analyzer.lumiBars = !!props.lumiBars;
      analyzer.maxDecibels = props.maxDecibels;
      analyzer.minDecibels = props.minDecibels;
      analyzer.maxFPS = props.maxFps || 0;
      analyzer.maxFreq = Math.max(props.maxFreq, 1);
      analyzer.minFreq = Math.max(props.minFreq, 1);
      analyzer.mirror = props.mirror || AudioMotionMirror.None;
      analyzer.mode = props.mode || AudioMotionMode.OctaveBands8th;
      analyzer.noteLabels = !!props.noteLabels;
      analyzer.outlineBars = !!props.outlineBars;
      analyzer.overlay = props.overlay;
      analyzer.peakFadeTime = props.peakFadeTime || 750;
      analyzer.peakHoldTime = props.peakHoldTime || 500;
      analyzer.peakLine = props.peakLine || false;
      analyzer.radial = props.radial || false;
      analyzer.radialInvert = props.radialInvert || false;
      analyzer.radius = props.radius || 0.3;
      analyzer.reflexAlpha = Math.max(0, Math.min(props.reflexAlpha ?? 0, 1));
      analyzer.reflexBright = Math.max(0, props.reflexBright ?? 1);
      analyzer.reflexFit = !props.disableReflexFit;
      analyzer.reflexRatio = Math.max(0, Math.min(props.reflexRatio ?? 0, 1));
      analyzer.roundBars = !!props.roundBars;
      analyzer.showBgColor = !!props.showBgColor;
      analyzer.showFPS = !!props.showFps;
      analyzer.showPeaks = !!props.showPeaks;
      analyzer.showScaleX = !!props.showScaleX;
      analyzer.showScaleY = !!props.showScaleY;
      analyzer.smoothing = Math.max(0, Math.min(props.smoothing ?? 0.5, 1));
      analyzer.spinSpeed = props.spinSpeed || 0;
      analyzer.splitGradient = !!props.splitGradient;
      props.start ? analyzer.start() : analyzer.stop();
      analyzer.trueLeds = !!props.trueLeds;
      analyzer.volume = Math.max(0, props.volume || 1);
      analyzer.weightingFilter = (props.weightingFilter || '') as AudioMotionWeightingFilter;
      if (props.width) analyzer.width = props.width / window.devicePixelRatio;
    }
  },
  { flush: 'post' }
);

onUnmounted(() => {
  cleanUp();
});

defineExpose({
  instance: computed(() => analyzer),
  version: computed(() => AudioMotion.version),
  canvas,
  audioCtx,
  connectedSources,
  isAlphaBars,
  isBandsMode,
  isDestroyed,
  isFullscreen,
  isLedBars,
  isLumiBars,
  isOctaveBands,
  isOn,
  isOutlineBars,
  isRoundBars,

  start,
  stop,
  connectInput,
  disconnectInput,
  disconnectOutput,
  getBars,
  getEnergy,
  getOptions,
  setLedParams,
});
</script>

<template>
  <div ref="containerRef" :class="cn('w-full min-w-full', props.class)"></div>
  <!-- Use this slot to create e.g. some `AudioMotionGradient`. See the Expose section to get the list of value and functions passed to the slot. -->
  <slot
    data-slot="audio-motion-analyzer"
    :instance="analyzer"
    :version="AudioMotion.version"
    :canvas="canvas"
    :audioCtx="audioCtx"
    :connectedSources="connectedSources"
    :isAlphaBars="isAlphaBars"
    :isBandsMode="isBandsMode"
    :isDestroyed="isDestroyed"
    :isFullscreen="isFullscreen"
    :isLedBars="isLedBars"
    :isLumiBars="isLumiBars"
    :isOctaveBands="isOctaveBands"
    :isOn="isOn"
    :isOutlineBars="isOutlineBars"
    :isRoundBars="isRoundBars"
    :start="start"
    :stop="stop"
    :connectInput="connectInput"
    :disconnectInput="disconnectInput"
    :disconnectOutput="disconnectOutput"
    :getBars="getBars"
    :getEnergy="getEnergy"
    :getOptions="getOptions"
    :setLedParams="setLedParams"
  />
</template>
