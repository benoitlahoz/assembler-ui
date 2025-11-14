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
import ObjectComposer from "../ObjectComposer.vue";

const sampleData = ref({
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
      <h2 class="demo-title">Éditeur JSON Interactif</h2>
      <p class="demo-description">
        Éditez l'objet JSON ci-dessous. Vous pouvez ajouter, modifier ou
        supprimer des propriétés.
      </p>
      <ObjectComposer v-model="sampleData" title="Données Utilisateur" />
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
      />
    </div>

    <div class="demo-section">
      <h2 class="demo-title">Données JSON</h2>
      <p class="demo-description">
        Voici le contenu JSON actuel de l'éditeur :
      </p>
      <pre class="json-output">{{ JSON.stringify(sampleData, null, 2) }}</pre>
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
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
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
```

```vue [src/components/ui/object-composer/ObjectComposer.vue]
<script setup lang="ts">
import { ref, computed, watch } from "vue";
import ObjectComposerItem from "./ObjectComposerItem.vue";

interface Props {
  modelValue: Record<string, any> | any[];
  title?: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "JSON Editor",
  readonly: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, any> | any[]];
}>();

const internalData = ref<Record<string, any> | any[]>(
  JSON.parse(JSON.stringify(props.modelValue)),
);

watch(
  () => props.modelValue,
  (newValue) => {
    internalData.value = JSON.parse(JSON.stringify(newValue));
  },
  { deep: true },
);

const rootEntries = computed(() => {
  if (Array.isArray(internalData.value)) {
    return internalData.value.map((item, index) => [String(index), item]);
  }
  return Object.entries(internalData.value);
});

function handleUpdate(path: string[], value: any) {
  if (props.readonly) return;

  const newData = JSON.parse(JSON.stringify(internalData.value));

  let current: any = newData;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current = current[key as keyof typeof current];
  }

  const lastKey = path[path.length - 1];
  current[lastKey as keyof typeof current] = value;

  internalData.value = newData;
  emit("update:modelValue", newData);
}

function handleDelete(path: string[]) {
  if (props.readonly) return;

  const newData = JSON.parse(JSON.stringify(internalData.value));

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

  internalData.value = newData;
  emit("update:modelValue", newData);
}

function handleAdd(path: string[], key: string, value: any) {
  if (props.readonly) return;

  const newData = JSON.parse(JSON.stringify(internalData.value));

  let current: any = newData;
  for (const k of path) {
    current = current[k];
  }

  if (Array.isArray(current)) {
    current.push(value);
  } else {
    current[key] = value;
  }

  internalData.value = newData;
  emit("update:modelValue", newData);
}

function addRootItem() {
  if (props.readonly) return;

  const newData = JSON.parse(JSON.stringify(internalData.value));

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

  internalData.value = newData;
  emit("update:modelValue", newData);
}

function copyToClipboard() {
  const jsonString = JSON.stringify(internalData.value, null, 2);
  navigator.clipboard.writeText(jsonString);
}

function downloadJSON() {
  const jsonString = JSON.stringify(internalData.value, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.json";
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="object-composer">
    <div class="composer-header">
      <h3 class="composer-title">{{ title }}</h3>
      <div class="composer-actions">
        <button
          v-if="!readonly"
          class="header-button"
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
        </button>

        <button
          class="header-button"
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
        </button>

        <button
          class="header-button"
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
        </button>
      </div>
    </div>

    <div class="composer-content">
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
  background-color: white;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.composer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background-color: #f8f9fa;
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

.header-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header-button:hover {
  background-color: #f0f0f0;
  border-color: #b0b0b0;
}

.header-button:active {
  transform: translateY(1px);
}

.composer-content {
  padding: 16px 20px;
  max-height: 600px;
  overflow-y: auto;
}

.composer-content::-webkit-scrollbar {
  width: 8px;
}

.composer-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.composer-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.composer-content::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
```

```vue [src/components/ui/object-composer/ObjectComposerItem.vue]
<script setup lang="ts">
import { ref, computed } from "vue";

interface Props {
  itemKey: string;
  value: any;
  depth?: number;
  path?: string[];
}

const props = withDefaults(defineProps<Props>(), {
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
  <div class="object-composer-item" :style="{ paddingLeft: `${depth * 20}px` }">
    <div class="item-header">
      <button v-if="isExpandable" class="expand-button" @click="toggleExpand">
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
      </button>
      <div v-else class="expand-spacer" />

      <div v-if="!isEditing" class="item-content">
        <span class="item-key">{{ itemKey }}</span>
        <span class="item-separator">:</span>
        <span class="item-value" :class="`type-${valueType}`">
          {{ displayValue }}
        </span>
      </div>

      <div v-else class="item-edit">
        <input
          v-model="editKey"
          class="edit-key"
          type="text"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
        />
        <span class="item-separator">:</span>
        <input
          v-model="editValue"
          class="edit-value"
          type="text"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
        />
      </div>

      <div class="item-actions">
        <button
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
        </button>

        <template v-else>
          <button
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
          </button>
          <button
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
          </button>
        </template>

        <button
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
        </button>

        <button
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
        </button>
      </div>
    </div>

    <div v-if="isExpandable && isExpanded" class="item-children">
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
.object-composer-item {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 13px;
  line-height: 1.6;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
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

.item-key {
  color: #881391;
  font-weight: 600;
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
  background-color: white;
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

.item-children {
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  margin-left: 8px;
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
| `modelValue`{.primary .text-primary} | `Record<string, any> \| any[]` | - |  |
| `title`{.primary .text-primary} | `string` | JSON Editor |  |
| `readonly`{.primary .text-primary} | `boolean` | false |  |

  ### Child Components

  `ObjectComposerItem`{.primary .text-primary}

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

  ### Child Components

  `ObjectComposerItem`{.primary .text-primary}

---

::tip
You can copy and adapt this template for any component documentation.
::