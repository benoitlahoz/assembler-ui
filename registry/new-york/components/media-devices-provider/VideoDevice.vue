<script setup lang="ts">
/**
 * VideoDevice component - Manages a video stream with constraints.
 * This component builds video constraints and uses the MediaDevicesProvider's
 * start/stop functions to manage streams with device caching.
 */

import { ref, watch, onMounted, onBeforeUnmount, computed, inject } from 'vue';
import { MediaDevicesStartKey, MediaDevicesStopKey } from '.';
import type { MediaDevicesStartFn, MediaDevicesStopFn } from '.';

export interface VideoDeviceProps {
  /**
   * Whether to automatically start the media stream on mount.
   */
  autoStart?: boolean;
  /**
   * The exact device ID to use for the video stream (REQUIRED).
   */
  deviceId: string;

  // Video constraints

  /**
   * Video resolution width (in pixels).
   */
  width?: number | { min?: number; max?: number; ideal?: number };
  /**
   * Video resolution height (in pixels).
   */
  height?: number | { min?: number; max?: number; ideal?: number };
  /**
   * Video framerate (frames per second).
   */
  frameRate?: number | { min?: number; max?: number; ideal?: number };
  /**
   * Camera facing mode.
   */
  facingMode?: 'user' | 'environment' | 'left' | 'right';
  /**
   * Video aspect ratio.
   */
  aspectRatio?: number | { min?: number; max?: number; ideal?: number };

  /**
   * Custom MediaStreamConstraints to override simplified props.
   */
  constraints?: MediaStreamConstraints;
}

const props = withDefaults(defineProps<VideoDeviceProps>(), {
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

const stream = ref<MediaStream | null>(null);
const error = ref<Error | null>(null);
const isActive = ref(false);
const currentDeviceId = ref<string | undefined>(undefined);

/**
 * Build the constraints object for getUserMedia.
 */
const buildConstraints = (): MediaStreamConstraints => {
  // If custom constraints are provided, use them directly
  if (props.constraints) {
    return props.constraints;
  }

  const videoConstraints: MediaTrackConstraints = {
    deviceId: { exact: props.deviceId },
    width: props.width
      ? typeof props.width === 'number'
        ? { ideal: props.width }
        : props.width
      : undefined,
    height: props.height
      ? typeof props.height === 'number'
        ? { ideal: props.height }
        : props.height
      : undefined,
    aspectRatio: props.aspectRatio
      ? typeof props.aspectRatio === 'number'
        ? { ideal: props.aspectRatio }
        : props.aspectRatio
      : undefined,
    frameRate: props.frameRate
      ? typeof props.frameRate === 'number'
        ? { ideal: props.frameRate }
        : props.frameRate
      : undefined,
    facingMode: props.facingMode ? { ideal: props.facingMode } : undefined,
  };

  return {
    video: videoConstraints,
    audio: false,
  };
};

/**
 * Start the video stream.
 */
const start = async () => {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return;
  }

  if (isActive.value) {
    return;
  }

  try {
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
  }
};

/**
 * Stop the video stream.
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

  // Emit null stream to clear any video elements
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
    props.width,
    props.height,
    props.frameRate,
    props.facingMode,
    props.aspectRatio,
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
  error: computed(() => error.value),
});
</script>

<template>
  <slot :stream="stream" :is-active="isActive" :error="error" :start="start" :stop="stop" />
</template>

<style scoped></style>
