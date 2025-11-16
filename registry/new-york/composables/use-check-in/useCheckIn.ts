/**
 * Generic check-in system for parent/child component registration pattern.
 * Like an airport check-in desk: parent components provide a check-in counter
 * where child components register themselves with their data.
 *
 * @type registry:hook
 * @category dependency-injection
 *
 * @demo AirportDemo
 * @demo FormDemo
 * @demo TabsDemo
 * @demo ActiveItemPluginDemo
 * @demo HistoryPluginDemo
 * @demo LoggerPluginDemo
 * @demo ValidationPluginDemo
 * @demo CombinedPluginsDemo
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
import type { CheckInPlugin } from './types';

// ==========================================
// TYPES
// ==========================================

/** Type d'événement émis par le desk */
export type DeskEventType = 'check-in' | 'check-out' | 'update' | 'clear';

/** Callback pour les événements du desk */
export type DeskEventCallback<T = any> = (payload: {
  id?: string | number;
  data?: T;
  timestamp: number;
}) => void;

export interface CheckInItem<T = any> {
  id: string | number;
  data: T;
  timestamp?: number;
  meta?: Record<string, any>;
}

export interface CheckInDesk<T = any, TContext extends Record<string, any> = {}> {
  /**
   * Registry interne des items. ⚠️ NE PAS UTILISER DIRECTEMENT dans les templates.
   * Utilisez plutôt les helpers : get(), getAll(), ou le computed getRegistry().
   * Map n'est pas réactive, seul le Ref l'est.
   */
  readonly registry: Ref<Map<string | number, CheckInItem<T>>>;
  checkIn: (id: string | number, data: T, meta?: Record<string, any>) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: {
    sortBy?: keyof T | 'timestamp';
    order?: 'asc' | 'desc';
  }) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (items: Array<{ id: string | number; data: T; meta?: Record<string, any> }>) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (updates: Array<{ id: string | number; data: Partial<T> }>) => void;
  on: (event: DeskEventType, callback: DeskEventCallback<T>) => () => void;
  off: (event: DeskEventType, callback: DeskEventCallback<T>) => void;
  emit: (event: DeskEventType, payload: { id?: string | number; data?: T }) => void;
}

export interface CheckInDeskOptions<T = any, TContext extends Record<string, any> = {}> {
  context?: TContext;
  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;
  onCheckIn?: (id: string | number, data: T) => void;
  onBeforeCheckOut?: (id: string | number) => void | boolean;
  onCheckOut?: (id: string | number) => void;
  debug?: boolean;
  plugins?: CheckInPlugin<T>[];
}

export interface CheckInOptions<T = any> {
  required?: boolean;
  autoCheckIn?: boolean;
  id?: string | number;
  data?: T | (() => T) | (() => Promise<T>);
  generateId?: () => string | number;
  watchData?: boolean;
  shallow?: boolean;
  watchCondition?: (() => boolean) | Ref<boolean>;
  meta?: Record<string, any>;
  debug?: boolean;
}

const NoOpDebug = (_message: string, ..._args: any[]) => {};

const Debug = (message: string, ...args: any[]) => {
  console.log(`[useCheckIn] ${message}`, ...args);
};

// WeakMap pour générer des IDs stables basés sur l'instance du composant
const instanceIdMap = new WeakMap<object, string>();
// Map pour les IDs custom fournis par l'utilisateur
const customIdMap = new Map<string, string>();
let instanceCounter = 0;

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
 * const { desk } = createDesk('tabsDesk', {
 *   context: { activeTab: ref('tab1') }
 * });
 *
 * // In child component - check in at parent's desk
 * const { checkIn } = useCheckIn<TabItem>();
 * checkIn('tabsDesk', {
 *   autoCheckIn: true,
 *   id: props.id,
 *   data: () => ({ label: props.label })
 * });
 * ```
 */
export const useCheckIn = <T = any, TContext extends Record<string, any> = {}>() => {
  let debug = NoOpDebug;

  /**
   * Creates a check-in desk context (internal helper)
   */
  const createDeskContext = <T = any, TContext extends Record<string, any> = {}>(
    options?: CheckInDeskOptions<T, TContext>
  ): CheckInDesk<T, TContext> => {
    const registry = ref<Map<string | number, CheckInItem<T>>>(new Map()) as Ref<
      Map<string | number, CheckInItem<T>>
    >;

    debug = options?.debug ? Debug : NoOpDebug;

    // Système d'événements
    const eventListeners = new Map<DeskEventType, Set<DeskEventCallback<T>>>();

    // Plugin system: storage for cleanup functions
    const pluginCleanups: Array<() => void> = [];

    const emit = (event: DeskEventType, payload: { id?: string | number; data?: T }) => {
      const listeners = eventListeners.get(event);
      if (!listeners) return;

      const eventPayload = {
        ...payload,
        timestamp: Date.now(),
      };

      debug(`[Event] ${event}`, eventPayload);
      listeners.forEach((callback) => callback(eventPayload));
    };

    const on = (event: DeskEventType, callback: DeskEventCallback<T>) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
      }
      eventListeners.get(event)!.add(callback);

      debug(`[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`);

      // Return unsubscribe function
      return () => off(event, callback);
    };

    const off = (event: DeskEventType, callback: DeskEventCallback<T>) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        debug(`[Event] Listener removed for '${event}', remaining: ${listeners.size}`);
      }
    };

    const checkIn = (id: string | number, data: T, meta?: Record<string, any>): boolean => {
      debug('checkIn', { id, data, meta });

      // Lifecycle: before (plugins first, then user hook)
      if (options?.plugins) {
        for (const plugin of options.plugins) {
          if (plugin.onBeforeCheckIn) {
            const result = plugin.onBeforeCheckIn(id, data);
            if (result === false) {
              debug('checkIn cancelled by plugin:', plugin.name);
              return false;
            }
          }
        }
      }

      if (options?.onBeforeCheckIn) {
        const result = options.onBeforeCheckIn(id, data);
        if (result === false) {
          debug('checkIn cancelled by onBeforeCheckIn', id);
          return false;
        }
      }

      registry.value.set(id, {
        id,
        data: data as any,
        timestamp: Date.now(),
        meta,
      });
      triggerRef(registry);

      // Emit event
      emit('check-in', { id, data });

      // Lifecycle: after
      options?.onCheckIn?.(id, data);

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

      // Lifecycle: before (plugins first, then user hook)
      if (options?.plugins) {
        for (const plugin of options.plugins) {
          if (plugin.onBeforeCheckOut) {
            const result = plugin.onBeforeCheckOut(id);
            if (result === false) {
              debug('checkOut cancelled by plugin:', plugin.name);
              return false;
            }
          }
        }
      }

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

      if (options?.debug) {
        debug('Registry state after check-out:', {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
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

    const update = (id: string | number, data: Partial<T>): boolean => {
      const existing = registry.value.get(id);
      if (!existing) {
        debug('update failed: item not found', id);
        return false;
      }

      if (typeof existing.data === 'object' && typeof data === 'object') {
        const previousData = { ...existing.data };

        // Mise à jour directe sans relancer checkIn pour préserver le lifecycle
        Object.assign(existing.data as object, data);
        triggerRef(registry);

        // Emit event
        emit('update', { id, data: existing.data });

        if (options?.debug) {
          debug('update diff:', {
            id,
            before: previousData,
            after: existing.data,
            changes: data,
          });
        }

        return true;
      }

      return false;
    };

    const has = (id: string | number) => registry.value.has(id);

    const clear = () => {
      debug('clear');
      const count = registry.value.size;
      registry.value.clear();
      triggerRef(registry);

      // Emit event
      emit('clear', {});

      // Cleanup plugins
      pluginCleanups.forEach((cleanup) => cleanup());
      pluginCleanups.length = 0;

      debug(`Cleared ${count} items from registry`);
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

    const desk: CheckInDesk<T, TContext> = {
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
      on,
      off,
      emit,
    };

    // Apply plugins if provided
    if (options?.plugins) {
      options.plugins.forEach((plugin) => {
        debug('Installing plugin:', plugin.name);

        // 1. Install plugin
        if (plugin.install) {
          const cleanup = plugin.install(desk);
          if (cleanup) {
            pluginCleanups.push(cleanup);
          }
        }

        // 2. Hook events via event system
        if (plugin.onCheckIn) {
          desk.on('check-in', ({ id, data }) => {
            plugin.onCheckIn!(id!, data!);
          });
        }

        if (plugin.onCheckOut) {
          desk.on('check-out', ({ id }) => {
            plugin.onCheckOut!(id!);
          });
        }

        // 3. Add custom methods
        if (plugin.methods) {
          Object.entries(plugin.methods).forEach(([name, method]) => {
            (desk as any)[name] = (...args: any[]) => method(desk, ...args);
          });
        }

        // 4. Add computed properties
        if (plugin.computed) {
          Object.entries(plugin.computed).forEach(([name, getter]) => {
            Object.defineProperty(desk, name, {
              get: () => getter(desk),
              enumerable: true,
              configurable: true,
            });
          });
        }
      });
    }

    return desk;
  };

  /**
   * Opens a check-in desk (parent component provides the desk)
   * @alias createDesk
   */
  const createDesk = (
    injectionKey: string = 'checkInDesk',
    options?: CheckInDeskOptions<T, TContext>
  ) => {
    const DeskInjectionKey = Symbol(`CheckInDesk:${injectionKey}`) as InjectionKey<
      CheckInDesk<T, TContext> & TContext
    >;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.context || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(DeskInjectionKey, fullContext);
    // Provide également avec la clé string pour faciliter l'accès
    provide(injectionKey, DeskInjectionKey);

    if (options?.debug) {
      Debug('Desk opened with injection key:', injectionKey);
    }

    // Return the desk and the simple injection key
    return {
      desk: fullContext,
      injectionKey,
    };
  };

  /**
   * Checks in to the desk (child component registers itself)
   */
  const checkIn = <
    TDesk extends CheckInDesk<T, TContext> & TContext = CheckInDesk<T, TContext> & TContext,
  >(
    parentDeskOrKey:
      | (CheckInDesk<T, TContext> & TContext)
      | InjectionKey<CheckInDesk<T, TContext> & TContext>
      | string
      | null
      | undefined,
    checkInOptions?: CheckInOptions<T>
  ) => {
    // Auto-handle null/undefined context - no need for ternary pattern
    if (!parentDeskOrKey) {
      debug('[useCheckIn] No parent desk provided - skipping check-in');

      return {
        desk: null as TDesk | null,
        checkOut: () => {},
        updateSelf: () => {},
      };
    }

    // Inject the desk if a symbol or string key is provided
    let desk: (CheckInDesk<T, TContext> & TContext) | null | undefined;

    if (typeof parentDeskOrKey === 'symbol') {
      desk = inject(parentDeskOrKey);
      if (!desk) {
        debug('[useCheckIn] Could not inject desk from symbol');

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else if (typeof parentDeskOrKey === 'string') {
      // Inject le Symbol depuis la clé string
      const injectionKey =
        inject<InjectionKey<CheckInDesk<T, TContext> & TContext>>(parentDeskOrKey);
      if (!injectionKey) {
        debug('[useCheckIn] Could not find desk with key:', parentDeskOrKey);

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
      desk = inject(injectionKey);
      if (!desk) {
        debug('[useCheckIn] Could not inject desk from key:', parentDeskOrKey);

        return {
          desk: null as TDesk | null,
          checkOut: () => {},
          updateSelf: () => {},
        };
      }
    } else {
      desk = parentDeskOrKey;
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
      const success = desk!.checkIn(itemId, data, checkInOptions?.meta);

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
    // Essaie crypto.randomUUID si disponible (navigateur moderne + Node 19+)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }

    // Sinon utilise crypto.getRandomValues (quasi-universel)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      const id = Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${prefix}-${id}`;
    }

    // Fallback ultime pour environnements très anciens
    const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
    if (isDev) {
      console.warn(
        '[useCheckIn] crypto API not available, using Math.random fallback. ' +
          'Consider upgrading to a modern environment.'
      );
    }
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}-${timestamp}-${random}`;
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
    // Cas 1: C'est un string ou number = ID custom fourni par l'utilisateur
    if (typeof instanceOrId === 'string' || typeof instanceOrId === 'number') {
      const key = `${prefix}-${instanceOrId}`;
      let id = customIdMap.get(key);
      if (!id) {
        id = String(instanceOrId);
        customIdMap.set(key, id);
      }
      return id;
    }

    // Cas 2: C'est un object = instance Vue (getCurrentInstance())
    if (instanceOrId && typeof instanceOrId === 'object') {
      let id = instanceIdMap.get(instanceOrId);
      if (!id) {
        id = `${prefix}-${++instanceCounter}`;
        instanceIdMap.set(instanceOrId, id);
      }
      return id;
    }

    // Cas 3: null/undefined = génération cryptographiquement sécurisée avec warning
    debug(
      `[useCheckIn] memoizedId: no instance or custom ID provided. ` +
        `Generated cryptographically secure ID. ` +
        `Consider passing getCurrentInstance() or a custom ID (nanoid, uuid, props.id, etc.).`
    );
    return generateId(prefix);
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

  /**
   * Clears the memoization cache for custom IDs.
   * Useful for cleanup after major route changes or in long-running SPAs.
   * Note: instanceIdMap (WeakMap) is auto-cleaned by garbage collection.
   *
   * @param resetCounter - If true, also resets the instance counter (default: false)
   *
   * @example
   * ```ts
   * // After a major route change or context switch
   * const { clearIdsCache } = useCheckIn();
   * clearIdsCache();
   *
   * // Full reset including counter
   * clearIdsCache(true);
   * ```
   */
  const clearIdCache = (resetCounter = false) => {
    const customIdCount = customIdMap.size;
    customIdMap.clear();

    if (resetCounter) {
      instanceCounter = 0;
    }

    debug(
      `[useCheckIn] Cleared ${customIdCount} custom IDs from cache` +
        (resetCounter ? ' and reset counter' : '')
    );
  };

  return {
    createDesk,
    checkIn,
    generateId,
    memoizedId,
    standaloneDesk,
    isCheckedIn,
    getRegistry,
    clearIdCache,
  };
};

// ==========================================
// RE-EXPORTS
// ==========================================

export type { CheckInPlugin } from './types';
export {
  createActiveItemPlugin,
  createValidationPlugin,
  createLoggerPlugin,
  createHistoryPlugin,
  type ValidationOptions,
  type LoggerOptions,
  type HistoryOptions,
  type HistoryEntry,
} from './plugins';
