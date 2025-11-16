<script setup lang="ts">
import { h, getCurrentInstance } from 'vue';
import { useSlotRegistry, type SlotRegistry } from '../useSlotRegistry';

interface MenuScope {
  x: number;
  y: number;
  targetElement?: HTMLElement;
}

interface Props {
  registry: SlotRegistry<MenuScope>;
  label: string;
  icon?: string;
  position?: number;
  group?: string;
  variant?: 'default' | 'destructive';
}

const props = withDefaults(defineProps<Props>(), {
  position: 0,
  group: 'main',
  variant: 'default',
});

const emit = defineEmits<{
  select: [];
}>();

const { registerSlot, memoizedId } = useSlotRegistry<MenuScope>();

const slotId = memoizedId(getCurrentInstance(), 'menu-item');

registerSlot(props.registry, {
  id: slotId,
  autoRegister: true,
  position: props.position,
  group: props.group,
  render: () => {
    return h(
      'button',
      {
        class: [
          'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors',
          props.variant === 'destructive'
            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
            : 'hover:bg-accent',
        ],
        onClick: () => {
          emit('select');
        },
      },
      [
        props.icon &&
          h('span', {
            class: `i-lucide-${props.icon} h-4 w-4`,
          }),
        h('span', {}, props.label),
      ]
    );
  },
});
</script>

<template>
  <!-- Rendu via render function -->
</template>
