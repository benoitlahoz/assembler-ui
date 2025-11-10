<script setup lang="ts">
import { ref, inject, type Ref, watch, onBeforeUnmount, nextTick } from 'vue';
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
    featureGroup: FeatureGroup;
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
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const control = ref<any>(null);
const activeMode = ref<string | null>(null);
const handlers = ref<Map<string, any>>(new Map());
const drawnItems = ref<any>(null);

// Créer un contrôle personnalisé inspiré de L.Control
const createDrawControl = () => {
  if (!L.value || !map.value) return;

  const DrawControl = L.value.Control.extend({
    options: {
      position: props.position,
    },

    onAdd: function (map: L.Map) {
      const container = L.value!.DomUtil.create('div', 'leaflet-draw leaflet-control leaflet-bar');

      // Empêcher la propagation des événements
      L.value!.DomEvent.disableClickPropagation(container);
      L.value!.DomEvent.disableScrollPropagation(container);

      // Créer les boutons pour chaque outil de dessin
      if (props.draw) {
        if (shouldEnableHandler('marker')) {
          createButton(container, 'marker', '📍', 'Dessiner un marqueur');
        }
        if (shouldEnableHandler('circle')) {
          createButton(container, 'circle', '⭕', 'Dessiner un cercle');
        }
        if (shouldEnableHandler('polyline')) {
          createButton(container, 'polyline', '〰️', 'Dessiner une ligne');
        }
        if (shouldEnableHandler('polygon')) {
          createButton(container, 'polygon', '▽', 'Dessiner un polygone');
        }
        if (shouldEnableHandler('rectangle')) {
          createButton(container, 'rectangle', '▢', 'Dessiner un rectangle');
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

const createButton = (container: HTMLElement, type: string, icon: string, title: string) => {
  const button = L.value!.DomUtil.create('a', 'leaflet-draw-button', container);
  button.href = '#';
  button.title = title;
  button.innerHTML = icon;
  button.setAttribute('role', 'button');
  button.setAttribute('aria-label', title);

  L.value!.DomEvent.on(button, 'click', (e: Event) => {
    L.value!.DomEvent.preventDefault(e);
    toggleDrawMode(type);
  });

  return button;
};

const toggleDrawMode = (type: string) => {
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

    if (props.edit?.featureGroup) {
      props.edit.featureGroup.addLayer(marker);
    }

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

        if (props.edit?.featureGroup) {
          props.edit.featureGroup.addLayer(circle);
        }
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

      if (props.edit?.featureGroup) {
        props.edit.featureGroup.addLayer(polyline);
      }
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

      if (props.edit?.featureGroup) {
        props.edit.featureGroup.addLayer(polygon);
      }
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

      if (props.edit?.featureGroup) {
        props.edit.featureGroup.addLayer(rectangle);
      }

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
    nextTick(() => {
      try {
        control.value = createDrawControl();
        if (control.value) {
          control.value.addTo(newMap);
        }
      } catch (error) {
        console.error('Error creating draw control:', error);
      }
    });
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  disableAllHandlers();
  if (control.value && map.value) {
    map.value.removeControl(control.value);
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
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #333;
  background: white;
  border-bottom: 1px solid #ccc;
}

.leaflet-draw-button:hover {
  background: #f4f4f4;
}

.leaflet-draw-button:last-child {
  border-bottom: none;
}
</style>
