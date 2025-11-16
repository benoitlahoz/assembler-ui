<script setup lang="ts">
import { inject, type InjectionKey } from 'vue';
import { useCheckIn } from '../useCheckIn';

interface ToolItemData {
  type: 'button' | 'separator';
  label?: string;
  icon?: string;
  action?: () => void;
  disabled?: boolean;
}

const props = defineProps<{
  id: string;
  label: string;
  icon?: string;
  action?: () => void;
  disabled?: boolean;
}>();

const { checkIn, memoizedId } = useCheckIn<ToolItemData>();

const { desk } = checkIn('toolbarDesk', {
  required: true,
  autoCheckIn: true,
  id: memoizedId(props.id),
  data: () => ({
    type: 'button' as const,
    label: props.label,
    icon: props.icon,
    action: props.action,
    disabled: props.disabled,
  }),
  watchData: true,
});

const isActive = (desk as any)?.activeButtonId?.value === props.id;

const handleClick = () => {
  if (props.action) {
    props.action();
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
