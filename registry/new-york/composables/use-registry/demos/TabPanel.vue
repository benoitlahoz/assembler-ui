<script setup lang="ts">
import { computed } from 'vue';
import { useRegistry } from '../useRegistry';
import { TabsRegistryKey } from './registry-keys';

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

const { consumer } = useRegistry();

const { context: tabContext } = consumer(TabsRegistryKey, {
  required: true,
  autoRegister: true,
  id: props.id,
  data: () => ({
    label: props.label,
    disabled: props.disabled,
    icon: props.icon,
  }),
  watchData: true,
});

const isActive = computed(() => (tabContext as any)?.activeTab.value === props.id);
</script>

<template>
  <div v-show="isActive" class="tab-panel">
    <slot />
  </div>
</template>
