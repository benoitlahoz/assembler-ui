/**
 * Async loader for virtualization demo data
 * Generates data quickly and builds spatial index progressively
 */

import {
  useQuadtree,
  type Rect,
  type UseQuadtreeReturn,
} from '~~/registry/new-york/composables/use-quadtree/useQuadtree';

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
  class: string;
}

export interface DemoPolygon {
  id: string;
  latlngs: Array<[number, number]>;
  class: string;
}

export interface VirtualizationDemoData {
  markers: DemoMarker[];
  circles: DemoCircle[];
  polygons: DemoPolygon[];
  quadtrees: {
    markers: UseQuadtreeReturn<DemoMarker>;
    circles: UseQuadtreeReturn<DemoCircle>;
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
function generateCircles(count: number): DemoCircle[] {
  const classes = [
    'fill-blue-500 stroke-blue-700',
    'fill-green-500 stroke-green-700',
    'fill-red-500 stroke-red-700',
  ] as const;

  const circles: DemoCircle[] = [];
  for (let i = 0; i < count; i++) {
    const lat = randomCoord(PARIS_LAT, RANGE);
    const lng = randomCoord(PARIS_LNG, RANGE);
    const radiusMeters = Math.random() * 500 + 100;
    // Convert radius in meters to degrees (approximate)
    const radiusDeg = radiusMeters / 111320; // 1 degree ≈ 111.32km at equator

    circles.push({
      id: `circle-${i}`,
      lat,
      lng,
      radius: radiusMeters,
      class: classes[Math.floor(Math.random() * classes.length)] as string,
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
  const classes = [
    'fill-purple-500/30 stroke-purple-700',
    'fill-orange-500/30 stroke-orange-700',
  ] as const;

  const polygons: DemoPolygon[] = [];
  for (let i = 0; i < count; i++) {
    const centerLat = randomCoord(PARIS_LAT, RANGE);
    const centerLng = randomCoord(PARIS_LNG, RANGE);
    const size = Math.random() * 0.01 + 0.005;

    polygons.push({
      id: `polygon-${i}`,
      latlngs: [
        [centerLat - size, centerLng - size],
        [centerLat - size, centerLng + size],
        [centerLat + size, centerLng + size],
        [centerLat + size, centerLng - size],
      ] as Array<[number, number]>,
      class: classes[Math.floor(Math.random() * classes.length)] as string,
    });
  }
  return polygons;
}

/**
 * Load demo data and build spatial index progressively
 * @param onProgress - Callback for progress updates (0-100, stage description)
 */
export async function loadVirtualizationDemoData(
  onProgress?: (percent: number, stage: string) => void
): Promise<VirtualizationDemoData> {
  // Step 1: Generate data quickly (synchronous, but fast)
  onProgress?.(10, 'Generating markers...');
  const markers = generateMarkers(5000);

  onProgress?.(20, 'Generating circles...');
  const circles = generateCircles(2000);

  onProgress?.(30, 'Generating polygons...');
  const polygons = generatePolygons(1000);

  onProgress?.(40, 'Building spatial index...');

  // Step 2: Create quadtrees using the composable
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

  // Step 3: Insert markers progressively (non-blocking)
  onProgress?.(50, 'Indexing markers...');
  const chunkSize = 500;

  for (let i = 0; i < markers.length; i += chunkSize) {
    const chunk = markers.slice(i, Math.min(i + chunkSize, markers.length));
    for (const marker of chunk) {
      markersQuadtree.insert(marker);
    }

    const progress = Math.floor((i / markers.length) * 30) + 50;
    onProgress?.(progress, 'Indexing markers...');

    // Yield to browser
    await new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(resolve as any);
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  // Step 4: Insert circles progressively
  onProgress?.(80, 'Indexing circles...');

  for (let i = 0; i < circles.length; i += chunkSize) {
    const chunk = circles.slice(i, Math.min(i + chunkSize, circles.length));
    for (const circle of chunk) {
      circlesQuadtree.insert(circle);
    }

    const progress = Math.floor((i / circles.length) * 20) + 80;
    onProgress?.(progress, 'Indexing circles...');

    // Yield to browser
    await new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(resolve as any);
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  onProgress?.(100, 'Ready!');

  return {
    markers,
    circles,
    polygons,
    quadtrees: {
      markers: markersQuadtree,
      circles: circlesQuadtree,
    },
  };
}
