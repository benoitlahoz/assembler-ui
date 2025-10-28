<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const emit = defineEmits(["start", "end", "cancel"]);

export interface AnimationBounceMacOsProps {
  class?: HTMLAttributes["class"];
  enabled?: boolean;
  amplitude?: number;
  expand?: "start" | "end" | "center";
  orientation?: "vertical" | "horizontal";
}

const props = withDefaults(defineProps<AnimationBounceMacOsProps>(), {
  enabled: false,
  amplitude: 0.5, // 0.5 = 50% de la hauteur du slot
  expand: "start", // 'start', 'end', 'center'
  orientation: "vertical", // 'vertical' ou 'horizontal'
});

const isAnimating = ref(false);
let bounceTimeout: ReturnType<typeof setTimeout> | null = null;

const slotEl = ref<HTMLElement | null>(null);
const bounceAmount = ref(0);

function updateBounceAmount() {
  if (slotEl.value) {
    const rect = slotEl.value.getBoundingClientRect();
    if (props.orientation === "horizontal") {
      bounceAmount.value = rect.width * props.amplitude;
    } else {
      bounceAmount.value = rect.height * props.amplitude;
    }
  }
}

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  updateBounceAmount();
  if (slotEl.value && "ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => updateBounceAmount());
    resizeObserver.observe(slotEl.value);
  } else {
    window.addEventListener("resize", updateBounceAmount);
  }
});
onBeforeUnmount(() => {
  if (resizeObserver && slotEl.value) resizeObserver.disconnect();
  window.removeEventListener("resize", updateBounceAmount);
});

function startBounceLoop() {
  if (!props.enabled) return;
  isAnimating.value = false;
  nextTick(() => {
    updateBounceAmount();
    isAnimating.value = true;
    emit("start");
  });
}

function onAnimationEnd() {
  isAnimating.value = false;
  if (!props.enabled) {
    emit("end");
  }
  if (props.enabled) {
    bounceTimeout = setTimeout(() => {
      isAnimating.value = true;
      emit("start");
    }, 100);
  }
}

watch(
  () => props.enabled,
  (val, oldVal) => {
    if (val) {
      startBounceLoop();
    } else {
      isAnimating.value = false;
      if (bounceTimeout) {
        clearTimeout(bounceTimeout);
        bounceTimeout = null;
      }
      if (oldVal) {
        emit("cancel");
      }
    }
  },
  { immediate: true },
);
</script>

<template>
  <div
    :class="
      cn(
        [
          'animation-bounce',
          { 'is-animating': isAnimating },
          `expand-${props.expand}`,
          `orientation-${props.orientation}`,
        ],
        props.class,
      )
    "
    :style="{ '--bounce-amount': bounceAmount + 'px' }"
    @animationend="onAnimationEnd"
    @click="startBounceLoop"
  >
    <div
      ref="slotEl"
      style="display: inline-block; width: 100%; height: 100%"
    >
      <slot />
    </div>
  </div>
</template>

<style scoped>
.animation-bounce {
  display: inline-block;
  cursor: pointer;
}
/* Animation verticale (par défaut) */
.animation-bounce.is-animating.expand-start.orientation-vertical {
  animation: bounce-macos-up 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) 1;
}
.animation-bounce.is-animating.expand-end.orientation-vertical {
  animation: bounce-macos-down 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) 1;
}
/* Animation horizontale */
.animation-bounce.is-animating.expand-start.orientation-horizontal {
  animation: bounce-macos-right 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) 1;
}
.animation-bounce.is-animating.expand-end.orientation-horizontal {
  animation: bounce-macos-left 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) 1;
}
/* Animation scale (center) */
.animation-bounce.is-animating.expand-center {
  animation: bounce-macos-scale 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) 1;
}
@keyframes bounce-macos-right {
  0% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(calc(0.33 * var(--bounce-amount, 24px)));
  }
  20% {
    transform: translateX(calc(0.66 * var(--bounce-amount, 24px)));
  }
  30% {
    transform: translateX(var(--bounce-amount, 24px));
  }
  40% {
    transform: translateX(calc(0.66 * var(--bounce-amount, 24px)));
  }
  50% {
    transform: translateX(calc(0.33 * var(--bounce-amount, 24px)));
  }
  60% {
    transform: translateX(calc(0.15 * var(--bounce-amount, 24px)));
  }
  70% {
    transform: translateX(calc(0.08 * var(--bounce-amount, 24px)));
  }
  80% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes bounce-macos-left {
  0% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(calc(-0.33 * var(--bounce-amount, 24px)));
  }
  20% {
    transform: translateX(calc(-0.66 * var(--bounce-amount, 24px)));
  }
  30% {
    transform: translateX(calc(-1 * var(--bounce-amount, 24px)));
  }
  40% {
    transform: translateX(calc(-0.66 * var(--bounce-amount, 24px)));
  }
  50% {
    transform: translateX(calc(-0.33 * var(--bounce-amount, 24px)));
  }
  60% {
    transform: translateX(calc(-0.15 * var(--bounce-amount, 24px)));
  }
  70% {
    transform: translateX(calc(-0.08 * var(--bounce-amount, 24px)));
  }
  80% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(0);
  }
}
@keyframes bounce-macos-up {
  0% {
    transform: translateY(0);
  }
  10% {
    transform: translateY(calc(-0.33 * var(--bounce-amount, 24px)));
  }
  20% {
    transform: translateY(calc(-0.66 * var(--bounce-amount, 24px)));
  }
  30% {
    transform: translateY(calc(-1 * var(--bounce-amount, 24px)));
  }
  40% {
    transform: translateY(calc(-0.66 * var(--bounce-amount, 24px)));
  }
  50% {
    transform: translateY(calc(-0.33 * var(--bounce-amount, 24px)));
  }
  60% {
    transform: translateY(calc(-0.15 * var(--bounce-amount, 24px)));
  }
  70% {
    transform: translateY(calc(-0.08 * var(--bounce-amount, 24px)));
  }
  80% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes bounce-macos-down {
  0% {
    transform: translateY(0);
  }
  10% {
    transform: translateY(calc(0.33 * var(--bounce-amount, 24px)));
  }
  20% {
    transform: translateY(calc(0.66 * var(--bounce-amount, 24px)));
  }
  30% {
    transform: translateY(var(--bounce-amount, 24px));
  }
  40% {
    transform: translateY(calc(0.66 * var(--bounce-amount, 24px)));
  }
  50% {
    transform: translateY(calc(0.33 * var(--bounce-amount, 24px)));
  }
  60% {
    transform: translateY(calc(0.15 * var(--bounce-amount, 24px)));
  }
  70% {
    transform: translateY(calc(0.08 * var(--bounce-amount, 24px)));
  }
  80% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes bounce-macos-scale {
  0% {
    transform: scale(1);
  }
  10% {
    transform: scale(1.08);
  }
  20% {
    transform: scale(1.16);
  }
  30% {
    transform: scale(1.22);
  }
  40% {
    transform: scale(1.16);
  }
  50% {
    transform: scale(1.08);
  }
  60% {
    transform: scale(1.04);
  }
  70% {
    transform: scale(1.02);
  }
  80% {
    transform: scale(1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
