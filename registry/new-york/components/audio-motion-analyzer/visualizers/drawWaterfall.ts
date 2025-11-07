// Visualisation waterfall (cascade de spectres)
import type { Ref } from 'vue';
import type { AudioVisualizerProps } from '../AudioVisualizer.vue';

let waterfallData: ImageData | null = null;

export interface DrawWaterfallParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawWaterfall({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawWaterfallParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const bufferLength = analyser.frequencyBinCount;
  if (!waterfallData || waterfallData.width !== width || waterfallData.height !== height) {
    waterfallData = ctx.createImageData(width, height);
    for (let i = 0; i < waterfallData.data.length; i++) waterfallData.data[i] = 255;
  }
  // Décale l'image d'un pixel vers le bas
  ctx.putImageData(waterfallData, 0, 1);
  // Récupère les nouvelles données FFT
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  // Ajoute la nouvelle ligne en haut
  for (let x = 0; x < width; x++) {
    const freqIdx = Math.floor((x / width) * bufferLength);
    const value = dataArray[freqIdx];
    const color = value !== undefined ? `hsl(${240 - (value / 255) * 240}, 100%, 50%)` : '#000';
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, 1, 1);
  }
  // Met à jour l'image
  waterfallData = ctx.getImageData(0, 0, width, height);
  animationIdRef.value = requestAnimationFrame(() =>
    drawWaterfall({ analyser, canvasRef, props, channelData, animationIdRef })
  );
}
