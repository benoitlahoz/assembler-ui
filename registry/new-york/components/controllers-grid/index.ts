/**
 * ControllersGrid - Composant de grille drag-and-drop
 *
 * @type registry:ui
 * @category controls
 *
 * @demo SimpleExample
 * @demo AdvancedExample
 * @demo ControlRegistryDemo
 */

export { default as ControllersGrid } from './ControllersGrid.vue';

export { useControllersGrid, useComponentPalette, useGridConfig } from './composables';

export {
  GridUtils,
  type GridItem,
  type GridPosition,
  type GridDimensions,
  type GridConfig,
  type GridItemTemplate,
  type GridEvents,
  type GridMethods,
  type GridProps,
  type DragState,
} from './types';
