<script setup lang="ts">
import { ref, type ComponentPublicInstance } from 'vue';
import { ClientOnly } from '#components';
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletControls,
  LeafletControlItem,
  LeafletCanvas,
  type LeafletMapExposed,
} from '~~/registry/new-york/components/leaflet-map';
import { Icon } from '@iconify/vue';

type LeafletMapInstance = ComponentPublicInstance & LeafletMapExposed;
type LeafletCanvasInstance = ComponentPublicInstance & {
  sourceCanvas: HTMLCanvasElement | null;
  redraw: () => void;
};

const mapRef = ref<LeafletMapInstance | null>(null);
const canvasRef = ref<LeafletCanvasInstance | null>(null);
const zoom = ref(13);

// Coins du canvas (ordre: top-left, top-right, bottom-right, bottom-left)
const canvasCorners = ref([
  { lat: 43.305, lng: 5.365 },
  { lat: 43.305, lng: 5.375 },
  { lat: 43.3, lng: 5.375 },
  { lat: 43.3, lng: 5.365 },
]);

const isEditable = ref(false);
const isDraggable = ref(false);

// Référence au canvas source pour pouvoir le redessiner
const sourceCanvas = ref<HTMLCanvasElement | null>(null);

const onCanvasReady = (canvas: HTMLCanvasElement) => {
  sourceCanvas.value = canvas;

  // Dessiner quelque chose de plus intéressant
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Gradient de fond
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Texte
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Canvas Déformable', canvas.width / 2, 50);

    ctx.font = '16px Arial';
    ctx.fillText("Activez l'édition pour", canvas.width / 2, 120);
    ctx.fillText('déplacer les coins', canvas.width / 2, 145);

    // Dessiner un cercle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2 + 30, 40, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
};

const toggleEdit = () => {
  isEditable.value = !isEditable.value;
};

const toggleDrag = () => {
  isDraggable.value = !isDraggable.value;
};

const resetCorners = () => {
  canvasCorners.value = [
    { lat: 43.305, lng: 5.365 },
    { lat: 43.305, lng: 5.375 },
    { lat: 43.3, lng: 5.375 },
    { lat: 43.3, lng: 5.365 },
  ];
};

// Animation example
const animateCanvas = () => {
  if (!sourceCanvas.value || !canvasRef.value) return;

  const ctx = sourceCanvas.value.getContext('2d');
  if (!ctx) return;

  let rotation = 0;
  const animate = () => {
    if (!sourceCanvas.value || !canvasRef.value) return;

    ctx.clearRect(0, 0, sourceCanvas.value.width, sourceCanvas.value.height);

    // Gradient animé
    const gradient = ctx.createLinearGradient(
      0,
      0,
      sourceCanvas.value.width,
      sourceCanvas.value.height
    );
    gradient.addColorStop(0, `hsl(${rotation}, 70%, 60%)`);
    gradient.addColorStop(1, `hsl(${rotation + 60}, 70%, 60%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, sourceCanvas.value.width, sourceCanvas.value.height);

    // Texte
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Canvas Animé!', sourceCanvas.value.width / 2, 50);

    // Cercle tournant
    ctx.save();
    ctx.translate(sourceCanvas.value.width / 2, sourceCanvas.value.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(-30, -30, 60, 60);
    ctx.restore();

    // Redessiner le canvas déformé
    canvasRef.value.redraw();

    rotation += 2;
    if (rotation < 360) {
      requestAnimationFrame(animate);
    } else {
      // Redessiner le canvas original
      onCanvasReady(sourceCanvas.value);
      canvasRef.value.redraw();
    }
  };

  animate();
};
</script>

<template>
  <ClientOnly>
    <div class="space-y-4">
      <!-- Contrôles -->
      <div class="flex gap-2 flex-wrap">
        <button
          @click="toggleEdit"
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            isEditable
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          "
        >
          {{ isEditable ? 'Édition active' : 'Activer édition' }}
        </button>

        <button
          @click="toggleDrag"
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            isDraggable
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          "
        >
          {{ isDraggable ? 'Déplacement actif' : 'Activer déplacement' }}
        </button>

        <button
          @click="resetCorners"
          class="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-medium transition-colors"
        >
          Réinitialiser
        </button>

        <button
          @click="animateCanvas"
          class="px-4 py-2 rounded-md bg-purple-500 text-white hover:bg-purple-600 text-sm font-medium transition-colors"
        >
          Animer
        </button>
      </div>

      <!-- Carte -->
      <div class="h-128 min-h-128">
        <LeafletMap
          ref="mapRef"
          name="canvas-demo"
          tile-layer="openstreetmap"
          :center-lat="43.3026"
          :center-lng="5.3691"
          :zoom="zoom"
          class="rounded-lg"
        >
          <LeafletTileLayer
            name="openstreetmap"
            url-template="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <LeafletZoomControl position="topleft" />

          <!-- Canvas déformable -->
          <LeafletCanvas
            ref="canvasRef"
            :corners="canvasCorners"
            :width="400"
            :height="300"
            :editable="isEditable"
            :draggable="isDraggable"
            :subdivisions="20"
            class="border border-purple-500 bg-purple-500/30"
            @canvas-ready="onCanvasReady"
            @update:corners="(corners) => (canvasCorners = corners)"
          />
        </LeafletMap>
      </div>

      <!-- Informations -->
      <div class="text-sm text-gray-600 space-y-2">
        <p>
          <strong>Instructions:</strong>
        </p>
        <ul class="list-disc list-inside space-y-1">
          <li>Activez l'édition pour déplacer les 4 coins du canvas</li>
          <li>Activez le déplacement pour déplacer tout le canvas</li>
          <li>Cliquez sur "Animer" pour voir une animation sur le canvas</li>
          <li>Le canvas est subdivisé en grille pour une meilleure déformation</li>
        </ul>

        <div class="mt-4 p-3 bg-gray-100 rounded">
          <p class="font-medium mb-2">Coins actuels:</p>
          <div class="grid grid-cols-2 gap-2 text-xs font-mono">
            <div>
              TL: {{ canvasCorners[0]?.lat.toFixed(4) }}, {{ canvasCorners[0]?.lng.toFixed(4) }}
            </div>
            <div>
              TR: {{ canvasCorners[1]?.lat.toFixed(4) }}, {{ canvasCorners[1]?.lng.toFixed(4) }}
            </div>
            <div>
              BR: {{ canvasCorners[2]?.lat.toFixed(4) }}, {{ canvasCorners[2]?.lng.toFixed(4) }}
            </div>
            <div>
              BL: {{ canvasCorners[3]?.lat.toFixed(4) }}, {{ canvasCorners[3]?.lng.toFixed(4) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
