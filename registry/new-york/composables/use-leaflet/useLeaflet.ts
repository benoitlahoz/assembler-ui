/**
 * Composable with Leaflet dynamic import client-side and utilities.
 *
 * @type registry:hook
 * @category georgraphy
 */

import { ref, type Ref } from 'vue';
import type Leaflet from 'leaflet';
type Leaflet = typeof Leaflet;

let L: Ref<Leaflet | undefined> = ref(undefined);

// 1 degree of latitude ≈ 111,320 meters (constant)
const LatDegreesMeters = 111320;

export const useLeaflet = async () => {
  if (typeof window !== 'undefined') {
    // @ts-expect-error: Dynamic import of CSS
    await import('leaflet/dist/leaflet.css');
    L.value = (await import('leaflet')).default;
  }

  const radiusToLatDegrees = (radiusInMeters: number) => {
    return radiusInMeters / LatDegreesMeters;
  };

  const latDegreesToRadius = (latDegrees: number) => {
    return latDegrees * LatDegreesMeters;
  };

  const radiusToLngDegrees = (radiusInMeters: number, lat: number) => {
    return radiusInMeters / (LatDegreesMeters * Math.cos((lat * Math.PI) / 180));
  };

  const lngDegreesToRadius = (lngDegrees: number, lat: number) => {
    return lngDegrees * LatDegreesMeters * Math.cos((lat * Math.PI) / 180);
  };

  return {
    L,
    LatDegreesMeters,
    radiusToLatDegrees,
    latDegreesToRadius,
    radiusToLngDegrees,
    lngDegreesToRadius,
  };
};
