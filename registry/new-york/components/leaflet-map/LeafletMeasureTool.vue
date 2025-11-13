<script setup lang="ts">
import {
  ref,
  inject,
  watch,
  onBeforeUnmount,
  nextTick,
  type Ref,
  type HTMLAttributes,
  computed,
} from 'vue';
import { cn } from '@/lib/utils';
import { LeafletMapKey, LeafletModuleKey } from '.';
import type { LatLng, Marker, Circle, DivIcon } from 'leaflet';
import { useLeaflet } from '../../composables/use-leaflet/useLeaflet';
import { useCssParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';

const {
  calculateLineDistance,
  calculatePolygonArea,
  calculateCentroid,
  formatDistance: formatDistanceUtil,
  formatArea: formatAreaUtil,
  pixelsToMeters,
} = await useLeaflet();

const { getLeafletShapeColors, parseHTMLToElement } = useCssParser();

export interface LeafletMeasureToolProps {
  enabled?: boolean;
  unit?: 'metric' | 'imperial';
  showArea?: boolean;
  showPerimeter?: boolean;
  snap?: string | number;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletMeasureToolProps>(), {
  enabled: false,
  unit: 'metric',
  showArea: true,
  showPerimeter: true,
  snap: 20,
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
const measurementPoints = ref<Array<[number, number]>>([]);
const markers = ref<Marker[]>([]);
const measurementLabels = ref<Marker[]>([]);
const snapCircle = ref<Circle | null>(null);
const tempPolygon = ref<L.Polygon | null>(null);
const isClosed = ref(false);

let isActive = false;
let isFinished = false;

// Calcul de distance (utilise le composable)
const calculateDistance = (): number => {
  if (measurementPoints.value.length < 2) return 0;
  const latlngs = measurementPoints.value.map(([lat, lng]) => L.value!.latLng(lat, lng));
  return calculateLineDistance(latlngs, props.unit);
};

// Calcul d'aire (utilise le composable)
const calculateArea = (): number | undefined => {
  if (!props.showArea || measurementPoints.value.length < 3) return undefined;
  const latlngs = measurementPoints.value.map(([lat, lng]) => L.value!.latLng(lat, lng));
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

const colors = computed(() => getLeafletShapeColors(props.class));

const createMeasureMarker = (latlng: [number, number], index: number): Marker | null => {
  if (!L.value || !map.value) return null;

  return L.value
    .marker([latlng[0], latlng[1]], {
      icon: L.value.divIcon({
        className: 'leaflet-measure-marker',
        html: `<div style="
        width: 10px;
        height: 10px;
        background: ${colors.value.color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
      "></div>`,
        iconSize: [10, 10],
      }),
    })
    .addTo(map.value);
};

const createDistanceLabel = (latlng: [number, number], text: string): Marker | null => {
  if (!L.value || !map.value) return null;

  const html = `<div style="
        display: flex;
        align-items-center;
        justify-content-center;
        color: black;
        background: white;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid ${colors.value.color};
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">${text}</div>`;

  const [width, height] = parseHTMLToElement((el: HTMLElement) => {
    return [
      el.firstChild ? (el.firstChild as HTMLElement).offsetWidth : 80,
      el.firstChild ? (el.firstChild as HTMLElement).offsetHeight : 20,
    ];
  }, html);

  return L.value
    .marker([latlng[0], latlng[1]], {
      icon: L.value.divIcon({
        className: 'leaflet-measure-label',
        html,
        iconSize: [width, height],
        iconAnchor: [width / 2, height / 2],
      }) as DivIcon,
    })
    .addTo(map.value);
};

const handleMapClick = (e: L.LeafletMouseEvent) => {
  if (!L.value || !map.value) return;

  // Si une mesure est terminée, nettoyer et commencer une nouvelle
  if (isFinished) {
    cleanup();
    isFinished = false;
    isActive = true;
  }

  if (!isActive) return;

  const latlng = e.latlng;

  if (measurementPoints.value.length >= 3) {
    const firstPoint = measurementPoints.value[0];
    if (!firstPoint) return;
    const firstLatLng = L.value.latLng(firstPoint[0], firstPoint[1]);
    const distance = firstLatLng.distanceTo(latlng);

    // Seuil de snap : 20 pixels converti en mètres selon le zoom
    // À zoom 15, ~20px ≈ 30m; à zoom 10, ~20px ≈ 1000m
    const zoom = map.value.getZoom();
    const metersPerPixel = pixelsToMeters(zoom, latlng.lat);
    const snapThreshold = Number(props.snap) * metersPerPixel;

    if (distance < snapThreshold) {
      // Ajouter le dernier segment (retour au premier point) avant de fermer
      const firstPt = measurementPoints.value[0];
      const lastPt = measurementPoints.value[measurementPoints.value.length - 1];

      if (firstPt && lastPt) {
        const lastLatLng = L.value.latLng(lastPt[0], lastPt[1]);
        const firstLatLng = L.value.latLng(firstPt[0], firstPt[1]);
        const closingDistance = lastLatLng.distanceTo(firstLatLng);

        // Ajouter le label pour le segment de fermeture
        const midpoint: [number, number] = [
          (firstPt[0] + lastPt[0]) / 2,
          (firstPt[1] + lastPt[1]) / 2,
        ];
        const label = createDistanceLabel(midpoint, formatDistance(closingDistance));
        if (label) measurementLabels.value.push(label);
      }

      // Fermer le polygone
      isClosed.value = true;
      finishMeasurement();
      return;
    }
  }

  measurementPoints.value.push([latlng.lat, latlng.lng]);

  // Créer marqueur
  const marker = createMeasureMarker([latlng.lat, latlng.lng], measurementPoints.value.length - 1);
  if (marker) markers.value.push(marker);

  // Créer ou mettre à jour le polygone temporaire
  if (!tempPolygon.value && L.value && map.value) {
    const colors = getLeafletShapeColors(props.class);
    tempPolygon.value = L.value.polygon(measurementPoints.value as L.LatLngExpression[], {
      color: colors.color,
      fillColor: colors.fillColor,
      fillOpacity: colors.fillOpacity,
      weight: 3,
      dashArray: '10, 5',
      interactive: false,
    });
    tempPolygon.value.addTo(map.value);
  } else if (tempPolygon.value) {
    tempPolygon.value.setLatLngs(measurementPoints.value as L.LatLngExpression[]);
  }

  // Calculer et afficher la distance du segment
  if (measurementPoints.value.length >= 2) {
    const prevPoint = measurementPoints.value[measurementPoints.value.length - 2];
    if (!prevPoint) return;

    // Distance du segment uniquement (entre les deux derniers points)
    const prevLatLng = L.value.latLng(prevPoint[0], prevPoint[1]);
    const segmentDistance = prevLatLng.distanceTo(latlng);

    const midpoint: [number, number] = [
      (latlng.lat + prevPoint[0]) / 2,
      (latlng.lng + prevPoint[1]) / 2,
    ];

    const label = createDistanceLabel(midpoint, formatDistance(segmentDistance));
    if (label) measurementLabels.value.push(label);

    // Émettre mise à jour avec la distance totale
    const totalDistance = calculateDistance();
    const area = calculateArea();
    emit('measurement-update', { distance: totalDistance, area });
  }

  if (measurementPoints.value.length === 1) {
    emit('measurement-start');
  }
};

// Gestionnaire de mouvement de souris (pour le cercle de snap et ligne temporaire)
const handleMouseMove = (e: L.LeafletMouseEvent) => {
  if (!isActive || measurementPoints.value.length === 0 || !L.value || !map.value) {
    // Retirer le cercle de snap s'il existe
    if (snapCircle.value) {
      snapCircle.value.remove();
      snapCircle.value = null;
    }
    return;
  }

  const latlng = e.latlng;

  // Mettre à jour le polygone temporaire avec la position de la souris
  if (tempPolygon.value) {
    const previewPoints: Array<[number, number]> = [
      ...measurementPoints.value,
      [latlng.lat, latlng.lng],
    ];
    tempPolygon.value.setLatLngs(previewPoints as L.LatLngExpression[]);
  }

  // Cercle de snap uniquement s'il y a au moins 3 points
  if (measurementPoints.value.length < 3) {
    if (snapCircle.value) {
      snapCircle.value.remove();
      snapCircle.value = null;
    }
    return;
  }

  const firstPoint = measurementPoints.value[0];
  if (!firstPoint) return;

  const firstLatLng = L.value.latLng(firstPoint[0], firstPoint[1]);
  const distance = firstLatLng.distanceTo(latlng);

  // Seuil de snap : 20 pixels converti en mètres selon le zoom
  const zoom = map.value.getZoom();
  const metersPerPixel = pixelsToMeters(zoom, latlng.lat);
  const snapThreshold = 20 * metersPerPixel;

  if (distance < snapThreshold) {
    // Afficher cercle de snap pour fermer le polygone
    if (!snapCircle.value) {
      const colors = getLeafletShapeColors(props.class);
      snapCircle.value = L.value
        .circle(firstLatLng, {
          radius: snapThreshold,
          color: colors.color,
          fillColor: colors.fillColor,
          fillOpacity: 0.3,
          weight: 2,
        })
        .addTo(map.value);
    }
  } else if (snapCircle.value) {
    snapCircle.value.remove();
    snapCircle.value = null;
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
  const distance = calculateDistance();
  const area = calculateArea();

  const latlngs = measurementPoints.value.map(([lat, lng]) => L.value!.latLng(lat, lng));
  emit('measurement-complete', {
    distance,
    area,
    points: latlngs,
  });

  isActive = false;
  isFinished = true;
};

// Nettoyage
const cleanup = () => {
  tempPolygon.value?.remove();
  tempPolygon.value = null;

  snapCircle.value?.remove();
  snapCircle.value = null;

  markers.value.forEach((m) => m.remove());
  markers.value = [];

  measurementLabels.value.forEach((l) => l.remove());
  measurementLabels.value = [];

  measurementPoints.value = [];
  isClosed.value = false;
  isFinished = false;
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
