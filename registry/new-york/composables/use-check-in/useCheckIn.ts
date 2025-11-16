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
  Plugin,
  PluginContext,
} from './types';

import type {
  CheckInItem,
  CheckInDesk,
  CheckInDeskOptions,
  CheckInOptions,
  DeskProvider,
  CheckInReturn,
  CheckInItemMeta,
} from './types';

import { PluginManager } from './plugin-manager';
import {
  createEventsPlugin,
  createRegistryPlugin,
  createSortingPlugin,
  createIdPlugin,
  type EventsPlugin,
  type RegistryPlugin,
  type SortingPlugin,
  type IdPlugin,
} from './plugins';

// Export plugins for advanced usage
export {
  PluginManager,
  createEventsPlugin,
  createRegistryPlugin,
  createSortingPlugin,
  createIdPlugin,
};
export type { EventsPlugin, RegistryPlugin, SortingPlugin, IdPlugin };

// ==========================================
// HELPERS
// ==========================================

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

    // Initialiser le plugin manager
    const pluginManager = new PluginManager<T>();

    // Créer les plugins
    const eventsPlugin = createEventsPlugin<T>();
    const registryPlugin = createRegistryPlugin<T>(eventsPlugin.emit as any);
    const sortingPlugin = createSortingPlugin<T>();
    const idPlugin = createIdPlugin();

    // Initialiser le contexte
    pluginManager.initialize({
      registry,
      options,
      debug,
    });

    // Installer les plugins par défaut
    pluginManager.install(eventsPlugin, registryPlugin, sortingPlugin, idPlugin);

    // Installer les plugins personnalisés si fournis
    if (options?.plugins) {
      pluginManager.install(...options.plugins);
    }

    // Computed pour récupérer un groupe spécifique
    const getGroup = (
      group: string,
      sortOptions?: { sortBy?: keyof T | 'timestamp' | `meta.${string}`; order?: 'asc' | 'desc' }
    ) => {
      return computed(() => sortingPlugin.getAll({ ...sortOptions, group }));
    };

    // Computed pour tous les items
    const items = computed(() => sortingPlugin.getAll());

    // Exposition du registry en lecture seule
    const readonlyRegistry = computed(() => registry.value);

    return {
      registry: readonlyRegistry as any, // Cast pour compatibilité
      checkIn: registryPlugin.checkIn,
      checkOut: registryPlugin.checkOut,
      get: registryPlugin.get,
      getAll: sortingPlugin.getAll,
      update: registryPlugin.update,
      has: registryPlugin.has,
      clear: registryPlugin.clear,
      checkInMany: registryPlugin.checkInMany,
      checkOutMany: registryPlugin.checkOutMany,
      updateMany: registryPlugin.updateMany,
      on: eventsPlugin.on,
      off: eventsPlugin.off,
      emit: eventsPlugin.emit,
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
    // Récupérer le plugin ID depuis n'importe quel desk (ils partagent le même plugin)
    // Pour l'instant, on utilise directement le plugin
    const plugin = createIdPlugin();
    return plugin.generateId(prefix);
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
    const plugin = createIdPlugin();
    return plugin.memoizedId(instanceOrId, prefix);
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
