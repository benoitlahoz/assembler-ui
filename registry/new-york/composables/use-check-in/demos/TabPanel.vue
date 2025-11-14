<script setup lang="ts">
import { computed } from 'vue';
import { useCheckIn } from '../useCheckIn';
import { TabsDesk } from './desk-keys';

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    disabled?: boolean;
    icon?: string;
  }>(),
  {
    disabled: false,
  }
);

const { checkIn } = useCheckIn();

const { desk: tabDesk } = checkIn(TabsDesk, {
  required: true,
  autoCheckIn: true,
  id: props.id,
  data: () => ({
    label: props.label,
    disabled: props.disabled,
    icon: props.icon,
  }),
  watchData: true,
});

const isActive = computed(() => (tabDesk as any)?.activeTab.value === props.id);
</script>

<template>
  <div v-show="isActive" class="tab-panel">
    <slot />
  </div>
</template>
