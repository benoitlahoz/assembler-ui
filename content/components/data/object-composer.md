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

const { openDesk } = useCheckIn<ComposerItemData>();
const { desk, DeskInjectionKey } = openDesk({
  context: {
    editingPath,

    updateValue: (path: string[], value: any) => {
      let current: any = model.value;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (key) current = current[key];
      }
      const lastKey = path[path.length - 1];
      if (lastKey) current[lastKey] = value;
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
import { Trash } from "lucide-vue-next";
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

const typeColor = computed(() => {
  switch (itemContext?.valueType.value) {
    case "string":
      return "bg-red-500";
    case "number":
      return "bg-blue-500";
    case "boolean":
      return "bg-purple-500";
    case "null":
      return "bg-gray-400";
    default:
      return "bg-gray-300";
  }
});

const badgeVariant = computed<"destructive" | "default" | "secondary">(() => {
  switch (itemContext?.valueType.value) {
    case "string":
      return "destructive";
    case "number":
      return "default";
    default:
      return "secondary";
  }
});

const slotProps = computed(() => ({
  itemKey: itemContext?.itemKey.value,
  value: itemContext?.value.value,
  valueType: itemContext?.valueType.value,
  displayValue: itemContext?.displayValue.value,
  isExpandable: itemContext?.isExpandable.value,
  isEditing: itemContext?.isEditing.value,
  desk: itemContext?.desk,
  itemDesk: itemContext?.desk,
  typeColor: typeColor.value,
  badgeVariant: badgeVariant.value,
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Annuler"
        @click="itemContext?.handleCancelEdit"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
          />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </Button>

      <Button
        v-if="itemContext?.isExpandable.value && !itemContext?.isInArray.value"
        variant="ghost"
        size="icon"
        title="Éditer la clé"
        @click="handleEditStart"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
          />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </Button>

      <Button
        v-if="itemContext?.isExpandable.value"
        variant="ghost"
        size="icon"
        title="Ajouter un enfant"
        @click="itemContext?.addChild"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        title="Supprimer"
        @click="itemContext?.deleteItem"
      >
        <Trash class="w-4 h-4" />
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
const updateValueInDesk = desk ? (desk as any).updateValue : () => {};
const deleteValueInDesk = desk ? (desk as any).deleteValue : () => {};
const addValueInDesk = desk ? (desk as any).addValue : () => {};
const startEditInDesk = desk ? (desk as any).startEdit : () => {};
const cancelEditInDesk = desk ? (desk as any).cancelEdit : () => {};

if (desk) {
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
}

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
    } else if (valueType.value === "boolean") {
      newValue = newValueStr === "true";
    } else if (valueType.value === "null") {
      newValue = null;
    } else {
      newValue = newValueStr;
    }

    updateValueInDesk(currentPath.value, newValue);

    if (newKey !== props.itemKey && !props.isInArray) {
    }

    cancelEditInDesk();
  } catch (e) {
    console.error("Invalid value", e);
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

```vue [src/components/ui/object-composer/ObjectComposerItem_copy.vue]
<script setup lang="ts">
import { ref, computed } from "vue";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";

interface ObjectComposerItemProps {
  itemKey: string;
  value: any;
  depth?: number;
  path?: string[];
}

const props = withDefaults(defineProps<ObjectComposerItemProps>(), {
  depth: 0,
  path: () => [],
});

const emit = defineEmits<{
  update: [path: string[], value: any];
  delete: [path: string[]];
  add: [path: string[], key: string, value: any];
}>();

const isExpanded = ref(true);
const isEditing = ref(false);
const editKey = ref(props.itemKey);
const editValue = ref<string>("");

const currentPath = computed(() => [...props.path, props.itemKey]);

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
      return `{ ${Object.keys(props.value).length} }`;
    case "array":
      return `[ ${props.value.length} ]`;
    default:
      return String(props.value);
  }
});

function toggleExpand() {
  if (isExpandable.value) {
    isExpanded.value = !isExpanded.value;
  }
}

function startEdit() {
  isEditing.value = true;
  editKey.value = props.itemKey;
  editValue.value =
    valueType.value === "string" ? props.value : JSON.stringify(props.value);
}

function cancelEdit() {
  isEditing.value = false;
  editKey.value = props.itemKey;
}

function saveEdit() {
  let newValue: any;

  try {
    if (valueType.value === "object" || valueType.value === "array") {
      newValue = JSON.parse(editValue.value);
    } else if (valueType.value === "number") {
      newValue = Number(editValue.value);
    } else if (valueType.value === "boolean") {
      newValue = editValue.value === "true";
    } else if (valueType.value === "null") {
      newValue = null;
    } else {
      newValue = editValue.value;
    }

    emit("update", currentPath.value, newValue);
    isEditing.value = false;
  } catch (e) {
    console.error("Invalid value", e);
  }
}

function deleteItem() {
  emit("delete", currentPath.value);
}

function addChild() {
  const key =
    valueType.value === "array" ? String(props.value.length) : "newKey";
  emit("add", currentPath.value, key, "");
}

function handleChildUpdate(path: string[], value: any) {
  emit("update", path, value);
}

function handleChildDelete(path: string[]) {
  emit("delete", path);
}

function handleChildAdd(path: string[], key: string, value: any) {
  emit("add", path, key, value);
}
</script>

<template>
  <div
    data-slot="object-composer-item"
    :class="
      cn('rounded-md mb-1', { border: depth === 0, 'border-border': depth > 0 })
    "
  >
    <div class="flex items-center py-1 item-header">
      <Button
        v-if="isExpandable"
        variant="ghost"
        size="icon"
        class="expand-button"
        @click="toggleExpand"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          :class="{ 'rotate-90': isExpanded }"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Button>
      <div v-else class="expand-spacer" />

      <div v-if="!isEditing" class="item-content">
        <span class="item-key">{{ itemKey }}</span>
        <span class="item-separator">:</span>
        <span class="item-value" :class="`type-${valueType}`">
          {{ displayValue }}
        </span>
      </div>

      <div v-else class="item-edit">
        <Input
          v-model="editKey"
          class="edit-key"
          type="text"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
        />
        <span class="item-separator">:</span>
        <Input
          v-model="editValue"
          class="edit-value"
          type="text"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
        />
      </div>

      <div class="item-actions">
        <Button
          v-if="!isEditing"
          class="action-button"
          title="Éditer"
          @click="startEdit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </Button>

        <template v-else>
          <Button
            class="action-button save"
            title="Sauvegarder"
            @click="saveEdit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </Button>
          <Button
            class="action-button cancel"
            title="Annuler"
            @click="cancelEdit"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        </template>

        <Button
          v-if="isExpandable && !isEditing"
          class="action-button"
          title="Ajouter un enfant"
          @click="addChild"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Button>

        <Button
          v-if="!isEditing"
          class="action-button delete"
          title="Supprimer"
          @click="deleteItem"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
          </svg>
        </Button>
      </div>
    </div>

    <div v-if="isExpandable && isExpanded" class="border-l border-white ml-5">
      <ObjectComposerItem
        v-for="[key, val] in childEntries"
        :key="key"
        :item-key="key"
        :value="val"
        :depth="depth + 1"
        :path="currentPath"
        @update="handleChildUpdate"
        @delete="handleChildDelete"
        @add="handleChildAdd"
      />
    </div>
  </div>
</template>

<style scoped>
.item-header {
  transition: background-color 0.15s ease;
}

.item-header:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.expand-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: transform 0.2s ease;
}

.expand-button:hover {
  color: #000;
}

.expand-button svg {
  transition: transform 0.2s ease;
}

.expand-button svg.rotate-90 {
  transform: rotate(90deg);
}

.expand-spacer {
  width: 20px;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.item-separator {
  color: #666;
}

.item-value {
  color: #1c01ce;
}

.item-value.type-string {
  color: #c41a16;
}

.item-value.type-number {
  color: #1c00cf;
}

.item-value.type-boolean {
  color: #0f68a0;
}

.item-value.type-null {
  color: #808080;
}

.item-value.type-object,
.item-value.type-array {
  color: #666;
  font-style: italic;
}

.item-edit {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.edit-key,
.edit-value {
  padding: 2px 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: inherit;
  font-size: inherit;
}

.edit-key {
  flex: 0 0 auto;
  min-width: 100px;
}

.edit-value {
  flex: 1;
  min-width: 150px;
}

.edit-key:focus,
.edit-value:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.1);
}

.item-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.item-header:hover .item-actions {
  opacity: 1;
}

.action-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  border-radius: 3px;
  transition: all 0.15s ease;
}

.action-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #000;
}

.action-button.save:hover {
  background-color: rgba(0, 128, 0, 0.1);
  color: #008000;
}

.action-button.cancel:hover {
  background-color: rgba(128, 128, 128, 0.1);
  color: #666;
}

.action-button.delete:hover {
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}

.children-container {
  margin-left: 8px;
  padding-left: 16px;
  border-left: 1px solid white;
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

```vue [src/components/ui/object-composer/ObjectComposer_copy.vue]
<script setup lang="ts">
import { computed } from "vue";
import { ObjectComposerItem } from ".";
import { Button } from "@/components/ui/button";

interface ObjectComposerProps {
  title?: string;
  readonly?: boolean;
}

withDefaults(defineProps<ObjectComposerProps>(), {
  title: "JSON Editor",
  readonly: false,
});

const model = defineModel<Record<string, any> | any[]>({ required: true });

const rootEntries = computed(() => {
  if (Array.isArray(model.value)) {
    return model.value.map((item, index) => [String(index), item]);
  }
  return Object.entries(model.value);
});

const handleUpdate = (path: string[], value: any) => {
  const newData = JSON.parse(JSON.stringify(model.value));

  let current: any = newData;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current = current[key as keyof typeof current];
  }

  const lastKey = path[path.length - 1];
  current[lastKey as keyof typeof current] = value;

  model.value = newData;
};

const handleDelete = (path: string[]) => {
  const newData = JSON.parse(JSON.stringify(model.value));

  let current: any = newData;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current = current[key as keyof typeof current];
  }

  const lastKey = path[path.length - 1];
  if (Array.isArray(current)) {
    current.splice(Number(lastKey), 1);
  } else {
    delete current[lastKey as keyof typeof current];
  }

  model.value = newData;
};

const handleAdd = (path: string[], key: string, value: any) => {
  const newData = JSON.parse(JSON.stringify(model.value));

  let current: any = newData;
  for (const k of path) {
    current = current[k];
  }

  if (Array.isArray(current)) {
    current.push(value);
  } else {
    current[key] = value;
  }

  model.value = newData;
};

const addRootItem = () => {
  const newData = JSON.parse(JSON.stringify(model.value));

  if (Array.isArray(newData)) {
    newData.push("");
  } else {
    let counter = 1;
    let newKey = "newKey";
    while (newKey in newData) {
      newKey = `newKey${counter}`;
      counter++;
    }
    newData[newKey] = "";
  }

  model.value = newData;
};

const copyToClipboard = () => {
  const jsonString = JSON.stringify(model.value, null, 2);
  navigator.clipboard.writeText(jsonString);
};

const downloadJSON = () => {
  const jsonString = JSON.stringify(model.value, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json";
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="object-composer">
    <div class="composer-header">
      <h3 class="composer-title">{{ title }}</h3>
      <div class="composer-actions">
        <Button
          v-if="!readonly"
          class="header-Button"
          title="Ajouter un élément racine"
          @click="addRootItem"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Ajouter
        </Button>

        <Button
          class="header-Button"
          title="Copier dans le presse-papier"
          @click="copyToClipboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copier
        </Button>

        <Button
          class="header-Button"
          title="Télécharger en JSON"
          @click="downloadJSON"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger
        </Button>
      </div>
    </div>

    <div class="text-sm p-4 bg-card mb-2">
      <ObjectComposerItem
        v-for="[key, value] in rootEntries"
        :key="key"
        :item-key="key"
        :value="value"
        :depth="0"
        :path="[]"
        @update="handleUpdate"
        @delete="handleDelete"
        @add="handleAdd"
      />
    </div>
  </div>
</template>

<style scoped>
.object-composer {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.composer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.composer-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.composer-actions {
  display: flex;
  gap: 8px;
}

.header-Button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-Button:hover {
  border-color: #b0b0b0;
}

.header-Button:active {
  transform: translateY(1px);
}
</style>
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
  checkIn: (id: string | number, data: T, meta?: Record<string, any>) => void;
  checkOut: (id: string | number) => void;
  get: (id: string | number) => CheckInItem<T> | undefined;
  getAll: (options?: {
    sortBy?: keyof T | "timestamp";
    order?: "asc" | "desc";
  }) => CheckInItem<T>[];
  update: (id: string | number, data: Partial<T>) => void;
  has: (id: string | number) => boolean;
  clear: () => void;
  checkInMany: (
    items: Array<{ id: string | number; data: T; meta?: Record<string, any> }>,
  ) => void;
  checkOutMany: (ids: Array<string | number>) => void;
  updateMany: (
    updates: Array<{ id: string | number; data: Partial<T> }>,
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

    const checkIn = (
      id: string | number,
      data: T,
      meta?: Record<string, any>,
    ) => {
      debug("checkIn", { id, data, meta });

      if (options?.onBeforeCheckIn) {
        const result = options.onBeforeCheckIn(id, data);
        if (result === false) {
          debug("checkIn cancelled by onBeforeCheckIn", id);
          return;
        }
      }

      registry.value.set(id, {
        id,
        data: data as any,
        timestamp: Date.now(),
        meta,
      });
      triggerRef(registry);

      options?.onCheckIn?.(id, data);
    };

    const checkOut = (id: string | number) => {
      debug("checkOut", id);

      const existed = registry.value.has(id);
      if (!existed) return;

      if (options?.onBeforeCheckOut) {
        const result = options.onBeforeCheckOut(id);
        if (result === false) {
          debug("checkOut cancelled by onBeforeCheckOut", id);
          return;
        }
      }

      registry.value.delete(id);
      triggerRef(registry);

      options?.onCheckOut?.(id);
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

    const update = (id: string | number, data: Partial<T>) => {
      const existing = registry.value.get(id);
      if (
        existing &&
        typeof existing.data === "object" &&
        typeof data === "object"
      ) {
        checkIn(id, { ...existing.data, ...data } as T, existing.meta);
      }
    };

    const has = (id: string | number) => registry.value.has(id);

    const clear = () => {
      debug("clear");
      registry.value.clear();
      triggerRef(registry);
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
    };
  };

  const openDesk = (options?: CheckInDeskOptions<T, TContext>) => {
    const DeskInjectionKey = Symbol("CheckInDesk") as InjectionKey<
      CheckInDesk<T, TContext> & TContext
    >;
    const deskContext = createDeskContext<T, TContext>(options);

    const fullContext = {
      ...deskContext,
      ...(options?.context || {}),
    } as CheckInDesk<T, TContext> & TContext;

    provide(DeskInjectionKey, fullContext);

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

    const performCheckIn = async () => {
      if (isCheckedIn.value) return;

      const data = await getCurrentData();
      desk!.checkIn(itemId, data, checkInOptions?.meta);
      isCheckedIn.value = true;

      debug(`[useCheckIn] Checked in: ${itemId}`, data);
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

  const generateId = (prefix = "passenger"): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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
    openDesk,
    checkIn,
    generateId,
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
  }` | `any` | — |

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

## ObjectComposerItemCopy
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

  ### Child Components

  `Button`{.primary .text-primary}

  `Input`{.primary .text-primary}

  `ObjectComposerItem`{.primary .text-primary}

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

## ObjectComposerCopy
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `title`{.primary .text-primary} | `string` | JSON Editor |  |
| `readonly`{.primary .text-primary} | `boolean` | false |  |

  ### Child Components

  `Button`{.primary .text-primary}

  `ObjectComposerItem`{.primary .text-primary}

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
import CustomObjectComposerField from "./CustomObjectComposerField.vue";

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
              v-slot="{
                itemKey,
                displayValue,
                typeColor,
                badgeVariant,
                itemDesk,
              }"
            >
              <div
                class="flex items-center gap-2 p-2 rounded hover:bg-accent/50 transition-colors"
              >
                <div :class="cn('w-2 h-2 rounded-full', typeColor)" />

                <span class="font-mono text-xs text-muted-foreground min-w-24">
                  {{ itemKey }}
                </span>

                <Badge :variant="badgeVariant" class="font-mono text-xs">
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
              v-slot="{
                itemKey,
                displayValue,
                typeColor,
                badgeVariant,
                itemDesk,
              }"
            >
              <div
                class="flex items-center gap-2 p-2 rounded hover:bg-accent/50 transition-colors"
              >
                <div :class="cn('w-2 h-2 rounded-full', typeColor)" />

                <span class="font-mono text-xs text-muted-foreground min-w-24">
                  {{ itemKey }}
                </span>

                <Badge :variant="badgeVariant" class="font-mono text-xs">
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