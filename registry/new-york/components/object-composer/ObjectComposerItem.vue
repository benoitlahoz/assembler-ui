<script setup lang="ts">
import {
  ref,
  computed,
  inject,
  provide,
  type HTMLAttributes,
  type InjectionKey,
  onMounted,
} from 'vue';
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
import {
  useCheckIn,
  type CheckInDesk,
} from '~~/registry/new-york/composables/use-check-in/useCheckIn';
import ObjectComposerField from './ObjectComposerField.vue';

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
});

const slots = defineSlots<{
  field?: () => any;
  default?: (props: SlotProps) => any;
}>();

// Inject desk from parent ObjectComposer
const composerDesk = inject<{
  deskSymbol: InjectionKey<CheckInDesk<ComposerItemData>>;
  model: any;
}>('objectComposerDesk')!;

if (!composerDesk) {
  throw new Error('ObjectComposerItem must be used within ObjectComposer');
}

// Si pas de props, on itère sur le model
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

// Register this item with the desk (only if we have itemKey)
const deskResult = props.itemKey
  ? checkIn(composerDesk.deskSymbol, {
      autoCheckIn: true,
      id: currentPath.value.join('.'),
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

// Access context from desk
const editingPath = desk ? (desk as any).editingPath : ref(null);
const updateValueInDesk = desk ? (desk as any).updateValue : () => {};
const deleteValueInDesk = desk ? (desk as any).deleteValue : () => {};
const addValueInDesk = desk ? (desk as any).addValue : () => {};
const startEditInDesk = desk ? (desk as any).startEdit : () => {};
const cancelEditInDesk = desk ? (desk as any).cancelEdit : () => {};

// Provide context to ObjectComposerField (useCheckIn pattern - no props!)
if (desk) {
  provide('objectComposerItemContext', {
    desk,
    itemKey: computed(() => props.itemKey),
    value: computed(() => props.value),
    valueType: computed(() => valueType.value),
    displayValue: computed(() => displayValue.value),
    isExpandable: computed(() => isExpandable.value),
    isEditing: computed(() => isEditing.value),
  });
}

const accordionValue = ref<string>('item-1');
const editKey = ref(props.itemKey || '');
const editValue = ref<string>('');

// Check if this item is currently being edited
const isEditing = computed(() => {
  if (!editingPath.value) return false;
  if (editingPath.value.length !== currentPath.value.length) return false;
  return editingPath.value.every((key: string, i: number) => key === currentPath.value[i]);
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

function handleStartEdit() {
  if (!props.itemKey) return;
  editKey.value = props.itemKey;
  editValue.value = valueType.value === 'string' ? props.value : JSON.stringify(props.value);
  startEditInDesk(currentPath.value);
}

function handleCancelEdit() {
  if (!props.itemKey) return;
  editKey.value = props.itemKey;
  cancelEditInDesk();
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

    updateValueInDesk(currentPath.value, newValue);
    cancelEditInDesk();
  } catch (e) {
    console.error('Invalid value', e);
  }
}

function deleteItem() {
  deleteValueInDesk(currentPath.value);
}

function addChild() {
  const key = valueType.value === 'array' ? String(props.value.length) : 'newKey';
  addValueInDesk(currentPath.value, key, '');
}
</script>

<template>
  <!-- Mode: Auto-iterate over model (no props) -->
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

  <!-- Mode: Single item (with props) -->
  <div
    v-else-if="!isExpandable"
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

      <!-- Slot for field customization (asChild pattern) -->
      <div class="flex-1">
        <slot name="field">
          <ObjectComposerField />
        </slot>
      </div>

      <!-- Actions -->
      <div class="flex ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" title="Éditer" @click="handleStartEdit">
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
          @keyup.esc="handleCancelEdit"
        />
        <span class="text-muted-foreground">:</span>
      </template>
      <Input
        v-model="editValue"
        class="flex-1"
        placeholder="Valeur"
        type="text"
        @keyup.enter="saveEdit"
        @keyup.esc="handleCancelEdit"
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
        <Button variant="ghost" size="icon" title="Annuler" @click="handleCancelEdit">
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

        <!-- Slot for field customization (asChild pattern) -->
        <div class="flex-1">
          <slot name="field">
            <ObjectComposerField />
          </slot>
        </div>

        <!-- Actions -->
        <div class="flex ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            v-if="!isInArray"
            variant="ghost"
            size="icon"
            title="Éditer"
            @click="handleStartEdit"
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
          @keyup.esc="handleCancelEdit"
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
          <Button variant="ghost" size="icon" title="Annuler" @click="handleCancelEdit">
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
          >
            <!-- Propagate custom slot to children -->
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
