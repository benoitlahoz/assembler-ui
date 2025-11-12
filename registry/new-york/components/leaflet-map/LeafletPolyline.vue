<script setup lang="ts">
import { inject, watch, ref, type Ref, nextTick, onBeforeUnmount, type HTMLAttributes } from 'vue';
import { useCssParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import { LeafletMapKey, LeafletModuleKey, LeafletSelectionKey } from '.';
import type { FeatureReference } from './LeafletSelectionManager.vue';
import './leaflet-editing.css';

export interface LeafletPolylineProps {
  id?: string | number;
  latlngs?: Array<[number, number]> | Array<{ lat: number; lng: number }>;
  weight?: number;
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletPolylineProps>(), {
  latlngs: () => [],
  weight: 3,
  editable: false,
  draggable: false,
  selectable: false,
});

const emit = defineEmits<{
  'update:latlngs': [latlngs: Array<[number, number]>];
  click: [];
  dragstart: [];
}>();

const { getLeafletLineColors } = useCssParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const polyline = ref<L.Polyline | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const midpointMarkers = ref<L.Marker[]>([]);
const isDragging = ref(false);
const polylineId = ref<string | number>(props.id ?? `polyline-${Date.now()}-${Math.random()}`);

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

    // Émettre dragstart
    emit('dragstart');

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

    // Émettre la mise à jour en temps réel pendant le drag
    const updatedLatLngs = newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<[number, number]>;
    emit('update:latlngs', updatedLatLngs);

    // Notify selection manager to update bounding box
    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(polylineId.value);
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

// Selection context integration
const registerWithSelection = () => {
  if (!props.selectable || !selectionContext || !polyline.value) return;

  const featureRef: FeatureReference = {
    id: polylineId.value,
    type: 'polyline',
    getBounds: () => {
      if (!polyline.value) return null;
      return polyline.value.getBounds();
    },
    getInitialData: () => {
      if (!polyline.value) return null;
      const latlngs = polyline.value.getLatLngs() as L.LatLng[];
      return latlngs.map((ll) => [ll.lat, ll.lng] as [number, number]);
    },
    applyTransform: (bounds: L.LatLngBounds) => {
      if (!polyline.value || !L.value) return;

      const currentBounds = polyline.value.getBounds();
      const currentCenter = currentBounds.getCenter();
      const newCenter = bounds.getCenter();

      const currentLatLngs = polyline.value.getLatLngs() as L.LatLng[];
      const scaleX =
        (bounds.getEast() - bounds.getWest()) / (currentBounds.getEast() - currentBounds.getWest());
      const scaleY =
        (bounds.getNorth() - bounds.getSouth()) /
        (currentBounds.getNorth() - currentBounds.getSouth());

      const newLatLngs = currentLatLngs.map((latlng) => {
        const relativeX = (latlng.lng - currentCenter.lng) * scaleX;
        const relativeY = (latlng.lat - currentCenter.lat) * scaleY;
        return L.value!.latLng(newCenter.lat + relativeY, newCenter.lng + relativeX);
      });

      polyline.value.setLatLngs(newLatLngs);
      emit('update:latlngs', newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<[number, number]>);
    },
    applyRotation: (
      angle: number,
      center: { lat: number; lng: number },
      initialLatLngs: Array<[number, number]>
    ) => {
      if (!polyline.value || !L.value || !initialLatLngs) return;

      const angleRad = (-angle * Math.PI) / 180; // Inverser l'angle pour corriger le sens

      // Conversion en coordonnées métriques pour une rotation correcte
      const metersPerDegreeLat = 111320; // 1 degré de latitude ≈ 111320 mètres
      const metersPerDegreeLng = 111320 * Math.cos((center.lat * Math.PI) / 180);

      const newLatLngs = initialLatLngs.map((latlng) => {
        const lat = latlng[0];
        const lng = latlng[1];

        // Convertir en mètres relatifs au centre
        const relMetersY = (lat - center.lat) * metersPerDegreeLat;
        const relMetersX = (lng - center.lng) * metersPerDegreeLng;

        // Appliquer la rotation en coordonnées métriques
        const newRelMetersY = relMetersY * Math.cos(angleRad) - relMetersX * Math.sin(angleRad);
        const newRelMetersX = relMetersY * Math.sin(angleRad) + relMetersX * Math.cos(angleRad);

        // Reconvertir en degrés
        return L.value!.latLng(
          center.lat + newRelMetersY / metersPerDegreeLat,
          center.lng + newRelMetersX / metersPerDegreeLng
        );
      });

      polyline.value.setLatLngs(newLatLngs);
      emit('update:latlngs', newLatLngs.map((ll) => [ll.lat, ll.lng]) as Array<[number, number]>);
    },
  };

  selectionContext.registerFeature(featureRef);
};

watch(
  () => [map.value, props.latlngs, props.weight, props.editable, props.draggable, props.selectable],
  (newVal, oldVal) => {
    nextTick(() => {
      if (map.value && L.value && props.latlngs && props.latlngs.length > 0) {
        const normalizedLatLngs = normalizeLatLngs(props.latlngs);

        if (polyline.value) {
          // Only update latlngs if they actually changed (not just editable/draggable/weight)
          const oldLatlngs = oldVal?.[1];
          const newLatlngs = newVal[1];
          const latlngsChanged = JSON.stringify(oldLatlngs) !== JSON.stringify(newLatlngs);

          if (latlngsChanged) {
            polyline.value.setLatLngs(normalizedLatLngs);
          }

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
          if (props.selectable && selectionContext) {
            polyline.value.on('click', () => {
              selectionContext.selectFeature('polyline', polylineId.value);
              emit('click');
            });
            polyline.value.on('mousedown', (e: any) => {
              if (props.draggable) {
                selectionContext.selectFeature('polyline', polylineId.value);
              }
            });
          } else {
            polyline.value.on('click', () => {
              emit('click');
            });
          }

          // Register with selection context if selectable
          if (props.selectable && selectionContext) {
            registerWithSelection();
          }
        }

        // Check if selectable changed and we need to register/unregister
        if (polyline.value) {
          const selectableChanged = oldVal && Boolean(oldVal[5]) !== Boolean(newVal[5]);
          if (selectableChanged) {
            // Remove old event listeners
            polyline.value.off('click');
            polyline.value.off('mousedown');

            // Add new event listeners based on selectable state
            if (props.selectable && selectionContext) {
              polyline.value.on('click', () => {
                selectionContext.selectFeature('polyline', polylineId.value);
                emit('click');
              });
              polyline.value.on('mousedown', (e: any) => {
                if (props.draggable) {
                  selectionContext.selectFeature('polyline', polylineId.value);
                }
              });
              registerWithSelection();
            } else {
              polyline.value.on('click', () => {
                emit('click');
              });
              if (selectionContext) {
                selectionContext.unregisterFeature(polylineId.value);
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
  // Unregister from selection context
  if (props.selectable && selectionContext) {
    selectionContext.unregisterFeature(polylineId.value);
  }

  clearEditMarkers();
  if (polyline.value) {
    polyline.value.remove();
  }
});
</script>

<template><slot /></template>
