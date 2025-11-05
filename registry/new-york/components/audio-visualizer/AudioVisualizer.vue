<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue';

export interface AudioVisualizerProps {
  stream?: MediaStream | null;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<AudioVisualizerProps>(), {
  width: 600,
  height: 200,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number | null = null;
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let channelData: Float32Array[] = [];

const draw = () => {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, props.width, props.height);
  // Pour la plupart des navigateurs, channelCount = 1 (mono) ou 2 (stéréo)
  const channels = analyser.channelCount || 1;
  for (let ch = 0; ch < channels; ch++) {
    // Toujours initialiser channelData[ch] avant usage
    if (!channelData[ch] || !(channelData[ch] instanceof Float32Array)) {
      channelData[ch] = new Float32Array(analyser.fftSize);
    }
    const data = channelData[ch] as Float32Array<ArrayBuffer>;
    analyser.getFloatTimeDomainData(data);
    ctx.beginPath();
    const yOffset = (props.height / channels) * ch;
    for (let i = 0; i < data.length; i++) {
      const value = data[i] && Number.isFinite(data[i]) ? data[i] : 0;

      if (typeof value !== 'number') continue;

      const x = (i / data.length) * props.width;
      const y = yOffset + (value * (props.height / channels)) / 2 + props.height / channels / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsl(${ch * 60}, 80%, 60%)`;
    ctx.stroke();
  }
  animationId = requestAnimationFrame(draw);
};

const setupAudio = () => {
  if (audioCtx) audioCtx.close();
  if (props.stream == null) return;

  audioCtx = new AudioContext();
  source = audioCtx.createMediaStreamSource(props.stream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  draw();
};

watch(
  () => props.stream,
  (newStream) => {
    if (newStream) {
      setupAudio();
    } else {
      if (animationId) cancelAnimationFrame(animationId);
      if (audioCtx) audioCtx.close();
      audioCtx = null;
      analyser = null;
      source = null;
      channelData = [];
    }
  },
  { immediate: true }
);

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (audioCtx) audioCtx.close();
});

watch(
  () => props.stream,
  () => {
    setupAudio();
  }
);
</script>

<template>
  <canvas ref="canvasRef" :width="width" :height="height" class="w-full border border-border" />
</template>
