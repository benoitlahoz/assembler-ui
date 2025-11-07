<script setup lang="ts">
import { nextTick, unref, useTemplateRef, watch, inject, type HTMLAttributes } from 'vue';
import { type GradientOptions } from 'audiomotion-analyzer';
import { cn } from '@/lib/utils';
import { AudioMotionGradientsKey, gradientFromElement } from '.';

export interface AudioMotionGradientDef {
  name: string;
  gradient: GradientOptions;
}

export interface AudioMotionGradientProps {
  name: string;
  class?: HTMLAttributes['class'];
  style?: HTMLAttributes['style'];
  gradient?: GradientOptions;
}

const props = defineProps<AudioMotionGradientProps>();

const gradients = inject<AudioMotionGradientDef[]>(AudioMotionGradientsKey, []);

const gradientRef = useTemplateRef('gradientRef');

watch(
  () => [props.name, props.class, props.style],
  ([newName, newClass, newStyle]) => {
    nextTick(() => {
      const el = unref(gradientRef);
      console.log('Gradient element:', el);
      if (el && (newClass || newStyle)) {
        const gradient = gradientFromElement(el);
        console.log('Applying gradient:', gradient);
        console.log('Gradient:', { name: newName, gradient });
      }
    });
  },
  { immediate: true }
);
</script>

<template>
  <div
    ref="gradientRef"
    data-slot="audio-motion-gradient"
    :class="cn('hidden', props.class)"
    :style="props.style"
  ></div>
</template>
