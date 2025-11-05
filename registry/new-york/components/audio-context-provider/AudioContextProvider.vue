<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useAudioContext } from '~~/registry/new-york/composables/use-audio-context/useAudioContext';

export interface AudioContextProviderProps {
  latencyHint?: AudioContextLatencyCategory;
  sampleRate?: number;
}

const props = withDefaults(defineProps<AudioContextProviderProps>(), {
  latencyHint: 'interactive',
  sampleRate: 44100,
});

const { context, updateContext, errors, state } = useAudioContext({
  latencyHint: props.latencyHint,
  sampleRate: props.sampleRate,
});

const latencyHint = ref(props.latencyHint);
const sampleRate = ref(props.sampleRate);

watch(
  () => [props.latencyHint, props.sampleRate],
  ([newLatencyHint, newSampleRate], [oldLatencyHint, oldSampleRate]) => {
    if (newLatencyHint !== oldLatencyHint && typeof newLatencyHint === 'string') {
      latencyHint.value = newLatencyHint as AudioContextLatencyCategory;
    }
    if (newSampleRate !== oldSampleRate && typeof newSampleRate === 'number') {
      sampleRate.value = newSampleRate;
    }
    updateContext({
      latencyHint: typeof latencyHint.value === 'string' ? latencyHint.value : undefined,
      sampleRate: sampleRate.value,
    });
  }
);

defineExpose({
  context: computed(() => context.value),
  updateContext,
  latencyHint,
  sampleRate,
  errors: computed(() => errors.value),
  state: computed(() => state.value),
});
</script>

<template>
  <slot
    :audio-context="context"
    :update-context="updateContext"
    :latency-hint="latencyHint"
    :sample-rate="sampleRate"
    :errors="errors"
    :state="state"
  />
</template>

<style scoped></style>
