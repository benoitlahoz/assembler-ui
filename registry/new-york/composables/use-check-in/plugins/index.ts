/**
 * Index des plugins pour le système de check-in
 */

export { createEventsPlugin, type EventsPlugin } from './events.plugin';
export { createRegistryPlugin, type RegistryPlugin } from './registry.plugin';
export { createSortingPlugin, clearSortCache, type SortingPlugin } from './sorting.plugin';
export { createIdPlugin, clearIdCache, type IdPlugin } from './id.plugin';
