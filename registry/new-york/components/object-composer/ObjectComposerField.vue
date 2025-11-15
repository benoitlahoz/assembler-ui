<script setup lang="ts">
import { inject } from 'vue';
import { cn } from '@/lib/utils';
import type { CheckInDesk } from '~~/registry/new-york/composables/use-check-in/useCheckIn';

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

defineProps<SlotProps>();

defineSlots<{
  default?: (props: SlotProps) => any;
}>();

// Inject desk from parent ObjectComposerItem (like FormField pattern)
const itemDesk = inject<{ desk: CheckInDesk<any> }>('objectComposerItemDesk');

// Access to parent desk for potential custom logic
if (itemDesk) {
  // Field has access to: itemDesk.desk.updateValue, etc.
  // This enables advanced custom field behavior
}
</script>

<template>
  <slot v-bind="$props">
    <!-- Default rendering if no slot provided -->
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
            'text-muted-foreground italic text-sm': valueType === 'object' || valueType === 'array',
          })
        "
      >
        {{ displayValue }}
      </span>
    </div>
  </slot>
</template>
