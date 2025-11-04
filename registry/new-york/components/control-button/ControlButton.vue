<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import type { ControlButtonVariants } from '.';
import { Primitive } from 'reka-ui';
import { cn } from '@/lib/utils';
import { buttonVariants } from '.';
import { computed } from 'vue';

export interface ControlButtonProps extends PrimitiveProps {
  variant?: ControlButtonVariants['variant'];
  shape?: ControlButtonVariants['shape'];
  color?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ControlButtonProps>(), {
  as: 'button',
  shape: 'square',
  variant: 'default',
});

const colorStyle = computed(() => {
  if (!props.color) return {};

  // Vérifier si c'est une variable CSS (commence par --)
  const isVariable = props.color.startsWith('--');
  const colorValue = isVariable ? `var(${props.color})` : props.color;

  return {
    '--button-color': colorValue,
    'background-color':
      props.variant === 'outline' || props.variant === 'ghost' ? 'transparent' : colorValue,
    color: props.variant === 'outline' || props.variant === 'ghost' ? colorValue : 'white',
    'border-color': props.variant === 'outline' ? colorValue : undefined,
  };
});
</script>

<template>
  <Primitive
    data-slot="button"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, shape }), 'w-full h-full', props.class)"
    :style="colorStyle"
  >
    <slot />
  </Primitive>
</template>
