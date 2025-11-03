/**
 * A renderless provider component that supplies media devices information and handles permissions.
 *
 * This component uses the MediaDevices API to list available audio and video input devices.
 * It manages user permissions and provides reactive access to device information.
 *
 * The demos below use different MediaDevicesProvider. In real world usage, you would typically wrap your application or a section of it with the MediaDevicesProvider component.
 *
 * @category devices
 * @demo MediaDevicesProviderDemoSimple
 * @demo MediaDeviceDemoSimple
 * @demo MediaDeviceDemoPresets
 * @demo MediaDeviceDemoMultiple
 */
import type { InjectionKey, Ref } from 'vue';

export { default as MediaDevicesProvider } from './MediaDevicesProvider.vue';
export { default as VideoDevice } from './VideoDevice.vue';
export { default as AudioDevice } from './AudioDevice.vue';

export { type MediaDevicesProviderProps } from './MediaDevicesProvider.vue';
export { type VideoDeviceProps } from './VideoDevice.vue';
export { type AudioDeviceProps } from './AudioDevice.vue';

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
 * Function to check if a stream is active for a given deviceId.
 */
export type MediaDevicesIsActiveStreamFn = (deviceId: string) => boolean;

export const MediaDevicesKey: InjectionKey<Ref<MediaDeviceInfo[]>> = Symbol('MediaDevices');
export const MediaDevicesErrorsKey: InjectionKey<Ref<Error[]>> = Symbol('MediaDevicesErrors');
export const MediaDevicesStartKey: InjectionKey<MediaDevicesStartFn> = Symbol('MediaDevicesStart');
export const MediaDevicesStopKey: InjectionKey<MediaDevicesStopFn> = Symbol('MediaDevicesStop');
export const MediaDevicesStopAllKey: InjectionKey<MediaDevicesStopAllFn> =
  Symbol('MediaDevicesStopAll');

// Export presets for common use cases (work with VideoDevice and AudioDevice components)
export { VideoPresets, AudioPresets, MediaPresets } from './presets';
