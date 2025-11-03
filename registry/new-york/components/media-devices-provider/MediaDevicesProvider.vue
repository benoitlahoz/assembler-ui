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
  /**
   * Enable debug logging to console.
   */
  debug?: boolean;
}

const props = withDefaults(defineProps<MediaDevicesProviderProps>(), {
  type: 'all',
  open: false,
  debug: true, // Enable debug by default to see what's happening
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
 * Debug logging helper.
 */
const log = (...args: any[]) => {
  if (props.debug) console.log('[MediaDevicesProvider]', ...args);
};

/**
 * Start a media stream with the given deviceId and constraints.
 * Returns the cached stream if already active, or creates a new one.
 */
const startStream = async (
  deviceId: string,
  constraints: MediaStreamConstraints
): Promise<MediaStream> => {
  log('startStream called for deviceId:', deviceId);
  log('Constraints:', JSON.stringify(constraints, null, 2));

  // Check if we already have an active stream for this device
  const existingStream = activeStreams.value.get(deviceId);
  if (existingStream?.active) {
    log('Returning cached stream for device:', deviceId);
    return existingStream;
  }

  // Remove inactive stream from cache
  if (existingStream) {
    activeStreams.value.delete(deviceId);
  }

  try {
    log('Creating new stream...');

    // Check if we're in browser environment
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      throw new Error('navigator.mediaDevices not available (SSR or unsupported browser)');
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Verify we got the correct device
    const tracks =
      stream.getVideoTracks().length > 0 ? stream.getVideoTracks() : stream.getAudioTracks();

    if (tracks.length > 0 && tracks[0]) {
      const settings = tracks[0].getSettings();
      log('Stream settings:', settings);

      if (settings.deviceId !== deviceId) {
        log('WARNING: Got different device! Requested:', deviceId, 'Got:', settings.deviceId);
        // Keep the stream anyway since browser chose the closest match
        // User can see the actual resolution in the demo overlay
      }
    }

    activeStreams.value.set(deviceId, stream);
    emit('streamStarted', deviceId, stream);
    log('Stream started successfully');
    return stream;
  } catch (error) {
    log('Error starting stream:', error);
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
    log('Stopping stream for device:', deviceId);
    stream.getTracks().forEach((track) => track.stop());
    activeStreams.value.delete(deviceId);
    emit('streamStopped', deviceId);
  }
};

/**
 * Stop all active media streams.
 */
const stopAllStreams = () => {
  log('Stopping all streams. Active count:', activeStreams.value.size);
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
  log('Updating available devices...');
  devices.value = await navigator.mediaDevices.enumerateDevices();
  emit('devicesUpdated', devices.value);
  log('Devices updated. Total count:', devices.value.length);
};

if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
  useEventListener(navigator.mediaDevices, 'devicechange', updateAvailableDevices);
}

const requestMediaIfNeeded = async () => {
  // Check if we're in browser environment
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    log('navigator.mediaDevices not available (SSR or unsupported browser)');
    return;
  }

  const needsVideo = props.type === 'camera' || props.type === 'all';
  const needsAudio = props.type === 'microphone' || props.type === 'all';

  try {
    log('Requesting media access...', { video: needsVideo, audio: needsAudio });
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
    log('Media access granted and temporary stream stopped');
  } catch (error) {
    log('Error requesting media access:', error);
    errors.value.push(error as Error);
    emit('error', error as Error);
  }
};

const ensurePermissions = () => (props.open ? requestMediaIfNeeded() : Promise.resolve());

/**
 * Provide the media devices and errors to child components.
 */
provide<Ref<MediaDeviceInfo[]>>(MediaDevicesKey, devices);
provide<Ref<Error[]>>(MediaDevicesErrorsKey, errors);

/**
 * Provide the start and stop functions to child components.
 */
provide<MediaDevicesStartFn>(MediaDevicesStartKey, startStream);
provide<MediaDevicesStopFn>(MediaDevicesStopKey, stopStream);
provide<MediaDevicesStopAllFn>(MediaDevicesStopAllKey, stopAllStreams);

watch(
  () => [props.type, props.open],
  async () => {
    try {
      nextTick(async () => {
        if (props.open) {
          log('Props changed, re-initializing...');
          await ensurePermissions();
          await updateAvailableDevices();
        }
      });
    } catch (error) {
      log('Error in watch handler:', error);
      errors.value.push(error as Error);
      emit('error', error as Error);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  log('Component mounted');
  if (props.open) {
    await ensurePermissions();
    // Wait a bit for Firefox to update device info after stopping tracks
    await new Promise((resolve) => setTimeout(resolve, 100));
    await updateAvailableDevices();
  }
});

onBeforeUnmount(() => {
  log('Component unmounting, stopping all streams');
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
  />
</template>

<style scoped></style>
