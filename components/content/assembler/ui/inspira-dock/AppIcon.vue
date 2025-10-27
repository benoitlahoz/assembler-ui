<template>
  <div
    ref="target"
    v-motion="motionProperties"
    class="aspect-square w-10 rounded-full bg-background/90 flex items-center justify-center text-lg font-bold select-none"
  >
    <slot>F</slot>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, ref, watch } from "vue";
import { useProjection } from "@vueuse/math";
import { useMotionProperties, useMotionTransitions } from "@vueuse/motion";

const props = defineProps<{
  mouseX: number;
  expand?: "top" | "bottom" | "middle";
}>();
const { mouseX, expand } = toRefs(props);

const target = ref<HTMLElement>();

const { motionProperties } = useMotionProperties(target, { width: 40, y: 0 });
const { push } = useMotionTransitions();

// Relative distance of target element to mouseX
const distance = computed(() => {
  const bounds = target.value?.getBoundingClientRect() ?? { x: 0, width: 0 };
  const val = Math.abs(mouseX.value - bounds.x - bounds.width / 2);
  return val > 150 ? 150 : val;
});
const widthSync = useProjection(distance, [0, 150], [100, 40]);

const offset = computed(() => {
  const baseSize = 40;
  const currentSize = widthSync.value;
  const growth = (currentSize - baseSize) / 2;
  if (expand?.value === "top") return -growth;
  if (expand?.value === "middle") return growth;
  if (expand?.value === "bottom") return growth * 2;
  return 0;
});

watch([widthSync, offset], () => {
  push("width", widthSync.value, motionProperties, {
    type: "spring",
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  push("y", offset.value, motionProperties, {
    type: "spring",
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
});
</script>
