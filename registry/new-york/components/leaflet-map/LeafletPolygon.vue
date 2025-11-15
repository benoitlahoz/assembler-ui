<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick, type HTMLAttributes } from 'vue';
import { useCssParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { useLeaflet } from '~~/registry/new-york/composables/use-leaflet/useLeaflet';
import { useCheckIn } from '~~/registry/new-york/composables/use-check-in/useCheckIn';
import { LeafletMapKey, LeafletModuleKey, LeafletSelectionKey, type FeatureReference } from '.';
import './leaflet-editing.css';

const {
  calculateMidpoint,
  LatDegreesMeters,
  lngDegreesToRadius,
  normalizeLatLngs,
  setMapCursor,
  resetMapCursor,
  translatePointByPixels,
  createStyledMarker,
} = await useLeaflet();

export interface LeafletPolygonProps {
  id?: string | number;
  latlngs?: Array<[number, number]> | Array<{ lat: number; lng: number }>;
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  interactive?: boolean;
  autoClose?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletPolygonProps>(), {
  latlngs: () => [],
  editable: false,
  draggable: false,
  selectable: false,
  interactive: true,
  autoClose: true,
});

const emit = defineEmits<{
  'update:latlngs': [latlngs: Array<[number, number]>];
  closed: [];
  click: [];
  dragstart: [];
}>();

const { getLeafletShapeColors } = useCssParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const polygon = ref<L.Polygon | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const midpointMarkers = ref<L.Marker[]>([]);
const firstPointMarker = ref<L.Marker | null>(null);
const isDragging = ref(false);
const polygonId = ref<string | number>(props.id ?? `polygon-${Date.now()}-${Math.random()}`);

// Variables pour le drag
let dragStartLatLngs: L.LatLng[] = [];
let dragStartMousePoint: L.Point | null = null;

// Use checkIn for automatic registration/cleanup
const { checkIn } = useCheckIn<FeatureReference>();

// Check in with selection desk
const { desk } = selectionContext
  ? checkIn(selectionContext, {
      autoCheckIn: props.selectable,
      id: polygonId.value,
      data: () => ({
        id: polygonId.value,
        type: 'polygon' as const,
        getBounds: () => {
          if (!polygon.value || !L.value) return null;
          return polygon.value.getBounds();
        },
        getInitialData: () => {
          if (!polygon.value) return null;
          return polygon.value.getLatLngs()[0] as L.LatLng[];
        },
        applyTransform: (bounds: L.LatLngBounds) => {
          if (!polygon.value) return;
          const currentLatLngs = polygon.value.getLatLngs()[0] as L.LatLng[];
          const currentBounds = polygon.value.getBounds();
          const scaleX =
            (bounds.getEast() - bounds.getWest()) /
            (currentBounds.getEast() - currentBounds.getWest());
          const scaleY =
            (bounds.getNorth() - bounds.getSouth()) /
            (currentBounds.getNorth() - currentBounds.getSouth());
          const newCenter = bounds.getCenter();
          const currentCenter = currentBounds.getCenter();
          const offsetLat = newCenter.lat - currentCenter.lat;
          const offsetLng = newCenter.lng - currentCenter.lng;
          const newLatLngs = currentLatLngs.map((latlng) => {
            const relLat = (latlng.lat - currentCenter.lat) * scaleY;
            const relLng = (latlng.lng - currentCenter.lng) * scaleX;
            return L.value!.latLng(newCenter.lat + relLat, newCenter.lng + relLng);
          });
          polygon.value.setLatLngs([newLatLngs]);
          emit(
            'update:latlngs',
            newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<[number, number]>
          );
        },
        applyRotation: (angle: number, center: { lat: number; lng: number }, initialData: any) => {
          if (!polygon.value || !L.value) return;
          const initialLatLngs = initialData as L.LatLng[];
          const angleRad = (-angle * Math.PI) / 180;
          const metersPerDegreeLat = LatDegreesMeters;
          const metersPerDegreeLng = lngDegreesToRadius(1, center.lat);
          const newLatLngs = initialLatLngs.map((latlng) => {
            const lat = latlng.lat;
            const lng = latlng.lng;
            const relMetersY = (lat - center.lat) * metersPerDegreeLat;
            const relMetersX = (lng - center.lng) * metersPerDegreeLng;
            const newRelMetersY = relMetersY * Math.cos(angleRad) - relMetersX * Math.sin(angleRad);
            const newRelMetersX = relMetersY * Math.sin(angleRad) + relMetersX * Math.cos(angleRad);
            return L.value!.latLng(
              center.lat + newRelMetersY / metersPerDegreeLat,
              center.lng + newRelMetersX / metersPerDegreeLng
            );
          });
          polygon.value.setLatLngs([newLatLngs]);
          emit(
            'update:latlngs',
            newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<[number, number]>
          );
        },
      }),
      watchData: true,
    })
  : { desk: ref(null) };

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
    const marker = createStyledMarker(
      latlng,
      {
        className: isFirstPoint
          ? 'leaflet-editing-icon leaflet-editing-icon-first'
          : 'leaflet-editing-icon',
        html: isFirstPoint
          ? '<div style="width:12px;height:12px;border-radius:50%;background:#fff;border:2px solid #3388ff;cursor:pointer;"></div>'
          : '<div style="width:8px;height:8px;border-radius:50%;background:#fff;border:2px solid #3388ff;"></div>',
        iconSize: isFirstPoint ? [12, 12] : [8, 8],
      },
      { draggable: true },
      map.value!
    );
    if (!marker) return;

    if (isFirstPoint && props.autoClose) {
      firstPointMarker.value = marker;

      const onFirstPointClick = () => {
        emit('closed');
      };

      // Clic sur le premier point pour fermer le polygone
      marker.on('click', onFirstPointClick);
    }

    const onVertexDrag = () => {
      const newLatLngs = [...latlngs];
      let currentPos = marker.getLatLng();

      newLatLngs[index] = currentPos;
      polygon.value!.setLatLngs([newLatLngs]);

      // Mettre à jour les midpoints en temps réel
      updateMidpoints(newLatLngs);
    };

    const onVertexDragEnd = () => {
      const updatedLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map((ll) => [
        ll.lat,
        ll.lng,
      ]) as Array<[number, number]>;
      emit('update:latlngs', updatedLatLngs);
    };

    marker.on('drag', onVertexDrag);
    marker.on('dragend', onVertexDragEnd);

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

    const [midLat, midLng] = calculateMidpoint(current, next);

    const midMarker = createStyledMarker(
      [midLat, midLng],
      {
        className: 'leaflet-editing-icon-midpoint',
        html: '<div></div>',
        iconSize: [14, 14],
      },
      { draggable: true },
      map.value
    );
    if (!midMarker) continue;

    let pointAdded = false;

    const onMidpointDragStart = () => {
      if (map.value) setMapCursor(map.value, 'copy');
    };

    const onMidpointDrag = () => {
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
    };

    const onMidpointDragEnd = () => {
      resetMapCursor(map.value);
      const updatedLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map((ll) => [
        ll.lat,
        ll.lng,
      ]) as Array<[number, number]>;
      emit('update:latlngs', updatedLatLngs);
      enableEditing(); // Recréer tous les marqueurs
    };

    const onMidpointMouseOver = () => {
      if (map.value) setMapCursor(map.value, 'copy');
    };

    const onMidpointMouseOut = () => {
      resetMapCursor(map.value);
    };

    midMarker.on('dragstart', onMidpointDragStart);
    midMarker.on('drag', onMidpointDrag);
    midMarker.on('dragend', onMidpointDragEnd);
    midMarker.on('mouseover', onMidpointMouseOver);
    midMarker.on('mouseout', onMidpointMouseOut);

    midpointMarkers.value.push(midMarker);
  }
};

const updateMidpoints = (latlngs: L.LatLng[]) => {
  // Mettre à jour les positions des midpoints existants
  midpointMarkers.value.forEach((midMarker, i) => {
    const nextIndex = (i + 1) % latlngs.length;
    if (latlngs[i] && latlngs[nextIndex]) {
      const [midLat, midLng] = calculateMidpoint(latlngs[i], latlngs[nextIndex]);
      midMarker.setLatLng(L.value!.latLng(midLat, midLng));
    }
  });
};

const enableDragging = () => {
  if (!polygon.value || !map.value) return;

  const onPolygonMouseDown = (e: L.LeafletMouseEvent) => {
    L.value!.DomEvent.stopPropagation(e);
    isDragging.value = true;

    // Émettre dragstart
    emit('dragstart');

    // Sauvegarder les positions initiales
    dragStartLatLngs = (polygon.value!.getLatLngs()[0] as L.LatLng[]).map((ll) =>
      L.value!.latLng(ll.lat, ll.lng)
    );
    dragStartMousePoint = map.value!.latLngToContainerPoint(e.latlng);

    // Setup map handlers
    setupMapDragHandlers();

    // Curseur et désactiver le drag de la carte
    if (map.value) {
      setMapCursor(map.value, 'move');
      map.value.dragging.disable();
    }
  };

  polygon.value.on('mousedown', onPolygonMouseDown);
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

    // Calculer les nouvelles positions avec translatePointByPixels
    const newLatLngs = dragStartLatLngs
      .map((startLatLng) => translatePointByPixels(startLatLng, deltaX, deltaY, map.value!))
      .filter((ll): ll is L.LatLng => ll !== null);

    if (newLatLngs.length !== dragStartLatLngs.length) return;

    // Mettre à jour le polygone
    polygon.value!.setLatLngs([newLatLngs]);

    // Émettre la mise à jour en temps réel pendant le drag
    const updatedLatLngs = newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<[number, number]>;
    emit('update:latlngs', updatedLatLngs);

    // Notify selection manager to update bounding box
    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(polygonId.value);
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

// Selection handled by checkIn above

watch(
  () => [
    map.value,
    props.latlngs,
    props.editable,
    props.draggable,
    props.interactive,
    props.selectable,
  ],
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

          const onPolygonClick = () => {
            if (props.selectable && selectionContext) {
              selectionContext.selectFeature('polygon', polygonId.value);
            }
            emit('click');
          };

          const onPolygonMouseDown = (e: any) => {
            if (props.draggable && props.selectable && selectionContext) {
              selectionContext.selectFeature('polygon', polygonId.value);
            }
          };

          // Add click event listener
          if (props.selectable && selectionContext) {
            polygon.value.on('click', onPolygonClick);
            polygon.value.on('mousedown', onPolygonMouseDown);
          } else {
            polygon.value.on('click', onPolygonClick);
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
</script>

<template><slot /></template>
