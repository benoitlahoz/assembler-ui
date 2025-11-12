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
   * Margin in degrees to add to visible bounds for pre-loading features
   * Larger margin = more features pre-loaded = less "pop-in" but more DOM elements
   * @default 0.1 (approximately 11km at the equator)
   */
  margin?: number;

  /**
   * Array of feature IDs that should always be rendered, regardless of visibility
   * Useful for selected features or important landmarks
   */
  alwaysVisible?: Array<string | number>;
}

const props = withDefaults(defineProps<LeafletVirtualizeProps>(), {
  enabled: true,
  margin: 0.1,
  alwaysVisible: () => [],
});

const emit = defineEmits<{
  'update:visible-count': [count: number];
  'bounds-changed': [bounds: Leaflet.LatLngBounds];
}>();

const L = inject(LeafletModuleKey, ref<typeof Leaflet | undefined>(undefined));
const map = inject<Ref<Leaflet.Map | null>>(LeafletMapKey, ref(null));

// Virtualization state
const visibleBounds = ref<Leaflet.LatLngBounds | null>(null);
const visibleFeatureIds = ref<Set<string | number>>(new Set());
let updateScheduled = false;

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
    if (props.enabled && props.margin > 0) {
      const margin = props.margin;
      const extendedBounds = L.value.latLngBounds(
        L.value.latLng(bounds.getSouth() - margin, bounds.getWest() - margin),
        L.value.latLng(bounds.getNorth() + margin, bounds.getEast() + margin)
      );
      visibleBounds.value = extendedBounds;
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
  if (!props.enabled || !visibleBounds.value) {
    visibleFeatureIds.value.clear();
    emit('update:visible-count', 0);
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
};

// Setup map event listeners for virtualization
onMounted(() => {
  nextTick(() => {
    if (map.value) {
      // Initial bounds
      updateVisibleBounds();

      // Listen to map move and zoom events
      map.value.on('moveend', updateVisibleBounds);
      map.value.on('zoomend', updateVisibleBounds);
    }
  });
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.off('moveend', updateVisibleBounds);
    map.value.off('zoomend', updateVisibleBounds);
  }
});

// Watch for props changes
watch(
  () => props.enabled,
  () => {
    updateVisibleFeaturesQuadtree();
  }
);

watch(
  () => props.margin,
  () => {
    updateVisibleBounds();
  }
);

watch(
  () => props.quadtree,
  () => {
    updateVisibleFeaturesQuadtree();
  }
);

// Expose methods for external usage if needed
defineExpose({
  visibleBounds,
  visibleFeatureIds,
});
</script>

<template>
  <template v-if="!enabled">
    <slot />
  </template>
  <template v-else>
    <!-- Quadtree mode: use scoped slot for manual control -->
    <slot
      :is-visible="(id: string | number) => visibleFeatureIds.has(id)"
      :visible-ids="visibleFeatureIds"
    />
  </template>
</template>
