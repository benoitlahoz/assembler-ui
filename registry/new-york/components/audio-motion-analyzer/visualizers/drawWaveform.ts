// Visualizer function pour AudioVisualizer
// Dépendances : analyser, canvasRef, props, channelData, animationId

import type { Ref } from 'vue';
import type { AudioVisualizerProps } from '../AudioVisualizer.vue';

export interface DrawVisualizerParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawWaveforms({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawVisualizerParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  ctx.save();

  if (props.background) ctx.fillStyle = props.background;

  // Valeurs par défaut pour width, height, fftSize
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const fftSize = props.fftSize ?? 2048;

  ctx.fillRect(0, 0, width, height);
  ctx.restore();
  const channels = analyser.channelCount || 1;
  for (let ch = 0; ch < channels; ch++) {
    if (!channelData[ch] || !(channelData[ch] instanceof Float32Array)) {
      channelData[ch] = new Float32Array(fftSize);
    }
    const data = channelData[ch] as Float32Array<ArrayBuffer>;

    if (!data) continue;

    analyser.getFloatTimeDomainData(data);
    ctx.beginPath();
    const yOffset = (height / channels) * ch;
    for (let i = 0; i < data.length; i++) {
      const value = typeof data[i] === 'number' && Number.isFinite(data[i]) ? data[i] : 0;

      if (!value) continue;

      const x = (i / data.length) * width;
      const y = yOffset + (value * (height / channels)) / 2 + height / channels / 2;
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
  animationIdRef.value = requestAnimationFrame(() =>
    drawWaveforms({ analyser, canvasRef, props, channelData, animationIdRef })
  );
}
