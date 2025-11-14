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
import { useColors } from '~~/registry/new-york/composables/use-colors/useColors';
import { useLeaflet } from '../../composables/use-leaflet/useLeaflet';
import {
  LeafletMapKey,
  LeafletModuleKey,
  LeafletSelectionKey,
  LeafletStylesKey,
  type LeafletCanvasStyles,
} from '.';
import type { FeatureReference } from './LeafletFeaturesSelector.vue';
import './leaflet-editing.css';

const { LatDegreesMeters, lngDegreesToRadius } = await useLeaflet();

export interface LeafletCanvasGLProps {
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

const props = withDefaults(defineProps<LeafletCanvasGLProps>(), {
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
const { parseColor: parseColorUtil } = useColors();

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
const gl = ref<WebGLRenderingContext | null>(null);
const editMarkers = ref<L.Marker[]>([]);
const canvasId = ref<string | number>(props.id ?? `canvas-${Date.now()}-${Math.random()}`);
const isDragging = ref(false);

let dragStartCorners: Array<{ lat: number; lng: number }> = [];
let dragStartMousePoint: L.Point | null = null;
let texture: WebGLTexture | null = null;
let program: WebGLProgram | null = null;
let positionBuffer: WebGLBuffer | null = null;
let texCoordBuffer: WebGLBuffer | null = null;

const isPointInPolygon = (
  point: { x: number; y: number },
  polygon: Array<{ x: number; y: number }>
) => {
  if (polygon.length < 3) {
    return false;
  }

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = polygon[i];
    const pj = polygon[j];
    if (!pi || !pj) continue;

    const intersects =
      pi.y > point.y !== pj.y > point.y &&
      point.x < ((pj.x - pi.x) * (point.y - pi.y)) / (pj.y - pi.y || 1e-6) + pi.x;

    if (intersects) inside = !inside;
  }

  return inside;
};

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

    const containerPoint = map.value.mouseEventToContainerPoint(e as any);
    const corners = props.corners.map((corner) => {
      const point = map.value!.latLngToContainerPoint([corner.lat, corner.lng]);
      return { x: point.x, y: point.y };
    });

    if (!isPointInPolygon({ x: containerPoint.x, y: containerPoint.y }, corners)) {
      return;
    }

    L.value.DomEvent.stopPropagation(e as any);

    // Sélectionner la feature avant de commencer le drag pour afficher la bounding box
    if (props.selectable && selectionContext) {
      selectionContext.selectFeature('polygon', canvasId.value);
    }

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

// Initialiser WebGL
const initWebGL = () => {
  if (!canvasLayer.value) return false;

  gl.value = canvasLayer.value.getContext('webgl', {
    premultipliedAlpha: false,
    alpha: true,
  });

  if (!gl.value) {
    console.error('WebGL not supported');
    return false;
  }

  // Vertex shader - transformation perspective avec 4 coins
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    uniform vec2 u_resolution;
    
    void main() {
      vec2 clipSpace = ((a_position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
      gl_Position = vec4(clipSpace, 0, 1);
      v_texCoord = a_texCoord;
    }
  `;

  // Fragment shader
  const fragmentShaderSource = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform sampler2D u_texture;
    uniform float u_opacity;
    
    void main() {
      vec4 texColor = texture2D(u_texture, v_texCoord);
      gl_FragColor = vec4(texColor.rgb, texColor.a * u_opacity);
    }
  `;

  // Compiler les shaders
  const vertexShader = gl.value.createShader(gl.value.VERTEX_SHADER)!;
  gl.value.shaderSource(vertexShader, vertexShaderSource);
  gl.value.compileShader(vertexShader);

  const fragmentShader = gl.value.createShader(gl.value.FRAGMENT_SHADER)!;
  gl.value.shaderSource(fragmentShader, fragmentShaderSource);
  gl.value.compileShader(fragmentShader);

  // Créer le programme
  program = gl.value.createProgram()!;
  gl.value.attachShader(program, vertexShader);
  gl.value.attachShader(program, fragmentShader);
  gl.value.linkProgram(program);
  gl.value.useProgram(program);

  // Créer les buffers
  positionBuffer = gl.value.createBuffer();
  texCoordBuffer = gl.value.createBuffer();

  // Créer la texture
  texture = gl.value.createTexture();
  gl.value.bindTexture(gl.value.TEXTURE_2D, texture);
  gl.value.texParameteri(gl.value.TEXTURE_2D, gl.value.TEXTURE_WRAP_S, gl.value.CLAMP_TO_EDGE);
  gl.value.texParameteri(gl.value.TEXTURE_2D, gl.value.TEXTURE_WRAP_T, gl.value.CLAMP_TO_EDGE);
  gl.value.texParameteri(gl.value.TEXTURE_2D, gl.value.TEXTURE_MIN_FILTER, gl.value.LINEAR);
  gl.value.texParameteri(gl.value.TEXTURE_2D, gl.value.TEXTURE_MAG_FILTER, gl.value.LINEAR);

  // Enable blending pour l'opacité
  gl.value.enable(gl.value.BLEND);
  gl.value.blendFunc(gl.value.SRC_ALPHA, gl.value.ONE_MINUS_SRC_ALPHA);

  return true;
};

// Mettre à jour la texture WebGL depuis le canvas source
const updateTexture = () => {
  if (!gl.value || !texture || !sourceCanvas.value) return;

  gl.value.bindTexture(gl.value.TEXTURE_2D, texture);
  gl.value.texImage2D(
    gl.value.TEXTURE_2D,
    0,
    gl.value.RGBA,
    gl.value.RGBA,
    gl.value.UNSIGNED_BYTE,
    sourceCanvas.value
  );
};

// Dessiner avec WebGL
const drawWarpedGrid = (corners: Array<{ x: number; y: number }>) => {
  if (!gl.value || !program || !canvasLayer.value || !sourceCanvas.value) return;

  const subs = props.subdivisions;

  // Clear
  gl.value.viewport(0, 0, canvasLayer.value.width, canvasLayer.value.height);
  gl.value.clearColor(0, 0, 0, 0);
  gl.value.clear(gl.value.COLOR_BUFFER_BIT);

  // Mettre à jour la texture
  updateTexture();

  // Set uniforms
  const resolutionLocation = gl.value.getUniformLocation(program, 'u_resolution');
  gl.value.uniform2f(resolutionLocation, canvasLayer.value.width, canvasLayer.value.height);

  const opacityLocation = gl.value.getUniformLocation(program, 'u_opacity');
  gl.value.uniform1f(opacityLocation, props.opacity);

  // Générer la grille de triangles
  const positions: number[] = [];
  const texCoords: number[] = [];

  for (let i = 0; i < subs; i++) {
    for (let j = 0; j < subs; j++) {
      const u0 = i / subs;
      const v0 = j / subs;
      const u1 = (i + 1) / subs;
      const v1 = (j + 1) / subs;

      // 4 coins du quad
      const p0 = bilinearInterp(corners, u0, v0);
      const p1 = bilinearInterp(corners, u1, v0);
      const p2 = bilinearInterp(corners, u1, v1);
      const p3 = bilinearInterp(corners, u0, v1);

      // Premier triangle (0, 1, 2)
      positions.push(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
      texCoords.push(u0, v0, u1, v0, u1, v1);

      // Deuxième triangle (0, 2, 3)
      positions.push(p0.x, p0.y, p2.x, p2.y, p3.x, p3.y);
      texCoords.push(u0, v0, u1, v1, u0, v1);
    }
  }

  // Upload position data
  const positionLocation = gl.value.getAttribLocation(program, 'a_position');
  gl.value.bindBuffer(gl.value.ARRAY_BUFFER, positionBuffer);
  gl.value.bufferData(gl.value.ARRAY_BUFFER, new Float32Array(positions), gl.value.STATIC_DRAW);
  gl.value.enableVertexAttribArray(positionLocation);
  gl.value.vertexAttribPointer(positionLocation, 2, gl.value.FLOAT, false, 0, 0);

  // Upload texture coordinate data
  const texCoordLocation = gl.value.getAttribLocation(program, 'a_texCoord');
  gl.value.bindBuffer(gl.value.ARRAY_BUFFER, texCoordBuffer);
  gl.value.bufferData(gl.value.ARRAY_BUFFER, new Float32Array(texCoords), gl.value.STATIC_DRAW);
  gl.value.enableVertexAttribArray(texCoordLocation);
  gl.value.vertexAttribPointer(texCoordLocation, 2, gl.value.FLOAT, false, 0, 0);

  // Draw
  gl.value.drawArrays(gl.value.TRIANGLES, 0, positions.length / 2);
};

const drawOutline = (corners: Array<{ x: number; y: number }>) => {
  if (!gl.value || !canvasLayer.value || !program) return;

  // Extraire les couleurs des classes CSS
  const colors = getLeafletShapeColors(props.class);

  // Utiliser le parseur de couleur du composable
  const rgb = parseColorUtil(colors.color || '#3388ff');

  // Créer un programme simple pour dessiner des lignes épaisses (via rectangles)
  const lineVertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    
    void main() {
      vec2 clipSpace = ((a_position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
      gl_Position = vec4(clipSpace, 0, 1);
    }
  `;

  const lineFragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    
    void main() {
      gl_FragColor = u_color;
    }
  `;

  // Compiler le programme de lignes
  const lineVertexShader = gl.value.createShader(gl.value.VERTEX_SHADER)!;
  gl.value.shaderSource(lineVertexShader, lineVertexShaderSource);
  gl.value.compileShader(lineVertexShader);

  const lineFragmentShader = gl.value.createShader(gl.value.FRAGMENT_SHADER)!;
  gl.value.shaderSource(lineFragmentShader, lineFragmentShaderSource);
  gl.value.compileShader(lineFragmentShader);

  const lineProgram = gl.value.createProgram()!;
  gl.value.attachShader(lineProgram, lineVertexShader);
  gl.value.attachShader(lineProgram, lineFragmentShader);
  gl.value.linkProgram(lineProgram);
  gl.value.useProgram(lineProgram);

  // Utiliser le weight depuis les classes CSS
  const lineWidth = colors.weight || 2;
  const linePositions: number[] = [];

  // Fonction pour créer un rectangle épais entre deux points
  const addThickLine = (x1: number, y1: number, x2: number, y2: number, width: number) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;
    const hw = width / 2;

    // Triangle 1
    linePositions.push(
      x1 + nx * hw,
      y1 + ny * hw,
      x1 - nx * hw,
      y1 - ny * hw,
      x2 - nx * hw,
      y2 - ny * hw
    );

    // Triangle 2
    linePositions.push(
      x1 + nx * hw,
      y1 + ny * hw,
      x2 - nx * hw,
      y2 - ny * hw,
      x2 + nx * hw,
      y2 + ny * hw
    );
  };

  // Dessiner chaque segment
  for (let i = 0; i < corners.length; i++) {
    const current = corners[i];
    const next = corners[(i + 1) % corners.length];
    if (current && next) {
      addThickLine(current.x, current.y, next.x, next.y, lineWidth);
    }
  }

  // Upload position data
  const linePositionLocation = gl.value.getAttribLocation(lineProgram, 'a_position');
  const lineBuffer = gl.value.createBuffer();
  gl.value.bindBuffer(gl.value.ARRAY_BUFFER, lineBuffer);
  gl.value.bufferData(gl.value.ARRAY_BUFFER, new Float32Array(linePositions), gl.value.STATIC_DRAW);
  gl.value.enableVertexAttribArray(linePositionLocation);
  gl.value.vertexAttribPointer(linePositionLocation, 2, gl.value.FLOAT, false, 0, 0);

  // Set uniforms
  const lineResolutionLocation = gl.value.getUniformLocation(lineProgram, 'u_resolution');
  gl.value.uniform2f(lineResolutionLocation, canvasLayer.value.width, canvasLayer.value.height);

  const lineColorLocation = gl.value.getUniformLocation(lineProgram, 'u_color');
  gl.value.uniform4f(lineColorLocation, rgb.r, rgb.g, rgb.b, 1.0);

  // Dessiner les triangles
  gl.value.drawArrays(gl.value.TRIANGLES, 0, linePositions.length / 2);

  // Nettoyer
  gl.value.deleteBuffer(lineBuffer);
  gl.value.deleteShader(lineVertexShader);
  gl.value.deleteShader(lineFragmentShader);
  gl.value.deleteProgram(lineProgram);

  // Remettre le programme principal
  gl.value.useProgram(program);
};

const reset = () => {
  if (!canvasLayer.value || !map.value) return;

  const topLeft = map.value.containerPointToLayerPoint([0, 0]);
  canvasLayer.value.style.transform = `translate(${topLeft.x}px, ${topLeft.y}px)`;

  draw();
};

const draw = () => {
  if (!map.value || !gl.value || !sourceCanvas.value) return;

  // Convertir les corners LatLng en points pixel
  const corners = props.corners.map((corner) => {
    const point = map.value!.latLngToContainerPoint([corner.lat, corner.lng]);
    return { x: point.x, y: point.y };
  });

  drawWarpedGrid(corners);

  // Dessiner le contour seulement en mode édition (pour déformer)
  if (props.editable) {
    drawOutline(corners);
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
    getInitialData: () => {
      return props.corners.map((c) => [c.lat, c.lng] as [number, number]);
    },
    applyTransform: (bounds: L.LatLngBounds) => {
      if (!L.value) return;

      const currentBounds = L.value.latLngBounds(
        props.corners.map((c) => L.value!.latLng(c.lat, c.lng))
      );
      const currentCenter = currentBounds.getCenter();
      const newCenter = bounds.getCenter();

      const scaleX =
        (bounds.getEast() - bounds.getWest()) / (currentBounds.getEast() - currentBounds.getWest());
      const scaleY =
        (bounds.getNorth() - bounds.getSouth()) /
        (currentBounds.getNorth() - currentBounds.getSouth());

      const newCorners = props.corners.map((corner) => {
        const relativeX = (corner.lng - currentCenter.lng) * scaleX;
        const relativeY = (corner.lat - currentCenter.lat) * scaleY;
        return {
          lat: newCenter.lat + relativeY,
          lng: newCenter.lng + relativeX,
        };
      });

      emit('update:corners', newCorners);
    },
    applyRotation: (
      angle: number,
      center: { lat: number; lng: number },
      initialCorners: Array<[number, number]>
    ) => {
      if (!L.value || !initialCorners) return;

      const angleRad = (-angle * Math.PI) / 180;

      const metersPerDegreeLat = LatDegreesMeters;
      const metersPerDegreeLng = lngDegreesToRadius(1, center.lat);

      const newCorners = initialCorners.map((corner) => {
        const lat = corner[0];
        const lng = corner[1];

        const relMetersY = (lat - center.lat) * metersPerDegreeLat;
        const relMetersX = (lng - center.lng) * metersPerDegreeLng;

        const newRelMetersY = relMetersY * Math.cos(angleRad) - relMetersX * Math.sin(angleRad);
        const newRelMetersX = relMetersY * Math.sin(angleRad) + relMetersX * Math.cos(angleRad);

        return {
          lat: center.lat + newRelMetersY / metersPerDegreeLat,
          lng: center.lng + newRelMetersX / metersPerDegreeLng,
        };
      });

      emit('update:corners', newCorners);
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

          // Initialiser WebGL
          if (!initWebGL()) {
            console.error('Failed to initialize WebGL');
            return;
          }

          const leafletPane = newMap.getPanes().overlayPane;
          leafletPane.appendChild(canvasLayer.value);

          newMap.on('move', reset);
          newMap.on('moveend', reset);
          newMap.on('zoom', reset);
          newMap.on('viewreset', reset);

          // Register with selection
          if (newSelectable && selectionContext) {
            registerWithSelection();
          }

          // Dessiner
          reset();
        }

        // Check if selectable changed and we need to register/unregister
        if (canvasLayer.value) {
          const selectableChanged = oldVal && Boolean(oldVal[5]) !== Boolean(newSelectable);
          if (selectableChanged) {
            // Re-register or unregister with selection context
            if (newSelectable && selectionContext) {
              registerWithSelection();
            } else if (selectionContext) {
              selectionContext.unregisterFeature(canvasId.value);
            }
          }
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

  // Cleanup WebGL resources
  if (gl.value) {
    if (texture) {
      gl.value.deleteTexture(texture);
      texture = null;
    }
    if (program) {
      gl.value.deleteProgram(program);
      program = null;
    }
    if (positionBuffer) {
      gl.value.deleteBuffer(positionBuffer);
      positionBuffer = null;
    }
    if (texCoordBuffer) {
      gl.value.deleteBuffer(texCoordBuffer);
      texCoordBuffer = null;
    }
  }

  if (canvasLayer.value) {
    canvasLayer.value.remove();
  }

  if (map.value) {
    map.value.off('move', reset);
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
