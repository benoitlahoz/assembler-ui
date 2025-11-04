---
title: useScreenShare
description: Composable for managing screen sharing functionality.
---

  <p class="text-pretty mt-4"><br>This composable provides reactive state and methods for screen sharing<br>using the getDisplayMedia API.</p>

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-screen-share.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-screen-share.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-screen-share.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-screen-share.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-screen-share/useScreenShare.ts"}

```ts [src/composables/use-screen-share/useScreenShare.ts]
import { ref, computed, onBeforeUnmount } from "vue";

export type ScreenShareType = "monitor" | "window" | "browser";

export type ScreenShareState = "idle" | "requesting" | "active" | "error";

export interface ScreenShareOptions {
  video?: boolean | MediaTrackConstraints;

  audio?: boolean | MediaTrackConstraints;

  preferCurrentTab?: boolean;

  surfaceSwitching?: "include" | "exclude";

  selfBrowserSurface?: "include" | "exclude";

  systemAudio?: "include" | "exclude";
}

export type ScreenShareStartFn = (
  options?: ScreenShareOptions,
) => Promise<MediaStream>;

export type ScreenShareStopFn = () => void;

export interface UseScreenShareOptions {
  defaultOptions?: ScreenShareOptions;

  onShareStarted?: (stream: MediaStream) => void;

  onShareStopped?: () => void;

  onError?: (error: Error) => void;
}

export function useScreenShare(options: UseScreenShareOptions = {}) {
  const { defaultOptions, onShareStarted, onShareStopped, onError } = options;

  const screenStream = ref<MediaStream | null>(null);

  const shareState = ref<ScreenShareState>("idle");

  const shareType = ref<ScreenShareType | null>(null);

  const errors = ref<Error[]>([]);

  const isSharing = computed(() => shareState.value === "active");

  const detectShareType = (stream: MediaStream) => {
    try {
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) return;

      const settings = videoTrack.getSettings();

      if ("displaySurface" in settings) {
        shareType.value = settings.displaySurface as ScreenShareType;
      }
    } catch (error) {
      console.warn("Could not detect share type:", error);
    }
  };

  const handleStreamEnded = () => {
    screenStream.value = null;
    shareState.value = "idle";
    shareType.value = null;
    onShareStopped?.();
  };

  const startScreenShare: ScreenShareStartFn = async (options = {}) => {
    if (screenStream.value?.active) {
      return screenStream.value;
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getDisplayMedia
    ) {
      const error = new Error(
        "getDisplayMedia not available (SSR or unsupported browser)",
      );
      errors.value.push(error);
      onError?.(error);
      throw error;
    }

    shareState.value = "requesting";

    try {
      const mergedOptions: ScreenShareOptions = {
        ...defaultOptions,
        ...options,
      };

      const constraints: DisplayMediaStreamOptions = {
        video: mergedOptions.video ?? true,
        audio: mergedOptions.audio ?? false,
      };

      if (mergedOptions.preferCurrentTab !== undefined) {
        (constraints as any).preferCurrentTab = mergedOptions.preferCurrentTab;
      }
      if (mergedOptions.surfaceSwitching !== undefined) {
        (constraints as any).surfaceSwitching = mergedOptions.surfaceSwitching;
      }
      if (mergedOptions.selfBrowserSurface !== undefined) {
        (constraints as any).selfBrowserSurface =
          mergedOptions.selfBrowserSurface;
      }

      if (mergedOptions.systemAudio !== undefined) {
        (constraints as any).systemAudio = mergedOptions.systemAudio;
      } else if (mergedOptions.audio) {
        (constraints as any).systemAudio = "include";
      }

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);

      screenStream.value = stream;
      shareState.value = "active";

      detectShareType(stream);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener("ended", handleStreamEnded);
      }

      onShareStarted?.(stream);
      return stream;
    } catch (error) {
      shareState.value = "error";
      const err = error as Error;
      errors.value.push(err);
      onError?.(err);
      throw error;
    }
  };

  const stopScreenShare: ScreenShareStopFn = () => {
    if (screenStream.value) {
      const videoTrack = screenStream.value.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.removeEventListener("ended", handleStreamEnded);
      }

      screenStream.value.getTracks().forEach((track) => track.stop());
      screenStream.value = null;
      shareState.value = "idle";
      shareType.value = null;
      onShareStopped?.();
    }
  };

  onBeforeUnmount(() => {
    stopScreenShare();
  });

  return {
    screenStream,

    shareState,

    shareType,

    errors,

    isSharing,

    startScreenShare,

    stopScreenShare,
  };
}
```
:::

