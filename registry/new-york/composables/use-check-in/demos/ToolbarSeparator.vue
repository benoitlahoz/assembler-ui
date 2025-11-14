<script setup lang="ts">
import { useCheckIn } from '../useCheckIn';
import { ToolbarDesk } from './desk-keys';

const props = defineProps<{
  id: string;
}>();

const { checkIn } = useCheckIn();

checkIn(ToolbarDesk, {
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
