<script setup lang="ts">
import { ref, inject, watch, onBeforeUnmount } from 'vue';
import type { Layer, LatLng, LeafletMouseEvent } from 'leaflet';
import { LeafletMapKey, LeafletModuleKey } from '.';

export interface DrawHandlerOptions {
  enabled?: boolean;
  shapeOptions?: any;
  repeatMode?: boolean;
}

export interface LeafletFeaturesEditorProps {
  enabled?: boolean;
  mode?:
    | 'marker'
    | 'circle'
    | 'polyline'
    | 'polygon'
    | 'rectangle'
    | 'select'
    | 'directSelect'
    | null;
  shapeOptions?: any;
  repeatMode?: boolean;
}

export interface DrawEvent {
  layer: Layer;
  layerType: string;
  type: string;
}

const props = withDefaults(defineProps<LeafletFeaturesEditorProps>(), {
  enabled: false,
  mode: null,
  repeatMode: false,
});

const emit = defineEmits<{
  (e: 'draw:created', event: DrawEvent): void;
  (e: 'draw:drawstart', event: { layerType: string }): void;
  (e: 'draw:drawstop', event: { layerType: string }): void;
  (
    e: 'mode-changed',
    mode: 'marker' | 'circle' | 'polyline' | 'polygon' | 'rectangle' | null
  ): void;
  (e: 'edit-mode-changed', mode: 'select' | 'directSelect' | null): void;
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject(LeafletMapKey, ref(null));

const activeHandler = ref<any>(null);

// Marker drawing handler
const createMarkerHandler = () => {
  if (!map.value || !L.value) return null;

  let enabled = false;

  const clickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value) return;

    const marker = L.value.marker(e.latlng, props.shapeOptions || {});

    const event: DrawEvent = {
      layer: marker,
      layerType: 'marker',
      type: 'draw:created',
    };

    emit('draw:created', event);

    if (!props.repeatMode) {
      disable();
    }
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = 'crosshair';
    map.value.on('click', clickHandler);
    emit('draw:drawstart', { layerType: 'marker' });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('click', clickHandler);
    emit('draw:drawstop', { layerType: 'marker' });
    emit('mode-changed', null);
  };

  return { enable, disable };
};

// Circle drawing handler
const createCircleHandler = () => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let centerLatLng: LatLng | null = null;
  let tempCircle: L.Circle | null = null;

  const clickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    if (!centerLatLng) {
      centerLatLng = e.latlng;
      tempCircle = L.value.circle(centerLatLng, {
        ...props.shapeOptions,
        radius: 1,
      });
      tempCircle.addTo(map.value);
    } else {
      const radius = map.value.distance(centerLatLng, e.latlng);
      const circle = L.value.circle(centerLatLng, {
        ...props.shapeOptions,
        radius,
      });

      const event: DrawEvent = {
        layer: circle,
        layerType: 'circle',
        type: 'draw:created',
      };

      emit('draw:created', event);

      cleanup();

      if (!props.repeatMode) {
        disable();
      }
    }
  };

  const mouseMoveHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !centerLatLng || !tempCircle || !map.value) return;
    const radius = map.value.distance(centerLatLng, e.latlng);
    tempCircle.setRadius(radius);
  };

  const cleanup = () => {
    if (tempCircle) {
      tempCircle.remove();
      tempCircle = null;
    }
    centerLatLng = null;
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = 'crosshair';
    map.value.on('click', clickHandler);
    map.value.on('mousemove', mouseMoveHandler);
    emit('draw:drawstart', { layerType: 'circle' });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('click', clickHandler);
    map.value.off('mousemove', mouseMoveHandler);
    cleanup();
    emit('draw:drawstop', { layerType: 'circle' });
    emit('mode-changed', null);
  };

  return { enable, disable };
};

// Polyline drawing handler
const createPolylineHandler = () => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let latlngs: LatLng[] = [];
  let tempPolyline: L.Polyline | null = null;
  let tempMarkers: L.CircleMarker[] = [];

  const clickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    latlngs.push(e.latlng);

    const marker = L.value.circleMarker(e.latlng, {
      radius: 4,
      color: '#3388ff',
    });
    marker.addTo(map.value);
    tempMarkers.push(marker);

    if (latlngs.length === 1) {
      tempPolyline = L.value.polyline(latlngs, {
        ...props.shapeOptions,
        dashArray: '5, 5',
      });
      tempPolyline.addTo(map.value);
    } else if (tempPolyline) {
      tempPolyline.setLatLngs(latlngs);
    }
  };

  const dblClickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || latlngs.length < 2) return;

    L.value.DomEvent.stop(e);

    latlngs.pop();

    if (latlngs.length >= 2) {
      const polyline = L.value.polyline(latlngs, props.shapeOptions);

      const event: DrawEvent = {
        layer: polyline,
        layerType: 'polyline',
        type: 'draw:created',
      };

      emit('draw:created', event);
    }

    cleanup();

    if (!props.repeatMode) {
      disable();
    }
  };

  const mouseMoveHandler = (e: LeafletMouseEvent) => {
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
    emit('draw:drawstart', { layerType: 'polyline' });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('click', clickHandler);
    map.value.off('dblclick', dblClickHandler);
    map.value.off('mousemove', mouseMoveHandler);
    cleanup();
    emit('draw:drawstop', { layerType: 'polyline' });
    emit('mode-changed', null);
  };

  return { enable, disable };
};

// Polygon drawing handler
const createPolygonHandler = () => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let latlngs: LatLng[] = [];
  let tempPolygon: L.Polygon | null = null;
  let tempMarkers: L.CircleMarker[] = [];
  let firstPointMarker: L.CircleMarker | null = null;
  let snapCircle: L.CircleMarker | null = null;

  const finishPolygon = () => {
    if (!L.value || !map.value || latlngs.length < 3) return;

    const polygon = L.value.polygon(latlngs, props.shapeOptions);

    const event: DrawEvent = {
      layer: polygon,
      layerType: 'polygon',
      type: 'draw:created',
    };

    emit('draw:created', event);
    cleanup();

    if (!props.repeatMode) {
      disable();
    }
  };

  const clickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    // If we have at least 3 points and click on the first point, close the polygon
    if (latlngs.length >= 3 && firstPointMarker && latlngs[0]) {
      const clickPixel = map.value.latLngToContainerPoint(e.latlng);
      const firstPixel = map.value.latLngToContainerPoint(latlngs[0]);
      const distance = Math.sqrt(
        Math.pow(clickPixel.x - firstPixel.x, 2) + Math.pow(clickPixel.y - firstPixel.y, 2)
      );

      if (distance < 15) {
        finishPolygon();
        return;
      }
    }

    latlngs.push(e.latlng);

    const marker = L.value.circleMarker(e.latlng, {
      radius: 4,
      color: '#3388ff',
    });
    marker.addTo(map.value);
    tempMarkers.push(marker);

    // First marker gets special styling
    if (latlngs.length === 1) {
      firstPointMarker = marker;
      firstPointMarker.setStyle({
        radius: 6,
        color: '#3388ff',
        fillColor: '#ffffff',
        fillOpacity: 1,
        weight: 3,
      });

      tempPolygon = L.value.polygon(latlngs, {
        ...props.shapeOptions,
        dashArray: '5, 5',
      });
      tempPolygon.addTo(map.value);
    } else if (tempPolygon) {
      tempPolygon.setLatLngs(latlngs);
    }
  };

  const dblClickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || latlngs.length < 3) return;

    L.value.DomEvent.stop(e);

    latlngs.pop();

    if (latlngs.length >= 3) {
      const polygon = L.value.polygon(latlngs, props.shapeOptions);

      const event: DrawEvent = {
        layer: polygon,
        layerType: 'polygon',
        type: 'draw:created',
      };

      emit('draw:created', event);
    }

    cleanup();

    if (!props.repeatMode) {
      disable();
    }
  };

  const mouseMoveHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !tempPolygon || latlngs.length === 0 || !map.value || !L.value) return;

    let mousePos = e.latlng;

    // If we have at least 3 points, check proximity to first point
    if (latlngs.length >= 3 && firstPointMarker && latlngs[0]) {
      const mousePixel = map.value.latLngToContainerPoint(e.latlng);
      const firstPixel = map.value.latLngToContainerPoint(latlngs[0]);
      const distance = Math.sqrt(
        Math.pow(mousePixel.x - firstPixel.x, 2) + Math.pow(mousePixel.y - firstPixel.y, 2)
      );

      const snapThreshold = 30;
      const isNearFirstPoint = distance < snapThreshold;

      if (isNearFirstPoint) {
        // Snap to first point
        mousePos = latlngs[0];

        // Show/create red circle
        if (!snapCircle) {
          snapCircle = L.value.circleMarker(latlngs[0], {
            radius: 20,
            color: '#ff0000',
            fillColor: '#ff0000',
            fillOpacity: 0.3,
            weight: 3,
            opacity: 0.8,
            interactive: false,
          });
          snapCircle.addTo(map.value);
        } else {
          snapCircle.setStyle({ opacity: 0.8, fillOpacity: 0.3 });
        }

        // Enlarge first point
        firstPointMarker.setStyle({ radius: 9 });

        // Change cursor to pointer
        map.value.getContainer().style.cursor = 'pointer';
      } else {
        // Hide red circle
        if (snapCircle) {
          snapCircle.setStyle({ opacity: 0, fillOpacity: 0 });
        }

        // Restore first point size
        if (firstPointMarker) {
          firstPointMarker.setStyle({ radius: 6 });
        }

        // Restore crosshair cursor
        map.value.getContainer().style.cursor = 'crosshair';
      }
    }

    const previewLatLngs = [...latlngs, mousePos];
    tempPolygon.setLatLngs(previewLatLngs);
  };

  const cleanup = () => {
    if (tempPolygon) {
      tempPolygon.remove();
      tempPolygon = null;
    }
    tempMarkers.forEach((m) => m.remove());
    tempMarkers = [];
    if (snapCircle) {
      snapCircle.remove();
      snapCircle = null;
    }
    firstPointMarker = null;
    latlngs = [];
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = 'crosshair';
    map.value.on('click', clickHandler);
    map.value.on('dblclick', dblClickHandler);
    map.value.on('mousemove', mouseMoveHandler);
    emit('draw:drawstart', { layerType: 'polygon' });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('click', clickHandler);
    map.value.off('dblclick', dblClickHandler);
    map.value.off('mousemove', mouseMoveHandler);
    cleanup();
    emit('draw:drawstop', { layerType: 'polygon' });
    emit('mode-changed', null);
  };

  return { enable, disable };
};

// Rectangle drawing handler
const createRectangleHandler = () => {
  if (!map.value || !L.value) return null;

  let enabled = false;
  let startLatLng: LatLng | null = null;
  let tempRectangle: L.Rectangle | null = null;

  const clickHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value) return;

    if (!startLatLng) {
      startLatLng = e.latlng;
      const bounds = L.value.latLngBounds(startLatLng, startLatLng);
      tempRectangle = L.value.rectangle(bounds, {
        ...props.shapeOptions,
        dashArray: '5, 5',
      });
      tempRectangle.addTo(map.value);
    } else {
      const bounds = L.value.latLngBounds(startLatLng, e.latlng);
      const rectangle = L.value.rectangle(bounds, props.shapeOptions);

      const event: DrawEvent = {
        layer: rectangle,
        layerType: 'rectangle',
        type: 'draw:created',
      };

      emit('draw:created', event);

      cleanup();

      if (!props.repeatMode) {
        disable();
      }
    }
  };

  const mouseMoveHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !startLatLng || !tempRectangle || !L.value) return;
    const bounds = L.value.latLngBounds(startLatLng, e.latlng);
    tempRectangle.setBounds(bounds);
  };

  const cleanup = () => {
    if (tempRectangle) {
      tempRectangle.remove();
      tempRectangle = null;
    }
    startLatLng = null;
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = 'crosshair';
    map.value.on('click', clickHandler);
    map.value.on('mousemove', mouseMoveHandler);
    emit('draw:drawstart', { layerType: 'rectangle' });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('click', clickHandler);
    map.value.off('mousemove', mouseMoveHandler);
    cleanup();
    emit('draw:drawstop', { layerType: 'rectangle' });
    emit('mode-changed', null);
  };

  return { enable, disable };
};

// Watch mode changes
watch(
  () => props.mode,
  (newMode, oldMode) => {
    if (!props.enabled) return;

    // Disable previous handler
    if (activeHandler.value) {
      activeHandler.value.disable();
      activeHandler.value = null;
    }

    // Handle edit modes (select and directSelect)
    if (newMode === 'select' || newMode === 'directSelect') {
      emit('edit-mode-changed', newMode);
      return;
    }

    // If switching away from edit modes
    if (oldMode === 'select' || oldMode === 'directSelect') {
      emit('edit-mode-changed', null);
    }

    // Enable new drawing handler
    if (newMode) {
      let handler = null;
      switch (newMode) {
        case 'marker':
          handler = createMarkerHandler();
          break;
        case 'circle':
          handler = createCircleHandler();
          break;
        case 'polyline':
          handler = createPolylineHandler();
          break;
        case 'polygon':
          handler = createPolygonHandler();
          break;
        case 'rectangle':
          handler = createRectangleHandler();
          break;
      }

      if (handler) {
        activeHandler.value = handler;
        handler.enable();
      }
    }
  },
  { immediate: true }
);

// Watch enabled state
watch(
  () => props.enabled,
  (enabled) => {
    if (!enabled && activeHandler.value) {
      activeHandler.value.disable();
      activeHandler.value = null;
      emit('mode-changed', null);
    } else if (enabled && props.mode && !activeHandler.value) {
      // Re-enable current mode
      const modeValue = props.mode;
      let handler = null;
      switch (modeValue) {
        case 'marker':
          handler = createMarkerHandler();
          break;
        case 'circle':
          handler = createCircleHandler();
          break;
        case 'polyline':
          handler = createPolylineHandler();
          break;
        case 'polygon':
          handler = createPolygonHandler();
          break;
        case 'rectangle':
          handler = createRectangleHandler();
          break;
      }

      if (handler) {
        activeHandler.value = handler;
        handler.enable();
      }
    }
  }
);

onBeforeUnmount(() => {
  if (activeHandler.value) {
    activeHandler.value.disable();
  }
});
</script>

<template>
  <!-- This component has no visual representation - it only handles drawing logic -->
</template>
