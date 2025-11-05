// Visualiseur FFT "enhanced" avec effet glow et courbe lissée
import type { Ref } from 'vue';
import type { AudioVisualizerProps } from '../AudioVisualizer.vue';

export interface DrawFftEnhancedParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawFftEnhanced({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawFftEnhancedParams) {
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
  const channels = analyser.channelCount || 1;
  for (let ch = 0; ch < channels; ch++) {
    // Pour chaque canal, on crée un tableau de données
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatFrequencyData(dataArray);

    // Décalage vertical pour chaque canal
    const yOffset = (height / channels) * ch;
    // Effet glow
    ctx.save();
    let glowColor = '#00eaff';
    if (Array.isArray(props.colors) && props.colors.length > 0 && typeof props.colors[ch % props.colors.length] === 'string') {
      glowColor = props.colors[ch % props.colors.length] ?? '#00eaff';
    }
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
      const value = Number.isFinite(dataArray[i]) ? dataArray[i] : -100;
      const magnitude = Math.max(0, Math.min(1, (value + 100) / 100));
      const x = (i / bufferLength) * width;
      const y = yOffset + (height / channels) - magnitude * (height / channels);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    // Remplissage sous la courbe
    ctx.lineTo(width, yOffset + (height / channels));
    ctx.lineTo(0, yOffset + (height / channels));
    ctx.closePath();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = glowColor;
    ctx.fill();
    ctx.globalAlpha = 1;
    // Courbe
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = props.lineWidth ?? 2;
    ctx.stroke();
    ctx.restore();
  }

  animationIdRef.value = requestAnimationFrame(() =>
    drawFftEnhanced({ analyser, canvasRef, props, channelData, animationIdRef })
  );
}
