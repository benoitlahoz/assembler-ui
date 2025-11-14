<script setup lang="ts">
import { ref, computed, type HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronRight } from 'lucide-vue-next';

interface ObjectComposerItemProps {
  itemKey: string;
  value: any;
  depth?: number;
  path?: string[];
  class?: HTMLAttributes['class'];
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

const accordionValue = ref<string>('item-1');
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
      return '';
    case 'array':
      return '';
    default:
      return String(props.value);
  }
});

function toggleExpand() {
  // Géré par l'accordion
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
  <div
    v-if="!isExpandable"
    data-slot="object-composer-item"
    :class="cn('select-none hover:bg-accent', props.class)"
  >
    <div class="flex items-center">
      <div class="w-8" />

      <!-- Slot pour contenu personnalisé -->
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
          <!-- Rendu par défaut si aucun slot n'est fourni -->
          <div v-if="!isEditing" class="default-item-content">
            <span class="item-key">{{ itemKey }}</span>
            <span class="item-separator">:</span>
            <span class="item-value" :class="`type-${valueType}`">
              {{ displayValue }}
            </span>
          </div>

          <!-- Edit Mode par défaut -->
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

      <!-- Actions -->
      <div class="item-actions">
        <Button v-if="!isEditing" class="action-button" title="Éditer" @click="startEdit">
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
        </Button>

        <template v-else>
          <Button class="action-button save" title="Sauvegarder" @click="saveEdit">
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
          <Button class="action-button cancel" title="Annuler" @click="cancelEdit">
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

  <!-- Accordion pour les éléments expandables -->
  <Accordion v-else v-model="accordionValue" type="single" collapsible>
    <AccordionItem value="item-1" class="border-b-0">
      <div class="flex items-center hover:bg-accent select-none">
        <AccordionTrigger class="flex-none hover:no-underline select-none py-1! px-2">
          <template #icon>
            <ChevronRight class="transition-transform duration-200 w-4 h-4 text-muted-foreground" />
          </template>
        </AccordionTrigger>

        <!-- Slot pour contenu personnalisé -->
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
            <!-- Rendu par défaut si aucun slot n'est fourni -->
            <div v-if="!isEditing" class="default-item-content">
              <span class="item-key">{{ itemKey }}</span>
              <span class="text-muted-foreground">:</span>
              <span class="item-value" :class="`type-${valueType}`">
                {{ displayValue }}
              </span>
            </div>

            <!-- Edit Mode par défaut -->
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

        <!-- Actions -->
        <div class="item-actions">
          <Button v-if="!isEditing" class="action-button" title="Éditer" @click="startEdit">
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
          </Button>

          <template v-else>
            <Button class="action-button save" title="Sauvegarder" @click="saveEdit">
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
            <Button class="action-button cancel" title="Annuler" @click="cancelEdit">
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

      <AccordionContent class="pb-0!">
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
            <!-- Propagation du slot personnalisé aux enfants -->
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
