/**
 * Generic check-in system for parent/child component registration pattern.
 * Like an airport check-in desk: parent components provide a check-in counter
 * where child components register themselves with their data.
 *
 * @type registry:hook
 * @category data
 *
 * @demo FormDemo
 * @demo AccordionDemo
 * @demo TabsDemo
 * @demo ToolbarDemo
 */

import {
  ref,
  provide,
  inject,
  onMounted,
  onBeforeUnmount,
  onUnmounted,
  watch,
  computed,
  triggerRef,
  nextTick,
  type InjectionKey,
  type Ref,
  type ComputedRef,
} from 'vue';

// ==========================================
// TYPES
// ==========================================

export interface CheckInItem<T = any> {
  id: string | number;
  data: T;
  timestamp?: number;
  meta?: Record<string, any>;
}

export interface CheckInDesk<T = any, TContext extends Record<string, any> = {}> {
  registry: Ref<Map<string | number, CheckInItem<T>>>;
  checkIn: (id: string | number, data: T, meta?: Record<string, any>) => void;
  checkOut: (id: string | number) => void;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: {
    sortBy?: keyof T | 'timestamp';
    order?: 'asc' | 'desc';
  }) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => void;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (items: Array<{ id: string | number; data: T; meta?: Record<string, any> }>) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (updates: Array<{ id: string | number; data: Partial<T> }>) => void;
}

export interface CheckInDeskOptions<T = any, TContext extends Record<string, any> = {}> {
  /** Contexte additionnel à merger avec le desk (typé) */
  extraContext?: TContext;
  /** Callback appelé avant le check-in d'un item */
  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;
  /** Callback appelé après le check-in d'un item */
  onCheckIn?: (id: string | number, data: T) => void;
  /** Callback appelé avant le check-out d'un item */
  onBeforeCheckOut?: (id: string | number) => void | boolean;
  /** Callback appelé après le check-out d'un item */
  onCheckOut?: (id: string | number) => void;
  /** Active le mode debug avec logging */
  debug?: boolean;
}

export interface CheckInOptions<T = any> {
  /** Lève une erreur si le desk n'existe pas */
  required?: boolean;
  /** Auto check-in au montage du composant */
  autoCheckIn?: boolean;
  /** ID de l'item à enregistrer */
  id?: string | number;
  /** Données de l'item à enregistrer (peut être async) */
  data?: T | (() => T) | (() => Promise<T>);
  /** Fonction pour générer un ID unique si non fourni */
  generateId?: () => string | number;
  /** Watch les changements de data pour mettre à jour l'enregistrement */
  watchData?: boolean;
  /** Watch shallow au lieu de deep (meilleure performance) */
  shallow?: boolean;
  /** Condition réactive pour check-in/out automatique */
  watchCondition?: (() => boolean) | Ref<boolean>;
  /** Métadonnées additionnelles */
  meta?: Record<string, any>;
  /** Active le mode debug avec logging */
  debug?: boolean;
}

const NoOpDebug = (_message: string, ..._args: any[]) => {};

const Debug = (message: string, ...args: any[]) => {
  console.log(`[useCheckIn] ${message}`, ...args);
};

// ==========================================
// COMPOSABLE PRINCIPAL
// ==========================================

/**
 * Check-in system for managing parent-child component relationships.
 * Like an airport check-in desk where passengers register their luggage.
 *
 * @example
 * ```ts
 * // In parent component - open a desk
 * const { openDesk } = useCheckIn<TabItem, { activeTab: Ref<string> }>();
 * const desk = openDesk({
 *   extraContext: { activeTab: ref('tab1') }
 * });
 *
 * // In child component - check in at parent's desk
 * const { checkIn } = useCheckIn<TabItem>();
 * checkIn(desk, {
 *   autoCheckIn: true,
 *   id: props.id,
 *   data: () => ({ label: props.label })
 * });
 * ```
 */
export const useCheckIn = <T = any, TContext extends Record<string, any> = {}>() => {
  /**
   * Creates a check-in desk context (internal helper)
   */
  const createDeskContext = <T = any, TContext extends Record<string, any> = {}>(
    options?: CheckInDeskOptions<T, TContext>
  ): CheckInDesk<T, TContext> => {
    const registry = ref<Map<string | number, CheckInItem<T>>>(new Map()) as Ref<
      Map<string | number, CheckInItem<T>>
    >;

    const debug = options?.debug ? Debug : NoOpDebug;

    const checkIn = (id: string | number, data: T, meta?: Record<string, any>) => {
      debug('checkIn', { id, data, meta });

      // Lifecycle: before
      if (options?.onBeforeCheckIn) {
        const result = options.onBeforeCheckIn(id, data);
        if (result === false) {
          debug('checkIn cancelled by onBeforeCheckIn', id);
          return;
        }
      }

      registry.value.set(id, {
        id,
        data: data as any,
        timestamp: Date.now(),
        meta,
      });
      triggerRef(registry);

      // Lifecycle: after
      options?.onCheckIn?.(id, data);
    };

    const checkOut = (id: string | number) => {
      debug('checkOut', id);

      const existed = registry.value.has(id);
      if (!existed) return;

      // Lifecycle: before
      if (options?.onBeforeCheckOut) {
        const result = options.onBeforeCheckOut(id);
        if (result === false) {
          debug('checkOut cancelled by onBeforeCheckOut', id);
          return;
        }
      }

      registry.value.delete(id);
      triggerRef(registry);

      // Lifecycle: after
      options?.onCheckOut?.(id);
    };

    const get = (id: string | number) => registry.value.get(id);

    const getAll = (sortOptions?: { sortBy?: keyof T | 'timestamp'; order?: 'asc' | 'desc' }) => {
      const items = Array.from(registry.value.values());

      if (!sortOptions?.sortBy) return items;

      return items.sort((a, b) => {
        let aVal: any, bVal: any;

        if (sortOptions.sortBy === 'timestamp') {
          aVal = a.timestamp || 0;
          bVal = b.timestamp || 0;
        } else {
          const key = sortOptions.sortBy as keyof T;
          aVal = a.data[key];
          bVal = b.data[key];
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortOptions.order === 'desc' ? -comparison : comparison;
      });
    };

    const update = (id: string | number, data: Partial<T>) => {
      const existing = registry.value.get(id);
      if (existing && typeof existing.data === 'object' && typeof data === 'object') {
        checkIn(id, { ...existing.data, ...data } as T, existing.meta);
      }
    };

    const has = (id: string | number) => registry.value.has(id);

    const clear = () => {
      debug('clear');
      registry.value.clear();
      triggerRef(registry);
    };

    const checkInMany = (
      items: Array<{ id: string | number; data: T; meta?: Record<string, any> }>
    ) => {
      debug('checkInMany', items.length, 'items');
      items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
    };

    const checkOutMany = (ids: Array<string | number>) => {
      debug('checkOutMany', ids.length, 'items');
      ids.forEach((id) => checkOut(id));
    };

    const updateMany = (updates: Array<{ id: string | number; data: Partial<T> }>) => {
      debug('updateMany', updates.length, 'items');
      updates.forEach(({ id, data }) => update(id, data));
    };

    return {
      registry,
      checkIn,
      checkOut,
      get,
      getAll,
      update,
      has,
      clear,
      checkInMany,
      checkOutMany,
      updateMany,
    };
  };

  /**
   * Opens a check-in desk (parent component provides the desk)
   */
  const openDesk = (options?: CheckInDeskOptions<T, TContext>) => {
    const deskSymbol = Symbol('CheckInDesk') as InjectionKey<CheckInDesk<T, TContext> & TContext>;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.extraContext || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(deskSymbol, fullContext);

    // Return both the desk and its symbol for children to inject
    return {
      desk: fullContext,
      deskSymbol,
    };
  };

  /**
   * Checks in to the desk (child component registers itself)
   */
  const checkIn = <
    TDesk extends CheckInDesk<T, TContext> & TContext = CheckInDesk<T, TContext> & TContext,
  >(
    parentDeskOrSymbol:
      | (CheckInDesk<T, TContext> & TContext)
      | InjectionKey<CheckInDesk<T, TContext> & TContext>
      | null
      | undefined,
    checkInOptions?: CheckInOptions<T>
  ) => {
    const debug = checkInOptions?.debug ? Debug : NoOpDebug;

    // Auto-handle null/undefined context - no need for ternary pattern
    if (!parentDeskOrSymbol) {
      debug('[useCheckIn] No parent desk provided - skipping check-in');

      return {
        desk: null as TDesk | null,
        checkOut: () => {},
        updateSelf: () => {},
      };
    }

    // Inject the desk if a symbol is provided
    let desk: (CheckInDesk<T, TContext> & TContext) | null | undefined;

    if (typeof parentDeskOrSymbol === 'symbol') {
      desk = inject(parentDeskOrSymbol);
      if (!desk) {
        debug('[useCheckIn] Could not inject desk from symbol');

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else {
      desk = parentDeskOrSymbol;
    }

    const itemId = checkInOptions?.id || `item-${Date.now()}-${Math.random()}`;
    let isCheckedIn = ref(false);
    let conditionStopHandle: (() => void) | null = null;

    // Helper to get current data value (sync or async)
    const getCurrentData = async (): Promise<T> => {
      if (!checkInOptions?.data) return undefined as T;

      const dataValue =
        typeof checkInOptions.data === 'function'
          ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
          : checkInOptions.data;

      return dataValue instanceof Promise ? await dataValue : dataValue;
    };

    // Perform the actual check-in
    const performCheckIn = async () => {
      if (isCheckedIn.value) return;

      const data = await getCurrentData();
      desk!.checkIn(itemId, data, checkInOptions?.meta);
      isCheckedIn.value = true;

      debug(`[useCheckIn] Checked in: ${itemId}`, data);
    };

    // Perform check-out
    const performCheckOut = () => {
      if (!isCheckedIn.value) return;

      desk!.checkOut(itemId);
      isCheckedIn.value = false;

      debug(`[useCheckIn] Checked out: ${itemId}`);
    };

    // Setup watchCondition if provided
    if (checkInOptions?.watchCondition) {
      const condition = checkInOptions.watchCondition;

      // Immediate check
      const shouldBeCheckedIn = typeof condition === 'function' ? condition() : condition.value;
      if (shouldBeCheckedIn && checkInOptions?.autoCheckIn !== false) {
        performCheckIn();
      }

      // Watch for changes
      conditionStopHandle = watch(
        () => (typeof condition === 'function' ? condition() : condition.value),
        async (shouldCheckIn) => {
          if (shouldCheckIn && !isCheckedIn.value) {
            await performCheckIn();
          } else if (!shouldCheckIn && isCheckedIn.value) {
            performCheckOut();
          }
        }
      );
    }
    // Normal auto check-in (if no condition)
    else if (checkInOptions?.autoCheckIn !== false) {
      performCheckIn();
    }

    // Setup watchData if provided
    let watchStopHandle: (() => void) | null = null;
    if (checkInOptions?.watchData && checkInOptions?.data) {
      const watchOptions = checkInOptions.shallow ? { deep: false } : { deep: true };

      watchStopHandle = watch(
        () => {
          if (!checkInOptions.data) return undefined;
          return typeof checkInOptions.data === 'function'
            ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
            : checkInOptions.data;
        },
        async (newData) => {
          if (isCheckedIn.value && newData !== undefined) {
            const resolvedData = newData instanceof Promise ? await newData : newData;
            desk!.update(itemId, resolvedData);

            debug(`[useCheckIn] Updated data for: ${itemId}`, resolvedData);
          }
        },
        watchOptions
      );
    }

    // Cleanup on unmount
    onUnmounted(() => {
      performCheckOut();

      if (watchStopHandle) {
        watchStopHandle();
      }

      if (conditionStopHandle) {
        conditionStopHandle();
      }
    });

    return {
      desk: desk as TDesk,
      checkOut: performCheckOut,
      updateSelf: async (newData?: T) => {
        if (!isCheckedIn.value) return;

        const data = newData !== undefined ? newData : await getCurrentData();
        desk!.update(itemId, data);

        debug(`[useCheckIn] Manual update for: ${itemId}`, data);
      },
    };
  };

  /**
   * Generates a unique boarding pass ID
   */
  const generateId = (prefix = 'passenger'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Creates a standalone desk without injection (for local/testing usage)
   */
  const standaloneDesk = <T = any>(options?: CheckInDeskOptions<T>) => {
    return createDeskContext<T>(options);
  };

  /**
   * Computed helper to check if a specific ID is checked in
   */
  const isCheckedIn = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    id: string | number | Ref<string | number>
  ): ComputedRef<boolean> => {
    return computed(() => {
      const itemId = typeof id === 'object' && 'value' in id ? id.value : id;
      return desk.has(itemId);
    });
  };

  /**
   * Computed helper to get the registry as an array
   */
  const getRegistry = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    options?: { sortBy?: keyof T | 'timestamp'; order?: 'asc' | 'desc' }
  ): ComputedRef<CheckInItem<T>[]> => {
    return computed(() => desk.getAll(options));
  };

  return {
    openDesk,
    checkIn,
    generateId,
    standaloneDesk,
    isCheckedIn,
    getRegistry,
  };
};
