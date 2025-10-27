<template>
  <div
    data-slot="dock-separator"
    :class="
      cn(
        dockSeparatorVariants({ variant: props.variant, orientation: computedOrientation }),
        separatorSizeClass,
        separatorMarginClass,
        props.class,
      )
    "
  />
</template>

<script setup lang="ts">
import { type HTMLAttributes, inject, computed } from "vue";
import { cn } from "@/lib/utils";
import { dockSeparatorVariants, type DockSeparatorVariants, type DockItemProps } from ".";

const separatorSizeClass = computed(() => {
  // Taille du séparateur selon la taille du dock et l'orientation
  if (computedOrientation.value === "vertical") {
    if (injectedSize === "sm") return "h-6";
    if (injectedSize === "md") return "h-10";
    return "h-14";
  } else {
    if (injectedSize === "sm") return "w-6";
    if (injectedSize === "md") return "w-10";
    return "w-14";
  }
});

const separatorMarginClass = computed(() => {
  // Marges selon orientation et taille
  if (computedOrientation.value === "vertical") {
    if (injectedSize === "sm") return "mx-2";
    if (injectedSize === "md") return "mx-3";
    return "mx-4";
  } else {
    if (injectedSize === "sm") return "my-2";
    if (injectedSize === "md") return "my-3";
    return "my-4";
  }
});
export interface DockSeparatorProps {
  variant?: DockSeparatorVariants["variant"];
  orientation?: DockSeparatorVariants["orientation"];
  class?: HTMLAttributes["class"];
}

const dockOrientation = inject<string>("dock-orientation", "horizontal");
const injectedSize = inject<DockItemProps["size"]>("dock-size", "sm");

const props = withDefaults(defineProps<DockSeparatorProps>(), {
  orientation: undefined,
  variant: "default",
});

// Si orientation n'est pas précisée, on suppose que le séparateur doit être perpendiculaire au dock
const computedOrientation = computed(
  () => props.orientation ?? (dockOrientation === "horizontal" ? "vertical" : "horizontal"),
);
</script>
