<script setup lang="ts">
import { computed } from 'vue';
import { useCheckIn } from '../useCheckIn';
import { AccordionDesk } from './desk-keys';

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

const { checkIn } = useCheckIn();

const { desk: accordionDesk } = checkIn(AccordionDesk, {
  required: true,
  autoCheckIn: true,
  id: props.id,
  data: () => ({
    title: props.title,
    open: props.open,
  }),
  watchData: true,
});

const isOpen = computed(() => (accordionDesk as any)?.isOpen(props.id) || false);

const toggle = () => {
  (accordionDesk as any)?.toggle(props.id);
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
