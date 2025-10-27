<template>
  <div
    data-slot="dock-item"
    :class="[
      'flex items-center justify-center transition-transform duration-200 transform',
      'bg-yellow-200 border-2 border-blue-500',
      'w-16 h-16',
      hoverScaleClass,
      activeExpandClass,
      cn(dockItemVariants({ size: finalSize, active: props.active }), props.class),
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { defineProps, inject, computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { dockItemVariants } from ".";

export interface DockItemProps {
  size?: "sm" | "md" | "lg";
  active?: boolean;
  class?: HTMLAttributes["class"];
}

const injectedSize = inject<DockItemProps["size"]>("dock-size", "sm");
const expandDirection = inject<string | undefined>("dock-expand", undefined);
const props = withDefaults(defineProps<DockItemProps>(), {
  size: undefined,
  active: false,
});

// Si props.size est défini, il a la priorité, sinon on prend injectedSize
const finalSize = props.size !== undefined ? props.size : injectedSize;

// Magnification au hover pour tous
const hoverScaleClass = "hover:scale-110";

// Expansion directionnelle uniquement pour l'item actif
const activeExpandClass = computed(() => {
  if (!props.active || !expandDirection) return "";
  switch (expandDirection) {
    case "bottom":
      return "origin-bottom scale-110 z-10";
    case "top":
      return "origin-top scale-110 z-10";
    case "left":
      return "origin-left scale-110 z-10";
    case "right":
      return "origin-right scale-110 z-10";
    default:
      return "scale-110 z-10";
  }
});
</script>
