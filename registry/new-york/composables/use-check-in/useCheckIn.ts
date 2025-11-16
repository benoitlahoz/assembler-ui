/**
 * Generic check-in system for parent/child component registration pattern.
 * Like an airport check-in desk: parent components provide a check-in counter
 * where child components register themselves with their data.
 *
 * @type registry:hook
 * @category data
 *
 * @demo AirportDemo
 * @demo FormDemo
 * @demo BreadcrumbDemo
 * @demo ContextMenuDemo
 * @demo NotificationDemo
 * @demo AccordionDemo
 * @demo TabsDemo
 * @demo ToolbarDemo
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
  registry: Ref<Map<string | number, CheckInItem<T>>>;
  checkIn: (id: string | number, data: T, meta?: Record<string, any>) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: {
    sortBy?: keyof T | 'timestamp' | string;
    order?: 'asc' | 'desc';
    group?: string;
    filter?: (item: CheckInItem<T>) => boolean;
  }) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (items: Array<{ id: string | number; data: T; meta?: Record<string, any> }>) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (updates: Array<{ id: string | number; data: Partial<T> }>) => void;
  /** Écoute un type d'événement */
  on: (event: DeskEventType, callback: DeskEventCallback<T>) => () => void;
  /** Retire un listener d'événement */
  off: (event: DeskEventType, callback: DeskEventCallback<T>) => void;
  /** Émet un événement (usage interne principalement) */
  emit: (event: DeskEventType, payload: { id?: string | number; data?: T }) => void;
  /** Récupère les items d'un groupe spécifique (computed) */
  getGroup: (
    group: string,
    options?: { sortBy?: keyof T | 'timestamp' | string; order?: 'asc' | 'desc' }
  ) => ComputedRef<CheckInItem<T>[]>;
  /** Computed de tous les items */
  items: ComputedRef<CheckInItem<T>[]>;
}

export interface CheckInDeskOptions<T = any, TContext extends Record<string, any> = {}> {
  /** Contexte additionnel à merger avec le desk (typé) */
  context?: TContext;
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
  /** Groupe auquel appartient cet item (pour filtrage/organisation) */
  group?: string;
  /** Position/ordre de l'item (pour tri) */
  position?: number;
  /** Priorité de l'item (pour tri) */
  priority?: number;
  /** Active le mode debug avec logging */
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
 * const desk = createDesk({
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

    // Système d'événements
    const eventListeners = new Map<DeskEventType, Set<DeskEventCallback<T>>>();

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

      // Lifecycle: before
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

      if (options?.debug) {
        debug('Registry state after check-out:', {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const get = (id: string | number) => registry.value.get(id);

    const getAll = (options?: {
      sortBy?: keyof T | 'timestamp' | string;
      order?: 'asc' | 'desc';
      group?: string;
      filter?: (item: CheckInItem<T>) => boolean;
    }) => {
      let items = Array.from(registry.value.values());

      // Filtrage par groupe (via meta.group)
      if (options?.group !== undefined) {
        items = items.filter((item) => item.meta?.group === options.group);
      }

      // Filtrage custom
      if (options?.filter) {
        items = items.filter(options.filter);
      }

      // Tri
      if (!options?.sortBy) return items;

      return items.sort((a, b) => {
        let aVal: any, bVal: any;

        if (options.sortBy === 'timestamp') {
          aVal = a.timestamp || 0;
          bVal = b.timestamp || 0;
        } else if (typeof options.sortBy === 'string' && options.sortBy.startsWith('meta.')) {
          // Support pour tri par clés meta (ex: 'meta.position')
          const metaKey = options.sortBy.slice(5); // Remove 'meta.' prefix
          aVal = a.meta?.[metaKey];
          bVal = b.meta?.[metaKey];
        } else {
          const key = options.sortBy as keyof T;
          aVal = a.data[key];
          bVal = b.data[key];
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return options.order === 'desc' ? -comparison : comparison;
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

    // Computed pour récupérer un groupe spécifique
    const getGroup = (
      group: string,
      sortOptions?: { sortBy?: keyof T | 'timestamp' | string; order?: 'asc' | 'desc' }
    ) => {
      return computed(() => getAll({ ...sortOptions, group }));
    };

    // Computed pour tous les items
    const items = computed(() => getAll());

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
    const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
    if (isDev) {
      console.warn(
        `[useCheckIn] memoizedId: no instance or custom ID provided. ` +
          `Generated cryptographically secure ID. ` +
          `Consider passing getCurrentInstance() or a custom ID (nanoid, uuid, props.id, etc.).`
      );
    }
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
