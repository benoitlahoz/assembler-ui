<template>
  <div
    class="flex h-16 w-fit items-end gap-4 rounded-2xl bg-muted bg-opacity-20 backdrop-blur-md px-4 pb-3"
    @mousemove="mouseX = $event.pageX"
    @mouseleave="mouseX = Infinity"
  >
    <AppIcon
      v-for="i in 8"
      :key="i"
      :mouse-x="mouseX"
      :expand="props.expand"
    />
  </div>
</template>

<script setup lang="ts">
// See https://nuxt-lego.vercel.app/blueprints/magnified-dock
import AppIcon from "./AppIcon.vue";
import { ref } from "vue";

const mouseX = ref(Infinity);

const props = defineProps<{
  expand?: "top" | "bottom";
}>();
</script>
