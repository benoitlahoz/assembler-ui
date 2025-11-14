<script setup lang="ts">
import {
  inject,
  watch,
  ref,
  type Ref,
  nextTick,
  onBeforeUnmount,
  type HTMLAttributes,
  onMounted,
} from 'vue';
import { useCssParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { useLeaflet } from '../../composables/use-leaflet/useLeaflet';
import { LeafletMapKey, LeafletModuleKey, LeafletSelectionKey } from '.';
import type { FeatureReference } from './LeafletFeaturesSelector.vue';
import './leaflet-editing.css';

const {
  calculateRadiusPoint,
  calculateCircleBounds,
  radiusToLngDegrees,
  lngDegreesToRadius,
  LatDegreesMeters,
} = await useLeaflet();

export interface LeafletCircleProps {
  id?: string | number;
  lat?: number | string;
  lng?: number | string;
  radius?: number | string;
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletCircleProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  radius: 100,
  editable: false,
  draggable: false,
  selectable: false,
});

const emit = defineEmits<{
  'update:lat': [lat: number];
  'update:lng': [lng: number];
  'update:radius': [radius: number];
  click: [];
  dragstart: [];
}>();

const { getLeafletShapeColors } = useCssParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const circle = ref<L.Circle | null>(null);
const centerMarker = ref<L.Marker | null>(null);
const radiusMarker = ref<L.Marker | null>(null);
const circleId = ref<string | number>(props.id ?? `circle-${Date.now()}-${Math.random()}`);

// Drag state
const isDragging = ref(false);
let dragStartLatLng: any = null;
let dragStartMousePoint: any = null;

const clearEditMarkers = () => {
  if (centerMarker.value) {
    centerMarker.value.remove();
    centerMarker.value = null;
  }
  if (radiusMarker.value) {
    radiusMarker.value.remove();
    radiusMarker.value = null;
  }
};

const enableDragging = () => {
  if (!circle.value || !L.value || !map.value) return;

  const onMouseDown = (e: any) => {
    if (!map.value || !circle.value) return;
    isDragging.value = true;
    dragStartLatLng = circle.value.getLatLng();
    dragStartMousePoint = e.containerPoint;
    L.value!.DomEvent.stopPropagation(e);
    map.value.dragging.disable();
    map.value.getContainer().style.cursor = 'move';

    // Émettre dragstart
    emit('dragstart');
  };

  circle.value.on('mousedown', onMouseDown);
};

const disableDragging = () => {
  if (!circle.value) return;
  circle.value.off('mousedown');
  isDragging.value = false;
};

const setupMapDragHandlers = () => {
  if (!map.value || !L.value) return;

  const onMouseMove = (e: any) => {
    if (!isDragging.value || !map.value || !circle.value) return;

    const currentPoint = e.containerPoint;
    const dx = currentPoint.x - dragStartMousePoint.x;
    const dy = currentPoint.y - dragStartMousePoint.y;

    const startPoint = map.value.latLngToContainerPoint(dragStartLatLng);
    const newPoint = L.value!.point(startPoint.x + dx, startPoint.y + dy);
    const newLatLng = map.value.containerPointToLatLng(newPoint);

    circle.value.setLatLng(newLatLng);

    // Emit updates in real-time for bounding box
    emit('update:lat', newLatLng.lat);
    emit('update:lng', newLatLng.lng);

    // Notify selection manager to update bounding box
    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(circleId.value);
    }

    // Update radius marker if in edit mode
    if (radiusMarker.value && props.editable) {
      const radius = circle.value.getRadius();
      const [lat, lng] = calculateRadiusPoint(newLatLng, radius);
      radiusMarker.value.setLatLng(L.value!.latLng(lat, lng));
    }
  };

  const onMouseUp = () => {
    if (!isDragging.value || !map.value || !circle.value) return;
    isDragging.value = false;
    const newLatLng = circle.value.getLatLng();
    emit('update:lat', newLatLng.lat);
    emit('update:lng', newLatLng.lng);
    map.value.dragging.enable();
    map.value.getContainer().style.cursor = '';
  };

  map.value.on('mousemove', onMouseMove);
  map.value.on('mouseup', onMouseUp);

  // Also handle mouseup on circle
  if (circle.value) {
    circle.value.on('mouseup', onMouseUp);
  }
};

const enableEditing = () => {
  if (!circle.value || !L.value || !map.value) return;

  clearEditMarkers();

  const center = circle.value.getLatLng();
  const radius = circle.value.getRadius();

  // Only create radius marker in edit mode
  if (props.editable) {
    const [lat, lng] = calculateRadiusPoint(center, radius);
    const radiusLatLng = L.value.latLng(lat, lng);
    radiusMarker.value = L.value
      .marker(radiusLatLng, {
        draggable: true,
        icon: L.value.divIcon({
          className: 'leaflet-editing-icon',
          html: '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
          iconSize: [8, 8],
        }),
      })
      .addTo(map.value);

    const onRadiusMarkerDrag = () => {
      const center = circle.value!.getLatLng();
      const radiusPoint = radiusMarker.value!.getLatLng();
      const newRadius = center.distanceTo(radiusPoint);
      circle.value!.setRadius(newRadius);
    };

    const onRadiusMarkerDragEnd = () => {
      const newRadius = circle.value!.getRadius();
      emit('update:radius', newRadius);
    };

    radiusMarker.value.on('drag', onRadiusMarkerDrag);
    radiusMarker.value.on('dragend', onRadiusMarkerDragEnd);
  }
};

// Selection context integration
const registerWithSelection = () => {
  if (!props.selectable || !selectionContext || !circle.value) return;

  const featureRef: FeatureReference = {
    id: circleId.value,
    type: 'circle',
    getBounds: () => {
      if (!circle.value || !L.value) return null;

      // Return a visually square bounding box for circles
      const center = circle.value.getLatLng();
      const radius = circle.value.getRadius(); // in meters

      const { southWest, northEast } = calculateCircleBounds(center, radius);
      return L.value.latLngBounds(southWest, northEast);
    },
    applyTransform: (bounds: L.LatLngBounds) => {
      if (!circle.value) return;
      const center = bounds.getCenter();

      // Calculate radius from the square bounding box
      // Use the average of width/height to get the radius
      const latDiff = bounds.getNorth() - bounds.getSouth();
      const lngDiff = bounds.getEast() - bounds.getWest();

      // Convert back to meters using composable functions
      const radiusLat = (latDiff / 2) * LatDegreesMeters;
      const radiusLng = lngDegreesToRadius(lngDiff / 2, center.lat);
      const radius = (radiusLat + radiusLng) / 2;

      circle.value.setLatLng(center);
      circle.value.setRadius(radius);

      emit('update:lat', center.lat);
      emit('update:lng', center.lng);
      emit('update:radius', radius);
    },
  };

  selectionContext.registerFeature(featureRef);
};

watch(
  () => [
    map.value,
    props.lat,
    props.lng,
    props.radius,
    props.editable,
    props.draggable,
    props.selectable,
  ],
  (newVal, oldVal) => {
    nextTick(() => {
      if (
        map.value &&
        L.value &&
        !isNaN(Number(props.lat)) &&
        !isNaN(Number(props.lng)) &&
        !isNaN(Number(props.radius))
      ) {
        // Create or update circle
        if (circle.value) {
          // Only update position/radius if they actually changed (not just editable/draggable)
          const latChanged = oldVal && Number(oldVal[1]) !== Number(newVal[1]);
          const lngChanged = oldVal && Number(oldVal[2]) !== Number(newVal[2]);
          const radiusChanged = oldVal && Number(oldVal[3]) !== Number(newVal[3]);

          if (latChanged || lngChanged) {
            circle.value.setLatLng([Number(props.lat), Number(props.lng)]);
          }
          if (radiusChanged) {
            circle.value.setRadius(Number(props.radius));

            // Update radius marker position if it exists
            if (radiusMarker.value && props.editable) {
              const center = circle.value.getLatLng();
              const radius = circle.value.getRadius();
              const [lat, lng] = calculateRadiusPoint(center, radius);
              radiusMarker.value.setLatLng(L.value.latLng(lat, lng));
            }
          }
        } else {
          circle.value = L.value.circle([Number(props.lat), Number(props.lng)], {
            radius: Number(props.radius),
          });
          circle.value.addTo(map.value);

          // Add click event listener
          const onCircleClick = () => {
            if (props.selectable && selectionContext) {
              selectionContext.selectFeature('circle', circleId.value);
            }
            emit('click');
          };

          const onCircleMouseDown = (e: any) => {
            if (props.draggable && props.selectable && selectionContext) {
              selectionContext.selectFeature('circle', circleId.value);
            }
          };

          circle.value.on('click', onCircleClick);
          if (props.selectable && selectionContext) {
            circle.value.on('mousedown', onCircleMouseDown);
          }

          // Setup map-level drag handlers once
          setupMapDragHandlers();

          // Register with selection context if selectable
          if (props.selectable && selectionContext) {
            registerWithSelection();
          }
        }

        // Check if selectable changed and we need to register/unregister
        if (circle.value) {
          const selectableChanged = oldVal && Boolean(oldVal[6]) !== Boolean(newVal[6]);
          if (selectableChanged) {
            // Remove old event listeners
            circle.value.off('click');
            circle.value.off('mousedown');

            // Add new event listeners based on selectable state
            const onCircleClick = () => {
              if (props.selectable && selectionContext) {
                selectionContext.selectFeature('circle', circleId.value);
              }
              emit('click');
            };

            const onCircleMouseDown = (e: any) => {
              if (props.draggable && props.selectable && selectionContext) {
                selectionContext.selectFeature('circle', circleId.value);
              }
            };

            circle.value.on('click', onCircleClick);
            if (props.selectable && selectionContext) {
              circle.value.on('mousedown', onCircleMouseDown);
              registerWithSelection();
            } else if (selectionContext) {
              selectionContext.unregisterFeature(circleId.value);
            }
          }
        }

        // Apply colors
        const colors = getLeafletShapeColors(props.class);
        circle.value.setStyle({
          color: colors.color,
          fillColor: colors.fillColor,
          fillOpacity: colors.fillOpacity,
        });

        // Handle draggable mode
        if (props.draggable) {
          enableDragging();
          clearEditMarkers(); // No edit markers in drag mode
        } else {
          disableDragging();
        }

        // Handle editable mode
        if (props.editable && !props.draggable) {
          enableEditing();
        } else if (!props.draggable) {
          clearEditMarkers();
        }
      } else {
        if (circle.value) {
          circle.value.remove();
          circle.value = null as any;
        }
        clearEditMarkers();
      }
    });
  },
  { immediate: true, flush: 'post' }
);

onBeforeUnmount(() => {
  // Unregister from selection context
  if (props.selectable && selectionContext) {
    selectionContext.unregisterFeature(circleId.value);
  }

  clearEditMarkers();
  if (circle.value) {
    circle.value.remove();
  }
});
</script>

<template><slot /></template>
