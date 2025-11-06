// Visualisation LED Bars inspirée d'audioMotion-analyzer
// Chaque barre est dessinée comme une LED (rond ou rectangle avec effet lumineux)

// Version compatible avec AudioVisualizer.vue

import type { Ref } from 'vue';

export function drawLedBars({
  canvasRef,
  data,
  props,
}: {
  canvasRef: Ref<HTMLCanvasElement | null>;
  data: Float32Array[];
  props: any;
}) {
  const canvas = canvasRef?.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const colors = props.colors ?? ['#00ff00', '#00eaff', '#ffea00', '#ff00ea'];
  const barCount = props.barCount ?? 32;
  const ledRows = props.ledRows ?? 12;
  const spacing = props.spacing ?? 2;
  const ledRadius = props.ledRadius ?? 6;
  const background = props.background ?? '#111';

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  // Utilise le premier canal (mono ou mix)
  const channel = data[0] ?? new Float32Array(barCount);
  const barWidth = (width - spacing * (barCount - 1)) / barCount;
  const maxVal = 1;

  for (let i = 0; i < barCount; i++) {
    // Valeur normalisée pour la barre
    const value = Math.max(0, Math.min(channel[i] ?? 0, maxVal));
    // Nombre de LEDs allumées pour cette barre
    const ledsOn = Math.round(value * ledRows);
    for (let j = 0; j < ledRows; j++) {
      // Position de la LED
      const x = i * (barWidth + spacing) + barWidth / 2;
      // Correction du calcul Y pour rester dans le canvas
      const totalLedHeight = ledRows * (ledRadius * 2 + spacing);
      const yStart = height - totalLedHeight + ledRadius;
      const y = yStart + j * (ledRadius * 2 + spacing);
      // Protection : ne dessine pas si la LED est hors du canvas
      if (y < 0 || y > height) continue;
      // Couleur de la LED (dégradé du bas vers le haut)
      const colorIdx = Math.floor((j / ledRows) * colors.length);
      const ledColor: string = colors[colorIdx] || colors[0];
      if (j < ledsOn) {
        // LED allumée
        ctx.beginPath();
        ctx.arc(x, y, ledRadius, 0, Math.PI * 2);
        ctx.fillStyle = ledColor;
        ctx.shadowColor = ledColor;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.95;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      } else {
        // LED éteinte
        ctx.beginPath();
        ctx.arc(x, y, ledRadius, 0, Math.PI * 2);
        ctx.fillStyle = background;
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
  ctx.restore();
}
