<script setup lang="ts">
/**
 * The MediaDevicesProvider component provides a list of available media devices
 * (cameras, microphones, etc.) to its child components via a scoped slot.
 */

import { provide, watch, onMounted, type Ref } from 'vue';
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
  type: props.type,
  open: props.open,
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
 * Watch for changes in props and update accordingly.
 */
watch(
  () => [props.type, props.open] as const,
  async ([newType, newOpen], oldValue) => {
    const [oldType, oldOpen] = oldValue || [props.type, false];

    // If open changes from false to true, request permissions and update devices
    if (newOpen && !oldOpen) {
      await ensurePermissions();
      await updateAvailableDevices();
    }
    // If open changes from true to false, stop all active streams
    else if (!newOpen && oldOpen) {
      stopAllStreams();
    }
    // If type changes while open is true, handle stream cleanup intelligently
    else if (newOpen && newType !== oldType) {
      // Stop all streams only if going from 'all' to a specific type
      // or switching between incompatible types (camera <-> microphone)
      const shouldStopAll =
        oldType === 'all' || // Going from 'all' to something specific
        (oldType === 'camera' && newType === 'microphone') || // Camera to mic
        (oldType === 'microphone' && newType === 'camera'); // Mic to camera

      if (shouldStopAll) {
        stopAllStreams();
      }

      await ensurePermissions();
      await updateAvailableDevices();
    }
  }
);

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
