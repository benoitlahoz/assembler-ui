/**
 * @type registry:ui
 * @category geography
 *
 * @demo LeafletSimple
 * @demo LeafletEditionDemo
 */

import type { InjectionKey, Ref } from 'vue';
import type * as L from 'leaflet';
import type { Map, TileLayerOptions } from 'leaflet';
type L = typeof L;

export { default as LeafletMap } from './LeafletMap.vue';
export { default as LeafletZoomControl } from './LeafletZoomControl.vue';
export { default as LeafletDrawControl } from './LeafletDrawControl.vue';
export { default as LeafletFeaturesEditor } from './LeafletFeaturesEditor.vue';
export { default as LeafletBoundingBox } from './LeafletBoundingBox.vue';
export { default as LeafletBoundingBoxCornerHandle } from './LeafletBoundingBoxCornerHandle.vue';
export { default as LeafletTileLayer } from './LeafletTileLayer.vue';
export { default as LeafletMarker } from './LeafletMarker.vue';
export { default as LeafletCircle } from './LeafletCircle.vue';
export { default as LeafletPolyline } from './LeafletPolyline.vue';
export { default as LeafletPolygon } from './LeafletPolygon.vue';
export { default as LeafletRectangle } from './LeafletRectangle.vue';

export const LeafletModuleKey: InjectionKey<Ref<L | undefined>> = Symbol('LeafletModule');
export const LeafletMapKey: InjectionKey<Ref<Map | null>> = Symbol('LeafletMap');
export const LeafletTileLayersKey: InjectionKey<
  Ref<TileLayerOptions & { name: string } & { urlTemplate: string }>
> = Symbol('LeafletTileLayerOptions');
export const LeafletErrorsKey: InjectionKey<Ref<Error[]>> = Symbol('LeafletErrors');
export const LeafletBoundingBoxHandlesKey: InjectionKey<Ref<L.Marker<any>[]>> = Symbol(
  'LeafletBoundingBoxHandles'
);

export type { LeafletMapProps } from './LeafletMap.vue';
export type { LeafletMapExposed } from './LeafletMap.vue';
export type { LeafletZoomControlProps } from './LeafletZoomControl.vue';
export type { LeafletDrawControlProps } from './LeafletDrawControl.vue';
export type {
  LeafletFeaturesEditorProps,
  FeatureDrawEvent,
  FeatureSelectMode,
  FeatureShapeType,
} from './LeafletFeaturesEditor.vue';
export type { LeafletBoundingBoxProps, LeafletBoundingBoxFeatures } from './LeafletBoundingBox.vue';
export type { LeafletTileLayerProps } from './LeafletTileLayer.vue';
export type { LeafletMarkerProps } from './LeafletMarker.vue';
export type { LeafletCircleProps } from './LeafletCircle.vue';
export type { LeafletPolylineProps } from './LeafletPolyline.vue';
export type { LeafletPolygonProps } from './LeafletPolygon.vue';
export type { LeafletRectangleProps } from './LeafletRectangle.vue';
