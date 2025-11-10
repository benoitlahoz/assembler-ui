/**
 * @type registry:ui
 * @category geography
 *
 * @demo LeafletSimple
 * @demo LeafletDrawDemo
 */

import type { InjectionKey, Ref } from 'vue';
import type * as L from 'leaflet';
import type { Map, TileLayerOptions } from 'leaflet';

type L = typeof L;

export { default as LeafletMap } from './LeafletMap.vue';
export { default as LeafletZoomControl } from './LeafletZoomControl.vue';
export { default as LeafletDrawControl } from './LeafletDrawControl.vue';
export { default as LeafletTileLayer } from './LeafletTileLayer.vue';
export { default as LeafletMarker } from './LeafletMarker.vue';
export { default as LeafletCircle } from './LeafletCircle.vue';

export const LeafletModuleKey: InjectionKey<Ref<L | undefined>> = Symbol('LeafletModule');
export const LeafletMapKey: InjectionKey<Ref<Map | null>> = Symbol('LeafletMap');
export const LeafletTileLayersKey: InjectionKey<
  Ref<TileLayerOptions & { name: string } & { urlTemplate: string }>
> = Symbol('LeafletTileLayerOptions');
export const LeafletErrorsKey: InjectionKey<Ref<Error[]>> = Symbol('LeafletErrors');

export type { LeafletMapProps } from './LeafletMap.vue';
export type { LeafletMapExposed } from './LeafletMap.vue';
export type { LeafletZoomControlProps } from './LeafletZoomControl.vue';
export type { LeafletDrawControlProps, DrawEvent } from './LeafletDrawControl.vue';
export type { LeafletTileLayerProps } from './LeafletTileLayer.vue';
export type { LeafletMarkerProps } from './LeafletMarker.vue';
export type { LeafletCircleProps } from './LeafletCircle.vue';
