<script setup lang="ts">
/**
 * The ScreenShareViewer component displays the shared screen in a video element.
 * It automatically connects to the screen stream provided by ScreenShareProvider.
 */

import { inject, ref, watch, onBeforeUnmount, computed } from 'vue';
import {
  ScreenShareStreamKey,
  ScreenShareStateKey,
  ScreenShareStartKey,
  ScreenShareStopKey,
  type ScreenShareOptions,
} from '.';

export interface ScreenShareViewerProps {
  /**
   * Options to pass when starting screen share.
   */
  options?: ScreenShareOptions;
  /**
   * Whether the video should start playing automatically.
   */
  autoPlay?: boolean;
  /**
   * Whether the video should be muted.
   */
  muted?: boolean;
  /**
   * Whether to show video controls.
   */
  controls?: boolean;
  /**
   * CSS class to apply to the video element.
   */
  class?: string;
  /**
   * Whether to automatically start screen sharing when mounted.
   * If true, will call startShare() on mount if not already sharing.
   */
  autoStart?: boolean;
}

const props = withDefaults(defineProps<ScreenShareViewerProps>(), {
  autoPlay: true,
  muted: true,
  controls: false,
  autoStart: false,
});

const emit = defineEmits<{
  playing: [];
  paused: [];
  error: [error: Event];
}>();

/**
 * Inject screen sharing state and controls from parent ScreenShareProvider.
 */
const screenStream = inject(ScreenShareStreamKey);
const shareState = inject(ScreenShareStateKey);
const startShare = inject(ScreenShareStartKey);
const stopShare = inject(ScreenShareStopKey);

/**
 * Reference to the video element.
 */
const videoRef = ref<HTMLVideoElement | null>(null);

/**
 * Whether the video is currently playing.
 */
const isPlaying = ref(false);

/**
 * Computed property to check if screen sharing is active.
 */
const isSharing = computed(() => shareState?.value === 'active');

/**
 * Update the video element's srcObject when the stream changes.
 */
watch(
  [screenStream, videoRef],
  () => {
    if (videoRef.value && screenStream?.value) {
      videoRef.value.srcObject = screenStream.value;

      // Play the video if autoPlay is enabled
      if (props.autoPlay) {
        videoRef.value.play().catch((error) => {
          console.warn('Auto-play failed:', error);
        });
      }
    } else if (videoRef.value) {
      videoRef.value.srcObject = null;
    }
  },
  { immediate: true }
);

/**
 * Auto-start screen sharing if enabled and not already sharing.
 */
watch(
  [() => props.autoStart, isSharing],
  async ([autoStart, sharing]) => {
    if (autoStart && !sharing && startShare) {
      try {
        await startShare(props.options);
      } catch (error) {
        // Error already handled in provider
      }
    }
  },
  { immediate: true }
);

/**
 * Handle video play event.
 */
const handlePlay = () => {
  isPlaying.value = true;
  emit('playing');
};

/**
 * Handle video pause event.
 */
const handlePause = () => {
  isPlaying.value = false;
  emit('paused');
};

/**
 * Handle video error event.
 */
const handleError = (event: Event) => {
  emit('error', event);
};

/**
 * Clean up on unmount.
 */
onBeforeUnmount(() => {
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
});
</script>

<template>
  <video
    ref="videoRef"
    :class="class"
    :autoplay="autoPlay"
    :muted="muted"
    :controls="controls"
    playsinline
    @play="handlePlay"
    @pause="handlePause"
    @error="handleError"
  >
    Your browser does not support the video element.
  </video>
</template>

<style scoped>
video {
  max-width: 100%;
  height: auto;
}
</style>
