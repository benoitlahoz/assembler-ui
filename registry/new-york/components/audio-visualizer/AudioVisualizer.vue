<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue';

export interface AudioVisualizerProps {
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
  width: 600,
  height: 200,
  fftSize: 2048,
  lineWidth: 2,
  colors: () => ['#ff5252', '#448aff', '#43a047', '#ffd600'],
  audioContext: null,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let channelData: Float32Array[] = [];

const draw = () => {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  ctx.save();

  if (props.background) ctx.fillStyle = props.background;

  ctx.fillRect(0, 0, props.width, props.height);
  ctx.restore();
  const channels = analyser.channelCount || 1;
  for (let ch = 0; ch < channels; ch++) {
    if (!channelData[ch] || !(channelData[ch] instanceof Float32Array)) {
      channelData[ch] = new Float32Array(props.fftSize);
    }
    const data = channelData[ch] as Float32Array<ArrayBuffer>;

    if (!data) continue;

    analyser.getFloatTimeDomainData(data);
    ctx.beginPath();
    const yOffset = (props.height / channels) * ch;
    for (let i = 0; i < data.length; i++) {
      const value = typeof data[i] === 'number' && Number.isFinite(data[i]) ? data[i] : 0;

      if (!value) continue;

      const x = (i / data.length) * props.width;
      const y = yOffset + (value * (props.height / channels)) / 2 + props.height / channels / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const color =
      Array.isArray(props.colors) && typeof props.colors[ch % props.colors.length] === 'string'
        ? props.colors[ch % props.colors.length]
        : '#fff';

    if (!color) continue;

    ctx.strokeStyle = color;
    ctx.lineWidth = props.lineWidth ?? 2;
    ctx.stroke();
  }
  animationId = requestAnimationFrame(draw);
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
      if (animationId) cancelAnimationFrame(animationId);
      analyser = null;
      source = null;
      channelData = [];
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  analyser = null;
  source = null;
  channelData = [];
});
</script>

<template>
  <canvas ref="canvasRef" :width="width" :height="height" class="w-full border border-border" />
</template>
