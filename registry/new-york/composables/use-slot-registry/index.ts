/**
 * useSlotRegistry - Slot Registry Pattern
 *
 * Extension du système useCheckIn pour la gestion dynamique de slots/templates.
 *
 * @example
 * ```ts
 * import { useSlotRegistry } from './useSlotRegistry';
 *
 * // Créer un registre de slots
 * const { createSlotRegistry } = useSlotRegistry();
 * const { registry, renderSlots } = createSlotRegistry();
 *
 * // Enregistrer un slot
 * registerSlot(registry, {
 *   autoRegister: true,
 *   component: MyComponent,
 *   props: { foo: 'bar' },
 * });
 *
 * // Rendre les slots
 * const vnodes = renderSlots();
 * ```
 *
 * @module useSlotRegistry
 */

export {
  useSlotRegistry,
  type SlotType,
  type SlotPosition,
  type SlotScopedProps,
  type SlotRenderFunction,
  type SlotDefinition,
  type SlotRegistryOptions,
  type RegisterSlotOptions,
  type SlotRegistry,
} from './useSlotRegistry';

// Re-export from useCheckIn for convenience
export type {
  CheckInItem,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
  DeskEventType,
  DeskEventCallback,
} from '../use-check-in/useCheckIn';
