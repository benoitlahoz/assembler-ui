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
import { ChevronRight, Trash } from 'lucide-vue-next';

interface ObjectComposerItemProps {
  itemKey: string;
  value: any;
  depth?: number;
  path?: string[];
  isInArray?: boolean;
  editingPath?: string[] | null;
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
  isInArray: false,
  editingPath: null,
});

const emit = defineEmits<{
  update: [path: string[], value: any];
  delete: [path: string[]];
  add: [path: string[], key: string, value: any];
  startEdit: [path: string[]];
  cancelEdit: [];
}>();

defineSlots<{
  default(props: SlotProps): any;
}>();

const accordionValue = ref<string>('item-1');
const editKey = ref(props.itemKey);
const editValue = ref<string>('');

const currentPath = computed(() => [...props.path, props.itemKey]);

// Vérifier si cet élément est en cours d'édition
const isEditing = computed(() => {
  if (!props.editingPath) return false;
  if (props.editingPath.length !== currentPath.value.length) return false;
  return props.editingPath.every((key, i) => key === currentPath.value[i]);
});

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
  editKey.value = props.itemKey;
  editValue.value = valueType.value === 'string' ? props.value : JSON.stringify(props.value);
  emit('startEdit', currentPath.value);
}

function cancelEdit() {
  editKey.value = props.itemKey;
  emit('cancelEdit');
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

function handleChildStartEdit(path: string[]) {
  emit('startEdit', path);
}

function handleChildCancelEdit() {
  emit('cancelEdit');
}
</script>

<template>
  <div
    v-if="!isExpandable"
    data-slot="object-composer-item"
    :class="
      cn(
        'group select-none',
        !isEditing && 'hover:bg-accent border-l border-border relative',
        props.class
      )
    "
  >
    <div v-if="!isEditing" class="flex items-center w-full">
      <div class="w-8" />

      <!-- Slot pour contenu personnalisé -->
      <div class="flex-1">
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
          <div class="flex items-center gap-1.5">
            <span class="font-medium text-foreground">{{ itemKey }}</span>
            <span class="text-muted-foreground">:</span>
            <span
              :class="
                cn({
                  'text-red-600 dark:text-red-400': valueType === 'string',
                  'text-blue-600 dark:text-blue-400': valueType === 'number',
                  'text-purple-600 dark:text-purple-400': valueType === 'boolean',
                  'text-muted-foreground italic': valueType === 'null',
                  'text-muted-foreground italic text-sm':
                    valueType === 'object' || valueType === 'array',
                })
              "
            >
              {{ displayValue }}
            </span>
          </div>
        </slot>
      </div>

      <!-- Actions -->
      <div class="flex ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" title="Éditer" @click="startEdit">
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
        <Button variant="ghost" size="icon" title="Supprimer" @click="deleteItem">
          <Trash class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Edit Mode - Pleine largeur -->
    <div v-else class="flex items-center gap-2 p-3 rounded-md border bg-background w-full ml-0">
      <template v-if="!isInArray">
        <Input
          v-model="editKey"
          class="flex-none w-32"
          placeholder="Clé"
          type="text"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
        />
        <span class="text-muted-foreground">:</span>
      </template>
      <Input
        v-model="editValue"
        class="flex-1"
        placeholder="Valeur"
        type="text"
        @keyup.enter="saveEdit"
        @keyup.esc="cancelEdit"
      />
      <div class="flex ml-auto">
        <Button variant="ghost" size="icon" title="Sauvegarder" @click="saveEdit">
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
        <Button variant="ghost" size="icon" title="Annuler" @click="cancelEdit">
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
  </div>

  <!-- Accordion pour les éléments expandables -->
  <Accordion v-else v-model="accordionValue" type="single" collapsible :class="cn(!isEditing)">
    <AccordionItem value="item-1" class="border-b-0">
      <div v-if="!isEditing" class="group flex items-center w-full hover:bg-accent select-none">
        <AccordionTrigger class="flex-none hover:no-underline select-none py-1! px-2">
          <template #icon>
            <ChevronRight class="transition-transform duration-200 w-4 h-4 text-muted-foreground" />
          </template>
        </AccordionTrigger>

        <!-- Slot pour contenu personnalisé -->
        <div class="flex-1">
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
            <div class="flex items-center gap-1.5">
              <span class="font-medium text-foreground">{{ itemKey }}</span>
              <span class="text-muted-foreground">:</span>
              <span
                :class="
                  cn({
                    'text-red-600 dark:text-red-400': valueType === 'string',
                    'text-blue-600 dark:text-blue-400': valueType === 'number',
                    'text-purple-600 dark:text-purple-400': valueType === 'boolean',
                    'text-muted-foreground italic': valueType === 'null',
                    'text-muted-foreground italic text-sm':
                      valueType === 'object' || valueType === 'array',
                  })
                "
              >
                {{ displayValue }}
              </span>
            </div>
          </slot>
        </div>

        <!-- Actions -->
        <div class="flex ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <Button v-if="!isInArray" variant="ghost" size="icon" title="Éditer" @click="startEdit">
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

          <Button variant="ghost" size="icon" title="Ajouter un enfant" @click="addChild">
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
            variant="ghost"
            size="icon"
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

      <!-- Edit Mode - Pleine largeur pour accordion (clé seulement) -->
      <div
        v-if="!isInArray && isEditing"
        class="flex items-center gap-2 p-3 rounded-md border bg-background w-full"
      >
        <Input
          v-model="editKey"
          class="flex-1"
          placeholder="Clé"
          type="text"
          @keyup.enter="saveEdit"
          @keyup.esc="cancelEdit"
        />
        <div class="flex ml-auto">
          <Button variant="ghost" size="icon" title="Sauvegarder" @click="saveEdit">
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
          <Button variant="ghost" size="icon" title="Annuler" @click="cancelEdit">
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
            :editing-path="editingPath"
            @update="handleChildUpdate"
            @delete="handleChildDelete"
            @add="handleChildAdd"
            @start-edit="handleChildStartEdit"
            @cancel-edit="handleChildCancelEdit"
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
.expand-spacer {
  width: 20px;
}
</style>
