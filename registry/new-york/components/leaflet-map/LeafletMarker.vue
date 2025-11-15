<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick } from 'vue';
import { LeafletMapKey, LeafletModuleKey, LeafletSelectionKey, type FeatureReference } from '.';
import { useCheckIn } from '~~/registry/new-york/composables/use-check-in/useCheckIn';

export interface LeafletMarkerProps {
  id?: string | number;
  lat?: number | string;
  lng?: number | string;
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
}

const props = withDefaults(defineProps<LeafletMarkerProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  editable: false,
  draggable: false,
  selectable: false,
});

const emit = defineEmits<{
  'update:lat': [lat: number];
  'update:lng': [lng: number];
  click: [];
  dragstart: [];
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const marker = ref<L.Marker | null>(null);
const markerId = ref<string | number>(props.id ?? `marker-${Date.now()}-${Math.random()}`);

// Use checkIn for automatic registration/cleanup
const { checkIn } = useCheckIn<FeatureReference>();

// Check-in with the selection desk when selectable (only if context exists)
const { desk: featureDesk } = selectionContext
  ? checkIn(selectionContext, {
      autoCheckIn: props.selectable,
      id: markerId.value,
      data: () => ({
        id: markerId.value,
        type: 'marker' as const,
        getBounds: () => {
          if (!marker.value || !L.value) return null;
          const latlng = marker.value.getLatLng();
          const offset = 0.0001; // Small offset for marker bounds
          return L.value.latLngBounds(
            [latlng.lat - offset, latlng.lng - offset],
            [latlng.lat + offset, latlng.lng + offset]
          );
        },
        applyTransform: (bounds: L.LatLngBounds) => {
          if (!marker.value) return;
          const center = bounds.getCenter();
          marker.value.setLatLng(center);
          emit('update:lat', center.lat);
          emit('update:lng', center.lng);
        },
      }),
      watchData: true,
    })
  : { desk: ref(null) };

let Icon: any;
const iconOptions = {
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
};

const setupMarker = () => {
  if (map.value && L.value && !marker.value) {
    if (!Icon) {
      Icon = L.value.Icon.extend({
        options: iconOptions, //
      });
    }

    const isDraggable = props.editable || props.draggable;
    marker.value = L.value.marker([Number(props.lat), Number(props.lng)], {
      draggable: isDraggable,
      icon: new Icon(),
    });

    const onDragStart = () => {
      if (props.selectable && selectionContext) {
        selectionContext.selectFeature('marker', markerId.value);
      }
      emit('dragstart');
    };

    if (isDraggable) {
      marker.value.on('drag', onDrag);
      marker.value.on('dragstart', onDragStart);
      marker.value.on('dragend', onDragEnd);
    }

    const onMarkerClick = () => {
      if (props.selectable && selectionContext) {
        selectionContext.selectFeature('marker', markerId.value);
      }
      emit('click');
    };

    // Handle selection
    if (props.selectable && selectionContext) {
      marker.value.on('click', onMarkerClick);
      if (!isDraggable) {
        marker.value.on('dragstart', onDragStart);
      }
    } else {
      marker.value.on('click', onMarkerClick);
    }

    marker.value.addTo(map.value);

    // Note: Registration is now handled automatically by checkIn
    // No need to manually call registerWithSelection()
  }
};

const updateMarker = (latChanged = false, lngChanged = false) => {
  if (marker.value) {
    const isDraggable = props.editable || props.draggable;

    // Only update position if lat or lng actually changed
    if (latChanged || lngChanged) {
      marker.value.setLatLng([Number(props.lat), Number(props.lng)]);
    }

    marker.value.options.draggable = isDraggable;
    if (isDraggable) {
      marker.value.dragging?.enable();
    } else {
      marker.value.dragging?.disable();
    }
  }
};

const onDrag = () => {
  if (marker.value) {
    const latlng = marker.value.getLatLng();
    emit('update:lat', latlng.lat);
    emit('update:lng', latlng.lng);

    // Notify selection manager to update bounding box
    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(markerId.value);
    }
  }
};

const onDragEnd = () => {
  if (marker.value) {
    const latlng = marker.value.getLatLng();
    emit('update:lat', latlng.lat);
    emit('update:lng', latlng.lng);
  }
};

watch(
  () => [props.lat, props.lng, props.editable, props.draggable, props.selectable],
  ([newLat, newLng], oldVal) => {
    nextTick(() => {
      if (!L.value) return;

      if (map.value && !isNaN(Number(newLat)) && !isNaN(Number(newLng))) {
        if (marker.value) {
          // Check if lat or lng actually changed
          const latChanged = oldVal && Number(oldVal[0]) !== Number(newLat);
          const lngChanged = oldVal && Number(oldVal[1]) !== Number(newLng);
          updateMarker(latChanged, lngChanged);

          // Check if selectable changed
          const selectableChanged = oldVal && Boolean(oldVal[4]) !== Boolean(props.selectable);
          if (selectableChanged) {
            // Remove old event listeners
            marker.value.off('click');
            marker.value.off('dragstart');

            const onMarkerClick = () => {
              if (props.selectable && selectionContext) {
                selectionContext.selectFeature('marker', markerId.value);
              }
              emit('click');
            };

            const onDragStart = () => {
              if (props.selectable && selectionContext) {
                selectionContext.selectFeature('marker', markerId.value);
              }
              emit('dragstart');
            };

            // Add new event listeners based on selectable state
            if (props.selectable && selectionContext) {
              marker.value.on('click', onMarkerClick);
              marker.value.on('dragstart', onDragStart);
              // Note: checkIn handles registration automatically based on autoCheckIn
            } else {
              marker.value.on('click', onMarkerClick);
              // Note: checkIn handles unregistration automatically
            }
          }
        } else {
          setupMarker();
        }
      } else {
        if (marker.value) {
          marker.value.remove();
          marker.value = null as any;
        }
      }
    });
  },
  { immediate: true }
);

watch(
  () => map.value,
  () => {
    setupMarker();
  },
  { immediate: true }
);

// Note: onBeforeUnmount removed - checkIn handles cleanup automatically
</script>

<template><slot /></template>
