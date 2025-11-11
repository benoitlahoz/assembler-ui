<script setup lang="ts">
import { inject, watch, ref, type Ref, onBeforeUnmount } from 'vue';
import { LeafletMapKey, LeafletModuleKey } from '.';

export interface LeafletBoundingBoxProps {
  bounds?: L.LatLngBounds | null;
  visible?: boolean;
}

const props = withDefaults(defineProps<LeafletBoundingBoxProps>(), {
  bounds: null,
  visible: false,
});

const emit = defineEmits<{
  'update:bounds': [bounds: L.LatLngBounds];
  rotate: [angle: number];
  'rotate-end': [];
  scale: [scaleX: number, scaleY: number];
}>();

const L = inject(LeafletModuleKey, ref());
const map = inject<Ref<L.Map | null>>(LeafletMapKey, ref(null));

const boundingBox = ref<L.Rectangle | null>(null);
const cornerHandles = ref<L.Marker[]>([]);
const edgeHandles = ref<L.Marker[]>([]);
const rotateHandle = ref<L.Marker | null>(null);
const centerHandle = ref<L.Marker | null>(null);

const isDragging = ref(false);
const isRotating = ref(false);
const isScaling = ref(false);

let dragStartBounds: L.LatLngBounds | null = null;
let dragStartMousePoint: L.Point | null = null;
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
  console.log('createBoundingBox called, props:', props);
  if (!props.bounds || !L.value || !map.value || !props.visible) {
    console.log('Bailing out:', {
      bounds: !!props.bounds,
      L: !!L.value,
      map: !!map.value,
      visible: props.visible,
    });
    clearHandles();
    return;
  }

  clearHandles();

  // Créer le rectangle de bounding box
  boundingBox.value = L.value
    .rectangle(props.bounds, {
      color: '#3388ff',
      weight: 2,
      fill: false,
      dashArray: '5, 5',
      interactive: false,
    })
    .addTo(map.value);

  // Créer les handles aux coins (pour scale)
  const corners = [
    props.bounds.getSouthWest(), // 0: bas-gauche
    props.bounds.getNorthWest(), // 1: haut-gauche
    props.bounds.getNorthEast(), // 2: haut-droit
    props.bounds.getSouthEast(), // 3: bas-droit
  ];

  // Curseurs pour chaque coin (pour resize diagonal)
  const cornerCursors = ['nwse-resize', 'nesw-resize', 'nwse-resize', 'nesw-resize'];

  corners.forEach((corner, index) => {
    const handle = L.value!.marker(corner, {
      draggable: true,
      icon: L.value!.divIcon({
        className: 'leaflet-bounding-box-handle leaflet-bounding-box-corner',
        html: '<div style="width:8px;height:8px;background:#fff;border:2px solid #3388ff;border-radius:2px;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [8, 8],
      }),
    }).addTo(map.value!);

    handle.on('mousedown', () => {
      if (map.value && cornerCursors[index]) {
        map.value.getContainer().style.cursor = cornerCursors[index];
      }
    });

    handle.on('dragstart', () => {
      isScaling.value = true;
      scaleStartBounds = props.bounds;
      scaleCornerIndex = index;
      if (map.value) {
        map.value.dragging.disable();
      }
    });

    handle.on('drag', () => {
      if (!isScaling.value || !scaleStartBounds) return;

      const newCorner = handle.getLatLng();
      let newBounds: L.LatLngBounds;

      // Calculer les nouvelles bornes en fonction du coin déplacé
      switch (index) {
        case 0: // Sud-Ouest
          newBounds = L.value!.latLngBounds(newCorner, scaleStartBounds.getNorthEast());
          break;
        case 1: // Nord-Ouest
          newBounds = L.value!.latLngBounds(
            [scaleStartBounds.getSouth(), newCorner.lng],
            [newCorner.lat, scaleStartBounds.getEast()]
          );
          break;
        case 2: // Nord-Est
          newBounds = L.value!.latLngBounds(scaleStartBounds.getSouthWest(), newCorner);
          break;
        case 3: // Sud-Est
          newBounds = L.value!.latLngBounds(
            [newCorner.lat, scaleStartBounds.getWest()],
            [scaleStartBounds.getNorth(), newCorner.lng]
          );
          break;
        default:
          return;
      }

      // Mettre à jour la bounding box
      if (boundingBox.value) {
        boundingBox.value.setBounds(newBounds);
      }

      // Mettre à jour les positions des handles
      updateHandlePositions(newBounds);

      // Émettre en temps réel pendant le drag
      emit('update:bounds', newBounds);
    });

    handle.on('dragend', () => {
      isScaling.value = false;
      if (map.value) {
        map.value.getContainer().style.cursor = '';
        map.value.dragging.enable();
      }
      if (boundingBox.value) {
        emit('update:bounds', boundingBox.value.getBounds());
      }
    });

    cornerHandles.value.push(handle);
  });

  // Créer les handles sur les bords (pour scale uniaxial)
  const edges = [
    // Milieu de chaque côté
    L.value!.latLng(
      (props.bounds.getSouth() + props.bounds.getNorth()) / 2,
      props.bounds.getWest()
    ), // 0: gauche
    L.value!.latLng(props.bounds.getNorth(), (props.bounds.getWest() + props.bounds.getEast()) / 2), // 1: haut
    L.value!.latLng(
      (props.bounds.getSouth() + props.bounds.getNorth()) / 2,
      props.bounds.getEast()
    ), // 2: droite
    L.value!.latLng(props.bounds.getSouth(), (props.bounds.getWest() + props.bounds.getEast()) / 2), // 3: bas
  ];

  const edgeCursors = ['ew-resize', 'ns-resize', 'ew-resize', 'ns-resize'];

  edges.forEach((edge, index) => {
    const handle = L.value!.marker(edge, {
      draggable: true,
      icon: L.value!.divIcon({
        className: 'leaflet-bounding-box-handle leaflet-bounding-box-edge',
        html: '<div style="width:8px;height:8px;background:#fff;border:2px solid #3388ff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [8, 8],
      }),
    }).addTo(map.value!);

    handle.on('mousedown', () => {
      if (map.value && edgeCursors[index]) {
        map.value.getContainer().style.cursor = edgeCursors[index];
      }
    });

    handle.on('dragstart', () => {
      isScaling.value = true;
      scaleStartBounds = props.bounds;
      if (map.value) {
        map.value.dragging.disable();
      }
    });

    handle.on('drag', () => {
      if (!isScaling.value || !scaleStartBounds) return;

      const newPos = handle.getLatLng();
      let newBounds: L.LatLngBounds = scaleStartBounds;

      // Scale selon le bord déplacé
      switch (index) {
        case 0: // Gauche
          newBounds = L.value!.latLngBounds(
            [scaleStartBounds.getSouth(), newPos.lng],
            [scaleStartBounds.getNorth(), scaleStartBounds.getEast()]
          );
          break;
        case 1: // Haut
          newBounds = L.value!.latLngBounds(
            [scaleStartBounds.getSouth(), scaleStartBounds.getWest()],
            [newPos.lat, scaleStartBounds.getEast()]
          );
          break;
        case 2: // Droite
          newBounds = L.value!.latLngBounds(
            [scaleStartBounds.getSouth(), scaleStartBounds.getWest()],
            [scaleStartBounds.getNorth(), newPos.lng]
          );
          break;
        case 3: // Bas
          newBounds = L.value!.latLngBounds(
            [newPos.lat, scaleStartBounds.getWest()],
            [scaleStartBounds.getNorth(), scaleStartBounds.getEast()]
          );
          break;
      }

      // Mettre à jour la bounding box
      if (boundingBox.value) {
        boundingBox.value.setBounds(newBounds);
      }

      // Mettre à jour les positions des handles
      updateHandlePositions(newBounds);

      // Émettre en temps réel pendant le drag
      emit('update:bounds', newBounds);
    });

    handle.on('dragend', () => {
      isScaling.value = false;
      if (map.value) {
        map.value.getContainer().style.cursor = '';
        map.value.dragging.enable();
      }
      if (boundingBox.value) {
        emit('update:bounds', boundingBox.value.getBounds());
      }
    });

    edgeHandles.value.push(handle);
  });

  // Créer le handle de rotation (au-dessus du centre haut)
  const centerTop = L.value!.latLng(
    props.bounds.getNorth(),
    (props.bounds.getWest() + props.bounds.getEast()) / 2
  );

  // Calculer la position du handle de rotation (20px au-dessus en pixels)
  const centerTopPoint = map.value.latLngToLayerPoint(centerTop);
  const rotateHandlePoint = L.value!.point(centerTopPoint.x, centerTopPoint.y - 30);
  const rotateHandleLatLng = map.value.layerPointToLatLng(rotateHandlePoint);

  rotateHandle.value = L.value
    .marker(rotateHandleLatLng, {
      draggable: true,
      icon: L.value.divIcon({
        className: 'leaflet-bounding-box-handle leaflet-bounding-box-rotate',
        html: '<div style="width:12px;height:12px;background:#fff;border:2px solid #3388ff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [12, 12],
      }),
    })
    .addTo(map.value);

  console.log('Rotate handle created:', rotateHandle.value);

  rotateHandle.value.on('mousedown', () => {
    console.log('Rotate handle mousedown');
    if (map.value) {
      map.value.getContainer().style.cursor = 'grabbing';
    }
  });

  rotateHandle.value.on('dragstart', () => {
    console.log('Rotate handle dragstart');
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
  });

  rotateHandle.value.on('drag', () => {
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

    console.log('Emitting rotate event:', rotationAngle);

    // Émettre l'événement de rotation en temps réel
    emit('rotate', rotationAngle);
  });

  rotateHandle.value.on('dragend', () => {
    console.log('Rotate handle dragend');
    isRotating.value = false;
    if (map.value) {
      map.value.getContainer().style.cursor = '';
      map.value.dragging.enable();
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
  });

  rotateHandle.value.on('mouseup', () => {
    if (map.value) {
      map.value.getContainer().style.cursor = '';
    }
  });

  // Créer le handle central orange (non draggable, juste pour visualisation)
  const center = props.bounds.getCenter();
  centerHandle.value = L.value
    .marker(center, {
      draggable: false,
      icon: L.value.divIcon({
        className: 'leaflet-bounding-box-handle leaflet-bounding-box-center',
        html: '<div style="width:12px;height:12px;background:#ff8800;border:2px solid #fff;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [12, 12],
      }),
    })
    .addTo(map.value);

  console.log('Center handle created:', centerHandle.value);
};

const updateHandlePositions = (bounds: L.LatLngBounds) => {
  if (!L.value || !map.value) return;

  // Mettre à jour les coins
  const corners = [
    bounds.getSouthWest(),
    bounds.getNorthWest(),
    bounds.getNorthEast(),
    bounds.getSouthEast(),
  ];
  cornerHandles.value.forEach((handle, i) => {
    if (corners[i]) handle.setLatLng(corners[i]);
  });

  // Mettre à jour les bords
  const edges = [
    L.value.latLng((bounds.getSouth() + bounds.getNorth()) / 2, bounds.getWest()),
    L.value.latLng(bounds.getNorth(), (bounds.getWest() + bounds.getEast()) / 2),
    L.value.latLng((bounds.getSouth() + bounds.getNorth()) / 2, bounds.getEast()),
    L.value.latLng(bounds.getSouth(), (bounds.getWest() + bounds.getEast()) / 2),
  ];
  edgeHandles.value.forEach((handle, i) => {
    if (edges[i]) handle.setLatLng(edges[i]);
  });

  // Mettre à jour le handle de rotation
  if (rotateHandle.value) {
    const centerTop = L.value.latLng(bounds.getNorth(), (bounds.getWest() + bounds.getEast()) / 2);
    const centerTopPoint = map.value.latLngToLayerPoint(centerTop);
    const rotateHandlePoint = L.value.point(centerTopPoint.x, centerTopPoint.y - 30);
    const rotateHandleLatLng = map.value.layerPointToLatLng(rotateHandlePoint);
    rotateHandle.value.setLatLng(rotateHandleLatLng);
  }

  // Mettre à jour le handle central
  if (centerHandle.value) {
    const center = bounds.getCenter();
    centerHandle.value.setLatLng(center);
  }
};

watch(
  () => {
    // Créer une représentation sérialisable des bounds pour détecter les changements
    if (props.bounds) {
      return {
        visible: props.visible,
        south: props.bounds.getSouth(),
        north: props.bounds.getNorth(),
        west: props.bounds.getWest(),
        east: props.bounds.getEast(),
      };
    }
    return { visible: props.visible, south: 0, north: 0, west: 0, east: 0 };
  },
  (newVal, oldVal) => {
    // Si on manipule la bounding box (rotation, scale), ne pas recréer
    if (isRotating.value || isScaling.value) {
      console.log('Skipping createBoundingBox because manipulation in progress');
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

    // Si la bounding box existe déjà et qu'on ne manipule pas, juste mettre à jour visuellement
    if (
      boundingBox.value &&
      props.bounds &&
      props.visible &&
      !isDragging.value &&
      cornerHandles.value.length > 0 &&
      boundsChanged
    ) {
      console.log('Updating bounding box visually', newVal);
      boundingBox.value.setBounds(props.bounds);
      updateHandlePositions(props.bounds);
    } else if (newVal.visible !== oldVal?.visible || !boundingBox.value) {
      // Sinon recréer complètement si visibility change ou pas encore créé
      console.log('Recreating bounding box');
      createBoundingBox();
    }
  },
  { immediate: true, deep: true }
);

onBeforeUnmount(() => {
  clearHandles();
});
</script>

<template><slot /></template>
