<script setup lang="ts">
import {
  nextTick,
  unref,
  useTemplateRef,
  watch,
  inject,
  type HTMLAttributes,
  type Ref,
  ref,
} from 'vue';
import { type GradientOptions } from 'audiomotion-analyzer';
import { cn } from '@/lib/utils';
import {
  AudioMotionGradientsKey,
  gradientFromElement,
  type AudioMotionGradientDefinition,
} from '.';

export interface AudioMotionGradientProps {
  name: string;
  class?: HTMLAttributes['class'];
  style?: HTMLAttributes['style'];
  gradient?: GradientOptions;
}

const props = defineProps<AudioMotionGradientProps>();

const gradients = inject<Ref<AudioMotionGradientDefinition[]>>(AudioMotionGradientsKey, ref([]));

const gradientRef = useTemplateRef('gradientRef');

const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object' || a === null || b === null) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!bKeys.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
};

const addGradient = () => {
  const el = unref(gradientRef);
  if (el) {
    const gradient = gradientFromElement(el);
    if (gradient) {
      const existingIndex = gradients.value.findIndex((g) => g.name === props.name);
      if (existingIndex !== -1) {
        const newGradient = gradient;
        const existingGradient = gradients.value[existingIndex]!.gradient;

        const isSame = deepEqual(newGradient, existingGradient);
        if (!isSame) {
          gradients.value[existingIndex]!.gradient = newGradient;
        }
      } else {
        gradients.value.push({ name: props.name, gradient });
      }
    }
  }
};

watch(
  () => [props.class, props.style],
  ([newClass, newStyle]) => {
    nextTick(() => {
      addGradient();
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
