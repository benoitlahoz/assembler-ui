<script setup lang="ts">
import { inject, type InjectionKey } from 'vue';
import { useCheckIn, type CheckInDesk } from '../useCheckIn';

interface ToolItemData {
  label: string;
  icon?: string;
  type: 'button' | 'toggle' | 'separator';
  active?: boolean;
  disabled?: boolean;
}

// Récupère le Symbol du desk fourni par le parent
const toolbarDesk = inject<{ deskSymbol: InjectionKey<CheckInDesk<ToolItemData>> }>('toolbarDesk')!;

const props = defineProps<{
  id: string;
}>();

const { checkIn } = useCheckIn<ToolItemData>();

checkIn(toolbarDesk, {
  required: true,
  autoCheckIn: true,
  id: props.id,
  data: () => ({
    label: 'Separator',
    type: 'separator' as const,
  }),
});
</script>

<template>
  <div class="w-px h-6 bg-border mx-1" />
</template>
