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
  watch,
  type InjectionKey,
  type Ref,
} from 'vue';

// ==========================================
// TYPES
// ==========================================

export interface CheckInItem<T = any> {
  id: string | number;
  data: T;
}

export interface CheckInDesk<T = any> {
  registry: Ref<Map<string | number, CheckInItem<T>>>;
  checkIn: (id: string | number, data: T) => void;
  checkOut: (id: string | number) => void;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: () => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => void;
  has: (id: string | number) => boolean;
  clear: () => void;
}

export interface CheckInDeskOptions<T = any> {
  /** Contexte additionnel à merger avec le desk */
  extraContext?: Record<string, any>;
  /** Callback appelé lors du check-in d'un item */
  onCheckIn?: (id: string | number, data: T) => void;
  /** Callback appelé lors du check-out d'un item */
  onCheckOut?: (id: string | number) => void;
}

export interface CheckInOptions<T = any> {
  /** Lève une erreur si le desk n'existe pas */
  required?: boolean;
  /** Auto check-in au montage du composant */
  autoCheckIn?: boolean;
  /** ID de l'item à enregistrer */
  id?: string | number;
  /** Données de l'item à enregistrer */
  data?: T | (() => T);
  /** Fonction pour générer un ID unique si non fourni */
  generateId?: () => string | number;
  /** Watch les changements de data pour mettre à jour l'enregistrement */
  watchData?: boolean;
}

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
 * const { openDesk } = useCheckIn<TabItem>();
 * const desk = openDesk({
 *   extraContext: { activeTab: ref(null) }
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
export const useCheckIn = <T = any>() => {
  /**
   * Creates a check-in desk context (internal helper)
   */
  const createDeskContext = <T = any>(options?: CheckInDeskOptions<T>): CheckInDesk<T> => {
    const registry = ref<Map<string | number, CheckInItem<T>>>(new Map()) as Ref<
      Map<string | number, CheckInItem<T>>
    >;

    const checkIn = (id: string | number, data: T) => {
      registry.value.set(id, { id, data: data as any });
      registry.value = new Map(registry.value);
      options?.onCheckIn?.(id, data);
    };

    const checkOut = (id: string | number) => {
      const existed = registry.value.has(id);
      registry.value.delete(id);
      registry.value = new Map(registry.value);
      if (existed) {
        options?.onCheckOut?.(id);
      }
    };

    const get = (id: string | number) => registry.value.get(id);

    const getAll = () => Array.from(registry.value.values());

    const update = (id: string | number, data: Partial<T>) => {
      const existing = registry.value.get(id);
      if (existing && typeof existing.data === 'object' && typeof data === 'object') {
        checkIn(id, { ...existing.data, ...data } as T);
      }
    };

    const has = (id: string | number) => registry.value.has(id);

    const clear = () => {
      registry.value.clear();
      registry.value = new Map();
    };

    return { registry, checkIn, checkOut, get, getAll, update, has, clear };
  };

  /**
   * Opens a check-in desk (parent component provides the desk)
   */
  const openDesk = (options?: CheckInDeskOptions<T>) => {
    const deskSymbol = Symbol('CheckInDesk') as InjectionKey<CheckInDesk<T>>;
    const deskContext = createDeskContext<T>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.extraContext || {}),
    } as any;

    provide(deskSymbol, fullContext);

    // Return both the desk and its symbol for children to inject
    return {
      desk: fullContext as CheckInDesk<T> & Record<string, any>,
      deskSymbol,
    };
  };

  /**
   * Check in at a desk (child component registers itself)
   */
  const checkIn = (
    parentDesk: { deskSymbol: InjectionKey<CheckInDesk<T>> },
    options?: CheckInOptions<T>
  ) => {
    const desk = inject(parentDesk.deskSymbol, options?.required ? undefined : null);

    if (options?.required && !desk) {
      throw new Error(
        `[useCheckIn] Check-in desk not found. ` +
          `Make sure a desk is open (parent provides context).`
      );
    }

    if (options?.autoCheckIn && desk) {
      const itemId = ref<string | number | undefined>(options.id);

      if (!itemId.value && options.generateId) {
        itemId.value = options.generateId();
      }

      if (!itemId.value) {
        throw new Error('[useCheckIn] Auto check-in requires an "id" or "generateId" option');
      }

      const getData = () => {
        return typeof options.data === 'function' ? (options.data as () => T)() : options.data!;
      };

      onMounted(() => {
        if (itemId.value) {
          desk.checkIn(itemId.value, getData());
        }
      });

      if (options.watchData && options.data) {
        watch(
          () => getData(),
          (newData) => {
            if (itemId.value && newData) {
              desk.update(itemId.value, newData);
            }
          },
          { deep: true }
        );
      }

      onBeforeUnmount(() => {
        if (itemId.value) {
          desk.checkOut(itemId.value);
        }
      });

      return {
        desk,
        itemId,
        updateSelf: (data: Partial<T>) => {
          if (itemId.value) {
            desk.update(itemId.value, data);
          }
        },
      };
    }

    return { desk, itemId: ref(undefined), updateSelf: () => {} };
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

  return {
    openDesk,
    checkIn,
    generateId,
    standaloneDesk,
  };
};
