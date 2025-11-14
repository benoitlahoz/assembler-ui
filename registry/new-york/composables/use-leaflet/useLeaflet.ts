/**
 * Composable with Leaflet dynamic import client-side and utilities.
 *
 * @type registry:hook
 * @category georgraphy
 */

import { ref, type Ref } from 'vue';
import type Leaflet from 'leaflet';
import area from '@turf/area';
import length from '@turf/length';
import distance from '@turf/distance';
import centroid from '@turf/centroid';
import type { Position } from 'geojson';

type Leaflet = typeof Leaflet;
type LatLng = Leaflet.LatLng;

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

  /**
   * Convertit un tableau de LatLng en coordonnées GeoJSON [lng, lat]
   */
  const toGeoJSONCoords = (latlngs: LatLng[]): Position[] => {
    return latlngs.map((ll) => [ll.lng, ll.lat]);
  };

  /**
   * Calcule la distance d'une ligne (polyline) en mètres avec Turf.js (géodésique précis)
   * @param latlngs - Array de points LatLng
   * @param unit - Unité de mesure ('metric' | 'imperial')
   * @returns Distance en mètres ou pieds selon l'unité
   */
  const calculateLineDistance = (
    latlngs: LatLng[],
    unit: 'metric' | 'imperial' = 'metric'
  ): number => {
    if (latlngs.length < 2) return 0;

    const coords = toGeoJSONCoords(latlngs);
    const line = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: coords,
      },
    };

    const distanceKm = length(line, { units: 'kilometers' });
    const distanceMeters = distanceKm * 1000;

    return unit === 'metric' ? distanceMeters : distanceMeters * 3.28084;
  };

  /**
   * Calcule l'aire d'un polygone en m² avec Turf.js (géodésique précis)
   * @param latlngs - Array de points LatLng du polygone
   * @param unit - Unité de mesure ('metric' | 'imperial')
   * @returns Aire en m² ou ft² selon l'unité
   */
  const calculatePolygonArea = (
    latlngs: LatLng[],
    unit: 'metric' | 'imperial' = 'metric'
  ): number | undefined => {
    if (latlngs.length < 3) return undefined;

    const coords = toGeoJSONCoords(latlngs);
    const closedCoords = [...coords, coords[0]].filter((c): c is Position => c !== undefined);

    const polygon = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [closedCoords],
      },
    };

    const areaM2 = area(polygon);
    return unit === 'metric' ? areaM2 : areaM2 * 10.7639; // m² to ft²
  };

  /**
   * Calcule le centroïde d'un polygone avec Turf.js
   * @param latlngs - Array de points LatLng du polygone
   * @returns Coordonnées [lng, lat] du centroïde
   */
  const calculateCentroid = (latlngs: LatLng[]): [number, number] | undefined => {
    if (latlngs.length < 3) return undefined;

    const coords = toGeoJSONCoords(latlngs);
    const closedCoords = [...coords, coords[0]].filter((c): c is Position => c !== undefined);

    const polygon = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'Polygon' as const,
        coordinates: [closedCoords],
      },
    };

    const center = centroid(polygon);
    return center.geometry.coordinates as [number, number];
  };

  /**
   * Calcule la distance entre deux points avec Turf.js
   * @param from - Point de départ [lng, lat] ou LatLng
   * @param to - Point d'arrivée [lng, lat] ou LatLng
   * @param unit - Unité de mesure ('metric' | 'imperial')
   * @returns Distance en mètres ou pieds selon l'unité
   */
  const calculateDistance = (
    from: LatLng | [number, number],
    to: LatLng | [number, number],
    unit: 'metric' | 'imperial' = 'metric'
  ): number => {
    const fromCoords = Array.isArray(from) ? from : [from.lng, from.lat];
    const toCoords = Array.isArray(to) ? to : [to.lng, to.lat];

    const distanceKm = distance(fromCoords, toCoords, { units: 'kilometers' });
    const distanceMeters = distanceKm * 1000;

    return unit === 'metric' ? distanceMeters : distanceMeters * 3.28084;
  };

  /**
   * Formate une distance en texte lisible
   * @param distanceInMeters - Distance en mètres
   * @param unit - Unité de mesure ('metric' | 'imperial')
   * @returns Distance formatée avec unité (ex: "1.5 km", "250 m", "2.3 mi")
   */
  const formatDistance = (
    distanceInMeters: number,
    unit: 'metric' | 'imperial' = 'metric'
  ): string => {
    if (unit === 'metric') {
      return distanceInMeters > 1000
        ? `${(distanceInMeters / 1000).toFixed(2)} km`
        : `${distanceInMeters.toFixed(2)} m`;
    } else {
      const distanceFeet = distanceInMeters * 3.28084;
      return distanceFeet > 5280
        ? `${(distanceFeet / 5280).toFixed(2)} mi`
        : `${distanceFeet.toFixed(2)} ft`;
    }
  };

  /**
   * Formate une aire en texte lisible
   * @param areaInM2 - Aire en m²
   * @param unit - Unité de mesure ('metric' | 'imperial')
   * @returns Aire formatée avec unité (ex: "2.5 km²", "150 m²", "3.2 acres")
   */
  const formatArea = (areaInM2: number, unit: 'metric' | 'imperial' = 'metric'): string => {
    if (unit === 'metric') {
      return areaInM2 > 10000
        ? `${(areaInM2 / 1000000).toFixed(2)} km²`
        : `${areaInM2.toFixed(2)} m²`;
    } else {
      const areaFt2 = areaInM2 * 10.7639;
      return areaFt2 > 43560
        ? `${(areaFt2 / 43560).toFixed(2)} acres`
        : `${areaFt2.toFixed(2)} ft²`;
    }
  };

  /**
   * Calcule le point médian entre deux LatLng
   * @param point1 - Premier point
   * @param point2 - Deuxième point
   * @returns Point médian [lat, lng]
   */
  const calculateMidpoint = (point1: LatLng, point2: LatLng): [number, number] => {
    const midLat = (point1.lat + point2.lat) / 2;
    const midLng = (point1.lng + point2.lng) / 2;
    return [midLat, midLng];
  };

  /**
   * Calcule un LatLng à partir d'un centre et d'un rayon (vers l'est)
   * Utile pour positionner des handles de rayon de cercle
   * @param center - Centre du cercle
   * @param radiusInMeters - Rayon en mètres
   * @returns [lat, lng] du point à la distance du rayon vers l'est
   */
  const calculateRadiusPoint = (center: LatLng, radiusInMeters: number): [number, number] => {
    const lat = center.lat;
    const lng = center.lng + radiusToLngDegrees(radiusInMeters, center.lat);
    return [lat, lng];
  };

  /**
   * Calcule les bounds d'un cercle
   * @param center - Centre du cercle
   * @param radiusInMeters - Rayon en mètres
   * @returns Objet avec southWest et northEast pour créer des bounds
   */
  const calculateCircleBounds = (
    center: LatLng,
    radiusInMeters: number
  ): { southWest: [number, number]; northEast: [number, number] } => {
    const radiusInLatDegrees = radiusToLatDegrees(radiusInMeters);
    const radiusInLngDegrees = radiusToLngDegrees(radiusInMeters, center.lat);

    return {
      southWest: [center.lat - radiusInLatDegrees, center.lng - radiusInLngDegrees],
      northEast: [center.lat + radiusInLatDegrees, center.lng + radiusInLngDegrees],
    };
  };

  /**
   * Calcule combien de mètres représente un pixel à un niveau de zoom donné
   * Utilise la circonférence de la Terre (40075016.686m) et le cosinus de la latitude
   * pour tenir compte de la projection Mercator
   *
   * Formule : (circonférence × cos(latitude)) / (2^(zoom + 8))
   * Le +8 vient de : 256 pixels par tuile = 2^8
   *
   * @param zoom - Niveau de zoom de la carte
   * @param latitude - Latitude du point (pour la correction Mercator)
   * @returns Nombre de mètres par pixel
   *
   * @example
   * // À zoom 15 à Paris (lat ~48.86)
   * const meters = pixelsToMeters(15, 48.86);
   * const snapThreshold = 20 * meters; // 20 pixels en mètres
   */
  const pixelsToMeters = (zoom: number, latitude: number): number => {
    const earthCircumference = 40075016.686; // Circonférence de la Terre en mètres
    return (
      (earthCircumference * Math.abs(Math.cos((latitude * Math.PI) / 180))) / Math.pow(2, zoom + 8)
    );
  };

  // Helper function to constrain bounds to a square
  const constrainToSquare = (
    bounds: L.LatLngBounds,
    center?: L.LatLng,
    originalBounds?: L.LatLngBounds
  ): L.LatLngBounds => {
    if (!L.value) return bounds;

    const currentCenter = center || bounds.getCenter();
    const latDiff = bounds.getNorth() - bounds.getSouth();
    const lngDiff = bounds.getEast() - bounds.getWest();

    // Convert to metric coordinates to get true visual dimensions
    const latMeters = latDiff * LatDegreesMeters;
    const lngMeters = lngDegreesToRadius(lngDiff, currentCenter.lat);

    // Determine which dimension changed more (to allow both growing and shrinking)
    let targetMeters = latMeters;
    if (originalBounds) {
      const origLatDiff = originalBounds.getNorth() - originalBounds.getSouth();
      const origLngDiff = originalBounds.getEast() - originalBounds.getWest();
      const origLatMeters = origLatDiff * LatDegreesMeters;
      const origLngMeters = lngDegreesToRadius(origLngDiff, currentCenter.lat);

      // Use the dimension that changed the most
      const latChange = Math.abs(latMeters - origLatMeters);
      const lngChange = Math.abs(lngMeters - origLngMeters);

      targetMeters = lngChange > latChange ? lngMeters : latMeters;
    } else {
      // Fallback to average if no original bounds
      targetMeters = (latMeters + lngMeters) / 2;
    }

    // Convert back to degrees
    const halfLatDiff = targetMeters / 2 / LatDegreesMeters;
    const halfLngDiff = radiusToLngDegrees(targetMeters / 2, currentCenter.lat);

    return L.value.latLngBounds(
      [currentCenter.lat - halfLatDiff, currentCenter.lng - halfLngDiff],
      [currentCenter.lat + halfLatDiff, currentCenter.lng + halfLngDiff]
    );
  };

  const normalizeLatLngs = (
    latlngs: Array<[number, number]> | Array<{ lat: number; lng: number }>
  ): Array<[number, number]> => {
    return latlngs.map((point) => {
      if (Array.isArray(point)) {
        return point;
      }
      return [point.lat, point.lng] as [number, number];
    });
  };

  return {
    L,
    LatDegreesMeters,
    // Conversions degrés/mètres
    radiusToLatDegrees,
    latDegreesToRadius,
    radiusToLngDegrees,
    lngDegreesToRadius,
    pixelsToMeters,
    // Fonctions Turf.js (géométrie)
    toGeoJSONCoords,
    calculateLineDistance,
    calculatePolygonArea,
    calculateCentroid,
    calculateDistance,
    // Formatage
    formatDistance,
    formatArea,
    // Calculs utilitaires
    calculateMidpoint,
    calculateRadiusPoint,
    calculateCircleBounds,
    // Contraintes
    constrainToSquare,
    // Normalisation
    normalizeLatLngs,
  };
};
