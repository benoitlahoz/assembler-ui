<script setup lang="ts">
import { computed, inject, type InjectionKey } from 'vue';
import { useCheckIn, type CheckInDesk } from '../useCheckIn';

interface TabItemData {
  label: string;
  disabled?: boolean;
  icon?: string;
}

// Récupère le Symbol du desk fourni par le parent
const tabsDesk = inject<{ deskSymbol: InjectionKey<CheckInDesk<TabItemData>> }>('tabsDesk')!;

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

const { checkIn } = useCheckIn<TabItemData>();

const { desk } = checkIn(tabsDesk?.deskSymbol, {
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

const isActive = computed(() => (desk as any)?.activeTab.value === props.id);
</script>

<template>
  <div v-show="isActive" class="tab-panel">
    <slot />
  </div>
</template>
