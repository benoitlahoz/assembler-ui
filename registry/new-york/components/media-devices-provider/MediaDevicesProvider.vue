<script setup lang="ts">
/**
 * The MediaDevicesProvider component provides a list of available media devices
 * (cameras, microphones, etc.) to its child components via a scoped slot.
 */

import { nextTick, onMounted, onBeforeUnmount, ref, watch, provide, computed, type Ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import {
  MediaDevicesKey,
  MediaDevicesErrorsKey,
  MediaDevicesStartKey,
  MediaDevicesStopKey,
  MediaDevicesStopAllKey,
  type MediaDevicesStartFn,
  type MediaDevicesStopFn,
  type MediaDevicesStopAllFn,
} from '.';

export interface MediaDevicesProviderProps {
  /**
   * The type of media devices to request.
   */
  type?: 'camera' | 'microphone' | 'all';
  /**
   * Whether to automatically request media permissions and devices on mount.
   */
  open?: boolean;
}

const props = withDefaults(defineProps<MediaDevicesProviderProps>(), {
  type: 'all',
  open: false,
});

const emit = defineEmits<{
  streamStarted: [deviceId: string, stream: MediaStream];
  streamStopped: [deviceId: string];
  allStreamsStopped: [];
  devicesUpdated: [devices: MediaDeviceInfo[]];
  error: [error: Error];
}>();

const devices = ref<MediaDeviceInfo[]>([]);
const errors = ref<Error[]>([]);

/**
 * Cache of active media streams indexed by deviceId.
 */
const activeStreams = ref<Map<string, MediaStream>>(new Map());

/**
 * Computed properties for filtered device lists.
 */
const cameras = computed(() => devices.value.filter((d) => d.kind === 'videoinput'));
const microphones = computed(() => devices.value.filter((d) => d.kind === 'audioinput'));
const speakers = computed(() => devices.value.filter((d) => d.kind === 'audiooutput'));

/**
 * Start a media stream with the given deviceId and constraints.
 * Returns the cached stream if already active, or creates a new one.
 */
const startStream = async (
  deviceId: string,
  constraints: MediaStreamConstraints
): Promise<MediaStream> => {
  // Check if we already have an active stream for this device
  const existingStream = activeStreams.value.get(deviceId);
  if (existingStream?.active) {
    return existingStream;
  }

  // Remove inactive stream from cache
  if (existingStream) {
    activeStreams.value.delete(deviceId);
  }

  try {
    // Check if we're in browser environment
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      throw new Error('navigator.mediaDevices not available (SSR or unsupported browser)');
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    activeStreams.value.set(deviceId, stream);
    emit('streamStarted', deviceId, stream);
    return stream;
  } catch (error) {
    errors.value.push(error as Error);
    emit('error', error as Error);
    throw error;
  }
};

/**
 * Stop a media stream for the given deviceId.
 */
const stopStream = (deviceId: string) => {
  const stream = activeStreams.value.get(deviceId);
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    activeStreams.value.delete(deviceId);
    emit('streamStopped', deviceId);
  }
};

/**
 * Stop all active media streams.
 */
const stopAllStreams = () => {
  activeStreams.value.forEach((stream, deviceId) => {
    stream.getTracks().forEach((track) => track.stop());
  });
  activeStreams.value.clear();
  emit('allStreamsStopped');
};

const updateAvailableDevices = async () => {
  if (
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.enumerateDevices
  ) {
    devices.value = [];
    return;
  }
  devices.value = await navigator.mediaDevices.enumerateDevices();
  emit('devicesUpdated', devices.value);
};

if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
  useEventListener(navigator.mediaDevices, 'devicechange', updateAvailableDevices);
}

const requestMediaIfNeeded = async () => {
  // Check if we're in browser environment
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return;
  }

  const needsVideo = props.type === 'camera' || props.type === 'all';
  const needsAudio = props.type === 'microphone' || props.type === 'all';

  try {
    // Always request getUserMedia to ensure device labels are available
    // This is especially important for Firefox which doesn't populate labels
    // without an active media stream, even if permission was previously granted
    const stream = await navigator.mediaDevices.getUserMedia({
      video: needsVideo,
      audio: needsAudio,
    });
    // Stop all tracks immediately as we only needed to trigger the permission
    // and ensure device labels are populated
    stream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    errors.value.push(error as Error);
    emit('error', error as Error);
  }
};

const ensurePermissions = () => (props.open ? requestMediaIfNeeded() : Promise.resolve());

/**
 * Provide the list of available media devices to child components.
 */
provide<Ref<MediaDeviceInfo[]>>(MediaDevicesKey, devices);

/**
 * Provide the list of errors encountered during media operations to child components.
 */
provide<Ref<Error[]>>(MediaDevicesErrorsKey, errors);

/**
 * Provide the function to start a media stream for a specific device to child components.
 */
provide<MediaDevicesStartFn>(MediaDevicesStartKey, startStream);

/**
 * Provide the function to stop a media stream for a specific device to child components.
 */
provide<MediaDevicesStopFn>(MediaDevicesStopKey, stopStream);

/**
 * Provide the function to stop all active media streams to child components.
 */
provide<MediaDevicesStopAllFn>(MediaDevicesStopAllKey, stopAllStreams);

watch(
  () => [props.type, props.open],
  async () => {
    try {
      nextTick(async () => {
        if (props.open) {
          await ensurePermissions();
          await updateAvailableDevices();
        }
      });
    } catch (error) {
      errors.value.push(error as Error);
      emit('error', error as Error);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (props.open) {
    await ensurePermissions();
    // Wait a bit for Firefox to update device info after stopping tracks
    await new Promise((resolve) => setTimeout(resolve, 100));
    await updateAvailableDevices();
  }
});

onBeforeUnmount(() => {
  // Stop all active streams when component is unmounted
  stopAllStreams();
});
</script>

<template>
  <!-- Slot for child components to access media devices, errors, and stream management -->
  <slot
    :devices="devices"
    :errors="errors"
    :cameras="cameras"
    :microphones="microphones"
    :speakers="speakers"
    :start="startStream"
    :stop="stopStream"
    :stop-all="stopAllStreams"
    :cached-streams-count="activeStreams.size"
  />
</template>

<style scoped></style>
