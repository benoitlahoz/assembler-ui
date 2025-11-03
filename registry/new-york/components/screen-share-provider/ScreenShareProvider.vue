<script setup lang="ts">
/**
 * The ScreenShareProvider component manages screen sharing functionality
 * and exposes the screen stream and control functions to its child components
 * via scoped slots and provide/inject.
 */

import { ref, computed, provide, onBeforeUnmount, watch, nextTick, type Ref } from 'vue';
import {
  ScreenShareStreamKey,
  ScreenShareStateKey,
  ScreenShareTypeKey,
  ScreenShareErrorsKey,
  ScreenShareStartKey,
  ScreenShareStopKey,
  type ScreenShareOptions,
  type ScreenShareState,
  type ScreenShareType,
  type ScreenShareStartFn,
  type ScreenShareStopFn,
} from '.';

export interface ScreenShareProviderProps {
  /**
   * Automatically start screen sharing on mount.
   */
  autoStart?: boolean;
  /**
   * Default options to use when starting screen share.
   */
  defaultOptions?: ScreenShareOptions;
}

const props = withDefaults(defineProps<ScreenShareProviderProps>(), {
  autoStart: false,
});

const emit = defineEmits<{
  shareStarted: [stream: MediaStream];
  shareStopped: [];
  error: [error: Error];
}>();

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
  emit('shareStopped');
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
    emit('error', error);
    throw error;
  }

  shareState.value = 'requesting';

  try {
    // Merge default options with provided options
    const mergedOptions: ScreenShareOptions = {
      ...props.defaultOptions,
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
    if (mergedOptions.systemAudio !== undefined) {
      (constraints as any).systemAudio = mergedOptions.systemAudio;
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

    emit('shareStarted', stream);
    return stream;
  } catch (error) {
    shareState.value = 'error';
    const err = error as Error;
    errors.value.push(err);
    emit('error', err);
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
    emit('shareStopped');
  }
};

/**
 * Provide screen sharing state and controls to child components.
 */
provide<Ref<MediaStream | null>>(ScreenShareStreamKey, screenStream);
provide<Ref<ScreenShareState>>(ScreenShareStateKey, shareState);
provide<Ref<ScreenShareType | null>>(ScreenShareTypeKey, shareType);
provide<Ref<Error[]>>(ScreenShareErrorsKey, errors);
provide<ScreenShareStartFn>(ScreenShareStartKey, startScreenShare);
provide<ScreenShareStopFn>(ScreenShareStopKey, stopScreenShare);

/**
 * Auto-start screen sharing if enabled.
 */
watch(
  () => props.autoStart,
  async (autoStart) => {
    if (autoStart) {
      await nextTick();
      try {
        await startScreenShare(props.defaultOptions);
      } catch (error) {
        // Error already handled in startScreenShare
      }
    }
  },
  { immediate: true }
);

/**
 * Clean up on unmount: stop any active screen sharing.
 */
onBeforeUnmount(() => {
  stopScreenShare();
});
</script>

<template>
  <!-- Slot for child components to access screen sharing state and controls -->
  <slot
    :screen-stream="screenStream"
    :share-state="shareState"
    :share-type="shareType"
    :errors="errors"
    :is-sharing="isSharing"
    :start-share="startScreenShare"
    :stop-share="stopScreenShare"
  />
</template>

<style scoped></style>
