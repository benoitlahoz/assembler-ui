<script setup lang="ts">
import { inject, watch, ref, type Ref, onBeforeUnmount, provide } from 'vue';
import { useLeaflet } from '~~/registry/new-york/composables/use-leaflet/useLeaflet';
import {
  LeafletStylesKey,
  LeafletMapKey,
  LeafletModuleKey,
  type LeafletFeatureRectangleStyle,
  type LeafletFeatureHandleStyle,
} from '.';

const {
  constrainToSquare,
  calculateHandlePositions,
  calculateBoundsFromHandle,
  setMapCursor,
  resetMapCursor,
  createStyledMarker,
} = await useLeaflet();

export interface LeafletBoundingBoxStyles {
  rectangle: LeafletFeatureRectangleStyle;
  corner: LeafletFeatureHandleStyle;
  edge: LeafletFeatureHandleStyle;
  rotate: LeafletFeatureHandleStyle;
  center: LeafletFeatureHandleStyle;
}

export interface LeafletBoundingBoxProps {
  bounds?: L.LatLngBounds | null;
  visible?: boolean;
  showRotateHandle?: boolean;
  constrainSquare?: boolean;
}

const props = withDefaults(defineProps<LeafletBoundingBoxProps>(), {
  bounds: null,
  visible: false,
  showRotateHandle: true,
  constrainSquare: false,
});

const emit = defineEmits<{
  'update:bounds': [bounds: L.LatLngBounds];
  rotate: [angle: number];
  'rotate-end': [];
  scale: [scaleX: number, scaleY: number];
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const stylesOptions = ref<LeafletBoundingBoxStyles>({
  rectangle: {
    color: '#3388ff',
    weight: 2,
    fill: false,
    fillColor: undefined,
    dashArray: '5, 5',
    interactive: false,
  },
  corner: {
    className: 'leaflet-feature-handle leaflet-handle-corner',
    html: '<div style="width:8px;height:8px;background:#fff;border:2px solid #3388ff;border-radius:2px;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [8, 8],
  },
  edge: {
    className: 'leaflet-feature-handle leaflet-handle-edge',
    html: '<div style="width:8px;height:8px;background:#fff;border:2px solid #3388ff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [8, 8],
  },
  rotate: {
    className: 'leaflet-feature-handle leaflet-handle-rotate',
    html: '<div style="width:12px;height:12px;background:#fff;border:2px solid #3388ff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [12, 12],
  },
  center: {
    className: 'leaflet-feature-handle leaflet-handle-center',
    html: '<div style="width:12px;height:12px;background:#ff8800;border:2px solid #fff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
    iconSize: [12, 12],
  },
});

provide(LeafletStylesKey, stylesOptions);

const boundingBox = ref<L.Rectangle | null>(null);
const cornerHandles = ref<L.Marker[]>([]);
const edgeHandles = ref<L.Marker[]>([]);
const rotateHandle = ref<L.Marker | null>(null);
const centerHandle = ref<L.Marker | null>(null);

const isDragging = ref(false);
const isRotating = ref(false);
const isScaling = ref(false);

let scaleStartBounds: L.LatLngBounds | null = null;
let scaleCornerIndex = -1;
let rotationStartAngle = 0;

const clearHandles = () => {
  cornerHandles.value.forEach((h) => h.remove());
  cornerHandles.value = [];
  edgeHandles.value.forEach((h) => h.remove());
  edgeHandles.value = [];
  if (rotateHandle.value) {
    rotateHandle.value.remove();
    rotateHandle.value = null;
  }
  if (centerHandle.value) {
    centerHandle.value.remove();
    centerHandle.value = null;
  }
  if (boundingBox.value) {
    boundingBox.value.remove();
    boundingBox.value = null;
  }
};

const createBoundingBox = () => {
  if (!props.bounds || !L.value || !map.value || !props.visible) {
    clearHandles();
    return;
  }

  clearHandles();

  boundingBox.value = L.value
    .rectangle(props.bounds, stylesOptions.value.rectangle)
    .addTo(map.value);

  // Calculer toutes les positions de handles
  const handlePositions = calculateHandlePositions(props.bounds, map.value, {
    corners: true,
    edges: true,
    rotate: props.showRotateHandle,
    center: true,
    rotateOffsetPx: 30,
  });

  const cornerCursors = ['nesw-resize', 'nwse-resize', 'nesw-resize', 'nwse-resize'];
  const edgeCursors = ['ew-resize', 'ns-resize', 'ew-resize', 'ns-resize'];
  const rotateCursor = 'ew-resize';

  // Créer les handles de coins
  handlePositions.corners?.forEach((corner, index) => {
    const handle = createStyledMarker(
      corner,
      stylesOptions.value.corner,
      { draggable: true },
      map.value!
    );
    if (!handle) return;

    // Définir le curseur sur l'élément du marker
    const handleElement = handle.getElement();
    if (handleElement && cornerCursors[index]) {
      handleElement.style.cursor = cornerCursors[index];
    }

    const onCornerMouseDown = () => {
      if (map.value) setMapCursor(map.value, cornerCursors[index] || '');
    };

    const onCornerDragStart = () => {
      isScaling.value = true;
      scaleStartBounds = props.bounds;
      scaleCornerIndex = index;
      if (map.value) {
        map.value.dragging.disable();
      }
    };

    const onCornerDrag = () => {
      if (!isScaling.value || !scaleStartBounds) return;

      const newCorner = handle.getLatLng();
      let newBounds = calculateBoundsFromHandle('corner', index, newCorner, scaleStartBounds);
      if (!newBounds) return;

      // Constrain to square if needed (for circles)
      if (props.constrainSquare) {
        newBounds = constrainToSquare(newBounds, scaleStartBounds.getCenter(), scaleStartBounds);
      }

      // Mettre à jour la bounding box
      if (boundingBox.value) {
        boundingBox.value.setBounds(newBounds);
      }

      // Mettre à jour les positions des handles
      updateHandlePositions(newBounds);

      // Émettre en temps réel pendant le drag
      emit('update:bounds', newBounds);
    };

    const onCornerDragEnd = () => {
      isScaling.value = false;
      if (map.value) {
        resetMapCursor(map.value);
        map.value.dragging.enable();
      }
      if (boundingBox.value) {
        emit('update:bounds', boundingBox.value.getBounds());
      }
    };

    handle.on('mousedown', onCornerMouseDown);
    handle.on('dragstart', onCornerDragStart);
    handle.on('drag', onCornerDrag);
    handle.on('dragend', onCornerDragEnd);

    cornerHandles.value.push(handle);
  });

  // Créer les handles sur les bords (pour scale uniaxial)
  handlePositions.edges?.forEach((edge, index) => {
    const handle = createStyledMarker(
      edge,
      stylesOptions.value.edge,
      { draggable: true },
      map.value!
    );
    if (!handle) return;

    // Définir le curseur sur l'élément du marker
    const handleElement = handle.getElement();
    if (handleElement && edgeCursors[index]) {
      handleElement.style.cursor = edgeCursors[index];
    }

    const onEdgeMouseDown = () => {
      if (map.value) setMapCursor(map.value, edgeCursors[index] || '');
    };

    const onEdgeDragStart = () => {
      isScaling.value = true;
      scaleStartBounds = props.bounds;
      if (map.value) {
        map.value.dragging.disable();
      }
    };

    const onEdgeDrag = () => {
      if (!isScaling.value || !scaleStartBounds) return;

      const newPos = handle.getLatLng();
      let newBounds = calculateBoundsFromHandle('edge', index, newPos, scaleStartBounds);
      if (!newBounds) return;

      // Constrain to square if needed (for circles)
      if (props.constrainSquare) {
        newBounds = constrainToSquare(newBounds, scaleStartBounds.getCenter(), scaleStartBounds);
      }

      // Mettre à jour la bounding box
      if (boundingBox.value) {
        boundingBox.value.setBounds(newBounds);
      }

      // Mettre à jour les positions des handles
      updateHandlePositions(newBounds);

      // Émettre en temps réel pendant le drag
      emit('update:bounds', newBounds);
    };

    const onEdgeDragEnd = () => {
      isScaling.value = false;
      if (map.value) {
        resetMapCursor(map.value);
        map.value.dragging.enable();
      }
      if (boundingBox.value) {
        emit('update:bounds', boundingBox.value.getBounds());
      }
    };

    handle.on('mousedown', onEdgeMouseDown);
    handle.on('dragstart', onEdgeDragStart);
    handle.on('drag', onEdgeDrag);
    handle.on('dragend', onEdgeDragEnd);

    edgeHandles.value.push(handle);
  });

  // Créer le handle de rotation (au-dessus du centre haut) seulement si activé
  if (props.showRotateHandle && handlePositions.rotate) {
    rotateHandle.value = createStyledMarker(
      handlePositions.rotate,
      stylesOptions.value.rotate,
      { draggable: true },
      map.value
    );

    if (!rotateHandle.value) return;

    // Définir le curseur sur l'élément du marker
    const handleElement = rotateHandle.value.getElement();
    if (handleElement) {
      handleElement.style.cursor = rotateCursor;
    }

    const onRotateMouseDown = () => {
      if (map.value) setMapCursor(map.value, rotateCursor);
      // Changer le curseur du handle aussi
      const handleElement = rotateHandle.value?.getElement();
      if (handleElement) {
        handleElement.style.cursor = rotateCursor;
      }
    };

    const onRotateDragStart = () => {
      isRotating.value = true;
      if (map.value && props.bounds) {
        map.value.dragging.disable();

        // Cacher la bounding box et les handles pendant la rotation
        if (boundingBox.value) boundingBox.value.setStyle({ opacity: 0 });
        cornerHandles.value.forEach((h) => h.setOpacity(0));
        edgeHandles.value.forEach((h) => h.setOpacity(0));

        // Calculer l'angle initial
        const center = props.bounds.getCenter();
        const handlePos = rotateHandle.value!.getLatLng();
        const dx = handlePos.lng - center.lng;
        const dy = handlePos.lat - center.lat;
        rotationStartAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      }
    };

    const onRotateDrag = () => {
      if (!isRotating.value || !props.bounds) return;

      // Calcul de l'angle de rotation
      const center = props.bounds.getCenter();
      const handlePos = rotateHandle.value!.getLatLng();

      // Calculer l'angle actuel entre le centre et le handle
      const dx = handlePos.lng - center.lng;
      const dy = handlePos.lat - center.lat;
      const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

      // Calculer la rotation relative
      const rotationAngle = currentAngle - rotationStartAngle;

      // Émettre l'événement de rotation en temps réel
      emit('rotate', rotationAngle);
    };

    const onRotateDragEnd = () => {
      isRotating.value = false;
      if (map.value) {
        resetMapCursor(map.value);
        map.value.dragging.enable();
      }

      // Restaurer le curseur grab sur le handle
      const handleElement = rotateHandle.value?.getElement();
      if (handleElement) {
        handleElement.style.cursor = 'grab';
      }

      // Réafficher la bounding box et les handles
      if (boundingBox.value) boundingBox.value.setStyle({ opacity: 1 });
      cornerHandles.value.forEach((h) => h.setOpacity(1));
      edgeHandles.value.forEach((h) => h.setOpacity(1));

      // Émettre l'événement de fin de rotation
      emit('rotate-end');

      // Forcer la recréation de la bounding box après la rotation
      setTimeout(() => {
        if (props.bounds) {
          createBoundingBox();
        }
      }, 0);
    };

    const onRotateMouseUp = () => {
      resetMapCursor(map.value);
    };

    rotateHandle.value.on('mousedown', onRotateMouseDown);
    rotateHandle.value.on('dragstart', onRotateDragStart);
    rotateHandle.value.on('drag', onRotateDrag);
    rotateHandle.value.on('dragend', onRotateDragEnd);
    rotateHandle.value.on('mouseup', onRotateMouseUp);
  }

  // Créer le handle central orange (non draggable, juste pour visualisation)
  if (handlePositions.center) {
    centerHandle.value = createStyledMarker(
      handlePositions.center,
      stylesOptions.value.center,
      { draggable: false },
      map.value
    );
  }
};

const updateHandlePositions = (bounds: L.LatLngBounds) => {
  if (!L.value || !map.value) return;

  // Calculer toutes les nouvelles positions
  const handlePositions = calculateHandlePositions(bounds, map.value, {
    corners: true,
    edges: true,
    rotate: props.showRotateHandle,
    center: true,
    rotateOffsetPx: 30,
  });

  // Mettre à jour les coins
  handlePositions.corners?.forEach((corner, i) => {
    if (cornerHandles.value[i]) cornerHandles.value[i].setLatLng(corner);
  });

  // Mettre à jour les bords
  handlePositions.edges?.forEach((edge, i) => {
    if (edgeHandles.value[i]) edgeHandles.value[i].setLatLng(edge);
  });

  // Mettre à jour le handle de rotation
  if (rotateHandle.value && handlePositions.rotate) {
    rotateHandle.value.setLatLng(handlePositions.rotate);
  }

  // Mettre à jour le handle central
  if (centerHandle.value && handlePositions.center) {
    centerHandle.value.setLatLng(handlePositions.center);
  }
};

watch(
  () => {
    // Créer une représentation sérialisable des bounds pour détecter les changements
    if (props.bounds) {
      return {
        visible: props.visible,
        showRotateHandle: props.showRotateHandle,
        south: props.bounds.getSouth(),
        north: props.bounds.getNorth(),
        west: props.bounds.getWest(),
        east: props.bounds.getEast(),
      };
    }
    return {
      visible: props.visible,
      showRotateHandle: props.showRotateHandle,
      south: 0,
      north: 0,
      west: 0,
      east: 0,
    };
  },
  (newVal, oldVal) => {
    // Si on manipule la bounding box (rotation, scale), ne pas recréer
    if (isRotating.value || isScaling.value) {
      return;
    }

    // Vérifier si les bounds ont vraiment changé
    const boundsChanged =
      oldVal &&
      newVal &&
      (oldVal.south !== newVal.south ||
        oldVal.north !== newVal.north ||
        oldVal.west !== newVal.west ||
        oldVal.east !== newVal.east);

    // Vérifier si showRotateHandle a changé
    const showRotateHandleChanged =
      oldVal && newVal && oldVal.showRotateHandle !== newVal.showRotateHandle;

    // Si la bounding box existe déjà et qu'on ne manipule pas, juste mettre à jour visuellement
    if (
      boundingBox.value &&
      props.bounds &&
      props.visible &&
      !isDragging.value &&
      cornerHandles.value.length > 0 &&
      boundsChanged &&
      !showRotateHandleChanged
    ) {
      boundingBox.value.setBounds(props.bounds);
      updateHandlePositions(props.bounds);
    } else if (
      newVal.visible !== oldVal?.visible ||
      !boundingBox.value ||
      showRotateHandleChanged
    ) {
      // Sinon recréer complètement si visibility change, pas encore créé, ou showRotateHandle a changé
      createBoundingBox();
    }
  },
  { immediate: true, deep: true }
);

onBeforeUnmount(() => {
  clearHandles();
});
</script>

<template>
  <div data-slot="leaflet-bounding-box"><slot /></div>
</template>
