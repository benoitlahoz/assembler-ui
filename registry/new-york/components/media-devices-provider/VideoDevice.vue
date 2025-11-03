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
    console.error('VideoDevice: navigator.mediaDevices not available (SSR or unsupported browser)');
    return;
  }

  console.log('VideoDevice: Starting video stream for deviceId:', props.deviceId);
  if (isActive.value) {
    console.log('VideoDevice: Already active, returning');
    return;
  }

  try {
    error.value = null;
    const constraints = buildConstraints();
    console.log('VideoDevice: Built constraints:', JSON.stringify(constraints, null, 2));

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
    console.error('VideoDevice: Error starting stream:', errorObj);

    if (errorObj.name === 'OverconstrainedError') {
      const constraint = (errorObj as any).constraint;
      console.error('VideoDevice: Overconstrained on:', constraint);
      console.error('VideoDevice: Constraints used:', JSON.stringify(buildConstraints(), null, 2));
    }

    error.value = errorObj;
    emit('error', errorObj);
  }
};

/**
 * Stop the video stream.
 */
const stop = () => {
  console.log(
    'VideoDevice: Stopping stream. isActive:',
    isActive.value,
    'currentDeviceId:',
    currentDeviceId.value
  );
  if (!isActive.value) return;

  const deviceIdToStop = currentDeviceId.value;
  console.log('VideoDevice: Stopping deviceId:', deviceIdToStop);

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
  console.log('VideoDevice: Switching device from', currentDeviceId.value, 'to', props.deviceId);

  stream.value = null;
  isActive.value = false;

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
    if (!isActive.value) return;
    const deviceIdChanged = newVals[0] !== oldVals?.[0];

    if (deviceIdChanged) {
      console.log('VideoDevice: deviceId changed, switching device');
      await switchDevice();
    } else {
      console.log('VideoDevice: Constraints changed, restarting stream');
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
