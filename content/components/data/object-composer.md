---
title: ObjectComposer
description: 
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <object-composer-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  ObjectComposer,
  ObjectComposerHeader,
  ObjectComposerTitle,
  ObjectComposerDescription,
  ObjectComposerItem,
  ObjectComposerField,
} from "@/components/ui/object-composer";
import { Separator } from "@/components/ui/separator";

const userData = ref({
  user: {
    name: "Jean Dupont",
    age: 30,
    email: "jean.dupont@example.com",
    active: true,
  },
  settings: {
    theme: "dark",
    notifications: {
      email: true,
      push: false,
      sms: null,
    },
    preferences: {
      language: "fr",
      timezone: "Europe/Paris",
    },
  },
  tags: ["developer", "designer", "writer"],
  scores: [95, 87, 92, 88],
  metadata: {
    createdAt: "2025-11-14",
    updatedAt: "2025-11-14",
    version: 1.0,
  },
});

const readonlyData = ref({
  system: {
    version: "1.0.0",
    environment: "production",
  },
  config: {
    debug: false,
    logLevel: "info",
  },
});
</script>

<template>
  <div class="h-128 max-h-128 overflow-auto">
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">Basic Usage</h3>
      <p class="text-sm text-muted-foreground mb-4">
        ObjectComposer with header and auto-instantiated items
      </p>
      <ObjectComposer v-model="userData">
        <ObjectComposerHeader>
          <ObjectComposerTitle>User Data</ObjectComposerTitle>
          <ObjectComposerDescription>
            Editable JSON object with auto-generated fields
          </ObjectComposerDescription>
        </ObjectComposerHeader>
        <Separator class="my-4" />

        <ObjectComposerItem />
      </ObjectComposer>
    </div>

    <Separator class="my-8" />

    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2">Custom Field Rendering</h3>
      <p class="text-sm text-muted-foreground mb-4">
        ObjectComposerItem with custom ObjectComposerField template
      </p>
      <ObjectComposer v-model="readonlyData">
        <ObjectComposerHeader>
          <ObjectComposerTitle>System Config</ObjectComposerTitle>
          <ObjectComposerDescription>
            Custom badge-style rendering for each field
          </ObjectComposerDescription>
        </ObjectComposerHeader>
        <Separator class="my-4" />

        <ObjectComposerItem>
          <ObjectComposerField />
        </ObjectComposerItem>
      </ObjectComposer>
    </div>

    <Separator class="my-8" />

    <div>
      <h2 class="demo-title">Données JSON</h2>
      <p class="demo-description">
        Voici le contenu JSON actuel de l'éditeur :
      </p>
      <pre class="json-output">{{ JSON.stringify(userData, null, 2) }}</pre>
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
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/object-composer.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/object-composer.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/object-composer.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/object-composer.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/object-composer/index.ts"}

```ts [src/components/ui/object-composer/index.ts]
export { default as ObjectComposer } from "./ObjectComposer.vue";
export { default as ObjectComposerHeader } from "./ObjectComposerHeader.vue";
export { default as ObjectComposerTitle } from "./ObjectComposerTitle.vue";
export { default as ObjectComposerDescription } from "./ObjectComposerDescription.vue";
export { default as ObjectComposerItem } from "./ObjectComposerItem.vue";
export { default as ObjectComposerField } from "./ObjectComposerField.vue";
```

```vue [src/components/ui/object-composer/ObjectComposer.vue]
<script setup lang="ts">
import {
  computed,
  ref,
  provide,
  triggerRef,
  type HTMLAttributes,
  type InjectionKey,
} from "vue";
import { cn } from "@/lib/utils";
import { ObjectComposerItem } from ".";
import { Button } from "@/components/ui/button";
import {
  useCheckIn,
  type CheckInDesk,
} from "~~/registry/new-york/composables/use-check-in/useCheckIn";

interface ComposerItemData {
  key: string;
  value: any;
  path: string[];
  depth: number;
  isInArray: boolean;
}

interface ObjectComposerProps {
  readonly?: boolean;
  class?: HTMLAttributes["class"];
}

interface SlotProps {
  itemKey: string;
  value: any;
  valueType: string;
  displayValue: string;
  isExpandable: boolean;
  isEditing: boolean;
  editKey: string;
  editValue: string;
}

const props = withDefaults(defineProps<ObjectComposerProps>(), {
  readonly: false,
});

const model = defineModel<Record<string, any> | any[]>({ required: true });

const editingPath = ref<string[] | null>(null);

const { createDesk } = useCheckIn<ComposerItemData>();
const { desk, DeskInjectionKey } = createDesk({
  context: {
    editingPath,

    updateValue: (path: string[], value: any) => {
      let current: any = model.value;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key) current = current[key];
      }
      const lastKey = path[path.length - 1];
      if (lastKey) {
        current[lastKey] = value;
        triggerRef(model);
      }
    },
    deleteValue: (path: string[]) => {
      let current: any = model.value;
      const lastKey = path[path.length - 1];
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key) current = current[key];
      }
      if (lastKey) {
        if (Array.isArray(current)) {
          current.splice(Number(lastKey), 1);
        } else {
          delete current[lastKey];
        }
        triggerRef(model);
      }
    },
    addValue: (path: string[], key: string, value: any) => {
      let current: any = model.value;
      for (const pathKey of path) {
        current = current[pathKey];
      }
      if (Array.isArray(current)) {
        current.push(value);
      } else {
        current[key] = value;
      }
      triggerRef(model);
    },
    updateKey: (path: string[], newKey: string) => {
      const parent = path.length > 1 ? path.slice(0, -1) : [];
      const oldKey = path[path.length - 1];
      let current: any = model.value;
      for (const key of parent) {
        current = current[key];
      }
      if (current && oldKey && !Array.isArray(current) && oldKey !== newKey) {
        const value = current[oldKey];
        delete current[oldKey];
        current[newKey] = value;
        triggerRef(model);
      }
    },
    startEdit: (path: string[]) => {
      editingPath.value = path;
    },
    cancelEdit: () => {
      editingPath.value = null;
    },
  },
  onCheckIn: (id, data) => {
    console.log("[ObjectComposer] Item registered:", id, data.key);
  },
  onCheckOut: (id) => {
    console.log("[ObjectComposer] Item unregistered:", id);
  },
  debug: false,
});

provide("objectComposerDesk", { deskSymbol: DeskInjectionKey, model });
</script>

<template>
  <div
    data-slot="object-composer"
    :class="cn('flex flex-col text-sm', props.class)"
  >
    <slot />
  </div>
</template>
```

```vue [src/components/ui/object-composer/ObjectComposerContent.vue]
<script setup lang="ts"></script>

<template>
  <div data-slot="object-composer-content">Foo</div>
</template>

<style scoped></style>
```

```vue [src/components/ui/object-composer/ObjectComposerDescription.vue]
<script setup lang="ts">
import { FieldDescription } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";

export interface ObjectComposerDescriptionProps {
  class?: HTMLAttributes["class"];
}

const props = defineProps<ObjectComposerDescriptionProps>();
</script>

<template>
  <FieldDescription :class="cn(props.class)">
    <slot>
      <span>Object Composer Description</span>
    </slot>
  </FieldDescription>
</template>

<style scoped></style>
```

```vue [src/components/ui/object-composer/ObjectComposerField.vue]
<script setup lang="ts">
import { inject, computed, ref, type ComputedRef } from "vue";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Check, X, Edit, Plus, Trash } from "lucide-vue-next";
import type { CheckInDesk } from "~~/registry/new-york/composables/use-check-in/useCheckIn";

interface ObjectComposerFieldProps {
  asChild?: boolean;
}

const props = defineProps<ObjectComposerFieldProps>();

const itemContext = inject<{
  desk: CheckInDesk<any>;
  itemKey: ComputedRef<string>;
  value: ComputedRef<any>;
  valueType: ComputedRef<string>;
  displayValue: ComputedRef<string>;
  isExpandable: ComputedRef<boolean>;
  isEditing: ComputedRef<boolean>;
  isInArray: ComputedRef<boolean>;
  currentPath: ComputedRef<string[]>;
  handleStartEdit: () => void;
  handleCancelEdit: () => void;
  saveEdit: (editKey: string, editValue: string) => void;
  deleteItem: () => void;
  addChild: () => void;
}>("objectComposerItemContext");

const editKey = ref("");
const editValue = ref<string>("");

const initEditValues = () => {
  if (!itemContext) return;

  editKey.value = itemContext.itemKey.value;

  editValue.value =
    itemContext.valueType.value === "string"
      ? itemContext.value.value
      : JSON.stringify(itemContext.value.value);
};

const slotProps = computed(() => ({
  itemKey: itemContext?.itemKey.value,
  value: itemContext?.value.value,
  valueType: itemContext?.valueType.value,
  displayValue: itemContext?.displayValue.value,
  isExpandable: itemContext?.isExpandable.value,
  isEditing: itemContext?.isEditing.value,
  desk: itemContext?.desk,
  itemDesk: itemContext?.desk,
  handleStartEdit: () => {
    initEditValues();
    itemContext?.handleStartEdit();
  },
  handleCancelEdit: itemContext?.handleCancelEdit,
  deleteItem: itemContext?.deleteItem,
  addChild: itemContext?.addChild,
}));

const handleSaveEdit = () => {
  if (!itemContext) return;
  itemContext.saveEdit(editKey.value, editValue.value);
};

const handleEditStart = () => {
  initEditValues();
  itemContext?.handleStartEdit();
};
</script>

<template>
  <slot v-if="asChild" v-bind="slotProps" />

  <div
    v-else-if="itemContext?.isEditing?.value"
    class="flex items-center gap-2 p-3 rounded-md border bg-background w-full"
  >
    <template v-if="!itemContext?.isInArray?.value">
      <Input
        v-model="editKey"
        class="flex-none w-32"
        placeholder="Clé"
        type="text"
        @keyup.enter="handleSaveEdit"
        @keyup.esc="itemContext?.handleCancelEdit"
      />
      <span
        v-if="!itemContext?.isExpandable?.value"
        class="text-muted-foreground"
        >:</span
      >
    </template>

    <Input
      v-if="!itemContext?.isExpandable?.value"
      v-model="editValue"
      class="flex-1"
      placeholder="Valeur"
      type="text"
      @keyup.enter="handleSaveEdit"
      @keyup.esc="itemContext?.handleCancelEdit"
    />
    <div class="flex ml-auto">
      <Button
        variant="ghost"
        size="icon"
        title="Sauvegarder"
        @click="handleSaveEdit"
      >
        <Check :size="14" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Annuler"
        @click="itemContext?.handleCancelEdit"
      >
        <X :size="14" />
      </Button>
    </div>
  </div>

  <div v-else class="flex items-center w-full group">
    <div class="flex-1 flex items-center gap-1.5">
      <span class="font-medium text-foreground">{{
        itemContext?.itemKey.value
      }}</span>
      <span class="text-muted-foreground">:</span>
      <span
        :class="
          cn({
            'text-red-600 dark:text-red-400':
              itemContext?.valueType.value === 'string',
            'text-blue-600 dark:text-blue-400':
              itemContext?.valueType.value === 'number',
            'text-purple-600 dark:text-purple-400':
              itemContext?.valueType.value === 'boolean',
            'text-muted-foreground italic':
              itemContext?.valueType.value === 'null',
            'text-muted-foreground italic text-sm':
              itemContext?.valueType.value === 'object' ||
              itemContext?.valueType.value === 'array',
          })
        "
      >
        {{ itemContext?.displayValue.value }}
      </span>
    </div>

    <div
      class="flex ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Button
        v-if="!itemContext?.isExpandable.value"
        variant="ghost"
        size="icon"
        title="Éditer"
        @click="handleEditStart"
      >
        <Edit :size="14" />
      </Button>

      <Button
        v-if="itemContext?.isExpandable.value && !itemContext?.isInArray.value"
        variant="ghost"
        size="icon"
        title="Éditer la clé"
        @click="handleEditStart"
      >
        <Edit :size="14" />
      </Button>

      <Button
        v-if="itemContext?.isExpandable.value"
        variant="ghost"
        size="icon"
        title="Ajouter un enfant"
        @click="itemContext?.addChild"
      >
        <Plus :size="14" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        title="Supprimer"
        @click="itemContext?.deleteItem"
      >
        <Trash :size="14" />
      </Button>
    </div>
  </div>
</template>
```

```vue [src/components/ui/object-composer/ObjectComposerHeader.vue]
<script setup lang="ts"></script>

<template><slot /></template>
```

```vue [src/components/ui/object-composer/ObjectComposerItem.vue]
<script setup lang="ts">
import {
  ref,
  computed,
  inject,
  provide,
  type HTMLAttributes,
  type InjectionKey,
  onMounted,
} from "vue";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight } from "lucide-vue-next";
import {
  useCheckIn,
  type CheckInDesk,
} from "~~/registry/new-york/composables/use-check-in/useCheckIn";
import ObjectComposerField from "./ObjectComposerField.vue";

interface ComposerItemData {
  key: string;
  value: any;
  path: string[];
  depth: number;
  isInArray: boolean;
}

interface ObjectComposerItemProps {
  itemKey?: string;
  value?: any;
  depth?: number;
  path?: string[];
  isInArray?: boolean;
  class?: HTMLAttributes["class"];
}

interface SlotProps {
  itemKey: string;
  value: any;
  valueType: string;
  displayValue: string;
  isExpandable: boolean;
  isEditing: boolean;
  editKey: string;
  editValue: string;
}

const props = withDefaults(defineProps<ObjectComposerItemProps>(), {
  depth: 0,
  path: () => [],
  isInArray: false,
});

const slots = defineSlots<{
  field?: () => any;
  default?: (props: SlotProps) => any;
}>();

const composerDesk = inject<{
  deskSymbol: InjectionKey<CheckInDesk<ComposerItemData>>;
  model: any;
}>("objectComposerDesk")!;

if (!composerDesk) {
  throw new Error("ObjectComposerItem must be used within ObjectComposer");
}

const rootEntries = computed(() => {
  if (!props.itemKey && composerDesk.model) {
    const modelValue = composerDesk.model.value;
    if (Array.isArray(modelValue)) {
      return modelValue.map((item, index) => [String(index), item]);
    }
    return Object.entries(modelValue);
  }
  return null;
});

const { checkIn } = useCheckIn<ComposerItemData>();

const currentPath = computed(() => {
  if (!props.itemKey) return [];
  return [...props.path, props.itemKey];
});

const deskResult = props.itemKey
  ? checkIn(composerDesk.deskSymbol, {
      autoCheckIn: true,
      id: currentPath.value.join("."),
      data: {
        key: props.itemKey!,
        value: props.value,
        path: currentPath.value,
        depth: props.depth,
        isInArray: props.isInArray,
      },
    })
  : null;

const desk = deskResult?.desk;

const editingPath = desk ? (desk as any).editingPath : ref(null);
const updateValueInDesk = desk
  ? (desk as any).updateValue
  : () => console.warn("No desk available");
const deleteValueInDesk = desk
  ? (desk as any).deleteValue
  : () => console.warn("No desk available");
const addValueInDesk = desk
  ? (desk as any).addValue
  : () => console.warn("No desk available");
const updateKeyInDesk = desk
  ? (desk as any).updateKey
  : () => console.warn("No desk available");
const startEditInDesk = desk
  ? (desk as any).startEdit
  : () => console.warn("No desk available");
const cancelEditInDesk = desk
  ? (desk as any).cancelEdit
  : () => console.warn("No desk available");

provide("objectComposerItemContext", {
  desk,
  itemKey: computed(() => props.itemKey),
  value: computed(() => props.value),
  valueType: computed(() => valueType.value),
  displayValue: computed(() => displayValue.value),
  isExpandable: computed(() => isExpandable.value),
  isEditing: computed(() => isEditing.value),
  isInArray: computed(() => props.isInArray),
  currentPath: computed(() => currentPath.value),
  handleStartEdit,
  handleCancelEdit,
  saveEdit,
  deleteItem,
  addChild,
});

const accordionValue = ref<string>("item-1");

const isEditing = computed(() => {
  if (!editingPath.value) return false;
  if (editingPath.value.length !== currentPath.value.length) return false;
  return editingPath.value.every(
    (key: string, i: number) => key === currentPath.value[i],
  );
});

const valueType = computed(() => {
  if (props.value === null) return "null";
  if (Array.isArray(props.value)) return "array";
  return typeof props.value;
});

const isExpandable = computed(() => {
  return valueType.value === "object" || valueType.value === "array";
});

const childEntries = computed(() => {
  if (valueType.value === "object") {
    return Object.entries(props.value);
  }
  if (valueType.value === "array") {
    return props.value.map((item: any, index: number) => [String(index), item]);
  }
  return [];
});

const displayValue = computed(() => {
  switch (valueType.value) {
    case "string":
      return `"${props.value}"`;
    case "number":
    case "boolean":
      return String(props.value);
    case "null":
      return "null";
    case "object":
      return "";
    case "array":
      return "";
    default:
      return String(props.value);
  }
});

function handleStartEdit() {
  if (!props.itemKey) return;
  startEditInDesk(currentPath.value);
}

function handleCancelEdit() {
  if (!props.itemKey) return;
  cancelEditInDesk();
}

function saveEdit(newKey: string, newValueStr: string) {
  let newValue: any;

  try {
    if (valueType.value === "object" || valueType.value === "array") {
      newValue = JSON.parse(newValueStr);
    } else if (valueType.value === "number") {
      newValue = Number(newValueStr);
      if (isNaN(newValue)) {
        throw new Error("Valeur numérique invalide");
      }
    } else if (valueType.value === "boolean") {
      newValue = newValueStr === "true";
    } else if (valueType.value === "null") {
      newValue = null;
    } else {
      newValue = newValueStr;
    }

    updateValueInDesk(currentPath.value, newValue);

    if (newKey !== props.itemKey && !props.isInArray && newKey.trim() !== "") {
      updateKeyInDesk(currentPath.value, newKey);
    }

    cancelEditInDesk();
  } catch (e) {
    console.error("Invalid value:", e);

    alert(
      `Erreur de sauvegarde: ${e instanceof Error ? e.message : "Valeur invalide"}`,
    );
  }
}

function deleteItem() {
  deleteValueInDesk(currentPath.value);
}

function addChild() {
  const key =
    valueType.value === "array" ? String(props.value.length) : "newKey";
  addValueInDesk(currentPath.value, key, "");
}
</script>

<template>
  <template v-if="rootEntries">
    <ObjectComposerItem
      v-for="[key, value] in rootEntries"
      :key="key"
      :item-key="key"
      :value="value"
      :depth="depth"
      :path="path"
      :is-in-array="Array.isArray(composerDesk.model.value)"
    >
      <template v-if="slots.field" #field>
        <slot name="field" />
      </template>
    </ObjectComposerItem>
  </template>

  <div
    v-else-if="!isExpandable"
    data-slot="object-composer-item"
    :class="
      cn(
        'select-none',
        !isEditing && 'hover:bg-accent border-l border-border relative',
        props.class,
      )
    "
  >
    <div class="flex items-center w-full">
      <div class="w-8" />

      <div class="flex-1">
        <slot name="field">
          <ObjectComposerField />
        </slot>
      </div>
    </div>
  </div>

  <Accordion
    v-else
    v-model="accordionValue"
    type="single"
    collapsible
    :class="cn()"
  >
    <AccordionItem value="item-1" class="border-b-0">
      <div class="flex items-center w-full hover:bg-accent select-none">
        <AccordionTrigger
          class="flex-none hover:no-underline select-none py-1! px-2"
        >
          <template #icon>
            <ChevronRight
              class="transition-transform duration-200 w-4 h-4 text-muted-foreground"
            />
          </template>
        </AccordionTrigger>

        <div class="flex-1">
          <slot name="field">
            <ObjectComposerField />
          </slot>
        </div>
      </div>
      <AccordionContent class="pb-0!">
        <div class="border-l border-border ml-4">
          <ObjectComposerItem
            v-for="[key, val] in childEntries"
            :key="key"
            :item-key="key"
            :value="val"
            :depth="depth + 1"
            :path="currentPath"
            :is-in-array="valueType === 'array'"
          >
            <template v-if="slots.field" #field>
              <slot name="field" />
            </template>
          </ObjectComposerItem>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<style scoped>
.expand-spacer {
  width: 20px;
}
</style>
```

```vue [src/components/ui/object-composer/ObjectComposerTitle.vue]
<script setup lang="ts">
import { FieldLegend } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "vue";

export interface ObjectComposerTitleProps {
  class?: HTMLAttributes["class"];
  variant?: "legend" | "label";
}

const props = defineProps<ObjectComposerTitleProps>();
</script>

<template>
  <FieldLegend :class="cn(props.class)" :variant="props.variant">
    <slot>
      <span>Object Composer</span>
    </slot>
  </FieldLegend>
</template>

<style scoped></style>
```

```ts [src/composables/use-check-in/useCheckIn.ts]
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
} from "vue";

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
} from "./types";

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
} from "./types";

const NoOpDebug = (_message: string, ..._args: any[]) => {};

const Debug = (message: string, ...args: any[]) => {
  console.log(`[useCheckIn] ${message}`, ...args);
};

const instanceIdMap = new WeakMap<object, string>();
const customIdMap = new Map<string, string>();

const sortFnCache = new Map<
  string,
  (a: CheckInItem<any>, b: CheckInItem<any>) => number
>();

const generateSecureId = (prefix = "item"): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return `${prefix}-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16)}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const compileSortFn = <T = any,>(
  sortBy: keyof T | "timestamp" | `meta.${string}`,
  order: "asc" | "desc" = "asc",
): ((a: CheckInItem<T>, b: CheckInItem<T>) => number) => {
  const cacheKey = `${String(sortBy)}-${order}`;
  const cached = sortFnCache.get(cacheKey);
  if (cached) return cached;

  const fn = (a: CheckInItem<T>, b: CheckInItem<T>) => {
    let aVal: any;
    let bVal: any;

    if (sortBy === "timestamp") {
      aVal = a.timestamp || 0;
      bVal = b.timestamp || 0;
    } else if (String(sortBy).startsWith("meta.")) {
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
    return order === "asc" ? result : -result;
  };

  sortFnCache.set(cacheKey, fn);
  return fn;
};

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

    const eventListeners = new Map<
      DeskEventType,
      Set<DeskEventCallback<T, any>>
    >();

    const emit = <E extends DeskEventType>(
      event: E,
      payload: Omit<DeskEventPayload<T>[E], "timestamp">,
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

    const on = <E extends DeskEventType>(
      event: E,
      callback: DeskEventCallback<T, E>,
    ) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
      }
      eventListeners.get(event)!.add(callback);

      debug(
        `[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`,
      );

      return () => off(event, callback);
    };

    const off = <E extends DeskEventType>(
      event: E,
      callback: DeskEventCallback<T, E>,
    ) => {
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
      meta?: CheckInItemMeta,
    ): boolean => {
      debug("checkIn", { id, data, meta });

      if (options?.onBeforeCheckIn) {
        const result = options.onBeforeCheckIn(id, data);
        if (result === false) {
          debug("checkIn cancelled by onBeforeCheckIn", id);
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

      emit("check-in", { id, data });

      options?.onCheckIn?.(id, data);

      hooks.trigger("onCheckIn", item);

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

      hooks.trigger("onCheckOut", id);

      if (options?.debug) {
        debug("Registry state after check-out:", {
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

      emit("update", { id, data: updatedItem.data });
      hooks.trigger("onUpdate", updatedItem);

      debug("update", { id, data });
      return true;
    };

    const clear = () => {
      registry.value.clear();
      triggerRef(registry);
      emit("clear", {});
      hooks.trigger("onClear");
      debug("clear");
    };

    const checkInMany = (
      items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
    ) => {
      items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
    };

    const checkOutMany = (ids: Array<string | number>) => {
      ids.forEach((id) => checkOut(id));
    };

    const updateMany = (
      updates: Array<{ id: string | number; data: Partial<T> }>,
    ) => {
      updates.forEach(({ id, data }) => update(id, data));
    };

    const getAll = (opts?: GetAllOptions<T>): CheckInItem<T>[] => {
      let items = Array.from(registry.value.values());

      if (opts?.group) {
        items = items.filter((item) => item.meta?.group === opts.group);
      }

      if (opts?.filter) {
        items = items.filter(opts.filter);
      }

      if (opts?.sortBy) {
        const sortFn = compileSortFn<T>(opts.sortBy, opts.order);
        items.sort(sortFn);
      }

      return items;
    };

    const getGroup = (
      group: string,
      sortOptions?: {
        sortBy?: keyof T | "timestamp" | `meta.${string}`;
        order?: "asc" | "desc";
      },
    ) => {
      return computed(() => getAll({ ...sortOptions, group }));
    };

    const items = computed(() => getAll());

    const slotsRegistry = new Map<string, SlotConfig>();

    const slots: SlotsAPI<T> = {
      register: (
        slotId: string,
        slotType: string,
        meta?: Record<string, any>,
      ) => {
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
        debug("[Slots] All slots cleared");
      },
    };

    const hooksRegistry = new Map<string, DeskHook<T>>();

    const hooks: HooksAPI<T> & {
      trigger: (method: keyof DeskHook<T>, ...args: any[]) => void;
    } = {
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
          if (typeof fn === "function") {
            (fn as any)(...args);
          }
        });
      },
    };

    if (options?.hooks) {
      options.hooks.forEach((hook) => hooks.add(hook));
    }

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

      const meta = {
        ...checkInOptions?.meta,
        ...(checkInOptions?.group !== undefined && {
          group: checkInOptions.group,
        }),
        ...(checkInOptions?.position !== undefined && {
          position: checkInOptions.position,
        }),
        ...(checkInOptions?.priority !== undefined && {
          priority: checkInOptions.priority,
        }),
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
    return generateSecureId(prefix);
  };

  const memoizedId = (
    instanceOrId: object | string | number | null | undefined,
    prefix = "item",
  ): string => {
    if (instanceOrId && typeof instanceOrId === "object") {
      const existing = instanceIdMap.get(instanceOrId);
      if (existing) return existing;

      const newId = generateSecureId(prefix);
      instanceIdMap.set(instanceOrId, newId);
      return newId;
    }

    if (typeof instanceOrId === "string" || typeof instanceOrId === "number") {
      const key = `${prefix}-${instanceOrId}`;
      const existing = customIdMap.get(key);
      if (existing) return existing;

      const newId = `${prefix}-${instanceOrId}`;
      customIdMap.set(key, newId);
      return newId;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[useCheckIn] memoizedId called with null/undefined. Consider passing getCurrentInstance() or a custom ID.",
      );
    }

    return generateSecureId(prefix);
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

```ts [src/composables/use-check-in/plugin-manager.ts]
import type { Plugin, PluginContext } from "./types";

export class PluginManager<T = any> {
  private plugins = new Map<string, Plugin<T>>();
  private context: PluginContext<T> | null = null;

  constructor() {}

  initialize(context: PluginContext<T>) {
    this.context = context;
    context.debug("[PluginManager] Initialized with context");
  }

  install(...plugins: Plugin<T>[]) {
    if (!this.context) {
      throw new Error(
        "[PluginManager] Context not initialized. Call initialize() first.",
      );
    }

    for (const plugin of plugins) {
      if (this.plugins.has(plugin.name)) {
        this.context.debug(
          `[PluginManager] Plugin '${plugin.name}' already installed, skipping`,
        );
        continue;
      }

      this.context.debug(`[PluginManager] Installing plugin '${plugin.name}'`);
      plugin.install(this.context);
      this.plugins.set(plugin.name, plugin);
    }
  }

  get<P extends Plugin<T>>(name: string): P | undefined {
    return this.plugins.get(name) as P | undefined;
  }

  has(name: string): boolean {
    return this.plugins.has(name);
  }

  uninstall(name: string): boolean {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      this.context?.debug(`[PluginManager] Plugin '${name}' not found`);
      return false;
    }

    this.context?.debug(`[PluginManager] Uninstalling plugin '${name}'`);
    plugin.cleanup?.();
    this.plugins.delete(name);
    return true;
  }

  cleanup() {
    this.context?.debug(
      `[PluginManager] Cleaning up ${this.plugins.size} plugins`,
    );

    for (const [name, plugin] of this.plugins) {
      this.context?.debug(`[PluginManager] Cleaning up plugin '${name}'`);
      plugin.cleanup?.();
    }

    this.plugins.clear();
  }

  list(): string[] {
    return Array.from(this.plugins.keys());
  }
}
```

```ts [src/composables/use-check-in/types.ts]
import type { Ref, ComputedRef, InjectionKey } from "vue";

export type DeskEventType = "check-in" | "check-out" | "update" | "clear";

export type DeskEventPayload<T = any> = {
  "check-in": { id: string | number; data: T; timestamp: number };
  "check-out": { id: string | number; timestamp: number };
  update: { id: string | number; data: T; timestamp: number };
  clear: { timestamp: number };
};

export type DeskEventCallback<
  T = any,
  E extends DeskEventType = DeskEventType,
> = (payload: DeskEventPayload<T>[E]) => void;

export interface CheckInItem<T = any> {
  id: string | number;
  data: T;
  timestamp?: number;
  meta?: CheckInItemMeta;
}

export interface CheckInItemMeta {
  group?: string;

  order?: number;

  priority?: number;

  user?: Record<string, any>;
}

export interface SlotConfig {
  id: string;

  type: string;

  meta?: Record<string, any>;
}

export interface SlotsAPI<T = any> {
  register: (
    slotId: string,
    slotType: string,
    meta?: Record<string, any>,
  ) => void;

  unregister: (slotId: string) => void;

  get: (slotId: string) => CheckInItem<T>[];

  has: (slotId: string) => boolean;

  list: () => SlotConfig[];

  clear: () => void;
}

export interface DeskHook<T = any> {
  name: string;

  onCheckIn?: (item: CheckInItem<T>) => void;

  onCheckOut?: (id: string | number) => void;

  onUpdate?: (item: CheckInItem<T>) => void;

  onClear?: () => void;

  cleanup?: () => void;
}

export interface HooksAPI<T = any> {
  add: (hook: DeskHook<T>) => void;

  remove: (name: string) => boolean;

  list: () => string[];
}

export interface CheckInDesk<
  T = any,
  TContext extends Record<string, any> = {},
> {
  registry: Readonly<Ref<Map<string | number, CheckInItem<T>>>>;

  slots: SlotsAPI<T>;

  hooks: HooksAPI<T>;
  checkIn: (id: string | number, data: T, meta?: CheckInItemMeta) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: GetAllOptions<T>) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (
    items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
  ) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => void;

  on: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => () => void;

  off: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => void;

  emit: <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], "timestamp">,
  ) => void;

  getGroup: (
    group: string,
    options?: SortOptions<T>,
  ) => ComputedRef<CheckInItem<T>[]>;

  items: ComputedRef<CheckInItem<T>[]>;
}

export interface GetAllOptions<T = any> {
  sortBy?: keyof T | "timestamp" | `meta.${string}`;
  order?: "asc" | "desc";
  group?: string;
  filter?: (item: CheckInItem<T>) => boolean;
}

export interface SortOptions<T = any> {
  sortBy?: keyof T | "timestamp" | `meta.${string}`;
  order?: "asc" | "desc";
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

  hooks?: DeskHook<T>[];
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

  meta?: CheckInItemMeta;

  group?: string;

  position?: number;

  priority?: number;

  debug?: boolean;
}

export interface DeskProvider<
  T = any,
  TContext extends Record<string, any> = {},
> {
  desk: CheckInDesk<T, TContext> & TContext;
  DeskInjectionKey: InjectionKey<CheckInDesk<T, TContext> & TContext>;
}

export interface CheckInReturn<
  T = any,
  TContext extends Record<string, any> = {},
> {
  desk: (CheckInDesk<T, TContext> & TContext) | null;
  checkOut: () => void;
  updateSelf: (newData?: T) => void;
}
```

```ts [src/composables/use-check-in/plugins/events.plugin.ts]
import type {
  Plugin,
  PluginContext,
  DeskEventType,
  DeskEventCallback,
  DeskEventPayload,
} from "../types";

export interface EventsPlugin<T = any> extends Plugin<T> {
  on: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => () => void;
  off: <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => void;
  emit: <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], "timestamp">,
  ) => void;
}

export const createEventsPlugin = <T = any,>(): EventsPlugin<T> => {
  const eventListeners = new Map<
    DeskEventType,
    Set<DeskEventCallback<T, any>>
  >();
  let context: PluginContext<T> | null = null;

  const emit = <E extends DeskEventType>(
    event: E,
    payload: Omit<DeskEventPayload<T>[E], "timestamp">,
  ) => {
    const listeners = eventListeners.get(event);
    if (!listeners || listeners.size === 0) return;

    const eventPayload = {
      ...payload,
      timestamp: Date.now(),
    } as DeskEventPayload<T>[E];

    context?.debug(`[Event] ${event}`, eventPayload);
    listeners.forEach((callback) => callback(eventPayload));
  };

  const on = <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, new Set());
    }
    eventListeners.get(event)!.add(callback);

    context?.debug(
      `[Event] Listener added for '${event}', total: ${eventListeners.get(event)!.size}`,
    );

    return () => off(event, callback);
  };

  const off = <E extends DeskEventType>(
    event: E,
    callback: DeskEventCallback<T, E>,
  ) => {
    const listeners = eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      context?.debug(
        `[Event] Listener removed for '${event}', remaining: ${listeners.size}`,
      );
    }
  };

  const cleanup = () => {
    eventListeners.clear();
    context?.debug("[Event] Cleaned up all event listeners");
  };

  return {
    name: "events",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Events plugin installed");
    },
    cleanup,
    on,
    off,
    emit,
  };
};
```

```ts [src/composables/use-check-in/plugins/id.plugin.ts]
import type { Plugin, PluginContext } from "../types";

export interface IdPlugin extends Plugin {
  generateId: (prefix?: string) => string;
  memoizedId: (
    instanceOrId: object | string | number | null | undefined,
    prefix?: string,
  ) => string;
  clearCache: () => void;
}

const instanceIdMap = new WeakMap<object, string>();

const customIdMap = new Map<string, string>();
let instanceCounter = 0;

const generateSecureId = (prefix = "item"): string => {
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

export const createIdPlugin = (): IdPlugin => {
  let context: PluginContext | null = null;

  const generateId = (prefix = "item"): string => {
    const id = generateSecureId(prefix);
    context?.debug("[ID] Generated secure ID:", id);
    return id;
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
        context?.debug("[ID] Memoized custom ID:", { key, id });
      }
      return id;
    }

    if (instanceOrId && typeof instanceOrId === "object") {
      let id = instanceIdMap.get(instanceOrId);
      if (!id) {
        id = `${prefix}-${++instanceCounter}`;
        instanceIdMap.set(instanceOrId, id);
        context?.debug("[ID] Memoized instance ID:", {
          prefix,
          id,
          counter: instanceCounter,
        });
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

  const clearCache = () => {
    customIdMap.clear();
    instanceCounter = 0;
    context?.debug("[ID] Cleared ID cache");
  };

  const cleanup = () => {
    clearCache();
    context?.debug("[ID] Plugin cleaned up");
  };

  return {
    name: "id",
    install: (ctx: PluginContext) => {
      context = ctx;
      ctx.debug("[Plugin] ID plugin installed");
    },
    cleanup,
    generateId,
    memoizedId,
    clearCache,
  };
};

export const clearIdCache = () => {
  customIdMap.clear();
  instanceCounter = 0;
};
```

```ts [src/composables/use-check-in/plugins/index.ts]
export { createEventsPlugin, type EventsPlugin } from "./events.plugin";
export { createRegistryPlugin, type RegistryPlugin } from "./registry.plugin";
export {
  createSortingPlugin,
  clearSortCache,
  type SortingPlugin,
} from "./sorting.plugin";
export { createIdPlugin, clearIdCache, type IdPlugin } from "./id.plugin";
```

```ts [src/composables/use-check-in/plugins/registry.plugin.ts]
import { triggerRef } from "vue";
import type {
  Plugin,
  PluginContext,
  CheckInItem,
  CheckInItemMeta,
} from "../types";

export interface RegistryPlugin<T = any> extends Plugin<T> {
  checkIn: (id: string | number, data: T, meta?: CheckInItemMeta) => boolean;
  checkOut: (id: string | number) => boolean;
  get: (id: string | number) => CheckInItem<T> | undefined;
  update: (id: string | number, data: Partial<T>) => boolean;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (
    items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
  ) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => void;
}

export const createRegistryPlugin = <T = any,>(
  emitEvent?: <E extends string>(event: E, payload: any) => void,
): RegistryPlugin<T> => {
  let context: PluginContext<T> | null = null;

  const checkIn = (
    id: string | number,
    data: T,
    meta?: CheckInItemMeta,
  ): boolean => {
    if (!context) return false;

    context.debug("checkIn", { id, data, meta });

    if (context.options?.onBeforeCheckIn) {
      const result = context.options.onBeforeCheckIn(id, data);
      if (result === false) {
        context.debug("checkIn cancelled by onBeforeCheckIn", id);
        return false;
      }
    }

    context.registry.value.set(id, {
      id,
      data: data as any,
      timestamp: Date.now(),
      meta,
    });
    triggerRef(context.registry);

    emitEvent?.("check-in", { id, data });

    context.options?.onCheckIn?.(id, data);

    if (context.options?.debug) {
      context.debug("Registry state after check-in:", {
        total: context.registry.value.size,
        items: Array.from(context.registry.value.keys()),
      });
    }

    return true;
  };

  const checkOut = (id: string | number): boolean => {
    if (!context) return false;

    context.debug("checkOut", id);

    const existed = context.registry.value.has(id);
    if (!existed) return false;

    if (context.options?.onBeforeCheckOut) {
      const result = context.options.onBeforeCheckOut(id);
      if (result === false) {
        context.debug("checkOut cancelled by onBeforeCheckOut", id);
        return false;
      }
    }

    context.registry.value.delete(id);
    triggerRef(context.registry);

    emitEvent?.("check-out", { id });

    context.options?.onCheckOut?.(id);

    if (context.options?.debug) {
      context.debug("Registry state after check-out:", {
        total: context.registry.value.size,
        items: Array.from(context.registry.value.keys()),
      });
    }

    return true;
  };

  const get = (id: string | number) => {
    return context?.registry.value.get(id);
  };

  const update = (id: string | number, data: Partial<T>): boolean => {
    if (!context) return false;

    const existing = context.registry.value.get(id);
    if (!existing) {
      context.debug("update failed: item not found", id);
      return false;
    }

    if (typeof existing.data === "object" && typeof data === "object") {
      const previousData = { ...existing.data };

      Object.assign(existing.data as object, data);
      triggerRef(context.registry);

      emitEvent?.("update", { id, data: existing.data });

      if (context.options?.debug) {
        context.debug("update diff:", {
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

  const has = (id: string | number) => {
    return context?.registry.value.has(id) ?? false;
  };

  const clear = () => {
    if (!context) return;

    context.debug("clear");
    const count = context.registry.value.size;
    context.registry.value.clear();
    triggerRef(context.registry);

    emitEvent?.("clear", {});

    context.debug(`Cleared ${count} items from registry`);
  };

  const checkInMany = (
    items: Array<{ id: string | number; data: T; meta?: CheckInItemMeta }>,
  ) => {
    context?.debug("checkInMany", items.length, "items");
    items.forEach(({ id, data, meta }) => checkIn(id, data, meta));
  };

  const checkOutMany = (ids: Array<string | number>) => {
    context?.debug("checkOutMany", ids.length, "items");
    ids.forEach((id) => checkOut(id));
  };

  const updateMany = (
    updates: Array<{ id: string | number; data: Partial<T> }>,
  ) => {
    context?.debug("updateMany", updates.length, "items");
    updates.forEach(({ id, data }) => update(id, data));
  };

  const cleanup = () => {
    if (!context) return;
    context.registry.value.clear();
    context.debug("[Registry] Cleaned up registry");
  };

  return {
    name: "registry",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Registry plugin installed");
    },
    cleanup,
    checkIn,
    checkOut,
    get,
    update,
    has,
    clear,
    checkInMany,
    checkOutMany,
    updateMany,
  };
};
```

```ts [src/composables/use-check-in/plugins/runtime-usage.example.ts]
import type { Plugin, PluginContext, CheckInItem } from "../types";

export interface AnalyticsEvent {
  type: "check-in" | "check-out" | "update";
  itemId: string | number;
  timestamp: number;
  data?: any;
}

export interface AnalyticsPluginOptions {
  endpoint?: string;
  batchSize?: number;
  flushInterval?: number;
}

export interface AnalyticsPlugin<T = any> extends Plugin<T> {
  track: (event: AnalyticsEvent) => void;

  flush: () => Promise<void>;

  getStats: () => {
    totalEvents: number;
    checkIns: number;
    checkOuts: number;
    updates: number;
  };
}

export const createAnalyticsPlugin = <T = any,>(
  options?: AnalyticsPluginOptions,
): AnalyticsPlugin<T> => {
  let context: PluginContext<T> | null = null;
  const events: AnalyticsEvent[] = [];
  let stats = {
    totalEvents: 0,
    checkIns: 0,
    checkOuts: 0,
    updates: 0,
  };

  const track = (event: AnalyticsEvent) => {
    events.push(event);
    stats.totalEvents++;

    if (event.type === "check-in") stats.checkIns++;
    else if (event.type === "check-out") stats.checkOuts++;
    else if (event.type === "update") stats.updates++;

    context?.debug("[Analytics] Tracked event:", event);

    if (options?.batchSize && events.length >= options.batchSize) {
      flush();
    }
  };

  const flush = async () => {
    if (events.length === 0) return;

    const endpoint = options?.endpoint || "/api/analytics";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: [...events] }),
      });

      if (response.ok) {
        context?.debug("[Analytics] Flushed", events.length, "events");
        events.length = 0;
      }
    } catch (error) {
      console.error("[Analytics] Failed to flush:", error);
    }
  };

  const getStats = () => ({ ...stats });

  let flushInterval: NodeJS.Timeout | null = null;

  return {
    name: "analytics",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Analytics plugin installed");

      if (options?.flushInterval) {
        flushInterval = setInterval(() => {
          flush();
        }, options.flushInterval);
      }
    },
    cleanup: () => {
      flush();

      if (flushInterval) {
        clearInterval(flushInterval);
      }

      context?.debug("[Analytics] Plugin cleaned up");
    },
    track,
    flush,
    getStats,
  };
};

import { ref, onMounted, onUnmounted } from "vue";
import { useCheckIn, type CheckInDesk } from "../useCheckIn";
import type { SlotsPlugin } from "./slots.plugin.example";

export interface ToolbarItem {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

export function useToolbarWithPlugins() {
  const { createDesk } = useCheckIn<ToolbarItem>();
  const { desk } = createDesk({ debug: true });

  const slotsPlugin = ref<SlotsPlugin<ToolbarItem>>();
  const analyticsPlugin = ref<AnalyticsPlugin<ToolbarItem>>();

  const loadPlugins = async () => {
    const { createSlotsPlugin } = await import("./slots.plugin.example");
    const slots = createSlotsPlugin<ToolbarItem>();
    desk.plugins.install(slots);
    slotsPlugin.value = desk.plugins.get<SlotsPlugin<ToolbarItem>>("slots");

    slotsPlugin.value?.registerSlot("header-left", "toolbar", {
      align: "left",
    });
    slotsPlugin.value?.registerSlot("header-right", "toolbar", {
      align: "right",
    });
    slotsPlugin.value?.registerSlot("footer", "toolbar", { align: "center" });

    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "production"
    ) {
      const analytics = createAnalyticsPlugin<ToolbarItem>({
        endpoint: "/api/analytics",
        batchSize: 10,
        flushInterval: 30000,
      });

      desk.plugins.install(analytics);
      analyticsPlugin.value =
        desk.plugins.get<AnalyticsPlugin<ToolbarItem>>("analytics");

      desk.on("check-in", (payload) => {
        analyticsPlugin.value?.track({
          type: "check-in",
          itemId: payload.id,
          timestamp: payload.timestamp,
          data: payload.data,
        });
      });

      desk.on("check-out", (payload) => {
        analyticsPlugin.value?.track({
          type: "check-out",
          itemId: payload.id,
          timestamp: payload.timestamp,
        });
      });
    }
  };

  const addToSlot = (slotId: string, id: string, item: ToolbarItem) => {
    if (!slotsPlugin.value) {
      console.warn("Slots plugin not loaded");
      return;
    }

    desk.checkIn(id, item, {
      user: { slotId, slotType: "toolbar" },
    });
  };

  const getSlotItems = (slotId: string) => {
    return slotsPlugin.value?.getSlotItems(slotId) ?? [];
  };

  const getAnalyticsStats = () => {
    return analyticsPlugin.value?.getStats() ?? null;
  };

  onMounted(() => {
    loadPlugins();
  });

  onUnmounted(() => {
    analyticsPlugin.value?.flush();
  });

  return {
    desk,
    slotsPlugin,
    analyticsPlugin,
    addToSlot,
    getSlotItems,
    getAnalyticsStats,
    loadPlugins,
  };
}

export const ToolbarWithPluginsExample = `
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useToolbarWithPlugins } from './useToolbarWithPlugins';

const {
  desk,
  slotsPlugin,
  analyticsPlugin,
  addToSlot,
  getSlotItems,
  getAnalyticsStats
} = useToolbarWithPlugins();


const addSaveButton = () => {
  addToSlot('header-left', 'btn-save', {
    label: 'Save',
    icon: 'save',
    onClick: () => console.log('Save clicked')
  });
};

const addCancelButton = () => {
  addToSlot('header-right', 'btn-cancel', {
    label: 'Cancel',
    icon: 'close',
    onClick: () => console.log('Cancel clicked')
  });
};


const headerLeft = computed(() => getSlotItems('header-left'));
const headerRight = computed(() => getSlotItems('header-right'));
const footer = computed(() => getSlotItems('footer'));


const stats = computed(() => getAnalyticsStats());


const loadExtraPlugin = async () => {
  
  if (userHasPermission.value) {
    const { createPermissionsPlugin } = await import('./permissions.plugin');
    const permPlugin = createPermissionsPlugin();
    desk.plugins.install(permPlugin);
  }
};


onMounted(() => {
  addSaveButton();
  addCancelButton();
});
</script>

<template>
  <div class="toolbar-container">
    
    <header class="toolbar-header">
      <div class="toolbar-section left">
        <button
          v-for="item in headerLeft"
          :key="item.id"
          :disabled="item.data.disabled"
          @click="item.data.onClick"
          class="toolbar-button"
        >
          <span v-if="item.data.icon" class="icon">{{ item.data.icon }}</span>
          {{ item.data.label }}
        </button>
      </div>

      <div class="toolbar-section right">
        <button
          v-for="item in headerRight"
          :key="item.id"
          :disabled="item.data.disabled"
          @click="item.data.onClick"
          class="toolbar-button"
        >
          <span v-if="item.data.icon" class="icon">{{ item.data.icon }}</span>
          {{ item.data.label }}
        </button>
      </div>
    </header>

    
    <main class="content">
      <slot />
    </main>

    
    <footer class="toolbar-footer">
      <button
        v-for="item in footer"
        :key="item.id"
        :disabled="item.data.disabled"
        @click="item.data.onClick"
        class="toolbar-button"
      >
        {{ item.data.label }}
      </button>
    </footer>

    
    <div v-if="import.meta.env.DEV && stats" class="analytics-debug">
      <h4>Analytics Stats</h4>
      <pre>{{ stats }}</pre>
    </div>
  </div>
</template>

<style scoped>
.toolbar-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.toolbar-header {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.toolbar-section {
  display: flex;
  gap: 0.5rem;
}

.toolbar-button {
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.toolbar-button:hover {
  background: #f0f0f0;
}

.toolbar-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.content {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}

.toolbar-footer {
  padding: 1rem;
  background: #f5f5f5;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.analytics-debug {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
}
</style>
`;

export const PluginRuntimeTests = `
import { describe, it, expect, vi } from 'vitest';
import { useCheckIn } from '../useCheckIn';
import { createAnalyticsPlugin } from './analytics.plugin';

describe('Plugin Runtime Loading', () => {
  it('should load plugin at runtime', () => {
    const { desk } = useCheckIn<any>().createDesk();
    
    expect(desk.plugins.has('analytics')).toBe(false);
    
    const analytics = createAnalyticsPlugin();
    desk.plugins.install(analytics);
    
    expect(desk.plugins.has('analytics')).toBe(true);
  });

  it('should provide typesafe access to plugin', () => {
    const { desk } = useCheckIn<any>().createDesk();
    
    const analytics = createAnalyticsPlugin();
    desk.plugins.install(analytics);
    
    const plugin = desk.plugins.get<AnalyticsPlugin>('analytics');
    
    expect(plugin).toBeDefined();
    expect(typeof plugin?.track).toBe('function');
    expect(typeof plugin?.flush).toBe('function');
  });

  it('should track events', () => {
    const { desk } = useCheckIn<any>().createDesk();
    
    const analytics = createAnalyticsPlugin();
    desk.plugins.install(analytics);
    
    const plugin = desk.plugins.get<AnalyticsPlugin>('analytics')!;
    
    plugin.track({
      type: 'check-in',
      itemId: 'test',
      timestamp: Date.now()
    });
    
    const stats = plugin.getStats();
    expect(stats.totalEvents).toBe(1);
    expect(stats.checkIns).toBe(1);
  });

  it('should uninstall plugin', () => {
    const { desk } = useCheckIn<any>().createDesk();
    
    const analytics = createAnalyticsPlugin();
    desk.plugins.install(analytics);
    
    expect(desk.plugins.has('analytics')).toBe(true);
    
    desk.plugins.uninstall('analytics');
    
    expect(desk.plugins.has('analytics')).toBe(false);
  });
});
`;
```

```ts [src/composables/use-check-in/plugins/slots.plugin.example.ts]
import type { Plugin, PluginContext, CheckInItem } from "../types";

export interface SlotMeta {
  slotId?: string;
  slotType?: string;
  slotData?: Record<string, any>;
}

export interface SlotsPlugin<T = any> extends Plugin<T> {
  registerSlot: (
    slotId: string,
    slotType: string,
    config?: Record<string, any>,
  ) => void;

  unregisterSlot: (slotId: string) => void;

  getSlotItems: (slotId: string) => CheckInItem<T>[];

  hasSlot: (slotId: string) => boolean;
}

export const createSlotsPlugin = <T = any,>(): SlotsPlugin<T> => {
  let context: PluginContext<T> | null = null;

  const slots = new Map<
    string,
    {
      slotId: string;
      slotType: string;
      config?: Record<string, any>;
    }
  >();

  const registerSlot = (
    slotId: string,
    slotType: string,
    config?: Record<string, any>,
  ) => {
    if (slots.has(slotId)) {
      context?.debug(
        `[Slots] Slot '${slotId}' already registered, updating config`,
      );
    }

    slots.set(slotId, { slotId, slotType, config });
    context?.debug(
      `[Slots] Registered slot '${slotId}' of type '${slotType}'`,
      config,
    );
  };

  const unregisterSlot = (slotId: string) => {
    const existed = slots.delete(slotId);
    if (existed) {
      context?.debug(`[Slots] Unregistered slot '${slotId}'`);
    }
  };

  const getSlotItems = (slotId: string): CheckInItem<T>[] => {
    if (!context) return [];

    const items = Array.from(context.registry.value.values()).filter(
      (item) => (item.meta as any)?.slotId === slotId,
    );

    context?.debug(
      `[Slots] Retrieved ${items.length} items from slot '${slotId}'`,
    );
    return items;
  };

  const hasSlot = (slotId: string): boolean => {
    return slots.has(slotId);
  };

  const cleanup = () => {
    slots.clear();
    context?.debug("[Slots] Cleaned up all slots");
  };

  return {
    name: "slots",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Slots plugin installed");
    },
    cleanup,
    registerSlot,
    unregisterSlot,
    getSlotItems,
    hasSlot,
  };
};

export const SlotsPluginExample = `

<script setup lang="ts">
import { useCheckIn, createSlotsPlugin } from './useCheckIn';

interface ToolbarItem {
  label: string;
  icon?: string;
  onClick: () => void;
}

const { createDesk } = useCheckIn<ToolbarItem>();
const slotsPlugin = createSlotsPlugin<ToolbarItem>();

const { desk } = createDesk({
  plugins: [slotsPlugin]
});


slotsPlugin.registerSlot('header-left', 'toolbar', { align: 'left' });
slotsPlugin.registerSlot('header-right', 'toolbar', { align: 'right' });
slotsPlugin.registerSlot('footer-actions', 'toolbar', { align: 'center' });


const headerLeftItems = computed(() => slotsPlugin.getSlotItems('header-left'));
const headerRightItems = computed(() => slotsPlugin.getSlotItems('header-right'));
const footerItems = computed(() => slotsPlugin.getSlotItems('footer-actions'));
</script>

<template>
  <div>
    <header>
      <div class="left">
        <ToolbarButton
          v-for="item in headerLeftItems"
          :key="item.id"
          v-bind="item.data"
        />
      </div>
      <div class="right">
        <ToolbarButton
          v-for="item in headerRightItems"
          :key="item.id"
          v-bind="item.data"
        />
      </div>
    </header>
    
    <main>
      <slot /> 
    </main>
    
    <footer>
      <ToolbarButton
        v-for="item in footerItems"
        :key="item.id"
        v-bind="item.data"
      />
    </footer>
  </div>
</template>


<script setup lang="ts">
import { useCheckIn } from './useCheckIn';

const props = defineProps<{
  slotId: 'header-left' | 'header-right' | 'footer-actions';
  label: string;
  icon?: string;
}>();

const { checkIn } = useCheckIn<ToolbarItem>();

checkIn(desk, {
  autoCheckIn: true,
  id: \`btn-\${props.label}\`,
  data: {
    label: props.label,
    icon: props.icon,
    onClick: () => console.log(\`\${props.label} clicked\`)
  },
  meta: {
    slotId: props.slotId,
    slotType: 'toolbar',
    user: {
      
    }
  }
});
</script>
`;
```

```ts [src/composables/use-check-in/plugins/sorting.plugin.ts]
import type {
  Plugin,
  PluginContext,
  CheckInItem,
  GetAllOptions,
} from "../types";

export interface SortingPlugin<T = any> extends Plugin<T> {
  getAll: (options?: GetAllOptions<T>) => CheckInItem<T>[];
}

const sortFnCache = new Map<string, (a: any, b: any) => number>();

const compileSortFn = <T,>(
  sortBy: keyof T | "timestamp" | `meta.${string}`,
  order: "asc" | "desc" = "asc",
): ((a: CheckInItem<T>, b: CheckInItem<T>) => number) => {
  const cacheKey = `${String(sortBy)}-${order}`;
  const cached = sortFnCache.get(cacheKey);
  if (cached) return cached;

  let fn: (a: CheckInItem<T>, b: CheckInItem<T>) => number;

  if (sortBy === "timestamp") {
    fn = (a, b) => {
      const aVal = a.timestamp || 0;
      const bVal = b.timestamp || 0;
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === "desc" ? -comparison : comparison;
    };
  } else if (typeof sortBy === "string" && sortBy.startsWith("meta.")) {
    const metaKey = sortBy.slice(5);
    fn = (a, b) => {
      const aVal = (a.meta as any)?.[metaKey];
      const bVal = (b.meta as any)?.[metaKey];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === "desc" ? -comparison : comparison;
    };
  } else {
    const key = sortBy as keyof T;
    fn = (a, b) => {
      const aVal = a.data[key];
      const bVal = b.data[key];
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return order === "desc" ? -comparison : comparison;
    };
  }

  sortFnCache.set(cacheKey, fn);
  return fn;
};

export const createSortingPlugin = <T = any,>(): SortingPlugin<T> => {
  let context: PluginContext<T> | null = null;

  const getAll = (options?: GetAllOptions<T>): CheckInItem<T>[] => {
    if (!context) return [];

    let items = Array.from(context.registry.value.values());

    if (options?.group !== undefined) {
      items = items.filter((item) => item.meta?.group === options.group);
    }

    if (options?.filter) {
      items = items.filter(options.filter);
    }

    if (options?.sortBy) {
      const sortFn = compileSortFn<T>(options.sortBy, options.order);
      items.sort(sortFn);
    }

    return items;
  };

  const cleanup = () => {
    context?.debug("[Sorting] Plugin cleaned up");
  };

  return {
    name: "sorting",
    install: (ctx: PluginContext<T>) => {
      context = ctx;
      ctx.debug("[Plugin] Sorting plugin installed");
    },
    cleanup,
    getAll,
  };
};

export const clearSortCache = () => {
  sortFnCache.clear();
};
```
:::

## ObjectComposer
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `readonly`{.primary .text-primary} | `boolean` | false |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `objectComposerDesk`{.primary .text-primary} | `{ deskSymbol: DeskInjectionKey, model }` | `any` | Provide DeskInjectionKey for child items |

---

## ObjectComposerContent
::hr-underline
::

**API**: composition

---

## ObjectComposerDescription
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Child Components

  `FieldDescription`{.primary .text-primary}

---

## ObjectComposerField
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `asChild`{.primary .text-primary} | `boolean` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | Custom field via asChild pattern (Radix UI style) |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `objectComposerItemContext`{.primary .text-primary} | — | — | Inject desk from parent ObjectComposerItem (useCheckIn pattern) |

  ### Child Components

  `Input`{.primary .text-primary}

  `Button`{.primary .text-primary}

  `Check`{.primary .text-primary}

  `X`{.primary .text-primary}

  `Edit`{.primary .text-primary}

  `Plus`{.primary .text-primary}

  `Trash`{.primary .text-primary}

---

## ObjectComposerHeader
::hr-underline
::

**API**: composition

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

---

## ObjectComposerItem
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `itemKey`{.primary .text-primary} | `string` | - |  |
| `value`{.primary .text-primary} | `any` | - |  |
| `depth`{.primary .text-primary} | `number` | 0 |  |
| `path`{.primary .text-primary} | `string[]` |  |  |
| `isInArray`{.primary .text-primary} | `boolean` | false |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `field`{.primary .text-primary} | — |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `objectComposerItemContext`{.primary .text-primary} | `{
  desk,
  itemKey: computed(() => props.itemKey),
  value: computed(() => props.value),
  valueType: computed(() => valueType.value),
  displayValue: computed(() => displayValue.value),
  isExpandable: computed(() => isExpandable.value),
  isEditing: computed(() => isEditing.value),
  isInArray: computed(() => props.isInArray),
  currentPath: computed(() => currentPath.value),
  handleStartEdit,
  handleCancelEdit,
  saveEdit,
  deleteItem,
  addChild,
}` | `any` | Always provide context to ObjectComposerField (even without desk for auto-iterate mode) |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `objectComposerDesk`{.primary .text-primary} | — | — | Inject desk from parent ObjectComposer |

  ### Child Components

  `ObjectComposerItem`{.primary .text-primary}

  `ObjectComposerField`{.primary .text-primary}

  `Accordion`{.primary .text-primary}

  `AccordionItem`{.primary .text-primary}

  `AccordionTrigger`{.primary .text-primary}

  `ChevronRight`{.primary .text-primary}

  `AccordionContent`{.primary .text-primary}

---

## ObjectComposerTitle
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |
| `variant`{.primary .text-primary} | `'legend' \| 'label'` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Child Components

  `FieldLegend`{.primary .text-primary}

---

  ## Examples
  ::hr-underline
  ::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <custom-field-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code" class="h-128 max-h-128 overflow-auto"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  ObjectComposer,
  ObjectComposerHeader,
  ObjectComposerTitle,
  ObjectComposerDescription,
  ObjectComposerItem,
  ObjectComposerField,
} from "@/components/ui/object-composer";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const serverMetrics = ref({
  cpu: 78,
  memory: 4096,
  disk: 512000,
  uptime: 86400,
  requests: 15234,
  errors: 12,
  latency: 45.6,
  healthy: true,
  region: "us-east-1",
  environment: "production",
});

const userProfile = ref({
  username: "john.doe",
  email: "john@example.com",
  role: "admin",
  active: true,
  loginCount: 342,
  lastLogin: "2025-11-15",
  permissions: ["read", "write", "delete"],
});
</script>

<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-2xl font-bold mb-2">
        Custom ObjectComposerField (asChild Pattern)
      </h2>
      <p class="text-muted-foreground mb-6">
        Use the
        <code class="bg-muted px-1 rounded text-sm">asChild</code> pattern to
        replace ObjectComposerField rendering. Data flows via useCheckIn (desk
        context) - no props needed!
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="border rounded-lg p-4 bg-card">
        <ObjectComposer v-model="serverMetrics">
          <ObjectComposerHeader>
            <ObjectComposerTitle>
              <span class="flex items-center gap-2">
                <span class="text-green-600">●</span>
                Server Metrics
              </span>
            </ObjectComposerTitle>
          </ObjectComposerHeader>
          <Separator class="mb-4" />
          <ObjectComposerItem>
            <ObjectComposerField
              as-child
              v-slot="{ itemKey, displayValue, itemDesk }"
            >
              <div
                class="flex items-center gap-2 p-2 rounded hover:bg-accent/50 transition-colors"
              >
                <span class="font-mono text-xs text-muted-foreground min-w-24">
                  {{ itemKey }}
                </span>

                <Badge class="font-mono text-xs">
                  {{ displayValue }}
                </Badge>

                <span
                  v-if="itemDesk"
                  class="ml-auto text-xs text-green-600"
                  title="Desk connected"
                >
                  ●
                </span>
              </div>
            </ObjectComposerField>
          </ObjectComposerItem>
        </ObjectComposer>
      </div>

      <div class="border rounded-lg p-4 bg-card">
        <ObjectComposer v-model="userProfile">
          <ObjectComposerHeader>
            <ObjectComposerTitle>
              <span class="flex items-center gap-2">
                <span class="text-blue-600">●</span>
                User Profile
              </span>
            </ObjectComposerTitle>
          </ObjectComposerHeader>
          <Separator class="mb-4" />
          <ObjectComposerItem>
            <ObjectComposerField
              as-child
              v-slot="{ itemKey, displayValue, itemDesk }"
            >
              <div
                class="flex items-center gap-2 p-2 rounded hover:bg-accent/50 transition-colors"
              >
                <span class="font-mono text-xs text-muted-foreground min-w-24">
                  {{ itemKey }}
                </span>

                <Badge class="font-mono text-xs">
                  {{ displayValue }}
                </Badge>

                <span
                  v-if="itemDesk"
                  class="ml-auto text-xs text-green-600"
                  title="Desk connected"
                >
                  ●
                </span>
              </div>
            </ObjectComposerField>
          </ObjectComposerItem>
        </ObjectComposer>
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