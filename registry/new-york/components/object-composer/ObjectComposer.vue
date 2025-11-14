<script setup lang="ts">
import { computed, ref, type HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { ObjectComposerItem } from '.';
import { Button } from '@/components/ui/button';

interface ObjectComposerProps {
  title?: string;
  readonly?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ObjectComposerProps>(), {
  title: 'JSON Editor',
  readonly: false,
});

const model = defineModel<Record<string, any> | any[]>({ required: true });

// Chemin de l'élément en cours d'édition (null si aucun)
const editingPath = ref<string[] | null>(null);

const rootEntries = computed(() => {
  if (Array.isArray(model.value)) {
    return model.value.map((item, index) => [String(index), item]);
  }
  return Object.entries(model.value);
});

const startEdit = (path: string[]) => {
  editingPath.value = path;
};

const cancelEdit = () => {
  editingPath.value = null;
};

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
  editingPath.value = null; // Fermer l'édition après la mise à jour
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
  <div data-slot="object-composer" :class="cn('flex flex-col text-sm', props.class)">
    <slot />
    <ObjectComposerItem
      v-for="[key, val] in rootEntries"
      :key="key"
      :item-key="key"
      :value="val"
      :depth="0"
      :path="[]"
      :is-in-array="Array.isArray(model)"
      :editing-path="editingPath"
      @update="handleUpdate"
      @delete="handleDelete"
      @add="handleAdd"
      @start-edit="startEdit"
      @cancel-edit="cancelEdit"
    />
  </div>
</template>
