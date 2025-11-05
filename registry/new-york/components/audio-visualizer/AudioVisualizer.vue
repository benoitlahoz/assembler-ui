<script setup lang="ts">
import { ref, onUnmounted, watch, computed } from 'vue';
import { drawWaveforms } from './visualizers/drawWaveform';
import { drawFrequencyBars } from './visualizers/drawFrequencyBars';
import { drawFft } from './visualizers/drawFft';
import { drawFftEnhanced } from './visualizers/drawFftEnhanced';

export type AudioVisualizerMode = 'waveform' | 'frequency-bars' | 'fft' | 'fft-enhanced';

export interface AudioVisualizerProps {
  mode?: AudioVisualizerMode;
  stream?: MediaStream | null;
  context?: AudioContext | null;
  width?: number;
  height?: number;
  fftSize?: number;
  lineWidth?: number;
  background?: string;
  colors?: string[];
}

const props = withDefaults(defineProps<AudioVisualizerProps>(), {
  mode: 'waveform',
  width: 600,
  height: 200,
  fftSize: 2048,
  lineWidth: 2,
  colors: () => ['#ff5252', '#448aff', '#43a047', '#ffd600'],
  audioContext: null,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const animationId = ref<number | null>(null);
let analyser: AnalyserNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let channelData: Float32Array[] = [];

const drawFunction = computed(() => {
  switch (props.mode) {
    case 'frequency-bars':
      return drawFrequencyBars;
    case 'fft':
      return drawFft;
    case 'fft-enhanced':
      return drawFftEnhanced;
    case 'waveform':
    default:
      return drawWaveforms;
  }
});

const draw = () => {
  drawFunction.value({ analyser, canvasRef, props, channelData, animationIdRef: animationId });
};

const setupAudio = () => {
  if (!props.context || !props.stream) return;
  source = props.context.createMediaStreamSource(props.stream);
  analyser = props.context.createAnalyser();
  analyser.fftSize = props.fftSize;
  source.connect(analyser);
  draw();
};

watch(
  () => [props.context, props.stream],
  ([audioContext, stream]) => {
    if (audioContext && stream) {
      setupAudio();
    } else {
      if (animationId.value) cancelAnimationFrame(animationId.value);
      analyser = null;
      source = null;
      channelData = [];
    }
  },
  { immediate: true }
);

watch(
  () => props.mode,
  () => {
    if (animationId.value) cancelAnimationFrame(animationId.value);
    draw();
  }
);

onUnmounted(() => {
  if (animationId.value) cancelAnimationFrame(animationId.value);
  analyser = null;
  source = null;
  channelData = [];
});
</script>

<template>
  <canvas ref="canvasRef" :width="width" :height="height" class="w-full border border-border" />
</template>
