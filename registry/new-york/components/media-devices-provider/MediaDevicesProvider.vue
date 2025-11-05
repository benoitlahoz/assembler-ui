<script setup lang="ts">
/**
 * The MediaDevicesProvider component provides a list of available media devices
 * (cameras, microphones, etc.) to its child components via provide/inject and a scoped slot.
 */

import { provide, onMounted, toRef, type Ref } from 'vue';
import { useMediaDevices } from '~~/registry/new-york/composables/use-media-devices/useMediaDevices';
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
  type MediaPermissions,
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
  /**
   * Enable debug mode to debounce isLoading state changes.
   * @default false
   */
  debug?: boolean;
  /**
   * Debounce delay in milliseconds for isLoading when debug mode is enabled.
   * @default 300
   */
  debugLoadingDelay?: number;
}

const props = withDefaults(defineProps<MediaDevicesProviderProps>(), {
  type: 'all',
  open: false,
  debug: false,
  debugLoadingDelay: 300,
});

const emit = defineEmits<{
  /**
   * Emitted when a media stream is started for a device.
   */
  streamStarted: [deviceId: string, stream: MediaStream];
  /**
   * Emitted when a media stream is stopped for a device.
   */
  streamStopped: [deviceId: string];
  /**
   * Emitted when all media streams are stopped.
   */
  allStreamsStopped: [];
  /**
   * Emitted when the list of available media devices is updated.
   */
  devicesUpdated: [devices: MediaDeviceInfo[]];
  /**
   * Emitted when an error occurs during media operations.
   */
  error: [error: Error];
}>();

/**
 * Use the media devices composable with event handlers.
 */
const {
  devices,
  cameras,
  microphones,
  speakers,
  errors,
  isLoading,
  permissions,
  activeStreams,
  startStream,
  stopStream,
  stopAllStreams,
  updateAvailableDevices,
  ensurePermissions,
  initialize,
} = useMediaDevices({
  type: toRef(props, 'type'),
  open: toRef(props, 'open'),
  debug: toRef(props, 'debug'),
  debugLoadingDelay: props.debugLoadingDelay,
  onStreamStarted: (deviceId, stream) => emit('streamStarted', deviceId, stream),
  onStreamStopped: (deviceId) => emit('streamStopped', deviceId),
  onAllStreamsStopped: () => emit('allStreamsStopped'),
  onDevicesUpdated: (devices) => emit('devicesUpdated', devices),
  onError: (error) => emit('error', error),
});

/**
 * Provide media devices state and controls to child components.
 */

/** Available media devices. */
provide<Ref<MediaDeviceInfo[]>>(MediaDevicesKey, devices);

/** Errors encountered during media operations. */
provide<Ref<Error[]>>(MediaDevicesErrorsKey, errors);

/** Loading state. */
provide<Ref<boolean>>(MediaDevicesLoadingKey, isLoading);

/** Permissions state. */
provide<Ref<MediaPermissions>>(MediaDevicesPermissionsKey, permissions);

/** Active streams (readonly). */
provide(MediaDevicesActiveStreamsKey, activeStreams);

/** Start a media stream for a specific device. */
provide<MediaDevicesStartFn>(MediaDevicesStartKey, startStream);

/** Stop a media stream for a specific device. */
provide<MediaDevicesStopFn>(MediaDevicesStopKey, stopStream);

/** Stop all active media streams. */
provide<MediaDevicesStopAllFn>(MediaDevicesStopAllKey, stopAllStreams);

/**
 * Initialize on mount.
 */
onMounted(async () => {
  await initialize();
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
