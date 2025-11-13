<script setup lang="ts">
import { ref, inject, watch, onBeforeUnmount, nextTick, type Ref } from 'vue';
import { LeafletMapKey, LeafletModuleKey } from '.';
import type { LatLng, Polyline, Marker, Circle, DivIcon } from 'leaflet';

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

// Calcul de distance
const calculateDistance = (latlngs: LatLng[]): number => {
  if (latlngs.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < latlngs.length - 1; i++) {
    const current = latlngs[i];
    const next = latlngs[i + 1];
    if (current && next) {
      totalDistance += current.distanceTo(next);
    }
  }

  return props.unit === 'metric' ? totalDistance : totalDistance * 3.28084;
};

// Calcul d'aire (pour polygones fermés)
const calculateArea = (latlngs: LatLng[]): number | undefined => {
  if (!props.showArea || latlngs.length < 3) return undefined;

  // Utiliser la formule de Shoelace pour calculer l'aire
  let area = 0;
  const n = latlngs.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const current = latlngs[i];
    const next = latlngs[j];
    if (!current || !next) continue;
    const xi = current.lat;
    const yi = current.lng;
    const xj = next.lat;
    const yj = next.lng;
    area += xi * yj - xj * yi;
  }

  area = Math.abs(area / 2);

  // Conversion approximative en m² (très approximatif, pour une vraie app utiliser turf.js)
  // 1 degré lat ≈ 111 km, 1 degré lng varie selon la latitude
  const avgLat = latlngs.reduce((sum, ll) => sum + ll.lat, 0) / n;
  const latToMeters = 111320;
  const lngToMeters = 111320 * Math.cos((avgLat * Math.PI) / 180);
  area = area * latToMeters * lngToMeters;

  return props.unit === 'metric' ? area : area * 10.7639;
};

// Formatage des distances
const formatDistance = (distance: number): string => {
  if (props.unit === 'metric') {
    return distance > 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance.toFixed(2)} m`;
  } else {
    return distance > 5280 ? `${(distance / 5280).toFixed(2)} mi` : `${distance.toFixed(2)} ft`;
  }
};

// Formatage des aires
const formatArea = (area: number): string => {
  if (props.unit === 'metric') {
    return area > 10000 ? `${(area / 1000000).toFixed(2)} km²` : `${area.toFixed(2)} m²`;
  } else {
    return area > 43560 ? `${(area / 43560).toFixed(2)} acres` : `${area.toFixed(2)} ft²`;
  }
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
    const center = measurementPoints.value.reduce(
      (acc, ll) => {
        acc.lat += ll.lat;
        acc.lng += ll.lng;
        return acc;
      },
      { lat: 0, lng: 0 }
    );
    center.lat /= measurementPoints.value.length;
    center.lng /= measurementPoints.value.length;

    const totalLabel = createDistanceLabel(
      L.value!.latLng(center.lat, center.lng),
      `${formatDistance(distance)} | ${formatArea(area)}`
    );
    if (totalLabel) measurementLabels.value.push(totalLabel);
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
