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
  MediaDevicesLoadingKey,
  MediaDevicesPermissionsKey,
  MediaDevicesActiveStreamsKey,
  MediaDevicesStartKey,
  MediaDevicesStopKey,
  MediaDevicesStopAllKey,
  type MediaDevicesStartFn,
  type MediaDevicesStopFn,
  type MediaDevicesStopAllFn,
  type MediaDeviceType,
  type MediaDeviceKind,
  type MediaPermissions,
  type MediaPermissionState,
} from '.';

export interface MediaDevicesProviderProps {
  /**
   * The type of media devices to request.
   */
  type?: MediaDeviceType;
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
const isLoading = ref<boolean>(false);
const permissions = ref<MediaPermissions>({
  camera: 'unknown',
  microphone: 'unknown',
});

/**
 * Cache of active media streams indexed by deviceId.
 */
const activeStreams = ref<Map<string, MediaStream>>(new Map());

/**
 * Helper function to filter devices by kind with proper typing.
 */
const filterDevicesByKind = (kind: MediaDeviceKind): MediaDeviceInfo[] => {
  return devices.value.filter((d) => d.kind === kind);
};

/**
 * Computed properties for filtered device lists.
 */
const cameras = computed(() => filterDevicesByKind('videoinput'));
const microphones = computed(() => filterDevicesByKind('audioinput'));
const speakers = computed(() => filterDevicesByKind('audiooutput'));

/**
 * Readonly version of active streams for safe exposure to child components.
 */
const roActiveStreams = computed(() => activeStreams.value as ReadonlyMap<string, MediaStream>);

/**
 * Check permission state for a specific media type.
 */
const checkPermission = async (name: 'camera' | 'microphone'): Promise<MediaPermissionState> => {
  if (typeof navigator === 'undefined' || !navigator.permissions) {
    return 'unknown';
  }

  try {
    const permissionName = name === 'camera' ? 'camera' : 'microphone';
    const result = await navigator.permissions.query({ name: permissionName as PermissionName });
    return result.state as MediaPermissionState;
  } catch (error) {
    // Permissions API might not be supported or permission name not recognized
    return 'unknown';
  }
};

/**
 * Update all permission states.
 */
const updatePermissions = async () => {
  permissions.value.camera = await checkPermission('camera');
  permissions.value.microphone = await checkPermission('microphone');
};

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

  isLoading.value = true;
  try {
    devices.value = await navigator.mediaDevices.enumerateDevices();
    emit('devicesUpdated', devices.value);
  } finally {
    isLoading.value = false;
  }
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

    // Update permissions after successful request
    await updatePermissions();
  } catch (error) {
    errors.value.push(error as Error);
    emit('error', error as Error);

    // Update permissions even on error (to reflect denied state)
    await updatePermissions();
  }
};

const ensurePermissions = () => (props.open ? requestMediaIfNeeded() : Promise.resolve());

/** Available media devices. */
provide<Ref<MediaDeviceInfo[]>>(MediaDevicesKey, devices);

/** Errors encountered during media operations. */
provide<Ref<Error[]>>(MediaDevicesErrorsKey, errors);

/** Loading state. */
provide<Ref<boolean>>(MediaDevicesLoadingKey, isLoading);

/** Permissions state. */
provide<Ref<MediaPermissions>>(MediaDevicesPermissionsKey, permissions);

/** Active streams (readonly). */
provide(MediaDevicesActiveStreamsKey, roActiveStreams);

/** Start a media stream for a specific device. */
provide<MediaDevicesStartFn>(MediaDevicesStartKey, startStream);

/** Stop a media stream for a specific device. */
provide<MediaDevicesStopFn>(MediaDevicesStopKey, stopStream);

/** Stop all active media streams. */
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
  // Check initial permissions state
  await updatePermissions();

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
    :is-loading="isLoading"
    :permissions="permissions"
    :active-streams="activeStreams"
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
