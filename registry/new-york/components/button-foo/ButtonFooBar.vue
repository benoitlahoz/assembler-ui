<script setup lang="ts">
import { Button } from '@/components/ui/button';

const props = withDefaults(
  defineProps<{
    // @ajs-prop An optional string property named foo.
    foo?: string;
    // @ajs-prop A required number property named ack.
    ack: number;
  }>(),
  {
    ack: 1242,
  }
);
</script>

<template>
  <Button>Hello World</Button>
</template>
