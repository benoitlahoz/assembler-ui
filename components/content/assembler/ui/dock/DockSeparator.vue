<script lang="ts" setup>
import { inject, computed, watch } from "vue";
import { cn } from "@/lib/utils";

export interface DockSeparatorProps {
  class?: string;
}

const props = defineProps<DockSeparatorProps>();

const orientation = inject("orientation", ref("horizontal"));
const expand: Ref<"start" | "end" | "center"> = inject("expand", ref("start")) as Ref<
  "start" | "end" | "center"
>;

const rootClasses = ref("");
const innerClasses = ref("");

watch(
  () => [orientation.value, expand.value],
  () => {
    let padding = "";
    switch (expand.value) {
      case "start":
        padding = orientation.value === "vertical" ? "pl-3 pr-0" : "pt-3 pb-0";
        break;
      case "end":
        padding = orientation.value === "vertical" ? "pl-0 pr-3" : "pt-0 pb-3";
        break;
      case "center":
        padding = orientation.value === "vertical" ? "px-3" : "py-3";
        break;
    }

    rootClasses.value =
      orientation.value === "horizontal" ? ` w-px h-full ${padding}` : `h-px w-full ${padding}`;
    innerClasses.value = orientation.value === "horizontal" ? "w-px h-full" : "h-px w-full";
  },
  { immediate: true },
);
</script>

<template>
  <div
    data-slot="dock-separator"
    :class="cn('flex overflow-hidden', rootClasses)"
  >
    <div :class="cn('flex overflow-hidden bg-foreground', innerClasses, props.class)"></div>
  </div>
</template>
