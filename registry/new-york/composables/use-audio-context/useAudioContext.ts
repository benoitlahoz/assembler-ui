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

  const createContext = () => {
    context.value = new AudioContext({
      latencyHint: latency.value,
      sampleRate: sampleRate.value,
    });
  };

  const updateContext = (options: {
    latencyHint?: AudioContextLatencyCategory;
    sampleRate?: number;
  }) => {
    if (context.value) {
      context.value.close();
      context.value = null;
    }
    createContext();
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
  };
};
