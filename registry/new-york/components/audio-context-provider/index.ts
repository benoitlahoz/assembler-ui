/**
 * The component provides a global AudioContext to its child components via slots or provide/inject.
 * Using the component or the useAudioContext composable ensures that only one AudioContext instance is created and shared between all components.
 *
 * @type registry:ui
 * @category audio
 */
import type { InjectionKey, Ref } from 'vue';

export { default as AudioContextProvider } from './AudioContextProvider.vue';

export const AudioContextInjectionKey: InjectionKey<Ref<AudioContext | null>> =
  Symbol('AudioContext');

export const AudioContextUpdateInjectionKey: InjectionKey<
  (options: { latencyHint?: AudioContextLatencyCategory; sampleRate?: number }) => void
> = Symbol('AudioContextUpdate');

export const AudioContextLatencyHintKey: InjectionKey<Ref<AudioContextLatencyCategory>> =
  Symbol('AudioContextLatencyHint');

export const AudioContextSampleRateKey: InjectionKey<Ref<number>> =
  Symbol('AudioContextSampleRate');

export { type AudioContextProviderProps } from './AudioContextProvider.vue';
