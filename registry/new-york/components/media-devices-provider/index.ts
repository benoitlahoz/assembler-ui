/**
 * A renderless provider component that supplies media devices information and handles permissions.
 *
 * This component uses the MediaDevices API to list available audio and video input devices.
 * It manages user permissions and provides reactive access to device information.
 *
 * The demos below use different MediaDevicesProvider. In real world usage, you would typically wrap your application or a section of it with the MediaDevicesProvider component.
 *
 * @type registry:ui
 * @category devices
 * @demo MediaDevicesProviderDemoSimple
 * @demo MediaDeviceDemoSimple
 * -- Stream Cache
 * -- Select a camera from the list. The provider caches streams to avoid reopening the same device.
 * @demo MediaDeviceDemoPresets
 * -- Presets
 * -- Select a camera and quality preset. The provider caches streams efficiently when switching presets.
 * @demo MediaDeviceDemoMultiple
 * -- Multiple Viewers
 * -- Open two devices simultaneously. If you select the same device for both, the provider will reuse the cached stream instead of opening it twice.
 */
import type { InjectionKey, Ref } from 'vue';

export { default as MediaDevicesProvider } from './MediaDevicesProvider.vue';
export { default as VideoDevice } from './VideoDevice.vue';
export { default as AudioDevice } from './AudioDevice.vue';

export { type MediaDevicesProviderProps } from './MediaDevicesProvider.vue';
export { type VideoDeviceProps } from './VideoDevice.vue';
export { type AudioDeviceProps } from './AudioDevice.vue';

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
 * Filtered device lists by kind.
 */
export interface FilteredDevices {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}

/**
 * Constraints specifically for camera/video devices.
 * Ensures video is required when requesting camera access.
 */
export type CameraConstraints = MediaStreamConstraints & {
  video: MediaTrackConstraints | boolean;
  audio?: MediaTrackConstraints | boolean;
};

/**
 * Constraints specifically for microphone/audio devices.
 * Ensures audio is required when requesting microphone access.
 */
export type MicrophoneConstraints = MediaStreamConstraints & {
  audio: MediaTrackConstraints | boolean;
  video?: MediaTrackConstraints | boolean;
};

/**
 * Union type for all possible device-specific constraints.
 */
export type DeviceConstraints = CameraConstraints | MicrophoneConstraints | MediaStreamConstraints;

/**
 * Specific error types for media device operations.
 */
export type MediaDeviceErrorName =
  | 'NotFoundError'
  | 'NotAllowedError'
  | 'NotReadableError'
  | 'OverconstrainedError'
  | 'TypeError'
  | 'AbortError'
  | 'SecurityError';

/**
 * Extended error interface with specific media device error information.
 */
export interface MediaDeviceError extends Error {
  name: MediaDeviceErrorName;
  constraint?: string;
}

/**
 * Slot props exposed by MediaDevicesProvider to child components.
 */
export interface MediaDevicesProviderSlotProps {
  /** All available media devices */
  devices: MediaDeviceInfo[];
  /** Filtered list of video input devices (cameras) */
  cameras: MediaDeviceInfo[];
  /** Filtered list of audio input devices (microphones) */
  microphones: MediaDeviceInfo[];
  /** Filtered list of audio output devices (speakers) */
  speakers: MediaDeviceInfo[];
  /** List of errors encountered during media operations */
  errors: Error[];
  /** Indicates if device enumeration is in progress */
  isLoading: boolean;
  /** Permission states for camera and microphone */
  permissions: MediaPermissions;
  /** Map of active streams indexed by deviceId (readonly) */
  activeStreams: ReadonlyMap<string, MediaStream>;
  /** Function to start a media stream for a specific device */
  start: MediaDevicesStartFn;
  /** Function to stop a media stream for a specific device */
  stop: MediaDevicesStopFn;
  /** Function to stop all active media streams */
  stopAll: MediaDevicesStopAllFn;
  /** Number of currently cached/active streams */
  cachedStreamsCount: number;
}

/**
 * Function to start a media stream with given deviceId and constraints.
 * Accepts generic MediaStreamConstraints for flexibility.
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
 * Function to check if a stream is active for a given deviceId.
 */
export type MediaDevicesIsActiveStreamFn = (deviceId: string) => boolean;

export const MediaDevicesKey: InjectionKey<Ref<MediaDeviceInfo[]>> = Symbol('MediaDevices');
export const MediaDevicesErrorsKey: InjectionKey<Ref<Error[]>> = Symbol('MediaDevicesErrors');
export const MediaDevicesLoadingKey: InjectionKey<Ref<boolean>> = Symbol('MediaDevicesLoading');
export const MediaDevicesPermissionsKey: InjectionKey<Ref<MediaPermissions>> =
  Symbol('MediaDevicesPermissions');
export const MediaDevicesActiveStreamsKey: InjectionKey<
  Readonly<Ref<ReadonlyMap<string, MediaStream>>>
> = Symbol('MediaDevicesActiveStreams');
export const MediaDevicesStartKey: InjectionKey<MediaDevicesStartFn> = Symbol('MediaDevicesStart');
export const MediaDevicesStopKey: InjectionKey<MediaDevicesStopFn> = Symbol('MediaDevicesStop');
export const MediaDevicesStopAllKey: InjectionKey<MediaDevicesStopAllFn> =
  Symbol('MediaDevicesStopAll');

// Export presets for common use cases (work with VideoDevice and AudioDevice components)
export { VideoPresets, AudioPresets, MediaPresets } from './presets';
