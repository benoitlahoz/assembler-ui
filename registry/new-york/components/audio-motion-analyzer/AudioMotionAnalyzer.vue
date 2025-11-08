<script setup lang="ts">
import AudioMotion, { type FrequencyScale } from 'audiomotion-analyzer';
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
} from 'vue';
import { AudioContextInjectionKey } from '~~/registry/new-york/components/audio-context-provider';
import { useTypedElementSearch } from '~~/registry/new-york/composables/use-typed-element-search/useTypedElementSearch';
import {
  AudioMotionMode,
  AudioMotionMirror,
  AudioMotionGradientsKey,
  AudioMotionWeightingFilter,
  type AudioMotionGradientDefinition,
  type AudioMotionGradientProperties,
  type AudioMotionFftSize,
} from '.';

export interface AudioMotionAnalyzerProps {
  alphaBars?: boolean;
  ansiBands?: boolean;
  audio?: HTMLAudioElement | Ref<HTMLAudioElement | null> | null;
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
  ledBars?: boolean;
  linearAmplitude?: boolean;
  linearBoost?: number;
  lineWidth?: number;
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
  showFPS?: boolean;
  showPeaks?: boolean;
  showScaleX?: boolean;
  showScaleY?: boolean;
  smoothing?: number;
  spinSpeed?: number;
  splitGradient?: boolean;
  stream?: MediaStream | null;
  trueLeds?: boolean;
  volume?: number;
  weightingFilter?: string;
}

const props = withDefaults(defineProps<AudioMotionAnalyzerProps>(), {
  audio: undefined,
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
  showFPS: false,
  showPeaks: false,
  showScaleX: false,
  showScaleY: false,
  smoothing: 0.5,
  spinSpeed: 0,
  splitGradient: false,
  stream: undefined,
  trueLeds: false,
  volume: 1,
  weightingFilter: '',
});

const { getTypedElementAmongSiblings, getContainer } = useTypedElementSearch();

const noDisplayElement = useTemplateRef('noDisplayRef');
const injectedContext = inject<Ref<AudioContext | null>>(AudioContextInjectionKey, ref(null));

const gradients = ref<AudioMotionGradientDefinition[]>([]);
provide<Ref<AudioMotionGradientDefinition[]>>(AudioMotionGradientsKey, gradients);

let analyzer: AudioMotion | null = null;
let source: MediaStreamAudioSourceNode | null = null;

const registerGradients = () => {
  if (analyzer) {
    for (const gradientDef of gradients.value) {
      const { name, gradient } = gradientDef;
      analyzer.registerGradient(name, gradient as any & AudioMotionGradientProperties);
    }
  }
};

const setupAnalyzer = async () => {
  if (analyzer) {
    analyzer.destroy();
    analyzer = null;
  }

  const canvas: HTMLCanvasElement | null = searchCanvas();
  const container: HTMLElement | null = searchContainer();

  if (props.audio) {
    const audioElement = props.audio instanceof HTMLAudioElement ? props.audio : props.audio.value;
    if (audioElement) {
      if (!canvas && container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        analyzer = new AudioMotion(container, {
          source: audioElement,
          width,
          height,
          gradient: props.gradient,
          mode: 3,
          barSpace: 0.6,
          ledBars: true,
          connectSpeakers: false,
        });
      } else if (canvas) {
        analyzer = new AudioMotion({
          source: audioElement,
          canvas: canvas,
          width: canvas.width,
          height: canvas.height,
          gradient: props.gradient,
          mode: 3,
          barSpace: 0.6,
          ledBars: true,
          connectSpeakers: false,
        });
      } else {
        console.error(
          'No valid container or canvas found for AudioMotionAnalyzer with audio element.'
        );
      }
    }
  } else if (props.stream) {
    if (source) {
      source.disconnect();
      source = null;
    }
    const context = injectedContext.value || new AudioContext();
    source = context.createMediaStreamSource(props.stream);

    const width = canvas ? canvas.width : container?.clientWidth;
    const height = canvas ? canvas.height : container?.clientHeight;
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
      showFPS: props.showFPS,
      showPeaks: props.showPeaks,
      showScaleX: props.showScaleX,
      showScaleY: props.showScaleY,
      smoothing: Math.max(0, Math.min(props.smoothing ?? 0, 1)),
      spinSpeed: props.spinSpeed || 0,
      splitGradient: props.splitGradient || false,
      trueLeds: props.trueLeds || false,
      volume: Math.max(0, props.volume || 1),
      weightingFilter: props.weightingFilter as AudioMotionWeightingFilter,
      width,
      ...(canvas ? { canvas } : {}),
    };

    analyzer = canvas
      ? new AudioMotion(options)
      : container
        ? new AudioMotion(container, options)
        : null;

    if (analyzer) {
      if (canvas) {
        analyzer.showBgColor = false;
        registerGradients();
      }
      analyzer.gradient = props.gradient;
      if (props.gradientLeft) analyzer.gradientLeft = props.gradientLeft;
      if (props.gradientRight) analyzer.gradientRight = props.gradientRight;

      analyzer.connectInput(source);
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

const searchCanvas = (): HTMLCanvasElement | null => {
  const el = unref(noDisplayElement);
  return el
    ? getTypedElementAmongSiblings(
        el,
        (el): el is HTMLCanvasElement => el instanceof HTMLCanvasElement
      )
    : null;
};

const searchContainer = (): HTMLElement | null => {
  const el = unref(noDisplayElement);
  return el ? getContainer(el) : null;
};

const cleanUp = () => {
  if (analyzer) {
    analyzer.destroy();
    analyzer = null;
  }
  if (source) {
    source.disconnect();
    source = null;
  }
};

watch(
  () => [props.stream, props.audio, injectedContext.value],
  () => {
    nextTick(async () => {
      await setupAnalyzer();
    });
  },
  { immediate: true }
);

watch(
  () => gradients.value,
  async () => {
    if (analyzer) {
      registerGradients();
    }
  },
  { immediate: true }
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
      analyzer.ledBars = !!props.ledBars;
      analyzer.linearAmplitude = !!props.linearAmplitude;
      analyzer.linearBoost = Math.max(props.linearBoost, 1);
      analyzer.lineWidth = Math.max(props.lineWidth || 0, 0);
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
      analyzer.showFPS = !!props.showFPS;
      analyzer.showPeaks = !!props.showPeaks;
      analyzer.showScaleX = !!props.showScaleX;
      analyzer.showScaleY = !!props.showScaleY;
      analyzer.smoothing = Math.max(0, Math.min(props.smoothing ?? 0.5, 1));
      analyzer.spinSpeed = props.spinSpeed || 0;
      analyzer.splitGradient = !!props.splitGradient;
      analyzer.trueLeds = !!props.trueLeds;
      analyzer.volume = Math.max(0, props.volume || 1);
      analyzer.weightingFilter = (props.weightingFilter || '') as AudioMotionWeightingFilter;
    }
  },
  { flush: 'post' }
);

onUnmounted(() => {
  cleanUp();
});
</script>

<template>
  <!-- Hacky way to get content from this renderless component without forcing the user to set explicit width and height to its canvas -->
  <div ref="noDisplayRef" class="hidden z-[-9999]" />
  <slot data-slot="audio-motion-analyzer" />
</template>
