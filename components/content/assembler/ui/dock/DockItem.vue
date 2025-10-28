<script lang="ts" setup>
import { computed, ref, watch, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { useProjection } from "@vueuse/math";
import {
  useMotionProperties,
  useMotionTransitions,
  MotionDirective as vMotion,
} from "@vueuse/motion";

export interface DockItemProps {
  class?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<DockItemProps>(), {});
const emit = defineEmits<{
  (e: "click"): void;
}>();

// Mouse position injected from parent context
const mouseX: Ref<number> = inject("mouse-x", ref(Infinity));
const mouseY: Ref<number> = inject("mouse-y", ref(Infinity));
const magnify: Ref<number> = inject("magnify", ref(2.5));

// Reference to the dock item element
const target = ref<HTMLElement>();

// --- Constants ---
// Maximum distance (in px) for the hover effect influence
const MAX_DISTANCE = 100;
// Minimum width (in px) of the dock item
const MIN_WIDTH = 40;

// Motion properties for the dock item
const { motionProperties } = useMotionProperties(target, { width: MIN_WIDTH, y: 0 });
const { push } = useMotionTransitions();

// Compute the relative distance from the mouse to the center of the dock item
const distance = computed(() => {
  const bounds = target.value?.getBoundingClientRect() ?? { x: 0, width: 0 };
  const val = Math.abs(mouseX.value - bounds.x - bounds.width / 2);
  // Clamp the distance to MAX_DISTANCE
  return val > MAX_DISTANCE ? MAX_DISTANCE : val;
});

// Project the distance to a width value between MAX_WIDTH (close) and MIN_WIDTH (far)
const widthSync = useProjection(
  distance,
  [0, MAX_DISTANCE],
  [MIN_WIDTH * magnify.value, MIN_WIDTH],
);

// Compute a font size proportional to the width (between 1.25rem and 2.5rem)
const fontSize = computed(() => {
  // Map width from [MIN_WIDTH, MAX_WIDTH] to [1.25, 2.5] rem
  const minRem = 1.25;
  const maxRem = 2.5;
  const width = widthSync.value;
  const size =
    ((width - MIN_WIDTH) / (MIN_WIDTH * magnify.value - MIN_WIDTH)) * (maxRem - minRem) + minRem;
  return `${size}rem`;
});

// Animate the width of the dock item based on the mouse distance
watch(widthSync, () => {
  push("width", widthSync.value, motionProperties, {
    type: "spring",
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
});

const onClick = () => {
  emit("click");
};
</script>

<template>
  <div
    ref="target"
    v-motion="motionProperties"
    data-slot="dock-item"
    :class="
      cn(
        'aspect-square w-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold select-none',
        props.class,
      )
    "
    @click="onClick"
  >
    <div
      class="text-black w-full h-full flex items-center justify-center"
      :style="{ fontSize }"
      draggable="false"
    >
      <slot> </slot>
    </div>
  </div>
</template>
