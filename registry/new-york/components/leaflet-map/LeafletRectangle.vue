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
const isDragging = ref(false);

// Variables pour le drag
let dragStartBounds: L.LatLngBounds | null = null;
let dragStartMousePoint: L.Point | null = null;

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
};

const enableDragging = () => {
  if (!rectangle.value || !map.value) return;

  rectangle.value.on('mousedown', (e: L.LeafletMouseEvent) => {
    L.value!.DomEvent.stopPropagation(e);
    isDragging.value = true;

    // Sauvegarder les positions initiales
    dragStartBounds = rectangle.value!.getBounds();
    dragStartMousePoint = map.value!.latLngToContainerPoint(e.latlng);

    // Setup map handlers
    setupMapDragHandlers();

    // Curseur et désactiver le drag de la carte
    if (map.value) {
      map.value.getContainer().style.cursor = 'move';
      map.value.dragging.disable();
    }
  });
};

const disableDragging = () => {
  if (!rectangle.value) return;
  rectangle.value.off('mousedown');
};

const setupMapDragHandlers = () => {
  if (!map.value) return;

  const onMouseMove = (e: L.LeafletMouseEvent) => {
    if (!isDragging.value || !dragStartMousePoint || !dragStartBounds || !map.value) return;

    const currentPoint = map.value.latLngToContainerPoint(e.latlng);
    const deltaX = currentPoint.x - dragStartMousePoint.x;
    const deltaY = currentPoint.y - dragStartMousePoint.y;

    // Calculer les nouvelles positions des coins
    const swPoint = map.value.latLngToContainerPoint(dragStartBounds.getSouthWest());
    const nePoint = map.value.latLngToContainerPoint(dragStartBounds.getNorthEast());

    const newSW = map.value.containerPointToLatLng(
      L.value!.point(swPoint.x + deltaX, swPoint.y + deltaY)
    );
    const newNE = map.value.containerPointToLatLng(
      L.value!.point(nePoint.x + deltaX, nePoint.y + deltaY)
    );

    const newBounds = L.value!.latLngBounds(newSW, newNE);

    // Mettre à jour le rectangle
    rectangle.value!.setBounds(newBounds);
  };

  const onMouseUp = () => {
    if (!isDragging.value) return;

    isDragging.value = false;

    // Réactiver le drag de la carte
    if (map.value) {
      map.value.getContainer().style.cursor = '';
      map.value.dragging.enable();
      map.value.off('mousemove', onMouseMove);
      map.value.off('mouseup', onMouseUp);
    }

    // Émettre la mise à jour
    if (rectangle.value) {
      const updatedBounds = rectangle.value.getBounds();
      emit('update:bounds', [
        [updatedBounds.getSouth(), updatedBounds.getWest()],
        [updatedBounds.getNorth(), updatedBounds.getEast()],
      ]);
    }
  };

  map.value.on('mousemove', onMouseMove);
  map.value.on('mouseup', onMouseUp);

  // Cleanup sur mouseup du rectangle aussi
  if (rectangle.value) {
    rectangle.value.once('mouseup', onMouseUp);
  }
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

        // Gestion des modes : draggable OU editable, pas les deux
        if (props.draggable && !props.editable) {
          clearEditMarkers();
          enableDragging();
        } else if (props.editable && !props.draggable) {
          disableDragging();
          enableEditing();
        } else {
          clearEditMarkers();
          disableDragging();
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
