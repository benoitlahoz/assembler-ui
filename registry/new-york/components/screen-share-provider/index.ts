/**
 * A renderless provider component that manages screen sharing functionality.
 *
 * This component uses the getDisplayMedia API to enable screen, window, or tab sharing.
 * It manages the sharing state and provides reactive access to the screen stream.
 *
 * Unlike MediaDevicesProvider, screen sharing doesn't enumerate available sources.
 * Instead, the browser displays a picker for the user to select what to share.
 *
 * @type registry:component
 * @category devices
 * @demo ScreenShareProviderDemoSimple
 * @demo ScreenShareProviderDemoAdvanced
 * -- Advanced Options
 */
import type { InjectionKey, Ref } from 'vue';
import type {
  ScreenShareType,
  ScreenShareState,
  ScreenShareStartFn,
  ScreenShareStopFn,
} from '~~/registry/new-york/composables/use-screen-share/useScreenShare';

export { default as ScreenShareProvider } from './ScreenShareProvider.vue';
export { default as ScreenShareViewer } from './ScreenShareViewer.vue';

export { type ScreenShareProviderProps } from './ScreenShareProvider.vue';
export { type ScreenShareViewerProps } from './ScreenShareViewer.vue';

// Re-export types from the composable
export type {
  ScreenShareType,
  ScreenShareState,
  ScreenShareOptions,
  ScreenShareStartFn,
  ScreenShareStopFn,
} from '~~/registry/new-york/composables/use-screen-share/useScreenShare';

/**
 * Slot props exposed by ScreenShareProvider to child components.
 */
export interface ScreenShareProviderSlotProps {
  /** The active screen sharing stream, or null if not sharing */
  screenStream: MediaStream | null;
  /** Current state of screen sharing */
  shareState: ScreenShareState;
  /** Type of surface being shared (if detectable) */
  shareType: ScreenShareType | null;
  /** List of errors encountered during screen sharing operations */
  errors: Error[];
  /** Whether screen sharing is currently active */
  isSharing: boolean;
  /** Function to start screen sharing */
  startShare: ScreenShareStartFn;
  /** Function to stop screen sharing */
  stopShare: ScreenShareStopFn;
}

/**
 * Injection keys for providing/injecting screen share functionality.
 */
export const ScreenShareStreamKey: InjectionKey<Ref<MediaStream | null>> =
  Symbol('ScreenShareStream');

export const ScreenShareStateKey: InjectionKey<Ref<ScreenShareState>> = Symbol('ScreenShareState');

export const ScreenShareTypeKey: InjectionKey<Ref<ScreenShareType | null>> =
  Symbol('ScreenShareType');

export const ScreenShareErrorsKey: InjectionKey<Ref<Error[]>> = Symbol('ScreenShareErrors');

export const ScreenShareStartKey: InjectionKey<ScreenShareStartFn> = Symbol('ScreenShareStart');

export const ScreenShareStopKey: InjectionKey<ScreenShareStopFn> = Symbol('ScreenShareStop');
