---
title: MediaDevicesProvider
description: A renderless provider component that supplies media devices information and handles permissions.
---

  <p class="text-pretty mt-4"><br>This component uses the MediaDevices API to list available audio and video input devices.<br>It manages user permissions and provides reactive access to device information.<br><br>The demos below use different MediaDevicesProvider. In real world usage, you would typically wrap your application or a section of it with the MediaDevicesProvider component.</p>

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <media-devices-provider-demo-simple />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaDevicesProvider } from "@/components/ui/media-devices-provider";

const open = ref(false);
</script>
<template>
  <div class="h-128 max-h-128 overflow-hidden flex flex-col">
    <Button :disabled="open" class="m-4 mb-2" @click="open = true"
      >Open Devices</Button
    >
    <MediaDevicesProvider :open="open" v-slot="{ devices, errors }">
      <div
        class="overflow-y-auto flex-1 min-h-0 select-none m-4 rounded border border-muted"
      >
        <table class="w-full">
          <thead
            class="sticky top-0 bg-default z-10 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-border"
          >
            <tr class="text-sm">
              <th class="text-left py-2 bg-default w-32 pl-4">Type</th>
              <th class="text-left py-2 bg-default">Label</th>
              <th class="text-left py-2 bg-default">Device ID</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="device in devices"
              :key="device.deviceId"
              class="border-b border-muted hover:bg-accent"
            >
              <td class="py-2 w-32 pl-4">
                <Badge
                  :variant="
                    device.kind === 'videoinput'
                      ? 'default'
                      : device.kind === 'audioinput'
                        ? 'secondary'
                        : 'destructive'
                  "
                >
                  {{ device.kind }}
                </Badge>
              </td>
              <td class="py-2 text-sm">
                {{ device.label || "Without label" }}
              </td>
              <td class="py-2 font-mono text-xs text-gray-500">
                {{ device.deviceId.substring(0, 20) }}...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div
        v-if="errors && errors.length > 0"
        class="mt-4 mx-4 p-4 rounded border border-destructive bg-destructive/10 text-destructive mb-4"
      >
        <p class="font-bold">Errors:</p>
        <ul>
          <li v-for="(error, index) in errors" :key="index" class="text-sm">
            {{ error }}
          </li>
        </ul>
      </div>
    </MediaDevicesProvider>
  </div>
</template>
```
  :::
::

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/media-devices-provider.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/media-devices-provider/index.ts"}

```ts [src/components/ui/media-devices-provider/index.ts]
import type { InjectionKey, Ref } from "vue";

export { default as MediaDevicesProvider } from "./MediaDevicesProvider.vue";
export { default as VideoDevice } from "./VideoDevice.vue";
export { default as AudioDevice } from "./AudioDevice.vue";

export { type MediaDevicesProviderProps } from "./MediaDevicesProvider.vue";
export { type VideoDeviceProps } from "./VideoDevice.vue";
export { type AudioDeviceProps } from "./AudioDevice.vue";

export type MediaDeviceType = "camera" | "microphone" | "all";

export type MediaDeviceKind = "videoinput" | "audioinput" | "audiooutput";

export type MediaPermissionState = "granted" | "denied" | "prompt" | "unknown";

export interface MediaPermissions {
  camera: MediaPermissionState;
  microphone: MediaPermissionState;
}

export interface FilteredDevices {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}

export type CameraConstraints = MediaStreamConstraints & {
  video: MediaTrackConstraints | boolean;
  audio?: MediaTrackConstraints | boolean;
};

export type MicrophoneConstraints = MediaStreamConstraints & {
  audio: MediaTrackConstraints | boolean;
  video?: MediaTrackConstraints | boolean;
};

export type DeviceConstraints =
  | CameraConstraints
  | MicrophoneConstraints
  | MediaStreamConstraints;

export type MediaDeviceErrorName =
  | "NotFoundError"
  | "NotAllowedError"
  | "NotReadableError"
  | "OverconstrainedError"
  | "TypeError"
  | "AbortError"
  | "SecurityError";

export interface MediaDeviceError extends Error {
  name: MediaDeviceErrorName;
  constraint?: string;
}

export interface MediaDevicesProviderSlotProps {
  devices: MediaDeviceInfo[];

  cameras: MediaDeviceInfo[];

  microphones: MediaDeviceInfo[];

  speakers: MediaDeviceInfo[];

  errors: Error[];

  isLoading: boolean;

  permissions: MediaPermissions;

  activeStreams: ReadonlyMap<string, MediaStream>;

  start: MediaDevicesStartFn;

  stop: MediaDevicesStopFn;

  stopAll: MediaDevicesStopAllFn;

  cachedStreamsCount: number;
}

export type MediaDevicesStartFn = (
  deviceId: string,
  constraints: MediaStreamConstraints,
) => Promise<MediaStream>;

export type MediaDevicesStopFn = (deviceId: string) => void;

export type MediaDevicesStopAllFn = () => void;

export type MediaDevicesIsActiveStreamFn = (deviceId: string) => boolean;

export const MediaDevicesKey: InjectionKey<Ref<MediaDeviceInfo[]>> =
  Symbol("MediaDevices");
export const MediaDevicesErrorsKey: InjectionKey<Ref<Error[]>> =
  Symbol("MediaDevicesErrors");
export const MediaDevicesLoadingKey: InjectionKey<Ref<boolean>> = Symbol(
  "MediaDevicesLoading",
);
export const MediaDevicesPermissionsKey: InjectionKey<Ref<MediaPermissions>> =
  Symbol("MediaDevicesPermissions");
export const MediaDevicesActiveStreamsKey: InjectionKey<
  Readonly<Ref<ReadonlyMap<string, MediaStream>>>
> = Symbol("MediaDevicesActiveStreams");
export const MediaDevicesStartKey: InjectionKey<MediaDevicesStartFn> =
  Symbol("MediaDevicesStart");
export const MediaDevicesStopKey: InjectionKey<MediaDevicesStopFn> =
  Symbol("MediaDevicesStop");
export const MediaDevicesStopAllKey: InjectionKey<MediaDevicesStopAllFn> =
  Symbol("MediaDevicesStopAll");

export { VideoPresets, AudioPresets, MediaPresets } from "./presets";
```

```vue [src/components/ui/media-devices-provider/MediaDevicesProvider.vue]
<script setup lang="ts">
import { provide, watch, onMounted, type Ref } from "vue";
import { useMediaDevices } from "~~/registry/new-york/composables/use-media-devices/useMediaDevices";
import {
  MediaDevicesKey,
  MediaDevicesErrorsKey,
  MediaDevicesLoadingKey,
  MediaDevicesPermissionsKey,
  MediaDevicesActiveStreamsKey,
  MediaDevicesStartKey,
  MediaDevicesStopKey,
  MediaDevicesStopAllKey,
  type MediaDevicesStartFn,
  type MediaDevicesStopFn,
  type MediaDevicesStopAllFn,
  type MediaDeviceType,
  type MediaPermissions,
} from ".";

export interface MediaDevicesProviderProps {
  type?: MediaDeviceType;

  open?: boolean;
}

const props = withDefaults(defineProps<MediaDevicesProviderProps>(), {
  type: "all",
  open: false,
});

const emit = defineEmits<{
  streamStarted: [deviceId: string, stream: MediaStream];
  streamStopped: [deviceId: string];
  allStreamsStopped: [];
  devicesUpdated: [devices: MediaDeviceInfo[]];
  error: [error: Error];
}>();

const {
  devices,
  cameras,
  microphones,
  speakers,
  errors,
  isLoading,
  permissions,
  activeStreams,
  startStream,
  stopStream,
  stopAllStreams,
  updateAvailableDevices,
  ensurePermissions,
  initialize,
} = useMediaDevices({
  type: props.type,
  open: props.open,
  onStreamStarted: (deviceId, stream) =>
    emit("streamStarted", deviceId, stream),
  onStreamStopped: (deviceId) => emit("streamStopped", deviceId),
  onAllStreamsStopped: () => emit("allStreamsStopped"),
  onDevicesUpdated: (devices) => emit("devicesUpdated", devices),
  onError: (error) => emit("error", error),
});

provide<Ref<MediaDeviceInfo[]>>(MediaDevicesKey, devices);

provide<Ref<Error[]>>(MediaDevicesErrorsKey, errors);

provide<Ref<boolean>>(MediaDevicesLoadingKey, isLoading);

provide<Ref<MediaPermissions>>(MediaDevicesPermissionsKey, permissions);

provide(MediaDevicesActiveStreamsKey, activeStreams);

provide<MediaDevicesStartFn>(MediaDevicesStartKey, startStream);

provide<MediaDevicesStopFn>(MediaDevicesStopKey, stopStream);

provide<MediaDevicesStopAllFn>(MediaDevicesStopAllKey, stopAllStreams);

watch(
  () => [props.type, props.open] as const,
  async ([newType, newOpen], oldValue) => {
    const [oldType, oldOpen] = oldValue || [props.type, false];

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
  },
);

onMounted(async () => {
  await initialize();
});
</script>

<template>
  <slot
    :devices="devices"
    :errors="errors"
    :is-loading="isLoading"
    :permissions="permissions"
    :active-streams="activeStreams"
    :cameras="cameras"
    :microphones="microphones"
    :speakers="speakers"
    :start="startStream"
    :stop="stopStream"
    :stop-all="stopAllStreams"
    :cached-streams-count="activeStreams.size"
  />
</template>

<style scoped></style>
```

```vue [src/components/ui/media-devices-provider/AudioDevice.vue]
<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  computed,
  inject,
  type Ref,
} from "vue";
import {
  MediaDevicesStartKey,
  MediaDevicesStopKey,
  MediaDevicesLoadingKey,
  MediaDevicesPermissionsKey,
  MediaDevicesActiveStreamsKey,
  type MediaPermissions,
} from ".";
import type { MediaDevicesStartFn, MediaDevicesStopFn } from ".";

export interface AudioDeviceProps {
  autoStart?: boolean;

  deviceId: string;

  echoCancellation?: boolean;

  noiseSuppression?: boolean;

  autoGainControl?: boolean;

  sampleRate?: number | { min?: number; max?: number; ideal?: number };

  sampleSize?: number | { min?: number; max?: number; ideal?: number };

  constraints?: MediaStreamConstraints;
}

const props = withDefaults(defineProps<AudioDeviceProps>(), {
  autoStart: false,
});

const emit = defineEmits<{
  stream: [stream: MediaStream | null];
  error: [error: Error];
  started: [];
  stopped: [];
}>();

const providerStart = inject<MediaDevicesStartFn>(MediaDevicesStartKey);
const providerStop = inject<MediaDevicesStopFn>(MediaDevicesStopKey);
const providerIsLoading = inject<Ref<boolean>>(
  MediaDevicesLoadingKey,
  ref(false),
);
const providerPermissions = inject<Ref<MediaPermissions>>(
  MediaDevicesPermissionsKey,
  ref({ camera: "unknown", microphone: "unknown" }),
);
const providerActiveStreams = inject<
  Readonly<Ref<ReadonlyMap<string, MediaStream>>>
>(
  MediaDevicesActiveStreamsKey,
  computed(() => new Map() as ReadonlyMap<string, MediaStream>),
);

const stream = ref<MediaStream | null>(null);
const error = ref<Error | null>(null);
const isActive = ref(false);
const isLoading = ref(false);
const currentDeviceId = ref<string | undefined>(undefined);

const buildConstraints = (): MediaStreamConstraints => {
  if (props.constraints) {
    return props.constraints;
  }

  const audioConstraints: MediaTrackConstraints = {
    deviceId: { exact: props.deviceId },
    echoCancellation: props.echoCancellation,
    noiseSuppression: props.noiseSuppression,
    autoGainControl: props.autoGainControl,
    sampleRate: props.sampleRate
      ? typeof props.sampleRate === "number"
        ? { ideal: props.sampleRate }
        : props.sampleRate
      : undefined,
    sampleSize: props.sampleSize
      ? typeof props.sampleSize === "number"
        ? { ideal: props.sampleSize }
        : props.sampleSize
      : undefined,
  };

  return {
    video: false,
    audio: audioConstraints,
  };
};

const start = async () => {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    return;
  }

  if (isActive.value || isLoading.value) {
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    const constraints = buildConstraints();

    if (providerStart) {
      stream.value = await providerStart(props.deviceId, constraints);
    } else {
      stream.value = await navigator.mediaDevices.getUserMedia(constraints);
    }

    currentDeviceId.value = props.deviceId;
    isActive.value = true;
    emit("stream", stream.value);
    emit("started");
  } catch (err) {
    const errorObj = err as Error;
    error.value = errorObj;
    emit("error", errorObj);
  } finally {
    isLoading.value = false;
  }
};

const stop = () => {
  if (!isActive.value) return;

  const deviceIdToStop = currentDeviceId.value;

  if (deviceIdToStop && providerStop) {
    providerStop(deviceIdToStop);
  } else if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
  }

  stream.value = null;
  isActive.value = false;
  currentDeviceId.value = undefined;
  emit("stream", null);
  emit("stopped");
};

const switchDevice = async () => {
  const previousDeviceId = currentDeviceId.value;

  stream.value = null;
  isActive.value = false;
  currentDeviceId.value = undefined;

  emit("stream", null);

  await start();
};

watch(
  () => [
    props.deviceId,
    props.echoCancellation,
    props.noiseSuppression,
    props.autoGainControl,
    props.sampleRate,
    props.sampleSize,
    props.constraints,
  ],
  async (newVals, oldVals) => {
    const deviceIdChanged = newVals[0] !== oldVals?.[0];

    if (deviceIdChanged) {
      if (isActive.value) {
        await switchDevice();
      } else if (props.autoStart) {
        await start();
      }
    } else if (isActive.value) {
      stop();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await start();
    }
  },
);

onMounted(() => {
  if (props.autoStart) {
    start();
  }
});

onBeforeUnmount(() => {
  stop();
});

defineExpose({
  start,
  stop,
  stream: computed(() => stream.value),
  isActive: computed(() => isActive.value),
  isLoading: computed(() => isLoading.value),
  providerIsLoading: computed(() => providerIsLoading.value),
  providerPermissions: computed(() => providerPermissions.value),
  providerActiveStreams: computed(() => providerActiveStreams.value),
  error: computed(() => error.value),
});
</script>

<template>
  <slot
    :stream="stream"
    :is-active="isActive"
    :is-loading="isLoading"
    :provider-is-loading="providerIsLoading"
    :provider-permissions="providerPermissions"
    :provider-active-streams="providerActiveStreams"
    :error="error"
    :start="start"
    :stop="stop"
  />
</template>

<style scoped></style>
```

```vue [src/components/ui/media-devices-provider/VideoDevice.vue]
<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  computed,
  inject,
  type Ref,
} from "vue";
import {
  MediaDevicesStartKey,
  MediaDevicesStopKey,
  MediaDevicesLoadingKey,
  MediaDevicesPermissionsKey,
  MediaDevicesActiveStreamsKey,
  type MediaPermissions,
} from ".";
import type { MediaDevicesStartFn, MediaDevicesStopFn } from ".";

export interface VideoDeviceProps {
  autoStart?: boolean;

  deviceId?: string;

  width?: number | { min?: number; max?: number; ideal?: number };

  height?: number | { min?: number; max?: number; ideal?: number };

  frameRate?: number | { min?: number; max?: number; ideal?: number };

  facingMode?: "user" | "environment" | "left" | "right";

  aspectRatio?: number | { min?: number; max?: number; ideal?: number };

  constraints?: MediaStreamConstraints;
}

const props = withDefaults(defineProps<VideoDeviceProps>(), {
  autoStart: false,
});

const emit = defineEmits<{
  stream: [stream: MediaStream | null];
  error: [error: Error];
  started: [];
  stopped: [];
}>();

const providerStart = inject<MediaDevicesStartFn>(MediaDevicesStartKey);
const providerStop = inject<MediaDevicesStopFn>(MediaDevicesStopKey);
const providerIsLoading = inject<Ref<boolean>>(
  MediaDevicesLoadingKey,
  ref(false),
);
const providerPermissions = inject<Ref<MediaPermissions>>(
  MediaDevicesPermissionsKey,
  ref({ camera: "unknown", microphone: "unknown" }),
);
const providerActiveStreams = inject<
  Readonly<Ref<ReadonlyMap<string, MediaStream>>>
>(
  MediaDevicesActiveStreamsKey,
  computed(() => new Map() as ReadonlyMap<string, MediaStream>),
);

const stream = ref<MediaStream | null>(null);
const error = ref<Error | null>(null);
const isActive = ref(false);
const isLoading = ref(false);
const currentDeviceId = ref<string | undefined>(undefined);

const buildConstraints = (): MediaStreamConstraints => {
  if (props.constraints) {
    return props.constraints;
  }

  if (!props.deviceId && !props.facingMode) {
    throw new Error("Either deviceId or facingMode must be provided");
  }

  const videoConstraints: MediaTrackConstraints = {
    ...(props.facingMode
      ? { facingMode: { ideal: props.facingMode } }
      : { deviceId: { exact: props.deviceId } }),
    width: props.width
      ? typeof props.width === "number"
        ? { ideal: props.width }
        : props.width
      : undefined,
    height: props.height
      ? typeof props.height === "number"
        ? { ideal: props.height }
        : props.height
      : undefined,
    aspectRatio: props.aspectRatio
      ? typeof props.aspectRatio === "number"
        ? { ideal: props.aspectRatio }
        : props.aspectRatio
      : undefined,
    frameRate: props.frameRate
      ? typeof props.frameRate === "number"
        ? { ideal: props.frameRate }
        : props.frameRate
      : undefined,
  };

  return {
    video: videoConstraints,
    audio: false,
  };
};

const start = async () => {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) {
    return;
  }

  if (isActive.value || isLoading.value) {
    return;
  }

  try {
    isLoading.value = true;
    error.value = null;
    const constraints = buildConstraints();

    if (providerStart && props.deviceId && !props.facingMode) {
      stream.value = await providerStart(props.deviceId, constraints);
    } else {
      stream.value = await navigator.mediaDevices.getUserMedia(constraints);
    }

    currentDeviceId.value = props.deviceId;
    isActive.value = true;
    emit("stream", stream.value);
    emit("started");
  } catch (err) {
    const errorObj = err as Error;
    error.value = errorObj;
    emit("error", errorObj);
  } finally {
    isLoading.value = false;
  }
};

const stop = () => {
  if (!isActive.value) return;

  const deviceIdToStop = currentDeviceId.value;

  if (deviceIdToStop && providerStop) {
    providerStop(deviceIdToStop);
  } else if (stream.value) {
    stream.value.getTracks().forEach((track) => track.stop());
  }

  stream.value = null;
  isActive.value = false;
  currentDeviceId.value = undefined;
  emit("stream", null);
  emit("stopped");
};

const switchDevice = async () => {
  const previousDeviceId = currentDeviceId.value;

  stream.value = null;
  isActive.value = false;
  currentDeviceId.value = undefined;

  emit("stream", null);

  await start();
};

watch(
  () => [
    props.deviceId,
    props.width,
    props.height,
    props.frameRate,
    props.facingMode,
    props.aspectRatio,
    props.constraints,
  ],
  async (newVals, oldVals) => {
    const deviceIdChanged = newVals[0] !== oldVals?.[0];

    if (deviceIdChanged) {
      if (isActive.value) {
        await switchDevice();
      } else if (props.autoStart) {
        await start();
      }
    } else if (isActive.value) {
      stop();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await start();
    }
  },
);

onMounted(() => {
  if (props.autoStart) {
    start();
  }
});

onBeforeUnmount(() => {
  stop();
});

defineExpose({
  start,
  stop,
  stream: computed(() => stream.value),
  isActive: computed(() => isActive.value),
  isLoading: computed(() => isLoading.value),
  providerIsLoading: computed(() => providerIsLoading.value),
  providerPermissions: computed(() => providerPermissions.value),
  providerActiveStreams: computed(() => providerActiveStreams.value),
  error: computed(() => error.value),
});
</script>

<template>
  <slot
    :stream="stream"
    :is-active="isActive"
    :is-loading="isLoading"
    :provider-is-loading="providerIsLoading"
    :provider-permissions="providerPermissions"
    :provider-active-streams="providerActiveStreams"
    :error="error"
    :start="start"
    :stop="stop"
  />
</template>

<style scoped></style>
```

```ts [src/components/ui/media-devices-provider/presets.ts]
export const VideoPresets = {
  sd: {
    width: 640,
    height: 480,
    frameRate: 30,
  },

  hd: {
    width: 1280,
    height: 720,
    frameRate: 30,
  },

  fullHd: {
    width: 1920,
    height: 1080,
    frameRate: 30,
  },

  uhd4k: {
    width: 3840,
    height: 2160,
    frameRate: 30,
  },

  adaptiveHd: {
    width: { min: 640, ideal: 1920, max: 3840 },
    height: { min: 480, ideal: 1080, max: 2160 },
    frameRate: { min: 24, ideal: 30, max: 60 },
  },

  mobileFront: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
    facingMode: "user" as const,
  },

  mobileBack: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
    facingMode: "environment" as const,
  },

  conference: {
    width: 1280,
    height: 720,
    frameRate: 30,
    aspectRatio: 1.777,
  },

  screenRecording: {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 60 },
    aspectRatio: 1.777,
  },
} as const;

export const AudioPresets = {
  default: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },

  highQuality: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    sampleRate: 48000,
  },

  voice: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
  },

  conference: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: { ideal: 48000 },
  },

  raw: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  },
} as const;

export const MediaPresets = {
  videoConference: {
    ...VideoPresets.conference,
    ...AudioPresets.conference,
  },

  screenRecording: {
    ...VideoPresets.screenRecording,
    ...AudioPresets.voice,
  },

  podcast: {
    ...AudioPresets.highQuality,
  },

  mobileSelfie: {
    ...VideoPresets.mobileFront,
    ...AudioPresets.default,
  },

  mobileVideo: {
    ...VideoPresets.mobileBack,
    ...AudioPresets.default,
  },
} as const;
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
:::

