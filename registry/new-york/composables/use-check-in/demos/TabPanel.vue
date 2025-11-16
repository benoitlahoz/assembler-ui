<script setup lang="ts">
import { computed, type Ref } from 'vue';
import { useCheckIn } from '../useCheckIn';

interface TabItemData {
  label: string;
  disabled?: boolean;
}

interface TabsDeskContext {
  activeTab: Ref<string>;
  setActive: (id: string) => void;
}

const props = withDefaults(
  defineProps<{
    id: string;
    label: string;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  }
);

const { checkIn, memoizedId } = useCheckIn<TabItemData, TabsDeskContext>();

const { desk } = checkIn('tabsDesk', {
  required: true,
  autoCheckIn: true,
  id: memoizedId(props.id),
  data: () => ({
    label: props.label,
    disabled: props.disabled,
  }),
  watchData: true,
});

if (!desk) {
  throw new Error('TabPanel must be used within a tabs desk context');
}

const isActive = computed(() => desk.activeTab.value === props.id);
</script>

<template>
  <div v-show="isActive" class="tab-panel">
    <slot />
  </div>
</template>
