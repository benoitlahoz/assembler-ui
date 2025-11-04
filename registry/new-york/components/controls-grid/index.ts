/**
 * ControlsGrid - Composant de grille drag-and-drop
 *
 * @type registry:ui
 * @category controls
 *
 * @demo SimpleExample
 * @demo AdvancedExample
 * @demo ControlRegistryDemo
 * @demo ComponentRegistration
 */

export { default as ControlsGrid } from './ControlsGrid.vue';

export { useControlsGrid, useComponentPalette, useGridConfig } from './composables';

export {
  GridUtils,
  type ComponentToRegister,
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
