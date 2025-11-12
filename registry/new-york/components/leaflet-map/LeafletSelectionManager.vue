<script setup lang="ts">
import { ref, computed, provide, watch, type Ref } from 'vue';
import LeafletBoundingBox from './LeafletBoundingBox.vue';
import type { FeatureShapeType } from './LeafletFeaturesEditor.vue';
import { LeafletSelectionKey } from '.';

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
  registerFeature: (feature: FeatureReference) => void;
  unregisterFeature: (id: string | number) => void;
}

export interface LeafletSelectionManagerProps {
  enabled?: boolean;
  mode?: 'select' | 'directSelect' | null;
}

const props = withDefaults(defineProps<LeafletSelectionManagerProps>(), {
  enabled: false,
  mode: null,
});

const emit = defineEmits<{
  'update:selectedFeature': [feature: SelectedFeature | null];
  'selection-changed': [feature: SelectedFeature | null];
}>();

// Selection state
const selectedFeature = ref<SelectedFeature | null>(null);
const featuresRegistry = ref<Map<string | number, FeatureReference>>(new Map());

// Rotation state
const rotationStartPositions = ref<any>(null);
const rotationCenter = ref<{ lat: number; lng: number } | null>(null);

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
  }
};

const deselectAll = () => {
  selectedFeature.value = null;
  rotationStartPositions.value = null;
  rotationCenter.value = null;
  emit('update:selectedFeature', null);
  emit('selection-changed', null);
};

// Feature registration
const registerFeature = (feature: FeatureReference) => {
  featuresRegistry.value.set(feature.id, feature);
};

const unregisterFeature = (id: string | number) => {
  featuresRegistry.value.delete(id);
  if (selectedFeature.value?.id === id) {
    deselectAll();
  }
};

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
  if (!selectedFeature.value || !props.enabled || props.mode !== 'select') {
    return null;
  }

  const feature = featuresRegistry.value.get(selectedFeature.value.id);
  if (!feature) return null;

  return feature.getBounds();
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
  registerFeature,
  unregisterFeature,
};

provide(LeafletSelectionKey, context);
</script>

<template>
  <!-- Default slot for features -->
  <slot :selection="context" />

  <!-- Bounding box with customization slot -->
  <slot
    name="bounding-box"
    :bounds="boundingBox"
    :visible="boundingBox !== null && mode === 'select'"
    :on-update="handleBoundingBoxUpdate"
    :on-rotate="handleBoundingBoxRotate"
    :on-rotate-end="handleBoundingBoxRotateEnd"
  >
    <!-- Default bounding box (can be overridden) -->
    <LeafletBoundingBox
      :bounds="boundingBox"
      :visible="boundingBox !== null && mode === 'select'"
      @update:bounds="handleBoundingBoxUpdate"
      @rotate="handleBoundingBoxRotate"
      @rotate-end="handleBoundingBoxRotateEnd"
    >
      <!-- Slot for bounding box customization (passed through) -->
      <slot name="bounding-box-styles" />
    </LeafletBoundingBox>
  </slot>
</template>
