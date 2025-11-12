<script setup lang="ts">
import { ref, computed, onMounted, shallowRef } from 'vue';
import { Button } from '@/components/ui/button';
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletZoomControl,
  LeafletVirtualize,
  LeafletMarker,
  LeafletCircle,
  LeafletPolygon,
  LeafletPolyline,
  LeafletRectangle,
  type LeafletMapExposed,
} from '~~/registry/new-york/components/leaflet-map';
import { loadVirtualizationDemoData } from './virtualization-demo-loader';
import type {
  DemoMarker,
  DemoCircle,
  DemoPolygon,
  DemoPolyline,
  DemoRectangle,
} from './virtualization-demo-loader';
import type { UseQuadtreeReturn } from '~~/registry/new-york/composables/use-quadtree/useQuadtree';

const mapRef = ref<LeafletMapExposed | null>(null);

// Mode de virtualisation
const virtualizationEnabled = ref(true);
const isTransitioning = ref(false); // État de transition
const autoMargin = ref(true); // Auto-adjust margin based on zoom
const virtualizationMargin = ref(1000); // Margin in meters (when not auto)
const marginZoomRatio = ref(1.0); // Zoom-based margin scaling factor

// Zoom level controls for each feature type
const markersMinZoom = ref<number | undefined>(13);
const markersMaxZoom = ref<number | undefined>(undefined);
const circlesMinZoom = ref<number | undefined>(11);
const circlesMaxZoom = ref<number | undefined>(15);
const polygonsMinZoom = ref<number | undefined>(undefined);
const polygonsMaxZoom = ref<number | undefined>(12);
const polylinesMinZoom = ref<number | undefined>(12);
const polylinesMaxZoom = ref<number | undefined>(16);
const rectanglesMinZoom = ref<number | undefined>(10);
const rectanglesMaxZoom = ref<number | undefined>(14);

const visibleMarkersCount = ref(0);
const visibleCirclesCount = ref(0);
const visiblePolygonsCount = ref(0);
const visiblePolylinesCount = ref(0);
const visibleRectanglesCount = ref(0);
const visibleShapesCount = computed(
  () =>
    visibleMarkersCount.value +
    visibleCirclesCount.value +
    visiblePolygonsCount.value +
    visiblePolylinesCount.value +
    visibleRectanglesCount.value
);

// Data loading state
const isLoading = ref(true);
const loadingProgress = ref(0);
const loadingStage = ref('Starting...');
const markers = ref<DemoMarker[]>([]);
const circles = ref<DemoCircle[]>([]);
const polygons = ref<DemoPolygon[]>([]);
const polylines = ref<DemoPolyline[]>([]);
const rectangles = ref<DemoRectangle[]>([]);

// Quadtrees for spatial indexing (using shallowRef to track object replacement)
const markersQuadtree = shallowRef<UseQuadtreeReturn<DemoMarker> | null>(null);
const circlesQuadtree = shallowRef<UseQuadtreeReturn<DemoCircle> | null>(null);
const polygonsQuadtree = shallowRef<UseQuadtreeReturn<DemoPolygon> | null>(null);
const polylinesQuadtree = shallowRef<UseQuadtreeReturn<DemoPolyline> | null>(null);
const rectanglesQuadtree = shallowRef<UseQuadtreeReturn<DemoRectangle> | null>(null);

const totalShapes = computed(
  () =>
    markers.value.length +
    circles.value.length +
    polygons.value.length +
    polylines.value.length +
    rectangles.value.length
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
  polylines.value = data.polylines;
  rectangles.value = data.rectangles;
  markersQuadtree.value = data.quadtrees.markers;
  circlesQuadtree.value = data.quadtrees.circles;
  polygonsQuadtree.value = data.quadtrees.polygons;
  polylinesQuadtree.value = data.quadtrees.polylines;
  rectanglesQuadtree.value = data.quadtrees.rectangles;
  isLoading.value = false;
});

const stats = ref({
  fps: 0,
});

// Toggle virtualization with transition handling
const toggleVirtualization = () => {
  // Just toggle - LeafletVirtualize handles the transition
  virtualizationEnabled.value = !virtualizationEnabled.value;
};

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
      <div class="w-64 h-2 rounded-full overflow-hidden">
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
      <div class="rounded flex flex-col gap-4 p-4">
        <!-- Stats row -->
        <div class="flex items-center gap-6">
          <div class="text-sm">
            <strong>Total:</strong>
            {{ totalShapes }} shapes
          </div>
          <div class="text-sm" :class="virtualizationEnabled ? 'text-green-600' : 'text-red-600'">
            <strong>Rendered:</strong>
            {{ visibleShapesCount }}
            <span class="text-xs"
              >({{ Math.round((visibleShapesCount / totalShapes) * 100) }}%)</span
            >
          </div>
          <div
            class="text-sm"
            :class="
              stats.fps < 30
                ? 'text-red-600'
                : stats.fps < 50
                  ? 'text-orange-600'
                  : 'text-green-600'
            "
          >
            <strong>FPS:</strong>
            {{ stats.fps }}
          </div>
        </div>

        <!-- Shape counts row -->
        <div class="flex items-center gap-6 text-xs text-gray-600">
          <div>
            <strong>Markers:</strong>
            {{ visibleMarkersCount }} / {{ markers.length }}
          </div>
          <div>
            <strong>Circles:</strong>
            {{ visibleCirclesCount }} / {{ circles.length }}
          </div>
          <div>
            <strong>Polygons:</strong>
            {{ visiblePolygonsCount }} / {{ polygons.length }}
          </div>
          <div>
            <strong>Polylines:</strong>
            {{ visiblePolylinesCount }} / {{ polylines.length }}
          </div>
          <div>
            <strong>Rectangles:</strong>
            {{ visibleRectanglesCount }} / {{ rectangles.length }}
          </div>
        </div>

        <!-- Controls row -->
        <div class="flex items-center gap-4">
          <Button
            @click="toggleVirtualization"
            :disabled="isTransitioning"
            :class="
              virtualizationEnabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            "
          >
            <span v-if="isTransitioning">Switching...</span>
            <span v-else>{{
              virtualizationEnabled ? 'Virtualization ON' : 'Virtualization OFF'
            }}</span>
          </Button>

          <div class="flex items-center gap-2">
            <label class="text-sm">Auto Margin:</label>
            <input
              v-model="autoMargin"
              type="checkbox"
              class="w-4 h-4"
              :disabled="isTransitioning"
            />
          </div>

          <div v-if="autoMargin" class="flex items-center gap-2">
            <label class="text-sm">Zoom Ratio:</label>
            <input
              v-model.number="marginZoomRatio"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              class="w-32"
              :disabled="isTransitioning"
            />
            <span class="text-sm w-12">{{ marginZoomRatio.toFixed(1) }}x</span>
          </div>

          <div v-else class="flex items-center gap-2">
            <label class="text-sm">Margin:</label>
            <input
              v-model.number="virtualizationMargin"
              type="range"
              min="0"
              max="5000"
              step="250"
              class="w-32"
              :disabled="isTransitioning"
            />
            <span class="text-sm w-16">{{ virtualizationMargin }} m</span>
          </div>

          <!-- Zoom Levels Controls (collapsible) -->
          <details class="border rounded p-3">
            <summary class="cursor-pointer text-sm font-semibold mb-2">
              🔍 Zoom Levels per Feature Type
            </summary>

            <div class="mt-3 space-y-2">
              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Markers:</span>
                <input
                  v-model.number="markersMinZoom"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model.number="markersMaxZoom"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(zoom ≥13)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Circles:</span>
                <input
                  v-model.number="circlesMinZoom"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model.number="circlesMaxZoom"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(zoom 11-15)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Polygons:</span>
                <input
                  v-model.number="polygonsMinZoom"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model.number="polygonsMaxZoom"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(zoom ≤12)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Polylines:</span>
                <input
                  v-model.number="polylinesMinZoom"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model.number="polylinesMaxZoom"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(zoom 12-16)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Rectangles:</span>
                <input
                  v-model.number="rectanglesMinZoom"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model.number="rectanglesMaxZoom"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(zoom 10-14)</span>
              </div>

              <div class="text-xs text-gray-500 mt-2 pt-2 border-t">
                💡 Leave empty for no limit. Example: Markers appear at zoom 12+, Polygons disappear
                after zoom 14.
              </div>
            </div>
          </details>
        </div>
      </div>

      <!-- Map -->
      <div class="flex-1 relative">
        <!-- Transition overlay -->
        <div
          v-if="isTransitioning"
          class="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg"
        >
          <div class="bg-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div
              class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            ></div>
            <span class="text-sm font-medium">
              {{ virtualizationEnabled ? 'Enabling' : 'Disabling' }} virtualization...
            </span>
          </div>
        </div>

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
          <LeafletVirtualize
            v-if="markersQuadtree"
            :enabled="virtualizationEnabled"
            :quadtree="markersQuadtree"
            :margin-meters="autoMargin ? undefined : virtualizationMargin"
            :margin-zoom-ratio="autoMargin ? marginZoomRatio : undefined"
            :min-zoom="markersMinZoom"
            :max-zoom="markersMaxZoom"
            @update:visible-count="visibleMarkersCount = $event"
            @transition-start="isTransitioning = true"
            @transition-end="isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="marker in markers" :key="marker.id">
              <LeafletMarker
                v-if="visibleIds.has(marker.id)"
                :id="marker.id"
                v-model:lat="marker.lat"
                v-model:lng="marker.lng"
              />
            </template>
          </LeafletVirtualize>

          <!-- Circles with Quadtree Virtualization -->
          <LeafletVirtualize
            v-if="circlesQuadtree"
            :enabled="virtualizationEnabled"
            :margin-meters="autoMargin ? undefined : virtualizationMargin"
            :margin-zoom-ratio="autoMargin ? marginZoomRatio : undefined"
            :quadtree="circlesQuadtree"
            :min-zoom="circlesMinZoom"
            :max-zoom="circlesMaxZoom"
            @update:visible-count="visibleCirclesCount = $event"
            @transition-start="isTransitioning = true"
            @transition-end="isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="circle in circles" :key="circle.id">
              <LeafletCircle
                v-if="visibleIds.has(circle.id)"
                :id="circle.id"
                v-model:lat="circle.lat"
                v-model:lng="circle.lng"
                v-model:radius="circle.radius"
                :class="
                  circle.colorIndex === 0
                    ? 'bg-blue-500/30 border border-blue-700'
                    : circle.colorIndex === 1
                      ? 'bg-green-500/30 border border-green-700'
                      : 'bg-red-500/30 border border-red-700'
                "
              />
            </template>
          </LeafletVirtualize>

          <!-- Polygons with Quadtree Virtualization -->
          <LeafletVirtualize
            v-if="polygonsQuadtree"
            :enabled="virtualizationEnabled"
            :margin-meters="autoMargin ? undefined : virtualizationMargin"
            :margin-zoom-ratio="autoMargin ? marginZoomRatio : undefined"
            :quadtree="polygonsQuadtree"
            :min-zoom="polygonsMinZoom"
            :max-zoom="polygonsMaxZoom"
            @update:visible-count="visiblePolygonsCount = $event"
            @transition-start="isTransitioning = true"
            @transition-end="isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="polygon in polygons" :key="polygon.id">
              <LeafletPolygon
                v-if="visibleIds.has(polygon.id)"
                :id="polygon.id"
                v-model:latlngs="polygon.latlngs"
                :class="
                  polygon.colorIndex === 0
                    ? 'bg-purple-500/30 border border-purple-700'
                    : 'bg-orange-500/30 border border-orange-700'
                "
              />
            </template>
          </LeafletVirtualize>

          <!-- Polylines with Quadtree Virtualization -->
          <LeafletVirtualize
            v-if="polylinesQuadtree"
            :enabled="virtualizationEnabled"
            :margin-meters="autoMargin ? undefined : virtualizationMargin"
            :margin-zoom-ratio="autoMargin ? marginZoomRatio : undefined"
            :quadtree="polylinesQuadtree"
            :min-zoom="polylinesMinZoom"
            :max-zoom="polylinesMaxZoom"
            @update:visible-count="visiblePolylinesCount = $event"
            @transition-start="isTransitioning = true"
            @transition-end="isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="polyline in polylines" :key="polyline.id">
              <LeafletPolyline
                v-if="visibleIds.has(polyline.id)"
                :id="polyline.id"
                v-model:latlngs="polyline.latlngs"
                :class="
                  polyline.colorIndex === 0
                    ? 'border border-yellow-600'
                    : polyline.colorIndex === 1
                      ? 'border border-pink-600'
                      : 'border border-cyan-600'
                "
              />
            </template>
          </LeafletVirtualize>

          <!-- Rectangles with Quadtree Virtualization -->
          <LeafletVirtualize
            v-if="rectanglesQuadtree"
            :enabled="virtualizationEnabled"
            :margin-meters="autoMargin ? undefined : virtualizationMargin"
            :margin-zoom-ratio="autoMargin ? marginZoomRatio : undefined"
            :quadtree="rectanglesQuadtree"
            :min-zoom="rectanglesMinZoom"
            :max-zoom="rectanglesMaxZoom"
            @update:visible-count="visibleRectanglesCount = $event"
            @transition-start="isTransitioning = true"
            @transition-end="isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="rectangle in rectangles" :key="rectangle.id">
              <LeafletRectangle
                v-if="visibleIds.has(rectangle.id)"
                :id="rectangle.id"
                v-model:bounds="rectangle.bounds"
                :class="
                  rectangle.colorIndex === 0
                    ? 'bg-indigo-500/30 border border-indigo-700'
                    : 'bg-teal-500/30 border border-teal-700'
                "
              />
            </template>
          </LeafletVirtualize>
        </LeafletMap>
      </div>

      <!-- Info -->
      <div class="text-sm text-gray-600 p-4 rounded border">
        <p>
          <strong>Note:</strong> Cette démo utilise {{ totalShapes }} shapes pré-générées ({{
            markers.length
          }}
          markers, {{ circles.length }} circles, {{ polygons.length }} polygons,
          {{ polylines.length }} polylines, {{ rectangles.length }} rectangles) autour de Paris.
        </p>
        <p class="mt-2">
          Avec la virtualisation <strong class="text-green-600">activée</strong>, seules les shapes
          visibles dans la viewport (+ marge) sont rendues. Regardez le compteur "Rendered" pour
          voir combien de shapes sont actuellement montées.
        </p>
        <p class="mt-2">
          Avec la virtualisation <strong class="text-red-600">désactivée</strong>, TOUTES les
          {{ totalShapes }} shapes sont rendues en même temps, ce qui peut causer des lags
          importants lors du zoom/déplacement.
        </p>
        <p class="mt-2 text-orange-600 font-semibold">
          <strong>Pour tester:</strong>
        </p>
        <ol class="mt-1 ml-4 list-decimal text-orange-600">
          <li>
            Activez la virtualisation → Déplacez la carte → Notez le FPS et le % de shapes rendues
          </li>
          <li>
            Désactivez la virtualisation → Déplacez la carte → Comparez le FPS (devrait chuter !)
          </li>
          <li>Zoomez/dézoomez pour voir comment le nombre de shapes rendues change</li>
        </ol>
      </div>
    </template>
  </div>
</template>
