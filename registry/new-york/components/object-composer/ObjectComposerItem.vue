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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronRight } from 'lucide-vue-next';
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
  ? checkIn('objectComposerDesk', {
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

// Access context from desk with fallbacks for auto-iterate mode
const editingPath = desk ? (desk as any).editingPath : ref(null);
const updateValueInDesk = desk
  ? (desk as any).updateValue
  : () => console.warn('No desk available');
const deleteValueInDesk = desk
  ? (desk as any).deleteValue
  : () => console.warn('No desk available');
const addValueInDesk = desk ? (desk as any).addValue : () => console.warn('No desk available');
const updateKeyInDesk = desk ? (desk as any).updateKey : () => console.warn('No desk available');
const startEditInDesk = desk ? (desk as any).startEdit : () => console.warn('No desk available');
const cancelEditInDesk = desk ? (desk as any).cancelEdit : () => console.warn('No desk available');

// Always provide context to ObjectComposerField (even without desk for auto-iterate mode)
provide('objectComposerItemContext', {
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

const accordionValue = ref<string>('item-1');

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
  startEditInDesk(currentPath.value);
}

function handleCancelEdit() {
  if (!props.itemKey) return;
  cancelEditInDesk();
}

function saveEdit(newKey: string, newValueStr: string) {
  let newValue: any;

  try {
    // Try to parse as JSON for complex types
    if (valueType.value === 'object' || valueType.value === 'array') {
      newValue = JSON.parse(newValueStr);
    } else if (valueType.value === 'number') {
      newValue = Number(newValueStr);
      if (isNaN(newValue)) {
        throw new Error('Valeur numérique invalide');
      }
    } else if (valueType.value === 'boolean') {
      newValue = newValueStr === 'true';
    } else if (valueType.value === 'null') {
      newValue = null;
    } else {
      newValue = newValueStr;
    }

    // Update the value
    updateValueInDesk(currentPath.value, newValue);

    // Update key if changed and not in array
    if (newKey !== props.itemKey && !props.isInArray && newKey.trim() !== '') {
      updateKeyInDesk(currentPath.value, newKey);
    }

    cancelEditInDesk();
  } catch (e) {
    console.error('Invalid value:', e);
    // Error is shown to user through failed save (edit mode remains active)
    alert(`Erreur de sauvegarde: ${e instanceof Error ? e.message : 'Valeur invalide'}`);
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
        'select-none',
        !isEditing && 'hover:bg-accent border-l border-border relative',
        props.class
      )
    "
  >
    <div class="flex items-center w-full">
      <div class="w-8" />

      <!-- Slot for field customization (asChild pattern) -->
      <div class="flex-1">
        <slot name="field">
          <ObjectComposerField />
        </slot>
      </div>
    </div>
  </div>

  <!-- Accordion pour les éléments expandables -->
  <Accordion v-else v-model="accordionValue" type="single" collapsible :class="cn()">
    <AccordionItem value="item-1" class="border-b-0">
      <div class="flex items-center w-full hover:bg-accent select-none">
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
