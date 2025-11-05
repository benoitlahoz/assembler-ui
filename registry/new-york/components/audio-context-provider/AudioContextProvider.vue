<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAudioContext } from '~~/registry/new-york/composables/use-audio-context/useAudioContext';

export interface AudioContextProviderProps {
  latencyHint?: AudioContextLatencyCategory;
  sampleRate?: number;
}

const props = withDefaults(defineProps<AudioContextProviderProps>(), {
  latencyHint: 'interactive',
  sampleRate: 44100,
});

const { context, updateContext } = useAudioContext({
  latencyHint: props.latencyHint,
  sampleRate: props.sampleRate,
});

const latencyHint = ref(props.latencyHint);
const sampleRate = ref(props.sampleRate);

watch(
  () => [props.latencyHint, props.sampleRate],
  ([newLatencyHint, newSampleRate]) => {
    if (typeof newLatencyHint === 'string') {
      latencyHint.value = newLatencyHint;
    }

    if (typeof newSampleRate === 'number') {
      sampleRate.value = newSampleRate;
    }

    updateContext({
      latencyHint:
        typeof latencyHint.value === 'string'
          ? (latencyHint.value as AudioContextLatencyCategory)
          : undefined,
      sampleRate: sampleRate.value,
    });
  }
);
</script>

<template>
  <slot
    :audioContext="context"
    :updateContext="updateContext"
    :latencyHint="latencyHint"
    :sampleRate="sampleRate"
  />
</template>

<style scoped></style>
