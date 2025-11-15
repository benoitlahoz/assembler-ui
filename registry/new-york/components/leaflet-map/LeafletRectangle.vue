<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick, type HTMLAttributes } from 'vue';
import { useCssParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { useLeaflet } from '~~/registry/new-york/composables/use-leaflet/useLeaflet';
import { useCheckIn } from '~~/registry/new-york/composables/use-check-in/useCheckIn';

const { checkIn } = useCheckIn<FeatureReference>();
import { LeafletMapKey, LeafletModuleKey, LeafletSelectionKey } from '.';
import type { FeatureReference } from './LeafletFeaturesSelector.vue';
import './leaflet-editing.css';

const {
  calculateBoundsFromHandle,
  setMapCursor,
  resetMapCursor,
  createStyledMarker,
  translatePointByPixels,
} = await useLeaflet();

export interface LeafletRectangleProps {
  id?: string | number;
  bounds?: [[number, number], [number, number]];
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletRectangleProps>(), {
  bounds: () => [
    [0, 0],
    [0, 0],
  ],
  editable: false,
  draggable: false,
  selectable: false,
});

const emit = defineEmits<{
  'update:bounds': [bounds: [[number, number], [number, number]]];
  click: [];
  dragstart: [];
}>();

const { getLeafletShapeColors } = useCssParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const rectangle = ref<L.Rectangle | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const isDragging = ref(false);
const rectangleId = ref<string | number>(props.id ?? `rectangle-${Date.now()}-${Math.random()}`);

// Check in with selection desk
const { desk } = selectionContext
  ? checkIn(selectionContext, {
      autoCheckIn: props.selectable,
      id: rectangleId.value,
      data: () => ({
        id: rectangleId.value,
        type: 'rectangle' as const,
        getBounds: () => {
          if (!rectangle.value) return null;
          return rectangle.value.getBounds();
        },
        applyTransform: (bounds: L.LatLngBounds) => {
          if (!rectangle.value) return;

          rectangle.value.setBounds(bounds);
          emit('update:bounds', [
            [bounds.getSouth(), bounds.getWest()],
            [bounds.getNorth(), bounds.getEast()],
          ] as [[number, number], [number, number]]);
        },
      }),
      watchData: true,
    })
  : { desk: ref(null) };

// Variables pour le drag
let dragStartBounds: L.LatLngBounds | null = null;
let dragStartMousePoint: L.Point | null = null;

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
    const marker = createStyledMarker(
      corner,
      {
        className: 'leaflet-editing-icon',
        html: '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: [8, 8],
      },
      { draggable: true },
      map.value!
    );
    if (!marker) return;

    const onCornerDrag = () => {
      const currentBounds = rectangle.value!.getBounds();
      const newCorner = marker.getLatLng();

      // Calculer les nouvelles bornes avec la fonction utilitaire
      const newBounds = calculateBoundsFromHandle('corner', index, newCorner, currentBounds);
      if (!newBounds) return;

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
    };

    const onCornerDragEnd = () => {
      const updatedBounds = rectangle.value!.getBounds();
      emit('update:bounds', [
        [updatedBounds.getSouth(), updatedBounds.getWest()],
        [updatedBounds.getNorth(), updatedBounds.getEast()],
      ]);
    };

    marker.on('drag', onCornerDrag);
    marker.on('dragend', onCornerDragEnd);

    editMarkers.value.push(marker);
  });
};

const enableDragging = () => {
  if (!rectangle.value || !map.value) return;

  const onRectangleMouseDown = (e: L.LeafletMouseEvent) => {
    L.value!.DomEvent.stopPropagation(e);
    isDragging.value = true;

    // Émettre dragstart
    emit('dragstart');

    // Sauvegarder les positions initiales
    dragStartBounds = rectangle.value!.getBounds();
    dragStartMousePoint = map.value!.latLngToContainerPoint(e.latlng);

    // Setup map handlers
    setupMapDragHandlers();

    // Curseur et désactiver le drag de la carte
    if (map.value) {
      setMapCursor(map.value, 'move');
      map.value.dragging.disable();
    }
  };

  rectangle.value.on('mousedown', onRectangleMouseDown);
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

    // Utiliser translatePointByPixels pour calculer les nouvelles positions
    const newSW = translatePointByPixels(dragStartBounds.getSouthWest(), deltaX, deltaY, map.value);
    const newNE = translatePointByPixels(dragStartBounds.getNorthEast(), deltaX, deltaY, map.value);

    if (!newSW || !newNE || !L.value) return;

    const newBounds = L.value.latLngBounds(newSW, newNE);

    // Mettre à jour le rectangle
    rectangle.value!.setBounds(newBounds);

    // Emit updates in real-time for bounding box
    emit('update:bounds', [
      [newBounds.getSouth(), newBounds.getWest()],
      [newBounds.getNorth(), newBounds.getEast()],
    ]);

    // Notify selection manager to update bounding box
    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(rectangleId.value);
    }
  };

  const onMouseUp = () => {
    if (!isDragging.value) return;

    isDragging.value = false;

    // Réactiver le drag de la carte
    if (map.value) {
      resetMapCursor(map.value);
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

// Selection handled by checkIn above

watch(
  () => [map.value, props.bounds, props.editable, props.draggable, props.selectable],
  (newVal, oldVal) => {
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
          // Only update bounds if they actually changed (not just editable/draggable)
          const oldBounds = oldVal?.[1];
          const newBounds = newVal[1];
          const boundsChanged = JSON.stringify(oldBounds) !== JSON.stringify(newBounds);

          if (boundsChanged) {
            rectangle.value.setBounds(props.bounds);
          }

          const colors = getLeafletShapeColors(props.class);
          rectangle.value.setStyle({
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
        } else {
          const colors = getLeafletShapeColors(props.class);
          rectangle.value = L.value.rectangle(props.bounds, {
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
          rectangle.value.addTo(map.value);

          const onRectangleClick = () => {
            if (props.selectable && selectionContext) {
              selectionContext.selectFeature('rectangle', rectangleId.value);
            }
            emit('click');
          };

          const onRectangleMouseDown = (e: any) => {
            if (props.draggable && props.selectable && selectionContext) {
              selectionContext.selectFeature('rectangle', rectangleId.value);
            }
          };

          // Add click event listener
          if (props.selectable && selectionContext) {
            rectangle.value.on('click', onRectangleClick);
            rectangle.value.on('mousedown', onRectangleMouseDown);
          } else {
            rectangle.value.on('click', onRectangleClick);
          }
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
</script>

<template><slot /></template>
