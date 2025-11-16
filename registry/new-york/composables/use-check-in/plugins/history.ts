import { ref } from 'vue';
import type { CheckInPlugin } from '../types';
import type { CheckInDesk, CheckInItem } from '../useCheckIn';

export interface HistoryEntry<T = any> {
  action: 'check-in' | 'check-out' | 'update';
  id: string | number;
  data?: T;
  timestamp: number;
}

export interface HistoryOptions {
  /** Maximum number of history entries to keep */
  maxHistory?: number;
}

/**
 * Plugin to track history of check-in/check-out operations.
 * Adds methods: getHistory, clearHistory
 * Adds property: history (reactive array)
 *
 * @example
 * ```ts
 * const { desk } = createDesk('handlers', {
 *   plugins: [
 *     createHistoryPlugin({ maxHistory: 100 })
 *   ]
 * });
 *
 * const history = desk.getHistory();
 * desk.clearHistory();
 * ```
 */
export const createHistoryPlugin = <T = any>(options?: HistoryOptions): CheckInPlugin<T> => {
  const maxHistory = options?.maxHistory || 50;

  return {
    name: 'history',
    version: '1.0.0',

    install: (desk) => {
      const history = ref<HistoryEntry<T>[]>([]);

      // Add history to desk
      (desk as any).history = history;

      // Listen to events
      const unsubCheckIn = desk.on('check-in', ({ id, data, timestamp }) => {
        history.value.push({ action: 'check-in', id: id!, data: data as any, timestamp });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      const unsubCheckOut = desk.on('check-out', ({ id, timestamp }) => {
        history.value.push({ action: 'check-out', id: id!, timestamp });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      const unsubUpdate = desk.on('update', ({ id, data, timestamp }) => {
        history.value.push({ action: 'update', id: id!, data: data as any, timestamp });
        if (history.value.length > maxHistory) {
          history.value.shift();
        }
      });

      // Cleanup
      return () => {
        unsubCheckIn();
        unsubCheckOut();
        unsubUpdate();
        history.value = [];
      };
    },

    methods: {
      /**
       * Get the history of operations
       */
      getHistory(desk: CheckInDesk<T>): HistoryEntry<T>[] {
        return (desk as any).history?.value || [];
      },

      /**
       * Clear the history
       */
      clearHistory(desk: CheckInDesk<T>) {
        const deskWithHistory = desk as any;
        if (deskWithHistory.history) {
          deskWithHistory.history.value = [];
        }
      },

      /**
       * Get last N history entries
       */
      getLastHistory(desk: CheckInDesk<T>, count: number): HistoryEntry<T>[] {
        const history = (desk as any).history?.value || [];
        return history.slice(-count);
      },

      /**
       * Get history filtered by action type
       */
      getHistoryByAction(
        desk: CheckInDesk<T>,
        action: 'check-in' | 'check-out' | 'update'
      ): HistoryEntry<T>[] {
        const history = (desk as any).history?.value || [];
        return history.filter((entry: HistoryEntry<T>) => entry.action === action);
      },
    },
  };
};
