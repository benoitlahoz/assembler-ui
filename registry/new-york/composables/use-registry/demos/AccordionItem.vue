<script setup lang="ts">
import { computed } from 'vue';
import { useRegistry } from '../useRegistry';
import { AccordionRegistryKey } from './registry-keys';

const props = withDefaults(
  defineProps<{
    id: string;
    title: string;
    open?: boolean;
  }>(),
  {
    open: false,
  }
);

const { consumer } = useRegistry();

const { context: accordionContext } = consumer(AccordionRegistryKey, {
  required: true,
  autoRegister: true,
  id: props.id,
  data: () => ({
    title: props.title,
    open: props.open,
  }),
  watchData: true,
});

const isOpen = computed(() => (accordionContext as any)?.isOpen(props.id) || false);

const toggle = () => {
  (accordionContext as any)?.toggle(props.id);
};
</script>

<template>
  <div class="accordion-item">
    <button
      :class="[
        'w-full px-4 py-3 flex items-center justify-between',
        'text-left font-medium hover:bg-muted/50 transition-colors',
      ]"
      @click="toggle"
    >
      <span>{{ title }}</span>
      <span :class="['transition-transform', isOpen && 'rotate-180']">▼</span>
    </button>
    <div v-show="isOpen" class="px-4 py-3 bg-muted/30">
      <slot />
    </div>
  </div>
</template>
