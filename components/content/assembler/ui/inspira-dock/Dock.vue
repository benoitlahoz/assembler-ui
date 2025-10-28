<script setup lang="ts">
// See https://nuxt-lego.vercel.app/blueprints/magnified-dock
import { ref, provide, type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import AppIcon from "./DockItem.vue";

const mouseX = ref(Infinity);
const mouseY = ref(Infinity);

export interface DockProps {
  class?: HTMLAttributes["class"];
  expand?: "start" | "end" | "center";
}

const props = withDefaults(defineProps<DockProps>(), {
  expand: "center",
});
</script>

<template>
  <div
    class="bg-muted"
    :class="
      cn(
        'flex h-16 w-fit items-end gap-4 rounded-2xl bg-muted bg-opacity-20 backdrop-blur-md px-4 z-10',
        {
          'items-start pt-3': props.expand === 'end',
          'items-end pb-3': props.expand === 'start',
          'items-center': props.expand === 'center',
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
    />
  </div>
</template>
