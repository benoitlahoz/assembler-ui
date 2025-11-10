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
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletCircleProps>(), {
  lat: 43.280608,
  lng: 5.350242,
  radius: 100,
  editable: false,
});

const emit = defineEmits<{
  'update:lat': [lat: number];
  'update:lng': [lng: number];
  'update:radius': [radius: number];
}>();

const { getTailwindBaseCssValues } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const circle = ref<L.Circle | null>(null);
const centerMarker = ref<L.Marker | null>(null);
const radiusMarker = ref<L.Marker | null>(null);

const getColors = () => {
  const classNames = props.class ? props.class.toString().split(' ') : [];
  const el = document.createElement('div');
  el.className = classNames.join(' ');
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.zIndex = '-9999';
  document.body.appendChild(el);
  const cssValues = getTailwindBaseCssValues(el, ['color', 'background-color', 'opacity']);
  document.body.removeChild(el);
  return {
    color: cssValues['color'] || 'blue',
    fillColor: cssValues['background-color'] || 'blue',
    fillOpacity: cssValues['opacity'] ? parseFloat(cssValues['opacity']) : 0.2,
  };
};

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

const enableEditing = () => {
  if (!circle.value || !L.value || !map.value) return;

  clearEditMarkers();

  const center = circle.value.getLatLng();
  const radius = circle.value.getRadius();

  // Marqueur pour déplacer le centre
  centerMarker.value = L.value
    .marker(center, {
      draggable: true,
      icon: L.value.divIcon({
        className: 'leaflet-editing-icon',
        html: '<div style="width:10px;height:10px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: [10, 10],
      }),
    })
    .addTo(map.value);

  centerMarker.value.on('drag', () => {
    const newCenter = centerMarker.value!.getLatLng();
    circle.value!.setLatLng(newCenter);
    if (radiusMarker.value) {
      const bearing = 90; // Est
      const radiusLatLng = L.value!.latLng(
        newCenter.lat,
        newCenter.lng + radius / 111320 / Math.cos((newCenter.lat * Math.PI) / 180)
      );
      radiusMarker.value.setLatLng(radiusLatLng);
    }
  });

  centerMarker.value.on('dragend', () => {
    const newCenter = centerMarker.value!.getLatLng();
    emit('update:lat', newCenter.lat);
    emit('update:lng', newCenter.lng);
  });

  // Marqueur pour modifier le rayon
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
};

watch(
  () => [map.value, props.lat, props.lng, props.radius, props.editable],
  () => {
    nextTick(() => {
      if (
        map.value &&
        L.value &&
        !isNaN(Number(props.lat)) &&
        !isNaN(Number(props.lng)) &&
        !isNaN(Number(props.radius))
      ) {
        if (circle.value) {
          circle.value.setLatLng([Number(props.lat), Number(props.lng)]);
          circle.value.setRadius(Number(props.radius));
        } else {
          circle.value = L.value.circle([Number(props.lat), Number(props.lng)], {
            radius: Number(props.radius),
          });
          circle.value.addTo(map.value);
        }
        const colors = getColors();
        circle.value.setStyle({
          color: colors.color,
          fillColor: colors.fillColor,
          fillOpacity: colors.fillOpacity,
        });

        if (props.editable) {
          enableEditing();
        } else {
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
