<template>
  <div
    data-slot="dock"
    :class="dockClass"
  >
    <slot :orientation="props.orientation" />
  </div>
</template>

<script setup lang="ts">
import { provide, computed, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { dockVariants, type DockVariants, type DockOrientation } from ".";

export interface DockProps {
  orientation?: DockOrientation;
  color?: DockVariants["color"];
  size?: "sm" | "md" | "lg";
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<DockProps>(), {
  orientation: undefined,
  color: "default",
  size: "sm",
});

provide("dock-size", props.size);
provide("dock-orientation", props.orientation);

const dockClass = computed(() => {
  let classes = "";
  let sizeStyle = "";
  if (props.size === "sm") {
    classes = "p-1";
    sizeStyle = props.orientation === "vertical" ? "w-10" : "h-10";
  } else if (props.size === "md") {
    classes = "p-2";
    sizeStyle = props.orientation === "vertical" ? "w-16" : "h-16";
  } else {
    classes = "p-3";
    sizeStyle = props.orientation === "vertical" ? "w-20" : "h-20";
  }
  return cn(
    props.orientation,
    dockVariants({ color: props.color, orientation: props.orientation }),
    classes,
    sizeStyle,
    props.class,
  );
});
</script>
