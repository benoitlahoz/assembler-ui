<script setup lang="ts">
import {
  nextTick,
  unref,
  useTemplateRef,
  watch,
  inject,
  ref,
  type HTMLAttributes,
  type Ref,
} from 'vue';
import { cn } from '@/lib/utils';
import {
  AudioMotionGradientsKey,
  gradientFromElement,
  type AudioMotionGradientDefinition,
  type AudioMotionGradientProperties,
} from '.';

// TODO: Handle colorMode changes event outside of nuxt.
export interface AudioMotionGradientProps {
  name: string;
  class?: HTMLAttributes['class'];
  style?: HTMLAttributes['style'];
  gradient?: AudioMotionGradientProperties | null;
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

const addIfNotExisting = (gradientDefinition: AudioMotionGradientDefinition) => {
  const existingIndex = gradients.value.findIndex((g) => g.name === gradientDefinition.name);
  console.log('Got existing gradient index:', existingIndex);
  if (existingIndex !== -1) {
    const newGradient = gradientDefinition.gradient;
    const existingGradient = gradients.value[existingIndex]!.gradient;

    const isSame = deepEqual(newGradient, existingGradient);
    if (!isSame) {
      console.warn(
        'Updating existing gradient:',
        gradientDefinition.name,
        gradientDefinition.gradient
      );
      gradients.value[existingIndex]!.gradient = newGradient;
    }
  } else {
    gradients.value.push({ name: props.name, gradient: gradientDefinition.gradient });
  }
};

const addGradient = () => {
  const propsGradient: AudioMotionGradientProperties | null | undefined = props.gradient;
  if (propsGradient) {
    addIfNotExisting({
      name: props.name,
      gradient: propsGradient,
    });
    return;
  }

  const el = unref(gradientRef);
  if (el) {
    const gradientProperties: AudioMotionGradientProperties | null = gradientFromElement(el);
    if (gradientProperties) {
      addIfNotExisting({
        name: props.name,
        gradient: gradientProperties,
      });
    }
  }
};

watch(
  () => [props.gradient, props.class, props.style],
  () => {
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
