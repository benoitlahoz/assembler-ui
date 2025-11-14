<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import ObjectComposerItem from './ObjectComposerItem.vue';

interface Props {
  modelValue: Record<string, any> | any[];
  title?: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'JSON Editor',
  readonly: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any> | any[]];
}>();

const internalData = ref<Record<string, any> | any[]>(JSON.parse(JSON.stringify(props.modelValue)));

watch(
  () => props.modelValue,
  (newValue) => {
    internalData.value = JSON.parse(JSON.stringify(newValue));
  },
  { deep: true }
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

  // Navigate to the parent of the target
  let current: any = newData;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current = current[key as keyof typeof current];
  }

  // Update the value
  const lastKey = path[path.length - 1];
  current[lastKey as keyof typeof current] = value;

  internalData.value = newData;
  emit('update:modelValue', newData);
}

function handleDelete(path: string[]) {
  if (props.readonly) return;

  const newData = JSON.parse(JSON.stringify(internalData.value));

  // Navigate to the parent of the target
  let current: any = newData;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current = current[key as keyof typeof current];
  }

  // Delete the item
  const lastKey = path[path.length - 1];
  if (Array.isArray(current)) {
    current.splice(Number(lastKey), 1);
  } else {
    delete current[lastKey as keyof typeof current];
  }

  internalData.value = newData;
  emit('update:modelValue', newData);
}

function handleAdd(path: string[], key: string, value: any) {
  if (props.readonly) return;

  const newData = JSON.parse(JSON.stringify(internalData.value));

  // Navigate to the target
  let current: any = newData;
  for (const k of path) {
    current = current[k];
  }

  // Add the new item
  if (Array.isArray(current)) {
    current.push(value);
  } else {
    current[key] = value;
  }

  internalData.value = newData;
  emit('update:modelValue', newData);
}

function addRootItem() {
  if (props.readonly) return;

  const newData = JSON.parse(JSON.stringify(internalData.value));

  if (Array.isArray(newData)) {
    newData.push('');
  } else {
    let counter = 1;
    let newKey = 'newKey';
    while (newKey in newData) {
      newKey = `newKey${counter}`;
      counter++;
    }
    newData[newKey] = '';
  }

  internalData.value = newData;
  emit('update:modelValue', newData);
}

function copyToClipboard() {
  const jsonString = JSON.stringify(internalData.value, null, 2);
  navigator.clipboard.writeText(jsonString);
}

function downloadJSON() {
  const jsonString = JSON.stringify(internalData.value, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
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

        <button class="header-button" title="Copier dans le presse-papier" @click="copyToClipboard">
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

        <button class="header-button" title="Télécharger en JSON" @click="downloadJSON">
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
