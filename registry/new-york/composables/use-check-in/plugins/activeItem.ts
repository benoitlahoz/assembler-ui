import { ref } from 'vue';
import type { CheckInPlugin } from '../types';
import type { CheckInDesk } from '../useCheckIn';

/**
 * Plugin to manage an active item in the desk.
 * Adds methods: setActive, getActive, clearActive
 * Adds computed: hasActive
 * Adds property: activeId
 * Emits event: 'active-changed'
 *
 * @example
 * ```ts
 * const { desk } = createDesk('handlers', {
 *   plugins: [createActiveItemPlugin()]
 * });
 *
 * desk.setActive('item-1');
 * const active = desk.getActive();
 * console.log(desk.hasActive); // true
 * ```
 */
export const createActiveItemPlugin = <T = any>(): CheckInPlugin<T> => ({
  name: 'active-item',
  version: '1.0.0',

  install: (desk) => {
    // Add reactive activeId state
    const activeId = ref<string | number | null>(null);
    (desk as any).activeId = activeId;

    // Cleanup
    return () => {
      activeId.value = null;
    };
  },

  methods: {
    /**
     * Set the active item by ID
     */
    setActive(desk: CheckInDesk<T>, id: string | number | null) {
      const deskWithActive = desk as any;
      const previousId = deskWithActive.activeId?.value;

      if (id === null) {
        deskWithActive.activeId.value = null;
        // Emit with undefined instead of null for type safety
        desk.emit('active-changed' as any, {
          id: undefined,
          data: undefined,
        });
        return true;
      }

      if (!desk.has(id)) return false;

      deskWithActive.activeId.value = id;
      desk.emit('active-changed' as any, {
        id,
        data: desk.get(id)?.data,
      });
      return true;
    },

    /**
     * Get the currently active item
     */
    getActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      const id = deskWithActive.activeId?.value;
      return id ? desk.get(id) : null;
    },

    /**
     * Clear the active item
     */
    clearActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      return deskWithActive.setActive?.(null);
    },
  },

  computed: {
    /**
     * Check if there's an active item
     */
    hasActive(desk: CheckInDesk<T>) {
      const deskWithActive = desk as any;
      return deskWithActive.activeId?.value !== null;
    },
  },
});
