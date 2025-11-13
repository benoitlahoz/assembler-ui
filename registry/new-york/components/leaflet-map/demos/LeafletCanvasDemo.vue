<script setup lang="ts">
import { ref, watch, type ComponentPublicInstance } from 'vue';
import { ClientOnly } from '#components';
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletControls,
  LeafletControlItem,
  LeafletCanvasGL,
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
const zoom = ref(15);

// Coins du canvas (ordre: top-left, top-right, bottom-right, bottom-left)
const canvasCorners = ref([
  { lat: 43.305, lng: 5.365 },
  { lat: 43.305, lng: 5.375 },
  { lat: 43.3, lng: 5.375 },
  { lat: 43.3, lng: 5.365 },
]);

const isEditable = ref(false);
const isDraggable = ref(false);
const canvasOpacity = ref(0.85);

// Référence au canvas source pour pouvoir le redessiner
const sourceCanvas = ref<HTMLCanvasElement | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const isVideoLoaded = ref(false);
const isVideoPlaying = ref(false);
let animationFrameId: number | null = null;

// URL de la vidéo météo via proxy pour contourner CORS
// Utilise Google Cloud Storage (fiable) en attendant de trouver une URL NASA valide
const videoUrl =
  '/api/proxy-video?url=' +
  encodeURIComponent(
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  );

const onCanvasReady = (canvas: HTMLCanvasElement) => {
  sourceCanvas.value = canvas;

  // Créer un élément vidéo
  if (!videoElement.value) {
    videoElement.value = document.createElement('video');
    // Pas besoin de crossOrigin car on passe par notre proxy
    videoElement.value.loop = true;
    videoElement.value.muted = true;
    videoElement.value.playsInline = true;

    // Charger la vidéo
    videoElement.value.src = videoUrl;

    videoElement.value.addEventListener('loadeddata', () => {
      isVideoLoaded.value = true;
      // Dessiner la première frame
      drawVideoFrame();
    });

    videoElement.value.addEventListener('error', () => {
      // En cas d'erreur, afficher un contenu par défaut
      drawDefaultContent(canvas);
    });

    videoElement.value.load();
  }
};

const drawDefaultContent = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

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
  ctx.fillText('NASA Earth Clouds Overlay', canvas.width / 2, 50);

  ctx.font = '16px Arial';
  ctx.fillText("Cliquez sur 'Lancer Vidéo' pour", canvas.width / 2, 120);
  ctx.fillText('afficher les nuages de la NASA', canvas.width / 2, 145);
};

const drawVideoFrame = () => {
  if (!sourceCanvas.value || !videoElement.value || !canvasRef.value) return;

  const ctx = sourceCanvas.value.getContext('2d');
  if (!ctx) return;

  // Dessiner la frame vidéo sur le canvas
  ctx.drawImage(videoElement.value, 0, 0, sourceCanvas.value.width, sourceCanvas.value.height);

  // Redessiner le canvas déformé
  canvasRef.value.redraw();

  // Continuer l'animation si la vidéo est en lecture
  if (isVideoPlaying.value && !videoElement.value.paused) {
    animationFrameId = requestAnimationFrame(drawVideoFrame);
  }
};

const toggleVideo = () => {
  if (!videoElement.value || !isVideoLoaded.value) return;

  if (isVideoPlaying.value) {
    // Pause
    videoElement.value.pause();
    isVideoPlaying.value = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  } else {
    // Play
    videoElement.value.play();
    isVideoPlaying.value = true;
    drawVideoFrame();
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

watch(
  () => canvasOpacity.value,
  () => {
    if (canvasRef.value) {
      canvasRef.value.redraw();
    }
  }
);
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

        <button
          @click="toggleVideo"
          :disabled="!isVideoLoaded"
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="
            isVideoPlaying
              ? 'bg-red-500 text-white hover:bg-red-600'
              : isVideoLoaded
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          "
        >
          {{ !isVideoLoaded ? 'Chargement...' : isVideoPlaying ? 'Pause Vidéo' : 'Lancer Vidéo' }}
        </button>

        <div class="flex items-center gap-2">
          <label for="opacity-slider" class="text-sm font-medium text-gray-700"> Opacité: </label>
          <input
            id="opacity-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="canvasOpacity"
            class="w-32"
          />
          <span class="text-sm text-gray-600 w-12">{{ (canvasOpacity * 100).toFixed(0) }}%</span>
        </div>
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
          <LeafletCanvasGL
            ref="canvasRef"
            :corners="canvasCorners"
            :width="400"
            :height="300"
            :editable="isEditable"
            :draggable="isDraggable"
            :subdivisions="20"
            :opacity="canvasOpacity"
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
          <li>Ajustez l'opacité avec le slider</li>
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
