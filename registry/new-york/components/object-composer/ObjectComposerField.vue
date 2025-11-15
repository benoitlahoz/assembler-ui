<script setup lang="ts">
import { inject, type Component } from 'vue';
import { cn } from '@/lib/utils';
import type { CheckInDesk } from '~~/registry/new-york/composables/use-check-in/useCheckIn';

interface ObjectComposerFieldProps {
  itemKey: string;
  value: any;
  valueType: string;
  displayValue: string;
  isExpandable: boolean;
  isEditing: boolean;
  editKey: string;
  editValue: string;
  as?: Component | string;
}

const props = defineProps<ObjectComposerFieldProps>();

// Inject desk from parent ObjectComposerItem (like FormField pattern)
const itemDesk = inject<{ desk: CheckInDesk<any> }>('objectComposerItemDesk');

// Expose all props as slot props for custom component
const slotProps = {
  itemKey: props.itemKey,
  value: props.value,
  valueType: props.valueType,
  displayValue: props.displayValue,
  isExpandable: props.isExpandable,
  isEditing: props.isEditing,
  editKey: props.editKey,
  editValue: props.editValue,
  desk: itemDesk?.desk,
};
</script>

<template>
  <!-- Custom component via 'as' prop -->
  <component v-if="as" :is="as" v-bind="slotProps" />

  <!-- Default rendering -->
  <div v-else class="flex items-center gap-1.5">
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
</template>
