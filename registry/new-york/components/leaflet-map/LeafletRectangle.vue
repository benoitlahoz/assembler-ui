<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick, onBeforeUnmount, type HTMLAttributes } from 'vue';
import { useTailwindClassParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { LeafletMapKey, LeafletModuleKey } from '.';
import './leaflet-editing.css';

export interface LeafletRectangleProps {
  bounds?: [[number, number], [number, number]]; // [[latMin, lngMin], [latMax, lngMax]]
  editable?: boolean;
  draggable?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletRectangleProps>(), {
  bounds: () => [
    [0, 0],
    [0, 0],
  ],
  editable: false,
  draggable: false,
});

const emit = defineEmits<{
  'update:bounds': [bounds: [[number, number], [number, number]]];
}>();

const { getTailwindBaseCssValues } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const rectangle = ref<L.Rectangle | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const centerMarker = ref<L.Marker | null>(null);
const isDragging = ref(false);

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
  if (centerMarker.value) {
    centerMarker.value.remove();
    centerMarker.value = null;
  }
};

const enableEditing = () => {
  if (!rectangle.value || !L.value || !map.value) return;

  clearEditMarkers();

  const bounds = rectangle.value.getBounds();
  const corners = [
    bounds.getSouthWest(),
    bounds.getNorthWest(),
    bounds.getNorthEast(),
    bounds.getSouthEast(),
  ];

  corners.forEach((corner, index) => {
    const marker = L.value!.marker(corner, {
      draggable: true,
      icon: L.value!.divIcon({
        className: 'leaflet-editing-icon',
        iconSize: [8, 8],
        html: '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
      }),
    }).addTo(map.value!);

    marker.on('drag', () => {
      const currentBounds = rectangle.value!.getBounds();
      const newCorner = marker.getLatLng();

      // Calculer les nouvelles bornes en fonction du coin déplacé
      let newBounds: L.LatLngBounds;
      switch (index) {
        case 0: // Sud-Ouest
          newBounds = L.value!.latLngBounds(newCorner, currentBounds.getNorthEast());
          break;
        case 1: // Nord-Ouest
          newBounds = L.value!.latLngBounds(
            [currentBounds.getSouth(), newCorner.lng],
            [newCorner.lat, currentBounds.getEast()]
          );
          break;
        case 2: // Nord-Est
          newBounds = L.value!.latLngBounds(currentBounds.getSouthWest(), newCorner);
          break;
        case 3: // Sud-Est
          newBounds = L.value!.latLngBounds(
            [newCorner.lat, currentBounds.getWest()],
            [currentBounds.getNorth(), newCorner.lng]
          );
          break;
        default:
          return;
      }

      rectangle.value!.setBounds(newBounds);
      // Mettre à jour les positions des autres marqueurs
      const updatedCorners = [
        newBounds.getSouthWest(),
        newBounds.getNorthWest(),
        newBounds.getNorthEast(),
        newBounds.getSouthEast(),
      ];
      editMarkers.value.forEach((m, i) => {
        if (i !== index && updatedCorners[i]) {
          m.setLatLng(updatedCorners[i]!);
        }
      });
    });

    marker.on('dragend', () => {
      const updatedBounds = rectangle.value!.getBounds();
      emit('update:bounds', [
        [updatedBounds.getSouth(), updatedBounds.getWest()],
        [updatedBounds.getNorth(), updatedBounds.getEast()],
      ]);
    });

    editMarkers.value.push(marker);
  });

  // Créer le marqueur central pour le drag
  if (props.draggable) {
    createCenterMarker();
  }
};

const createCenterMarker = () => {
  if (!rectangle.value || !L.value || !map.value) return;

  const bounds = rectangle.value.getBounds();
  const center = bounds.getCenter();

  centerMarker.value = L.value
    .marker(center, {
      draggable: true,
      icon: L.value.divIcon({
        className: 'leaflet-editing-icon-center',
        html: '<div style="width:10px;height:10px;border-radius:50%;background:#fff;border:2px solid #ff8800;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [10, 10],
      }),
    })
    .addTo(map.value);

  let startBounds: L.LatLngBounds | null = null;
  let startCenter: L.LatLng | null = null;

  centerMarker.value.on('dragstart', () => {
    if (map.value) map.value.getContainer().style.cursor = 'move';
    startBounds = rectangle.value!.getBounds();
    startCenter = centerMarker.value!.getLatLng();
  });

  centerMarker.value.on('drag', () => {
    if (!startBounds || !startCenter) return;

    const newCenter = centerMarker.value!.getLatLng();
    const deltaLat = newCenter.lat - startCenter.lat;
    const deltaLng = newCenter.lng - startCenter.lng;

    const newBounds = L.value!.latLngBounds(
      [startBounds.getSouth() + deltaLat, startBounds.getWest() + deltaLng],
      [startBounds.getNorth() + deltaLat, startBounds.getEast() + deltaLng]
    );

    rectangle.value!.setBounds(newBounds);

    // Mettre à jour les coins
    const corners = [
      newBounds.getSouthWest(),
      newBounds.getNorthWest(),
      newBounds.getNorthEast(),
      newBounds.getSouthEast(),
    ];
    editMarkers.value.forEach((marker, i) => {
      if (corners[i]) marker.setLatLng(corners[i]);
    });
  });

  centerMarker.value.on('dragend', () => {
    if (map.value) map.value.getContainer().style.cursor = '';
    const updatedBounds = rectangle.value!.getBounds();
    emit('update:bounds', [
      [updatedBounds.getSouth(), updatedBounds.getWest()],
      [updatedBounds.getNorth(), updatedBounds.getEast()],
    ]);
  });

  centerMarker.value.on('mouseover', () => {
    if (map.value) map.value.getContainer().style.cursor = 'move';
  });

  centerMarker.value.on('mouseout', () => {
    if (map.value) {
      map.value.getContainer().style.cursor = '';
    }
  });
};

watch(
  () => [map.value, props.bounds, props.editable, props.draggable],
  () => {
    nextTick(() => {
      if (
        map.value &&
        L.value &&
        props.bounds &&
        props.bounds.length === 2 &&
        props.bounds[0].length === 2 &&
        props.bounds[1].length === 2
      ) {
        if (rectangle.value) {
          rectangle.value.setBounds(props.bounds);
          const colors = getColors();
          rectangle.value.setStyle({
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
        } else {
          const colors = getColors();
          rectangle.value = L.value.rectangle(props.bounds, {
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
          rectangle.value.addTo(map.value);
        }

        if (props.editable) {
          enableEditing();
        } else {
          clearEditMarkers();
        }
      } else {
        if (rectangle.value) {
          rectangle.value.remove();
          rectangle.value = null;
        }
        clearEditMarkers();
      }
    });
  },
  { immediate: true, flush: 'post' }
);

onBeforeUnmount(() => {
  clearEditMarkers();
  if (rectangle.value) {
    rectangle.value.remove();
  }
});
</script>

<template><slot /></template>
