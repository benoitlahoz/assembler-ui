/**
 * Composable for managing media devices (cameras, microphones, speakers).
 *
 * This composable provides reactive state and methods for accessing and managing
 * media devices using the MediaDevices API. It handles permissions, device enumeration,
 * and stream management with caching.
 *
 * @type registry:hook
 * @category devices
 * -- Media Devices Hook
 */

import { ref, computed, onBeforeUnmount, watch, toRef, type MaybeRef } from 'vue';
import { useEventListener } from '@vueuse/core';

// TEST
import { foo } from './foo';
import { bar } from './bar';

/**
 * Supported media device types.
 */
export type MediaDeviceType = 'camera' | 'microphone' | 'all';

/**
 * Media device kinds as defined by the MediaDevices API.
 */
export type MediaDeviceKind = 'videoinput' | 'audioinput' | 'audiooutput';

/**
 * Permission states for media devices.
 */
export type MediaPermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

/**
 * Permission status for different media types.
 */
export interface MediaPermissions {
  camera: MediaPermissionState;
  microphone: MediaPermissionState;
}

/**
 * Function to start a media stream with given deviceId and constraints.
 */
export type MediaDevicesStartFn = (
  deviceId: string,
  constraints: MediaStreamConstraints
) => Promise<MediaStream>;

/**
 * Function to stop a media stream for a given deviceId.
 */
export type MediaDevicesStopFn = (deviceId: string) => void;

/**
 * Function to stop all active media streams.
 */
export type MediaDevicesStopAllFn = () => void;

/**
 * Options for configuring media devices.
 */
export interface UseMediaDevicesOptions {
  /**
   * The type of media devices to request.
   * Can be a static value or a reactive ref.
   * @default 'all'
   */
  type?: MaybeRef<MediaDeviceType>;
  /**
   * Whether to automatically request media permissions and devices on initialization.
   * Can be a static value or a reactive ref.
   * @default false
   */
  open?: MaybeRef<boolean>;
  /**
   * Callback when a stream is started successfully.
   */
  onStreamStarted?: (deviceId: string, stream: MediaStream) => void;
  /**
   * Callback when a stream is stopped.
   */
  onStreamStopped?: (deviceId: string) => void;
  /**
   * Callback when all streams are stopped.
   */
  onAllStreamsStopped?: () => void;
  /**
   * Callback when devices list is updated.
   */
  onDevicesUpdated?: (devices: MediaDeviceInfo[]) => void;
  /**
   * Callback when an error occurs.
   */
  onError?: (error: Error) => void;
}

export function useMediaDevices(options: UseMediaDevicesOptions = {}) {
  const { onStreamStarted, onStreamStopped, onAllStreamsStopped, onDevicesUpdated, onError } =
    options;

  // Convert type and open to refs for reactivity
  const type = toRef(options.type ?? 'all');
  const open = toRef(options.open ?? false);

  /**
   * List of available media devices.
   */
  const devices = ref<MediaDeviceInfo[]>([]);

  /**
   * Array of errors encountered during media operations.
   */
  const errors = ref<Error[]>([]);

  /**
   * Indicates if device enumeration is in progress.
   */
  const isLoading = ref<boolean>(false);

  /**
   * Permission states for camera and microphone.
   */
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
   * Readonly version of active streams for safe exposure.
   */
  const readonlyActiveStreams = computed(
    () => activeStreams.value as ReadonlyMap<string, MediaStream>
  );

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
  const startStream: MediaDevicesStartFn = async (
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
      onStreamStarted?.(deviceId, stream);
      return stream;
    } catch (error) {
      const err = error as Error;
      errors.value.push(err);
      onError?.(err);
      throw error;
    }
  };

  /**
   * Stop a media stream for the given deviceId.
   */
  const stopStream: MediaDevicesStopFn = (deviceId: string) => {
    const stream = activeStreams.value.get(deviceId);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      activeStreams.value.delete(deviceId);
      onStreamStopped?.(deviceId);
    }
  };

  /**
   * Stop all active media streams.
   */
  const stopAllStreams: MediaDevicesStopAllFn = () => {
    activeStreams.value.forEach((stream, _deviceId) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    activeStreams.value.clear();
    onAllStreamsStopped?.();
  };

  /**
   * Update the list of available media devices.
   */
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
      onDevicesUpdated?.(devices.value);
    } catch (error) {
      const err = error as Error;
      errors.value.push(err);
      onError?.(err);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Request media permissions based on the configured type.
   * This ensures device labels are available, especially in Firefox.
   */
  const requestMediaIfNeeded = async () => {
    // Check if we're in browser environment
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return;
    }

    const needsVideo = type.value === 'camera' || type.value === 'all';
    const needsAudio = type.value === 'microphone' || type.value === 'all';

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
      const err = error as Error;
      errors.value.push(err);
      onError?.(err);

      // Update permissions even on error (to reflect denied state)
      await updatePermissions();
    }
  };

  /**
   * Ensure permissions are requested if open is true.
   */
  const ensurePermissions = async () => {
    if (open.value) {
      await requestMediaIfNeeded();
    }
  };

  /**
   * Initialize the composable.
   */
  const initialize = async () => {
    // Check initial permissions state
    await updatePermissions();

    if (open.value) {
      await ensurePermissions();
      // Wait a bit for Firefox to update device info after stopping tracks
      await new Promise((resolve) => setTimeout(resolve, 100));
      await updateAvailableDevices();
    }
  };

  /**
   * Watch for changes in type and open props to handle state updates.
   */
  watch([type, open], async ([newType, newOpen], [oldType, oldOpen]) => {
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
  });

  /**
   * Listen for device changes if in browser environment.
   */
  if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
    useEventListener(navigator.mediaDevices, 'devicechange', updateAvailableDevices);
  }

  /**
   * Clean up on unmount: stop all active streams.
   */
  onBeforeUnmount(() => {
    stopAllStreams();
  });

  /**
   * The reactive state and methods for media devices.
   */
  return {
    /** List of available media devices. */
    devices,
    /** Filtered list of video input devices (cameras). */
    cameras,
    /** Filtered list of audio input devices (microphones). */
    microphones,
    /** Filtered list of audio output devices (speakers). */
    speakers,
    /** List of errors encountered during media operations. */
    errors,
    /** Indicates if device enumeration is in progress. */
    isLoading,
    /** Permission states for camera and microphone. */
    permissions,
    /** Map of active streams indexed by deviceId (readonly). */
    activeStreams: readonlyActiveStreams,
    /** Function to start a media stream for a specific device. */
    startStream,
    /** Function to stop a media stream for a specific device. */
    stopStream,
    /** Function to stop all active media streams. */
    stopAllStreams,
    /** Function to update the list of available devices. */
    updateAvailableDevices,
    /** Function to ensure permissions are requested. */
    ensurePermissions,
    /** Function to initialize the composable (call this on mount). */
    initialize,
  };
}
