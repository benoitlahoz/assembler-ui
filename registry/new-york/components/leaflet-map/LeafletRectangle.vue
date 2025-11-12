<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick, onBeforeUnmount, type HTMLAttributes } from 'vue';
import { useCssParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { LeafletMapKey, LeafletModuleKey, LeafletSelectionKey } from '.';
import type { FeatureReference } from './LeafletSelectionManager.vue';
import './leaflet-editing.css';

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

    // Émettre dragstart
    emit('dragstart');

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

// Selection context integration
const registerWithSelection = () => {
  if (!props.selectable || !selectionContext || !rectangle.value) return;

  const featureRef: FeatureReference = {
    id: rectangleId.value,
    type: 'rectangle',
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
    // Pas de rotation pour les rectangles (ils restent axis-aligned)
  };

  selectionContext.registerFeature(featureRef);
};

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

          // Add click event listener
          if (props.selectable && selectionContext) {
            rectangle.value.on('click', () => {
              selectionContext.selectFeature('rectangle', rectangleId.value);
              emit('click');
            });
            rectangle.value.on('mousedown', (e: any) => {
              if (props.draggable) {
                selectionContext.selectFeature('rectangle', rectangleId.value);
              }
            });
          } else {
            rectangle.value.on('click', () => {
              emit('click');
            });
          }

          // Register with selection context if selectable
          if (props.selectable && selectionContext) {
            registerWithSelection();
          }
        }

        // Check if selectable changed and we need to register/unregister
        if (rectangle.value) {
          const selectableChanged = oldVal && Boolean(oldVal[4]) !== Boolean(newVal[4]);
          if (selectableChanged) {
            // Remove old event listeners
            rectangle.value.off('click');
            rectangle.value.off('mousedown');

            // Add new event listeners based on selectable state
            if (props.selectable && selectionContext) {
              rectangle.value.on('click', () => {
                selectionContext.selectFeature('rectangle', rectangleId.value);
                emit('click');
              });
              rectangle.value.on('mousedown', (e: any) => {
                if (props.draggable) {
                  selectionContext.selectFeature('rectangle', rectangleId.value);
                }
              });
              registerWithSelection();
            } else {
              rectangle.value.on('click', () => {
                emit('click');
              });
              if (selectionContext) {
                selectionContext.unregisterFeature(rectangleId.value);
              }
            }
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

onBeforeUnmount(() => {
  // Unregister from selection context
  if (props.selectable && selectionContext) {
    selectionContext.unregisterFeature(rectangleId.value);
  }

  clearEditMarkers();
  if (rectangle.value) {
    rectangle.value.remove();
  }
});
</script>

<template><slot /></template>
