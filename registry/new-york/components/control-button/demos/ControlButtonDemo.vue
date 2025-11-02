<script setup lang="ts">
import { ControlButton } from '~~/registry/new-york/components/control-button';
</script>

<template>
  <div class="flex items-center justify-center h-128 gap-4">
    <ControlButton shape="square" size="sm">
      <div class="text-sm font-bold pt-2">Click Me!</div>
    </ControlButton>
    <ControlButton shape="square" size="default" variant="destructive">
      <div class="text-sm font-bold pt-2">Click Me!</div>
    </ControlButton>
    <ControlButton shape="circle" variant="secondary">
      <div class="text-sm font-bold pt-2">Click Me!</div>
    </ControlButton>
    <ControlButton shape="square" variant="outline" size="lg">
      <div class="text-sm font-bold pt-2">Click Me!</div>
    </ControlButton>
  </div>
</template>
