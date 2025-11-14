/**
 * Generic registry system for provider/consumer pattern in Vue components.
 * Allows parent components to provide a registry context that child components
 * can subscribe to for centralized state management.
 *
 * @type registry:hook
 * @category data
 *
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

export interface RegistryItem<T = any> {
  id: string | number;
  data: T;
}

export interface RegistryContext<T = any> {
  registry: Ref<Map<string | number, RegistryItem<T>>>;
  register: (id: string | number, data: T) => void;
  unregister: (id: string | number) => void;
  get: (id: string | number) => RegistryItem<T> | undefined;
  getAll: () => RegistryItem<T>[];
  update: (id: string | number, data: Partial<T>) => void;
  has: (id: string | number) => boolean;
  clear: () => void;
}

export interface RegistryProviderOptions<T = any> {
  /** Contexte additionnel à merger avec le registre */
  extraContext?: Record<string, any>;
  /** Callback appelé lors de l'enregistrement d'un item */
  onRegister?: (id: string | number, data: T) => void;
  /** Callback appelé lors du désenregistrement d'un item */
  onUnregister?: (id: string | number) => void;
}

export interface RegistryConsumerOptions<T = any> {
  /** Lève une erreur si le contexte n'existe pas */
  required?: boolean;
  /** Auto-enregistre l'item au montage du composant */
  autoRegister?: boolean;
  /** ID de l'item à enregistrer */
  id?: string | number;
  /** Données de l'item à enregistrer */
  data?: T | (() => T);
  /** Fonction pour générer un ID unique si non fourni */
  generateId?: () => string | number;
  /** Watch les changements de data pour mettre à jour le registre */
  watchData?: boolean;
}

// ==========================================
// COMPOSABLE PRINCIPAL
// ==========================================

/**
 * Generic registry system for managing parent-child component relationships
 *
 * @example
 * ```ts
 * // Create a registry key
 * const TabsKey = registry.createKey<TabItem>('Tabs');
 *
 * // In parent component
 * const { provider } = useRegistry();
 * const context = provider(TabsKey, {
 *   extraContext: { activeTab: ref(null) }
 * });
 *
 * // In child component
 * const { consumer } = useRegistry();
 * const { context } = consumer(TabsKey, {
 *   autoRegister: true,
 *   id: props.id,
 *   data: () => ({ label: props.label })
 * });
 * ```
 */
export const useRegistry = () => {
  /**
   * Creates a typed InjectionKey for a registry context
   */
  const createKey = <T = any>(namespace: string): InjectionKey<RegistryContext<T>> => {
    return Symbol(`Registry:${namespace}`) as InjectionKey<RegistryContext<T>>;
  };

  /**
   * Creates a registry context (internal helper)
   */
  const createRegistryContext = <T = any>(
    options?: RegistryProviderOptions<T>
  ): RegistryContext<T> => {
    const registry = ref<Map<string | number, RegistryItem<T>>>(new Map()) as Ref<
      Map<string | number, RegistryItem<T>>
    >;

    const register = (id: string | number, data: T) => {
      registry.value.set(id, { id, data: data as any });
      registry.value = new Map(registry.value);
      options?.onRegister?.(id, data);
    };

    const unregister = (id: string | number) => {
      const existed = registry.value.has(id);
      registry.value.delete(id);
      registry.value = new Map(registry.value);
      if (existed) {
        options?.onUnregister?.(id);
      }
    };

    const get = (id: string | number) => registry.value.get(id);

    const getAll = () => Array.from(registry.value.values());

    const update = (id: string | number, data: Partial<T>) => {
      const existing = registry.value.get(id);
      if (existing && typeof existing.data === 'object' && typeof data === 'object') {
        register(id, { ...existing.data, ...data } as T);
      }
    };

    const has = (id: string | number) => registry.value.has(id);

    const clear = () => {
      registry.value.clear();
      registry.value = new Map();
    };

    return { registry, register, unregister, get, getAll, update, has, clear };
  };

  /**
   * Provider: creates and provides a registry context for child components
   */
  const provider = <T = any>(
    key: InjectionKey<RegistryContext<T>>,
    options?: RegistryProviderOptions<T>
  ) => {
    const registryContext = createRegistryContext<T>(options);

    const fullContext = {
      ...registryContext,
      ...(options?.extraContext || {}),
    } as any;

    provide(key, fullContext);

    return fullContext as RegistryContext<T> & Record<string, any>;
  };

  /**
   * Consumer: consumes a registry context and optionally auto-registers
   */
  const consumer = <T = any>(
    key: InjectionKey<RegistryContext<T>>,
    options?: RegistryConsumerOptions<T>
  ) => {
    const context = inject(key, options?.required ? undefined : null);

    if (options?.required && !context) {
      const keyName = key.description || String(key);
      throw new Error(
        `[useRegistry] Context not found for key: ${keyName}. ` +
          `Make sure a provider is wrapping this component.`
      );
    }

    if (options?.autoRegister && context) {
      const itemId = ref<string | number | undefined>(options.id);

      if (!itemId.value && options.generateId) {
        itemId.value = options.generateId();
      }

      if (!itemId.value) {
        throw new Error('[useRegistry] Auto-registration requires an "id" or "generateId" option');
      }

      const getData = () => {
        return typeof options.data === 'function' ? (options.data as () => T)() : options.data!;
      };

      onMounted(() => {
        if (itemId.value) {
          context.register(itemId.value, getData());
        }
      });

      if (options.watchData && options.data) {
        watch(
          () => getData(),
          (newData) => {
            if (itemId.value && newData) {
              context.update(itemId.value, newData);
            }
          },
          { deep: true }
        );
      }

      onBeforeUnmount(() => {
        if (itemId.value) {
          context.unregister(itemId.value);
        }
      });

      return {
        context,
        itemId,
        updateSelf: (data: Partial<T>) => {
          if (itemId.value) {
            context.update(itemId.value, data);
          }
        },
      };
    }

    return { context, itemId: ref(undefined), updateSelf: () => {} };
  };

  /**
   * Generates a unique ID based on timestamp and random string
   */
  const generateId = (prefix = 'item'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * Creates a registry without injection for local usage
   */
  const local = <T = any>(options?: RegistryProviderOptions<T>) => {
    return createRegistryContext<T>(options);
  };

  return {
    createKey,
    provider,
    consumer,
    generateId,
    local,
  };
};
