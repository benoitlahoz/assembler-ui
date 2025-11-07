// Visualisation scope XY (oscilloscope stéréo)
import type { Ref } from 'vue';
import type { AudioVisualizerProps } from '../AudioVisualizer.vue';

export interface DrawScopeXYParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawScopeXY({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawScopeXYParams) {
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
  const fftSize = props.fftSize ?? 2048;
  // On suppose 2 canaux (stéréo)
  if (!channelData[0] || !(channelData[0] instanceof Float32Array))
    channelData[0] = new Float32Array(fftSize);
  if (!channelData[1] || !(channelData[1] instanceof Float32Array))
    channelData[1] = new Float32Array(fftSize);
  analyser.getFloatTimeDomainData(channelData[0] as Float32Array<ArrayBuffer>);
  analyser.getFloatTimeDomainData(channelData[1] as Float32Array<ArrayBuffer>);
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < fftSize; i++) {
    const x = (channelData[0][i] + 1) * (width / 2);
    const y = (channelData[1][i] + 1) * (height / 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = props.colors?.[0] ?? '#448aff';
  ctx.lineWidth = props.lineWidth ?? 2;
  ctx.stroke();
  ctx.restore();
  animationIdRef.value = requestAnimationFrame(() =>
    drawScopeXY({ analyser, canvasRef, props, channelData, animationIdRef })
  );
}
