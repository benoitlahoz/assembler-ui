<script setup lang="ts">
import { useRegistry } from '../useRegistry';
import { ToolbarRegistryKey } from './registry-keys';

const props = defineProps<{
  id: string;
}>();

const { consumer } = useRegistry();

consumer(ToolbarRegistryKey, {
  required: true,
  autoRegister: true,
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
