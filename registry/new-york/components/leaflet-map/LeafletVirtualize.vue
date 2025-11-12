<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, nextTick, watch, type Ref } from 'vue';
import { LeafletMapKey, LeafletModuleKey } from '.';
import type Leaflet from 'leaflet';
import type {
  UseQuadtreeReturn,
  Rect,
} from '~~/registry/new-york/composables/use-quadtree/useQuadtree';

export interface LeafletVirtualizeProps {
  /**
   * Quadtree composable return value for spatial indexing (required)
   * Uses O(log n) quadtree queries for efficient virtualization
   */
  quadtree: UseQuadtreeReturn<any>;

  /**
   * Enable/disable virtualization
   */
  enabled?: boolean;

  /**
   * Margin in meters to add to visible bounds for pre-loading features
   * Larger margin = more features pre-loaded = less "pop-in" but more DOM elements
   * If not set, margin will be calculated dynamically based on zoom level
   * @default undefined (auto-calculated based on zoom)
   */
  marginMeters?: number;

  /**
   * Ratio to scale margin based on zoom level (only used when marginMeters is not set)
   * Higher ratio = larger margin at low zoom levels
   * Formula: margin = marginZoomRatio * (20 - zoom) * 100 meters
   * @default 1.0
   * @example
   * - zoom 5: margin ≈ 1500m (1.5km)
   * - zoom 10: margin ≈ 1000m (1km)
   * - zoom 15: margin ≈ 500m (0.5km)
   * - zoom 18: margin ≈ 200m
   */
  marginZoomRatio?: number;

  /**
   * Array of feature IDs that should always be rendered, regardless of visibility
   * Useful for selected features or important landmarks
   */
  alwaysVisible?: Array<string | number>;

  /**
   * Minimum zoom level to render features (inclusive)
   * Below this zoom, features will not be displayed
   * @default undefined (no minimum)
   */
  minZoom?: number;

  /**
   * Maximum zoom level to render features (inclusive)
   * Above this zoom, features will not be displayed
   * @default undefined (no maximum)
   */
  maxZoom?: number;

  /**
   * Delay in milliseconds before applying virtualization changes
   * Helps smooth transitions when toggling virtualization on/off
   * @default 50
   */
  transitionDelay?: number;
}

const props = withDefaults(defineProps<LeafletVirtualizeProps>(), {
  enabled: true,
  marginMeters: undefined,
  marginZoomRatio: 1.0,
  alwaysVisible: () => [],
  minZoom: undefined,
  maxZoom: undefined,
  transitionDelay: 50,
});

const emit = defineEmits<{
  'update:visible-count': [count: number];
  'bounds-changed': [bounds: Leaflet.LatLngBounds];
  'transition-start': [];
  'transition-end': [];
}>();

const L = inject(LeafletModuleKey, ref<typeof Leaflet | undefined>(undefined));
const map = inject<Ref<Leaflet.Map | null>>(LeafletMapKey, ref(null));

// Virtualization state
const visibleBounds = ref<Leaflet.LatLngBounds | null>(null);
const visibleFeatureIds = ref<Set<string | number>>(new Set());
const isTransitioning = ref(false);
let updateScheduled = false;

/**
 * Convert meters to degrees at a given latitude
 * 1 degree of latitude ≈ 111,320 meters (constant)
 * 1 degree of longitude ≈ 111,320 * cos(latitude) meters (varies by latitude)
 */
const metersToDegreesLat = (meters: number): number => {
  return meters / 111320;
};

const metersToDegreesLng = (meters: number, latitude: number): number => {
  return meters / (111320 * Math.cos((latitude * Math.PI) / 180));
};

/**
 * Calculate dynamic margin based on zoom level
 * Lower zoom = larger margin (more area to pre-load)
 * Higher zoom = smaller margin (less area needed)
 */
const calculateDynamicMargin = (zoom: number): number => {
  // Base formula: larger margin at low zoom, smaller at high zoom
  // Clamp between zoom 1 and 20
  const clampedZoom = Math.max(1, Math.min(20, zoom));

  // At zoom 5: ~1500m, zoom 10: ~1000m, zoom 15: ~500m, zoom 18: ~200m
  const baseMargin = (20 - clampedZoom) * 100;

  // Apply user-defined ratio
  return baseMargin * props.marginZoomRatio;
};

/**
 * Update visible bounds when map moves or zooms
 */
const updateVisibleBounds = () => {
  if (!map.value || !L.value) return;

  // Debounce updates using requestAnimationFrame
  if (updateScheduled) return;
  updateScheduled = true;

  requestAnimationFrame(() => {
    updateScheduled = false;

    if (!map.value || !L.value) return;

    const bounds = map.value.getBounds();

    // Add margin if enabled
    if (props.enabled) {
      // Use fixed margin if provided, otherwise calculate dynamically based on zoom
      const zoom = map.value.getZoom();
      const marginInMeters = props.marginMeters ?? calculateDynamicMargin(zoom);

      if (marginInMeters > 0) {
        const center = bounds.getCenter();
        const marginLat = metersToDegreesLat(marginInMeters);
        const marginLng = metersToDegreesLng(marginInMeters, center.lat);

        const extendedBounds = L.value.latLngBounds(
          L.value.latLng(bounds.getSouth() - marginLat, bounds.getWest() - marginLng),
          L.value.latLng(bounds.getNorth() + marginLat, bounds.getEast() + marginLng)
        );
        visibleBounds.value = extendedBounds;
      } else {
        visibleBounds.value = bounds;
      }
    } else {
      visibleBounds.value = bounds;
    }

    // Update visible features using quadtree
    updateVisibleFeaturesQuadtree();

    emit('bounds-changed', visibleBounds.value);
  });
};

/**
 * Update visible features using quadtree (O(log n))
 */
const updateVisibleFeaturesQuadtree = () => {
  if (!visibleBounds.value) {
    visibleFeatureIds.value.clear();
    emit('update:visible-count', 0);
    return;
  }

  // Check zoom level constraints
  if (map.value) {
    const currentZoom = map.value.getZoom();
    
    if (props.minZoom !== undefined && currentZoom < props.minZoom) {
      visibleFeatureIds.value.clear();
      emit('update:visible-count', 0);
      return;
    }
    
    if (props.maxZoom !== undefined && currentZoom > props.maxZoom) {
      visibleFeatureIds.value.clear();
      emit('update:visible-count', 0);
      return;
    }
  }

  // If virtualization is disabled, show all items
  if (!props.enabled) {
    const allItems = props.quadtree.retrieve({
      x: -180,
      y: -90,
      width: 360,
      height: 180,
    });
    const allIds = new Set<string | number>();
    for (const item of allItems) {
      allIds.add(item.id);
    }
    visibleFeatureIds.value = allIds;
    emit('update:visible-count', allIds.size);
    return;
  }

  const bounds = visibleBounds.value;

  // Convert Leaflet bounds to Rect for quadtree query
  const queryRect: Rect = {
    x: bounds.getWest(),
    y: bounds.getSouth(),
    width: bounds.getEast() - bounds.getWest(),
    height: bounds.getNorth() - bounds.getSouth(),
  };

  // Query quadtree - O(log n) instead of O(n) !
  const visibleItems = props.quadtree.retrieve(queryRect);

  const newVisibleIds = new Set<string | number>();
  for (const item of visibleItems) {
    newVisibleIds.add(item.id);
  }

  // Add always visible features
  for (const id of props.alwaysVisible) {
    newVisibleIds.add(id);
  }

  visibleFeatureIds.value = newVisibleIds;
  emit('update:visible-count', newVisibleIds.size);
}; // Setup map event listeners for virtualization
onMounted(() => {
  // If map is already available, set it up immediately
  if (map.value) {
    updateVisibleBounds();
    map.value.on('moveend', updateVisibleBounds);
    map.value.on('zoomend', updateVisibleBounds);
  }
});

// Watch for map to become available (it's created asynchronously in LeafletMap)
watch(
  map,
  (newMap) => {
    if (newMap) {
      updateVisibleBounds();
      newMap.on('moveend', updateVisibleBounds);
      newMap.on('zoomend', updateVisibleBounds);
    }
  },
  { immediate: true }
);
onBeforeUnmount(() => {
  if (map.value) {
    map.value.off('moveend', updateVisibleBounds);
    map.value.off('zoomend', updateVisibleBounds);
  }
});

// Watch for props changes
watch(
  () => props.enabled,
  async () => {
    // Emit transition start
    isTransitioning.value = true;
    emit('transition-start');

    // Debounce the update to avoid freezing when toggling
    await new Promise((resolve) => setTimeout(resolve, props.transitionDelay));
    updateVisibleFeaturesQuadtree();

    // Wait a bit more for Vue to process
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Emit transition end
    isTransitioning.value = false;
    emit('transition-end');
  }
);

watch(
  () => props.marginMeters,
  () => {
    updateVisibleBounds();
  }
);

watch(
  () => props.marginZoomRatio,
  () => {
    updateVisibleBounds();
  }
);

watch(
  () => props.minZoom,
  () => {
    updateVisibleBounds();
  }
);

watch(
  () => props.maxZoom,
  () => {
    updateVisibleBounds();
  }
);

watch(
  () => props.quadtree,
  () => {
    // When quadtree changes, update visible features
    // But only if map is already mounted
    if (map.value) {
      nextTick(() => {
        updateVisibleBounds();
      });
    }
  }
);

// Expose methods for external usage if needed
defineExpose({
  visibleBounds,
  visibleFeatureIds,
  isTransitioning,
});
</script>

<template>
  <!-- 
    Scoped slot that provides visibility check function and visible IDs set.
    Use v-if (not v-show) with the isVisible function to ensure components 
    are properly mounted/unmounted based on viewport visibility.
  -->
  <slot
    :is-visible="(id: string | number) => visibleFeatureIds.has(id)"
    :visible-ids="visibleFeatureIds"
    :visible-count="visibleFeatureIds.size"
  />
</template>
