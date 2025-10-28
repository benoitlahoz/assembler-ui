<script lang="ts" setup>
import { cn } from "@/lib/utils";

export interface DockSeparatorProps {
  class?: string;
}

const props = defineProps<DockSeparatorProps>();
</script>

<template>
  <div
    data-slot="dock-separator"
    class="flex overflow-hidden w-px h-full pb-3"
  >
    <div :class="cn('flex h-full overflow-hidden w-px bg-foreground', props.class)"></div>
  </div>
</template>
