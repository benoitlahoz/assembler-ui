<script setup lang="ts">
/**
 * The ScreenShareProvider component manages screen sharing functionality
 * and exposes the screen stream and control functions to its child components
 * via scoped slots and provide/inject.
 */

import { provide, watch, nextTick, type Ref } from 'vue';
import { useScreenShare } from '~~/registry/new-york/composables/use-screen-share/useScreenShare';
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
 * Use the screen share composable with event handlers.
 */
const {
  screenStream,
  shareState,
  shareType,
  errors,
  isSharing,
  startScreenShare,
  stopScreenShare,
} = useScreenShare({
  defaultOptions: props.defaultOptions,
  onShareStarted: (stream) => emit('shareStarted', stream),
  onShareStopped: () => emit('shareStopped'),
  onError: (error) => emit('error', error),
});

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
        // Error already handled in useScreenShare
      }
    }
  },
  { immediate: true }
);
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
