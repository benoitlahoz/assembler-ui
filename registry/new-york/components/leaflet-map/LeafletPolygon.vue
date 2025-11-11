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
  click: [];
}>();

const { getLeafletShapeColors } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const polygon = ref<L.Polygon | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const midpointMarkers = ref<L.Marker[]>([]);
const firstPointMarker = ref<L.Marker | null>(null);
const isDragging = ref(false);

// Variables pour le drag
let dragStartLatLngs: L.LatLng[] = [];
let dragStartMousePoint: L.Point | null = null;

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

const clearEditMarkers = () => {
  editMarkers.value.forEach((marker) => marker.remove());
  editMarkers.value = [];
  midpointMarkers.value.forEach((marker) => marker.remove());
  midpointMarkers.value = [];
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
      let currentPos = marker.getLatLng();

      newLatLngs[index] = currentPos;
      polygon.value!.setLatLngs([newLatLngs]);

      // Mettre à jour les midpoints en temps réel
      updateMidpoints(newLatLngs);
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

  // Créer les midpoints sur les segments
  createMidpoints();
};

const createMidpoints = () => {
  if (!polygon.value || !L.value || !map.value) return;

  const latlngs = polygon.value.getLatLngs()[0] as L.LatLng[];

  for (let i = 0; i < latlngs.length; i++) {
    const nextIndex = (i + 1) % latlngs.length;
    const current = latlngs[i];
    const next = latlngs[nextIndex];

    if (!current || !next) continue;

    const midLat = (current.lat + next.lat) / 2;
    const midLng = (current.lng + next.lng) / 2;

    const midMarker = L.value
      .marker([midLat, midLng], {
        draggable: true,
        icon: L.value.divIcon({
          className: 'leaflet-editing-icon-midpoint',
          html: '<div></div>',
          iconSize: [14, 14],
        }),
      })
      .addTo(map.value);

    let pointAdded = false;

    midMarker.on('dragstart', () => {
      if (map.value) map.value.getContainer().style.cursor = 'copy';
    });

    midMarker.on('drag', () => {
      const newPos = midMarker.getLatLng();
      const currentLatlngs = polygon.value!.getLatLngs()[0] as L.LatLng[];

      if (!pointAdded) {
        // Ajouter le nouveau point
        const newLatlngs = [...currentLatlngs];
        newLatlngs.splice(nextIndex, 0, newPos);
        polygon.value!.setLatLngs([newLatlngs]);
        pointAdded = true;
      } else {
        // Mettre à jour la position
        const newLatlngs = [...currentLatlngs];
        newLatlngs[nextIndex] = newPos;
        polygon.value!.setLatLngs([newLatlngs]);
      }
    });

    midMarker.on('dragend', () => {
      if (map.value) map.value.getContainer().style.cursor = '';
      const updatedLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map((ll) => [
        ll.lat,
        ll.lng,
      ]) as Array<[number, number]>;
      emit('update:latlngs', updatedLatLngs);
      enableEditing(); // Recréer tous les marqueurs
    });

    midMarker.on('mouseover', () => {
      if (map.value) map.value.getContainer().style.cursor = 'copy';
    });

    midMarker.on('mouseout', () => {
      if (map.value) {
        map.value.getContainer().style.cursor = '';
      }
    });

    midpointMarkers.value.push(midMarker);
  }
};

const updateMidpoints = (latlngs: L.LatLng[]) => {
  // Mettre à jour les positions des midpoints existants
  midpointMarkers.value.forEach((midMarker, i) => {
    const nextIndex = (i + 1) % latlngs.length;
    if (latlngs[i] && latlngs[nextIndex]) {
      const midLat = (latlngs[i].lat + latlngs[nextIndex].lat) / 2;
      const midLng = (latlngs[i].lng + latlngs[nextIndex].lng) / 2;
      midMarker.setLatLng(L.value!.latLng(midLat, midLng));
    }
  });
};

const enableDragging = () => {
  if (!polygon.value || !map.value) return;

  polygon.value.on('mousedown', (e: L.LeafletMouseEvent) => {
    L.value!.DomEvent.stopPropagation(e);
    isDragging.value = true;

    // Sauvegarder les positions initiales
    dragStartLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map((ll) =>
      L.value!.latLng(ll.lat, ll.lng)
    );
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
  if (!polygon.value) return;
  polygon.value.off('mousedown');
};

const setupMapDragHandlers = () => {
  if (!map.value) return;

  const onMouseMove = (e: L.LeafletMouseEvent) => {
    if (!isDragging.value || !dragStartMousePoint || !map.value) return;

    const currentPoint = map.value.latLngToContainerPoint(e.latlng);
    const deltaX = currentPoint.x - dragStartMousePoint.x;
    const deltaY = currentPoint.y - dragStartMousePoint.y;

    // Calculer les nouvelles positions
    const newLatLngs = dragStartLatLngs.map((startLatLng) => {
      const startPoint = map.value!.latLngToContainerPoint(startLatLng);
      const newPoint = L.value!.point(startPoint.x + deltaX, startPoint.y + deltaY);
      return map.value!.containerPointToLatLng(newPoint);
    });

    // Mettre à jour le polygone
    polygon.value!.setLatLngs([newLatLngs]);
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
    if (polygon.value) {
      const updatedLatLngs = (polygon.value.getLatLngs()[0] as L.LatLng[]).map((ll) => [
        ll.lat,
        ll.lng,
      ]) as Array<[number, number]>;
      emit('update:latlngs', updatedLatLngs);
    }
  };

  map.value.on('mousemove', onMouseMove);
  map.value.on('mouseup', onMouseUp);

  // Cleanup sur mouseup du polygone aussi
  if (polygon.value) {
    polygon.value.once('mouseup', onMouseUp);
  }
};

watch(
  () => [map.value, props.latlngs, props.editable, props.draggable, props.interactive],
  (newVal, oldVal) => {
    nextTick(() => {
      if (map.value && L.value && props.latlngs && props.latlngs.length >= 3) {
        const normalizedLatLngs = normalizeLatLngs(props.latlngs);

        if (polygon.value) {
          // Only update latlngs if they actually changed (not just editable/draggable)
          const oldLatlngs = oldVal?.[1];
          const newLatlngs = newVal[1];
          const latlngsChanged = JSON.stringify(oldLatlngs) !== JSON.stringify(newLatlngs);

          if (latlngsChanged) {
            polygon.value.setLatLngs([normalizedLatLngs]);
          }

          const colors = getLeafletShapeColors(props.class);
          polygon.value.setStyle({
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
          });
        } else {
          const colors = getLeafletShapeColors(props.class);
          polygon.value = L.value.polygon([normalizedLatLngs], {
            color: colors.color,
            fillColor: colors.fillColor,
            fillOpacity: colors.fillOpacity,
            interactive: props.interactive,
          });
          polygon.value.addTo(map.value);

          // Add click event listener
          polygon.value.on('click', () => {
            emit('click');
          });
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
