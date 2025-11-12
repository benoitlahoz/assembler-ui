<script setup lang="ts">
import {
  ref,
  inject,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
  watch,
  useSlots,
  type Ref,
} from 'vue';
import { LeafletMapKey, LeafletModuleKey } from '.';
import type Leaflet from 'leaflet';

export interface LeafletVirtualizeProps {
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

// Get slots
const slots = useSlots();

// Virtualization state
const visibleBounds = ref<Leaflet.LatLngBounds | null>(null);
const visibleFeatureIds = ref<Set<string | number>>(new Set());
let updateScheduled = false;
const visibleCount = ref(0);

// Cache of feature positions for faster lookups
const featurePositionsCache = new Map<
  string | number,
  { lat: number; lng: number } | { latlngs: Array<[number, number]> }
>();

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

    // Update visible count
    updateVisibleCount();

    emit('bounds-changed', visibleBounds.value);
  });
};

/**
 * Update the count of visible features
 */
const updateVisibleCount = () => {
  if (!props.enabled) {
    const children = slots.default?.() || [];
    visibleCount.value = children.length;
    visibleFeatureIds.value.clear();
    return;
  }

  const children = slots.default?.() || [];
  const newVisibleIds = new Set<string | number>();
  let count = 0;

  for (const child of children) {
    const id = child.props?.id;

    // Cache feature position if not already cached
    if (id !== undefined && !featurePositionsCache.has(id)) {
      const position = getChildPosition(child);
      if (
        (position.lat !== undefined && position.lng !== undefined) ||
        position.latlngs !== undefined
      ) {
        featurePositionsCache.set(id, position as any);
      }
    }

    // Check if visible using cached position
    const isVisible = shouldRenderChild(child);
    if (isVisible) {
      count++;
      if (id !== undefined) {
        newVisibleIds.add(id);
      }
    }
  }

  visibleFeatureIds.value = newVisibleIds;
  visibleCount.value = count;
  emit('update:visible-count', count);
};

/**
 * Check if a feature is visible based on its position
 */
const isFeatureVisible = (lat: number, lng: number, featureId?: string | number): boolean => {
  // If virtualization is disabled, always return true
  if (!props.enabled) return true;

  // If no visible bounds yet, show everything (initial render)
  if (!visibleBounds.value) return true;

  // Always render features in the alwaysVisible list
  if (featureId !== undefined && props.alwaysVisible.includes(featureId)) return true;

  // Check if point is within visible bounds
  if (!L.value) return true;

  const point = L.value.latLng(lat, lng);
  return visibleBounds.value.contains(point);
};

/**
 * Check if a polygon is visible based on its latlngs
 */
const isPolygonVisible = (
  latlngs: Array<[number, number]>,
  featureId?: string | number
): boolean => {
  // If virtualization is disabled, always return true
  if (!props.enabled) return true;

  // If no visible bounds yet, show everything (initial render)
  if (!visibleBounds.value) return true;

  // Always render features in the alwaysVisible list
  if (featureId !== undefined && props.alwaysVisible.includes(featureId)) return true;

  if (!L.value || !latlngs || latlngs.length === 0) return true;

  // Check if any point of the polygon is within visible bounds
  for (const [lat, lng] of latlngs) {
    const point = L.value.latLng(lat, lng);
    if (visibleBounds.value.contains(point)) {
      return true;
    }
  }

  return false;
};

/**
 * Extract position from child VNode props
 */
const getChildPosition = (
  child: any
): { lat?: number; lng?: number; latlngs?: Array<[number, number]> } => {
  if (!child.props) return {};

  // Handle markers and circles (lat/lng)
  if (child.props.lat !== undefined && child.props.lng !== undefined) {
    return {
      lat: typeof child.props.lat === 'string' ? parseFloat(child.props.lat) : child.props.lat,
      lng: typeof child.props.lng === 'string' ? parseFloat(child.props.lng) : child.props.lng,
    };
  }

  // Handle polygons (latlngs)
  if (child.props.latlngs !== undefined) {
    return { latlngs: child.props.latlngs };
  }

  return {};
};

/**
 * Check if a child VNode should be visible (optimized version with cache)
 */
const shouldRenderChild = (child: any): boolean => {
  if (!props.enabled) return true;

  const id = child.props?.id;

  // Fast path: check cached visibility by ID
  if (id !== undefined && visibleFeatureIds.value.size > 0) {
    return visibleFeatureIds.value.has(id);
  }

  // Slow path: calculate visibility
  const position =
    id !== undefined && featurePositionsCache.has(id)
      ? featurePositionsCache.get(id)!
      : getChildPosition(child);

  // If it has lat/lng, check point visibility
  if (
    'lat' in position &&
    position.lat !== undefined &&
    'lng' in position &&
    position.lng !== undefined
  ) {
    return isFeatureVisible(position.lat, position.lng, id);
  }

  // If it has latlngs, check polygon visibility
  if ('latlngs' in position && position.latlngs !== undefined) {
    return isPolygonVisible(position.latlngs, id);
  }

  // Unknown feature type, render it
  return true;
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
    updateVisibleCount();
  }
);

watch(
  () => props.margin,
  () => {
    updateVisibleBounds();
  }
);

// Expose methods for external usage if needed
defineExpose({
  isFeatureVisible,
  visibleBounds,
});
</script>

<template>
  <template v-if="!enabled">
    <slot />
  </template>
  <template v-else>
    <!-- Use feature ID as key for stable identity -->
    <template v-for="child in $slots.default?.()" :key="child.props?.id ?? child.key">
      <component :is="child" v-if="shouldRenderChild(child)" />
    </template>
  </template>
</template>
