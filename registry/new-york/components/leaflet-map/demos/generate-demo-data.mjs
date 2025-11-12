#!/usr/bin/env node

/**
 * Script pour régénérer les données de la démo de virtualisation
 *
 * Usage:
 *   node generate-demo-data.mjs > virtualization-demo-data.ts
 *
 * Génère 8000 shapes aléatoires :
 * - 5000 markers
 * - 2000 circles
 * - 1000 polygons
 */

const CENTER_LAT = 48.8566;
const CENTER_LNG = 2.3522;
const RANGE = 0.5; // Range de génération (environ 55km)

const markers = [];
const circles = [];
const polygons = [];

// Générer 5000 markers
for (let i = 0; i < 5000; i++) {
  const lat = CENTER_LAT + (Math.random() - 0.5) * RANGE;
  const lng = CENTER_LNG + (Math.random() - 0.5) * RANGE;
  markers.push(
    `  { id: 'marker-${i}', lat: ${lat.toFixed(6)}, lng: ${lng.toFixed(6)}, label: 'Marker ${i}' }`
  );
}

// Générer 2000 circles
for (let i = 0; i < 2000; i++) {
  const lat = CENTER_LAT + (Math.random() - 0.5) * RANGE;
  const lng = CENTER_LNG + (Math.random() - 0.5) * RANGE;
  const radius = (50 + Math.random() * 200).toFixed(1);
  circles.push(
    `  { id: 'circle-${i}', lat: ${lat.toFixed(6)}, lng: ${lng.toFixed(6)}, radius: ${radius}, class: 'border border-blue-500 bg-blue-500/20' }`
  );
}

// Générer 1000 polygons
for (let i = 0; i < 1000; i++) {
  const lat = CENTER_LAT + (Math.random() - 0.5) * RANGE;
  const lng = CENTER_LNG + (Math.random() - 0.5) * RANGE;
  const size = 0.002 + Math.random() * 0.008;

  const latlngs = [
    `[${lat.toFixed(6)}, ${lng.toFixed(6)}]`,
    `[${(lat + size).toFixed(6)}, ${lng.toFixed(6)}]`,
    `[${(lat + size).toFixed(6)}, ${(lng + size).toFixed(6)}]`,
    `[${lat.toFixed(6)}, ${(lng + size).toFixed(6)}]`,
  ].join(', ');

  polygons.push(
    `  { id: 'polygon-${i}', latlngs: [${latlngs}] as Array<[number, number]>, class: 'border border-purple-500 bg-purple-500/30' }`
  );
}

const output = `/**
 * Pre-generated random shapes for LeafletVirtualizationDemo
 * Generated around Paris center (48.8566, 2.3522)
 * Total: 8000 shapes (5000 markers, 2000 circles, 1000 polygons)
 * 
 * These are static, pre-calculated data for consistent demo performance.
 */

export interface DemoMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
}

export interface DemoCircle {
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

// Pre-generated markers (5000 items)
export const demoMarkers: DemoMarker[] = [
${markers.join(',\n')}
];

// Pre-generated circles (2000 items)
export const demoCircles: DemoCircle[] = [
${circles.join(',\n')}
];

// Pre-generated polygons (1000 items)
export const demoPolygons: DemoPolygon[] = [
${polygons.join(',\n')}
];

// Total count for convenience
export const totalShapesCount = demoMarkers.length + demoCircles.length + demoPolygons.length;
`;

console.log(output);
