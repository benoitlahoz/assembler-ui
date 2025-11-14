---
title: useLeaflet
description: Composable with Leaflet dynamic import client-side and utilities.
---

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-leaflet.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-leaflet.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-leaflet.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-leaflet.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-leaflet/useLeaflet.ts"}

```ts [src/composables/use-leaflet/useLeaflet.ts]
import { ref, type Ref } from "vue";
import type Leaflet from "leaflet";
import area from "@turf/area";
import length from "@turf/length";
import distance from "@turf/distance";
import centroid from "@turf/centroid";
import type { Position } from "geojson";

type Leaflet = typeof Leaflet;
type LatLng = Leaflet.LatLng;

let L: Ref<Leaflet | undefined> = ref(undefined);

const LatDegreesMeters = 111320;

export const useLeaflet = async () => {
  if (typeof window !== "undefined") {
    await import("leaflet/dist/leaflet.css");
    L.value = (await import("leaflet")).default;
  }

  const radiusToLatDegrees = (radiusInMeters: number) => {
    return radiusInMeters / LatDegreesMeters;
  };

  const latDegreesToRadius = (latDegrees: number) => {
    return latDegrees * LatDegreesMeters;
  };

  const radiusToLngDegrees = (radiusInMeters: number, lat: number) => {
    return (
      radiusInMeters / (LatDegreesMeters * Math.cos((lat * Math.PI) / 180))
    );
  };

  const lngDegreesToRadius = (lngDegrees: number, lat: number) => {
    return lngDegrees * LatDegreesMeters * Math.cos((lat * Math.PI) / 180);
  };

  const toGeoJSONCoords = (latlngs: LatLng[]): Position[] => {
    return latlngs.map((ll) => [ll.lng, ll.lat]);
  };

  const fromGeoJSONCoords = (coords: Position[]): LatLng[] => {
    return coords
      .filter(
        (c): c is [number, number] | [number, number, number] =>
          c[0] !== undefined && c[1] !== undefined,
      )
      .map((c) => new L.value!.LatLng(c[1], c[0]));
  };

  const calculateLineDistance = (
    latlngs: LatLng[],
    unit: "metric" | "imperial" = "metric",
  ): number => {
    if (latlngs.length < 2) return 0;

    const coords = toGeoJSONCoords(latlngs);
    const line = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: coords,
      },
    };

    const distanceKm = length(line, { units: "kilometers" });
    const distanceMeters = distanceKm * 1000;

    return unit === "metric" ? distanceMeters : distanceMeters * 3.28084;
  };

  const calculatePolygonArea = (
    latlngs: LatLng[],
    unit: "metric" | "imperial" = "metric",
  ): number | undefined => {
    if (latlngs.length < 3) return undefined;

    const coords = toGeoJSONCoords(latlngs);
    const closedCoords = [...coords, coords[0]].filter(
      (c): c is Position => c !== undefined,
    );

    const polygon = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Polygon" as const,
        coordinates: [closedCoords],
      },
    };

    const areaM2 = area(polygon);
    return unit === "metric" ? areaM2 : areaM2 * 10.7639;
  };

  const calculateCentroid = (
    latlngs: LatLng[],
  ): [number, number] | undefined => {
    if (latlngs.length < 3) return undefined;

    const coords = toGeoJSONCoords(latlngs);
    const closedCoords = [...coords, coords[0]].filter(
      (c): c is Position => c !== undefined,
    );

    const polygon = {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "Polygon" as const,
        coordinates: [closedCoords],
      },
    };

    const center = centroid(polygon);
    return center.geometry.coordinates as [number, number];
  };

  const calculateDistance = (
    from: LatLng | [number, number],
    to: LatLng | [number, number],
    unit: "metric" | "imperial" = "metric",
  ): number => {
    const fromCoords = Array.isArray(from) ? from : [from.lng, from.lat];
    const toCoords = Array.isArray(to) ? to : [to.lng, to.lat];

    const distanceKm = distance(fromCoords, toCoords, { units: "kilometers" });
    const distanceMeters = distanceKm * 1000;

    return unit === "metric" ? distanceMeters : distanceMeters * 3.28084;
  };

  const formatDistance = (
    distanceInMeters: number,
    unit: "metric" | "imperial" = "metric",
  ): string => {
    if (unit === "metric") {
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

  const formatArea = (
    areaInM2: number,
    unit: "metric" | "imperial" = "metric",
  ): string => {
    if (unit === "metric") {
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

  const calculateMidpoint = (
    point1: LatLng,
    point2: LatLng,
  ): [number, number] => {
    const midLat = (point1.lat + point2.lat) / 2;
    const midLng = (point1.lng + point2.lng) / 2;
    return [midLat, midLng];
  };

  const calculateRadiusPoint = (
    center: LatLng,
    radiusInMeters: number,
  ): [number, number] => {
    const lat = center.lat;
    const lng = center.lng + radiusToLngDegrees(radiusInMeters, center.lat);
    return [lat, lng];
  };

  const calculateCircleBounds = (
    center: LatLng,
    radiusInMeters: number,
  ): { southWest: [number, number]; northEast: [number, number] } => {
    const radiusInLatDegrees = radiusToLatDegrees(radiusInMeters);
    const radiusInLngDegrees = radiusToLngDegrees(radiusInMeters, center.lat);

    return {
      southWest: [
        center.lat - radiusInLatDegrees,
        center.lng - radiusInLngDegrees,
      ],
      northEast: [
        center.lat + radiusInLatDegrees,
        center.lng + radiusInLngDegrees,
      ],
    };
  };

  const pixelsToMeters = (zoom: number, latitude: number): number => {
    const earthCircumference = 40075016.686;
    return (
      (earthCircumference * Math.abs(Math.cos((latitude * Math.PI) / 180))) /
      Math.pow(2, zoom + 8)
    );
  };

  const constrainToSquare = (
    bounds: L.LatLngBounds,
    center?: L.LatLng,
    originalBounds?: L.LatLngBounds,
  ): L.LatLngBounds => {
    if (!L.value) return bounds;

    const currentCenter = center || bounds.getCenter();
    const latDiff = bounds.getNorth() - bounds.getSouth();
    const lngDiff = bounds.getEast() - bounds.getWest();

    const latMeters = latDiff * LatDegreesMeters;
    const lngMeters = lngDegreesToRadius(lngDiff, currentCenter.lat);

    let targetMeters = latMeters;
    if (originalBounds) {
      const origLatDiff = originalBounds.getNorth() - originalBounds.getSouth();
      const origLngDiff = originalBounds.getEast() - originalBounds.getWest();
      const origLatMeters = origLatDiff * LatDegreesMeters;
      const origLngMeters = lngDegreesToRadius(origLngDiff, currentCenter.lat);

      const latChange = Math.abs(latMeters - origLatMeters);
      const lngChange = Math.abs(lngMeters - origLngMeters);

      targetMeters = lngChange > latChange ? lngMeters : latMeters;
    } else {
      targetMeters = (latMeters + lngMeters) / 2;
    }

    const halfLatDiff = targetMeters / 2 / LatDegreesMeters;
    const halfLngDiff = radiusToLngDegrees(targetMeters / 2, currentCenter.lat);

    return L.value.latLngBounds(
      [currentCenter.lat - halfLatDiff, currentCenter.lng - halfLngDiff],
      [currentCenter.lat + halfLatDiff, currentCenter.lng + halfLngDiff],
    );
  };

  const normalizeLatLngs = (
    latlngs: Array<[number, number]> | Array<{ lat: number; lng: number }>,
  ): Array<[number, number]> => {
    return latlngs.map((point) => {
      if (Array.isArray(point)) {
        return point;
      }
      return [point.lat, point.lng] as [number, number];
    });
  };

  const translatePointByPixels = (
    latlng: L.LatLng,
    deltaX: number,
    deltaY: number,
    map: L.Map,
  ): L.LatLng | null => {
    if (!L.value || !map) return null;
    const point = map.latLngToContainerPoint(latlng);
    const newPoint = L.value.point(point.x + deltaX, point.y + deltaY);
    return map.containerPointToLatLng(newPoint);
  };

  const calculatePixelOffset = (
    from: L.LatLng,
    to: L.LatLng,
    map: L.Map,
  ): { x: number; y: number } | null => {
    if (!L.value || !map) return null;
    const fromPoint = map.latLngToContainerPoint(from);
    const toPoint = map.latLngToContainerPoint(to);
    return {
      x: toPoint.x - fromPoint.x,
      y: toPoint.y - fromPoint.y,
    };
  };

  const calculateHandlePositions = (
    bounds: L.LatLngBounds,
    map: L.Map,
    options: {
      corners?: boolean;
      edges?: boolean;
      rotate?: boolean;
      center?: boolean;
      rotateOffsetPx?: number;
    } = {},
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

    if (corners) {
      result.corners = [
        bounds.getSouthWest(),
        bounds.getNorthWest(),
        bounds.getNorthEast(),
        bounds.getSouthEast(),
      ];
    }

    if (edges) {
      result.edges = [
        L.value.latLng(
          (bounds.getSouth() + bounds.getNorth()) / 2,
          bounds.getWest(),
        ),
        L.value.latLng(
          bounds.getNorth(),
          (bounds.getWest() + bounds.getEast()) / 2,
        ),
        L.value.latLng(
          (bounds.getSouth() + bounds.getNorth()) / 2,
          bounds.getEast(),
        ),
        L.value.latLng(
          bounds.getSouth(),
          (bounds.getWest() + bounds.getEast()) / 2,
        ),
      ];
    }

    if (rotate && map) {
      const centerTop = L.value.latLng(
        bounds.getNorth(),
        (bounds.getWest() + bounds.getEast()) / 2,
      );
      const centerTopPoint = map.latLngToLayerPoint(centerTop);
      const rotateHandlePoint = L.value.point(
        centerTopPoint.x,
        centerTopPoint.y - rotateOffsetPx,
      );
      result.rotate = map.layerPointToLatLng(rotateHandlePoint);
    }

    if (center) {
      result.center = bounds.getCenter();
    }

    return result;
  };

  const calculateBoundsFromHandle = (
    handleType: "corner" | "edge",
    handleIndex: number,
    newPosition: L.LatLng,
    originalBounds: L.LatLngBounds,
  ): L.LatLngBounds | null => {
    if (!L.value) return null;

    let newBounds: L.LatLngBounds;

    if (handleType === "corner") {
      switch (handleIndex) {
        case 0:
          newBounds = L.value.latLngBounds(
            newPosition,
            originalBounds.getNorthEast(),
          );
          break;
        case 1:
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), newPosition.lng],
            [newPosition.lat, originalBounds.getEast()],
          );
          break;
        case 2:
          newBounds = L.value.latLngBounds(
            originalBounds.getSouthWest(),
            newPosition,
          );
          break;
        case 3:
          newBounds = L.value.latLngBounds(
            [newPosition.lat, originalBounds.getWest()],
            [originalBounds.getNorth(), newPosition.lng],
          );
          break;
        default:
          return null;
      }
    } else if (handleType === "edge") {
      switch (handleIndex) {
        case 0:
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), newPosition.lng],
            [originalBounds.getNorth(), originalBounds.getEast()],
          );
          break;
        case 1:
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), originalBounds.getWest()],
            [newPosition.lat, originalBounds.getEast()],
          );
          break;
        case 2:
          newBounds = L.value.latLngBounds(
            [originalBounds.getSouth(), originalBounds.getWest()],
            [originalBounds.getNorth(), newPosition.lng],
          );
          break;
        case 3:
          newBounds = L.value.latLngBounds(
            [newPosition.lat, originalBounds.getWest()],
            [originalBounds.getNorth(), originalBounds.getEast()],
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

  const setMapCursor = (map: L.Map | null, cursor: string): void => {
    if (!map) return;
    map.getContainer().style.cursor = cursor;
  };

  const resetMapCursor = (map: L.Map | null): void => {
    setMapCursor(map, "");
  };

  const createStyledMarker = (
    latlng: L.LatLng | [number, number],
    style: {
      html: string;
      className?: string;
      iconSize?: [number, number];
      iconAnchor?: [number, number];
    },
    options: L.MarkerOptions = {},
    map?: L.Map,
  ): L.Marker | null => {
    if (!L.value) return null;

    const {
      html,
      className = "leaflet-styled-marker",
      iconSize = [12, 12],
      iconAnchor,
    } = style;

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

    radiusToLatDegrees,
    latDegreesToRadius,
    radiusToLngDegrees,
    lngDegreesToRadius,
    pixelsToMeters,

    toGeoJSONCoords,
    fromGeoJSONCoords,
    calculateLineDistance,
    calculatePolygonArea,
    calculateCentroid,
    calculateDistance,

    formatDistance,
    formatArea,

    calculateMidpoint,
    calculateRadiusPoint,
    calculateCircleBounds,

    constrainToSquare,

    normalizeLatLngs,

    translatePointByPixels,
    calculatePixelOffset,

    calculateHandlePositions,
    calculateBoundsFromHandle,

    setMapCursor,
    resetMapCursor,

    createStyledMarker,
  };
};
```
:::

## API
::hr-underline
::

  ### Returns

Circonférence de la Terre en mètres

| Property | Type | Description |
|----------|------|-------------|
| `L`{.primary .text-primary} | `any` | — |
| `LatDegreesMeters`{.primary .text-primary} | `any` | — |
| `radiusToLatDegrees`{.primary .text-primary} | `any` | Conversions degrés/mètres |
| `latDegreesToRadius`{.primary .text-primary} | `any` | — |
| `radiusToLngDegrees`{.primary .text-primary} | `any` | — |
| `lngDegreesToRadius`{.primary .text-primary} | `any` | — |
| `pixelsToMeters`{.primary .text-primary} | `any` | — |
| `toGeoJSONCoords`{.primary .text-primary} | `any` | Fonctions Turf.js (géométrie) |
| `fromGeoJSONCoords`{.primary .text-primary} | `any` | — |
| `calculateLineDistance`{.primary .text-primary} | `any` | — |
| `calculatePolygonArea`{.primary .text-primary} | `any` | — |
| `calculateCentroid`{.primary .text-primary} | `any` | — |
| `calculateDistance`{.primary .text-primary} | `any` | — |
| `formatDistance`{.primary .text-primary} | `any` | Formatage |
| `formatArea`{.primary .text-primary} | `any` | — |
| `calculateMidpoint`{.primary .text-primary} | `any` | Calculs utilitaires |
| `calculateRadiusPoint`{.primary .text-primary} | `any` | — |
| `calculateCircleBounds`{.primary .text-primary} | `any` | — |
| `constrainToSquare`{.primary .text-primary} | `any` | Contraintes |
| `normalizeLatLngs`{.primary .text-primary} | `any` | Normalisation |
| `translatePointByPixels`{.primary .text-primary} | `any` | Translation et offset |
| `calculatePixelOffset`{.primary .text-primary} | `any` | — |
| `calculateHandlePositions`{.primary .text-primary} | `any` | Gestion des handles |
| `calculateBoundsFromHandle`{.primary .text-primary} | `any` | — |
| `setMapCursor`{.primary .text-primary} | `any` | Gestion des curseurs |
| `resetMapCursor`{.primary .text-primary} | `any` | — |
| `createStyledMarker`{.primary .text-primary} | `any` | Création de markers |

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `Leaflet`{.primary .text-primary} | `type` | — |
| `LatLng`{.primary .text-primary} | `type` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
