/**
 * @type registry:ui
 * @category geography
 *
 * @demo LeafletSimple
 */

import type { InjectionKey, Ref } from 'vue';
import type { Map, TileLayerOptions } from 'leaflet';

export { default as LeafletMap } from './LeafletMap.vue';
export { default as LeafletTileLayer } from './LeafletTileLayer.vue';
export { default as LeafletMarker } from './LeafletMarker.vue';

export const LeafletMapKey: InjectionKey<Ref<Map | null>> = Symbol('LeafletMap');
export const LeafletTileLayersKey: InjectionKey<
  Ref<TileLayerOptions & { name: string } & { urlTemplate: string }>
> = Symbol('LeafletTileLayerOptions');

export type { LeafletMapProps } from './LeafletMap.vue';
export type { LeafletTileLayerProps } from './LeafletTileLayer.vue';
export type { LeafletMarkerProps } from './LeafletMarker.vue';
