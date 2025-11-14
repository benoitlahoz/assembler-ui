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
  <div class="demo-container">
    <div class="demo-section">
      <ObjectComposer v-model="userData" title="Données Utilisateur">
        <ObjectComposerHeader>
          <ObjectComposerTitle>User Data (Default)</ObjectComposerTitle>
          <ObjectComposerDescription>
            Edit this user data with ease using the intuitive Object Composer.
          </ObjectComposerDescription>
        </ObjectComposerHeader>
        <Separator class="my-4" />
        <ObjectComposerItem
          v-for="(value, key) in userData"
          :key="key"
          :itemKey="key"
          :value="value"
        />
      </ObjectComposer>
    </div>

    <div class="demo-section">
      <h2 class="demo-title">Rendu Personnalisé</h2>
      <p class="demo-description">
        Utilisez un slot pour personnaliser l'affichage de chaque élément.
        L'arborescence fonctionne automatiquement.
      </p>
      <ObjectComposer v-model="userData" title="Données Utilisateur">
        <ObjectComposerHeader>
          <ObjectComposerTitle>User Data (Custom)</ObjectComposerTitle>
          <ObjectComposerDescription>
            Custom rendering with slot - tree navigation still works!
          </ObjectComposerDescription>
        </ObjectComposerHeader>
        <Separator class="my-4" />
        <ObjectComposerItem
          v-for="(value, key) in userData"
          :key="key"
          :itemKey="key"
          :value="value"
        >
          <template
            #default="{ itemKey, value, valueType, displayValue, isExpandable }"
          >
            <div class="custom-item">
              <span class="custom-key">{{ itemKey }}</span>
              <span class="custom-separator">→</span>
              <span class="custom-value" :class="`custom-type-${valueType}`">
                {{ isExpandable ? `${displayValue} items` : displayValue }}
              </span>
              <span v-if="valueType === 'string'" class="custom-badge"
                >text</span
              >
              <span v-else-if="valueType === 'number'" class="custom-badge"
                >num</span
              >
              <span v-else-if="valueType === 'boolean'" class="custom-badge"
                >bool</span
              >
              <span v-else-if="valueType === 'array'" class="custom-badge"
                >array</span
              >
              <span v-else-if="valueType === 'object'" class="custom-badge"
                >object</span
              >
            </div>
          </template>
        </ObjectComposerItem>
      </ObjectComposer>
    </div>

    <div class="demo-section">
      <h2 class="demo-title">Mode Lecture Seule</h2>
      <p class="demo-description">
        Cet éditeur est en mode lecture seule. Les modifications ne sont pas
        autorisées.
      </p>
      <ObjectComposer
        v-model="readonlyData"
        title="Configuration Système"
        :readonly="true"
      >
        <ObjectComposerItem
          v-for="(value, key) in readonlyData"
          :key="key"
          :itemKey="key"
          :value="value"
        />
      </ObjectComposer>
    </div>

    <div class="demo-section">
      <h2 class="demo-title">Données JSON</h2>
      <p class="demo-description">
        Voici le contenu JSON actuel de l'éditeur :
      </p>
      <pre class="json-output">{{ JSON.stringify(userData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

.demo-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.demo-description {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

.json-output {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 13px;
  line-height: 1.6;
  color: white;
  overflow-x: auto;
  margin: 0;
}

.json-output::-webkit-scrollbar {
  height: 8px;
}

.json-output::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.json-output::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.json-output::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.custom-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-key {
  font-weight: 600;
  color: #2563eb;
}

.custom-separator {
  color: #94a3b8;
  font-weight: 500;
}

.custom-value {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 13px;
}

.custom-value.custom-type-string {
  color: #059669;
}

.custom-value.custom-type-number {
  color: #dc2626;
}

.custom-value.custom-type-boolean {
  color: #7c3aed;
}

.custom-value.custom-type-null {
  color: #64748b;
  font-style: italic;
}

.custom-value.custom-type-object,
.custom-value.custom-type-array {
  color: #ea580c;
  font-weight: 500;
}

.custom-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #e2e8f0;
  color: #475569;
}
</style>
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
```

```vue [src/components/ui/object-composer/ObjectComposer.vue]
<script setup lang="ts">
import { computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { ObjectComposerItem } from ".";
import { Button } from "@/components/ui/button";

interface ObjectComposerProps {
  title?: string;
  readonly?: boolean;
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<ObjectComposerProps>(), {
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
  <div
    data-slot="object-composer"
    :class="cn('flex flex-col text-sm', props.class)"
  >
    <slot />
  </div>
</template>
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

```vue [src/components/ui/object-composer/ObjectComposerHeader.vue]
<script setup lang="ts"></script>

<template><slot /></template>
```

```vue [src/components/ui/object-composer/ObjectComposerItem.vue]
<script setup lang="ts">
import { ref, computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronRight } from "lucide-vue-next";

interface ObjectComposerItemProps {
  itemKey: string;
  value: any;
  depth?: number;
  path?: string[];
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
});

const emit = defineEmits<{
  update: [path: string[], value: any];
  delete: [path: string[]];
  add: [path: string[], key: string, value: any];
}>();

defineSlots<{
  default(props: SlotProps): any;
}>();

const accordionValue = ref<string>("item-1");
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
      return "";
    case "array":
      return "";
    default:
      return String(props.value);
  }
});

function toggleExpand() {}

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
    v-if="!isExpandable"
    data-slot="object-composer-item"
    :class="cn(props.class)"
  >
    <div class="flex items-center">
      <div class="expand-spacer" />

      <div class="item-content">
        <slot
          :item-key="itemKey"
          :value="value"
          :value-type="valueType"
          :display-value="displayValue"
          :is-expandable="isExpandable"
          :is-editing="isEditing"
          :edit-key="editKey"
          :edit-value="editValue"
        >
          <div v-if="!isEditing" class="default-item-content">
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
        </slot>
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
  </div>

  <Accordion v-else v-model="accordionValue" type="single" collapsible>
    <AccordionItem value="item-1" class="border-b-0">
      <div class="flex items-center">
        <AccordionTrigger class="flex-none hover:no-underline py-1! px-2">
          <template #icon>
            <ChevronRight class="transition-transform duration-200 w-4 h-4" />
          </template>
        </AccordionTrigger>

        <div class="item-content flex-1">
          <slot
            :item-key="itemKey"
            :value="value"
            :value-type="valueType"
            :display-value="displayValue"
            :is-expandable="isExpandable"
            :is-editing="isEditing"
            :edit-key="editKey"
            :edit-value="editValue"
          >
            <div v-if="!isEditing" class="default-item-content">
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
          </slot>
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
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              />
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
            v-if="!isEditing"
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

      <AccordionContent class="-pb-2!">
        <div class="border-l border-border ml-4">
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
          >
            <template v-if="$slots.default" #default="childSlotProps">
              <slot v-bind="childSlotProps" />
            </template>
          </ObjectComposerItem>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
</template>

<style scoped>
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

.default-item-content {
  display: flex;
  align-items: center;
  gap: 6px;
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
:::

## ObjectComposer
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `title`{.primary .text-primary} | `string` | JSON Editor |  |
| `readonly`{.primary .text-primary} | `boolean` | false |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

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
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Child Components

  `Input`{.primary .text-primary}

  `Button`{.primary .text-primary}

  `Accordion`{.primary .text-primary}

  `AccordionItem`{.primary .text-primary}

  `AccordionTrigger`{.primary .text-primary}

  `ChevronRight`{.primary .text-primary}

  `AccordionContent`{.primary .text-primary}

  `ObjectComposerItem`{.primary .text-primary}

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

::tip
You can copy and adapt this template for any component documentation.
::