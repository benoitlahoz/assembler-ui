<script setup lang="ts">
/**
 * AudioDevice component - Manages an audio stream with constraints.
 * This component builds audio constraints and uses the MediaDevicesProvider's
 * start/stop functions to manage streams with device caching.
 */

import { ref, watch, onMounted, onBeforeUnmount, computed, inject, type Ref } from 'vue';
import {
  MediaDevicesStartKey,
  MediaDevicesStopKey,
  MediaDevicesLoadingKey,
  MediaDevicesActiveStreamsKey,
} from '.';
import type { MediaDevicesStartFn, MediaDevicesStopFn } from '.';

export interface AudioDeviceProps {
  /**
   * Whether to automatically start the media stream on mount.
   */
  autoStart?: boolean;
  /**
   * The exact device ID to use for the audio stream (REQUIRED).
   */
  deviceId: string;

  // Audio constraints

  /**
   * Enable echo cancellation for audio input.
   */
  echoCancellation?: boolean;
  /**
   * Enable noise suppression for audio input.
   */
  noiseSuppression?: boolean;
  /**
   * Enable automatic gain control for audio input.
   */
  autoGainControl?: boolean;
  /**
   * Audio sample rate (in Hz).
   */
  sampleRate?: number | { min?: number; max?: number; ideal?: number };
  /**
   * Audio sample size (in bits).
   */
  sampleSize?: number | { min?: number; max?: number; ideal?: number };

  /**
   * Custom MediaStreamConstraints to override simplified props.
   */
  constraints?: MediaStreamConstraints;
}

const props = withDefaults(defineProps<AudioDeviceProps>(), {
  autoStart: false,
});

const emit = defineEmits<{
  stream: [stream: MediaStream | null];
  error: [error: Error];
  started: [];
  stopped: [];
}>();

/**
 * Inject start and stop functions from MediaDevicesProvider.
 */
const providerStart = inject<MediaDevicesStartFn>(MediaDevicesStartKey);
const providerStop = inject<MediaDevicesStopFn>(MediaDevicesStopKey);
const providerIsLoading = inject<Ref<boolean>>(MediaDevicesLoadingKey, ref(false));
const providerActiveStreams = inject<Readonly<Ref<ReadonlyMap<string, MediaStream>>>>(
  MediaDevicesActiveStreamsKey,
  computed(() => new Map() as ReadonlyMap<string, MediaStream>)
);

const stream = ref<MediaStream | null>(null);
const error = ref<Error | null>(null);
const isActive = ref(false);
const isLoading = ref(false);
const currentDeviceId = ref<string | undefined>(undefined);

/**
 * Build the constraints object for getUserMedia.
 */
const buildConstraints = (): MediaStreamConstraints => {
  // If custom constraints are provided, use them directly
  if (props.constraints) {
    return props.constraints;
  }

  const audioConstraints: MediaTrackConstraints = {
    deviceId: { exact: props.deviceId },
    echoCancellation: props.echoCancellation,
    noiseSuppression: props.noiseSuppression,
    autoGainControl: props.autoGainControl,
    sampleRate: props.sampleRate
      ? typeof props.sampleRate === 'number'
        ? { ideal: props.sampleRate }
        : props.sampleRate
      : undefined,
    sampleSize: props.sampleSize
      ? typeof props.sampleSize === 'number'
        ? { ideal: props.sampleSize }
        : props.sampleSize
      : undefined,
  };

  return {
    video: false,
    audio: audioConstraints,
  };
};

/**
 * Start the audio stream.
 */
const start = async () => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return;
  }

  if (isActive.value || isLoading.value) {
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    const constraints = buildConstraints();

    if (providerStart) {
      stream.value = await providerStart(props.deviceId, constraints);
    } else {
      stream.value = await navigator.mediaDevices.getUserMedia(constraints);
    }

    currentDeviceId.value = props.deviceId;
    isActive.value = true;
    emit('stream', stream.value);
    emit('started');
  } catch (err) {
    const errorObj = err as Error;
    error.value = errorObj;
    emit('error', errorObj);
  } finally {
    isLoading.value = false;
  }
};

/**
 * Stop the audio stream.
 */
const stop = () => {
  if (!isActive.value) return;

  const deviceIdToStop = currentDeviceId.value;

  if (deviceIdToStop && providerStop) {
    providerStop(deviceIdToStop);
  } else if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
  }

  stream.value = null;
  isActive.value = false;
  currentDeviceId.value = undefined;
  emit('stream', null);
  emit('stopped');
};

/**
 * Switch to a different device without stopping the current one (it stays in cache)
 */
const switchDevice = async () => {
  const previousDeviceId = currentDeviceId.value;

  // Reset state before switching
  stream.value = null;
  isActive.value = false;
  currentDeviceId.value = undefined;

  // Emit null stream to clear any audio elements
  emit('stream', null);

  // Start the new device
  await start();
};

/**
 * Watch for changes to deviceId or constraints and restart the stream
 */
watch(
  () => [
    props.deviceId,
    props.echoCancellation,
    props.noiseSuppression,
    props.autoGainControl,
    props.sampleRate,
    props.sampleSize,
    props.constraints,
  ],
  async (newVals, oldVals) => {
    const deviceIdChanged = newVals[0] !== oldVals?.[0];

    if (deviceIdChanged) {
      // If device changed, switch to the new device
      if (isActive.value) {
        // If currently active, switch without stopping (keeps cache)
        await switchDevice();
      } else if (props.autoStart) {
        // If not active but autoStart is enabled, start the new device
        await start();
      }
    } else if (isActive.value) {
      // If only constraints changed and stream is active, restart with new constraints
      stop();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await start();
    }
  }
);

onMounted(() => {
  if (props.autoStart) {
    start();
  }
});

onBeforeUnmount(() => {
  stop();
});

defineExpose({
  start,
  stop,
  stream: computed(() => stream.value),
  isActive: computed(() => isActive.value),
  isLoading: computed(() => isLoading.value),
  providerIsLoading: computed(() => providerIsLoading.value),
  providerActiveStreams: computed(() => providerActiveStreams.value),
  error: computed(() => error.value),
});
</script>

<template>
  <slot
    :stream="stream"
    :is-active="isActive"
    :is-loading="isLoading"
    :provider-is-loading="providerIsLoading"
    :provider-active-streams="providerActiveStreams"
    :error="error"
    :start="start"
    :stop="stop"
  />
</template>

<style scoped></style>
