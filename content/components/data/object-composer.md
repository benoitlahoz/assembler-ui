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
    sortBy?: keyof T | "timestamp" | string;
    order?: "asc" | "desc";
    group?: string;
    filter?: (item: CheckInItem<T>) => boolean;
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

  getGroup: (
    group: string,
    options?: {
      sortBy?: keyof T | "timestamp" | string;
      order?: "asc" | "desc";
    },
  ) => ComputedRef<CheckInItem<T>[]>;

  items: ComputedRef<CheckInItem<T>[]>;
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

  group?: string;

  position?: number;

  priority?: number;

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

    const getAll = (options?: {
      sortBy?: keyof T | "timestamp" | string;
      order?: "asc" | "desc";
      group?: string;
      filter?: (item: CheckInItem<T>) => boolean;
    }) => {
      let items = Array.from(registry.value.values());

      if (options?.group !== undefined) {
        items = items.filter((item) => item.meta?.group === options.group);
      }

      if (options?.filter) {
        items = items.filter(options.filter);
      }

      if (!options?.sortBy) return items;

      return items.sort((a, b) => {
        let aVal: any, bVal: any;

        if (options.sortBy === "timestamp") {
          aVal = a.timestamp || 0;
          bVal = b.timestamp || 0;
        } else if (
          typeof options.sortBy === "string" &&
          options.sortBy.startsWith("meta.")
        ) {
          const metaKey = options.sortBy.slice(5);
          aVal = a.meta?.[metaKey];
          bVal = b.meta?.[metaKey];
        } else {
          const key = options.sortBy as keyof T;
          aVal = a.data[key];
          bVal = b.data[key];
        }

        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return options.order === "desc" ? -comparison : comparison;
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

    const getGroup = (
      group: string,
      sortOptions?: {
        sortBy?: keyof T | "timestamp" | string;
        order?: "asc" | "desc";
      },
    ) => {
      return computed(() => getAll({ ...sortOptions, group }));
    };

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