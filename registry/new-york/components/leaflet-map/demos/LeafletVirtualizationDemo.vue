<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletVirtualizeQuadtree,
  LeafletMarker,
  LeafletCircle,
  LeafletPolygon,
  type LeafletMapExposed,
} from '~~/registry/new-york/components/leaflet-map';
import { loadVirtualizationDemoData } from './virtualization-demo-loader';
import type { DemoMarker, DemoCircle, DemoPolygon } from './virtualization-demo-loader';
import type { UseQuadtreeReturn } from '~~/registry/new-york/composables/use-quadtree/useQuadtree';

const mapRef = ref<LeafletMapExposed | null>(null);

// Mode de virtualisation
const virtualizationEnabled = ref(true);
const virtualizationMargin = ref(0.1); // 0.1 degrees margin
const visibleMarkersCount = ref(0);
const visibleCirclesCount = ref(0);
const visibleShapesCount = computed(
  () => visibleMarkersCount.value + visibleCirclesCount.value + polygons.value.length
);

// Data loading state
const isLoading = ref(true);
const loadingProgress = ref(0);
const loadingStage = ref('Starting...');
const markers = ref<DemoMarker[]>([]);
const circles = ref<DemoCircle[]>([]);
const polygons = ref<DemoPolygon[]>([]);

// Quadtrees for spatial indexing (not wrapped in ref, already reactive)
let markersQuadtree: UseQuadtreeReturn<DemoMarker> | null = null;
let circlesQuadtree: UseQuadtreeReturn<DemoCircle> | null = null;

const totalShapes = computed(
  () => markers.value.length + circles.value.length + polygons.value.length
);

// Load data asynchronously
onMounted(async () => {
  const data = await loadVirtualizationDemoData((progress: number, stage: string) => {
    loadingProgress.value = progress;
    loadingStage.value = stage;
  });
  markers.value = data.markers;
  circles.value = data.circles;
  polygons.value = data.polygons;
  markersQuadtree = data.quadtrees.markers;
  circlesQuadtree = data.quadtrees.circles;
  isLoading.value = false;
});

const stats = ref({
  fps: 0,
});

// FPS counter
let lastTime = performance.now();
let frames = 0;
const updateFPS = () => {
  frames++;
  const now = performance.now();
  if (now >= lastTime + 1000) {
    stats.value.fps = Math.round((frames * 1000) / (now - lastTime));
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(updateFPS);
};
updateFPS();
</script>

<template>
  <div class="w-full h-full flex flex-col gap-4">
    <!-- Loading state -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center p-8 gap-4">
      <div class="text-lg font-semibold">{{ loadingStage }}</div>
      <div class="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-blue-500 transition-all duration-300"
          :style="{ width: `${loadingProgress}%` }"
        />
      </div>
      <div class="text-sm text-gray-600">{{ loadingProgress }}%</div>
    </div>

    <!-- Demo content -->
    <template v-else>
      <!-- Controls -->
      <div class="rounded flex items-center justify-between gap-4 p-4">
        <div class="flex items-center gap-4">
          <div class="text-sm">
            <strong>Total shapes:</strong>
            {{ totalShapes.toLocaleString() }}
          </div>
          <div class="text-sm">
            <strong>Rendered:</strong>
            {{ visibleShapesCount.toLocaleString() }}
          </div>
          <div class="text-sm">
            <strong>FPS:</strong>
            {{ stats.fps }}
          </div>
        </div>

        <div class="flex items-center gap-4">
          <Button
            @click="virtualizationEnabled = !virtualizationEnabled"
            :class="
              virtualizationEnabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            "
          >
            {{ virtualizationEnabled ? 'Virtualization ON' : 'Virtualization OFF' }}
          </Button>

          <div class="flex items-center gap-2">
            <label class="text-sm">Margin:</label>
            <input
              v-model.number="virtualizationMargin"
              type="range"
              min="0"
              max="1"
              step="0.05"
              class="w-32"
            />
            <span class="text-sm w-12">{{ virtualizationMargin.toFixed(2) }}°</span>
          </div>
        </div>
      </div>

      <!-- Map -->
      <div class="flex-1 relative">
        <LeafletMap
          ref="mapRef"
          name="virtualization-demo"
          class="w-full h-[600px] rounded-lg shadow-lg"
          tile-layer="osm"
          :center-lat="48.8566"
          :center-lng="2.3522"
          :zoom="15"
        >
          <LeafletTileLayer
            name="osm"
            url-template="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          <LeafletZoomControl position="topleft" />

          <!-- Markers with Quadtree Virtualization -->
          <LeafletVirtualizeQuadtree
            v-if="markersQuadtree"
            :enabled="virtualizationEnabled"
            :margin="virtualizationMargin"
            :quadtree="markersQuadtree"
            @update:visible-count="visibleMarkersCount = $event"
          >
            <template #default="{ isVisible }">
              <LeafletMarker
                v-for="marker in markers"
                v-show="isVisible(marker.id)"
                :key="marker.id"
                :id="marker.id"
                v-model:lat="marker.lat"
                v-model:lng="marker.lng"
              />
            </template>
          </LeafletVirtualizeQuadtree>

          <!-- Circles with Quadtree Virtualization -->
          <LeafletVirtualizeQuadtree
            v-if="circlesQuadtree"
            :enabled="virtualizationEnabled"
            :margin="virtualizationMargin"
            :quadtree="circlesQuadtree"
            @update:visible-count="visibleCirclesCount = $event"
          >
            <template #default="{ isVisible }">
              <LeafletCircle
                v-for="circle in circles"
                v-show="isVisible(circle.id)"
                :key="circle.id"
                :id="circle.id"
                v-model:lat="circle.lat"
                v-model:lng="circle.lng"
                v-model:radius="circle.radius"
                :class="circle.class"
              />
            </template>
          </LeafletVirtualizeQuadtree>

          <!-- Polygons (no quadtree, rendered directly) -->
          <LeafletPolygon
            v-for="polygon in polygons"
            :key="polygon.id"
            :id="polygon.id"
            v-model:latlngs="polygon.latlngs"
            :class="polygon.class"
          />
        </LeafletMap>
      </div>

      <!-- Info -->
      <div class="text-sm text-gray-600 p-4 rounded">
        <p>
          <strong>Note:</strong> Cette démo utilise {{ totalShapes.toLocaleString() }} shapes
          pré-générées ({{ markers.length.toLocaleString() }} markers,
          {{ circles.length.toLocaleString() }} circles,
          {{ polygons.length.toLocaleString() }} polygons) autour de Paris.
        </p>
        <p class="mt-2">
          Avec la virtualisation <strong>activée</strong>, seules les shapes visibles dans la
          viewport (+ marge) sont rendues, ce qui améliore considérablement les performances.
        </p>
        <p class="mt-2">
          Avec la virtualisation <strong>désactivée</strong>, toutes les shapes sont rendues en même
          temps, ce qui peut causer des lags importants lors du zoom/déplacement.
        </p>
        <p class="mt-2 text-orange-600">
          <strong>Astuce:</strong> Zoomez et déplacez-vous sur la carte pour voir la différence de
          performance entre les deux modes.
        </p>
      </div>
    </template>
  </div>
</template>
