---
title: useMediaDevices
description: Composable for managing media devices (cameras, microphones, speakers).
---

  <p class="text-pretty mt-4"><br>This composable provides reactive state and methods for accessing and managing<br>media devices using the MediaDevices API. It handles permissions, device enumeration,<br>and stream management with caching.</p>

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-media-devices.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-media-devices.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-media-devices.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-media-devices.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-media-devices/useMediaDevices.ts"}

```ts [src/composables/use-media-devices/useMediaDevices.ts]
import {
  ref,
  computed,
  onBeforeUnmount,
  watch,
  toRef,
  type MaybeRef,
} from "vue";
import { useEventListener } from "@vueuse/core";

export type MediaDeviceType = "camera" | "microphone" | "all";

export type MediaDeviceKind = "videoinput" | "audioinput" | "audiooutput";

export type MediaPermissionState = "granted" | "denied" | "prompt" | "unknown";

export interface MediaPermissions {
  camera: MediaPermissionState;
  microphone: MediaPermissionState;
}

export type MediaDevicesStartFn = (
  deviceId: string,
  constraints: MediaStreamConstraints,
) => Promise<MediaStream>;

export type MediaDevicesStopFn = (deviceId: string) => void;

export type MediaDevicesStopAllFn = () => void;

export interface UseMediaDevicesOptions {
  type?: MaybeRef<MediaDeviceType>;

  open?: MaybeRef<boolean>;

  debug?: MaybeRef<boolean>;

  debugLoadingDelay?: number;

  onStreamStarted?: (deviceId: string, stream: MediaStream) => void;

  onStreamStopped?: (deviceId: string) => void;

  onAllStreamsStopped?: () => void;

  onDevicesUpdated?: (devices: MediaDeviceInfo[]) => void;

  onError?: (error: Error) => void;
}

export function useMediaDevices(options: UseMediaDevicesOptions = {}) {
  const {
    onStreamStarted,
    onStreamStopped,
    onAllStreamsStopped,
    onDevicesUpdated,
    onError,
  } = options;

  const type = toRef(options.type ?? "all");
  const open = toRef(options.open ?? false);
  const debug = toRef(options.debug ?? false);
  const debugLoadingDelay = options.debugLoadingDelay ?? 300;

  const devices = ref<MediaDeviceInfo[]>([]);

  const errors = ref<Error[]>([]);

  const _isLoadingInternal = ref<boolean>(false);

  let loadingDebounceTimeout: ReturnType<typeof setTimeout> | null = null;

  let loadingStartTime: number | null = null;

  const isLoading = computed(() => {
    return _isLoadingInternal.value;
  });

  const setLoading = (value: boolean) => {
    if (debug.value) {
      if (value === true) {
        _isLoadingInternal.value = true;
        loadingStartTime = Date.now();

        if (loadingDebounceTimeout) {
          clearTimeout(loadingDebounceTimeout);
          loadingDebounceTimeout = null;
        }
      } else {
        const elapsed = loadingStartTime ? Date.now() - loadingStartTime : 0;
        const remainingTime = Math.max(0, debugLoadingDelay - elapsed);

        if (remainingTime > 0) {
          loadingDebounceTimeout = setTimeout(() => {
            _isLoadingInternal.value = false;
            loadingStartTime = null;
          }, remainingTime);
        } else {
          _isLoadingInternal.value = false;
          loadingStartTime = null;
        }
      }
    } else {
      if (loadingDebounceTimeout) {
        clearTimeout(loadingDebounceTimeout);
        loadingDebounceTimeout = null;
      }
      _isLoadingInternal.value = value;
      loadingStartTime = null;
    }
  };

  const permissions = ref<MediaPermissions>({
    camera: "unknown",
    microphone: "unknown",
  });

  const activeStreams = ref<Map<string, MediaStream>>(new Map());

  const filterDevicesByKind = (kind: MediaDeviceKind): MediaDeviceInfo[] => {
    return devices.value.filter((d) => d.kind === kind);
  };

  const cameras = computed(() => filterDevicesByKind("videoinput"));
  const microphones = computed(() => filterDevicesByKind("audioinput"));
  const speakers = computed(() => filterDevicesByKind("audiooutput"));

  const readonlyActiveStreams = computed(
    () => activeStreams.value as ReadonlyMap<string, MediaStream>,
  );

  const checkPermission = async (
    name: "camera" | "microphone",
  ): Promise<MediaPermissionState> => {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      return "unknown";
    }

    try {
      const permissionName = name === "camera" ? "camera" : "microphone";
      const result = await navigator.permissions.query({
        name: permissionName as PermissionName,
      });
      return result.state as MediaPermissionState;
    } catch (error) {
      return "unknown";
    }
  };

  const updatePermissions = async () => {
    permissions.value.camera = await checkPermission("camera");
    permissions.value.microphone = await checkPermission("microphone");
  };

  const startStream: MediaDevicesStartFn = async (
    deviceId: string,
    constraints: MediaStreamConstraints,
  ): Promise<MediaStream> => {
    const existingStream = activeStreams.value.get(deviceId);
    if (existingStream?.active) {
      return existingStream;
    }

    if (existingStream) {
      activeStreams.value.delete(deviceId);
    }

    try {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        throw new Error(
          "navigator.mediaDevices not available (SSR or unsupported browser)",
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      activeStreams.value.set(deviceId, stream);
      onStreamStarted?.(deviceId, stream);
      return stream;
    } catch (error) {
      const err = error as Error;
      errors.value.push(err);
      onError?.(err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  };

  const stopStream: MediaDevicesStopFn = (deviceId: string) => {
    const stream = activeStreams.value.get(deviceId);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      activeStreams.value.delete(deviceId);
      onStreamStopped?.(deviceId);
    }
  };

  const stopAllStreams: MediaDevicesStopAllFn = () => {
    activeStreams.value.forEach((stream, _deviceId) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    activeStreams.value.clear();
    onAllStreamsStopped?.();
  };

  const updateAvailableDevices = async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.enumerateDevices
    ) {
      devices.value = [];
      return;
    }

    setLoading(true);
    try {
      devices.value = await navigator.mediaDevices.enumerateDevices();
      onDevicesUpdated?.(devices.value);
    } catch (error) {
      const err = error as Error;
      errors.value.push(err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  const requestMediaIfNeeded = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return;
    }

    const needsVideo = type.value === "camera" || type.value === "all";
    const needsAudio = type.value === "microphone" || type.value === "all";

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: needsVideo,
        audio: needsAudio,
      });

      stream.getTracks().forEach((track) => track.stop());

      await updatePermissions();
    } catch (error) {
      const err = error as Error;
      errors.value.push(err);
      onError?.(err);

      await updatePermissions();
    }
  };

  const ensurePermissions = async () => {
    if (open.value) {
      await requestMediaIfNeeded();
    }
  };

  const initialize = async () => {
    await updatePermissions();

    if (open.value) {
      await ensurePermissions();

      await new Promise((resolve) => setTimeout(resolve, 100));
      await updateAvailableDevices();
    }
  };

  watch([type, open], async ([newType, newOpen], [oldType, oldOpen]) => {
    if (newOpen && !oldOpen) {
      await ensurePermissions();
      await updateAvailableDevices();
    } else if (!newOpen && oldOpen) {
      stopAllStreams();
    } else if (newOpen && newType !== oldType) {
      const shouldStopAll =
        oldType === "all" ||
        (oldType === "camera" && newType === "microphone") ||
        (oldType === "microphone" && newType === "camera");

      if (shouldStopAll) {
        stopAllStreams();
      }

      await ensurePermissions();
      await updateAvailableDevices();
    }
  });

  if (typeof navigator !== "undefined" && navigator.mediaDevices) {
    useEventListener(
      navigator.mediaDevices,
      "devicechange",
      updateAvailableDevices,
    );
  }

  onBeforeUnmount(() => {
    stopAllStreams();

    if (loadingDebounceTimeout) {
      clearTimeout(loadingDebounceTimeout);
    }
  });

  return {
    devices,

    cameras,

    microphones,

    speakers,

    errors,

    isLoading,

    permissions,

    activeStreams: readonlyActiveStreams,

    startStream,

    stopStream,

    stopAllStreams,

    updateAvailableDevices,

    ensurePermissions,

    initialize,
  };
}
```
:::

## API
::hr-underline
::

  ### Parameters
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `options`{.primary .text-primary} | `UseMediaDevicesOptions` | {} | — |

  ### Returns

The reactive state and methods for media devices.

| Property | Type | Description |
|----------|------|-------------|
| `devices`{.primary .text-primary} | `Ref<MediaDeviceInfo[]>` | List of available media devices. |
| `cameras`{.primary .text-primary} | `ComputedRef<any>` | Filtered list of video input devices (cameras). |
| `microphones`{.primary .text-primary} | `ComputedRef<any>` | Filtered list of audio input devices (microphones). |
| `speakers`{.primary .text-primary} | `ComputedRef<any>` | Filtered list of audio output devices (speakers). |
| `errors`{.primary .text-primary} | `Ref<Error[]>` | List of errors encountered during media operations. |
| `isLoading`{.primary .text-primary} | `ComputedRef<any>` | Indicates if device enumeration is in progress. |
| `permissions`{.primary .text-primary} | `Ref<MediaPermissions>` | Permission states for camera and microphone. |
| `activeStreams`{.primary .text-primary} | `Ref<Map<string, MediaStream>>` | Map of active streams indexed by deviceId (readonly). |
| `startStream`{.primary .text-primary} | `MediaDevicesStartFn` | Function to start a media stream for a specific device. |
| `stopStream`{.primary .text-primary} | `MediaDevicesStopFn` | Function to stop a media stream for a specific device. |
| `stopAllStreams`{.primary .text-primary} | `MediaDevicesStopAllFn` | Function to stop all active media streams. |
| `updateAvailableDevices`{.primary .text-primary} | `any` | Function to update the list of available devices. |
| `ensurePermissions`{.primary .text-primary} | `any` | Function to ensure permissions are requested. |
| `initialize`{.primary .text-primary} | `any` | Function to initialize the composable (call this on mount). |

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `MediaDeviceType`{.primary .text-primary} | `type` | — |
| `MediaDeviceKind`{.primary .text-primary} | `type` | — |
| `MediaPermissionState`{.primary .text-primary} | `type` | — |
| `MediaPermissions`{.primary .text-primary} | `interface` | — |
| `MediaDevicesStartFn`{.primary .text-primary} | `type` | — |
| `MediaDevicesStopFn`{.primary .text-primary} | `type` | — |
| `MediaDevicesStopAllFn`{.primary .text-primary} | `type` | — |
| `UseMediaDevicesOptions`{.primary .text-primary} | `interface` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
