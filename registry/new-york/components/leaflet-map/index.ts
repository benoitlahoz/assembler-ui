/**
 * @type registry:ui
 * @category geography
 *
 * @demo LeafletSimple
 * @demo LeafletEditionDemo
 * @demo LeafletVirtualizationDemo
 */

import type { InjectionKey, Ref } from 'vue';
import type * as L from 'leaflet';
import type { Map, TileLayerOptions } from 'leaflet';
import type { LeafletBoundingBoxStyles } from './LeafletBoundingBox.vue';
import type { LeafletMeasureToolStyles } from './LeafletMeasureTool.vue';
import type { LeafletSelectionContext } from './LeafletFeaturesSelector.vue';
import type { LeafletControlsContext } from './LeafletControls.vue';
type L = typeof L;

export { default as LeafletMap } from './LeafletMap.vue';
export { default as LeafletZoomControl } from './LeafletZoomControl.vue';
export { default as LeafletDrawControl } from './LeafletDrawControl.vue';
export { default as LeafletControls } from './LeafletControls.vue';
export { default as LeafletControlItem } from './LeafletControlItem.vue';
export { default as LeafletFeaturesEditor } from './LeafletFeaturesEditor.vue';
export { default as LeafletFeaturesSelector } from './LeafletFeaturesSelector.vue';
export { default as LeafletVirtualize } from './LeafletVirtualize.vue';
export { default as LeafletBoundingBox } from './LeafletBoundingBox.vue';
export { default as LeafletFeatureRectangle } from './LeafletFeatureRectangle.vue';
export { default as LeafletFeatureHandle } from './LeafletFeatureHandle.vue';
export { default as LeafletTileLayer } from './LeafletTileLayer.vue';
export { default as LeafletMarker } from './LeafletMarker.vue';
export { default as LeafletCircle } from './LeafletCircle.vue';
export { default as LeafletPolyline } from './LeafletPolyline.vue';
export { default as LeafletPolygon } from './LeafletPolygon.vue';
export { default as LeafletRectangle } from './LeafletRectangle.vue';
export { default as LeafletMeasureTool } from './LeafletMeasureTool.vue';

export const LeafletModuleKey: InjectionKey<Ref<L | undefined>> = Symbol('LeafletModule');
export const LeafletMapKey: InjectionKey<Ref<Map | null>> = Symbol('LeafletMap');
export const LeafletTileLayersKey: InjectionKey<
  Ref<TileLayerOptions & { name: string } & { urlTemplate: string }>
> = Symbol('LeafletTileLayerOptions');
export const LeafletErrorsKey: InjectionKey<Ref<Error[]>> = Symbol('LeafletErrors');
export const LeafletStylesKey: InjectionKey<Ref<Record<string, any> | undefined>> =
  Symbol('LeafletFeatureHandles');
export const LeafletSelectionKey: InjectionKey<LeafletSelectionContext> =
  Symbol('LeafletSelection');
export const LeafletControlsKey: InjectionKey<LeafletControlsContext | undefined> =
  Symbol('LeafletControls');

export type { LeafletMapProps } from './LeafletMap.vue';
export type { LeafletMapExposed } from './LeafletMap.vue';
export type { LeafletZoomControlProps } from './LeafletZoomControl.vue';
export type { LeafletDrawControlProps } from './LeafletDrawControl.vue';
export type {
  LeafletFeaturesEditorProps,
  FeatureDrawEvent,
  FeatureShapeType,
} from './LeafletFeaturesEditor.vue';
export {
  type FeatureSelectMode,
  type LeafletSelectionContext,
  type SelectedFeature,
  type FeatureReference,
  type LeafletFeaturesSelectorProps,
} from './LeafletFeaturesSelector.vue';
export type { LeafletBoundingBoxProps, LeafletBoundingBoxStyles } from './LeafletBoundingBox.vue';
export type {
  LeafletFeatureRectangleProps,
  LeafletFeatureRectangleStyle,
} from './LeafletFeatureRectangle.vue';
export type {
  LeafletFeatureHandleProps,
  LeafletFeatureHandleRole,
  LeafletFeatureHandleStyle,
} from './LeafletFeatureHandle.vue';
export type { LeafletTileLayerProps } from './LeafletTileLayer.vue';
export type { LeafletMarkerProps } from './LeafletMarker.vue';
export type { LeafletCircleProps } from './LeafletCircle.vue';
export type { LeafletPolylineProps } from './LeafletPolyline.vue';
export type { LeafletPolygonProps } from './LeafletPolygon.vue';
export type { LeafletRectangleProps } from './LeafletRectangle.vue';
export type { LeafletVirtualizeProps } from './LeafletVirtualize.vue';
export type { LeafletMeasureToolProps } from './LeafletMeasureTool.vue';
