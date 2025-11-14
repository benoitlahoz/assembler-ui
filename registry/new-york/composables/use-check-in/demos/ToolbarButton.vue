<script setup lang="ts">
import { computed } from 'vue';
import { useCheckIn } from '../useCheckIn';
import { ToolbarDesk } from './desk-keys';

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    icon?: string;
    type: 'button' | 'toggle';
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  }
);

const { checkIn } = useCheckIn();

const { desk: toolbarDesk } = checkIn(ToolbarDesk, {
  required: true,
  autoCheckIn: true,
  id: props.id,
  data: () => ({
    label: props.label,
    icon: props.icon,
    type: props.type,
    disabled: props.disabled,
  }),
  watchData: true,
});

const isActive = computed(() => {
  if (props.type !== 'toggle') return false;
  return (toolbarDesk as any)?.isActive(props.id) || false;
});

const handleClick = () => {
  if (!props.disabled && toolbarDesk) {
    (toolbarDesk as any).handleClick(props.id, props.type);
  }
};
</script>

<template>
  <button
    :class="[
      'px-3 py-2 rounded font-medium text-sm transition-colors',
      'hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed',
      isActive && 'bg-primary text-primary-foreground hover:bg-primary/90',
      !isActive && 'bg-background text-foreground',
    ]"
    :disabled="disabled"
    :title="label"
    @click="handleClick"
  >
    <span v-if="icon" class="text-base">{{ icon }}</span>
    <span v-else>{{ label }}</span>
  </button>
</template>
