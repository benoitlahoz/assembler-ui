<script setup lang="ts">
import { ref, inject, watch, onBeforeUnmount, nextTick } from 'vue';
import type { ControlOptions } from 'leaflet';
import { LeafletMapKey, LeafletModuleKey } from '.';

export interface DrawButton {
  enabled?: boolean;
}

export interface LeafletDrawControlProps {
  position?: ControlOptions['position'];
  editMode?: boolean;
  activeMode?: string | null;
  modes?: {
    select?: DrawButton | boolean;
    directSelect?: DrawButton | boolean;
    marker?: DrawButton | boolean;
    circle?: DrawButton | boolean;
    polyline?: DrawButton | boolean;
    polygon?: DrawButton | boolean;
    rectangle?: DrawButton | boolean;
  };
}

const props = withDefaults(defineProps<LeafletDrawControlProps>(), {
  position: 'topright',
  editMode: false,
  activeMode: null,
});

const emit = defineEmits<{
  (
    e: 'mode-selected',
    mode:
      | 'marker'
      | 'circle'
      | 'polyline'
      | 'polygon'
      | 'rectangle'
      | 'select'
      | 'directSelect'
      | null
  ): void;
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const control = ref<any>(null);

const shouldEnableButton = (type: string): boolean => {
  if (!props.modes) return false;
  const config = props.modes[type as keyof typeof props.modes];
  if (config === undefined) return false;
  if (typeof config === 'boolean') return config;
  return config.enabled !== false;
};

const getIconSvg = (
  type: 'marker' | 'circle' | 'polyline' | 'polygon' | 'rectangle' | 'select' | 'directSelect'
): string => {
  const color = '#333';
  const svgs: Record<string, string> = {
    marker: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}"/></svg>`,
    circle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="2.5" fill="none"/></svg>`,
    polyline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17 L8 12 L13 15 L21 7" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="3" cy="17" r="2.5" fill="${color}"/><circle cx="8" cy="12" r="2.5" fill="${color}"/><circle cx="13" cy="15" r="2.5" fill="${color}"/><circle cx="21" cy="7" r="2.5" fill="${color}"/></svg>`,
    polygon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3 L21 8 L18 17 L6 17 L3 8 Z" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="3" r="2.5" fill="${color}"/><circle cx="21" cy="8" r="2.5" fill="${color}"/><circle cx="18" cy="17" r="2.5" fill="${color}"/><circle cx="6" cy="17" r="2.5" fill="${color}"/><circle cx="3" cy="8" r="2.5" fill="${color}"/></svg>`,
    rectangle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="16" height="12" stroke="${color}" stroke-width="2.5" rx="1" fill="none"/></svg>`,
    select: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3 L3 15 L7 11 L10 16 L12 15 L9 10 L15 10 Z" fill="${color}" stroke="${color}" stroke-width="1" stroke-linejoin="round"/></svg>`,
    directSelect: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3 L3 15 L7 11 L10 16 L12 15 L9 10 L15 10 Z" fill="white" stroke="${color}" stroke-width="2" stroke-linejoin="round"/></svg>`,
  };
  return svgs[type] || '';
};

const createButton = (
  container: HTMLElement,
  type: 'marker' | 'circle' | 'polyline' | 'polygon' | 'rectangle' | 'select' | 'directSelect',
  title: string
) => {
  const button = L.value!.DomUtil.create('div', 'leaflet-draw-button', container);
  button.title = title;
  button.innerHTML = getIconSvg(type);
  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', title);
  button.setAttribute('tabindex', '0');
  button.dataset.toolType = type;

  L.value!.DomEvent.on(button, 'click', (e: Event) => {
    L.value!.DomEvent.preventDefault(e);
    toggleDrawMode(type);
  });

  return button;
};

const toggleDrawMode = (
  type: 'marker' | 'circle' | 'polyline' | 'polygon' | 'rectangle' | 'select' | 'directSelect'
) => {
  if (props.activeMode === type) {
    emit('mode-selected', null);
  } else {
    emit('mode-selected', type);
  }
};

const updateActiveButton = () => {
  if (!control.value) return;

  const container = control.value.getContainer();
  if (!container) return;

  const buttons = container.querySelectorAll('.leaflet-draw-button');
  buttons.forEach((button: Element) => {
    const htmlButton = button as HTMLElement;
    const toolType = htmlButton.dataset.toolType;
    if (toolType === props.activeMode) {
      htmlButton.classList.add('leaflet-draw-toolbar-button-enabled');
    } else {
      htmlButton.classList.remove('leaflet-draw-toolbar-button-enabled');
    }
  });
};

const createDrawControl = () => {
  if (!L.value || !map.value) return;

  const DrawControl = L.value.Control.extend({
    options: {
      position: props.position,
    },

    onAdd: function () {
      const container = L.value!.DomUtil.create('div', 'leaflet-draw leaflet-control leaflet-bar');

      L.value!.DomEvent.disableClickPropagation(container);
      L.value!.DomEvent.disableScrollPropagation(container);

      // All modes in one unified section
      if (props.modes) {
        if (shouldEnableButton('select')) {
          createButton(container, 'select', 'Selection Tool (V)');
        }
        if (shouldEnableButton('directSelect')) {
          createButton(container, 'directSelect', 'Direct Selection Tool (A)');
        }
        if (shouldEnableButton('marker')) {
          createButton(container, 'marker', 'Draw a marker');
        }
        if (shouldEnableButton('circle')) {
          createButton(container, 'circle', 'Draw a circle');
        }
        if (shouldEnableButton('polyline')) {
          createButton(container, 'polyline', 'Draw a polyline');
        }
        if (shouldEnableButton('polygon')) {
          createButton(container, 'polygon', 'Draw a polygon');
        }
        if (shouldEnableButton('rectangle')) {
          createButton(container, 'rectangle', 'Draw a rectangle');
        }
      }

      return container;
    },

    onRemove: function () {
      // Cleanup
    },
  });

  control.value = new DrawControl();
  control.value.addTo(map.value);
};

// Watch for mode changes to update button states
watch(
  () => props.activeMode,
  () => {
    nextTick(() => {
      updateActiveButton();
    });
  }
);

// Watch for map and editMode
watch(
  [map, () => props.editMode],
  ([newMap, newEditMode]) => {
    if (newMap && newEditMode) {
      if (!control.value) {
        nextTick(() => {
          createDrawControl();
        });
      } else if (!control.value._map) {
        control.value.addTo(newMap);
      }
    } else if (control.value && control.value._map) {
      control.value.remove();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (control.value && map.value) {
    try {
      control.value.remove();
    } catch (e) {
      // Control may already be removed
    }
  }
});
</script>

<template>
  <!-- Control is added directly to the map -->
</template>

<style>
.leaflet-draw-button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: white;
  border: none;
  transition: background-color 0.2s;
}

.leaflet-draw-button:hover {
  background-color: #f4f4f4;
}

.leaflet-draw-button:active {
  background-color: #e0e0e0;
}

.leaflet-draw-toolbar-button-enabled {
  background-color: #e8f4f8;
}

.leaflet-draw-toolbar-button-enabled:hover {
  background-color: #d4e9f2;
}

.leaflet-bar {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
  border-radius: 4px;
}

.leaflet-bar .leaflet-draw-button:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.leaflet-bar .leaflet-draw-button:last-child {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.leaflet-bar .leaflet-draw-button:not(:last-child) {
  border-bottom: 1px solid #ccc;
}
</style>
