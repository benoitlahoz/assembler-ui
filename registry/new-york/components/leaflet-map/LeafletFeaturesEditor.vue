<script setup lang="ts">
import { ref, inject, watch, onBeforeUnmount } from 'vue';
import type { Layer, LatLng, LeafletMouseEvent } from 'leaflet';
import { LeafletMapKey, LeafletModuleKey, type FeatureSelectMode } from '.';

export interface FeatureDrawEvent {
  layer: Layer;
  layerType: string;
  type: string;
}

export interface FeatureDrawHandlerOptions {
  enabled?: boolean;
  shapeOptions?: any;
  repeatMode?: boolean;
}

export type FeatureShapeType = 'marker' | 'circle' | 'polyline' | 'polygon' | 'rectangle';
export type FeatureShapeOptions =
  | {
      type: 'marker';
      id: string;
      lat: number;
      lng: number;
    }
  | {
      type: 'circle';
      id: string;
      lat: number;
      lng: number;
      radius: number;
    }
  | {
      type: 'polyline';
      id: string;
      latlngs: Array<{ lat: number; lng: number }>;
    }
  | {
      type: 'polygon';
      id: string;
      latlngs: Array<{ lat: number; lng: number }>;
    }
  | {
      type: 'rectangle';
      id: string;
      bounds: {
        southWest: { lat: number; lng: number };
        northEast: { lat: number; lng: number };
      };
    };

export interface LeafletFeaturesEditorProps {
  enabled?: boolean;
  mode?: FeatureShapeType | FeatureSelectMode | null;
  shapeOptions?: any;
  repeatMode?: boolean;
}

const props = withDefaults(defineProps<LeafletFeaturesEditorProps>(), {
  enabled: false,
  mode: null,
  repeatMode: false,
});

const emit = defineEmits<{
  (e: 'draw:created', event: FeatureDrawEvent): void;
  (e: 'draw:drawstart', event: { layerType: string }): void;
  (e: 'draw:drawstop', event: { layerType: string }): void;
  (e: 'mode-changed', mode: FeatureShapeType | null): void;
  (e: 'edit-mode-changed', mode: FeatureSelectMode | null): void;
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

    const event: FeatureDrawEvent = {
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
  let isDrawing = false;

  const mouseDownHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || isDrawing) return;

    // Start drawing: set center and create temp circle
    isDrawing = true;
    centerLatLng = e.latlng;
    tempCircle = L.value.circle(centerLatLng, {
      ...props.shapeOptions,
      radius: 1,
    });
    tempCircle.addTo(map.value);

    // Disable map dragging to prevent conflicts on mobile
    if (map.value.dragging) {
      map.value.dragging.disable();
    }
  };

  const mouseUpHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || !isDrawing || !centerLatLng) return;

    // Finish drawing: create final circle
    const radius = map.value.distance(centerLatLng, e.latlng);

    // Only create if radius is meaningful (> 1 meter)
    if (radius > 1) {
      const circle = L.value.circle(centerLatLng, {
        ...props.shapeOptions,
        radius,
      });

      const event: FeatureDrawEvent = {
        layer: circle,
        layerType: 'circle',
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
    if (!enabled || !isDrawing || !centerLatLng || !tempCircle || !map.value) return;
    const radius = map.value.distance(centerLatLng, e.latlng);
    tempCircle.setRadius(radius);
  };

  const cleanup = () => {
    if (tempCircle) {
      tempCircle.remove();
      tempCircle = null;
    }
    centerLatLng = null;
    isDrawing = false;

    // Re-enable map dragging when cleaning up
    if (map.value && map.value.dragging) {
      map.value.dragging.enable();
    }
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = 'crosshair';
    map.value.on('mousedown', mouseDownHandler);
    map.value.on('mouseup', mouseUpHandler);
    map.value.on('mousemove', mouseMoveHandler);
    emit('draw:drawstart', { layerType: 'circle' });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('mousedown', mouseDownHandler);
    map.value.off('mouseup', mouseUpHandler);
    map.value.off('mousemove', mouseMoveHandler);
    cleanup();

    // Ensure map dragging is re-enabled
    if (map.value.dragging) {
      map.value.dragging.enable();
    }

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

      const event: FeatureDrawEvent = {
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

    // Disable double-click zoom to prevent zooming when finishing polyline
    if (map.value.doubleClickZoom) {
      map.value.doubleClickZoom.disable();
    }

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

    // Re-enable double-click zoom
    if (map.value.doubleClickZoom) {
      map.value.doubleClickZoom.enable();
    }

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

    const event: FeatureDrawEvent = {
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

      const event: FeatureDrawEvent = {
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

    // Disable double-click zoom to prevent zooming when finishing polygon
    if (map.value.doubleClickZoom) {
      map.value.doubleClickZoom.disable();
    }

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

    // Re-enable double-click zoom
    if (map.value.doubleClickZoom) {
      map.value.doubleClickZoom.enable();
    }

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
  let isDrawing = false;

  const mouseDownHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || isDrawing) return;

    // Start drawing: set start corner and create temp rectangle
    isDrawing = true;
    startLatLng = e.latlng;
    const bounds = L.value.latLngBounds(startLatLng, startLatLng);
    tempRectangle = L.value.rectangle(bounds, {
      ...props.shapeOptions,
      dashArray: '5, 5',
    });
    tempRectangle.addTo(map.value);

    // Disable map dragging to prevent conflicts on mobile
    if (map.value.dragging) {
      map.value.dragging.disable();
    }
  };

  const mouseUpHandler = (e: LeafletMouseEvent) => {
    if (!enabled || !L.value || !map.value || !isDrawing || !startLatLng) return;

    // Finish drawing: create final rectangle
    const bounds = L.value.latLngBounds(startLatLng, e.latlng);

    // Only create if bounds are meaningful (not a single point)
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    if (Math.abs(sw.lat - ne.lat) > 0.00001 || Math.abs(sw.lng - ne.lng) > 0.00001) {
      const rectangle = L.value.rectangle(bounds, props.shapeOptions);

      const event: FeatureDrawEvent = {
        layer: rectangle,
        layerType: 'rectangle',
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
    if (!enabled || !isDrawing || !startLatLng || !tempRectangle || !L.value) return;
    const bounds = L.value.latLngBounds(startLatLng, e.latlng);
    tempRectangle.setBounds(bounds);
  };

  const cleanup = () => {
    if (tempRectangle) {
      tempRectangle.remove();
      tempRectangle = null;
    }
    startLatLng = null;
    isDrawing = false;

    // Re-enable map dragging when cleaning up
    if (map.value && map.value.dragging) {
      map.value.dragging.enable();
    }
  };

  const enable = () => {
    if (!map.value) return;
    enabled = true;
    map.value.getContainer().style.cursor = 'crosshair';
    map.value.on('mousedown', mouseDownHandler);
    map.value.on('mouseup', mouseUpHandler);
    map.value.on('mousemove', mouseMoveHandler);
    emit('draw:drawstart', { layerType: 'rectangle' });
  };

  const disable = () => {
    if (!map.value) return;
    enabled = false;
    map.value.getContainer().style.cursor = '';
    map.value.off('mousedown', mouseDownHandler);
    map.value.off('mouseup', mouseUpHandler);
    map.value.off('mousemove', mouseMoveHandler);
    cleanup();

    // Ensure map dragging is re-enabled
    if (map.value.dragging) {
      map.value.dragging.enable();
    }

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
    if (newMode === 'select' || newMode === 'direct-select') {
      emit('edit-mode-changed', newMode);
      return;
    }

    // If switching away from edit modes
    if (oldMode === 'select' || oldMode === 'direct-select') {
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
  <slot />
</template>
