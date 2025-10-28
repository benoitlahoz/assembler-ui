<script setup lang="ts">
// See https://nuxt-lego.vercel.app/blueprints/magnified-dock
import { ref, provide, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import AppIcon from "./DockItem.vue";

const mouseX = ref(Infinity);
const mouseY = ref(Infinity);

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes["class"];
    expand?: "top" | "bottom" | "middle";
  }>(),
  {
    expand: "middle",
  },
);
</script>

<template>
  <div
    class="bg-muted"
    :class="
      cn(
        'flex h-16 w-fit items-end gap-4 rounded-2xl bg-muted bg-opacity-20 backdrop-blur-md px-4 z-10',
        {
          'items-start pt-3': props.expand === 'bottom',
          'items-end pb-3': props.expand === 'top',
          'items-center': props.expand === 'middle',
        },
        props.class,
      )
    "
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
