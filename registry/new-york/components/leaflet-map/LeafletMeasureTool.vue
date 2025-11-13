<script setup lang="ts">
import { ref, inject, watch, onBeforeUnmount, nextTick, type Ref } from 'vue';
import { LeafletMapKey, LeafletModuleKey } from '.';
import type { LatLng, Polyline, Marker, Circle, DivIcon } from 'leaflet';
import { useLeaflet } from '../../composables/use-leaflet/useLeaflet';

const {
  calculateLineDistance,
  calculatePolygonArea,
  calculateCentroid,
  formatDistance: formatDistanceUtil,
  formatArea: formatAreaUtil,
} = await useLeaflet();

export interface LeafletMeasureToolProps {
  enabled?: boolean;
  unit?: 'metric' | 'imperial';
  showArea?: boolean;
  showPerimeter?: boolean;
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
}

const props = withDefaults(defineProps<LeafletMeasureToolProps>(), {
  enabled: false,
  unit: 'metric',
  showArea: true,
  showPerimeter: true,
  color: '#ff6600',
  fillColor: '#ff6600',
  fillOpacity: 0.2,
});

const emit = defineEmits<{
  'measurement-start': [];
  'measurement-update': [{ distance: number; area?: number }];
  'measurement-complete': [{ distance: number; area?: number; points: LatLng[] }];
  'measurement-cancel': [];
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

// État
const measurementPoints = ref<LatLng[]>([]);
const polyline = ref<Polyline | null>(null);
const markers = ref<Marker[]>([]);
const measurementLabels = ref<Marker[]>([]);
const tempLine = ref<Polyline | null>(null);
const snapCircle = ref<Circle | null>(null);

let isActive = false;

// Calcul de distance (utilise le composable)
const calculateDistance = (latlngs: LatLng[]): number => {
  return calculateLineDistance(latlngs, props.unit);
};

// Calcul d'aire (utilise le composable)
const calculateArea = (latlngs: LatLng[]): number | undefined => {
  if (!props.showArea) return undefined;
  return calculatePolygonArea(latlngs, props.unit);
};

// Formatage des distances (utilise le composable)
const formatDistance = (distanceInMeters: number): string => {
  return formatDistanceUtil(distanceInMeters, props.unit);
};

// Formatage des aires (utilise le composable)
const formatArea = (areaInM2: number): string => {
  return formatAreaUtil(areaInM2, props.unit);
};

// Créer un marqueur de mesure
const createMeasureMarker = (latlng: LatLng, index: number): Marker | null => {
  if (!L.value || !map.value) return null;

  return L.value
    .marker(latlng, {
      icon: L.value.divIcon({
        className: 'leaflet-measure-marker',
        html: `<div style="
        width: 10px;
        height: 10px;
        background: ${props.color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      "></div>`,
        iconSize: [10, 10],
      }),
    })
    .addTo(map.value);
};

// Créer un label de distance
const createDistanceLabel = (latlng: LatLng, text: string): Marker | null => {
  if (!L.value || !map.value) return null;

  return L.value
    .marker(latlng, {
      icon: L.value.divIcon({
        className: 'leaflet-measure-label',
        html: `<div style="
        background: white;
        padding: 4px 8px;
        border-radius: 4px;
        border: 2px solid ${props.color};
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">${text}</div>`,
        iconSize: [0, 0],
        iconAnchor: [0, -10],
      }) as DivIcon,
    })
    .addTo(map.value);
};

// Gestionnaire de clic
const handleMapClick = (e: L.LeafletMouseEvent) => {
  if (!isActive || !L.value || !map.value) return;

  const latlng = e.latlng;
  measurementPoints.value.push(latlng);

  // Créer marqueur
  const marker = createMeasureMarker(latlng, measurementPoints.value.length - 1);
  if (marker) markers.value.push(marker);

  // Mettre à jour la ligne
  if (!polyline.value) {
    polyline.value = L.value
      .polyline([latlng], {
        color: props.color,
        weight: 3,
        dashArray: '10, 5',
      })
      .addTo(map.value);
  } else {
    polyline.value.addLatLng(latlng);
  }

  // Calculer et afficher la distance
  if (measurementPoints.value.length >= 2) {
    const distance = calculateDistance(measurementPoints.value);
    const prevPoint = measurementPoints.value[measurementPoints.value.length - 2];
    if (!prevPoint) return;
    const midpoint = L.value.latLng(
      (latlng.lat + prevPoint.lat) / 2,
      (latlng.lng + prevPoint.lng) / 2
    );

    const label = createDistanceLabel(midpoint, formatDistance(distance));
    if (label) measurementLabels.value.push(label);

    // Émettre mise à jour
    const area = calculateArea(measurementPoints.value);
    emit('measurement-update', { distance, area });
  }

  if (measurementPoints.value.length === 1) {
    emit('measurement-start');
  }
};

// Gestionnaire de mouvement de souris (ligne temporaire)
const handleMouseMove = (e: L.LeafletMouseEvent) => {
  if (!isActive || measurementPoints.value.length === 0 || !L.value || !map.value) return;

  const latlng = e.latlng;
  const points = [...measurementPoints.value, latlng];

  if (!tempLine.value) {
    tempLine.value = L.value
      .polyline(points, {
        color: props.color,
        weight: 2,
        dashArray: '5, 5',
        opacity: 0.5,
      })
      .addTo(map.value);
  } else {
    tempLine.value.setLatLngs(points);
  }

  // Afficher cercle de snap pour fermer le polygone
  if (measurementPoints.value.length >= 3) {
    const firstPoint = measurementPoints.value[0];
    if (!firstPoint) return;
    const distance = firstPoint.distanceTo(latlng);

    if (distance < 50000) {
      // Seuil de snap en mètres
      if (!snapCircle.value) {
        snapCircle.value = L.value
          .circle(firstPoint, {
            radius: 50,
            color: props.color,
            fillColor: props.fillColor,
            fillOpacity: 0.3,
            weight: 2,
          })
          .addTo(map.value);
      }
    } else if (snapCircle.value) {
      snapCircle.value.remove();
      snapCircle.value = null;
    }
  }
};

// Double-clic pour terminer la mesure
const handleDoubleClick = (e: L.LeafletMouseEvent) => {
  if (!isActive || measurementPoints.value.length < 2) return;

  L.value!.DomEvent.stop(e.originalEvent);
  finishMeasurement();
};

// Clic droit pour terminer
const handleContextMenu = (e: L.LeafletMouseEvent) => {
  if (!isActive || measurementPoints.value.length < 2) return;

  L.value!.DomEvent.stop(e.originalEvent);
  finishMeasurement();
};

// Touche Escape pour annuler
const handleKeyDown = (e: KeyboardEvent) => {
  if (!isActive) return;

  if (e.key === 'Escape') {
    emit('measurement-cancel');
    cleanup();
  } else if (e.key === 'Enter' && measurementPoints.value.length >= 2) {
    finishMeasurement();
  }
};

// Terminer la mesure
const finishMeasurement = () => {
  const distance = calculateDistance(measurementPoints.value);
  const area = calculateArea(measurementPoints.value);

  // Afficher le total si aire disponible
  if (area !== undefined && measurementPoints.value.length >= 3) {
    // Utiliser le centroïde du composable
    const center = calculateCentroid(measurementPoints.value);
    if (center) {
      const [lng, lat] = center;
      const totalLabel = createDistanceLabel(
        L.value!.latLng(lat, lng),
        `${formatDistance(distance)} | ${formatArea(area)}`
      );
      if (totalLabel) measurementLabels.value.push(totalLabel);
    }
  }

  emit('measurement-complete', {
    distance,
    area,
    points: [...measurementPoints.value],
  });

  cleanup();

  if (props.enabled) {
    // Redémarrer pour une nouvelle mesure
    nextTick(() => {
      isActive = true;
    });
  }
};

// Nettoyage
const cleanup = () => {
  polyline.value?.remove();
  polyline.value = null;

  tempLine.value?.remove();
  tempLine.value = null;

  snapCircle.value?.remove();
  snapCircle.value = null;

  markers.value.forEach((m) => m.remove());
  markers.value = [];

  measurementLabels.value.forEach((l) => l.remove());
  measurementLabels.value = [];

  measurementPoints.value = [];
};

// Activation/désactivation
const enable = () => {
  if (!map.value) return;

  isActive = true;
  map.value.getContainer().style.cursor = 'crosshair';

  // Désactiver le dragging de la carte pendant la mesure
  if (map.value.dragging) {
    map.value.dragging.disable();
  }

  if (map.value.doubleClickZoom) {
    map.value.doubleClickZoom.disable();
  }

  map.value.on('click', handleMapClick);
  map.value.on('mousemove', handleMouseMove);
  map.value.on('dblclick', handleDoubleClick);
  map.value.on('contextmenu', handleContextMenu);
  document.addEventListener('keydown', handleKeyDown);
};

const disable = () => {
  if (!map.value) return;

  isActive = false;
  map.value.getContainer().style.cursor = '';

  map.value.off('click', handleMapClick);
  map.value.off('mousemove', handleMouseMove);
  map.value.off('dblclick', handleDoubleClick);
  map.value.off('contextmenu', handleContextMenu);
  document.removeEventListener('keydown', handleKeyDown);

  // Réactiver le dragging de la carte
  if (map.value.dragging) {
    map.value.dragging.enable();
  }

  if (map.value.doubleClickZoom) {
    map.value.doubleClickZoom.enable();
  }

  cleanup();
};

// Watchers
watch(
  () => props.enabled,
  (enabled) => {
    if (enabled) {
      enable();
    } else {
      disable();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  disable();
});

defineExpose({
  finishMeasurement,
  cleanup,
});
</script>

<template>
  <slot />
</template>
