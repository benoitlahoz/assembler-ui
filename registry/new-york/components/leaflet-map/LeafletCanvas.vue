<script setup lang="ts">
import {
  inject,
  watch,
  ref,
  type Ref,
  nextTick,
  onBeforeUnmount,
  type HTMLAttributes,
  provide,
} from 'vue';
import { useCssParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';
import {
  LeafletMapKey,
  LeafletModuleKey,
  LeafletSelectionKey,
  LeafletStylesKey,
  type LeafletFeatureHandleStyle,
} from '.';
import type { FeatureReference } from './LeafletFeaturesSelector.vue';
import './leaflet-editing.css';

export interface LeafletCanvasStyles {
  corner: LeafletFeatureHandleStyle;
}

export interface LeafletCanvasProps {
  id?: string | number;
  corners?: Array<{ lat: number; lng: number }>;
  width?: number;
  height?: number;
  editable?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  subdivisions?: number;
  opacity?: number;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<LeafletCanvasProps>(), {
  corners: () => [
    { lat: 48.86, lng: 2.35 },
    { lat: 48.86, lng: 2.36 },
    { lat: 48.85, lng: 2.36 },
    { lat: 48.85, lng: 2.35 },
  ],
  width: 400,
  height: 300,
  editable: false,
  draggable: false,
  selectable: false,
  subdivisions: 20,
  opacity: 1,
});

const emit = defineEmits<{
  'update:corners': [corners: Array<{ lat: number; lng: number }>];
  'canvas-ready': [canvas: HTMLCanvasElement];
  click: [];
  dragstart: [];
}>();

const { getLeafletShapeColors } = useCssParser();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));
const selectionContext = inject(LeafletSelectionKey, undefined);

const stylesOptions = ref<LeafletCanvasStyles>({
  corner: {
    className: 'leaflet-feature-handle leaflet-handle-corner-canvas',
    html: '<div style="background:#3388ff;border:2px solid #fff;"></div>',
    iconSize: [10, 10],
  },
});

provide(LeafletStylesKey, stylesOptions);

const canvasLayer = ref<HTMLCanvasElement | null>(null);
const sourceCanvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const canvasId = ref<string | number>(props.id ?? `canvas-${Date.now()}-${Math.random()}`);
const isDragging = ref(false);

let dragStartCorners: Array<{ lat: number; lng: number }> = [];
let dragStartMousePoint: L.Point | null = null;

const createSourceCanvas = () => {
  if (sourceCanvas.value) return sourceCanvas.value;

  sourceCanvas.value = document.createElement('canvas');
  sourceCanvas.value.width = props.width;
  sourceCanvas.value.height = props.height;

  emit('canvas-ready', sourceCanvas.value);
  return sourceCanvas.value;
};

const clearEditMarkers = () => {
  editMarkers.value.forEach((marker) => marker.remove());
  editMarkers.value = [];
};

const enableEditing = () => {
  if (!L.value || !map.value) return;

  clearEditMarkers();

  props.corners.forEach((corner, index) => {
    const marker = L.value!.marker([corner.lat, corner.lng], {
      draggable: true,
      icon: L.value!.divIcon(stylesOptions.value.corner),
    }).addTo(map.value!);

    marker.on('drag', () => {
      const newCorners = [...props.corners];
      const newPos = marker.getLatLng();
      newCorners[index] = { lat: newPos.lat, lng: newPos.lng };
      emit('update:corners', newCorners);

      if (selectionContext) {
        selectionContext.notifyFeatureUpdate(canvasId.value);
      }
    });

    marker.on('dragend', () => {
      const newCorners = [...props.corners];
      const newPos = marker.getLatLng();
      newCorners[index] = { lat: newPos.lat, lng: newPos.lng };
      emit('update:corners', newCorners);
    });

    editMarkers.value.push(marker);
  });
};

let mouseDownHandler: ((e: MouseEvent) => void) | null = null;

const enableDragging = () => {
  if (!canvasLayer.value || !map.value || !L.value) return;

  // Retirer l'ancien handler si existe
  if (mouseDownHandler) {
    canvasLayer.value.removeEventListener('mousedown', mouseDownHandler);
  }

  mouseDownHandler = (e: MouseEvent) => {
    if (!map.value || !L.value) return;

    L.value.DomEvent.stopPropagation(e as any);
    isDragging.value = true;

    emit('dragstart');

    dragStartCorners = JSON.parse(JSON.stringify(props.corners));
    dragStartMousePoint = L.value.point(e.clientX, e.clientY);

    setupMapDragHandlers();

    if (map.value) {
      map.value.getContainer().style.cursor = 'move';
      map.value.dragging.disable();
    }
  };

  canvasLayer.value.addEventListener('mousedown', mouseDownHandler);
};

const disableDragging = () => {
  if (!canvasLayer.value || !mouseDownHandler) return;
  canvasLayer.value.removeEventListener('mousedown', mouseDownHandler);
  mouseDownHandler = null;
};

const setupMapDragHandlers = () => {
  if (!map.value || !L.value) return;

  const onMouseMove = (e: L.LeafletMouseEvent) => {
    if (!isDragging.value || !dragStartMousePoint || !map.value || !L.value) return;

    const currentPoint = L.value.point(e.originalEvent.clientX, e.originalEvent.clientY);
    const deltaX = currentPoint.x - dragStartMousePoint.x;
    const deltaY = currentPoint.y - dragStartMousePoint.y;

    const newCorners = dragStartCorners.map((corner) => {
      const startPoint = map.value!.latLngToContainerPoint([corner.lat, corner.lng]);
      const newPoint = L.value!.point(startPoint.x + deltaX, startPoint.y + deltaY);
      const newLatLng = map.value!.containerPointToLatLng(newPoint);
      return { lat: newLatLng.lat, lng: newLatLng.lng };
    });

    emit('update:corners', newCorners);

    if (selectionContext) {
      selectionContext.notifyFeatureUpdate(canvasId.value);
    }
  };

  const onMouseUp = () => {
    if (!isDragging.value) return;

    isDragging.value = false;

    if (map.value) {
      map.value.getContainer().style.cursor = '';
      map.value.dragging.enable();
      map.value.off('mousemove', onMouseMove as any);
      map.value.off('mouseup', onMouseUp);
    }

    emit('update:corners', [...props.corners]);
  };

  map.value.on('mousemove', onMouseMove as any);
  map.value.on('mouseup', onMouseUp);
};

// Interpolation bilinéaire
const bilinearInterp = (corners: Array<{ x: number; y: number }>, u: number, v: number) => {
  if (!corners[0] || !corners[1] || !corners[2] || !corners[3]) {
    return { x: 0, y: 0 };
  }

  const x =
    (1 - u) * (1 - v) * corners[0].x +
    u * (1 - v) * corners[1].x +
    u * v * corners[2].x +
    (1 - u) * v * corners[3].x;

  const y =
    (1 - u) * (1 - v) * corners[0].y +
    u * (1 - v) * corners[1].y +
    u * v * corners[2].y +
    (1 - u) * v * corners[3].y;

  return { x, y };
};

// Calcul transformation affine
const getAffineTransform = (
  src: Array<{ x: number; y: number }>,
  dst: Array<{ x: number; y: number }>
) => {
  if (!src[0] || !src[1] || !src[2] || !dst[0] || !dst[1] || !dst[2]) {
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  }

  const x0 = src[0].x,
    y0 = src[0].y;
  const x1 = src[1].x,
    y1 = src[1].y;
  const x2 = src[2].x,
    y2 = src[2].y;

  const u0 = dst[0].x,
    v0 = dst[0].y;
  const u1 = dst[1].x,
    v1 = dst[1].y;
  const u2 = dst[2].x,
    v2 = dst[2].y;

  const delta = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);

  const a = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) / delta;
  const b = ((u2 - u0) * (x1 - x0) - (u1 - u0) * (x2 - x0)) / delta;
  const c = ((v1 - v0) * (y2 - y0) - (v2 - v0) * (y1 - y0)) / delta;
  const d = ((v2 - v0) * (x1 - x0) - (v1 - v0) * (x2 - x0)) / delta;
  const e = u0 - (a * x0 + b * y0);
  const f = v0 - (c * x0 + d * y0);

  return { a, b, c, d, e, f };
};

// Dessiner un triangle déformé
const drawTriangle = (
  src: Array<{ x: number; y: number }>,
  dst: Array<{ x: number; y: number }>
) => {
  if (!ctx.value || !sourceCanvas.value || !dst[0] || !dst[1] || !dst[2]) return;

  const transform = getAffineTransform(src, dst);

  ctx.value.save();
  ctx.value.beginPath();
  ctx.value.moveTo(dst[0].x, dst[0].y);
  ctx.value.lineTo(dst[1].x, dst[1].y);
  ctx.value.lineTo(dst[2].x, dst[2].y);
  ctx.value.closePath();
  ctx.value.clip();

  ctx.value.transform(transform.a, transform.c, transform.b, transform.d, transform.e, transform.f);

  ctx.value.drawImage(sourceCanvas.value, 0, 0);
  ctx.value.restore();
};

// Dessiner la grille déformée
const drawWarpedGrid = (corners: Array<{ x: number; y: number }>) => {
  if (!ctx.value || !sourceCanvas.value || !canvasLayer.value) return;

  const subs = props.subdivisions;
  const sw = sourceCanvas.value.width;
  const sh = sourceCanvas.value.height;

  ctx.value.clearRect(0, 0, canvasLayer.value.width, canvasLayer.value.height);

  // Appliquer l'opacité globale
  ctx.value.globalAlpha = props.opacity;

  for (let i = 0; i < subs; i++) {
    for (let j = 0; j < subs; j++) {
      const u0 = i / subs,
        v0 = j / subs;
      const u1 = (i + 1) / subs,
        v1 = (j + 1) / subs;

      // Points source
      const srcQuad = [
        { x: u0 * sw, y: v0 * sh },
        { x: u1 * sw, y: v0 * sh },
        { x: u1 * sw, y: v1 * sh },
        { x: u0 * sw, y: v1 * sh },
      ];

      // Points destination
      const dstQuad = [
        bilinearInterp(corners, u0, v0),
        bilinearInterp(corners, u1, v0),
        bilinearInterp(corners, u1, v1),
        bilinearInterp(corners, u0, v1),
      ];

      // Dessiner 2 triangles
      if (srcQuad[0] && srcQuad[1] && srcQuad[2] && dstQuad[0] && dstQuad[1] && dstQuad[2]) {
        drawTriangle([srcQuad[0], srcQuad[1], srcQuad[2]], [dstQuad[0], dstQuad[1], dstQuad[2]]);
      }
      if (srcQuad[0] && srcQuad[2] && srcQuad[3] && dstQuad[0] && dstQuad[2] && dstQuad[3]) {
        drawTriangle([srcQuad[0], srcQuad[2], srcQuad[3]], [dstQuad[0], dstQuad[2], dstQuad[3]]);
      }
    }
  }

  // Réinitialiser l'opacité pour le contour
  ctx.value.globalAlpha = 1;
};

const drawOutline = (corners: Array<{ x: number; y: number }>) => {
  if (!ctx.value) return;

  // Extraire les couleurs des classes CSS
  const colors = getLeafletShapeColors(props.class);

  ctx.value.beginPath();

  if (corners[0]) {
    ctx.value.moveTo(corners[0].x, corners[0].y);
  }
  if (corners[1]) {
    ctx.value.lineTo(corners[1].x, corners[1].y);
  }
  if (corners[2]) {
    ctx.value.lineTo(corners[2].x, corners[2].y);
  }
  if (corners[3]) {
    ctx.value.lineTo(corners[3].x, corners[3].y);
  }

  ctx.value.closePath();

  // Appliquer le stroke avec la couleur et l'épaisseur extraites
  ctx.value.strokeStyle = colors.color || '#3388ff';
  ctx.value.lineWidth = colors.weight || 2;
  ctx.value.stroke();
};

const reset = () => {
  if (!canvasLayer.value || !map.value) return;

  const topLeft = map.value.containerPointToLayerPoint([0, 0]);
  canvasLayer.value.style.transform = `translate(${topLeft.x}px, ${topLeft.y}px)`;

  draw();
};

const draw = () => {
  if (!map.value || !ctx.value || !sourceCanvas.value) return;

  // Convertir les corners LatLng en points pixel
  const corners = props.corners.map((corner) => {
    const point = map.value!.latLngToContainerPoint([corner.lat, corner.lng]);
    return { x: point.x, y: point.y };
  });

  drawWarpedGrid(corners);

  // Dessiner le contour si en mode édition ou draggable
  if (props.editable || props.draggable) {
    drawOutline(corners);
  }
};

const handleClick = () => {
  if (!isDragging.value) {
    emit('click');
  }
};

const registerWithSelection = () => {
  if (!props.selectable || !selectionContext) return;

  const feature: FeatureReference = {
    id: canvasId.value,
    type: 'polygon',
    getBounds: () => {
      if (!L.value) return null;
      const latlngs = props.corners.map((c) => L.value!.latLng(c.lat, c.lng));
      return L.value!.latLngBounds(latlngs);
    },
    applyTransform: () => {
      // Transformation non supportée pour canvas
    },
  };
  selectionContext.registerFeature(feature);
};

let isUpdating = false;

// Watch principal
watch(
  () =>
    [L.value, map.value, props.corners, props.editable, props.draggable, props.selectable] as const,
  async ([newL, newMap, newCorners, newEditable, newDraggable, newSelectable], oldVal) => {
    if (isUpdating) return;
    isUpdating = true;

    try {
      await nextTick();

      if (newL && newMap && newCorners && newCorners.length === 4) {
        // Créer le source canvas si nécessaire
        createSourceCanvas();

        const isInitialCreation = !canvasLayer.value;

        if (canvasLayer.value) {
          // Le canvas existe, mettre à jour
          draw();
        } else {
          // Créer le canvas layer
          canvasLayer.value = document.createElement('canvas');
          const size = newMap.getSize();
          canvasLayer.value.width = size.x;
          canvasLayer.value.height = size.y;
          canvasLayer.value.style.position = 'absolute';
          canvasLayer.value.style.pointerEvents = 'auto';
          canvasLayer.value.className = 'leaflet-canvas-layer';

          ctx.value = canvasLayer.value.getContext('2d');

          const leafletPane = newMap.getPanes().overlayPane;
          leafletPane.appendChild(canvasLayer.value);

          // Event handlers
          canvasLayer.value.addEventListener('click', handleClick);

          newMap.on('moveend', reset);
          newMap.on('zoom', reset);
          newMap.on('viewreset', reset);

          // Register with selection
          if (newSelectable && selectionContext) {
            registerWithSelection();

            canvasLayer.value.addEventListener('click', () => {
              selectionContext.selectFeature('polygon', canvasId.value);
              emit('click');
            });
          }

          // Dessiner
          reset();
        }

        // Gestion des modes : draggable OU editable, pas les deux
        // Ne mettre à jour que si les modes ont changé ou si c'est la création initiale
        if (
          isInitialCreation ||
          (oldVal && (oldVal[3] !== newEditable || oldVal[4] !== newDraggable))
        ) {
          if (newDraggable && !newEditable) {
            clearEditMarkers();
            enableDragging();
          } else if (newEditable && !newDraggable) {
            disableDragging();
            enableEditing();
          } else {
            clearEditMarkers();
            disableDragging();
          }
        }
      } else {
        if (canvasLayer.value) {
          canvasLayer.value.remove();
          canvasLayer.value = null;
        }
        clearEditMarkers();
      }
    } finally {
      isUpdating = false;
    }
  },
  { immediate: true, deep: true, flush: 'post' }
);

onBeforeUnmount(() => {
  clearEditMarkers();

  if (canvasLayer.value) {
    canvasLayer.value.removeEventListener('click', handleClick);
    canvasLayer.value.remove();
  }

  if (map.value) {
    map.value.off('moveend', reset);
    map.value.off('zoom', reset);
    map.value.off('viewreset', reset);
  }

  if (selectionContext) {
    selectionContext.unregisterFeature(canvasId.value);
  }
});

defineExpose({
  sourceCanvas,
  redraw: () => {
    if (canvasLayer.value && sourceCanvas.value) {
      draw();
    }
  },
});
</script>

<template>
  <slot />
</template>
