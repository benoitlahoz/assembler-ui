<script setup lang="ts">
import { inject, computed, ref, type ComputedRef } from 'vue';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Check, X, Edit, Plus, Trash } from 'lucide-vue-next';
import type { CheckInDesk } from '~~/registry/new-york/composables/use-check-in/useCheckIn';

interface ObjectComposerFieldProps {
  asChild?: boolean;
}

const props = defineProps<ObjectComposerFieldProps>();

// Inject desk from parent ObjectComposerItem (useCheckIn pattern)
const itemContext = inject<{
  desk: CheckInDesk<any>;
  itemKey: ComputedRef<string>;
  value: ComputedRef<any>;
  valueType: ComputedRef<string>;
  displayValue: ComputedRef<string>;
  isExpandable: ComputedRef<boolean>;
  isEditing: ComputedRef<boolean>;
  isInArray: ComputedRef<boolean>;
  currentPath: ComputedRef<string[]>;
  handleStartEdit: () => void;
  handleCancelEdit: () => void;
  saveEdit: (editKey: string, editValue: string) => void;
  deleteItem: () => void;
  addChild: () => void;
}>('objectComposerItemContext');

// Local edit state
const editKey = ref('');
const editValue = ref<string>('');

// Initialize edit values when entering edit mode
const initEditValues = () => {
  if (!itemContext) return;

  // Initialize editKey with current key
  editKey.value = itemContext.itemKey.value;

  // Initialize editValue based on type
  editValue.value =
    itemContext.valueType.value === 'string'
      ? itemContext.value.value
      : JSON.stringify(itemContext.value.value);
};

// Expose all data as slot props for custom field rendering (asChild pattern)
const slotProps = computed(() => ({
  itemKey: itemContext?.itemKey.value,
  value: itemContext?.value.value,
  valueType: itemContext?.valueType.value,
  displayValue: itemContext?.displayValue.value,
  isExpandable: itemContext?.isExpandable.value,
  isEditing: itemContext?.isEditing.value,
  desk: itemContext?.desk,
  itemDesk: itemContext?.desk,
  handleStartEdit: () => {
    initEditValues();
    itemContext?.handleStartEdit();
  },
  handleCancelEdit: itemContext?.handleCancelEdit,
  deleteItem: itemContext?.deleteItem,
  addChild: itemContext?.addChild,
}));

const handleSaveEdit = () => {
  if (!itemContext) return;
  itemContext.saveEdit(editKey.value, editValue.value);
};

const handleEditStart = () => {
  initEditValues();
  itemContext?.handleStartEdit();
};
</script>

<template>
  <!-- Custom field via asChild pattern (Radix UI style) -->
  <slot v-if="asChild" v-bind="slotProps" />

  <!-- Edit Mode -->
  <div
    v-else-if="itemContext?.isEditing?.value"
    class="flex items-center gap-2 p-3 rounded-md border bg-background w-full"
  >
    <template v-if="!itemContext?.isInArray?.value">
      <Input
        v-model="editKey"
        class="flex-none w-32"
        placeholder="Clé"
        type="text"
        @keyup.enter="handleSaveEdit"
        @keyup.esc="itemContext?.handleCancelEdit"
      />
      <span v-if="!itemContext?.isExpandable?.value" class="text-muted-foreground">:</span>
    </template>
    <!-- Only show value input for non-expandable items -->
    <Input
      v-if="!itemContext?.isExpandable?.value"
      v-model="editValue"
      class="flex-1"
      placeholder="Valeur"
      type="text"
      @keyup.enter="handleSaveEdit"
      @keyup.esc="itemContext?.handleCancelEdit"
    />
    <div class="flex ml-auto">
      <Button variant="ghost" size="icon" title="Sauvegarder" @click="handleSaveEdit">
        <Check :size="14" />
      </Button>
      <Button variant="ghost" size="icon" title="Annuler" @click="itemContext?.handleCancelEdit">
        <X :size="14" />
      </Button>
    </div>
  </div>

  <!-- Display Mode with Actions -->
  <div v-else class="flex items-center w-full group">
    <!-- Field Display -->
    <div class="flex-1 flex items-center gap-1.5">
      <span class="font-medium text-foreground">{{ itemContext?.itemKey.value }}</span>
      <span class="text-muted-foreground">:</span>
      <span
        :class="
          cn({
            'text-red-600 dark:text-red-400': itemContext?.valueType.value === 'string',
            'text-blue-600 dark:text-blue-400': itemContext?.valueType.value === 'number',
            'text-purple-600 dark:text-purple-400': itemContext?.valueType.value === 'boolean',
            'text-muted-foreground italic': itemContext?.valueType.value === 'null',
            'text-muted-foreground italic text-sm':
              itemContext?.valueType.value === 'object' || itemContext?.valueType.value === 'array',
          })
        "
      >
        {{ itemContext?.displayValue.value }}
      </span>
    </div>

    <!-- Action Buttons -->
    <div class="flex ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        v-if="!itemContext?.isExpandable.value"
        variant="ghost"
        size="icon"
        title="Éditer"
        @click="handleEditStart"
      >
        <Edit :size="14" />
      </Button>

      <Button
        v-if="itemContext?.isExpandable.value && !itemContext?.isInArray.value"
        variant="ghost"
        size="icon"
        title="Éditer la clé"
        @click="handleEditStart"
      >
        <Edit :size="14" />
      </Button>

      <Button
        v-if="itemContext?.isExpandable.value"
        variant="ghost"
        size="icon"
        title="Ajouter un enfant"
        @click="itemContext?.addChild"
      >
        <Plus :size="14" />
      </Button>

      <Button variant="ghost" size="icon" title="Supprimer" @click="itemContext?.deleteItem">
        <Trash :size="14" />
      </Button>
    </div>
  </div>
</template>
