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
   * Convert GeoJSON coords [lng, lat] to a LatLng array.
   */
  const fromGeoJSONCoords = (coords: Position[]): LatLng[] => {
    return coords
      .filter(
        (c): c is [number, number] | [number, number, number] =>
          c[0] !== undefined && c[1] !== undefined
      )
      .map((c) => new L.value!.LatLng(c[1], c[0]));
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

  /**
   * Translate un point LatLng par un offset en pixels
   * @param latlng - Point géographique de départ
   * @param deltaX - Offset horizontal en pixels
   * @param deltaY - Offset vertical en pixels
   * @param map - Instance de la carte Leaflet
   * @returns Nouveau point géographique ou null si map invalide
   */
  const translatePointByPixels = (
    latlng: L.LatLng,
    deltaX: number,
    deltaY: number,
    map: L.Map
  ): L.LatLng | null => {
    if (!L.value || !map) return null;
    const point = map.latLngToContainerPoint(latlng);
    const newPoint = L.value.point(point.x + deltaX, point.y + deltaY);
    return map.containerPointToLatLng(newPoint);
  };

  /**
   * Calcule l'offset en pixels entre deux points LatLng
   * @param from - Point de départ
   * @param to - Point d'arrivée
   * @param map - Instance de la carte Leaflet
   * @returns Objet {x, y} avec les offsets en pixels ou null si map invalide
   */
  const calculatePixelOffset = (
    from: L.LatLng,
    to: L.LatLng,
    map: L.Map
  ): { x: number; y: number } | null => {
    if (!L.value || !map) return null;
    const fromPoint = map.latLngToContainerPoint(from);
    const toPoint = map.latLngToContainerPoint(to);
    return {
      x: toPoint.x - fromPoint.x,
      y: toPoint.y - fromPoint.y,
    };
  };

  /**
   * Calcule les positions des handles pour une bounding box
   * @param bounds - Bounds de la feature
   * @param map - Instance de la carte Leaflet
   * @param options - Options pour les handles à créer
   * @returns Objet contenant les positions des différents handles
   */
  const calculateHandlePositions = (
    bounds: L.LatLngBounds,
    map: L.Map,
    options: {
      corners?: boolean;
      edges?: boolean;
      rotate?: boolean;
      center?: boolean;
      rotateOffsetPx?: number;
    } = {}
  ): {
    corners?: L.LatLng[];
    edges?: L.LatLng[];
    rotate?: L.LatLng;
    center?: L.LatLng;
  } => {
    if (!L.value) return {};

    const {
      corners = true,
      edges = true,
      rotate = true,
      center = true,
      rotateOffsetPx = 30,
    } = options;

    const result: {
      corners?: L.LatLng[];
      edges?: L.LatLng[];
      rotate?: L.LatLng;
      center?: L.LatLng;
    } = {};

    // Coins (ordre: SW, NW, NE, SE)
    if (corners) {
      result.corners = [
        bounds.getSouthWest(),
        bounds.getNorthWest(),
        bounds.getNorthEast(),
        bounds.getSouthEast(),
      ];
    }

    // Bords (ordre: gauche, haut, droite, bas)
    if (edges) {
      result.edges = [
        L.value.latLng((bounds.getSouth() + bounds.getNorth()) / 2, bounds.getWest()), // gauche
        L.value.latLng(bounds.getNorth(), (bounds.getWest() + bounds.getEast()) / 2), // haut
        L.value.latLng((bounds.getSouth() + bounds.getNorth()) / 2, bounds.getEast()), // droite
        L.value.latLng(bounds.getSouth(), (bounds.getWest() + bounds.getEast()) / 2), // bas
      ];
    }

    // Handle de rotation (au-dessus du centre haut)
    if (rotate && map) {
      const centerTop = L.value.latLng(
        bounds.getNorth(),
        (bounds.getWest() + bounds.getEast()) / 2
      );
      const centerTopPoint = map.latLngToLayerPoint(centerTop);
      const rotateHandlePoint = L.value.point(centerTopPoint.x, centerTopPoint.y - rotateOffsetPx);
      result.rotate = map.layerPointToLatLng(rotateHandlePoint);
    }

    // Centre
    if (center) {
      result.center = bounds.getCenter();
    }

    return result;
  };

  /**
   * Calcule les nouvelles bounds à partir d'un handle déplacé
   * @param handleType - Type de handle ('corner' | 'edge')
   * @param handleIndex - Index du handle déplacé
   * @param newPosition - Nouvelle position du handle
   * @param originalBounds - Bounds originaux avant le déplacement
   * @returns Nouvelles bounds ou null si invalide
   */
  const calculateBoundsFromHandle = (
    handleType: 'corner' | 'edge',
    handleIndex: number,
    newPosition: L.LatLng,
    originalBounds: L.LatLngBounds
  ): L.LatLngBounds | null => {
    if (!L.value) return null;

    let newBounds: L.LatLngBounds;

    if (handleType === 'corner') {
      // Coins: 0=SW, 1=NW, 2=NE, 3=SE
      switch (handleIndex) {
        case 0: // Sud-Ouest
          newBounds = L.value.latLngBounds(newPosition, originalBounds.getNorthEast());
          break;
        case 1: // Nord-Ouest
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), newPosition.lng],
            [newPosition.lat, originalBounds.getEast()]
          );
          break;
        case 2: // Nord-Est
          newBounds = L.value.latLngBounds(originalBounds.getSouthWest(), newPosition);
          break;
        case 3: // Sud-Est
          newBounds = L.value.latLngBounds(
            [newPosition.lat, originalBounds.getWest()],
            [originalBounds.getNorth(), newPosition.lng]
          );
          break;
        default:
          return null;
      }
    } else if (handleType === 'edge') {
      // Bords: 0=gauche, 1=haut, 2=droite, 3=bas
      switch (handleIndex) {
        case 0: // Gauche
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), newPosition.lng],
            [originalBounds.getNorth(), originalBounds.getEast()]
          );
          break;
        case 1: // Haut
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), originalBounds.getWest()],
            [newPosition.lat, originalBounds.getEast()]
          );
          break;
        case 2: // Droite
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), originalBounds.getWest()],
            [originalBounds.getNorth(), newPosition.lng]
          );
          break;
        case 3: // Bas
          newBounds = L.value.latLngBounds(
            [newPosition.lat, originalBounds.getWest()],
            [originalBounds.getNorth(), originalBounds.getEast()]
          );
          break;
        default:
          return null;
      }
    } else {
      return null;
    }

    return newBounds;
  };

  /**
   * Définit le curseur sur le container de la carte
   * @param map - Instance de la carte Leaflet
   * @param cursor - Type de curseur CSS
   */
  const setMapCursor = (map: L.Map | null, cursor: string): void => {
    if (!map) return;
    map.getContainer().style.cursor = cursor;
  };

  /**
   * Réinitialise le curseur de la carte
   * @param map - Instance de la carte Leaflet
   */
  const resetMapCursor = (map: L.Map | null): void => {
    setMapCursor(map, '');
  };

  /**
   * Crée un marker stylisé avec un DivIcon
   * @param latlng - Position géographique du marker
   * @param style - Configuration du style (html, className, iconSize)
   * @param options - Options Leaflet pour le marker (draggable, etc.)
   * @param map - Instance de la carte Leaflet (optionnel, si fourni ajoute le marker à la carte)
   * @returns Marker Leaflet ou null si L invalide
   */
  const createStyledMarker = (
    latlng: L.LatLng | [number, number],
    style: {
      html: string;
      className?: string;
      iconSize?: [number, number];
      iconAnchor?: [number, number];
    },
    options: L.MarkerOptions = {},
    map?: L.Map
  ): L.Marker | null => {
    if (!L.value) return null;

    const { html, className = 'leaflet-styled-marker', iconSize = [12, 12], iconAnchor } = style;

    const icon = L.value.divIcon({
      className,
      html,
      iconSize,
      iconAnchor,
    });

    const marker = L.value.marker(latlng, {
      ...options,
      icon,
    });

    if (map) {
      marker.addTo(map);
    }

    return marker;
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
    fromGeoJSONCoords,
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
    // Translation et offset
    translatePointByPixels,
    calculatePixelOffset,
    // Gestion des handles
    calculateHandlePositions,
    calculateBoundsFromHandle,
    // Gestion des curseurs
    setMapCursor,
    resetMapCursor,
    // Création de markers
    createStyledMarker,
  };
};
