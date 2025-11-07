// Visualiseur de barres de fréquences pour AudioVisualizer
// Utilise getFloatFrequencyData pour afficher le spectre audio
import type { Ref } from 'vue';
import type { AudioVisualizerProps } from '../AudioVisualizer.vue';

export interface DrawFrequencyBarsParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawFrequencyBars({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawFrequencyBarsParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  ctx.save();

  const width = props.width ?? 600;
  const height = props.height ?? 200;

  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.save();
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  analyser.getFloatFrequencyData(dataArray);

  const barWidth = width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    // getFloatFrequencyData retourne des valeurs entre -100 et 0 (dB)
    // On normalise pour obtenir une hauteur entre 0 et height
    const value =
      typeof dataArray[i] === 'number' && Number.isFinite(dataArray[i]) ? dataArray[i] : -100;

    if (!value) continue;

    const magnitude = Math.max(0, Math.min(1, (value + 100) / 100));
    const barHeight = magnitude * height;
    const x = i * barWidth;
    const y = height - barHeight;
    let color = '#fff';
    if (Array.isArray(props.colors) && props.colors.length > 0) {
      color = props.colors[i % props.colors.length] ?? '#fff';
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);
  }
  animationIdRef.value = requestAnimationFrame(() =>
    drawFrequencyBars({ analyser, canvasRef, props, channelData, animationIdRef })
  );
}
