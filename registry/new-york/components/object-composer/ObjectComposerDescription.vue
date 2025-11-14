<script setup lang="ts">
import { FieldDescription } from '@/components/ui/field';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'vue';

export interface ObjectComposerDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ObjectComposerDescriptionProps>();
</script>

<template>
  <FieldDescription :class="cn(props.class)">
    <slot>
      <span>Object Composer Description</span>
    </slot>
  </FieldDescription>
</template>

<style scoped></style>
