// Visualisation spectre miroir (mirrored spectrum)
import type { Ref } from 'vue';
import type { AudioVisualizerProps } from '../AudioVisualizer.vue';

export interface DrawMirroredSpectrumParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawMirroredSpectrum({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawMirroredSpectrumParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
  }
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  const barWidth = width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const value = dataArray[i];
    const barHeight = (value / 255) * (height / 2);
    const x = i * barWidth;
    // Barre du haut
    ctx.fillStyle = `hsl(${(i / bufferLength) * 360}, 80%, 60%)`;
    ctx.fillRect(x, height / 2 - barHeight, barWidth, barHeight);
    // Barre du bas (miroir)
    ctx.fillRect(x, height / 2, barWidth, barHeight);
  }
  animationIdRef.value = requestAnimationFrame(() =>
    drawMirroredSpectrum({ analyser, canvasRef, props, channelData, animationIdRef })
  );
}
