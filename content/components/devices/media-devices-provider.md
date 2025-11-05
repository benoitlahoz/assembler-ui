---
title: MediaDevicesProvider
description: A renderless provider component that supplies media devices information and handles permissions.
---

  <p class="text-pretty mt-4"><br>This component uses the MediaDevices API to list available audio and video input devices.<br>It manages user permissions and provides reactive access to device information.<br><br>The demos below use different MediaDevicesProvider. In real world usage, you would typically wrap your application or a section of it with the MediaDevicesProvider component.</p>

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <media-devices-simple />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MediaDevicesProvider } from "@/components/ui/media-devices-provider";

const open = ref(false);

const camerasSelect = ref<string[]>([]);
const microphonesSelect = ref<string[]>([]);
</script>
<template>
  <div class="flex flex-col">
    <Button
      :disabled="open"
      variant="outline"
      class="m-4 mb-2"
      @click="open = true"
      >List Devices</Button
    >
    <MediaDevicesProvider
      :open="open"
      v-slot="{ cameras, microphones, errors }"
    >
      <FieldGroup class="flex gap-4">
        <FieldSet>
          <FieldLegend>Cameras</FieldLegend>
          <FieldDescription>
            Select from the list of available camera devices.
          </FieldDescription>
          <Field>
            <Select multiple v-model="camerasSelect">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Select a camera" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <template v-if="cameras.length">
                    <SelectLabel>Available Cameras</SelectLabel>
                    <SelectItem
                      v-for="camera in cameras"
                      :key="camera.deviceId"
                      :value="camera.deviceId"
                    >
                      {{ camera.label || "Unnamed Device" }}
                    </SelectItem>
                  </template>
                  <template v-else>
                    <SelectLabel>No Devices Found</SelectLabel>
                  </template>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldSet>

        <FieldSet>
          <FieldLegend>Audio Inputs</FieldLegend>
          <FieldDescription>
            Select from the list of available audio input devices.
          </FieldDescription>
          <Field>
            <Select multiple v-model="microphonesSelect">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Select an audio input" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <template v-if="microphones.length">
                    <SelectLabel>Available Microphones</SelectLabel>
                    <SelectItem
                      v-for="microphone in microphones"
                      :key="microphone.deviceId"
                      :value="microphone.deviceId"
                    >
                      {{ microphone.label || "Unnamed Device" }}
                    </SelectItem>
                  </template>
                  <template v-else>
                    <SelectLabel>No Devices Found</SelectLabel>
                  </template>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldSet>
      </FieldGroup>
      <Separator class="my-4" />
      <FieldGroup>
        <FieldSet>
          <Field>
            <FieldLabel>Errors</FieldLabel>
            <div class="flex space-x-2">
              <template
                v-if="errors.length"
                v-for="(error, index) in errors"
                :key="index"
              >
                <Badge variant="destructive">
                  {{ error.message || (error as any).constraint || error }}
                </Badge>
              </template>
              <template v-else>
                <Badge variant="default">No Errors</Badge>
              </template>
            </div>
          </Field>
        </FieldSet>
      </FieldGroup>
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
import { provide, onMounted, toRef, type Ref } from "vue";
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
  type: toRef(props, "type"),
  open: toRef(props, "open"),
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
import {
  ref,
  computed,
  onBeforeUnmount,
  watch,
  toRef,
  type MaybeRef,
} from "vue";
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
  type?: MaybeRef<MediaDeviceType>;

  open?: MaybeRef<boolean>;

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

```ts [src/composables/use-media-devices/foo.ts]
import { bar } from "./bar";

export const foo = "bar";
```

```ts [src/composables/use-media-devices/bar/index.ts]
export const bar = "foo";
```
:::

## MediaDevicesProvider
::hr-underline
::

The MediaDevicesProvider component provides a list of available media devices
(cameras, microphones, etc.) to its child components via provide/inject and a scoped slot.

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `type`{.primary .text-primary} | `MediaDeviceType` | all | The type of media devices to request. |
| `open`{.primary .text-primary} | `boolean` | false | Whether to automatically request media permissions and devices on mount. |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | Slot for child components to access media devices, errors, and stream management |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `MediaDevicesKey`{.primary .text-primary} | `devices` | `Ref<MediaDeviceInfo[]>` | Available media devices. |
| `MediaDevicesErrorsKey`{.primary .text-primary} | `errors` | `Ref<Error[]>` | Errors encountered during media operations. |
| `MediaDevicesLoadingKey`{.primary .text-primary} | `isLoading` | `Ref<boolean>` | Loading state. |
| `MediaDevicesPermissionsKey`{.primary .text-primary} | `permissions` | `Ref<MediaPermissions>` | Permissions state. |
| `MediaDevicesActiveStreamsKey`{.primary .text-primary} | `activeStreams` | `any` | Active streams (readonly). |
| `MediaDevicesStartKey`{.primary .text-primary} | `startStream` | `MediaDevicesStartFn` | Start a media stream for a specific device. |
| `MediaDevicesStopKey`{.primary .text-primary} | `stopStream` | `MediaDevicesStopFn` | Stop a media stream for a specific device. |
| `MediaDevicesStopAllKey`{.primary .text-primary} | `stopAllStreams` | `MediaDevicesStopAllFn` | Stop all active media streams. |

---

## AudioDevice
::hr-underline
::

AudioDevice component - Manages an audio stream with constraints.
This component builds audio constraints and uses the MediaDevicesProvider&#39;s
start/stop functions to manage streams with device caching.

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `autoStart`{.primary .text-primary} | `boolean` | false | Whether to automatically start the media stream on mount. |
| `deviceId`{.primary .text-primary} | `string` | - | The exact device ID to use for the audio stream (REQUIRED). |
| `echoCancellation`{.primary .text-primary} | `boolean` | - | Enable echo cancellation for audio input. |
| `noiseSuppression`{.primary .text-primary} | `boolean` | - | Enable noise suppression for audio input. |
| `autoGainControl`{.primary .text-primary} | `boolean` | - | Enable automatic gain control for audio input. |
| `sampleRate`{.primary .text-primary} | `number \| { min?: number; max?: number; ideal?: number }` | - | Audio sample rate (in Hz). |
| `sampleSize`{.primary .text-primary} | `number \| { min?: number; max?: number; ideal?: number }` | - | Audio sample size (in bits). |
| `constraints`{.primary .text-primary} | `MediaStreamConstraints` | - | Custom MediaStreamConstraints to override simplified props. |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `MediaDevicesStartKey`{.primary .text-primary} | — | — | Inject start and stop functions from MediaDevicesProvider. |
| `MediaDevicesStopKey`{.primary .text-primary} | — | — | — |
| `MediaDevicesLoadingKey`{.primary .text-primary} | `ref(false)` | `any` | — |
| `MediaDevicesPermissionsKey`{.primary .text-primary} | `ref({ camera: 'unknown', microphone: 'unknown' })` | `any` | — |
| `MediaDevicesActiveStreamsKey`{.primary .text-primary} | `computed(() => new Map() as ReadonlyMap<string, MediaStream>)` | `any` | — |

  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `start`{.primary .text-primary} | `() => void` | — |
| `stop`{.primary .text-primary} | `() => void` | — |
| `stream`{.primary .text-primary} | — | — |
| `isActive`{.primary .text-primary} | — | — |
| `isLoading`{.primary .text-primary} | — | — |
| `providerIsLoading`{.primary .text-primary} | — | — |
| `providerPermissions`{.primary .text-primary} | — | — |
| `providerActiveStreams`{.primary .text-primary} | — | — |
| `error`{.primary .text-primary} | — | — |

---

## VideoDevice
::hr-underline
::

VideoDevice component - Manages a video stream with constraints.
This component builds video constraints and uses the MediaDevicesProvider&#39;s
start/stop functions to manage streams with device caching.

IMPORTANT: On iOS/Safari, you cannot use both deviceId and facingMode constraints
simultaneously. If both are provided, facingMode takes priority to allow the browser
to select the appropriate camera automatically.

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `autoStart`{.primary .text-primary} | `boolean` | false | Whether to automatically start the media stream on mount. |
| `deviceId`{.primary .text-primary} | `string` | - | The exact device ID to use for the video stream. Is optional if facingMode is provided. |
| `width`{.primary .text-primary} | `number \| { min?: number; max?: number; ideal?: number }` | - | Video resolution width (in pixels). |
| `height`{.primary .text-primary} | `number \| { min?: number; max?: number; ideal?: number }` | - | Video resolution height (in pixels). |
| `frameRate`{.primary .text-primary} | `number \| { min?: number; max?: number; ideal?: number }` | - | Video framerate (frames per second). |
| `facingMode`{.primary .text-primary} | `'user' \| 'environment' \| 'left' \| 'right'` | - | Camera facing mode. Takes priority on deviceId. |
| `aspectRatio`{.primary .text-primary} | `number \| { min?: number; max?: number; ideal?: number }` | - | Video aspect ratio. |
| `constraints`{.primary .text-primary} | `MediaStreamConstraints` | - | Custom MediaStreamConstraints to override simplified props. |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `MediaDevicesStartKey`{.primary .text-primary} | — | — | Inject start and stop functions from MediaDevicesProvider. |
| `MediaDevicesStopKey`{.primary .text-primary} | — | — | — |
| `MediaDevicesLoadingKey`{.primary .text-primary} | `ref(false)` | `any` | — |
| `MediaDevicesPermissionsKey`{.primary .text-primary} | `ref({ camera: 'unknown', microphone: 'unknown' })` | `any` | — |
| `MediaDevicesActiveStreamsKey`{.primary .text-primary} | `computed(() => new Map() as ReadonlyMap<string, MediaStream>)` | `any` | — |

  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `start`{.primary .text-primary} | `() => void` | — |
| `stop`{.primary .text-primary} | `() => void` | — |
| `stream`{.primary .text-primary} | — | — |
| `isActive`{.primary .text-primary} | — | — |
| `isLoading`{.primary .text-primary} | — | — |
| `providerIsLoading`{.primary .text-primary} | — | — |
| `providerPermissions`{.primary .text-primary} | — | — |
| `providerActiveStreams`{.primary .text-primary} | — | — |
| `error`{.primary .text-primary} | — | — |

---

  ## Examples
  ::hr-underline
  ::

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

### Stream Cache
::hr-underline
::

Select a camera from the list. The provider caches streams to avoid reopening the same device.

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <media-device-demo-simple />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  MediaDevicesProvider,
  VideoDevice,
} from "@/components/ui/media-devices-provider";

const videoRef = ref<HTMLVideoElement | null>(null);
const selectedDeviceId = ref<string>("");

const handleStream = (stream: MediaStream | null) => {
  if (videoRef.value && stream) {
    videoRef.value.srcObject = stream;
  } else if (videoRef.value && !stream) {
    videoRef.value.srcObject = null;
  }
};

const selectDevice = (deviceId: string) => {
  selectedDeviceId.value = deviceId;
};

watch([videoRef, selectedDeviceId], async () => {
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
});
</script>

<template>
  <div class="space-y-4">
    <MediaDevicesProvider :open="true">
      <template #default="{ devices, errors, cachedStreamsCount }">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label class="text-sm font-bold mb-4">Available Cameras</Label>
            <div class="grid gap-2">
              <Button
                v-for="device in devices.filter((d) => d.kind === 'videoinput')"
                :key="device.deviceId"
                @click="selectDevice(device.deviceId)"
                :variant="
                  selectedDeviceId === device.deviceId ? 'default' : 'outline'
                "
                size="sm"
                class="justify-start"
              >
                <Badge
                  v-if="selectedDeviceId === device.deviceId"
                  class="mr-2"
                  variant="secondary"
                >
                  Active
                </Badge>
                {{ device.label || "Camera" }}
              </Button>
            </div>
          </div>

          <VideoDevice
            v-if="selectedDeviceId"
            :device-id="selectedDeviceId"
            :width="1280"
            :height="720"
            :frame-rate="30"
            auto-start
            @stream="handleStream"
          >
            <template #default="{ stream, isActive, error, start, stop }">
              <div class="space-y-4">
                <div
                  class="relative bg-black rounded-lg overflow-hidden"
                  style="aspect-ratio: 16/9"
                >
                  <video
                    ref="videoRef"
                    autoplay
                    playsinline
                    muted
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-if="!isActive"
                    class="absolute inset-0 flex items-center justify-center bg-muted/50"
                  >
                    <p class="text-muted-foreground">Camera not started</p>
                  </div>

                  <div
                    v-if="isActive"
                    class="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs"
                  >
                    {{
                      devices.find((d) => d.deviceId === selectedDeviceId)
                        ?.label || "Camera"
                    }}
                  </div>
                </div>

                <div class="flex gap-2">
                  <Button @click="start" :disabled="isActive">
                    Start Camera
                  </Button>
                  <Button
                    @click="stop"
                    :disabled="!isActive"
                    variant="destructive"
                  >
                    Stop Camera
                  </Button>
                </div>

                <div class="text-sm space-y-1">
                  <p>
                    Status:
                    <span
                      :class="isActive ? 'text-green-600' : 'text-gray-500'"
                    >
                      {{ isActive ? "Active" : "Inactive" }}
                    </span>
                  </p>
                  <p v-if="stream" class="text-xs text-muted-foreground">
                    Tracks: {{ stream.getTracks().length }} | Device ID:
                    {{ selectedDeviceId.substring(0, 20) }}...
                  </p>
                  <p class="text-xs text-muted-foreground">
                    Cached streams: {{ cachedStreamsCount }}
                  </p>
                </div>

                <div
                  v-if="error"
                  class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"
                >
                  <p class="font-medium">Error:</p>
                  <p>
                    {{ error.message || error }}
                    {{
                      (error as any).constraint
                        ? `(${(error as any).constraint})`
                        : ""
                    }}
                  </p>
                </div>
              </div>
            </template>
          </VideoDevice>

          <div
            v-else
            class="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground"
          >
            <p>Select a camera from the list above to start</p>
          </div>

          <div
            v-if="errors && errors.length > 0"
            class="p-4 rounded border border-destructive bg-destructive/10 text-destructive"
          >
            <p class="font-bold">Provider Errors:</p>
            <ul class="text-sm space-y-1 mt-2">
              <li v-for="(error, index) in errors" :key="index">
                {{ error.message || error }}
                {{
                  (error as any).constraint
                    ? `(${(error as any).constraint})`
                    : ""
                }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </MediaDevicesProvider>
  </div>
</template>
```
  :::
::

### Presets
::hr-underline
::

Select a camera and quality preset. The provider caches streams efficiently when switching presets.

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <media-device-demo-presets />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { toPascalCase } from "@assemblerjs/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  MediaDevicesProvider,
  VideoDevice,
  VideoPresets,
} from "@/components/ui/media-devices-provider";

type PresetName = keyof typeof VideoPresets;

const selectedPreset = ref<PresetName>("hd");
const selectedDeviceId = ref<string>("");
const videoRef = ref<HTMLVideoElement | null>(null);
const currentStream = ref<MediaStream | null>(null);

const isMobile = computed(() => {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
});

const availablePresets = computed(() => {
  const presets = { ...VideoPresets };

  if (!isMobile.value) {
    delete (presets as any).mobileFront;
    delete (presets as any).mobileBack;
  }
  return presets;
});

const currentPreset = computed(() => VideoPresets[selectedPreset.value]);

const handleStream = (stream: MediaStream | null) => {
  currentStream.value = stream;
  if (videoRef.value) {
    videoRef.value.srcObject = stream;
  }
};

const selectDevice = (deviceId: string) => {
  selectedDeviceId.value = deviceId;
};

const getActualResolution = () => {
  if (!videoRef.value || !currentStream.value) return null;
  const videoTrack = currentStream.value.getVideoTracks()[0];
  if (!videoTrack) return null;
  const settings = videoTrack.getSettings();
  return {
    width: settings.width,
    height: settings.height,
    frameRate: settings.frameRate,
  };
};

const formatPresetName = (name: string): string => {
  const standardNames: Record<string, string> = {
    sd: "SD",
    hd: "HD",
    fullhd: "Full HD",
    "4k": "4K",
    uhd: "UHD",
    uhd4k: "UHD 4K",
    qhd: "QHD",
    vga: "VGA",
    qvga: "QVGA",
  };

  const lowerName = name.toLowerCase();

  if (standardNames[lowerName]) {
    return standardNames[lowerName];
  }

  let formatted = toPascalCase(name)
    .replace(/([A-Z])/g, " $1")
    .trim();

  formatted = formatted.replace(/\bHd\b/gi, "HD");

  return formatted;
};
</script>

<template>
  <div class="flex flex-col">
    <MediaDevicesProvider :open="true">
      <template #default="{ devices, errors }">
        <div class="flex flex-col h-full overflow-hidden">
          <div class="p-4 space-y-4">
            <div class="space-y-2">
              <Label class="text-sm font-bold mb-4">Available Cameras</Label>
              <div class="grid gap-2">
                <Button
                  v-for="device in devices.filter(
                    (d) => d.kind === 'videoinput',
                  )"
                  :key="device.deviceId"
                  @click="selectDevice(device.deviceId)"
                  :variant="
                    selectedDeviceId === device.deviceId ? 'default' : 'outline'
                  "
                  size="sm"
                  class="justify-start"
                >
                  <Badge
                    v-if="selectedDeviceId === device.deviceId"
                    class="mr-2"
                    variant="secondary"
                  >
                    Active
                  </Badge>
                  {{ device.label || "Camera" }}
                </Button>
              </div>
            </div>

            <div class="space-y-2">
              <Label class="text-sm font-bold mb-4">Video Quality</Label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  v-for="(preset, name) in availablePresets"
                  :key="name"
                  @click="selectedPreset = name as PresetName"
                  :variant="selectedPreset === name ? 'default' : 'outline'"
                  size="sm"
                >
                  {{ formatPresetName(name as string) }}
                </Button>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto min-h-0">
            <VideoDevice
              v-if="selectedDeviceId"
              :device-id="selectedDeviceId"
              v-bind="currentPreset"
              auto-start
              @stream="handleStream"
            >
              <template #default="{ stream, isActive, error, start, stop }">
                <div class="p-4 space-y-4">
                  <div
                    class="relative bg-black rounded-lg overflow-hidden border border-muted"
                    style="aspect-ratio: 16/9"
                  >
                    <video
                      ref="videoRef"
                      autoplay
                      playsinline
                      muted
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-if="!isActive"
                      class="absolute inset-0 flex items-center justify-center bg-muted/50"
                    >
                      <p class="text-muted-foreground">Camera not started</p>
                    </div>

                    <div
                      v-if="isActive"
                      class="absolute top-2 left-2 space-y-1 bg-black/70 text-white px-2 py-1 rounded text-xs font-mono"
                    >
                      <div>{{ formatPresetName(selectedPreset) }}</div>
                      <div v-if="getActualResolution()">
                        {{ getActualResolution()?.width }}x{{
                          getActualResolution()?.height
                        }}
                        @ {{ getActualResolution()?.frameRate?.toFixed(0) }}fps
                      </div>
                    </div>
                  </div>

                  <div class="flex gap-2">
                    <Button @click="start" :disabled="isActive">
                      Start Camera
                    </Button>
                    <Button
                      @click="stop"
                      :disabled="!isActive"
                      variant="destructive"
                    >
                      Stop Camera
                    </Button>
                  </div>

                  <div class="grid md:grid-cols-2 gap-4">
                    <div class="border rounded-lg p-4 bg-muted/30">
                      <h4 class="font-medium mb-2 text-sm">
                        Requested Constraints:
                      </h4>
                      <pre class="text-xs overflow-auto">{{
                        currentPreset
                      }}</pre>
                    </div>

                    <div class="border rounded-lg p-4 bg-muted/30">
                      <h4 class="font-medium mb-2 text-sm">Actual Settings:</h4>
                      <div
                        v-if="isActive && stream"
                        class="text-xs space-y-1 font-mono"
                      >
                        <p v-if="getActualResolution()">
                          Resolution: {{ getActualResolution()?.width }}x{{
                            getActualResolution()?.height
                          }}
                        </p>
                        <p v-if="getActualResolution()?.frameRate">
                          Frame Rate:
                          {{ getActualResolution()?.frameRate?.toFixed(2) }} fps
                        </p>
                        <p>Tracks: {{ stream.getTracks().length }}</p>
                        <p class="break-all">
                          Device: {{ selectedDeviceId.substring(0, 30) }}...
                        </p>
                      </div>
                      <p v-else class="text-xs text-muted-foreground">
                        Start camera to see actual settings
                      </p>
                    </div>
                  </div>

                  <div
                    v-if="error"
                    class="p-4 rounded border border-destructive bg-destructive/10 text-destructive"
                  >
                    <p class="font-bold">Error:</p>
                    <p class="text-sm mt-1">
                      {{ error.message || error }}
                      {{
                        (error as any).constraint
                          ? `(${(error as any).constraint})`
                          : ""
                      }}
                    </p>
                  </div>
                </div>
              </template>
            </VideoDevice>

            <div
              v-else
              class="m-4 border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground"
            >
              <p>Select a camera to start</p>
            </div>
          </div>

          <div
            v-if="errors && errors.length > 0"
            class="m-4 mt-0 p-4 rounded border border-destructive bg-destructive/10 text-destructive"
          >
            <p class="font-bold">Provider Errors:</p>
            <ul class="text-sm space-y-1 mt-2">
              <li v-for="(error, index) in errors" :key="index">
                {{ error.message || error }}
                {{
                  (error as any).constraint
                    ? `(${(error as any).constraint})`
                    : ""
                }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </MediaDevicesProvider>
  </div>
</template>
```
  :::
::

### Multiple Viewers
::hr-underline
::

Open two devices simultaneously. If you select the same device for both, the provider will reuse the cached stream instead of opening it twice.

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <media-device-demo-multiple />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MediaDevicesProvider,
  VideoDevice,
} from "@/components/ui/media-devices-provider";

const videoRef1 = ref<HTMLVideoElement | null>(null);
const videoRef2 = ref<HTMLVideoElement | null>(null);
const selectedDevice1 = ref<string>("");
const selectedDevice2 = ref<string>("");

const handleStream1 = (stream: MediaStream | null) => {
  if (videoRef1.value && stream) {
    videoRef1.value.srcObject = stream;
  }
};

const handleStream2 = (stream: MediaStream | null) => {
  if (videoRef2.value && stream) {
    videoRef2.value.srcObject = stream;
  }
};
</script>

<template>
  <div class="space-y-6 p-6">
    <div>
      <Badge variant="outline" class="mt-4 p-2">
        💡 Try selecting the same camera for both viewers!
      </Badge>
    </div>

    <MediaDevicesProvider :open="true">
      <template #default="{ devices, errors }">
        <div class="space-y-6">
          <div class="grid md:grid-cols-2 gap-6">
            <div class="space-y-4 border rounded-lg p-4">
              <div class="flex items-center justify-between">
                <h4 class="font-medium">Viewer 1</h4>
                <Badge variant="secondary">Camera 1</Badge>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-medium text-muted-foreground"
                  >Select Camera:</label
                >
                <div class="flex flex-col gap-2">
                  <Button
                    v-for="device in devices.filter(
                      (d) => d.kind === 'videoinput',
                    )"
                    :key="device.deviceId"
                    @click="selectedDevice1 = device.deviceId"
                    :variant="
                      selectedDevice1 === device.deviceId
                        ? 'default'
                        : 'outline'
                    "
                    size="sm"
                    class="w-full justify-start text-xs"
                  >
                    <span class="truncate">{{ device.label || "Camera" }}</span>
                  </Button>
                </div>
              </div>

              <VideoDevice
                v-if="selectedDevice1"
                :device-id="selectedDevice1"
                :width="640"
                :height="480"
                auto-start
                @stream="handleStream1"
              >
                <template #default="{ stream, isActive, error }">
                  <div class="space-y-2">
                    <div
                      class="relative bg-black rounded overflow-hidden"
                      style="aspect-ratio: 4/3"
                    >
                      <video
                        ref="videoRef1"
                        autoplay
                        playsinline
                        muted
                        class="w-full h-full object-cover"
                      />
                      <div
                        v-if="!isActive"
                        class="absolute inset-0 flex items-center justify-center bg-muted/50"
                      >
                        <p class="text-xs text-muted-foreground">Inactive</p>
                      </div>
                    </div>
                    <div class="text-xs space-y-1">
                      <p>
                        Status:
                        <span
                          :class="isActive ? 'text-green-600' : 'text-gray-500'"
                        >
                          {{ isActive ? "Active" : "Inactive" }}
                        </span>
                      </p>
                      <p v-if="stream" class="text-muted-foreground font-mono">
                        Tracks: {{ stream.getTracks().length }}
                      </p>
                    </div>
                    <div
                      v-if="error"
                      class="text-xs text-red-600 bg-red-50 p-2 rounded"
                    >
                      {{ error.message }}
                    </div>
                  </div>
                </template>
              </VideoDevice>

              <div
                v-else
                class="border-2 border-dashed rounded p-4 text-center text-xs text-muted-foreground"
                style="aspect-ratio: 4/3"
              >
                Select a camera
              </div>
            </div>

            <div class="space-y-4 border rounded-lg p-4">
              <div class="flex items-center justify-between">
                <h4 class="font-medium">Viewer 2</h4>
                <Badge variant="secondary">Camera 2</Badge>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-medium text-muted-foreground"
                  >Select Camera:</label
                >
                <div class="flex flex-col gap-2">
                  <Button
                    v-for="device in devices.filter(
                      (d) => d.kind === 'videoinput',
                    )"
                    :key="device.deviceId"
                    @click="selectedDevice2 = device.deviceId"
                    :variant="
                      selectedDevice2 === device.deviceId
                        ? 'default'
                        : 'outline'
                    "
                    size="sm"
                    class="w-full justify-start text-xs"
                  >
                    <span class="truncate">{{ device.label || "Camera" }}</span>
                  </Button>
                </div>
              </div>

              <VideoDevice
                v-if="selectedDevice2"
                :device-id="selectedDevice2"
                :width="640"
                :height="480"
                auto-start
                @stream="handleStream2"
              >
                <template #default="{ stream, isActive, error }">
                  <div class="space-y-2">
                    <div
                      class="relative bg-black rounded overflow-hidden"
                      style="aspect-ratio: 4/3"
                    >
                      <video
                        ref="videoRef2"
                        autoplay
                        playsinline
                        muted
                        class="w-full h-full object-cover"
                      />
                      <div
                        v-if="!isActive"
                        class="absolute inset-0 flex items-center justify-center bg-muted/50"
                      >
                        <p class="text-xs text-muted-foreground">Inactive</p>
                      </div>
                    </div>
                    <div class="text-xs space-y-1">
                      <p>
                        Status:
                        <span
                          :class="isActive ? 'text-green-600' : 'text-gray-500'"
                        >
                          {{ isActive ? "Active" : "Inactive" }}
                        </span>
                      </p>
                      <p v-if="stream" class="text-muted-foreground font-mono">
                        Tracks: {{ stream.getTracks().length }}
                      </p>
                    </div>
                    <div
                      v-if="error"
                      class="text-xs text-red-600 bg-red-50 p-2 rounded"
                    >
                      {{ error.message }}
                    </div>
                  </div>
                </template>
              </VideoDevice>

              <div
                v-else
                class="border-2 border-dashed rounded p-4 text-center text-xs text-muted-foreground"
                style="aspect-ratio: 4/3"
              >
                Select a camera
              </div>
            </div>
          </div>

          <div class="border rounded-lg p-4 bg-muted/30">
            <h4 class="font-medium mb-2 text-sm">Stream Caching Info</h4>
            <div class="text-xs space-y-2 text-muted-foreground">
              <p>
                • When both viewers use <strong>different cameras</strong>, the
                provider opens two separate streams.
              </p>
              <p>
                • When both viewers use the <strong>same camera</strong>, the
                provider reuses the cached stream.
              </p>
              <p>
                • This prevents unnecessary device access and improves
                performance when multiple components need the same media stream.
              </p>
              <p v-if="selectedDevice1 && selectedDevice2">
                <Badge
                  :variant="
                    selectedDevice1 === selectedDevice2 ? 'default' : 'outline'
                  "
                  class="mr-2"
                >
                  {{
                    selectedDevice1 === selectedDevice2
                      ? "✓ Same device - Stream cached!"
                      : "Different devices - 2 streams"
                  }}
                </Badge>
              </p>
            </div>
          </div>

          <div
            v-if="errors && errors.length > 0"
            class="p-4 rounded border border-destructive bg-destructive/10 text-destructive"
          >
            <p class="font-bold text-sm">Provider Errors:</p>
            <ul class="text-xs space-y-1 mt-2">
              <li v-for="(error, index) in errors" :key="index">
                {{ error.message }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </MediaDevicesProvider>
  </div>
</template>
```
  :::
::

::tip
You can copy and adapt this template for any component documentation.
::