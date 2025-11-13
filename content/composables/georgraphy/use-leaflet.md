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

  return {
    L,
    LatDegreesMeters,

    radiusToLatDegrees,
    latDegreesToRadius,
    radiusToLngDegrees,
    lngDegreesToRadius,
    pixelsToMeters,

    toGeoJSONCoords,
    calculateLineDistance,
    calculatePolygonArea,
    calculateCentroid,
    calculateDistance,

    formatDistance,
    formatArea,

    calculateMidpoint,
    calculateRadiusPoint,
    calculateCircleBounds,
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
| `calculateLineDistance`{.primary .text-primary} | `any` | — |
| `calculatePolygonArea`{.primary .text-primary} | `any` | — |
| `calculateCentroid`{.primary .text-primary} | `any` | — |
| `calculateDistance`{.primary .text-primary} | `any` | — |
| `formatDistance`{.primary .text-primary} | `any` | Formatage |
| `formatArea`{.primary .text-primary} | `any` | — |
| `calculateMidpoint`{.primary .text-primary} | `any` | Calculs utilitaires |
| `calculateRadiusPoint`{.primary .text-primary} | `any` | — |
| `calculateCircleBounds`{.primary .text-primary} | `any` | — |

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `Leaflet`{.primary .text-primary} | `type` | — |
| `LatLng`{.primary .text-primary} | `type` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
