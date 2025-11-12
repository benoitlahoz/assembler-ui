<script setup lang="ts">
import { ref, inject, onMounted, onBeforeUnmount, nextTick, watch, computed, type Ref } from 'vue';
import { LeafletMapKey, LeafletModuleKey } from '.';
import type Leaflet from 'leaflet';
import type {
  UseQuadtreeReturn,
  Rect,
} from '~~/registry/new-york/composables/use-quadtree/useQuadtree';

export interface LeafletVirtualizeQuadtreeProps {
  /**
   * Enable/disable virtualization
   */
  enabled?: boolean;

  /**
   * Margin in degrees to add to visible bounds for pre-loading features
   * @default 0.1 (approximately 11km at the equator)
   */
  margin?: number;

  /**
   * Quadtree composable return value for spatial indexing
   */
  quadtree?: UseQuadtreeReturn<any>;

  /**
   * Array of feature IDs that should always be rendered
   */
  alwaysVisible?: Array<string | number>;
}

const props = withDefaults(defineProps<LeafletVirtualizeQuadtreeProps>(), {
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
 * Update visible bounds and query quadtree
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

    // Query quadtree if available
    updateVisibleFeatures();

    emit('bounds-changed', visibleBounds.value);
  });
};

/**
 * Query quadtree for visible features
 */
const updateVisibleFeatures = () => {
  if (!props.enabled || !props.quadtree || !visibleBounds.value) {
    visibleFeatureIds.value.clear();
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

/**
 * Check if a feature should be rendered based on quadtree query
 */
const isFeatureVisible = (featureId: string | number): boolean => {
  if (!props.enabled) return true;
  if (!props.quadtree) return true; // Fallback if no quadtree
  return visibleFeatureIds.value.has(featureId);
};

// Setup map event listeners
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
    updateVisibleFeatures();
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
    updateVisibleFeatures();
  }
);

// Expose for external usage
defineExpose({
  isFeatureVisible,
  visibleBounds,
  visibleFeatureIds,
});
</script>

<template>
  <template v-if="!enabled || !quadtree">
    <!-- Fallback: render all children if disabled or no quadtree -->
    <slot />
  </template>
  <template v-else>
    <!-- Only render children based on quadtree query -->
    <slot :is-visible="isFeatureVisible" :visible-ids="visibleFeatureIds" />
  </template>
</template>
