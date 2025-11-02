<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import type { ControlButtonVariants } from '.';
import { Primitive } from 'reka-ui';
import { cn } from '@/lib/utils';
import { buttonVariants } from '.';

import { ControlButtonLabel } from '~~/registry/new-york/components/control-button';

export interface ControlButtonProps extends PrimitiveProps {
  variant?: ControlButtonVariants['variant'];
  size?: ControlButtonVariants['size'];
  shape?: ControlButtonVariants['shape'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ControlButtonProps>(), {
  as: 'button',
  shape: 'square',
});
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <Primitive
      data-slot="button"
      :as="as"
      :as-child="asChild"
      :class="cn(buttonVariants({ variant, size, shape }), props.class)"
    >
    </Primitive>
    <!-- Typically a ControlButtonLabel -->
    <slot />
  </div>
</template>
