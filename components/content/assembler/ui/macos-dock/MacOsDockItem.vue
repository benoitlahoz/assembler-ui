<template>
  <div
    data-slot="dock-item"
    :class="cn(dockItemVariants({ size: finalSize, active: props.active }), props.class)"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { defineProps, inject, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { dockItemVariants } from ".";

export interface DockItemProps {
  size?: "sm" | "md" | "lg";
  active?: boolean;
  class?: HTMLAttributes["class"];
}

const injectedSize = inject<DockItemProps["size"]>("dock-size", "sm");
const props = withDefaults(defineProps<DockItemProps>(), {
  size: undefined,
  active: false,
});

// Si props.size est défini, il a la priorité, sinon on prend injectedSize
const finalSize = props.size !== undefined ? props.size : injectedSize;
</script>
