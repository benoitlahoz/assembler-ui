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
  type AudioMotionGradientDefinition,
  type AudioMotionGradientProperties,
} from '.';
import { useTailwindClassParser } from '~~/registry/new-york/composables/use-css-parser/useCssParser';

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

const gradientFromClasses = (classes: string = ''): AudioMotionGradientProperties | null => {
  const { getTailwindBaseCssValues, parseGradient } = useTailwindClassParser();

  const el = document.createElement('div');
  el.className = classes;
  el.style.position = 'absolute';
  el.style.visibility = 'hidden';
  el.style.zIndex = '-9999';
  document.body.appendChild(el);

  const computedClass = getTailwindBaseCssValues(el, ['background-image']);
  const computedGradient =
    computedClass['background-image'] && computedClass['background-image'] !== 'none'
      ? parseGradient(computedClass['background-image'])
      : null;

  let gradient: AudioMotionGradientProperties | null = null;

  if (computedGradient) {
    gradient = { bgColor: 'rgba(0, 0, 0, 0, 0)', dir: 'v', colorStops: [] };
    gradient.dir = (
      computedGradient.direction.includes('bottom') || computedGradient.direction.includes('top')
        ? 'v'
        : 'h'
    ) as 'h' | 'v';
    gradient.colorStops = computedGradient.stops;
  }

  document.body.removeChild(el);
  return gradient;
};

const gradientFromElement = (el: HTMLElement | null): AudioMotionGradientProperties | null => {
  if (!el) return null;

  const classes = el?.className || '';
  const styles = el?.getAttribute('style');

  if (styles) {
    const { parseGradient } = useTailwindClassParser();
    const result = parseGradient(styles);
    if (result) {
      const gradient = {
        bgColor: 'rgba(0, 0, 0, 0, 0)',
        dir: 'v' as 'h' | 'v',
        colorStops: [] as any[],
      };
      gradient.dir =
        result.direction.includes('bottom') || result.direction.includes('top')
          ? ('v' as const)
          : ('h' as const);
      gradient.colorStops = result.stops;
      return gradient;
    }
  }

  return gradientFromClasses(classes);
};

const addIfNotExisting = (gradientDefinition: AudioMotionGradientDefinition) => {
  const existingIndex = gradients.value.findIndex((g) => g.name === gradientDefinition.name);
  if (existingIndex !== -1) {
    const newGradient = gradientDefinition.gradient;
    const existingGradient = gradients.value[existingIndex]!.gradient;

    const isSame = deepEqual(newGradient, existingGradient);
    if (!isSame) {
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
