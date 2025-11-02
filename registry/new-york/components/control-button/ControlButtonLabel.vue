<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

import { Label } from '@/components/ui/label';

export interface ControlButtonLabelProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ControlButtonLabelProps>();
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <Label :class="cn(props.class)">
      <slot />
    </Label>
  </div>
</template>
