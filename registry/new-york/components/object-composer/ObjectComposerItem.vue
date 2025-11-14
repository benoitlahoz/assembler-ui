<script setup lang="ts">
import { ref, computed } from 'vue';

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
const editValue = ref<string>('');

const currentPath = computed(() => [...props.path, props.itemKey]);

const valueType = computed(() => {
  if (props.value === null) return 'null';
  if (Array.isArray(props.value)) return 'array';
  return typeof props.value;
});

const isExpandable = computed(() => {
  return valueType.value === 'object' || valueType.value === 'array';
});

const childEntries = computed(() => {
  if (valueType.value === 'object') {
    return Object.entries(props.value);
  }
  if (valueType.value === 'array') {
    return props.value.map((item: any, index: number) => [String(index), item]);
  }
  return [];
});

const displayValue = computed(() => {
  switch (valueType.value) {
    case 'string':
      return `"${props.value}"`;
    case 'number':
    case 'boolean':
      return String(props.value);
    case 'null':
      return 'null';
    case 'object':
      return `{ ${Object.keys(props.value).length} }`;
    case 'array':
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
  editValue.value = valueType.value === 'string' ? props.value : JSON.stringify(props.value);
}

function cancelEdit() {
  isEditing.value = false;
  editKey.value = props.itemKey;
}

function saveEdit() {
  let newValue: any;

  try {
    // Try to parse as JSON for complex types
    if (valueType.value === 'object' || valueType.value === 'array') {
      newValue = JSON.parse(editValue.value);
    } else if (valueType.value === 'number') {
      newValue = Number(editValue.value);
    } else if (valueType.value === 'boolean') {
      newValue = editValue.value === 'true';
    } else if (valueType.value === 'null') {
      newValue = null;
    } else {
      newValue = editValue.value;
    }

    emit('update', currentPath.value, newValue);
    isEditing.value = false;
  } catch (e) {
    console.error('Invalid value', e);
  }
}

function deleteItem() {
  emit('delete', currentPath.value);
}

function addChild() {
  const key = valueType.value === 'array' ? String(props.value.length) : 'newKey';
  emit('add', currentPath.value, key, '');
}

function handleChildUpdate(path: string[], value: any) {
  emit('update', path, value);
}

function handleChildDelete(path: string[]) {
  emit('delete', path);
}

function handleChildAdd(path: string[], key: string, value: any) {
  emit('add', path, key, value);
}
</script>

<template>
  <div class="object-composer-item" :style="{ paddingLeft: `${depth * 20}px` }">
    <div class="item-header">
      <!-- Expand/Collapse Icon -->
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

      <!-- Key/Value Display -->
      <div v-if="!isEditing" class="item-content">
        <span class="item-key">{{ itemKey }}</span>
        <span class="item-separator">:</span>
        <span class="item-value" :class="`type-${valueType}`">
          {{ displayValue }}
        </span>
      </div>

      <!-- Edit Mode -->
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

      <!-- Actions -->
      <div class="item-actions">
        <button v-if="!isEditing" class="action-button" title="Éditer" @click="startEdit">
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
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        <template v-else>
          <button class="action-button save" title="Sauvegarder" @click="saveEdit">
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
          <button class="action-button cancel" title="Annuler" @click="cancelEdit">
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

    <!-- Children -->
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
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
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
