<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick, onBeforeUnmount, type HTMLAttributes } from 'vue';
import { useTailwindClassParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { LeafletMapKey, LeafletModuleKey } from '.';
import './leaflet-editing.css';

export interface LeafletPolylineProps {
  latlngs?: Array<[number, number]> | Array<{ lat: number; lng: number }>;
  weight?: number;
  editable?: boolean;
  draggable?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletPolylineProps>(), {
  latlngs: () => [],
  weight: 3,
  editable: false,
  draggable: false,
});

const emit = defineEmits<{
  'update:latlngs': [latlngs: Array<[number, number]>];
  click: [];
}>();

const { getLeafletLineColors } = useTailwindClassParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const polyline = ref<L.Polyline | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const midpointMarkers = ref<L.Marker[]>([]);
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
};

const enableEditing = () => {
  if (!polyline.value || !L.value || !map.value) return;

  clearEditMarkers();

  // Ajouter des marqueurs éditables à chaque point
  const latlngs = polyline.value.getLatLngs() as L.LatLng[];
  latlngs.forEach((latlng, index) => {
    const marker = L.value!.marker(latlng, {
      draggable: true,
      icon: L.value!.divIcon({
        className: 'leaflet-editing-icon',
        html: '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: [8, 8],
      }),
    }).addTo(map.value!);

    marker.on('drag', () => {
      const newLatLngs = [...latlngs];
      newLatLngs[index] = marker.getLatLng();
      polyline.value!.setLatLngs(newLatLngs);

      // Mettre à jour les midpoints en temps réel
      updateMidpoints(newLatLngs);
    });

    marker.on('dragend', () => {
      const updatedLatLngs = polyline.value!.getLatLngs() as L.LatLng[];
      emit(
        'update:latlngs',
        updatedLatLngs.map((ll) => [ll.lat, ll.lng])
      );
    });

    editMarkers.value.push(marker);
  });

  // Créer les midpoints
  createMidpoints();
};

const createMidpoints = () => {
  if (!polyline.value || !L.value || !map.value) return;

  const latlngs = polyline.value.getLatLngs() as L.LatLng[];

  // Pour une polyline, pas de boucle (ligne ouverte)
  for (let i = 0; i < latlngs.length - 1; i++) {
    const current = latlngs[i];
    const next = latlngs[i + 1];

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
      const currentLatlngs = polyline.value!.getLatLngs() as L.LatLng[];

      if (!pointAdded) {
        const newLatlngs = [...currentLatlngs];
        newLatlngs.splice(i + 1, 0, newPos);
        polyline.value!.setLatLngs(newLatlngs);
        pointAdded = true;
      } else {
        const newLatlngs = [...currentLatlngs];
        newLatlngs[i + 1] = newPos;
        polyline.value!.setLatLngs(newLatlngs);
      }
    });

    midMarker.on('dragend', () => {
      if (map.value) map.value.getContainer().style.cursor = '';
      const updatedLatLngs = (polyline.value!.getLatLngs() as L.LatLng[]).map((ll) => [
        ll.lat,
        ll.lng,
      ]) as Array<[number, number]>;
      emit('update:latlngs', updatedLatLngs);
      enableEditing();
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
  // Pour une polyline, il y a latlngs.length - 1 midpoints
  midpointMarkers.value.forEach((midMarker, i) => {
    const current = latlngs[i];
    const next = latlngs[i + 1];
    if (current && next) {
      const midLat = (current.lat + next.lat) / 2;
      const midLng = (current.lng + next.lng) / 2;
      midMarker.setLatLng(L.value!.latLng(midLat, midLng));
    }
  });
};

const enableDragging = () => {
  if (!polyline.value || !map.value) return;

  polyline.value.on('mousedown', (e: L.LeafletMouseEvent) => {
    L.value!.DomEvent.stopPropagation(e);
    isDragging.value = true;

    // Sauvegarder les positions initiales
    dragStartLatLngs = (polyline.value!.getLatLngs() as L.LatLng[]).map((ll) =>
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
  if (!polyline.value) return;
  polyline.value.off('mousedown');
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

    // Mettre à jour la polyline
    polyline.value!.setLatLngs(newLatLngs);
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
    if (polyline.value) {
      const updatedLatLngs = (polyline.value.getLatLngs() as L.LatLng[]).map((ll) => [
        ll.lat,
        ll.lng,
      ]) as Array<[number, number]>;
      emit('update:latlngs', updatedLatLngs);
    }
  };

  map.value.on('mousemove', onMouseMove);
  map.value.on('mouseup', onMouseUp);

  // Cleanup sur mouseup de la polyline aussi
  if (polyline.value) {
    polyline.value.once('mouseup', onMouseUp);
  }
};

watch(
  () => [map.value, props.latlngs, props.weight, props.editable, props.draggable],
  () => {
    nextTick(() => {
      if (map.value && L.value && props.latlngs && props.latlngs.length > 0) {
        const normalizedLatLngs = normalizeLatLngs(props.latlngs);

        if (polyline.value) {
          polyline.value.setLatLngs(normalizedLatLngs);
          const colors = getLeafletLineColors(props.class);
          polyline.value.setStyle({
            color: colors.color,
            weight: props.weight,
            opacity: colors.opacity,
          });
        } else {
          const colors = getLeafletLineColors(props.class);
          polyline.value = L.value.polyline(normalizedLatLngs, {
            color: colors.color,
            weight: props.weight,
            opacity: colors.opacity,
          });
          polyline.value.addTo(map.value);

          // Add click event listener
          polyline.value.on('click', () => {
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
        if (polyline.value) {
          polyline.value.remove();
          polyline.value = null;
        }
        clearEditMarkers();
      }
    });
  },
  { immediate: true, flush: 'post' }
);

onBeforeUnmount(() => {
  clearEditMarkers();
  if (polyline.value) {
    polyline.value.remove();
  }
});
</script>

<template><slot /></template>
