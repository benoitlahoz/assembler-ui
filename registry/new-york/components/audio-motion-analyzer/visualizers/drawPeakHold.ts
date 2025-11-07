// Visualisation Peak Hold
import type { Ref } from 'vue';
import type { AudioVisualizerProps } from '../AudioVisualizer.vue';

const PEAK_DECAY = 0.97; // taux de descente des pics
let peakArray: number[] = [];

export interface DrawPeakHoldParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawPeakHold({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawPeakHoldParams) {
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
  if (peakArray.length !== bufferLength) peakArray = new Array(bufferLength).fill(0);
  const barWidth = width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const value = dataArray[i];
    if (value > peakArray[i]) peakArray[i] = value;
    else peakArray[i] *= PEAK_DECAY;
    const barHeight = (value / 255) * height;
    const peakHeight = (peakArray[i] / 255) * height;
    const x = i * barWidth;
    ctx.fillStyle = props.colors?.[0] ?? '#43a047';
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    // Pic
    ctx.fillStyle = '#ffd600';
    ctx.fillRect(x, height - peakHeight - 2, barWidth, 2);
  }
  animationIdRef.value = requestAnimationFrame(() =>
    drawPeakHold({ analyser, canvasRef, props, channelData, animationIdRef })
  );
}
