<script lang="ts" setup>
// See https://nuxt-lego.vercel.app/blueprints/magnified-dock
// Also https://www.shadcn.io/components/dock/mac-os-dock
import { ref, provide, type HTMLAttributes, watch } from "vue";
import { cn } from "@/lib/utils";

export interface DockProps {
  class?: HTMLAttributes["class"];
  orientation?: "horizontal" | "vertical";
  expand?: "start" | "end" | "center";
  magnify?: number | string;
}

const props = withDefaults(defineProps<DockProps>(), {
  expand: "center",
  orientation: "horizontal",
  magnify: 2.5,
});

const mouseX = ref(Infinity);
const mouseY = ref(Infinity);
const expand = ref(props.expand);
const magnify = ref(Number(props.magnify));
const orientation = ref(props.orientation);

provide("mouse-x", mouseX);
provide("mouse-y", mouseY);
provide("expand", expand);
provide("magnify", magnify);
provide("orientation", orientation);

watch(
  () => [props.expand, props.magnify, props.orientation],
  () => {
    expand.value = props.expand;
    magnify.value = Number(props.magnify);
    orientation.value = props.orientation;
  },
);

const onMouseMove = (event: MouseEvent) => {
  mouseX.value = event.pageX;
  mouseY.value = event.pageY;
};

const onMouseLeave = () => {
  mouseX.value = Infinity;
  mouseY.value = Infinity;
};
</script>

<template>
  <div
    data-slot="dock"
    class="border border-border"
    :class="
      cn(
        'flex h-16 w-fit items-end gap-4 rounded-2xl bg-opacity-20 backdrop-blur-md px-4 z-10',
        {
          'items-start pt-3': props.expand === 'end',
          'items-end pb-3': props.expand === 'start',
          'items-center': props.expand === 'center',
        },
        props.class,
      )
    "
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <slot></slot>
  </div>
</template>
