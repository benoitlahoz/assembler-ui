<template>
  <component
    :is="asChild ? 'slot' : 'button'"
    :class="cn(buttonVariants({ variant, size }), $attrs.class ?? '')"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { buttonVariants, type ButtonVariant, type ButtonSize } from '.';
import { cn } from '@/lib/utils';

defineOptions({
  name: 'AssemblerButton',
  inheritAttrs: false,
});

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<ButtonProps>(), {
  variant: 'default',
  size: 'default',
  asChild: false,
  disabled: false,
});
</script>
