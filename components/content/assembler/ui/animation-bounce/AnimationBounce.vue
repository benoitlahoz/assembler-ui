<script setup lang="ts">
import { ref, watch, defineProps, nextTick, onMounted, onBeforeUnmount, defineEmits } from "vue";

const emit = defineEmits(["start", "end", "cancel"]);

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true,
  },
  amplitude: {
    type: Number,
    default: 0.5, // 0.5 = 50% de la hauteur du slot
  },
  expand: {
    type: String,
    default: "start", // 'start', 'end', 'center'
    validator: (v: string) => ["start", "end", "center"].includes(v),
  },
});

const isAnimating = ref(false);
let bounceTimeout: ReturnType<typeof setTimeout> | null = null;

const slotEl = ref<HTMLElement | null>(null);
const bounceHeight = ref(0);

function updateBounceHeight() {
  if (slotEl.value) {
    const rect = slotEl.value.getBoundingClientRect();
    bounceHeight.value = rect.height * props.amplitude;
  }
}

let resizeObserver: ResizeObserver | null = null;
onMounted(() => {
  updateBounceHeight();
  if (slotEl.value && "ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => updateBounceHeight());
    resizeObserver.observe(slotEl.value);
  } else {
    window.addEventListener("resize", updateBounceHeight);
  }
});
onBeforeUnmount(() => {
  if (resizeObserver && slotEl.value) resizeObserver.disconnect();
  window.removeEventListener("resize", updateBounceHeight);
});

function startBounceLoop() {
  if (!props.enabled) return;
  isAnimating.value = false;
  nextTick(() => {
    updateBounceHeight();
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
    :class="['animation-bounce', { 'is-animating': isAnimating }, `expand-${props.expand}`]"
    :style="{ '--bounce-amount': bounceHeight + 'px' }"
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
/* Animation vers le haut (start) */
.animation-bounce.is-animating.expand-start {
  animation: bounce-macos-up 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) 1;
}
/* Animation vers le bas (end) */
.animation-bounce.is-animating.expand-end {
  animation: bounce-macos-down 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) 1;
}
/* Animation scale (center) */
.animation-bounce.is-animating.expand-center {
  animation: bounce-macos-scale 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) 1;
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
