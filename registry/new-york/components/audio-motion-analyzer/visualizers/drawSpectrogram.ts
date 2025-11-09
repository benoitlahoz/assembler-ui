// Visualisation spectrogramme (heatmap)
import type { Ref } from 'vue';
import type { AudioVisualizerProps } from '../AudioVisualizer.vue';

let spectrogramData: ImageData | null = null;

export interface DrawSpectrogramParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawSpectrogram({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawSpectrogramParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const bufferLength = analyser.frequencyBinCount;
  if (!spectrogramData || spectrogramData.width !== width || spectrogramData.height !== height) {
    spectrogramData = ctx.createImageData(width, height);
    for (let i = 0; i < spectrogramData.data.length; i++) spectrogramData.data[i] = 255;
  }
  // Décale l'image d'un pixel vers la gauche
  ctx.putImageData(spectrogramData, -1, 0);
  // Récupère les nouvelles données FFT
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  // Ajoute la nouvelle colonne à gauche
  for (let y = 0; y < height; y++) {
    const freqIdx = Math.floor((y / height) * bufferLength);
    const value = dataArray[freqIdx];
    const color = value !== undefined ? `hsl(${240 - (value / 255) * 240}, 100%, 50%)` : '#000';
    ctx.fillStyle = color;
    ctx.fillRect(width - 1, height - y, 1, 1);
  }
  // Met à jour l'image
  spectrogramData = ctx.getImageData(0, 0, width, height);
  animationIdRef.value = requestAnimationFrame(() =>
    drawSpectrogram({ analyser, canvasRef, props, channelData, animationIdRef })
  );
}
