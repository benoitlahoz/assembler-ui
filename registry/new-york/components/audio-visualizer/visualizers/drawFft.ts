// Visualiseur FFT (Fast Fourier Transform) pour AudioVisualizer
// Affiche le spectre en lignes (type oscilloscope, non barres)
import type { Ref } from 'vue';
import type { AudioVisualizerProps } from '../AudioVisualizer.vue';

export interface DrawFftParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawFft({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawFftParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

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

  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    // getFloatFrequencyData retourne des valeurs entre -100 et 0 (dB)
    // On normalise pour obtenir une hauteur entre 0 et height
    const value =
      typeof dataArray[i] === 'number' && Number.isFinite(dataArray[i]) ? dataArray[i] : -100;

    if (!value) continue;

    const magnitude = Math.max(0, Math.min(1, (value + 100) / 100));
    const x = (i / bufferLength) * width;
    const y = height - magnitude * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  let strokeColor = '#fff';
  if (
    Array.isArray(props.colors) &&
    props.colors.length > 0 &&
    typeof props.colors[0] === 'string'
  ) {
    strokeColor = props.colors[0] ?? '#fff';
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = props.lineWidth ?? 2;
  ctx.stroke();
  ctx.restore();

  animationIdRef.value = requestAnimationFrame(() =>
    drawFft({ analyser, canvasRef, props, channelData, animationIdRef })
  );
}
