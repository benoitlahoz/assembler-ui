<script setup lang="ts">
import { Button } from '@/components/ui/button';

const props = withDefaults(defineProps<{ foo?: string; bar: number }>(), {
  bar: 42,
});
</script>

<template>
  <Button>Hello World</Button>
</template>
