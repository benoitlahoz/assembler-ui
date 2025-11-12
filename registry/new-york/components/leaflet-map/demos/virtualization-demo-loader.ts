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

export interface DemoPolygon extends Rect {
  id: string;
  latlngs: Array<[number, number]>;
  class: string;
}

export interface DemoPolyline extends Rect {
  id: string;
  latlngs: Array<[number, number]>;
  class: string;
}

export interface DemoRectangle extends Rect {
  id: string;
  bounds: [[number, number], [number, number]];
  class: string;
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
      class: classes[Math.floor(Math.random() * classes.length)] as string,
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
  const classes = ['stroke-yellow-600', 'stroke-pink-600', 'stroke-cyan-600'] as const;

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
      class: classes[Math.floor(Math.random() * classes.length)] as string,
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
  const classes = [
    'fill-indigo-500/30 stroke-indigo-700',
    'fill-teal-500/30 stroke-teal-700',
  ] as const;

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
      class: classes[Math.floor(Math.random() * classes.length)] as string,
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
 * Load demo data and build spatial index progressively
 * @param onProgress - Callback for progress updates (0-100, stage description)
 */
export async function loadVirtualizationDemoData(
  onProgress?: (percent: number, stage: string) => void
): Promise<VirtualizationDemoData> {
  // Step 1: Generate data quickly (synchronous, but fast)
  onProgress?.(5, 'Generating markers...');
  const markers = generateMarkers(3000);

  onProgress?.(10, 'Generating circles...');
  const circles = generateCircles(1500);

  onProgress?.(15, 'Generating polygons...');
  const polygons = generatePolygons(1500);

  onProgress?.(20, 'Generating polylines...');
  const polylines = generatePolylines(1000);

  onProgress?.(25, 'Generating rectangles...');
  const rectangles = generateRectangles(1000);

  onProgress?.(30, 'Building spatial indexes...');

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

  const chunkSize = 500;

  // Step 3: Insert markers progressively
  onProgress?.(35, 'Indexing markers...');
  for (let i = 0; i < markers.length; i += chunkSize) {
    const chunk = markers.slice(i, Math.min(i + chunkSize, markers.length));
    for (const marker of chunk) {
      markersQuadtree.insert(marker);
    }
    const progress = Math.floor((i / markers.length) * 10) + 35;
    onProgress?.(progress, 'Indexing markers...');
    await new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(resolve as any);
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  // Step 4: Insert circles progressively
  onProgress?.(45, 'Indexing circles...');
  for (let i = 0; i < circles.length; i += chunkSize) {
    const chunk = circles.slice(i, Math.min(i + chunkSize, circles.length));
    for (const circle of chunk) {
      circlesQuadtree.insert(circle);
    }
    const progress = Math.floor((i / circles.length) * 10) + 45;
    onProgress?.(progress, 'Indexing circles...');
    await new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(resolve as any);
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  // Step 5: Insert polygons progressively
  onProgress?.(55, 'Indexing polygons...');
  for (let i = 0; i < polygons.length; i += chunkSize) {
    const chunk = polygons.slice(i, Math.min(i + chunkSize, polygons.length));
    for (const polygon of chunk) {
      polygonsQuadtree.insert(polygon);
    }
    const progress = Math.floor((i / polygons.length) * 15) + 55;
    onProgress?.(progress, 'Indexing polygons...');
    await new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(resolve as any);
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  // Step 6: Insert polylines progressively
  onProgress?.(70, 'Indexing polylines...');
  for (let i = 0; i < polylines.length; i += chunkSize) {
    const chunk = polylines.slice(i, Math.min(i + chunkSize, polylines.length));
    for (const polyline of chunk) {
      polylinesQuadtree.insert(polyline);
    }
    const progress = Math.floor((i / polylines.length) * 15) + 70;
    onProgress?.(progress, 'Indexing polylines...');
    await new Promise((resolve) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(resolve as any);
      } else {
        setTimeout(resolve, 0);
      }
    });
  }

  // Step 7: Insert rectangles progressively
  onProgress?.(85, 'Indexing rectangles...');
  for (let i = 0; i < rectangles.length; i += chunkSize) {
    const chunk = rectangles.slice(i, Math.min(i + chunkSize, rectangles.length));
    for (const rectangle of chunk) {
      rectanglesQuadtree.insert(rectangle);
    }
    const progress = Math.floor((i / rectangles.length) * 15) + 85;
    onProgress?.(progress, 'Indexing rectangles...');
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
