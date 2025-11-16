---
title: useSlotRegistry
description: Slot Registry Pattern - Extends check-in system with dynamic slot management.
---

  <p class="text-pretty mt-4">Allows child components to register renderable slots/templates that the parent<br>can dynamically collect and render.</p>

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <dynamic-toolbar-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, h } from "vue";
import { useSlotRegistry } from "../useSlotRegistry";
import DynamicToolbarButton from "./DynamicToolbarButton.vue";
import DynamicToolbarSeparator from "./DynamicToolbarSeparator.vue";

const { createSlotRegistry } = useSlotRegistry();

const { registry, renderSlots, renderGroup } = createSlotRegistry({
  defaultSort: { by: "position", order: "asc" },
});

const documentTitle = ref("Sans titre");
const isSaved = ref(true);
const canUndo = ref(false);
const canRedo = ref(false);

const save = () => {
  console.log("💾 Document sauvegardé");
  isSaved.value = true;
};

const undo = () => {
  console.log("↶ Annuler");
  canUndo.value = false;
};

const redo = () => {
  console.log("↷ Refaire");
  canRedo.value = false;
};

const edit = () => {
  console.log("✏️ Modifier le titre");
  isSaved.value = false;
  canUndo.value = true;
};
</script>

<template>
  <div class="w-full rounded-lg border bg-card p-6">
    <h3 class="mb-4 font-semibold">Dynamic Toolbar Demo</h3>

    <div class="mb-6 flex items-center gap-2 rounded border bg-muted/30 p-2">
      <div class="flex items-center gap-1">
        <component :is="() => renderGroup('start')" />
      </div>

      <DynamicToolbarSeparator />

      <div class="flex flex-1 items-center gap-1">
        <component :is="() => renderGroup('main')" />
      </div>

      <DynamicToolbarSeparator />

      <div class="flex items-center gap-1">
        <component :is="() => renderGroup('end')" />
      </div>
    </div>

    <div class="space-y-2 text-sm">
      <div>
        <span class="font-medium">Titre:</span>
        {{ documentTitle }}
      </div>
      <div>
        <span class="font-medium">État:</span>
        <span :class="isSaved ? 'text-green-600' : 'text-orange-600'">
          {{ isSaved ? "✓ Sauvegardé" : "• Non sauvegardé" }}
        </span>
      </div>
    </div>

    <DynamicToolbarButton
      :registry="registry"
      label="Nouveau"
      icon="file-plus"
      group="start"
      :position="1"
      @click="
        () => {
          documentTitle = 'Nouveau document';
          isSaved = false;
        }
      "
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Ouvrir"
      icon="folder-open"
      group="start"
      :position="2"
      @click="() => console.log('📂 Ouvrir')"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Sauvegarder"
      icon="save"
      group="main"
      :position="10"
      :disabled="isSaved"
      @click="save"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Annuler"
      icon="undo"
      group="main"
      :position="20"
      :disabled="!canUndo"
      @click="undo"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Refaire"
      icon="redo"
      group="main"
      :position="21"
      :disabled="!canRedo"
      @click="redo"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Éditer"
      icon="pencil"
      group="main"
      :position="30"
      @click="edit"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Exporter"
      icon="download"
      group="end"
      :position="100"
      @click="() => console.log('📥 Exporter')"
    />

    <DynamicToolbarButton
      :registry="registry"
      label="Paramètres"
      icon="settings"
      group="end"
      :position="200"
      @click="() => console.log('⚙️ Paramètres')"
    />
  </div>
</template>
```
  :::
::

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-slot-registry.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-slot-registry.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-slot-registry.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-slot-registry.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-slot-registry/useSlotRegistry.ts"}

```ts [src/composables/use-slot-registry/useSlotRegistry.ts]
import {
  ref,
  computed,
  h,
  type Ref,
  type ComputedRef,
  type VNode,
  type Component,
  type InjectionKey,
} from "vue";
import {
  useCheckIn,
  type CheckInDesk,
  type CheckInDeskOptions,
} from "../use-check-in/useCheckIn";

export type SlotType = "component" | "vnode" | "render-function";

export type SlotPosition = "start" | "end" | number;

export type SlotScopedProps<TScope = any> = TScope;

export type SlotRenderFunction<TScope = any> = (
  scope?: SlotScopedProps<TScope>,
) => VNode | VNode[];

export interface SlotDefinition<TScope = any> {
  id: string | number;

  name?: string;

  component?: Component;

  vnode?: VNode | VNode[];

  render?: SlotRenderFunction<TScope>;

  props?: Record<string, any>;

  position?: SlotPosition;

  priority?: number;

  visible?: boolean | (() => boolean);

  group?: string;

  meta?: Record<string, any>;
}

export interface SlotRegistryOptions<
  TScope = any,
  TContext extends Record<string, any> = {},
> extends CheckInDeskOptions<SlotDefinition<TScope>, TContext> {
  defaultSort?: {
    by: "position" | "priority" | "timestamp";
    order?: "asc" | "desc";
  };

  defaultFilter?: (slot: SlotDefinition<TScope>) => boolean;
}

export interface RegisterSlotOptions<TScope = any> {
  id?: string | number;

  name?: string;

  component?: Component;

  vnode?: VNode | VNode[];

  render?: SlotRenderFunction<TScope>;

  props?: Record<string, any>;

  position?: SlotPosition;

  priority?: number;

  visible?: boolean | (() => boolean);

  group?: string;

  autoRegister?: boolean;

  watchProps?: boolean;

  meta?: Record<string, any>;

  debug?: boolean;
}

export interface SlotRegistry<
  TScope = any,
  TContext extends Record<string, any> = {},
> extends CheckInDesk<SlotDefinition<TScope>, TContext> {
  getSlots: (options?: {
    group?: string;
    visible?: boolean;
    sortBy?: "position" | "priority" | "timestamp";
    order?: "asc" | "desc";
  }) => SlotDefinition<TScope>[];

  renderSlots: (
    scope?: SlotScopedProps<TScope>,
    options?: {
      group?: string;
      visible?: boolean;
    },
  ) => VNode[];

  slots: ComputedRef<VNode[]>;

  getSlotsByGroup: (group: string) => ComputedRef<SlotDefinition<TScope>[]>;

  renderGroup: (group: string, scope?: SlotScopedProps<TScope>) => VNode[];
}

export const useSlotRegistry = <
  TScope = any,
  TContext extends Record<string, any> = {},
>() => {
  const checkInSystem = useCheckIn<SlotDefinition<TScope>, TContext>();

  const createSlotRegistry = (
    options?: SlotRegistryOptions<TScope, TContext>,
  ) => {
    const { desk, DeskInjectionKey } = checkInSystem.createDesk(options);

    const getSlots = (getOptions?: {
      group?: string;
      visible?: boolean;
      sortBy?: "position" | "priority" | "timestamp";
      order?: "asc" | "desc";
    }): SlotDefinition<TScope>[] => {
      let slots = desk.getAll();

      if (getOptions?.group !== undefined) {
        slots = slots.filter((item) => item.data.group === getOptions.group);
      }

      if (getOptions?.visible !== undefined) {
        slots = slots.filter((item) => {
          const visible = item.data.visible;
          if (visible === undefined) return true;
          return typeof visible === "function" ? visible() : visible;
        });
      } else {
        slots = slots.filter((item) => {
          const visible = item.data.visible;
          if (visible === undefined) return true;
          return typeof visible === "function" ? visible() : visible;
        });
      }

      const sortBy =
        getOptions?.sortBy || options?.defaultSort?.by || "position";
      const order = getOptions?.order || options?.defaultSort?.order || "asc";

      slots.sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortBy) {
          case "position":
            aVal = a.data.position ?? 999999;
            bVal = b.data.position ?? 999999;
            break;
          case "priority":
            aVal = a.data.priority ?? 0;
            bVal = b.data.priority ?? 0;
            break;
          case "timestamp":
            aVal = a.timestamp ?? 0;
            bVal = b.timestamp ?? 0;
            break;
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return order === "desc" ? -comparison : comparison;
      });

      return slots.map((item) => item.data);
    };

    const renderSlots = (
      scope?: SlotScopedProps<TScope>,
      renderOptions?: {
        group?: string;
        visible?: boolean;
      },
    ): VNode[] => {
      const slots = getSlots(renderOptions);

      return slots.flatMap((slot) => {
        if (slot.render) {
          const result = slot.render(scope);
          return Array.isArray(result) ? result : [result];
        }

        if (slot.vnode) {
          return Array.isArray(slot.vnode) ? slot.vnode : [slot.vnode];
        }

        if (slot.component) {
          const props = {
            ...slot.props,
            ...(scope ? { scope } : {}),
          };
          return [h(slot.component, props)];
        }

        return [];
      });
    };

    const slots = computed(() => renderSlots());

    const getSlotsByGroup = (
      group: string,
    ): ComputedRef<SlotDefinition<TScope>[]> => {
      return computed(() => getSlots({ group }));
    };

    const renderGroup = (
      group: string,
      scope?: SlotScopedProps<TScope>,
    ): VNode[] => {
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

      getSlots,
      renderSlots,
      slots,
      getSlotsByGroup,
      renderGroup,
    };
  };

  const registerSlot = <
    TDesk extends SlotRegistry<TScope, TContext> = SlotRegistry<
      TScope,
      TContext
    >,
  >(
    parentRegistryOrSymbol:
      | SlotRegistry<TScope, TContext>
      | InjectionKey<SlotRegistry<TScope, TContext>>
      | null
      | undefined,
    slotOptions: RegisterSlotOptions<TScope>,
  ) => {
    const slotData: SlotDefinition<TScope> = {
      id: slotOptions.id || checkInSystem.generateId("slot"),
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

  const createSlot = {
    fromComponent: <TScope = any,>(
      component: Component,
      props?: Record<string, any>,
      options?: Partial<RegisterSlotOptions<TScope>>,
    ): RegisterSlotOptions<TScope> => ({
      component,
      props,
      ...options,
    }),

    fromRender: <TScope = any,>(
      render: SlotRenderFunction<TScope>,
      options?: Partial<RegisterSlotOptions<TScope>>,
    ): RegisterSlotOptions<TScope> => ({
      render,
      ...options,
    }),

    fromVNode: <TScope = any,>(
      vnode: VNode | VNode[],
      options?: Partial<RegisterSlotOptions<TScope>>,
    ): RegisterSlotOptions<TScope> => ({
      vnode,
      ...options,
    }),
  };

  return {
    createSlotRegistry,
    registerSlot,
    createSlot,

    generateId: checkInSystem.generateId,
    memoizedId: checkInSystem.memoizedId,
  };
};
```

```ts [src/composables/use-check-in/useCheckIn.ts]
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
} from "vue";

export type DeskEventType = "check-in" | "check-out" | "update" | "clear";

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

export interface CheckInDesk<
  T = any,
  TContext extends Record<string, any> = {},
> {
  registry: Ref<Map<string | number, CheckInItem<T>>>;
  checkIn: (
    id: string | number,
    data: T,
    meta?: Record<string, any>,
  ) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: {
    sortBy?: keyof T | "timestamp";
    order?: "asc" | "desc";
  }) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (
    items: Array<{ id: string | number; data: T; meta?: Record<string, any> }>,
  ) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => void;

  on: (event: DeskEventType, callback: DeskEventCallback<T>) => () => void;

  off: (event: DeskEventType, callback: DeskEventCallback<T>) => void;

  emit: (
    event: DeskEventType,
    payload: { id?: string | number; data?: T },
  ) => void;
}

export interface CheckInDeskOptions<
  T = any,
  TContext extends Record<string, any> = {},
> {
  context?: TContext;

  onBeforeCheckIn?: (id: string | number, data: T) => void | boolean;

  onCheckIn?: (id: string | number, data: T) => void;

  onBeforeCheckOut?: (id: string | number) => void | boolean;

  onCheckOut?: (id: string | number) => void;

  debug?: boolean;
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

const instanceIdMap = new WeakMap<object, string>();

const customIdMap = new Map<string, string>();
let instanceCounter = 0;

export const useCheckIn = <
  T = any,
  TContext extends Record<string, any> = {},
>() => {
  const createDeskContext = <
    T = any,
    TContext extends Record<string, any> = {},
  >(
    options?: CheckInDeskOptions<T, TContext>,
  ): CheckInDesk<T, TContext> => {
    const registry = ref<Map<string | number, CheckInItem<T>>>(
      new Map(),
    ) as Ref<Map<string | number, CheckInItem<T>>>;

    const debug = options?.debug ? Debug : NoOpDebug;

    const eventListeners = new Map<DeskEventType, Set<DeskEventCallback<T>>>();

    const emit = (
      event: DeskEventType,
      payload: { id?: string | number; data?: T },
    ) => {
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

      debug(
        `[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`,
      );

      return () => off(event, callback);
    };

    const off = (event: DeskEventType, callback: DeskEventCallback<T>) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        debug(
          `[Event] Listener removed for '${event}', remaining: ${listeners.size}`,
        );
      }
    };

    const checkIn = (
      id: string | number,
      data: T,
      meta?: Record<string, any>,
    ): boolean => {
      debug("checkIn", { id, data, meta });

      if (options?.onBeforeCheckIn) {
        const result = options.onBeforeCheckIn(id, data);
        if (result === false) {
          debug("checkIn cancelled by onBeforeCheckIn", id);
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

      emit("check-in", { id, data });

      options?.onCheckIn?.(id, data);

      if (options?.debug) {
        debug("Registry state after check-in:", {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const checkOut = (id: string | number): boolean => {
      debug("checkOut", id);

      const existed = registry.value.has(id);
      if (!existed) return false;

      if (options?.onBeforeCheckOut) {
        const result = options.onBeforeCheckOut(id);
        if (result === false) {
          debug("checkOut cancelled by onBeforeCheckOut", id);
          return false;
        }
      }

      registry.value.delete(id);
      triggerRef(registry);

      emit("check-out", { id });

      options?.onCheckOut?.(id);

      if (options?.debug) {
        debug("Registry state after check-out:", {
          total: registry.value.size,
          items: Array.from(registry.value.keys()),
        });
      }

      return true;
    };

    const get = (id: string | number) => registry.value.get(id);

    const getAll = (sortOptions?: {
      sortBy?: keyof T | "timestamp";
      order?: "asc" | "desc";
    }) => {
      const items = Array.from(registry.value.values());

      if (!sortOptions?.sortBy) return items;

      return items.sort((a, b) => {
        let aVal: any, bVal: any;

        if (sortOptions.sortBy === "timestamp") {
          aVal = a.timestamp || 0;
          bVal = b.timestamp || 0;
        } else {
          const key = sortOptions.sortBy as keyof T;
          aVal = a.data[key];
          bVal = b.data[key];
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortOptions.order === "desc" ? -comparison : comparison;
      });
    };

    const update = (id: string | number, data: Partial<T>): boolean => {
      const existing = registry.value.get(id);
      if (!existing) {
        debug("update failed: item not found", id);
        return false;
      }

      if (typeof existing.data === "object" && typeof data === "object") {
        const previousData = { ...existing.data };

        Object.assign(existing.data as object, data);
        triggerRef(registry);

        emit("update", { id, data: existing.data });

        if (options?.debug) {
          debug("update diff:", {
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
      debug("clear");
      const count = registry.value.size;
      registry.value.clear();
      triggerRef(registry);

      emit("clear", {});

      debug(`Cleared ${count} items from registry`);
    };

    const checkInMany = (
      items: Array<{
        id: string | number;
        data: T;
        meta?: Record<string, any>;
      }>,
    ) => {
      debug("checkInMany", items.length, "items");
      items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
    };

    const checkOutMany = (ids: Array<string | number>) => {
      debug("checkOutMany", ids.length, "items");
      ids.forEach((id) => checkOut(id));
    };

    const updateMany = (
      updates: Array<{ id: string | number; data: Partial<T> }>,
    ) => {
      debug("updateMany", updates.length, "items");
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
      on,
      off,
      emit,
    };
  };

  const createDesk = (options?: CheckInDeskOptions<T, TContext>) => {
    const DeskInjectionKey = Symbol("CheckInDesk") as InjectionKey<
      CheckInDesk<T, TContext> & TContext
    >;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.context || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(DeskInjectionKey, fullContext);

    if (options?.debug) {
      Debug("Desk opened with injection key:", DeskInjectionKey.description);
    }

    return {
      desk: fullContext,
      DeskInjectionKey,
    };
  };

  const checkIn = <
    TDesk extends CheckInDesk<T, TContext> & TContext = CheckInDesk<
      T,
      TContext
    > &
      TContext,
  >(
    parentDeskOrSymbol:
      | (CheckInDesk<T, TContext> & TContext)
      | InjectionKey<CheckInDesk<T, TContext> & TContext>
      | null
      | undefined,
    checkInOptions?: CheckInOptions<T>,
  ) => {
    const debug = checkInOptions?.debug ? Debug : NoOpDebug;

    if (!parentDeskOrSymbol) {
      debug("[useCheckIn] No parent desk provided - skipping check-in");

      return {
        desk: null as TDesk | null,
        checkOut: () => {},
        updateSelf: () => {},
      };
    }

    let desk: (CheckInDesk<T, TContext> & TContext) | null | undefined;

    if (typeof parentDeskOrSymbol === "symbol") {
      desk = inject(parentDeskOrSymbol);
      if (!desk) {
        debug("[useCheckIn] Could not inject desk from symbol");

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

    const getCurrentData = async (): Promise<T> => {
      if (!checkInOptions?.data) return undefined as T;

      const dataValue =
        typeof checkInOptions.data === "function"
          ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
          : checkInOptions.data;

      return dataValue instanceof Promise ? await dataValue : dataValue;
    };

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

    const performCheckOut = () => {
      if (!isCheckedIn.value) return;

      desk!.checkOut(itemId);
      isCheckedIn.value = false;

      debug(`[useCheckIn] Checked out: ${itemId}`);
    };

    if (checkInOptions?.watchCondition) {
      const condition = checkInOptions.watchCondition;

      const shouldBeCheckedIn =
        typeof condition === "function" ? condition() : condition.value;
      if (shouldBeCheckedIn && checkInOptions?.autoCheckIn !== false) {
        performCheckIn();
      }

      conditionStopHandle = watch(
        () => (typeof condition === "function" ? condition() : condition.value),
        async (shouldCheckIn) => {
          if (shouldCheckIn && !isCheckedIn.value) {
            await performCheckIn();
          } else if (!shouldCheckIn && isCheckedIn.value) {
            performCheckOut();
          }
        },
      );
    } else if (checkInOptions?.autoCheckIn !== false) {
      performCheckIn();
    }

    let watchStopHandle: (() => void) | null = null;
    if (checkInOptions?.watchData && checkInOptions?.data) {
      const watchOptions = checkInOptions.shallow
        ? { deep: false }
        : { deep: true };

      watchStopHandle = watch(
        () => {
          if (!checkInOptions.data) return undefined;
          return typeof checkInOptions.data === "function"
            ? (checkInOptions.data as (() => T) | (() => Promise<T>))()
            : checkInOptions.data;
        },
        async (newData) => {
          if (isCheckedIn.value && newData !== undefined) {
            const resolvedData =
              newData instanceof Promise ? await newData : newData;
            desk!.update(itemId, resolvedData);

            debug(`[useCheckIn] Updated data for: ${itemId}`, resolvedData);
          }
        },
        watchOptions,
      );
    }

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

  const generateId = (prefix = "item"): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }

    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      const id = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join(
        "",
      );
      return `${prefix}-${id}`;
    }

    const isDev =
      typeof process !== "undefined" && process.env?.NODE_ENV === "development";
    if (isDev) {
      console.warn(
        "[useCheckIn] crypto API not available, using Math.random fallback. " +
          "Consider upgrading to a modern environment.",
      );
    }
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}-${timestamp}-${random}`;
  };

  const memoizedId = (
    instanceOrId: object | string | number | null | undefined,
    prefix = "item",
  ): string => {
    if (typeof instanceOrId === "string" || typeof instanceOrId === "number") {
      const key = `${prefix}-${instanceOrId}`;
      let id = customIdMap.get(key);
      if (!id) {
        id = String(instanceOrId);
        customIdMap.set(key, id);
      }
      return id;
    }

    if (instanceOrId && typeof instanceOrId === "object") {
      let id = instanceIdMap.get(instanceOrId);
      if (!id) {
        id = `${prefix}-${++instanceCounter}`;
        instanceIdMap.set(instanceOrId, id);
      }
      return id;
    }

    const isDev =
      typeof process !== "undefined" && process.env?.NODE_ENV === "development";
    if (isDev) {
      console.warn(
        `[useCheckIn] memoizedId: no instance or custom ID provided. ` +
          `Generated cryptographically secure ID. ` +
          `Consider passing getCurrentInstance() or a custom ID (nanoid, uuid, props.id, etc.).`,
      );
    }
    return generateId(prefix);
  };

  const standaloneDesk = <T = any,>(options?: CheckInDeskOptions<T>) => {
    return createDeskContext<T>(options);
  };

  const isCheckedIn = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    id: string | number | Ref<string | number>,
  ): ComputedRef<boolean> => {
    return computed(() => {
      const itemId = typeof id === "object" && "value" in id ? id.value : id;
      return desk.has(itemId);
    });
  };

  const getRegistry = <T = any, TContext extends Record<string, any> = {}>(
    desk: CheckInDesk<T, TContext> & TContext,
    options?: { sortBy?: keyof T | "timestamp"; order?: "asc" | "desc" },
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
```
:::

## API
::hr-underline
::

  ### Returns

Fallback: empty array

| Property | Type | Description |
|----------|------|-------------|
| `createSlotRegistry`{.primary .text-primary} | `any` | — |
| `registerSlot`{.primary .text-primary} | `any` | — |
| `createSlot`{.primary .text-primary} | `any` | — |
| `generateId`{.primary .text-primary} | `any` | Expose check-in helpers |
| `memoizedId`{.primary .text-primary} | `any` | — |

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `SlotType`{.primary .text-primary} | `type` | — |
| `SlotPosition`{.primary .text-primary} | `type` | — |
| `SlotScopedProps`{.primary .text-primary} | `type` | — |
| `SlotRenderFunction`{.primary .text-primary} | `type` | — |
| `SlotDefinition`{.primary .text-primary} | `interface` | — |
| `SlotRegistryOptions`{.primary .text-primary} | `interface` | — |
| `RegisterSlotOptions`{.primary .text-primary} | `interface` | — |
| `SlotRegistry`{.primary .text-primary} | `interface` | — |

---

  ## Examples
  ::hr-underline
  ::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <breadcrumb-manager-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useSlotRegistry } from "../useSlotRegistry";
import BreadcrumbItem from "./BreadcrumbItem.vue";

interface BreadcrumbScope {
  isLast: boolean;
  index: number;
  total: number;
}

const { createSlotRegistry } = useSlotRegistry<BreadcrumbScope>();

const { registry, renderSlots } = createSlotRegistry({
  defaultSort: { by: "position", order: "asc" },
});

const currentPath = ref("/projects/assembler-ui/registry/use-slot-registry");

const breadcrumbScope = computed(() => {
  const items = registry.getAll();
  return (index: number) => ({
    isLast: index === items.length - 1,
    index,
    total: items.length,
  });
});
</script>

<template>
  <div class="w-full rounded-lg border bg-card p-6">
    <h3 class="mb-4 font-semibold">Breadcrumb Manager Demo</h3>

    <nav class="mb-4 flex items-center gap-2 rounded bg-muted/30 p-3 text-sm">
      <component
        :is="
          () => {
            const items = registry.getAll();
            return items.flatMap((item, index) => {
              const scope: BreadcrumbScope = {
                isLast: index === items.length - 1,
                index,
                total: items.length,
              };
              return registry.renderSlots(scope);
            });
          }
        "
      />
    </nav>

    <div class="text-sm text-muted-foreground">
      <strong>Chemin actuel:</strong> {{ currentPath }}
    </div>

    <BreadcrumbItem
      :registry="registry"
      label="Accueil"
      href="/"
      :position="1"
    />

    <BreadcrumbItem
      :registry="registry"
      label="Projects"
      href="/projects"
      :position="2"
    />

    <BreadcrumbItem
      :registry="registry"
      label="assembler-ui"
      href="/projects/assembler-ui"
      :position="3"
    />

    <BreadcrumbItem
      :registry="registry"
      label="registry"
      href="/projects/assembler-ui/registry"
      :position="4"
    />

    <BreadcrumbItem
      :registry="registry"
      label="use-slot-registry"
      href="/projects/assembler-ui/registry/use-slot-registry"
      :position="5"
      :is-active="true"
    />
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <notification-provider-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, h } from "vue";
import { useSlotRegistry } from "../useSlotRegistry";
import NotificationItem from "./NotificationItem.vue";

type NotificationType = "info" | "success" | "warning" | "error";

interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
}

const { createSlotRegistry } = useSlotRegistry<NotificationData>();

const { registry, renderSlots } = createSlotRegistry({
  defaultSort: { by: "timestamp", order: "desc" },
});

const notificationIdCounter = ref(0);
const activeNotifications = ref<NotificationData[]>([]);

const showNotification = (
  type: NotificationType,
  title: string,
  message: string,
  duration = 5000,
) => {
  const id = `notification-${++notificationIdCounter.value}`;
  const notification: NotificationData = {
    id,
    type,
    title,
    message,
    duration,
  };

  activeNotifications.value.push(notification);

  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }
};

const removeNotification = (id: string) => {
  activeNotifications.value = activeNotifications.value.filter(
    (n) => n.id !== id,
  );
};

const showInfo = () => {
  showNotification(
    "info",
    "Information",
    "Ceci est une notification informative.",
  );
};

const showSuccess = () => {
  showNotification(
    "success",
    "Succès",
    "L'opération a été effectuée avec succès.",
  );
};

const showWarning = () => {
  showNotification(
    "warning",
    "Avertissement",
    "Attention, ceci nécessite votre attention.",
  );
};

const showError = () => {
  showNotification(
    "error",
    "Erreur",
    "Une erreur est survenue lors du traitement.",
    0,
  );
};
</script>

<template>
  <div class="relative w-full rounded-lg border bg-card p-6">
    <h3 class="mb-4 font-semibold">Notification Provider Demo</h3>

    <div class="mb-6 flex flex-wrap gap-2">
      <button
        class="rounded bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
        @click="showInfo"
      >
        Info
      </button>
      <button
        class="rounded bg-green-500 px-3 py-1.5 text-sm text-white hover:bg-green-600"
        @click="showSuccess"
      >
        Success
      </button>
      <button
        class="rounded bg-orange-500 px-3 py-1.5 text-sm text-white hover:bg-orange-600"
        @click="showWarning"
      >
        Warning
      </button>
      <button
        class="rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600"
        @click="showError"
      >
        Error
      </button>
    </div>

    <div
      class="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      <component :is="() => renderSlots()" />
    </div>

    <NotificationItem
      v-for="notification in activeNotifications"
      :key="notification.id"
      :registry="registry"
      :notification="notification"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <context-menu-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, h } from "vue";
import { useSlotRegistry } from "../useSlotRegistry";
import ContextMenuItem from "./ContextMenuItem.vue";

interface MenuScope {
  x: number;
  y: number;
  targetElement?: HTMLElement;
}

const { createSlotRegistry } = useSlotRegistry<MenuScope>();

const { registry, renderSlots } = createSlotRegistry({
  defaultSort: { by: "position", order: "asc" },
});

const isMenuOpen = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const targetElement = ref<HTMLElement | null>(null);

const openContextMenu = (event: MouseEvent) => {
  event.preventDefault();
  menuPosition.value = { x: event.clientX, y: event.clientY };
  targetElement.value = event.target as HTMLElement;
  isMenuOpen.value = true;
};

const closeMenu = () => {
  isMenuOpen.value = false;
  targetElement.value = null;
};

const handleClickOutside = (event: MouseEvent) => {
  const menu = document.getElementById("context-menu");
  if (menu && !menu.contains(event.target as Node)) {
    closeMenu();
  }
};

const toggleMenuListener = (open: boolean) => {
  if (open) {
    document.addEventListener("click", handleClickOutside);
  } else {
    document.removeEventListener("click", handleClickOutside);
  }
};

watch(isMenuOpen, toggleMenuListener);

onUnmounted(() => {
  toggleMenuListener(false);
});

const menuScope = computed(
  (): MenuScope => ({
    x: menuPosition.value.x,
    y: menuPosition.value.y,
    targetElement: targetElement.value || undefined,
  }),
);
</script>

<template>
  <div class="w-full rounded-lg border bg-card p-6">
    <h3 class="mb-4 font-semibold">Context Menu Demo</h3>

    <div
      class="flex min-h-48 cursor-context-menu items-center justify-center rounded border-2 border-dashed bg-muted/30 p-8"
      @contextmenu="openContextMenu"
    >
      <p class="text-muted-foreground">
        Clic droit ici pour ouvrir le menu contextuel
      </p>
    </div>

    <Teleport to="body">
      <div
        v-if="isMenuOpen"
        id="context-menu"
        class="fixed z-50 min-w-48 rounded-lg border bg-popover p-1 shadow-lg"
        :style="{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`,
        }"
      >
        <component :is="() => renderSlots(menuScope)" />
      </div>
    </Teleport>

    <ContextMenuItem
      :registry="registry"
      label="Copier"
      icon="copy"
      :position="1"
      @select="
        () => {
          console.log('📋 Copier');
          closeMenu();
        }
      "
    />

    <ContextMenuItem
      :registry="registry"
      label="Couper"
      icon="scissors"
      :position="2"
      @select="
        () => {
          console.log('✂️ Couper');
          closeMenu();
        }
      "
    />

    <ContextMenuItem
      :registry="registry"
      label="Coller"
      icon="clipboard"
      :position="3"
      @select="
        () => {
          console.log('📄 Coller');
          closeMenu();
        }
      "
    />

    <ContextMenuItem
      :registry="registry"
      label="Supprimer"
      icon="trash"
      :position="4"
      variant="destructive"
      @select="
        () => {
          console.log('🗑️ Supprimer');
          closeMenu();
        }
      "
    />

    <ContextMenuItem
      :registry="registry"
      label="Propriétés"
      icon="info"
      :position="100"
      group="footer"
      @select="
        () => {
          console.log('ℹ️ Propriétés');
          closeMenu();
        }
      "
    />
  </div>
</template>

<script lang="ts">
import { watch, computed, onUnmounted } from "vue";
</script>
```
  :::
::

::tip
You can copy and adapt this template for any composable documentation.
::
