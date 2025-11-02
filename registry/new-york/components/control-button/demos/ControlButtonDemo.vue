<script setup lang="ts">
import { ControlButton, ControlButtonLabel } from '~~/registry/new-york/components/control-button';
import { Separator } from '@/components/ui/separator';
</script>

<template>
  <div class="flex items-center justify-center h-128 gap-4">
    <ControlButton shape="square" size="sm">
      <ControlButtonLabel class="text-sm font-bold pt-2"># 1</ControlButtonLabel>
    </ControlButton>
    <ControlButton shape="square" size="default" variant="destructive">
      <ControlButtonLabel class="text-sm font-bold pt-2"># 2</ControlButtonLabel>
    </ControlButton>
    <ControlButton shape="circle" variant="secondary">
      <ControlButtonLabel class="text-sm font-bold pt-2"># 3</ControlButtonLabel>
    </ControlButton>
    <div class="h-24">
      <Separator orientation="vertical" class="mx-4" />
    </div>
    <ControlButton shape="square" variant="outline" size="lg"> </ControlButton>
  </div>
</template>
