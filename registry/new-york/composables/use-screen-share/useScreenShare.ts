/**
 * Composable for managing screen sharing functionality.
 *
 * This composable provides reactive state and methods for screen sharing
 * using the getDisplayMedia API.
 *
 * @type registry:hook
 * @category devices
 * -- Screen Sharing Hook
 */

import { ref, computed, onBeforeUnmount } from 'vue';

/**
 * Types of surfaces that can be shared.
 */
export type ScreenShareType = 'monitor' | 'window' | 'browser';

/**
 * Current state of screen sharing.
 */
export type ScreenShareState = 'idle' | 'requesting' | 'active' | 'error';

/**
 * Options for configuring screen sharing.
 */
export interface ScreenShareOptions {
  /** Enable or configure video capture */
  video?: boolean | MediaTrackConstraints;
  /** Enable or configure audio capture (system audio) */
  audio?: boolean | MediaTrackConstraints;
  /** Prefer sharing the current browser tab (Chrome/Edge) */
  preferCurrentTab?: boolean;
  /** Allow user to switch shared surface without re-requesting permission */
  surfaceSwitching?: 'include' | 'exclude';
  /** Include or exclude the browser itself from the picker */
  selfBrowserSurface?: 'include' | 'exclude';
  /** Include or exclude system audio in the picker (Chrome/Edge) */
  systemAudio?: 'include' | 'exclude';
}

/**
 * Function to start screen sharing with optional configuration.
 * Returns a Promise that resolves to the MediaStream.
 */
export type ScreenShareStartFn = (options?: ScreenShareOptions) => Promise<MediaStream>;

/**
 * Function to stop the active screen sharing session.
 */
export type ScreenShareStopFn = () => void;

export interface UseScreenShareOptions {
  /**
   * Default options to use when starting screen share.
   */
  defaultOptions?: ScreenShareOptions;
  /**
   * Callback when screen sharing starts successfully.
   */
  onShareStarted?: (stream: MediaStream) => void;
  /**
   * Callback when screen sharing stops.
   */
  onShareStopped?: () => void;
  /**
   * Callback when an error occurs.
   */
  onError?: (error: Error) => void;
}

export function useScreenShare(options: UseScreenShareOptions = {}) {
  const { defaultOptions, onShareStarted, onShareStopped, onError } = options;

  /**
   * The active screen sharing MediaStream.
   */
  const screenStream = ref<MediaStream | null>(null);

  /**
   * Current state of the screen sharing session.
   */
  const shareState = ref<ScreenShareState>('idle');

  /**
   * Type of surface being shared (monitor, window, or browser).
   */
  const shareType = ref<ScreenShareType | null>(null);

  /**
   * Array of errors encountered during screen sharing operations.
   */
  const errors = ref<Error[]>([]);

  /**
   * Computed property indicating if screen sharing is currently active.
   */
  const isSharing = computed(() => shareState.value === 'active');

  /**
   * Detect the type of surface being shared from the MediaStream.
   * This uses the getSettings() API which may not be supported in all browsers.
   */
  const detectShareType = (stream: MediaStream) => {
    try {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;

      const settings = videoTrack.getSettings();
      // displaySurface is part of the Screen Capture API
      if ('displaySurface' in settings) {
        shareType.value = settings.displaySurface as ScreenShareType;
      }
    } catch (error) {
      // getSettings may not be fully supported, ignore errors
      console.warn('Could not detect share type:', error);
    }
  };

  /**
   * Handler called when the screen sharing stream ends.
   * This can happen when the user clicks "Stop sharing" in the browser UI.
   */
  const handleStreamEnded = () => {
    screenStream.value = null;
    shareState.value = 'idle';
    shareType.value = null;
    onShareStopped?.();
  };

  /**
   * Start a screen sharing session with the given options.
   * If a stream is already active, returns the existing stream.
   */
  const startScreenShare: ScreenShareStartFn = async (options = {}) => {
    // Return existing stream if already active
    if (screenStream.value?.active) {
      return screenStream.value;
    }

    // Check if we're in a browser environment
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      const error = new Error('getDisplayMedia not available (SSR or unsupported browser)');
      errors.value.push(error);
      onError?.(error);
      throw error;
    }

    shareState.value = 'requesting';

    try {
      // Merge default options with provided options
      const mergedOptions: ScreenShareOptions = {
        ...defaultOptions,
        ...options,
      };

      // Build the constraints for getDisplayMedia
      const constraints: DisplayMediaStreamOptions = {
        video: mergedOptions.video ?? true,
        audio: mergedOptions.audio ?? false,
      };

      // Add Chrome/Edge specific options (they'll be ignored in other browsers)
      if (mergedOptions.preferCurrentTab !== undefined) {
        (constraints as any).preferCurrentTab = mergedOptions.preferCurrentTab;
      }
      if (mergedOptions.surfaceSwitching !== undefined) {
        (constraints as any).surfaceSwitching = mergedOptions.surfaceSwitching;
      }
      if (mergedOptions.selfBrowserSurface !== undefined) {
        (constraints as any).selfBrowserSurface = mergedOptions.selfBrowserSurface;
      }
      // Chrome requires systemAudio to be set to show the audio option in the picker
      if (mergedOptions.systemAudio !== undefined) {
        (constraints as any).systemAudio = mergedOptions.systemAudio;
      } else if (mergedOptions.audio) {
        // If audio is requested but systemAudio is not specified, default to 'include'
        (constraints as any).systemAudio = 'include';
      }

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      screenStream.value = stream;
      shareState.value = 'active';

      // Try to detect what type of surface is being shared
      detectShareType(stream);

      // Listen for when the user stops sharing via the browser UI
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', handleStreamEnded);
      }

      onShareStarted?.(stream);
      return stream;
    } catch (error) {
      shareState.value = 'error';
      const err = error as Error;
      errors.value.push(err);
      onError?.(err);
      throw error;
    }
  };

  /**
   * Stop the active screen sharing session.
   * Stops all tracks in the stream and cleans up state.
   */
  const stopScreenShare: ScreenShareStopFn = () => {
    if (screenStream.value) {
      // Remove event listener before stopping
      const videoTrack = screenStream.value.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.removeEventListener('ended', handleStreamEnded);
      }

      // Stop all tracks
      screenStream.value.getTracks().forEach((track) => track.stop());
      screenStream.value = null;
      shareState.value = 'idle';
      shareType.value = null;
      onShareStopped?.();
    }
  };

  /**
   * Clean up on unmount: stop any active screen sharing.
   */
  onBeforeUnmount(() => {
    stopScreenShare();
  });

  return {
    // State
    screenStream,
    shareState,
    shareType,
    errors,
    isSharing,
    // Methods
    startScreenShare,
    stopScreenShare,
  };
}
