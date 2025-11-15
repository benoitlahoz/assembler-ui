<script setup lang="ts">
import { ref, computed, provide, watch, nextTick, type Ref, type InjectionKey } from 'vue';
import LeafletBoundingBox from './LeafletBoundingBox.vue';
import type { FeatureShapeType } from './LeafletFeaturesEditor.vue';
import { LeafletSelectionKey } from '.';
import {
  useCheckIn,
  type CheckInDesk,
} from '~~/registry/new-york/composables/use-check-in/useCheckIn';

export type FeatureSelectMode = 'select' | 'direct-select';

export interface SelectedFeature {
  type: FeatureShapeType;
  id: string | number;
}

export interface FeatureReference {
  id: string | number;
  type: FeatureShapeType;
  getBounds: () => L.LatLngBounds | null;
  getInitialData?: () => any; // Pour sauvegarder les données avant rotation
  applyTransform: (bounds: L.LatLngBounds) => void;
  applyRotation?: (angle: number, center: { lat: number; lng: number }, initialData: any) => void;
}

export interface LeafletSelectionContext {
  selectedFeature: Ref<SelectedFeature | null>;
  featuresRegistry: Ref<Map<string | number, FeatureReference>>;
  selectFeature: (type: FeatureShapeType, id: string | number) => void;
  deselectAll: () => void;
  notifyFeatureUpdate: (id: string | number) => void;
  deskSymbol: InjectionKey<CheckInDesk<FeatureReference>>; // For useCheckIn integration
}

export interface LeafletFeaturesSelectorProps {
  enabled?: boolean;
  mode?: 'select' | 'direct-select' | null;
}

const props = withDefaults(defineProps<LeafletFeaturesSelectorProps>(), {
  enabled: false,
  mode: null,
});

const emit = defineEmits<{
  'update:selectedFeature': [feature: SelectedFeature | null];
  'selection-changed': [feature: SelectedFeature | null];
}>();

// Selection state
const selectedFeature = ref<SelectedFeature | null>(null);
const boundingBoxTrigger = ref(0); // Trigger to force bounding box recalculation

// Rotation state
const rotationStartPositions = ref<any>(null);
const rotationCenter = ref<{ lat: number; lng: number } | null>(null);

// Initialize useCheckIn for feature management
const { openDesk } = useCheckIn<FeatureReference>();

// Selection methods
const selectFeature = (type: FeatureShapeType, id: string | number) => {
  if (props.mode !== 'select') {
    deselectAll();
    return;
  }

  // Reset rotation state when changing selection
  rotationStartPositions.value = null;
  rotationCenter.value = null;

  const isSameFeature = selectedFeature.value?.type === type && selectedFeature.value?.id === id;

  if (!isSameFeature) {
    selectedFeature.value = { type, id };
    emit('update:selectedFeature', selectedFeature.value);
    emit('selection-changed', selectedFeature.value);

    // Force bounding box recalculation in next tick
    nextTick(() => {
      boundingBoxTrigger.value++;
    });
  }
};

const deselectAll = () => {
  selectedFeature.value = null;
  rotationStartPositions.value = null;
  rotationCenter.value = null;
  emit('update:selectedFeature', null);
  emit('selection-changed', null);
};

// Notify that a feature's properties have changed (for bounding box updates)
const notifyFeatureUpdate = (id: string | number) => {
  // Only trigger update if the feature being updated is currently selected
  if (selectedFeature.value?.id === id) {
    boundingBoxTrigger.value++;
  }
};

// Open desk for feature registration
const { desk, deskSymbol } = openDesk({
  onCheckIn: (id, featureRef) => {
    // Feature automatically added to desk registry
    console.log('[LeafletFeaturesSelector] Feature registered:', id, featureRef.type);
  },
  onCheckOut: (id) => {
    console.log('[LeafletFeaturesSelector] Feature unregistered:', id);
    // Auto-deselect if the removed feature was selected
    if (selectedFeature.value?.id === id) {
      deselectAll();
    }
  },
});

// Legacy API compatibility - featuresRegistry now uses the desk
const featuresRegistry = computed(() =>
  // Use desk.registry.value to establish reactive dependency
  Array.from(desk.registry.value.values()).reduce((map, item) => {
    map.set(item.id, item.data);
    return map;
  }, new Map<string | number, FeatureReference>())
);

// Watch mode changes
watch(
  () => props.mode,
  (mode) => {
    if (mode !== 'select') {
      deselectAll();
    }
  }
);

watch(
  () => props.enabled,
  (enabled) => {
    if (!enabled) {
      deselectAll();
    }
  }
);

// Compute bounding box for selected feature
const boundingBox = computed(() => {
  // Use trigger to force recalculation
  boundingBoxTrigger.value; // eslint-disable-line no-unused-expressions

  if (!selectedFeature.value || !props.enabled || props.mode !== 'select') {
    return null;
  }

  // Markers don't need bounding box (they are just draggable)
  if (selectedFeature.value.type === 'marker') {
    return null;
  }

  const feature = featuresRegistry.value.get(selectedFeature.value.id);
  if (!feature) return null;

  return feature.getBounds();
});

// Check if selected feature supports rotation
const showRotateHandle = computed(() => {
  if (!selectedFeature.value) return false;

  // Only polylines and polygons support rotation
  // Circles, rectangles, and markers don't support rotation
  return selectedFeature.value.type === 'polyline' || selectedFeature.value.type === 'polygon';
});

// Check if bounding box should be constrained to square
const constrainSquare = computed(() => {
  if (!selectedFeature.value) return false;

  // Circles should have square bounding boxes
  return selectedFeature.value.type === 'circle';
});

// Save rotation start positions
const saveRotationStartPositions = () => {
  if (!selectedFeature.value) return;

  const bounds = boundingBox.value;
  if (bounds) {
    const center = bounds.getCenter();
    rotationCenter.value = { lat: center.lat, lng: center.lng };
  }

  const feature = featuresRegistry.value.get(selectedFeature.value.id);
  if (feature && feature.getInitialData) {
    // Store the initial data (latlngs, bounds, etc.)
    rotationStartPositions.value = feature.getInitialData();
  }
};

// Handle bounding box transform
const handleBoundingBoxUpdate = (newBounds: L.LatLngBounds) => {
  if (!selectedFeature.value) return;

  const feature = featuresRegistry.value.get(selectedFeature.value.id);
  if (feature) {
    feature.applyTransform(newBounds);
  }
};

// Handle rotation
const handleBoundingBoxRotate = (angle: number) => {
  if (!selectedFeature.value) return;

  // Save start positions on first call
  if (rotationStartPositions.value === null) {
    saveRotationStartPositions();
  }

  if (!rotationCenter.value || !rotationStartPositions.value) return;

  const feature = featuresRegistry.value.get(selectedFeature.value.id);
  if (feature && feature.applyRotation) {
    feature.applyRotation(angle, rotationCenter.value, rotationStartPositions.value);
  }
};

// Handle rotation end
const handleBoundingBoxRotateEnd = () => {
  rotationStartPositions.value = null;
  rotationCenter.value = null;
};

// Provide selection context to child components
const context: LeafletSelectionContext = {
  selectedFeature,
  featuresRegistry,
  selectFeature,
  deselectAll,
  notifyFeatureUpdate,
  deskSymbol,
};

provide(LeafletSelectionKey, context as any);
</script>

<template>
  <!-- Default slot for features -->
  <slot :selection="context" />

  <!-- Bounding box with customization slot -->
  <slot
    name="bounding-box"
    :bounds="boundingBox"
    :visible="boundingBox !== null && mode === 'select'"
    :show-rotate-handle="showRotateHandle"
    :constrain-square="constrainSquare"
    :on-update="handleBoundingBoxUpdate"
    :on-rotate="handleBoundingBoxRotate"
    :on-rotate-end="handleBoundingBoxRotateEnd"
  >
    <!-- Default bounding box (can be overridden) -->
    <LeafletBoundingBox
      :bounds="boundingBox"
      :visible="boundingBox !== null && mode === 'select'"
      :show-rotate-handle="showRotateHandle"
      :constrain-square="constrainSquare"
      @update:bounds="handleBoundingBoxUpdate"
      @rotate="handleBoundingBoxRotate"
      @rotate-end="handleBoundingBoxRotateEnd"
    >
      <!-- Slot for bounding box customization (passed through) -->
      <slot name="bounding-box-styles" />
    </LeafletBoundingBox>
  </slot>
</template>
