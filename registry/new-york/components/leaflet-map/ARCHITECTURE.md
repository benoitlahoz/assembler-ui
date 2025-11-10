# Leaflet Components Architecture

## Separation of Concerns

The Leaflet drawing functionality has been split into two components for better separation of concerns:

### LeafletDrawControl (UI Component)
**Responsibility**: Visual representation only - displays drawing tool buttons

**Props**:
- `position`: Control position on the map ('topright', 'topleft', etc.)
- `editMode`: Whether the control is visible
- `activeMode`: Current active drawing mode (controlled from parent)
- `draw`: Configuration for which buttons to show

**Events**:
- `mode-selected`: Emitted when user clicks a button (string | null)

**Example**:
```vue
<LeafletDrawControl
  :edit-mode="editMode"
  :active-mode="currentMode"
  :draw="{
    marker: true,
    circle: true,
    polyline: true,
    polygon: true,
    rectangle: true,
  }"
  @mode-selected="handleModeSelected"
/>
```

### LeafletFeaturesEditor (Logic Component)
**Responsibility**: Drawing logic - handles all user interactions and shape creation

**Props**:
- `enabled`: Whether drawing is enabled
- `mode`: Current drawing mode ('marker' | 'circle' | 'polyline' | 'polygon' | 'rectangle' | null)
- `shapeOptions`: Default styling for created shapes
- `repeatMode`: Whether to stay in drawing mode after creating a shape

**Events**:
- `draw:created`: Emitted when a shape is completed
- `draw:drawstart`: Emitted when drawing starts
- `draw:drawstop`: Emitted when drawing stops
- `mode-changed`: Emitted when mode changes (for sync)

**Example**:
```vue
<LeafletFeaturesEditor
  :enabled="editMode"
  :mode="currentMode"
  :shape-options="{ color: '#3388ff' }"
  @draw:created="handleShapeCreated"
  @mode-changed="handleModeChanged"
/>
```

## Complete Usage Example

```vue
<script setup lang="ts">
import { ref } from 'vue';
import {
  LeafletMap,
  LeafletTileLayer,
  LeafletDrawControl,
  LeafletFeaturesEditor,
  type DrawEvent,
} from '@/components/leaflet-map';

const editMode = ref(false);
const currentMode = ref<string | null>(null);

const handleModeSelected = (mode: string | null) => {
  currentMode.value = mode;
};

const handleModeChanged = (mode: string | null) => {
  currentMode.value = mode;
};

const handleShapeCreated = (event: DrawEvent) => {
  console.log('Shape created:', event.layerType, event.layer);
  // Add the shape to your map or data structure
};
</script>

<template>
  <div>
    <button @click="editMode = !editMode">
      {{ editMode ? 'Exit Edit Mode' : 'Enter Edit Mode' }}
    </button>

    <LeafletMap :zoom="13" :center="[48.8566, 2.3522]">
      <LeafletTileLayer />
      
      <!-- UI Control -->
      <LeafletDrawControl
        :edit-mode="editMode"
        :active-mode="currentMode"
        :draw="{
          marker: true,
          circle: true,
          polyline: true,
          polygon: true,
          rectangle: true,
        }"
        @mode-selected="handleModeSelected"
      />
      
      <!-- Drawing Logic -->
      <LeafletFeaturesEditor
        :enabled="editMode"
        :mode="currentMode"
        :shape-options="{ color: '#3388ff', fillOpacity: 0.2 }"
        @draw:created="handleShapeCreated"
        @mode-changed="handleModeChanged"
      />
    </LeafletMap>
  </div>
</template>
```

## Benefits of This Architecture

1. **Single Responsibility**: Each component has one clear purpose
2. **Testability**: Logic can be tested independently of UI
3. **Flexibility**: Can use different UI controls with the same logic
4. **Maintainability**: Easier to understand and modify
5. **Reusability**: Logic component can be used without the default UI

## Migration from Old API

If you were using the old combined `LeafletDrawControl`:

**Before**:
```vue
<LeafletDrawControl
  :edit-mode="editMode"
  :draw="{ polygon: true, marker: true }"
  @draw:created="handleCreated"
/>
```

**After**:
```vue
<!-- Control -->
<LeafletDrawControl
  :edit-mode="editMode"
  :active-mode="currentMode"
  :draw="{ polygon: true, marker: true }"
  @mode-selected="currentMode = $event"
/>

<!-- Logic -->
<LeafletFeaturesEditor
  :enabled="editMode"
  :mode="currentMode"
  @draw:created="handleCreated"
  @mode-changed="currentMode = $event"
/>
```

The old combined component is backed up as `LeafletDrawControl.old.vue` if needed.
