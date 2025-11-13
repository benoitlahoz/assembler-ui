/**
 * Async loader for virtualization demo data
 * Generates data quickly and builds spatial index progressively
 */

import {
  useQuadtree,
  type Rect,
  type UseQuadtreeReturn,
} from '~~/registry/new-york/composables/use-quadtree/useQuadtree';
import { useLeaflet } from '~~/registry/new-york/composables/use-leaflet/useLeaflet';

// Helper to convert lat/lng bounds to x/y bounds
const convertLatLngBounds = (bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}) => {
  return {
    x: bounds.west,
    y: bounds.south,
    width: bounds.east - bounds.west,
    height: bounds.north - bounds.south,
  };
};

export interface DemoMarker extends Rect {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

export interface DemoCircle extends Rect {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  colorIndex: number; // 0, 1, or 2 for different colors
}

export interface DemoPolygon extends Rect {
  id: string;
  latlngs: Array<[number, number]>;
  colorIndex: number; // 0 or 1 for different colors
}

export interface DemoPolyline extends Rect {
  id: string;
  latlngs: Array<[number, number]>;
  colorIndex: number; // 0, 1, or 2 for different colors
}

export interface DemoRectangle extends Rect {
  id: string;
  bounds: [[number, number], [number, number]];
  colorIndex: number; // 0 or 1 for different colors
}

export interface VirtualizationDemoData {
  markers: DemoMarker[];
  circles: DemoCircle[];
  polygons: DemoPolygon[];
  polylines: DemoPolyline[];
  rectangles: DemoRectangle[];
  quadtrees: {
    markers: UseQuadtreeReturn<DemoMarker>;
    circles: UseQuadtreeReturn<DemoCircle>;
    polygons: UseQuadtreeReturn<DemoPolygon>;
    polylines: UseQuadtreeReturn<DemoPolyline>;
    rectangles: UseQuadtreeReturn<DemoRectangle>;
  };
}

// Paris center coordinates
const PARIS_LAT = 48.8566;
const PARIS_LNG = 2.3522;
const RANGE = 0.5; // ~55km radius

// Bounds for the quadtree (Paris area)
const PARIS_BOUNDS = {
  north: PARIS_LAT + RANGE / 2,
  south: PARIS_LAT - RANGE / 2,
  east: PARIS_LNG + RANGE / 2,
  west: PARIS_LNG - RANGE / 2,
};

/**
 * Generate random coordinate within range of Paris
 */
function randomCoord(center: number, range: number): number {
  return center + (Math.random() - 0.5) * range;
}

/**
 * Generate all markers at once (fast, no blocking with small arrays)
 */
function generateMarkers(count: number): DemoMarker[] {
  const markers: DemoMarker[] = [];
  for (let i = 0; i < count; i++) {
    const lat = randomCoord(PARIS_LAT, RANGE);
    const lng = randomCoord(PARIS_LNG, RANGE);
    markers.push({
      id: `marker-${i}`,
      lat,
      lng,
      label: `Marker ${i}`,
      // Add Rect properties for quadtree
      x: lng,
      y: lat,
      width: 0.0001, // Small area for point
      height: 0.0001,
    });
  }
  return markers;
}

/**
 * Generate all circles at once
 */
async function generateCircles(count: number): Promise<DemoCircle[]> {
  const { LatDegreesMeters } = await useLeaflet();
  const circles: DemoCircle[] = [];
  for (let i = 0; i < count; i++) {
    const lat = randomCoord(PARIS_LAT, RANGE);
    const lng = randomCoord(PARIS_LNG, RANGE);
    const radiusMeters = Math.random() * 500 + 100;
    // Convert radius in meters to degrees (approximate)
    const radiusDeg = radiusMeters / LatDegreesMeters;

    circles.push({
      id: `circle-${i}`,
      lat,
      lng,
      radius: radiusMeters,
      colorIndex: Math.floor(Math.random() * 3), // 0, 1, or 2
      // Add Rect properties for quadtree (bounding box of circle)
      x: lng - radiusDeg,
      y: lat - radiusDeg,
      width: radiusDeg * 2,
      height: radiusDeg * 2,
    });
  }
  return circles;
}

/**
 * Generate all polygons at once
 */
function generatePolygons(count: number): DemoPolygon[] {
  const polygons: DemoPolygon[] = [];
  for (let i = 0; i < count; i++) {
    const centerLat = randomCoord(PARIS_LAT, RANGE);
    const centerLng = randomCoord(PARIS_LNG, RANGE);
    const size = Math.random() * 0.01 + 0.005;

    const latlngs: Array<[number, number]> = [
      [centerLat - size, centerLng - size],
      [centerLat - size, centerLng + size],
      [centerLat + size, centerLng + size],
      [centerLat + size, centerLng - size],
    ];

    // Calculate bounding box for quadtree
    const lats = latlngs.map(([lat]) => lat);
    const lngs = latlngs.map(([, lng]) => lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    polygons.push({
      id: `polygon-${i}`,
      latlngs,
      colorIndex: Math.floor(Math.random() * 2), // 0 or 1
      // Add Rect properties for quadtree (bounding box)
      x: minLng,
      y: minLat,
      width: maxLng - minLng,
      height: maxLat - minLat,
    });
  }
  return polygons;
}

/**
 * Generate all polylines at once
 */
function generatePolylines(count: number): DemoPolyline[] {
  const polylines: DemoPolyline[] = [];
  for (let i = 0; i < count; i++) {
    const startLat = randomCoord(PARIS_LAT, RANGE);
    const startLng = randomCoord(PARIS_LNG, RANGE);
    const segments = 3 + Math.floor(Math.random() * 5);

    const latlngs: Array<[number, number]> = [[startLat, startLng]];

    for (let j = 1; j < segments; j++) {
      const prev = latlngs[j - 1];
      if (!prev) continue;
      const prevLat = prev[0];
      const prevLng = prev[1];
      const deltaLat = (Math.random() - 0.5) * 0.02;
      const deltaLng = (Math.random() - 0.5) * 0.02;
      latlngs.push([prevLat + deltaLat, prevLng + deltaLng]);
    }

    // Calculate bounding box for quadtree
    const lats = latlngs.map(([lat]) => lat);
    const lngs = latlngs.map(([, lng]) => lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    polylines.push({
      id: `polyline-${i}`,
      latlngs,
      colorIndex: Math.floor(Math.random() * 3), // 0, 1, or 2
      // Add Rect properties for quadtree (bounding box)
      x: minLng,
      y: minLat,
      width: maxLng - minLng,
      height: maxLat - minLat,
    });
  }
  return polylines;
}

/**
 * Generate all rectangles at once
 */
function generateRectangles(count: number): DemoRectangle[] {
  const rectangles: DemoRectangle[] = [];
  for (let i = 0; i < count; i++) {
    const centerLat = randomCoord(PARIS_LAT, RANGE);
    const centerLng = randomCoord(PARIS_LNG, RANGE);
    const width = Math.random() * 0.02 + 0.01;
    const height = Math.random() * 0.02 + 0.01;

    const bounds: [[number, number], [number, number]] = [
      [centerLat - height / 2, centerLng - width / 2],
      [centerLat + height / 2, centerLng + width / 2],
    ];

    rectangles.push({
      id: `rectangle-${i}`,
      bounds,
      colorIndex: Math.floor(Math.random() * 2), // 0 or 1
      // Add Rect properties for quadtree
      x: bounds[0][1],
      y: bounds[0][0],
      width,
      height,
    });
  }
  return rectangles;
}

/**
 * Helper to yield control back to the browser
 */
async function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

/**
 * Generate items progressively in chunks to avoid blocking
 */
async function* generateInChunks<T>(
  generator: (count: number) => T[] | Promise<T[]>,
  totalCount: number,
  chunkSize: number
): AsyncGenerator<T[], void, unknown> {
  for (let i = 0; i < totalCount; i += chunkSize) {
    const count = Math.min(chunkSize, totalCount - i);
    yield await generator(count);
    await yieldToMain();
  }
}

/**
 * Load demo data and build spatial index progressively
 * @param onProgress - Callback for progress updates (0-100, stage description)
 */
export async function loadVirtualizationDemoData(
  onProgress?: (percent: number, stage: string) => void
): Promise<VirtualizationDemoData> {
  const markers: DemoMarker[] = [];
  const circles: DemoCircle[] = [];
  const polygons: DemoPolygon[] = [];
  const polylines: DemoPolyline[] = [];
  const rectangles: DemoRectangle[] = [];

  // Smaller chunk size to avoid blocking
  const generationChunkSize = 200;
  const insertionChunkSize = 100;

  // Step 1: Generate markers progressively
  onProgress?.(0, 'Generating markers...');
  const markerTotal = 3000;
  let markerCount = 0;
  for await (const chunk of generateInChunks(generateMarkers, markerTotal, generationChunkSize)) {
    // Adjust IDs to be sequential across chunks
    chunk.forEach((marker, idx) => {
      marker.id = `marker-${markerCount + idx}`;
      marker.label = `Marker ${markerCount + idx}`;
    });
    markers.push(...chunk);
    markerCount += chunk.length;
    const progress = Math.floor((markerCount / markerTotal) * 10);
    onProgress?.(progress, `Generating markers (${markerCount}/${markerTotal})...`);
  }

  // Step 2: Generate circles progressively
  onProgress?.(10, 'Generating circles...');
  const circleTotal = 1500;
  let circleCount = 0;
  for await (const chunk of generateInChunks(generateCircles, circleTotal, generationChunkSize)) {
    chunk.forEach((circle, idx) => {
      circle.id = `circle-${circleCount + idx}`;
    });
    circles.push(...chunk);
    circleCount += chunk.length;
    const progress = Math.floor((circleCount / circleTotal) * 10) + 10;
    onProgress?.(progress, `Generating circles (${circleCount}/${circleTotal})...`);
  }

  // Step 3: Generate polygons progressively
  onProgress?.(20, 'Generating polygons...');
  const polygonTotal = 1500;
  let polygonCount = 0;
  for await (const chunk of generateInChunks(generatePolygons, polygonTotal, generationChunkSize)) {
    chunk.forEach((polygon, idx) => {
      polygon.id = `polygon-${polygonCount + idx}`;
    });
    polygons.push(...chunk);
    polygonCount += chunk.length;
    const progress = Math.floor((polygonCount / polygonTotal) * 10) + 20;
    onProgress?.(progress, `Generating polygons (${polygonCount}/${polygonTotal})...`);
  }

  // Step 4: Generate polylines progressively
  onProgress?.(30, 'Generating polylines...');
  const polylineTotal = 1000;
  let polylineCount = 0;
  for await (const chunk of generateInChunks(
    generatePolylines,
    polylineTotal,
    generationChunkSize
  )) {
    chunk.forEach((polyline, idx) => {
      polyline.id = `polyline-${polylineCount + idx}`;
    });
    polylines.push(...chunk);
    polylineCount += chunk.length;
    const progress = Math.floor((polylineCount / polylineTotal) * 10) + 30;
    onProgress?.(progress, `Generating polylines (${polylineCount}/${polylineTotal})...`);
  }

  // Step 5: Generate rectangles progressively
  onProgress?.(40, 'Generating rectangles...');
  const rectangleTotal = 1000;
  let rectangleCount = 0;
  for await (const chunk of generateInChunks(
    generateRectangles,
    rectangleTotal,
    generationChunkSize
  )) {
    chunk.forEach((rectangle, idx) => {
      rectangle.id = `rectangle-${rectangleCount + idx}`;
    });
    rectangles.push(...chunk);
    rectangleCount += chunk.length;
    const progress = Math.floor((rectangleCount / rectangleTotal) * 10) + 40;
    onProgress?.(progress, `Generating rectangles (${rectangleCount}/${rectangleTotal})...`);
  }

  onProgress?.(50, 'Building spatial indexes...');

  // Step 6: Create quadtrees
  const markersQuadtree = useQuadtree<DemoMarker>({
    bounds: convertLatLngBounds(PARIS_BOUNDS),
    maxObjects: 10,
    maxLevels: 4,
  });

  const circlesQuadtree = useQuadtree<DemoCircle>({
    bounds: convertLatLngBounds(PARIS_BOUNDS),
    maxObjects: 10,
    maxLevels: 4,
  });

  const polygonsQuadtree = useQuadtree<DemoPolygon>({
    bounds: convertLatLngBounds(PARIS_BOUNDS),
    maxObjects: 10,
    maxLevels: 4,
  });

  const polylinesQuadtree = useQuadtree<DemoPolyline>({
    bounds: convertLatLngBounds(PARIS_BOUNDS),
    maxObjects: 10,
    maxLevels: 4,
  });

  const rectanglesQuadtree = useQuadtree<DemoRectangle>({
    bounds: convertLatLngBounds(PARIS_BOUNDS),
    maxObjects: 10,
    maxLevels: 4,
  });

  // Step 7: Insert markers progressively (smaller chunks)
  onProgress?.(50, 'Indexing markers...');
  for (let i = 0; i < markers.length; i += insertionChunkSize) {
    const end = Math.min(i + insertionChunkSize, markers.length);
    for (let j = i; j < end; j++) {
      const marker = markers[j];
      if (marker) markersQuadtree.insert(marker);
    }
    const progress = Math.floor((end / markers.length) * 10) + 50;
    onProgress?.(progress, `Indexing markers (${end}/${markers.length})...`);
    await yieldToMain();
  }

  // Step 8: Insert circles progressively
  onProgress?.(60, 'Indexing circles...');
  for (let i = 0; i < circles.length; i += insertionChunkSize) {
    const end = Math.min(i + insertionChunkSize, circles.length);
    for (let j = i; j < end; j++) {
      const circle = circles[j];
      if (circle) circlesQuadtree.insert(circle);
    }
    const progress = Math.floor((end / circles.length) * 10) + 60;
    onProgress?.(progress, `Indexing circles (${end}/${circles.length})...`);
    await yieldToMain();
  }

  // Step 9: Insert polygons progressively
  onProgress?.(70, 'Indexing polygons...');
  for (let i = 0; i < polygons.length; i += insertionChunkSize) {
    const end = Math.min(i + insertionChunkSize, polygons.length);
    for (let j = i; j < end; j++) {
      const polygon = polygons[j];
      if (polygon) polygonsQuadtree.insert(polygon);
    }
    const progress = Math.floor((end / polygons.length) * 10) + 70;
    onProgress?.(progress, `Indexing polygons (${end}/${polygons.length})...`);
    await yieldToMain();
  }

  // Step 10: Insert polylines progressively
  onProgress?.(80, 'Indexing polylines...');
  for (let i = 0; i < polylines.length; i += insertionChunkSize) {
    const end = Math.min(i + insertionChunkSize, polylines.length);
    for (let j = i; j < end; j++) {
      const polyline = polylines[j];
      if (polyline) polylinesQuadtree.insert(polyline);
    }
    const progress = Math.floor((end / polylines.length) * 10) + 80;
    onProgress?.(progress, `Indexing polylines (${end}/${polylines.length})...`);
    await yieldToMain();
  }

  // Step 11: Insert rectangles progressively
  onProgress?.(90, 'Indexing rectangles...');
  for (let i = 0; i < rectangles.length; i += insertionChunkSize) {
    const end = Math.min(i + insertionChunkSize, rectangles.length);
    for (let j = i; j < end; j++) {
      const rectangle = rectangles[j];
      if (rectangle) rectanglesQuadtree.insert(rectangle);
    }
    const progress = Math.floor((end / rectangles.length) * 10) + 90;
    onProgress?.(progress, `Indexing rectangles (${end}/${rectangles.length})...`);
    await yieldToMain();
  }

  onProgress?.(100, 'Ready!');

  return {
    markers,
    circles,
    polygons,
    polylines,
    rectangles,
    quadtrees: {
      markers: markersQuadtree,
      circles: circlesQuadtree,
      polygons: polygonsQuadtree,
      polylines: polylinesQuadtree,
      rectangles: rectanglesQuadtree,
    },
  };
}
