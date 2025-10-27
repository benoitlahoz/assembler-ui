<template>
  <Separator
    orientation="vertical"
    :class="
      cn(
        props.variant ? separatorVariants({ variant: props.variant }) : separatorVariants(),
        props.class,
      )
    "
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { separatorVariants } from ".";
import { Separator } from "~/components/content/common/separator";

interface DockSeparatorProps {
  class?: HTMLAttributes["class"];
  variant?: "default" | "primary" | "destructive" | "secondary";
}

const props = defineProps<DockSeparatorProps>();
</script>
