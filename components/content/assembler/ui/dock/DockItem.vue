<script lang="ts" setup>
import { computed, ref, watch, type HTMLAttributes, type Ref } from "vue";
import { cn } from "@/lib/utils";
import { useProjection } from "@vueuse/math";
import {
  useMotionProperties,
  useMotionTransitions,
  MotionDirective as vMotion,
} from "@vueuse/motion";
import { AnimationBounceMacOs } from "~/components/content/assembler/ui/animation-bounce-macos";

export interface DockItemProps {
  class?: HTMLAttributes["class"];
  animate?: boolean;
}

const props = withDefaults(defineProps<DockItemProps>(), { animate: false });
const emit = defineEmits<{
  (e: "click"): void;
}>();

// Mouse position injected from parent context
const mouseX: Ref<number> = inject("mouse-x", ref(Infinity));
const mouseY: Ref<number> = inject("mouse-y", ref(Infinity));
const expand: Ref<"start" | "end" | "center"> = inject("expand", ref("start")) as Ref<
  "start" | "end" | "center"
>;
const magnify: Ref<number> = inject("magnify", ref(2.5));
const orientation: Ref<string> = inject("orientation", ref("horizontal"));

// Reference to the dock item element
const target = ref<HTMLElement>();

// --- Constants ---
// Maximum distance (in px) for the hover effect influence
const MAX_DISTANCE = 100;
// Minimum size (in px) of the dock item
const MIN_SIZE = 40;

// Motion properties for the dock item : width pour horizontal, height pour vertical
const { motionProperties } = useMotionProperties(
  target,
  orientation.value === "vertical" ? { height: MIN_SIZE, x: 0 } : { width: MIN_SIZE, y: 0 },
);
const { push } = useMotionTransitions();

// Compute the relative distance from the mouse to the center of the dock item
const distance = computed(() => {
  const bounds = target.value?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
  const val =
    orientation.value === "horizontal"
      ? Math.abs(mouseX.value - bounds.x - bounds.width / 2)
      : Math.abs(mouseY.value - bounds.y - bounds.height / 2);

  // Clamp the distance to MAX_DISTANCE
  return val > MAX_DISTANCE ? MAX_DISTANCE : val;
});

const sizeSync = computed(() => {
  return useProjection(distance, [0, MAX_DISTANCE], [MIN_SIZE * magnify.value, MIN_SIZE]).value;
});

// Compute a font size proportional to the size (between 1.25rem and 2.5rem)
const fontSize = computed(() => {
  // Map size from [MIN_SIZE, MAX_SIZE] to [1.25, 2.5] rem
  const minRem = 1.25;
  const maxRem = 2.5;
  const size = sizeSync.value;
  const mappedSize =
    ((size - MIN_SIZE) / (MIN_SIZE * magnify.value - MIN_SIZE)) * (maxRem - minRem) + minRem;
  return `${mappedSize}rem`;
});

// Animate the width of the dock item based on the mouse distance
watch(
  () => [orientation.value, sizeSync.value],
  () => {
    if (orientation.value === "horizontal") {
      push("width", sizeSync.value, motionProperties, {
        type: "spring",
        mass: 0.1,
        stiffness: 150,
        damping: 12,
      });
    } else {
      push("height", sizeSync.value, motionProperties, {
        type: "spring",
        mass: 0.1,
        stiffness: 150,
        damping: 12,
      });
    }
  },
  { immediate: true },
);

const onClick = () => {
  emit("click");
};
</script>

<template>
  <AnimationBounceMacOs
    :enabled="animate"
    :expand="expand"
    :orientation="orientation === 'horizontal' ? 'vertical' : 'horizontal'"
  >
    <div
      ref="target"
      v-motion="motionProperties"
      data-slot="dock-item"
      :class="
        cn(
          'aspect-square rounded-full bg-transparent flex items-center justify-center font-bold select-none',
          `${orientation === 'horizontal' ? 'w-10' : 'h-10'}`,
          props.class,
        )
      "
      @click="onClick"
    >
      <div
        class="text-foreground w-full h-full flex items-center justify-center"
        :style="{ fontSize }"
        draggable="false"
      >
        <slot></slot>
      </div>
    </div>
  </AnimationBounceMacOs>
</template>
