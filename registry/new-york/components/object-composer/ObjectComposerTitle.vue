<script setup lang="ts">
import { FieldLegend } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'vue';

export interface ObjectComposerTitleProps {
  class?: HTMLAttributes['class'];
  variant?: 'legend' | 'label';
}

const props = defineProps<ObjectComposerTitleProps>();
</script>

<template>
  <FieldLegend :class="cn(props.class)" :variant="props.variant">
    <slot>
      <span>Object Composer</span>
    </slot>
  </FieldLegend>
</template>

<style scoped></style>
