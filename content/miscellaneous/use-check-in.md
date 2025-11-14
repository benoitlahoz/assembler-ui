---
title: useCheckIn
description: Generic check-in system for parent/child component registration pattern.
---

  <p class="text-pretty mt-4">Like an airport check-in desk: parent components provide a check-in counter<br>where child components register themselves with their data.</p>

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <accordion-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useCheckIn } from "../useCheckIn";
import AccordionItem from "./AccordionItem.vue";
import { AccordionDesk } from "./desk-keys";

const { openDesk } = useCheckIn();

const openItems = ref<Set<string | number>>(new Set());
const allowMultiple = ref(false);

const desk = openDesk(AccordionDesk, {
  extraContext: {
    openItems,
    toggle: (id: string | number) => {
      if (openItems.value.has(id)) {
        openItems.value.delete(id);
      } else {
        if (!allowMultiple.value) {
          openItems.value.clear();
        }
        openItems.value.add(id);
      }

      openItems.value = new Set(openItems.value);
    },
    isOpen: (id: string | number) => openItems.value.has(id),
  },
  onCheckIn: (id, data) => {
    if (data.open) {
      if (!allowMultiple.value) {
        openItems.value.clear();
      }
      openItems.value.add(id);
      openItems.value = new Set(openItems.value);
    }
  },
});

const itemCount = computed(() => desk.getAll().length);
</script>

<template>
  <div class="w-full max-w-2xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useCheckIn - Accordion Demo</h2>
      <p class="text-muted-foreground">
        Collapsible sections with check-in desk state management
      </p>
    </div>

    <div class="flex items-center gap-4 p-4 bg-muted rounded-lg">
      <label class="flex items-center gap-2">
        <input v-model="allowMultiple" type="checkbox" class="rounded" />
        <span class="text-sm font-medium">Allow multiple open</span>
      </label>
      <span class="text-sm text-muted-foreground"
        >{{ itemCount }} items registered</span
      >
    </div>

    <div class="border border-border rounded-lg divide-y divide-border">
      <AccordionItem id="item1" title="What is useCheckIn?" :open="true">
        <p class="text-muted-foreground">
          <strong>useCheckIn</strong> is a generic composable for managing
          parent-child component relationships using Vue's provide/inject
          pattern. Parent components open a "check-in desk" where children check
          in with their data, like passengers at an airport.
        </p>
      </AccordionItem>

      <AccordionItem id="item2" title="How does it work?">
        <ul class="space-y-2 text-muted-foreground list-disc list-inside">
          <li>
            Parent component opens a check-in desk using <code>openDesk()</code>
          </li>
          <li>
            Child components check in using <code>checkIn()</code> with
            auto-registration
          </li>
          <li>Desk maintains a reactive Map of all checked-in items</li>
          <li>
            Changes propagate automatically through Vue's reactivity system
          </li>
        </ul>
      </AccordionItem>

      <AccordionItem id="item3" title="What are the benefits?">
        <div class="space-y-2 text-muted-foreground">
          <p><strong>Benefits include:</strong></p>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li>Type-safe with full TypeScript support</li>
            <li>Auto-cleanup when components unmount</li>
            <li>Flexible extra context for custom logic</li>
            <li>Automatic reactivity updates</li>
            <li>Reusable across different component types</li>
          </ul>
        </div>
      </AccordionItem>

      <AccordionItem id="item4" title="Common use cases">
        <div class="space-y-2 text-muted-foreground">
          <p>Common patterns that benefit from this approach:</p>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li>Tabs / Tab Panels</li>
            <li>Accordions / Collapsible sections</li>
            <li>Dropdown menus with items</li>
            <li>Form field registration</li>
            <li>Wizard steps</li>
            <li>List items with selection state</li>
          </ul>
        </div>
      </AccordionItem>
    </div>

    <div class="p-4 bg-muted rounded-lg space-y-2">
      <h4 class="font-semibold">Debug Info</h4>
      <div class="text-sm space-y-1">
        <p>
          <strong>Open Items:</strong>
          {{ Array.from(openItems).join(", ") || "None" }}
        </p>
        <p><strong>Allow Multiple:</strong> {{ allowMultiple }}</p>
        <p>
          <strong>All Items:</strong>
          {{
            desk
              .getAll()
              .map((i) => `${i.id}: "${i.data.title}"`)
              .join(", ")
          }}
        </p>
      </div>
    </div>
  </div>
</template>
```
  :::
::

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-check-in.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/use-check-in/useCheckIn.ts"}

```ts [src/components/ui/use-check-in/useCheckIn.ts]
import {
  ref,
  provide,
  inject,
  onMounted,
  onBeforeUnmount,
  watch,
  type InjectionKey,
  type Ref,
} from "vue";

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
  extraContext?: Record<string, any>;

  onCheckIn?: (id: string | number, data: T) => void;

  onCheckOut?: (id: string | number) => void;
}

export interface CheckInOptions<T = any> {
  required?: boolean;

  autoCheckIn?: boolean;

  id?: string | number;

  data?: T | (() => T);

  generateId?: () => string | number;

  watchData?: boolean;
}

export const useCheckIn = () => {
  const createDesk = <T = any,>(
    namespace: string,
  ): InjectionKey<CheckInDesk<T>> => {
    return Symbol(`CheckInDesk:${namespace}`) as InjectionKey<CheckInDesk<T>>;
  };

  const createDeskContext = <T = any,>(
    options?: CheckInDeskOptions<T>,
  ): CheckInDesk<T> => {
    const registry = ref<Map<string | number, CheckInItem<T>>>(
      new Map(),
    ) as Ref<Map<string | number, CheckInItem<T>>>;

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
      if (
        existing &&
        typeof existing.data === "object" &&
        typeof data === "object"
      ) {
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

  const openDesk = <T = any,>(
    key: InjectionKey<CheckInDesk<T>>,
    options?: CheckInDeskOptions<T>,
  ) => {
    const deskContext = createDeskContext<T>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.extraContext || {}),
    } as any;

    provide(key, fullContext);

    return fullContext as CheckInDesk<T> & Record<string, any>;
  };

  const checkIn = <T = any,>(
    key: InjectionKey<CheckInDesk<T>>,
    options?: CheckInOptions<T>,
  ) => {
    const desk = inject(key, options?.required ? undefined : null);

    if (options?.required && !desk) {
      const keyName = key.description || String(key);
      throw new Error(
        `[useCheckIn] Check-in desk not found for key: ${keyName}. ` +
          `Make sure a desk is open (parent provides context).`,
      );
    }

    if (options?.autoCheckIn && desk) {
      const itemId = ref<string | number | undefined>(options.id);

      if (!itemId.value && options.generateId) {
        itemId.value = options.generateId();
      }

      if (!itemId.value) {
        throw new Error(
          '[useCheckIn] Auto check-in requires an "id" or "generateId" option',
        );
      }

      const getData = () => {
        return typeof options.data === "function"
          ? (options.data as () => T)()
          : options.data!;
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
          { deep: true },
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

  const generateId = (prefix = "passenger"): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const standaloneDesk = <T = any,>(options?: CheckInDeskOptions<T>) => {
    return createDeskContext<T>(options);
  };

  return {
    createDesk,
    openDesk,
    checkIn,
    generateId,
    standaloneDesk,
  };
};
```
:::

## useCheckIn
::hr-underline
::

Generic check-in system for parent/child component registration pattern.
Like an airport check-in desk: parent components provide a check-in counter
where child components register themselves with their data.

---

  ## Examples
  ::hr-underline
  ::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <tabs-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useCheckIn } from "../useCheckIn";
import TabPanel from "./TabPanel.vue";
import { TabsDesk } from "./desk-keys";

const { openDesk } = useCheckIn();

const activeTab = ref<string>("tab1");
const tabCount = ref(0);

const desk = openDesk(TabsDesk, {
  extraContext: {
    activeTab,
    setActive: (id: string) => {
      const tab = desk.get(id as string);
      if (tab && !tab.data.disabled) {
        activeTab.value = id as string;
      }
    },
  },
  onCheckIn: (id, data) => {
    console.log("Tab checked in:", id, data);
    tabCount.value++;

    if (tabCount.value === 1) {
      activeTab.value = id as string;
    }
  },
  onCheckOut: (id) => {
    console.log("Tab checked out:", id);
    tabCount.value--;
  },
});

const allTabs = computed(() => desk.getAll());
const activeTabData = computed(() => desk.get(activeTab.value));
</script>

<template>
  <div class="w-full max-w-2xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useCheckIn - Tabs Demo</h2>
      <p class="text-muted-foreground">
        Example of a tabs system using the generic check-in pattern
      </p>
    </div>

    <div class="border-b border-border">
      <div class="flex gap-2">
        <button
          v-for="tab in allTabs"
          :key="tab.id"
          :class="[
            'px-4 py-2 font-medium transition-colors border-b-2',
            activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
            tab.data.disabled && 'opacity-50 cursor-not-allowed',
          ]"
          :disabled="tab.data.disabled"
          @click="desk.setActive(tab.id as string)"
        >
          <span v-if="tab.data.icon" class="mr-2">{{ tab.data.icon }}</span>
          {{ tab.data.label }}
        </button>
      </div>
    </div>

    <div class="p-4 border border-border rounded-lg">
      <TabPanel id="tab1" label="Profile" icon="👤">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Profile Settings</h3>
          <p class="text-muted-foreground">
            Manage your profile information and preferences.
          </p>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <span class="font-medium">Username:</span>
              <span>john.doe</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-medium">Email:</span>
              <span>john@example.com</span>
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel id="tab2" label="Notifications" icon="🔔">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Notification Settings</h3>
          <p class="text-muted-foreground">
            Configure how you receive notifications.
          </p>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded" checked />
              <span>Email notifications</span>
            </label>
            <label class="flex items-center gap-2">
              <input type="checkbox" class="rounded" />
              <span>Push notifications</span>
            </label>
          </div>
        </div>
      </TabPanel>

      <TabPanel id="tab3" label="Security" icon="🔒">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">Security Settings</h3>
          <p class="text-muted-foreground">Keep your account secure.</p>
          <div class="space-y-2">
            <button
              class="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Change Password
            </button>
            <button
              class="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
            >
              Enable 2FA
            </button>
          </div>
        </div>
      </TabPanel>

      <TabPanel id="tab4" label="Disabled Tab" :disabled="true" icon="❌">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold">This tab is disabled</h3>
          <p class="text-muted-foreground">You should not see this content.</p>
        </div>
      </TabPanel>
    </div>

    <div class="p-4 bg-muted rounded-lg space-y-2">
      <h4 class="font-semibold">Debug Info</h4>
      <div class="text-sm space-y-1">
        <p><strong>Active Tab:</strong> {{ activeTab }}</p>
        <p>
          <strong>Active Tab Label:</strong> {{ activeTabData?.data.label }}
        </p>
        <p><strong>Total Tabs:</strong> {{ tabCount }}</p>
        <p>
          <strong>Registered Tabs:</strong>
          {{ allTabs.map((t) => t.id).join(", ") }}
        </p>
      </div>
    </div>
  </div>
</template>
```
  :::
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <toolbar-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { useCheckIn } from "../useCheckIn";
import ToolbarButton from "./ToolbarButton.vue";
import ToolbarSeparator from "./ToolbarSeparator.vue";
import { ToolbarDesk } from "./desk-keys";

const { openDesk } = useCheckIn();

const activeTool = ref<string | number | null>(null);
const clickHistory = ref<Array<{ id: string | number; time: number }>>([]);

const desk = openDesk(ToolbarDesk, {
  extraContext: {
    activeTool,
    handleClick: (id: string | number, type: "button" | "toggle") => {
      clickHistory.value.push({ id, time: Date.now() });

      if (type === "toggle") {
        activeTool.value = activeTool.value === id ? null : id;
      } else {
        console.log(`Button clicked: ${id}`);
      }
    },
    isActive: (id: string | number) => activeTool.value === id,
  },
  onCheckIn: (id, data) => {
    console.log("Tool checked in:", id, data);
  },
});

const allTools = computed(() =>
  desk.getAll().sort((a, b) => String(a.id).localeCompare(String(b.id))),
);

const lastAction = computed(() => {
  const last = clickHistory.value[clickHistory.value.length - 1];
  if (!last) return "None";
  const tool = desk.get(last.id);
  return `${tool?.data.label || last.id} at ${new Date(last.time).toLocaleTimeString()}`;
});
</script>

<template>
  <div class="w-full max-w-4xl mx-auto space-y-6 p-6">
    <div class="space-y-2">
      <h2 class="text-2xl font-bold">useCheckIn - Toolbar Demo</h2>
      <p class="text-muted-foreground">
        Dynamic toolbar with buttons, toggles, and separators managed by
        check-in desk
      </p>
    </div>

    <div class="border border-border rounded-lg p-2 bg-background">
      <div class="flex items-center gap-1">
        <ToolbarButton id="new" label="New" icon="📄" type="button" />
        <ToolbarButton id="open" label="Open" icon="📂" type="button" />
        <ToolbarButton id="save" label="Save" icon="💾" type="button" />

        <ToolbarSeparator id="sep1" />

        <ToolbarButton id="bold" label="Bold" icon="B" type="toggle" />
        <ToolbarButton id="italic" label="Italic" icon="I" type="toggle" />
        <ToolbarButton
          id="underline"
          label="Underline"
          icon="U"
          type="toggle"
        />

        <ToolbarSeparator id="sep2" />

        <ToolbarButton
          id="align-left"
          label="Align Left"
          icon="⬅️"
          type="toggle"
        />
        <ToolbarButton
          id="align-center"
          label="Align Center"
          icon="⏸️"
          type="toggle"
        />
        <ToolbarButton
          id="align-right"
          label="Align Right"
          icon="➡️"
          type="toggle"
        />

        <ToolbarSeparator id="sep3" />

        <ToolbarButton
          id="disabled"
          label="Disabled"
          icon="🚫"
          type="button"
          :disabled="true"
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="p-4 border border-border rounded-lg">
        <h3 class="font-semibold mb-2">Active Toggles</h3>
        <div class="text-sm text-muted-foreground">
          {{ activeTool ? context.get(activeTool)?.data.label : "None" }}
        </div>
      </div>

      <div class="p-4 border border-border rounded-lg">
        <h3 class="font-semibold mb-2">Last Action</h3>
        <div class="text-sm text-muted-foreground">
          {{ lastAction }}
        </div>
      </div>
    </div>

    <div class="p-4 bg-muted rounded-lg space-y-2">
      <h4 class="font-semibold">Debug Info</h4>
      <div class="text-sm space-y-1">
        <p><strong>Total Tools:</strong> {{ allTools.length }}</p>
        <p>
          <strong>Registered IDs:</strong>
          {{ allTools.map((t) => t.id).join(", ") }}
        </p>
        <p><strong>Click History:</strong> {{ clickHistory.length }} clicks</p>
      </div>
    </div>
  </div>
</template>
```
  :::
::

::tip
You can copy and adapt this template for any component documentation.
::