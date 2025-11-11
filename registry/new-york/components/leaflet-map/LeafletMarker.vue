<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick, onBeforeUnmount, onMounted } from 'vue';
import { LeafletMapKey, LeafletModuleKey } from '.';

export interface LeafletMarkerProps {
  lat?: number | string;
  lng?: number | string;
  editable?: boolean;
  draggable?: boolean;
}

const props = withDefaults(defineProps<LeafletMarkerProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  editable: false,
  draggable: false,
});

const emit = defineEmits<{
  'update:lat': [lat: number];
  'update:lng': [lng: number];
  click: [];
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const marker = ref<L.Marker | null>(null);

let Icon: any;

watch(
  () => [props.lat, props.lng, props.editable, props.draggable],
  ([newLat, newLng]) => {
    nextTick(() => {
      if (!L.value) return;

      if (!Icon) {
        Icon = L.value.Icon.extend({
          options: {
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          },
        });
      }

      if (map.value && !isNaN(Number(newLat)) && !isNaN(Number(newLng))) {
        const isDraggable = props.editable || props.draggable;

        if (marker.value) {
          marker.value.setLatLng([Number(newLat), Number(newLng)]);
          marker.value.options.draggable = isDraggable;
          if (isDraggable) {
            marker.value.dragging?.enable();
          } else {
            marker.value.dragging?.disable();
          }
        } else {
          marker.value = L.value.marker([Number(newLat), Number(newLng)], {
            draggable: isDraggable,
            icon: new Icon(),
          });

          if (isDraggable) {
            marker.value.on('dragend', () => {
              const latlng = marker.value!.getLatLng();
              emit('update:lat', latlng.lat);
              emit('update:lng', latlng.lng);
            });
          }

          // Add click event listener
          marker.value.on('click', () => {
            emit('click');
          });

          marker.value.addTo(map.value);
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
  (newMap) => {
    if (newMap && L.value && !marker.value) {
      const isDraggable = props.editable || props.draggable;
      marker.value = L.value.marker([Number(props.lat), Number(props.lng)], {
        draggable: isDraggable,
      });

      if (isDraggable) {
        marker.value.on('dragend', () => {
          const latlng = marker.value!.getLatLng();
          emit('update:lat', latlng.lat);
          emit('update:lng', latlng.lng);
        });
      }

      marker.value.addTo(newMap);
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (map.value && L.value && !marker.value) {
    const isDraggable = props.editable || props.draggable;
    marker.value = L.value.marker([Number(props.lat), Number(props.lng)], {
      draggable: isDraggable,
    });

    if (isDraggable) {
      marker.value.on('dragend', () => {
        const latlng = marker.value!.getLatLng();
        emit('update:lat', latlng.lat);
        emit('update:lng', latlng.lng);
      });
    }

    marker.value.addTo(map.value);
  }
});

onBeforeUnmount(() => {
  if (marker.value) {
    marker.value.remove();
  }
});
</script>

<template><slot /></template>
