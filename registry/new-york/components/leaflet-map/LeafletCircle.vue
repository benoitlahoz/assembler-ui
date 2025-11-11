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
import { useTailwindClassParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { LeafletMapKey, LeafletModuleKey } from '.';
import './leaflet-editing.css';

export interface LeafletCircleProps {
  lat?: number | string;
  lng?: number | string;
  radius?: number | string;
  editable?: boolean;
  draggable?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletCircleProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  radius: 100,
  editable: false,
  draggable: false,
});

const emit = defineEmits<{
  'update:lat': [lat: number];
  'update:lng': [lng: number];
  'update:radius': [radius: number];
  click: [];
  dragstart: [];
}>();

const { getLeafletShapeColors } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const circle = ref<L.Circle | null>(null);
const centerMarker = ref<L.Marker | null>(null);
const radiusMarker = ref<L.Marker | null>(null);

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

    // Update radius marker if in edit mode
    if (radiusMarker.value && props.editable) {
      const radius = circle.value.getRadius();
      const radiusLatLng = L.value!.latLng(
        newLatLng.lat,
        newLatLng.lng + radius / 111320 / Math.cos((newLatLng.lat * Math.PI) / 180)
      );
      radiusMarker.value.setLatLng(radiusLatLng);
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
    const radiusLatLng = L.value.latLng(
      center.lat,
      center.lng + radius / 111320 / Math.cos((center.lat * Math.PI) / 180)
    );
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

    radiusMarker.value.on('drag', () => {
      const center = circle.value!.getLatLng();
      const radiusPoint = radiusMarker.value!.getLatLng();
      const newRadius = center.distanceTo(radiusPoint);
      circle.value!.setRadius(newRadius);
    });

    radiusMarker.value.on('dragend', () => {
      const newRadius = circle.value!.getRadius();
      emit('update:radius', newRadius);
    });
  }
};

watch(
  () => [map.value, props.lat, props.lng, props.radius, props.editable, props.draggable],
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
              const radiusLatLng = L.value.latLng(
                center.lat,
                center.lng + radius / 111320 / Math.cos((center.lat * Math.PI) / 180)
              );
              radiusMarker.value.setLatLng(radiusLatLng);
            }
          }
        } else {
          circle.value = L.value.circle([Number(props.lat), Number(props.lng)], {
            radius: Number(props.radius),
          });
          circle.value.addTo(map.value);

          // Add click event listener
          circle.value.on('click', () => {
            emit('click');
          });

          // Setup map-level drag handlers once
          setupMapDragHandlers();
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
  clearEditMarkers();
  if (circle.value) {
    circle.value.remove();
  }
});
</script>

<template><slot /></template>
