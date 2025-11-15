<script setup lang="ts">
import { inject, computed } from 'vue';
import { cn } from '@/lib/utils';
import type { CheckInDesk } from '~~/registry/new-york/composables/use-check-in/useCheckIn';
import { Badge } from '@/components/ui/badge';

interface CustomFieldProps {
  itemKey: string;
  value: any;
  valueType: string;
  displayValue: string;
}

const props = defineProps<CustomFieldProps>();

// Inject desk from parent ObjectComposerItem for advanced usage
const itemDesk = inject<{ desk: CheckInDesk<any> }>('objectComposerItemDesk');

const typeColor = computed(() => {
  switch (props.valueType) {
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

const badgeVariant = computed(() => {
  switch (props.valueType) {
    case 'string':
      return 'destructive' as const;
    case 'number':
      return 'default' as const;
    default:
      return 'secondary' as const;
  }
});
</script>

<template>
  <div class="flex items-center gap-2 p-2 rounded hover:bg-accent/50 transition-colors">
    <!-- Type indicator dot -->
    <div :class="cn('w-2 h-2 rounded-full', typeColor)" />

    <!-- Key with fixed width -->
    <span class="font-mono text-xs text-muted-foreground min-w-24">
      {{ itemKey }}
    </span>

    <!-- Value as badge -->
    <Badge :variant="badgeVariant" class="font-mono text-xs">
      {{ displayValue }}
    </Badge>

    <!-- Desk status indicator -->
    <span v-if="itemDesk" class="ml-auto text-xs text-green-600" title="Desk connected"> ● </span>
  </div>
</template>
