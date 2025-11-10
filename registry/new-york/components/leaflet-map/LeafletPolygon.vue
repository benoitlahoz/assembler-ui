<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick, onBeforeUnmount, type HTMLAttributes } from 'vue';
import { useTailwindClassParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { LeafletMapKey, LeafletModuleKey } from '.';
import './leaflet-editing.css';

export interface LeafletPolygonProps {
  latlngs?: Array<[number, number]> | Array<{ lat: number; lng: number }>;
  editable?: boolean;
  draggable?: boolean;
  interactive?: boolean;
  autoClose?: boolean; // Nouvelle prop pour la fermeture auto
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletPolygonProps>(), {
  latlngs: () => [],
  editable: false,
  draggable: false,
  interactive: true,
  autoClose: true,
});

const emit = defineEmits<{
  'update:latlngs': [latlngs: Array<[number, number]>];
  closed: [];
}>();

const { getTailwindBaseCssValues } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const polygon = ref<L.Polygon | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const firstPointMarker = ref<L.Marker | null>(null);
const isDragging = ref(false);

const normalizeLatLngs = (
  latlngs: Array<[number, number]> | Array<{ lat: number; lng: number }>
): Array<[number, number]> => {
  return latlngs.map((point) => {
    if (Array.isArray(point)) {
      return point;
    }
    return [point.lat, point.lng] as [number, number];
  });
};

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
    color: cssValues['color'] || '#3388ff',
    fillColor: cssValues['background-color'] || '#3388ff',
    fillOpacity: cssValues['opacity'] ? parseFloat(cssValues['opacity']) : 0.2,
  };
};

const clearEditMarkers = () => {
  editMarkers.value.forEach((marker) => marker.remove());
  editMarkers.value = [];
  if (firstPointMarker.value) {
    firstPointMarker.value.remove();
    firstPointMarker.value = null;
  }
};

const enableEditing = () => {
  if (!polygon.value || !L.value || !map.value) return;

  clearEditMarkers();

  const latlngs = polygon.value.getLatLngs()[0] as L.LatLng[];

  latlngs.forEach((latlng, index) => {
    const isFirstPoint = index === 0;
    const marker = L.value!.marker(latlng, {
      draggable: true,
      icon: L.value!.divIcon({
        className: isFirstPoint
          ? 'leaflet-editing-icon leaflet-editing-icon-first'
          : 'leaflet-editing-icon',
        html: isFirstPoint
          ? '<div style="width:12px;height:12px;border-radius:50%;background:#fff;border:2px solid #3388ff;cursor:pointer;"></div>'
          : '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: isFirstPoint ? [12, 12] : [8, 8],
      }),
    }).addTo(map.value!);

    if (isFirstPoint && props.autoClose) {
      firstPointMarker.value = marker;
      // Clic sur le premier point pour fermer le polygone
      marker.on('click', () => {
        emit('closed');
      });
    }

    marker.on('drag', () => {
      const newLatLngs = [...latlngs];
      newLatLngs[index] = marker.getLatLng();
      polygon.value!.setLatLngs([newLatLngs]);
    });

    marker.on('dragend', () => {
      const updatedLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map((ll) => [
        ll.lat,
        ll.lng,
      ]) as Array<[number, number]>;
      emit('update:latlngs', updatedLatLngs);
    });

    editMarkers.value.push(marker);
  });
};

const enableDragging = () => {
  if (!polygon.value || !L.value || !map.value) return;

  let startLatLngs: L.LatLng[] = [];
  let startMousePos: L.LatLng | null = null;

  polygon.value.on('mousedown', (e: any) => {
    if (!props.draggable || props.editable) return; // Ne pas activer le drag si en mode édition
    isDragging.value = true;
    startLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map((ll) =>
      L.value!.latLng(ll.lat, ll.lng)
    );
    startMousePos = e.latlng;
    map.value!.dragging.disable();
    e.originalEvent.stopPropagation();
  });

  map.value.on('mousemove', (e: any) => {
    if (!isDragging.value || !startMousePos) return;

    const deltaLat = e.latlng.lat - startMousePos.lat;
    const deltaLng = e.latlng.lng - startMousePos.lng;

    const newLatLngs = startLatLngs.map((ll) =>
      L.value!.latLng(ll.lat + deltaLat, ll.lng + deltaLng)
    );

    polygon.value!.setLatLngs([newLatLngs]);
  });

  map.value.on('mouseup', () => {
    if (!isDragging.value) return;
    isDragging.value = false;
    map.value!.dragging.enable();

    const updatedLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map((ll) => [
      ll.lat,
      ll.lng,
    ]) as Array<[number, number]>;
    emit('update:latlngs', updatedLatLngs);
  });
};

watch(
  () => [map.value, props.latlngs, props.editable, props.draggable, props.interactive],
  () => {
    nextTick(() => {
      if (map.value && L.value && props.latlngs && props.latlngs.length >= 3) {
        const normalizedLatLngs = normalizeLatLngs(props.latlngs);

        if (polygon.value) {
          polygon.value.setLatLngs([normalizedLatLngs]);
          const colors = getColors();
          polygon.value.setStyle({
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
        } else {
          const colors = getColors();
          polygon.value = L.value.polygon([normalizedLatLngs], {
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
            interactive: props.interactive,
          });
          polygon.value.addTo(map.value);
        }

        if (props.editable) {
          enableEditing();
        } else {
          clearEditMarkers();
        }

        if (props.draggable || props.editable) {
          enableDragging();
        }
      } else {
        if (polygon.value) {
          polygon.value.remove();
          polygon.value = null;
        }
        clearEditMarkers();
      }
    });
  },
  { immediate: true, flush: 'post' }
);

onBeforeUnmount(() => {
  clearEditMarkers();
  if (polygon.value) {
    polygon.value.remove();
  }
});
</script>

<template><slot /></template>
