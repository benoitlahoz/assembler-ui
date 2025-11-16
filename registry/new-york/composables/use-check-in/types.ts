import type { CheckInDesk } from './useCheckIn';

/**
 * Plugin interface for extending CheckInDesk functionality.
 * Plugins can hook into the desk lifecycle and add custom methods/properties.
 *
 * @example
 * ```ts
 * const myPlugin: CheckInPlugin<MyData> = {
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   install: (desk) => {
 *     // Setup plugin state
 *     return () => {
 *       // Cleanup
 *     };
 *   },
 *   onCheckIn: (id, data) => {
 *     console.log('Item checked in:', id, data);
 *   },
 *   methods: {
 *     customMethod: (desk, arg) => {
 *       // Custom method implementation
 *       return desk.get(arg);
 *     }
 *   }
 * };
 * ```
 */
export interface CheckInPlugin<T = any> {
  /** Unique plugin name */
  name: string;

  /** Optional version */
  version?: string;

  /**
   * Called when the plugin is installed on a desk.
   * Return a cleanup function to be called when the desk is cleared.
   */
  install?: (desk: CheckInDesk<T>) => void | (() => void);

  /**
   * Called before an item is checked in.
   * Return false to cancel the check-in.
   */
  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;

  /**
   * Called after an item is successfully checked in.
   */
  onCheckIn?: (id: string | number, data: T) => void;

  /**
   * Called before an item is checked out.
   * Return false to cancel the check-out.
   */
  onBeforeCheckOut?: (id: string | number) => void | boolean;

  /**
   * Called after an item is successfully checked out.
   */
  onCheckOut?: (id: string | number) => void;

  /**
   * Custom methods to add to the desk.
   * First parameter is always the desk itself.
   */
  methods?: Record<string, (desk: CheckInDesk<T>, ...args: any[]) => any>;

  /**
   * Computed properties to add to the desk.
   * Getters receive the desk as parameter.
   */
  computed?: Record<string, (desk: CheckInDesk<T>) => any>;
}
