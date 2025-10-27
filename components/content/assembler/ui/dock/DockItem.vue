<template>
  <TooltipProvider :delay-duration="0">
    <Tooltip as-child>
      <TooltipTrigger as-child>
        <li
          :class="
            cn(
              'dock-item group flex w-12 h-8 items-center justify-center vertical-align-top origin-top relative',
              props.class,
            )
          "
          @click="$emit('click')"
        >
          <slot></slot>
          <span
            v-if="props.badge && props.badge.type === 'circle'"
            class="badge-size flex items-center justify-center select-none pointer-events-none z-10 absolute top-0 left-[65%] transition-all"
            :class="
              cn(
                props.badge.variant
                  ? badgeVariants({ variant: props.badge.variant })
                  : badgeVariants({ variant: 'default' }),
                props.class,
              )
            "
          >
            {{ typeof props.badge.value !== "undefined" ? props.badge.value : "" }}
          </span>
          <span
            v-if="
              props.badge && props.badge.type === 'number' && typeof props.badge.value === 'number'
            "
            class="badge-size flex items-center justify-center select-none pointer-events-none z-10 p-2 rounded-full absolute -top-1 left-[65%] transition-all"
            :class="
              cn(
                props.badge.variant
                  ? badgeVariants({ variant: props.badge.variant })
                  : badgeVariants({ variant: 'default' }),
                props.class,
              )
            "
          >
            {{ typeof props.badge.value !== "undefined" ? props.badge.value : "" }}
          </span>
        </li>
      </TooltipTrigger>
      <TooltipContent v-if="props.tooltip">{{ props.tooltip }}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { computed, type HTMLAttributes, inject } from "vue";
import { badgeVariants } from ".";
import type { DockBadgeConfig } from ".";
import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~/components/content/common/tooltip";

const props = defineProps<{
  tooltip?: string;
  class?: HTMLAttributes["class"];
  badge?: DockBadgeConfig;
}>();

defineEmits<{
  (e: "click"): void;
}>();

const dockTransition = inject<number>("dock-transition", 500);
const transition = computed(() => `${dockTransition}ms`);
</script>

<style scoped>
@reference "tailwindcss";

.dock-item {
  transition: all v-bind(transition) ease;
}

.dock-item:hover {
  @apply w-16 h-12 mt-4;
}

.dock-item:hover + .dock-item {
  @apply w-14 h-10 mt-2;
}

.dock-item:hover + .dock-item + .dock-item {
  @apply w-12 h-9 mt-1;
}

.dock-item:has(+ .dock-item:hover) {
  @apply w-14 h-10 mt-2;
}

.dock-item:has(+ .dock-item + .dock-item:hover) {
  @apply w-12 h-9 mt-1;
}

.badge-size {
  @apply absolute h-2 w-2 min-h-2 min-w-2 transition-all text-xs;
}
</style>
