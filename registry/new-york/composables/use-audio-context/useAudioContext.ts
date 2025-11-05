/**
 * @type registry:hook
 * @category audio
 */

import { onMounted, ref } from 'vue';

let context: AudioContext | null = null;

export interface UseAudioContextOptions {
  latencyHint?: AudioContextLatencyCategory;
  sampleRate?: number;
}

export const useAudioContext = (options: UseAudioContextOptions) => {
  const latency = ref(options.latencyHint || 'interactive');
  const sampleRate = ref(options.sampleRate || 44100);

  const createContext = () => {
    context = new AudioContext({
      latencyHint: latency.value,
      sampleRate: sampleRate.value,
    });
  };

  const updateContext = (options: {
    latencyHint?: AudioContextLatencyCategory;
    sampleRate?: number;
  }) => {
    if (context) {
      context.close();
      context = null;
    }
    createContext();
  };

  if (!context) {
    createContext();
  }

  onMounted(() => {
    if (context && context.state === 'suspended') {
      context.resume();
      return;
    }

    if (!context) {
      createContext();
    }
  });

  return {
    context,
    updateContext,
  };
};
