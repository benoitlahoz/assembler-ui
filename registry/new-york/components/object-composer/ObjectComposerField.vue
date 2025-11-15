<script setup lang="ts">
import { inject, computed, useSlots } from 'vue';
import { cn } from '@/lib/utils';
import type { CheckInDesk } from '~~/registry/new-york/composables/use-check-in/useCheckIn';

interface ObjectComposerFieldProps {
  asChild?: boolean;
}

const props = defineProps<ObjectComposerFieldProps>();

// Inject desk from parent ObjectComposerItem (useCheckIn pattern)
const itemContext = inject<{
  desk: CheckInDesk<any>;
  itemKey: string;
  value: any;
  valueType: string;
  displayValue: string;
  isExpandable: boolean;
  isEditing: boolean;
}>('objectComposerItemContext');

// Computed helpers for styling (exposed in slot props)
const typeColor = computed(() => {
  switch (itemContext?.valueType) {
    case 'string':
      return 'bg-red-500';
    case 'number':
      return 'bg-blue-500';
    case 'boolean':
      return 'bg-purple-500';
    case 'null':
      return 'bg-gray-400';
    default:
      return 'bg-gray-300';
  }
});

const badgeVariant = computed<'destructive' | 'default' | 'secondary'>(() => {
  switch (itemContext?.valueType) {
    case 'string':
      return 'destructive';
    case 'number':
      return 'default';
    default:
      return 'secondary';
  }
});

// Expose all data as slot props for custom field rendering (asChild pattern)
const slotProps = computed(() => ({
  itemKey: itemContext?.itemKey,
  value: itemContext?.value,
  valueType: itemContext?.valueType,
  displayValue: itemContext?.displayValue,
  isExpandable: itemContext?.isExpandable,
  isEditing: itemContext?.isEditing,
  desk: itemContext?.desk,
  itemDesk: itemContext?.desk,
  typeColor: typeColor.value,
  badgeVariant: badgeVariant.value,
}));
</script>

<template>
  <!-- Custom field via asChild pattern (Radix UI style) -->
  <slot v-if="asChild" v-bind="slotProps" />

  <!-- Default rendering -->
  <div v-else class="flex items-center gap-1.5">
    <span class="font-medium text-foreground">{{ itemContext?.itemKey }}</span>
    <span class="text-muted-foreground">:</span>
    <span
      :class="
        cn({
          'text-red-600 dark:text-red-400': itemContext?.valueType === 'string',
          'text-blue-600 dark:text-blue-400': itemContext?.valueType === 'number',
          'text-purple-600 dark:text-purple-400': itemContext?.valueType === 'boolean',
          'text-muted-foreground italic': itemContext?.valueType === 'null',
          'text-muted-foreground italic text-sm':
            itemContext?.valueType === 'object' || itemContext?.valueType === 'array',
        })
      "
    >
      {{ itemContext?.displayValue }}
    </span>
  </div>
</template>
