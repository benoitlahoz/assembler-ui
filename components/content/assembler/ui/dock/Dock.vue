<template>
  <div class="h-full max-h-full w-full max-w-full relative">
    <div class="h-full w-auto flex justify-center left-1/2 -translate-x-1/2 absolute z-5">
      <div :class="cn('h-full w-auto px-4 py-1 flex items-center justify-center', props.class)">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    transition?: number;
  }>(),
  {
    transition: 300,
  },
);

defineEmits<{
  (e: "click", index: number): void;
}>();

provide("dock-transition", props.transition);
</script>
