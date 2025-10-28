<script setup lang="ts">
import { computed, toRefs, ref, watch } from "vue";
import { useProjection } from "@vueuse/math";
import {
  useMotionProperties,
  useMotionTransitions,
  MotionDirective as vMotion,
} from "@vueuse/motion";

const props = defineProps<{
  mouseX: number;
}>();
const { mouseX } = toRefs(props);

const target = ref<HTMLElement>();

const { motionProperties } = useMotionProperties(target, { width: 40, y: 0 });
const { push } = useMotionTransitions();

// relative distance of target element to mouseX
const distance = computed(() => {
  const bounds = target.value?.getBoundingClientRect() ?? { x: 0, width: 0 };

  const val = Math.abs(mouseX.value - bounds.x - bounds.width / 2);
  return val > 150 ? 150 : val;
});
const widthSync = useProjection(distance, [0, 150], [100, 40]);

watch(widthSync, () => {
  push("width", widthSync.value, motionProperties, {
    type: "spring",
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
});
</script>

<template>
  <div
    ref="target"
    v-motion="motionProperties"
    class="aspect-square w-10 rounded-full bg-background/90 flex items-center justify-center text-lg font-bold select-none"
  >
    <slot>F</slot>
  </div>
</template>
