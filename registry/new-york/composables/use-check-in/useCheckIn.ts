/**
 * Generic check-in system for parent/child component registration pattern.
 * Like an airport check-in desk: parent components provide a check-in counter
 * where child components register themselves with their data.
 *
 * @type registry:hook
 * @category data
 *
 * @demo PluginsRuntimeDemo
 */

import {
  ref,
  provide,
  inject,
  onUnmounted,
  watch,
  computed,
  triggerRef,
  type InjectionKey,
  type Ref,
  type ComputedRef,
} from 'vue';

// Export types
export type {
  DeskEventType,
  DeskEventPayload,
  DeskEventCallback,
  CheckInItem,
  CheckInItemMeta,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
  GetAllOptions,
  SortOptions,
  DeskProvider,
  CheckInReturn,
  DeskHook,
  HooksAPI,
  SlotsAPI,
  SlotConfig,
} from './types';

import type {
  CheckInItem,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
  DeskProvider,
  CheckInReturn,
  CheckInItemMeta,
  DeskEventType,
  DeskEventCallback,
  DeskEventPayload,
  DeskHook,
  SlotsAPI,
  HooksAPI,
  SlotConfig,
  GetAllOptions,
} from './types';

// ==========================================
// HELPERS
// ==========================================

const NoOpDebug = (_message: string, ..._args: any[]) => {};

const Debug = (message: string, ...args: any[]) => {
  console.log(`[useCheckIn] ${message}`, ...args);
};

// Cache pour les IDs mémorisés
const instanceIdMap = new WeakMap<object, string>();
const customIdMap = new Map<string, string>();

// Cache pour les fonctions de tri compilées
const sortFnCache = new Map<string, (a: CheckInItem<any>, b: CheckInItem<any>) => number>();

/**
 * Génère un ID unique et sécurisé
 */
const generateSecureId = (prefix = 'item'): string => {
  // Utiliser crypto.randomUUID si disponible (Node 19+, tous les navigateurs modernes)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  // Fallback: crypto.getRandomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `${prefix}-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16)}`;
  }

  // Fallback final: timestamp + random
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Compile une fonction de tri optimisée
 */
const compileSortFn = <T = any>(
  sortBy: keyof T | 'timestamp' | `meta.${string}`,
  order: 'asc' | 'desc' = 'asc'
): ((a: CheckInItem<T>, b: CheckInItem<T>) => number) => {
  const cacheKey = `${String(sortBy)}-${order}`;
  const cached = sortFnCache.get(cacheKey);
  if (cached) return cached;

  const fn = (a: CheckInItem<T>, b: CheckInItem<T>) => {
    let aVal: any;
    let bVal: any;

    if (sortBy === 'timestamp') {
      aVal = a.timestamp || 0;
      bVal = b.timestamp || 0;
    } else if (String(sortBy).startsWith('meta.')) {
      const metaKey = String(sortBy).slice(5);
      aVal = (a.meta as any)?.[metaKey];
      bVal = (b.meta as any)?.[metaKey];
    } else {
      aVal = a.data[sortBy as keyof T];
      bVal = b.data[sortBy as keyof T];
    }

    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    const result = aVal < bVal ? -1 : 1;
    return order === 'asc' ? result : -result;
  };

  sortFnCache.set(cacheKey, fn);
  return fn;
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
 * const { createDesk } = useCheckIn<TabItem, { activeTab: Ref<string> }>();
 * const desk = createDesk({
 *   context: { activeTab: ref('tab1') }
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

    // ==========================================
    // SYSTÈME D'ÉVÉNEMENTS (natif)
    // ==========================================
    const eventListeners = new Map<DeskEventType, Set<DeskEventCallback<T, any>>>();

    const emit = <E extends DeskEventType>(
      event: E,
      payload: Omit<DeskEventPayload<T>[E], 'timestamp'>
    ) => {
      const listeners = eventListeners.get(event);
      if (!listeners) return;

      const eventPayload = {
        ...payload,
        timestamp: Date.now(),
      } as DeskEventPayload<T>[E];

      debug(`[Event] ${event}`, eventPayload);
      listeners.forEach((callback) => callback(eventPayload));
    };

    const on = <E extends DeskEventType>(event: E, callback: DeskEventCallback<T, E>) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
      }
      eventListeners.get(event)!.add(callback);

      debug(`[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`);

      // Return unsubscribe function
      return () => off(event, callback);
    };

    const off = <E extends DeskEventType>(event: E, callback: DeskEventCallback<T, E>) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        debug(`[Event] Listener removed for '${event}', remaining: ${listeners.size}`);
      }
    };

    // ==========================================
    // REGISTRY (natif)
    // ==========================================
    const checkIn = (id: string | number, data: T, meta?: CheckInItemMeta): boolean => {
      debug('checkIn', { id, data, meta });

      // Lifecycle: before
      if (options?.onBeforeCheckIn) {
        const result = options.onBeforeCheckIn(id, data);
        if (result === false) {
          debug('checkIn cancelled by onBeforeCheckIn', id);
          return false;
        }
      }

      const item: CheckInItem<T> = {
        id,
        data: data as any,
        timestamp: Date.now(),
        meta,
      };

      registry.value.set(id, item);
      triggerRef(registry);

      // Emit event
      emit('check-in', { id, data });

      // Lifecycle: after
      options?.onCheckIn?.(id, data);

      // Hooks
      hooks.trigger('onCheckIn', item);

      if (options?.debug) {
        debug('Registry state after check-in:', {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const checkOut = (id: string | number): boolean => {
      debug('checkOut', id);

      const existed = registry.value.has(id);
      if (!existed) return false;

      // Lifecycle: before
      if (options?.onBeforeCheckOut) {
        const result = options.onBeforeCheckOut(id);
        if (result === false) {
          debug('checkOut cancelled by onBeforeCheckOut', id);
          return false;
        }
      }

      registry.value.delete(id);
      triggerRef(registry);

      // Emit event
      emit('check-out', { id });

      // Lifecycle: after
      options?.onCheckOut?.(id);

      // Hooks
      hooks.trigger('onCheckOut', id);

      if (options?.debug) {
        debug('Registry state after check-out:', {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const get = (id: string | number) => registry.value.get(id);

    const has = (id: string | number) => registry.value.has(id);

    const update = (id: string | number, data: Partial<T>): boolean => {
      const item = registry.value.get(id);
      if (!item) return false;

      const updatedItem = {
        ...item,
        data: { ...item.data, ...data },
      };

      registry.value.set(id, updatedItem);
      triggerRef(registry);

      emit('update', { id, data: updatedItem.data });
      hooks.trigger('onUpdate', updatedItem);

      debug('update', { id, data });
      return true;
    };

    const clear = () => {
      registry.value.clear();
      triggerRef(registry);
      emit('clear', {});
      hooks.trigger('onClear');
      debug('clear');
    };

    const checkInMany = (
      items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>
    ) => {
      items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
    };

    const checkOutMany = (ids: Array<string | number>) => {
      ids.forEach((id) => checkOut(id));
    };

    const updateMany = (updates: Array<{ id: string | number; data: Partial<T> }>) => {
      updates.forEach(({ id, data }) => update(id, data));
    };

    // ==========================================
    // SORTING (natif)
    // ==========================================
    const getAll = (opts?: GetAllOptions<T>): CheckInItem<T>[] => {
      let items = Array.from(registry.value.values());

      // Filtrage par groupe
      if (opts?.group) {
        items = items.filter((item) => item.meta?.group === opts.group);
      }

      // Filtrage custom
      if (opts?.filter) {
        items = items.filter(opts.filter);
      }

      // Tri
      if (opts?.sortBy) {
        const sortFn = compileSortFn<T>(opts.sortBy, opts.order);
        items.sort(sortFn);
      }

      return items;
    };

    const getGroup = (
      group: string,
      sortOptions?: { sortBy?: keyof T | 'timestamp' | `meta.${string}`; order?: 'asc' | 'desc' }
    ) => {
      return computed(() => getAll({ ...sortOptions, group }));
    };

    const items = computed(() => getAll());

    // ==========================================
    // SLOTS (natif)
    // ==========================================
    const slotsRegistry = new Map<string, SlotConfig>();

    const slots: SlotsAPI<T> = {
      register: (slotId: string, slotType: string, meta?: Record<string, any>) => {
        slotsRegistry.set(slotId, { id: slotId, type: slotType, meta });
        debug(`[Slots] Registered slot '${slotId}' of type '${slotType}'`);
      },
      unregister: (slotId: string) => {
        slotsRegistry.delete(slotId);
        debug(`[Slots] Unregistered slot '${slotId}'`);
      },
      get: (slotId: string): CheckInItem<T>[] => {
        return getAll({
          filter: (item) => item.meta?.user?.slotId === slotId,
        });
      },
      has: (slotId: string): boolean => {
        return slotsRegistry.has(slotId);
      },
      list: (): SlotConfig[] => {
        return Array.from(slotsRegistry.values());
      },
      clear: () => {
        slotsRegistry.clear();
        debug('[Slots] All slots cleared');
      },
    };

    // ==========================================
    // HOOKS (plugins simplifiés)
    // ==========================================
    const hooksRegistry = new Map<string, DeskHook<T>>();

    const hooks: HooksAPI<T> & { trigger: (method: keyof DeskHook<T>, ...args: any[]) => void } = {
      add: (hook: DeskHook<T>) => {
        hooksRegistry.set(hook.name, hook);
        debug(`[Hooks] Added hook '${hook.name}'`);
      },
      remove: (name: string): boolean => {
        const hook = hooksRegistry.get(name);
        if (hook) {
          hook.cleanup?.();
          hooksRegistry.delete(name);
          debug(`[Hooks] Removed hook '${name}'`);
          return true;
        }
        return false;
      },
      list: (): string[] => {
        return Array.from(hooksRegistry.keys());
      },
      trigger: (method: keyof DeskHook<T>, ...args: any[]) => {
        hooksRegistry.forEach((hook) => {
          const fn = hook[method];
          if (typeof fn === 'function') {
            (fn as any)(...args);
          }
        });
      },
    };

    // Installer les hooks fournis dans les options
    if (options?.hooks) {
      options.hooks.forEach((hook) => hooks.add(hook));
    }

    // Exposition du registry en lecture seule
    const readonlyRegistry = computed(() => registry.value);

    return {
      registry: readonlyRegistry as any,
      slots,
      hooks,
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
      on,
      off,
      emit,
      getGroup,
      items,
    };
  };

  /**
   * Opens a check-in desk (parent component provides the desk)
   * @alias createDesk
   */
  const createDesk = (options?: CheckInDeskOptions<T, TContext>) => {
    const DeskInjectionKey = Symbol('CheckInDesk') as InjectionKey<
      CheckInDesk<T, TContext> & TContext
    >;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.context || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(DeskInjectionKey, fullContext);

    if (options?.debug) {
      Debug('Desk opened with injection key:', DeskInjectionKey.description);
    }

    // Return both the desk and its symbol for children to inject
    return {
      desk: fullContext,
      DeskInjectionKey,
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
    const performCheckIn = async (): Promise<boolean> => {
      if (isCheckedIn.value) return true;

      const data = await getCurrentData();

      // Merge group/position/priority into meta
      const meta = {
        ...checkInOptions?.meta,
        ...(checkInOptions?.group !== undefined && { group: checkInOptions.group }),
        ...(checkInOptions?.position !== undefined && { position: checkInOptions.position }),
        ...(checkInOptions?.priority !== undefined && { priority: checkInOptions.priority }),
      };

      const success = desk!.checkIn(itemId, data, meta);

      if (success) {
        isCheckedIn.value = true;
        debug(`[useCheckIn] Checked in: ${itemId}`, data);
      } else {
        debug(`[useCheckIn] Check-in cancelled for: ${itemId}`);
      }

      return success;
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
   * Generates a cryptographically secure unique ID.
   * Uses crypto.randomUUID if available, otherwise crypto.getRandomValues.
   * Falls back to timestamp + Math.random for legacy environments.
   *
   * @param prefix - Préfixe optionnel pour l'ID
   * @returns ID unique et sécurisé
   */
  const generateId = (prefix = 'item'): string => {
    return generateSecureId(prefix);
  };

  /**
   * Generates a memoized ID for a component.
   * Memoizes IDs based on instance or custom ID to ensure stability across remounts.
   *
   * @param instanceOrId
   *   - Instance Vue (getCurrentInstance()) → ID mémorisé via WeakMap (stable au remontage)
   *   - String/Number (nanoid(), props.id, etc.) → Utilise cet ID (stable si même valeur)
   *   - null/undefined → Génère un ID cryptographiquement sécurisé (warning en dev)
   * @param prefix - Préfixe pour l'ID (ex: 'tab', 'field')
   * @returns ID mémorisé et stable
   *
   * @example
   * ```ts
   * // Avec instance Vue - mémorisé, toujours le même au remontage
   * const id = memoizedId(getCurrentInstance(), 'tab');
   *
   * // Avec ID custom (nanoid, uuid, etc.)
   * import { nanoid } from 'nanoid';
   * const id = memoizedId(nanoid(), 'tab');
   *
   * // Avec props.id
   * const id = memoizedId(props.id, 'tab');
   * ```
   */
  const memoizedId = (
    instanceOrId: object | string | number | null | undefined,
    prefix = 'item'
  ): string => {
    // Si c'est un objet (instance Vue), utiliser WeakMap
    if (instanceOrId && typeof instanceOrId === 'object') {
      const existing = instanceIdMap.get(instanceOrId);
      if (existing) return existing;

      const newId = generateSecureId(prefix);
      instanceIdMap.set(instanceOrId, newId);
      return newId;
    }

    // Si c'est une string ou un number, utiliser Map
    if (typeof instanceOrId === 'string' || typeof instanceOrId === 'number') {
      const key = `${prefix}-${instanceOrId}`;
      const existing = customIdMap.get(key);
      if (existing) return existing;

      const newId = `${prefix}-${instanceOrId}`;
      customIdMap.set(key, newId);
      return newId;
    }

    // Si null/undefined, générer un ID unique (warning en dev)
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[useCheckIn] memoizedId called with null/undefined. Consider passing getCurrentInstance() or a custom ID.'
      );
    }

    return generateSecureId(prefix);
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
    createDesk,
    checkIn,
    generateId,
    memoizedId,
    standaloneDesk,
    isCheckedIn,
    getRegistry,
  };
};
