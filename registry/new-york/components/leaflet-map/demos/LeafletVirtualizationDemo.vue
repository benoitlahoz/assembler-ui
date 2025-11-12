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

// Virtualization controls
const virtualizationConfig = ref({
  enabled: true,
  isTransitioning: false,
  autoMargin: true,
  marginMeters: 1000,
  marginZoomRatio: 1.0,
});

// Zoom level controls for each feature type
const zoomLevels = ref({
  markers: { min: 12, max: undefined as number | undefined },
  circles: { min: undefined as number | undefined, max: undefined as number | undefined },
  polygons: { min: undefined as number | undefined, max: 14 },
  polylines: { min: undefined as number | undefined, max: undefined as number | undefined },
  rectangles: { min: undefined as number | undefined, max: undefined as number | undefined },
});

// Visible counts for each feature type
const visibleCounts = ref({
  markers: 0,
  circles: 0,
  polygons: 0,
  polylines: 0,
  rectangles: 0,
});

const visibleShapesCount = computed(
  () =>
    visibleCounts.value.markers +
    visibleCounts.value.circles +
    visibleCounts.value.polygons +
    visibleCounts.value.polylines +
    visibleCounts.value.rectangles
);

// Data loading state
const loadingState = ref({
  isLoading: true,
  progress: 0,
  stage: 'Starting...',
});

// Feature data
const features = ref({
  markers: [] as DemoMarker[],
  circles: [] as DemoCircle[],
  polygons: [] as DemoPolygon[],
  polylines: [] as DemoPolyline[],
  rectangles: [] as DemoRectangle[],
});

// Quadtrees for spatial indexing (using shallowRef to track object replacement)
const quadtrees = shallowRef({
  markers: null as UseQuadtreeReturn<DemoMarker> | null,
  circles: null as UseQuadtreeReturn<DemoCircle> | null,
  polygons: null as UseQuadtreeReturn<DemoPolygon> | null,
  polylines: null as UseQuadtreeReturn<DemoPolyline> | null,
  rectangles: null as UseQuadtreeReturn<DemoRectangle> | null,
});

const totalShapes = computed(
  () =>
    features.value.markers.length +
    features.value.circles.length +
    features.value.polygons.length +
    features.value.polylines.length +
    features.value.rectangles.length
);

// Load data asynchronously
onMounted(async () => {
  const data = await loadVirtualizationDemoData((progress: number, stage: string) => {
    loadingState.value.progress = progress;
    loadingState.value.stage = stage;
  });
  features.value.markers = data.markers;
  features.value.circles = data.circles;
  features.value.polygons = data.polygons;
  features.value.polylines = data.polylines;
  features.value.rectangles = data.rectangles;
  quadtrees.value.markers = data.quadtrees.markers;
  quadtrees.value.circles = data.quadtrees.circles;
  quadtrees.value.polygons = data.quadtrees.polygons;
  quadtrees.value.polylines = data.quadtrees.polylines;
  quadtrees.value.rectangles = data.quadtrees.rectangles;
  loadingState.value.isLoading = false;
});

const stats = ref({
  fps: 0,
});

// Toggle virtualization with transition handling
const toggleVirtualization = () => {
  // Just toggle - LeafletVirtualize handles the transition
  virtualizationConfig.value.enabled = !virtualizationConfig.value.enabled;
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
    <div v-if="loadingState.isLoading" class="flex flex-col items-center justify-center p-8 gap-4">
      <div class="text-lg font-semibold">{{ loadingState.stage }}</div>
      <div class="w-64 h-2 rounded-full overflow-hidden">
        <div
          class="h-full bg-blue-500 transition-all duration-300"
          :style="{ width: `${loadingState.progress}%` }"
        />
      </div>
      <div class="text-sm text-gray-600">{{ loadingState.progress }}%</div>
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
          <div
            class="text-sm"
            :class="virtualizationConfig.enabled ? 'text-green-600' : 'text-red-600'"
          >
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
            {{ visibleCounts.markers }} / {{ features.markers.length }}
          </div>
          <div>
            <strong>Circles:</strong>
            {{ visibleCounts.circles }} / {{ features.circles.length }}
          </div>
          <div>
            <strong>Polygons:</strong>
            {{ visibleCounts.polygons }} / {{ features.polygons.length }}
          </div>
          <div>
            <strong>Polylines:</strong>
            {{ visibleCounts.polylines }} / {{ features.polylines.length }}
          </div>
          <div>
            <strong>Rectangles:</strong>
            {{ visibleCounts.rectangles }} / {{ features.rectangles.length }}
          </div>
        </div>

        <!-- Controls row -->
        <div class="flex items-center gap-4">
          <Button
            @click="toggleVirtualization"
            :disabled="virtualizationConfig.isTransitioning"
            :class="
              virtualizationConfig.enabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            "
          >
            <span v-if="virtualizationConfig.isTransitioning">Switching...</span>
            <span v-else>{{
              virtualizationConfig.enabled ? 'Virtualization ON' : 'Virtualization OFF'
            }}</span>
          </Button>

          <div class="flex items-center gap-2">
            <label class="text-sm">Auto Margin:</label>
            <input
              v-model="virtualizationConfig.autoMargin"
              type="checkbox"
              class="w-4 h-4"
              :disabled="virtualizationConfig.isTransitioning"
            />
          </div>

          <div v-if="virtualizationConfig.autoMargin" class="flex items-center gap-2">
            <label class="text-sm">Zoom Ratio:</label>
            <input
              v-model.number="virtualizationConfig.marginZoomRatio"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              class="w-32"
              :disabled="virtualizationConfig.isTransitioning"
            />
            <span class="text-sm w-12">{{ virtualizationConfig.marginZoomRatio.toFixed(1) }}x</span>
          </div>

          <div v-else class="flex items-center gap-2">
            <label class="text-sm">Margin:</label>
            <input
              v-model.number="virtualizationConfig.marginMeters"
              type="range"
              min="0"
              max="5000"
              step="250"
              class="w-32"
              :disabled="virtualizationConfig.isTransitioning"
            />
            <span class="text-sm w-16">{{ virtualizationConfig.marginMeters }} m</span>
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
                  v-model.number="zoomLevels.markers.min"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model.number="zoomLevels.markers.max"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(zoom ≥12)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Circles:</span>
                <input
                  v-model.number="zoomLevels.circles.min"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model.number="zoomLevels.circles.max"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(always)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Polygons:</span>
                <input
                  v-model.number="zoomLevels.polygons.min"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model.number="zoomLevels.polygons.max"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(zoom ≤14)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Polylines:</span>
                <input
                  v-model.number="zoomLevels.polylines.min"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model.number="zoomLevels.polylines.max"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(always)</span>
              </div>

              <div class="flex items-center gap-3 text-xs">
                <span class="w-20 font-medium">Rectangles:</span>
                <input
                  v-model.number="zoomLevels.rectangles.min"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="min"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-400">→</span>
                <input
                  v-model.number="zoomLevels.rectangles.max"
                  type="number"
                  min="0"
                  max="20"
                  placeholder="max"
                  class="w-16 px-2 py-1 border rounded"
                />
                <span class="text-gray-500">(always)</span>
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
          v-if="virtualizationConfig.isTransitioning"
          class="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-lg"
        >
          <div class="bg-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div
              class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
            ></div>
            <span class="text-sm font-medium">
              {{ virtualizationConfig.enabled ? 'Enabling' : 'Disabling' }} virtualization...
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
            v-if="quadtrees.markers"
            :enabled="virtualizationConfig.enabled"
            :quadtree="quadtrees.markers"
            :margin-meters="
              virtualizationConfig.autoMargin ? undefined : virtualizationConfig.marginMeters
            "
            :margin-zoom-ratio="
              virtualizationConfig.autoMargin ? virtualizationConfig.marginZoomRatio : undefined
            "
            :min-zoom="zoomLevels.markers.min"
            :max-zoom="zoomLevels.markers.max"
            @update:visible-count="visibleCounts.markers = $event"
            @transition-start="virtualizationConfig.isTransitioning = true"
            @transition-end="virtualizationConfig.isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="marker in features.markers" :key="marker.id">
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
            v-if="quadtrees.circles"
            :enabled="virtualizationConfig.enabled"
            :margin-meters="
              virtualizationConfig.autoMargin ? undefined : virtualizationConfig.marginMeters
            "
            :margin-zoom-ratio="
              virtualizationConfig.autoMargin ? virtualizationConfig.marginZoomRatio : undefined
            "
            :quadtree="quadtrees.circles"
            :min-zoom="zoomLevels.circles.min"
            :max-zoom="zoomLevels.circles.max"
            @update:visible-count="visibleCounts.circles = $event"
            @transition-start="virtualizationConfig.isTransitioning = true"
            @transition-end="virtualizationConfig.isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="circle in features.circles" :key="circle.id">
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
            v-if="quadtrees.polygons"
            :enabled="virtualizationConfig.enabled"
            :margin-meters="
              virtualizationConfig.autoMargin ? undefined : virtualizationConfig.marginMeters
            "
            :margin-zoom-ratio="
              virtualizationConfig.autoMargin ? virtualizationConfig.marginZoomRatio : undefined
            "
            :quadtree="quadtrees.polygons"
            :min-zoom="zoomLevels.polygons.min"
            :max-zoom="zoomLevels.polygons.max"
            @update:visible-count="visibleCounts.polygons = $event"
            @transition-start="virtualizationConfig.isTransitioning = true"
            @transition-end="virtualizationConfig.isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="polygon in features.polygons" :key="polygon.id">
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
            v-if="quadtrees.polylines"
            :enabled="virtualizationConfig.enabled"
            :margin-meters="
              virtualizationConfig.autoMargin ? undefined : virtualizationConfig.marginMeters
            "
            :margin-zoom-ratio="
              virtualizationConfig.autoMargin ? virtualizationConfig.marginZoomRatio : undefined
            "
            :quadtree="quadtrees.polylines"
            :min-zoom="zoomLevels.polylines.min"
            :max-zoom="zoomLevels.polylines.max"
            @update:visible-count="visibleCounts.polylines = $event"
            @transition-start="virtualizationConfig.isTransitioning = true"
            @transition-end="virtualizationConfig.isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="polyline in features.polylines" :key="polyline.id">
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
            v-if="quadtrees.rectangles"
            :enabled="virtualizationConfig.enabled"
            :margin-meters="
              virtualizationConfig.autoMargin ? undefined : virtualizationConfig.marginMeters
            "
            :margin-zoom-ratio="
              virtualizationConfig.autoMargin ? virtualizationConfig.marginZoomRatio : undefined
            "
            :quadtree="quadtrees.rectangles"
            :min-zoom="zoomLevels.rectangles.min"
            :max-zoom="zoomLevels.rectangles.max"
            @update:visible-count="visibleCounts.rectangles = $event"
            @transition-start="virtualizationConfig.isTransitioning = true"
            @transition-end="virtualizationConfig.isTransitioning = false"
            v-slot="{ visibleIds }"
          >
            <template v-for="rectangle in features.rectangles" :key="rectangle.id">
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
            features.markers.length
          }}
          markers, {{ features.circles.length }} circles, {{ features.polygons.length }} polygons,
          {{ features.polylines.length }} polylines, {{ features.rectangles.length }} rectangles)
          autour de Paris.
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
