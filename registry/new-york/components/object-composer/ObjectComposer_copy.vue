<script setup lang="ts">
import { computed } from 'vue';
import { ObjectComposerItem } from '.';
import { Button } from '@/components/ui/button';

interface ObjectComposerProps {
  title?: string;
  readonly?: boolean;
}

withDefaults(defineProps<ObjectComposerProps>(), {
  title: 'JSON Editor',
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

  // Navigate to the parent of the target
  let current: any = newData;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current = current[key as keyof typeof current];
  }

  // Update the value
  const lastKey = path[path.length - 1];
  current[lastKey as keyof typeof current] = value;

  model.value = newData;
};

const handleDelete = (path: string[]) => {
  const newData = JSON.parse(JSON.stringify(model.value));

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

  model.value = newData;
};

const handleAdd = (path: string[], key: string, value: any) => {
  const newData = JSON.parse(JSON.stringify(model.value));

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

  model.value = newData;
};

const addRootItem = () => {
  const newData = JSON.parse(JSON.stringify(model.value));

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

  model.value = newData;
};

const copyToClipboard = () => {
  const jsonString = JSON.stringify(model.value, null, 2);
  navigator.clipboard.writeText(jsonString);
};

const downloadJSON = () => {
  const jsonString = JSON.stringify(model.value, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'data.json';
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

        <Button class="header-Button" title="Copier dans le presse-papier" @click="copyToClipboard">
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

        <Button class="header-Button" title="Télécharger en JSON" @click="downloadJSON">
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
