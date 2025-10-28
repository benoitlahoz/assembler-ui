<script setup lang="ts">
import { ref } from "vue";

const enabled = ref(false);
const expand = ref<"start" | "end" | "center">("start");
const isAnimating = ref(false);

function trigger() {
  enabled.value = true;
  setTimeout(() => {
    enabled.value = false;
  }, 3000);
}

function onAnimationStart() {
  isAnimating.value = true;
  enabled.value = true;
}
function onAnimationEnd() {
  isAnimating.value = false;
  enabled.value = false;
}
function onAnimationCancel() {
  isAnimating.value = false;
}
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center min-h-128">
    <div class="flex flex-col items-center gap-6 py-8">
      <AnimationBounce
        :enabled="enabled"
        :expand="expand"
        @start="onAnimationStart"
        @end="onAnimationEnd"
        @cancel="onAnimationCancel"
      >
        <img
          src="https://cdn.jim-nielsen.com/macos/1024/finder-2021-09-10.png?rf=1024"
          alt="Finder Icon"
          class="w-16 h-16"
        />
      </AnimationBounce>
      <button
        class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        @click="trigger"
      >
        Bounce !
      </button>
      <div class="flex gap-4 mt-4">
        <label class="flex items-center gap-2">
          <input
            v-model="expand"
            type="radio"
            value="start"
          />
          Vers le haut (start)
        </label>
        <label class="flex items-center gap-2">
          <input
            v-model="expand"
            type="radio"
            value="end"
          />
          Vers le bas (end)
        </label>
        <label class="flex items-center gap-2">
          <input
            v-model="expand"
            type="radio"
            value="center"
          />
          Scale (center)
        </label>
      </div>
      <label class="flex items-center gap-2 mt-4">
        <input
          :checked="isAnimating"
          type="checkbox"
          readonly
        />
        Animation en cours
      </label>
    </div>
  </div>
</template>
