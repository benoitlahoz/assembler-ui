<script setup lang="ts">
// @ajs-description A simple knob component that displays a button with "Hello World" text.
import { Button } from '@/components/ui/button';

const props = withDefaults(
  defineProps<{
    // @ajs-prop An optional string property named foo.
    foo?: string;
    // @ajs-prop A required number property named bar.
    bar: number;
  }>(),
  {
    bar: 42,
  }
);
</script>

<template>
  <Button>Hello World</Button>
</template>
