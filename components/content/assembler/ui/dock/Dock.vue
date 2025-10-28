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
  mouseX.value = event.clientX;
  mouseY.value = event.clientY;
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
        'flex gap-4 rounded-2xl bg-opacity-20 backdrop-blur-md z-10',
        {
          'w-fit h-16 px-4 items-start pt-3':
            props.orientation === 'horizontal' && props.expand === 'end',
          'w-fit h-16 px-4 items-end pb-3':
            props.orientation === 'horizontal' && props.expand === 'start',
          'w-fit h-16 px-4 items-center':
            props.orientation === 'horizontal' && props.expand === 'center',
          'h-fit w-16 py-4 flex-col items-start pl-3':
            props.orientation === 'vertical' && props.expand === 'end',
          'h-fit w-16 py-4 flex-col items-end pr-3':
            props.orientation === 'vertical' && props.expand === 'start',
          'h-fit w-16 py-4 flex-col items-center':
            props.orientation === 'vertical' && props.expand === 'center',
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
