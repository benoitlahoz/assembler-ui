/**
 * A very simple composable that enforces the use of one and only one reactive AudioContext instance.
 *
 * @type registry:hook
 * @category audio
 */

import { onMounted, ref } from 'vue';

const context = ref<AudioContext | null>(null);

export interface UseAudioContextOptions {
  latencyHint?: AudioContextLatencyCategory;
  sampleRate?: number;
}

export const useAudioContext = (options: UseAudioContextOptions) => {
  const latency = ref(options.latencyHint || 'interactive');
  const sampleRate = ref(options.sampleRate || 44100);
  const errors = ref<Error[]>([]);
  const state = ref<'suspended' | 'running' | 'closed' | 'interrupted'>('suspended');

  const createContext = () => {
    try {
      context.value = new AudioContext({
        latencyHint: latency.value,
        sampleRate: sampleRate.value,
      });
      state.value = context.value.state;
      context.value.onstatechange = () => {
        state.value = context.value?.state ?? 'closed';
      };
    } catch (err) {
      errors.value.push(err as Error);
      context.value = null;
      state.value = 'closed';
    }
  };

  const updateContext = (options: {
    latencyHint?: AudioContextLatencyCategory;
    sampleRate?: number;
  }) => {
    try {
      if (context.value) {
        context.value.close();
        context.value = null;
        state.value = 'closed';
      }
      if (options.latencyHint) latency.value = options.latencyHint;
      if (options.sampleRate) sampleRate.value = options.sampleRate;
      createContext();
    } catch (err) {
      errors.value.push(err as Error);
    }
  };

  if (!context.value) {
    createContext();
  }

  onMounted(() => {
    if (context.value && context.value.state === 'suspended') {
      context.value.resume();
      return;
    }
    if (!context.value) {
      createContext();
    }
  });

  return {
    context,
    updateContext,
    errors,
    state,
  };
};
