/**
 * Slot Registry Pattern - Extends check-in system with dynamic slot management.
 * Allows child components to register renderable slots/templates that the parent
 * can dynamically collect and render.
 *
 * @type registry:hook
 * @category data
 *
 * @demo DynamicToolbarDemo
 * @demo BreadcrumbManagerDemo
 * @demo NotificationProviderDemo
 * @demo ContextMenuDemo
 */

import {
  ref,
  computed,
  h,
  type Ref,
  type ComputedRef,
  type VNode,
  type Component,
  type InjectionKey,
} from 'vue';
import { useCheckIn, type CheckInDesk, type CheckInDeskOptions } from '../use-check-in/useCheckIn';

// ==========================================
// TYPES
// ==========================================

/**
 * Types de slots supportés
 */
export type SlotType = 'component' | 'vnode' | 'render-function';

/**
 * Position relative pour l'ordre des slots
 */
export type SlotPosition = 'start' | 'end' | number;

/**
 * Props pour un slot scoped (données passées au slot)
 */
export type SlotScopedProps<TScope = any> = TScope;

/**
 * Fonction de rendu pour un slot
 */
export type SlotRenderFunction<TScope = any> = (scope?: SlotScopedProps<TScope>) => VNode | VNode[];

/**
 * Définition d'un slot enregistré
 */
export interface SlotDefinition<TScope = any> {
  /** ID unique du slot */
  id: string | number;
  /** Nom du slot (optionnel, pour groupement) */
  name?: string;
  /** Composant Vue à rendre */
  component?: Component;
  /** VNode pré-généré */
  vnode?: VNode | VNode[];
  /** Fonction de rendu dynamique */
  render?: SlotRenderFunction<TScope>;
  /** Props à passer au composant/vnode */
  props?: Record<string, any>;
  /** Position/ordre de rendu */
  position?: SlotPosition;
  /** Priorité (nombres plus élevés = rendus en premier) */
  priority?: number;
  /** Condition de visibilité */
  visible?: boolean | (() => boolean);
  /** Groupe/catégorie du slot */
  group?: string;
  /** Métadonnées additionnelles */
  meta?: Record<string, any>;
}

/**
 * Options pour le registre de slots
 */
export interface SlotRegistryOptions<TScope = any, TContext extends Record<string, any> = {}>
  extends CheckInDeskOptions<SlotDefinition<TScope>, TContext> {
  /** Tri par défaut des slots */
  defaultSort?: {
    by: 'position' | 'priority' | 'timestamp';
    order?: 'asc' | 'desc';
  };
  /** Filtre par défaut */
  defaultFilter?: (slot: SlotDefinition<TScope>) => boolean;
}

/**
 * Options pour l'enregistrement d'un slot
 */
export interface RegisterSlotOptions<TScope = any> {
  /** ID unique (auto-généré si absent) */
  id?: string | number;
  /** Nom du slot */
  name?: string;
  /** Composant à rendre */
  component?: Component;
  /** VNode à rendre */
  vnode?: VNode | VNode[];
  /** Fonction de rendu */
  render?: SlotRenderFunction<TScope>;
  /** Props du slot */
  props?: Record<string, any>;
  /** Position/ordre */
  position?: SlotPosition;
  /** Priorité */
  priority?: number;
  /** Condition de visibilité */
  visible?: boolean | (() => boolean);
  /** Groupe */
  group?: string;
  /** Auto-enregistrement au montage */
  autoRegister?: boolean;
  /** Watch les changements de props */
  watchProps?: boolean;
  /** Métadonnées */
  meta?: Record<string, any>;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Registre de slots étendu avec helpers de rendu
 */
export interface SlotRegistry<TScope = any, TContext extends Record<string, any> = {}>
  extends CheckInDesk<SlotDefinition<TScope>, TContext> {
  /** Récupère tous les slots filtrés et triés */
  getSlots: (options?: {
    group?: string;
    visible?: boolean;
    sortBy?: 'position' | 'priority' | 'timestamp';
    order?: 'asc' | 'desc';
  }) => SlotDefinition<TScope>[];
  /** Render tous les slots en VNodes */
  renderSlots: (
    scope?: SlotScopedProps<TScope>,
    options?: {
      group?: string;
      visible?: boolean;
    }
  ) => VNode[];
  /** Computed qui retourne les VNodes à rendre */
  slots: ComputedRef<VNode[]>;
  /** Groupes de slots avec computed pour chaque groupe */
  getSlotsByGroup: (group: string) => ComputedRef<SlotDefinition<TScope>[]>;
  /** Render un groupe spécifique de slots */
  renderGroup: (group: string, scope?: SlotScopedProps<TScope>) => VNode[];
}

// ==========================================
// COMPOSABLE
// ==========================================

/**
 * Slot Registry Pattern
 *
 * Étend le check-in system pour permettre l'enregistrement dynamique de slots/templates.
 * Parfait pour les toolbars, breadcrumbs, notifications, menus contextuels, etc.
 *
 * @example
 * ```vue
 * <!-- Parent: Toolbar Manager -->
 * <script setup lang="ts">
 * const { createSlotRegistry } = useSlotRegistry();
 * const { registry, renderSlots } = createSlotRegistry({
 *   defaultSort: { by: 'position', order: 'asc' }
 * });
 * </script>
 *
 * <template>
 *   <div class="toolbar">
 *     <component :is="() => renderSlots()" />
 *   </div>
 * </template>
 * ```
 *
 * @example
 * ```vue
 * <!-- Child: Toolbar Button -->
 * <script setup lang="ts">
 * const { registerSlot } = useSlotRegistry();
 * registerSlot(registry, {
 *   autoRegister: true,
 *   component: ToolbarButton,
 *   props: { label: 'Save', icon: 'save' },
 *   position: 10
 * });
 * </script>
 * ```
 */
export const useSlotRegistry = <TScope = any, TContext extends Record<string, any> = {}>() => {
  const checkInSystem = useCheckIn<SlotDefinition<TScope>, TContext>();

  /**
   * Crée un registre de slots
   */
  const createSlotRegistry = (options?: SlotRegistryOptions<TScope, TContext>) => {
    const { desk, DeskInjectionKey } = checkInSystem.createDesk(options);

    /**
     * Récupère les slots filtrés et triés
     */
    const getSlots = (getOptions?: {
      group?: string;
      visible?: boolean;
      sortBy?: 'position' | 'priority' | 'timestamp';
      order?: 'asc' | 'desc';
    }): SlotDefinition<TScope>[] => {
      let slots = desk.getAll();

      // Filtrage par groupe
      if (getOptions?.group !== undefined) {
        slots = slots.filter((item) => item.data.group === getOptions.group);
      }

      // Filtrage par visibilité
      if (getOptions?.visible !== undefined) {
        slots = slots.filter((item) => {
          const visible = item.data.visible;
          if (visible === undefined) return true;
          return typeof visible === 'function' ? visible() : visible;
        });
      } else {
        // Par défaut, filtrer les non-visibles
        slots = slots.filter((item) => {
          const visible = item.data.visible;
          if (visible === undefined) return true;
          return typeof visible === 'function' ? visible() : visible;
        });
      }

      // Tri
      const sortBy = getOptions?.sortBy || options?.defaultSort?.by || 'position';
      const order = getOptions?.order || options?.defaultSort?.order || 'asc';

      slots.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortBy) {
          case 'position':
            aVal = a.data.position ?? 999999;
            bVal = b.data.position ?? 999999;
            break;
          case 'priority':
            aVal = a.data.priority ?? 0;
            bVal = b.data.priority ?? 0;
            break;
          case 'timestamp':
            aVal = a.timestamp ?? 0;
            bVal = b.timestamp ?? 0;
            break;
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return order === 'desc' ? -comparison : comparison;
      });

      return slots.map((item) => item.data);
    };

    /**
     * Render tous les slots en VNodes
     */
    const renderSlots = (
      scope?: SlotScopedProps<TScope>,
      renderOptions?: {
        group?: string;
        visible?: boolean;
      }
    ): VNode[] => {
      const slots = getSlots(renderOptions);

      return slots.flatMap((slot) => {
        // Render function
        if (slot.render) {
          const result = slot.render(scope);
          return Array.isArray(result) ? result : [result];
        }

        // Pre-generated VNode
        if (slot.vnode) {
          return Array.isArray(slot.vnode) ? slot.vnode : [slot.vnode];
        }

        // Component
        if (slot.component) {
          const props = {
            ...slot.props,
            ...(scope ? { scope } : {}),
          };
          return [h(slot.component, props)];
        }

        // Fallback: empty array
        return [];
      });
    };

    /**
     * Computed pour les slots rendus
     */
    const slots = computed(() => renderSlots());

    /**
     * Récupère un groupe de slots (computed)
     */
    const getSlotsByGroup = (group: string): ComputedRef<SlotDefinition<TScope>[]> => {
      return computed(() => getSlots({ group }));
    };

    /**
     * Render un groupe spécifique
     */
    const renderGroup = (group: string, scope?: SlotScopedProps<TScope>): VNode[] => {
      return renderSlots(scope, { group });
    };

    const registry: SlotRegistry<TScope, TContext> = {
      ...desk,
      getSlots,
      renderSlots,
      slots,
      getSlotsByGroup,
      renderGroup,
    };

    return {
      registry,
      DeskInjectionKey,
      // Expose helpers
      getSlots,
      renderSlots,
      slots,
      getSlotsByGroup,
      renderGroup,
    };
  };

  /**
   * Enregistre un slot dans le registre parent
   */
  const registerSlot = <
    TDesk extends SlotRegistry<TScope, TContext> = SlotRegistry<TScope, TContext>,
  >(
    parentRegistryOrSymbol:
      | SlotRegistry<TScope, TContext>
      | InjectionKey<SlotRegistry<TScope, TContext>>
      | null
      | undefined,
    slotOptions: RegisterSlotOptions<TScope>
  ) => {
    const slotData: SlotDefinition<TScope> = {
      id: slotOptions.id || checkInSystem.generateId('slot'),
      name: slotOptions.name,
      component: slotOptions.component,
      vnode: slotOptions.vnode,
      render: slotOptions.render,
      props: slotOptions.props,
      position: slotOptions.position,
      priority: slotOptions.priority,
      visible: slotOptions.visible,
      group: slotOptions.group,
      meta: slotOptions.meta,
    };

    return checkInSystem.checkIn(parentRegistryOrSymbol as any, {
      id: slotData.id,
      data: slotData,
      autoCheckIn: slotOptions.autoRegister,
      watchData: slotOptions.watchProps,
      meta: slotOptions.meta,
      debug: slotOptions.debug,
    });
  };

  /**
   * Helpers pour créer des slots inline
   */
  const createSlot = {
    /**
     * Crée un slot depuis un composant
     */
    fromComponent: <TScope = any>(
      component: Component,
      props?: Record<string, any>,
      options?: Partial<RegisterSlotOptions<TScope>>
    ): RegisterSlotOptions<TScope> => ({
      component,
      props,
      ...options,
    }),

    /**
     * Crée un slot depuis une render function
     */
    fromRender: <TScope = any>(
      render: SlotRenderFunction<TScope>,
      options?: Partial<RegisterSlotOptions<TScope>>
    ): RegisterSlotOptions<TScope> => ({
      render,
      ...options,
    }),

    /**
     * Crée un slot depuis un VNode
     */
    fromVNode: <TScope = any>(
      vnode: VNode | VNode[],
      options?: Partial<RegisterSlotOptions<TScope>>
    ): RegisterSlotOptions<TScope> => ({
      vnode,
      ...options,
    }),
  };

  return {
    createSlotRegistry,
    registerSlot,
    createSlot,
    // Expose check-in helpers
    generateId: checkInSystem.generateId,
    memoizedId: checkInSystem.memoizedId,
  };
};
