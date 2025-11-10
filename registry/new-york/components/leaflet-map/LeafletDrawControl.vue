<script setup lang="ts">
import { ref, inject, watch, onBeforeUnmount, nextTick } from 'vue';
import {
  type ControlOptions,
  type Layer,
  type LatLng,
  type LeafletEvent,
  type FeatureGroup,
} from 'leaflet';
import { LeafletMapKey, LeafletModuleKey } from '.';

export interface DrawHandlerOptions {
  enabled?: boolean;
  shapeOptions?: any;
  repeatMode?: boolean;
}

export interface LeafletDrawControlProps {
  position?: ControlOptions['position'];
  draw?: {
    marker?: DrawHandlerOptions | boolean;
    circle?: DrawHandlerOptions | boolean;
    polyline?: DrawHandlerOptions | boolean;
    polygon?: DrawHandlerOptions | boolean;
    rectangle?: DrawHandlerOptions | boolean;
  };
  edit?: {
    edit?: boolean;
    remove?: boolean;
  };
}

export interface DrawEvent {
  layer: Layer;
  layerType: string;
  type: string;
}

const props = withDefaults(defineProps<LeafletDrawControlProps>(), {
  position: 'topright',
});

const emit = defineEmits<{
  (e: 'draw:created', event: DrawEvent): void;
  (e: 'draw:edited', event: { layers: Layer[] }): void;
  (e: 'draw:deleted', event: { layers: Layer[] }): void;
  (e: 'draw:drawstart', event: { layerType: string }): void;
  (e: 'draw:drawstop', event: { layerType: string }): void;
  (e: 'edit-mode-change', enabled: boolean): void;
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const control = ref<any>(null);
const activeMode = ref<string | null>(null);
const editMode = ref(false);
const handlers = ref<Map<string, any>>(new Map());
const drawnItems = ref<any>(null);

// Créer un contrôle personnalisé inspiré de L.Control
const createDrawControl = () => {
  if (!L.value || !map.value) return;

  const DrawControl = L.value.Control.extend({
    options: {
      position: props.position,
    },

    onAdd: function () {
      const container = L.value!.DomUtil.create('div', 'leaflet-draw leaflet-control leaflet-bar');

      // Empêcher la propagation des événements
      L.value!.DomEvent.disableClickPropagation(container);
      L.value!.DomEvent.disableScrollPropagation(container);

      // Bouton Edit/Draw mode
      createEditButton(container);

      // Créer les boutons pour chaque outil de dessin
      if (props.draw) {
        if (shouldEnableHandler('marker')) {
          createButton(container, 'marker', 'Dessiner un marqueur');
        }
        if (shouldEnableHandler('circle')) {
          createButton(container, 'circle', 'Dessiner un cercle');
        }
        if (shouldEnableHandler('polyline')) {
          createButton(container, 'polyline', 'Dessiner une ligne');
        }
        if (shouldEnableHandler('polygon')) {
          createButton(container, 'polygon', 'Dessiner un polygone');
        }
        if (shouldEnableHandler('rectangle')) {
          createButton(container, 'rectangle', 'Dessiner un rectangle');
        }
      }

      return container;
    },

    onRemove: function () {
      // Nettoyage
      disableAllHandlers();
    },
  });

  return new DrawControl();
};

const shouldEnableHandler = (type: string): boolean => {
  if (!props.draw) return false;
  const config = props.draw[type as keyof typeof props.draw];
  if (typeof config === 'boolean') return config;
  if (typeof config === 'object') return config.enabled !== false;
  return false;
};

const getHandlerOptions = (type: string): DrawHandlerOptions => {
  if (!props.draw) return {};
  const config = props.draw[type as keyof typeof props.draw];
  if (typeof config === 'object') return config;
  return {};
};

const getIconSvg = (type: string, color: string = '#333333'): string => {
  const svgs: Record<string, string> = {
    marker: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}"/></svg>`,
    circle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="2.5" fill="none"/></svg>`,
    polyline: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 17 L8 12 L13 15 L21 7" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="3" cy="17" r="2.5" fill="${color}"/><circle cx="8" cy="12" r="2.5" fill="${color}"/><circle cx="13" cy="15" r="2.5" fill="${color}"/><circle cx="21" cy="7" r="2.5" fill="${color}"/></svg>`,
    polygon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3 L21 8 L18 17 L6 17 L3 8 Z" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="12" cy="3" r="2.5" fill="${color}"/><circle cx="21" cy="8" r="2.5" fill="${color}"/><circle cx="18" cy="17" r="2.5" fill="${color}"/><circle cx="6" cy="17" r="2.5" fill="${color}"/><circle cx="3" cy="8" r="2.5" fill="${color}"/></svg>`,
    rectangle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="16" height="12" stroke="${color}" stroke-width="2.5" rx="1" fill="none"/></svg>`,
    edit: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  return svgs[type] || '';
};

const createButton = (container: HTMLElement, type: string, title: string) => {
  const button = L.value!.DomUtil.create('a', 'leaflet-draw-button', container);
  button.href = '#';
  button.title = title;
  button.innerHTML = getIconSvg(type);
  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', title);

  L.value!.DomEvent.on(button, 'click', (e: Event) => {
    L.value!.DomEvent.preventDefault(e);
    toggleDrawMode(type);
  });

  return button;
};

const createEditButton = (container: HTMLElement) => {
  const button = L.value!.DomUtil.create('a', 'leaflet-draw-button leaflet-edit-button', container);
  button.href = '#';
  button.title = 'Activer le mode Édition';
  button.innerHTML = getIconSvg('edit');
  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', 'Mode Édition');

  const updateButtonState = () => {
    if (editMode.value) {
      button.classList.add('active');
      button.title = 'Mode Édition activé (cliquez pour désactiver)';
      button.innerHTML = getIconSvg('edit', '#ffffff');
    } else {
      button.classList.remove('active');
      button.title = 'Activer le mode Édition';
      button.innerHTML = getIconSvg('edit', '#333333');
    }
  };

  L.value!.DomEvent.on(button, 'click', (e: Event) => {
    L.value!.DomEvent.preventDefault(e);
    toggleEditMode();
    updateButtonState();
  });

  updateButtonState();
  return button;
};

const toggleEditMode = () => {
  editMode.value = !editMode.value;

  // Si on désactive le mode edit, désactiver aussi le mode dessin actif
  if (!editMode.value && activeMode.value) {
    disableHandler(activeMode.value);
    activeMode.value = null;
  }

  emit('edit-mode-change', editMode.value);
};

const toggleDrawMode = (type: string) => {
  // Les outils de dessin ne fonctionnent qu'en mode édition
  if (!editMode.value) {
    // Activer automatiquement le mode édition
    editMode.value = true;
    emit('edit-mode-change', true);
  }

  if (activeMode.value === type) {
    disableHandler(type);
    activeMode.value = null;
  } else {
    if (activeMode.value) {
      disableHandler(activeMode.value);
    }
    enableHandler(type);
    activeMode.value = type;
  }
};

const enableHandler = (type: string) => {
  if (!map.value || !L.value) return;

  const options = getHandlerOptions(type);
  let handler: any;

  emit('draw:drawstart', { layerType: type });

  switch (type) {
    case 'marker':
      handler = createMarkerHandler(options);
      break;
    case 'circle':
      handler = createCircleHandler(options);
      break;
    case 'polyline':
      handler = createPolylineHandler(options);
      break;
    case 'polygon':
      handler = createPolygonHandler(options);
      break;
    case 'rectangle':
      handler = createRectangleHandler(options);
      break;
  }

  if (handler) {
    handlers.value.set(type, handler);
    handler.enable();
  }
};

const disableHandler = (type: string) => {
  const handler = handlers.value.get(type);
  if (handler) {
    handler.disable();
    handlers.value.delete(type);
    emit('draw:drawstop', { layerType: type });
  }
};

const disableAllHandlers = () => {
  handlers.value.forEach((handler, type) => {
    disableHandler(type);
  });
};

// Handlers de dessin
const createMarkerHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value) return;

    const marker = L.value.marker(e.latlng, options.shapeOptions);

    const event: DrawEvent = {
      layer: marker,
      layerType: 'marker',
      type: 'draw:created',
    };

    emit('draw:created', event);

    // Note: Ne pas ajouter à drawnItems ici - laisser le parent gérer via @draw:created
    // if (drawnItems.value) {
    //   drawnItems.value.addLayer(marker);
    // }

    if (!options.repeatMode) {
      disable();
      activeMode.value = null;
    }
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = 'crosshair';
    map.value.on('click', clickHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('click', clickHandler);
  };

  return { enable, disable };
};

const createCircleHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let tempCircle: L.Circle | null = null;
  let centerLatLng: LatLng | null = null;

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    if (!centerLatLng) {
      // Premier clic : définir le centre
      centerLatLng = e.latlng;
      tempCircle = L.value.circle(centerLatLng, {
        radius: 0,
        ...options.shapeOptions,
      });
      tempCircle.addTo(map.value);
    } else {
      // Deuxième clic : finaliser le cercle
      if (tempCircle) {
        tempCircle.remove();

        const radius = centerLatLng.distanceTo(e.latlng);
        const circle = L.value.circle(centerLatLng, {
          radius,
          ...options.shapeOptions,
        });

        const event: DrawEvent = {
          layer: circle,
          layerType: 'circle',
          type: 'draw:created',
        };

        emit('draw:created', event);

        // Note: Ne pas ajouter à drawnItems ici - laisser le parent gérer via @draw:created
        // if (drawnItems.value) {
        //   drawnItems.value.addLayer(circle);
        // }
      }

      centerLatLng = null;
      tempCircle = null;

      if (!options.repeatMode) {
        disable();
        activeMode.value = null;
      }
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !centerLatLng || !tempCircle || !L.value) return;
    const radius = centerLatLng.distanceTo(e.latlng);
    tempCircle.setRadius(radius);
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = 'crosshair';
    map.value.on('click', clickHandler);
    map.value.on('mousemove', mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('click', clickHandler);
    map.value.off('mousemove', mouseMoveHandler);
    if (tempCircle) {
      tempCircle.remove();
      tempCircle = null;
    }
    centerLatLng = null;
  };

  return { enable, disable };
};

const createPolylineHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let latlngs: LatLng[] = [];
  let tempPolyline: L.Polyline | null = null;
  let tempMarkers: L.CircleMarker[] = [];

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    latlngs.push(e.latlng);

    // Ajouter un marqueur temporaire
    const marker = L.value.circleMarker(e.latlng, {
      radius: 4,
      color: '#3388ff',
    });
    marker.addTo(map.value);
    tempMarkers.push(marker);

    if (latlngs.length === 1) {
      tempPolyline = L.value.polyline(latlngs, {
        ...options.shapeOptions,
        dashArray: '5, 5',
      });
      tempPolyline.addTo(map.value);
    } else if (tempPolyline) {
      tempPolyline.setLatLngs(latlngs);
    }
  };

  const dblClickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || latlngs.length < 2) return;

    L.value.DomEvent.stop(e);

    // Retirer le dernier point (double-clic ajoute un point en trop)
    latlngs.pop();

    if (latlngs.length >= 2) {
      const polyline = L.value.polyline(latlngs, options.shapeOptions);

      const event: DrawEvent = {
        layer: polyline,
        layerType: 'polyline',
        type: 'draw:created',
      };

      emit('draw:created', event);

      // Note: Ne pas ajouter à drawnItems ici - laisser le parent gérer via @draw:created
      // if (drawnItems.value) {
      //   drawnItems.value.addLayer(polyline);
      // }
    }

    cleanup();

    if (!options.repeatMode) {
      disable();
      activeMode.value = null;
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !tempPolyline || latlngs.length === 0) return;
    const previewLatLngs = [...latlngs, e.latlng];
    tempPolyline.setLatLngs(previewLatLngs);
  };

  const cleanup = () => {
    if (tempPolyline) {
      tempPolyline.remove();
      tempPolyline = null;
    }
    tempMarkers.forEach((m) => m.remove());
    tempMarkers = [];
    latlngs = [];
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = 'crosshair';
    map.value.on('click', clickHandler);
    map.value.on('dblclick', dblClickHandler);
    map.value.on('mousemove', mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('click', clickHandler);
    map.value.off('dblclick', dblClickHandler);
    map.value.off('mousemove', mouseMoveHandler);
    cleanup();
  };

  return { enable, disable };
};

const createPolygonHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let latlngs: LatLng[] = [];
  let tempPolygon: L.Polygon | null = null;
  let tempMarkers: L.CircleMarker[] = [];

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    latlngs.push(e.latlng);

    const marker = L.value.circleMarker(e.latlng, {
      radius: 4,
      color: '#3388ff',
    });
    marker.addTo(map.value);
    tempMarkers.push(marker);

    if (latlngs.length === 1) {
      tempPolygon = L.value.polygon(latlngs, {
        ...options.shapeOptions,
        dashArray: '5, 5',
      });
      tempPolygon.addTo(map.value);
    } else if (tempPolygon) {
      tempPolygon.setLatLngs(latlngs);
    }
  };

  const dblClickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || latlngs.length < 3) return;

    L.value.DomEvent.stop(e);

    latlngs.pop();

    if (latlngs.length >= 3) {
      const polygon = L.value.polygon(latlngs, options.shapeOptions);

      const event: DrawEvent = {
        layer: polygon,
        layerType: 'polygon',
        type: 'draw:created',
      };

      emit('draw:created', event);

      // Note: Ne pas ajouter à drawnItems ici - laisser le parent gérer via @draw:created
      // if (drawnItems.value) {
      //   drawnItems.value.addLayer(polygon);
      // }
    }

    cleanup();

    if (!options.repeatMode) {
      disable();
      activeMode.value = null;
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !tempPolygon || latlngs.length === 0) return;
    const previewLatLngs = [...latlngs, e.latlng];
    tempPolygon.setLatLngs(previewLatLngs);
  };

  const cleanup = () => {
    if (tempPolygon) {
      tempPolygon.remove();
      tempPolygon = null;
    }
    tempMarkers.forEach((m) => m.remove());
    tempMarkers = [];
    latlngs = [];
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = 'crosshair';
    map.value.on('click', clickHandler);
    map.value.on('dblclick', dblClickHandler);
    map.value.on('mousemove', mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('click', clickHandler);
    map.value.off('dblclick', dblClickHandler);
    map.value.off('mousemove', mouseMoveHandler);
    cleanup();
  };

  return { enable, disable };
};

const createRectangleHandler = (options: DrawHandlerOptions) => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let startLatLng: LatLng | null = null;
  let tempRectangle: L.Rectangle | null = null;

  const clickHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    if (!startLatLng) {
      startLatLng = e.latlng;
    } else {
      if (tempRectangle) {
        tempRectangle.remove();
      }

      const bounds = L.value.latLngBounds(startLatLng, e.latlng);
      const rectangle = L.value.rectangle(bounds, options.shapeOptions);

      const event: DrawEvent = {
        layer: rectangle,
        layerType: 'rectangle',
        type: 'draw:created',
      };

      emit('draw:created', event);

      // Note: Ne pas ajouter à drawnItems ici - laisser le parent gérer via @draw:created
      // if (drawnItems.value) {
      //   drawnItems.value.addLayer(rectangle);
      // }

      startLatLng = null;
      tempRectangle = null;

      if (!options.repeatMode) {
        disable();
        activeMode.value = null;
      }
    }
  };

  const mouseMoveHandler = (e: L.LeafletMouseEvent) => {
    if (!enabled || !startLatLng || !L.value || !map.value) return;

    if (tempRectangle) {
      tempRectangle.remove();
    }

    const bounds = L.value.latLngBounds(startLatLng, e.latlng);
    tempRectangle = L.value.rectangle(bounds, {
      ...options.shapeOptions,
      dashArray: '5, 5',
    });
    tempRectangle.addTo(map.value);
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = 'crosshair';
    map.value.on('click', clickHandler);
    map.value.on('mousemove', mouseMoveHandler);
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('click', clickHandler);
    map.value.off('mousemove', mouseMoveHandler);
    if (tempRectangle) {
      tempRectangle.remove();
      tempRectangle = null;
    }
    startLatLng = null;
  };

  return { enable, disable };
};

// Initialisation du contrôle
watch(
  () => map.value,
  async (newMap) => {
    if (!newMap || !L.value) return;

    // Attendre que le DOM et Leaflet soient complètement prêts
    await nextTick();
    await nextTick();

    try {
      // Créer le FeatureGroup pour stocker les formes dessinées
      if (!drawnItems.value) {
        drawnItems.value = L.value.featureGroup().addTo(newMap);
      }

      // Créer et ajouter le contrôle
      control.value = createDrawControl();
      if (control.value) {
        control.value.addTo(newMap);
      }
    } catch (error) {
      console.error('Error creating draw control:', error);
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  disableAllHandlers();
  if (control.value && map.value) {
    map.value.removeControl(control.value);
  }
  if (drawnItems.value && map.value) {
    map.value.removeLayer(drawnItems.value);
  }
});
</script>

<template>
  <div></div>
</template>

<style>
.leaflet-draw {
  display: flex;
  flex-direction: column;
}

.leaflet-draw-button {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #333;
  background: white;
  border-bottom: 1px solid #ccc;
  transition: all 0.2s ease;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  line-height: 1;
  vertical-align: middle;
}

.leaflet-draw-button svg {
  display: block;
  flex-shrink: 0;
  pointer-events: none;
}

.leaflet-draw-button:hover {
  background: #f4f4f4;
}

.leaflet-draw-button:last-child {
  border-bottom: none;
}

.leaflet-edit-button.active {
  background: #3388ff;
  color: white;
}

.leaflet-edit-button.active svg path,
.leaflet-edit-button.active svg circle,
.leaflet-edit-button.active svg rect {
  stroke: white;
}
</style>
