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
import { ref, computed, onBeforeUnmount } from "vue";
import { useEventListener } from "@vueuse/core";

import { foo } from "./foo";
import { bar } from "./bar";

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
  type?: MediaDeviceType;

  open?: boolean;

  onStreamStarted?: (deviceId: string, stream: MediaStream) => void;

  onStreamStopped?: (deviceId: string) => void;

  onAllStreamsStopped?: () => void;

  onDevicesUpdated?: (devices: MediaDeviceInfo[]) => void;

  onError?: (error: Error) => void;
}

export function useMediaDevices(options: UseMediaDevicesOptions = {}) {
  const {
    type = "all",
    open = false,
    onStreamStarted,
    onStreamStopped,
    onAllStreamsStopped,
    onDevicesUpdated,
    onError,
  } = options;

  const devices = ref<MediaDeviceInfo[]>([]);

  const errors = ref<Error[]>([]);

  const isLoading = ref<boolean>(false);

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

  const roActiveStreams = computed(
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
      throw error;
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

  const requestMediaIfNeeded = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return;
    }

    const needsVideo = type === "camera" || type === "all";
    const needsAudio = type === "microphone" || type === "all";

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
    if (open) {
      await requestMediaIfNeeded();
    }
  };

  const initialize = async () => {
    await updatePermissions();

    if (open) {
      await ensurePermissions();

      await new Promise((resolve) => setTimeout(resolve, 100));
      await updateAvailableDevices();
    }
  };

  if (typeof navigator !== "undefined" && navigator.mediaDevices) {
    useEventListener(
      navigator.mediaDevices,
      "devicechange",
      updateAvailableDevices,
    );
  }

  onBeforeUnmount(() => {
    stopAllStreams();
  });

  return {
    devices,

    cameras,

    microphones,

    speakers,

    errors,

    isLoading,

    permissions,

    activeStreams: roActiveStreams,

    startStream,

    stopStream,

    stopAllStreams,

    updateAvailableDevices,

    ensurePermissions,

    initialize,
  };
}
```

```ts [src/composables/use-media-devices/foo.ts]
import { bar } from "./bar";

export const foo = "bar";
```

```ts [src/composables/use-media-devices/bar/index.ts]
export const bar = "foo";
```

```ts [src/composables/use-media-devices/useMediaDevices.ts]
import { ref, computed, onBeforeUnmount } from "vue";
import { useEventListener } from "@vueuse/core";

import { foo } from "./foo";
import { bar } from "./bar";

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
  type?: MediaDeviceType;

  open?: boolean;

  onStreamStarted?: (deviceId: string, stream: MediaStream) => void;

  onStreamStopped?: (deviceId: string) => void;

  onAllStreamsStopped?: () => void;

  onDevicesUpdated?: (devices: MediaDeviceInfo[]) => void;

  onError?: (error: Error) => void;
}

export function useMediaDevices(options: UseMediaDevicesOptions = {}) {
  const {
    type = "all",
    open = false,
    onStreamStarted,
    onStreamStopped,
    onAllStreamsStopped,
    onDevicesUpdated,
    onError,
  } = options;

  const devices = ref<MediaDeviceInfo[]>([]);

  const errors = ref<Error[]>([]);

  const isLoading = ref<boolean>(false);

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

  const roActiveStreams = computed(
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
      throw error;
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

  const requestMediaIfNeeded = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      return;
    }

    const needsVideo = type === "camera" || type === "all";
    const needsAudio = type === "microphone" || type === "all";

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
    if (open) {
      await requestMediaIfNeeded();
    }
  };

  const initialize = async () => {
    await updatePermissions();

    if (open) {
      await ensurePermissions();

      await new Promise((resolve) => setTimeout(resolve, 100));
      await updateAvailableDevices();
    }
  };

  if (typeof navigator !== "undefined" && navigator.mediaDevices) {
    useEventListener(
      navigator.mediaDevices,
      "devicechange",
      updateAvailableDevices,
    );
  }

  onBeforeUnmount(() => {
    stopAllStreams();
  });

  return {
    devices,

    cameras,

    microphones,

    speakers,

    errors,

    isLoading,

    permissions,

    activeStreams: roActiveStreams,

    startStream,

    stopStream,

    stopAllStreams,

    updateAvailableDevices,

    ensurePermissions,

    initialize,
  };
}
```

```ts [src/composables/use-media-devices/foo.ts]
import { bar } from "./bar";

export const foo = "bar";
```

```ts [src/composables/use-media-devices/bar/index.ts]
export const bar = "foo";
```
:::

## useMediaDevices
::hr-underline
::

Composable for managing media devices (cameras, microphones, speakers).

This composable provides reactive state and methods for accessing and managing
media devices using the MediaDevices API. It handles permissions, device enumeration,
and stream management with caching.

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
| `isLoading`{.primary .text-primary} | `Ref<boolean>` | Indicates if device enumeration is in progress. |
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

## foo
::hr-underline
::

---

## index
::hr-underline
::

---

::tip
You can copy and adapt this template for any composable documentation.
::
