---
title: ScreenShareProvider
description: A renderless provider component that manages screen sharing functionality.
---

  <p class="text-pretty mt-4"><br>This component uses the getDisplayMedia API to enable screen, window, or tab sharing.<br>It manages the sharing state and provides reactive access to the screen stream.<br><br>Unlike MediaDevicesProvider, screen sharing doesn't enumerate available sources.<br>Instead, the browser displays a picker for the user to select what to share.</p>

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <screen-share-provider-demo-simple />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScreenShareProvider, ScreenShareViewer } from "..";
</script>

<template>
  <div class="space-y-4">
    <ScreenShareProvider>
      <template
        #default="{
          startShare,
          stopShare,
          isSharing,
          shareState,
          shareType,
          errors,
        }"
      >
        <div class="space-y-4">
          <div class="flex gap-2">
            <Button @click="startShare()" :disabled="isSharing">
              {{ isSharing ? "Sharing..." : "Start Screen Share" }}
            </Button>

            <Button
              @click="stopShare()"
              :disabled="!isSharing"
              variant="destructive"
            >
              Stop Sharing
            </Button>
          </div>

          <div class="border rounded-lg p-4 bg-muted/30 space-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="font-medium">Status:</span>
              <Badge
                :variant="
                  shareState === 'active'
                    ? 'default'
                    : shareState === 'error'
                      ? 'destructive'
                      : 'secondary'
                "
              >
                {{ shareState }}
              </Badge>
            </div>
            <div v-if="shareType" class="flex items-center gap-2">
              <span class="font-medium">Share Type:</span>
              <Badge variant="outline">{{ shareType }}</Badge>
            </div>
          </div>

          <div
            class="relative bg-black rounded-lg overflow-hidden border border-muted"
            style="aspect-ratio: 16/9"
          >
            <ScreenShareViewer
              v-if="isSharing"
              :auto-play="true"
              :muted="true"
              class="w-full h-full object-contain"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center bg-muted/50"
            >
              <p class="text-muted-foreground">
                Click "Start Screen Share" to begin
              </p>
            </div>

            <div
              v-if="isSharing"
              class="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs"
            >
              Screen Sharing Active
            </div>
          </div>

          <div
            v-if="errors && errors.length > 0"
            class="p-4 rounded border border-destructive bg-destructive/10 text-destructive"
          >
            <p class="font-bold">Errors:</p>
            <ul class="text-sm space-y-1 mt-2">
              <li v-for="(error, index) in errors" :key="index">
                {{ error.message }}
              </li>
            </ul>
          </div>
        </div>
      </template>
    </ScreenShareProvider>
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
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/screen-share-provider.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/screen-share-provider.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/screen-share-provider.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/screen-share-provider.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/screen-share-provider/index.ts"}

```ts [src/components/ui/screen-share-provider/index.ts]
import type { InjectionKey, Ref } from "vue";
import type {
  ScreenShareType,
  ScreenShareState,
  ScreenShareStartFn,
  ScreenShareStopFn,
} from "~~/registry/new-york/composables/use-screen-share/useScreenShare";

export { default as ScreenShareProvider } from "./ScreenShareProvider.vue";
export { default as ScreenShareViewer } from "./ScreenShareViewer.vue";

export { type ScreenShareProviderProps } from "./ScreenShareProvider.vue";
export { type ScreenShareViewerProps } from "./ScreenShareViewer.vue";

export type {
  ScreenShareType,
  ScreenShareState,
  ScreenShareOptions,
  ScreenShareStartFn,
  ScreenShareStopFn,
} from "~~/registry/new-york/composables/use-screen-share/useScreenShare";

export interface ScreenShareProviderSlotProps {
  screenStream: MediaStream | null;

  shareState: ScreenShareState;

  shareType: ScreenShareType | null;

  errors: Error[];

  isSharing: boolean;

  startShare: ScreenShareStartFn;

  stopShare: ScreenShareStopFn;
}

export const ScreenShareStreamKey: InjectionKey<Ref<MediaStream | null>> =
  Symbol("ScreenShareStream");

export const ScreenShareStateKey: InjectionKey<Ref<ScreenShareState>> =
  Symbol("ScreenShareState");

export const ScreenShareTypeKey: InjectionKey<Ref<ScreenShareType | null>> =
  Symbol("ScreenShareType");

export const ScreenShareErrorsKey: InjectionKey<Ref<Error[]>> =
  Symbol("ScreenShareErrors");

export const ScreenShareStartKey: InjectionKey<ScreenShareStartFn> =
  Symbol("ScreenShareStart");

export const ScreenShareStopKey: InjectionKey<ScreenShareStopFn> =
  Symbol("ScreenShareStop");
```

```vue [src/components/ui/screen-share-provider/ScreenShareProvider.vue]
<script setup lang="ts">
import { provide, watch, nextTick, type Ref } from "vue";
import { useScreenShare } from "../../composables/use-screen-share/useScreenShare";
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
} from ".";

export interface ScreenShareProviderProps {
  autoStart?: boolean;

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
  onShareStarted: (stream) => emit("shareStarted", stream),
  onShareStopped: () => emit("shareStopped"),
  onError: (error) => emit("error", error),
});

provide<Ref<MediaStream | null>>(ScreenShareStreamKey, screenStream);
provide<Ref<ScreenShareState>>(ScreenShareStateKey, shareState);
provide<Ref<ScreenShareType | null>>(ScreenShareTypeKey, shareType);
provide<Ref<Error[]>>(ScreenShareErrorsKey, errors);
provide<ScreenShareStartFn>(ScreenShareStartKey, startScreenShare);
provide<ScreenShareStopFn>(ScreenShareStopKey, stopScreenShare);

watch(
  () => props.autoStart,
  async (autoStart) => {
    if (autoStart) {
      await nextTick();
      try {
        await startScreenShare(props.defaultOptions);
      } catch (error) {}
    }
  },
  { immediate: true },
);
</script>

<template>
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
```

```vue [src/components/ui/screen-share-provider/ScreenShareViewer.vue]
<script setup lang="ts">
import { inject, ref, watch, onBeforeUnmount, computed } from "vue";
import {
  ScreenShareStreamKey,
  ScreenShareStateKey,
  ScreenShareStartKey,
  ScreenShareStopKey,
  type ScreenShareOptions,
} from ".";

export interface ScreenShareViewerProps {
  options?: ScreenShareOptions;

  autoPlay?: boolean;

  muted?: boolean;

  controls?: boolean;

  class?: string;

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

const screenStream = inject(ScreenShareStreamKey);
const shareState = inject(ScreenShareStateKey);
const startShare = inject(ScreenShareStartKey);
const stopShare = inject(ScreenShareStopKey);

const videoRef = ref<HTMLVideoElement | null>(null);

const isPlaying = ref(false);

const isSharing = computed(() => shareState?.value === "active");

watch(
  [screenStream, videoRef],
  () => {
    if (videoRef.value && screenStream?.value) {
      videoRef.value.srcObject = screenStream.value;

      if (props.autoPlay) {
        videoRef.value.play().catch((error) => {
          console.warn("Auto-play failed:", error);
        });
      }
    } else if (videoRef.value) {
      videoRef.value.srcObject = null;
    }
  },
  { immediate: true },
);

watch(
  [() => props.autoStart, isSharing],
  async ([autoStart, sharing]) => {
    if (autoStart && !sharing && startShare) {
      try {
        await startShare(props.options);
      } catch (error) {}
    }
  },
  { immediate: true },
);

const handlePlay = () => {
  isPlaying.value = true;
  emit("playing");
};

const handlePause = () => {
  isPlaying.value = false;
  emit("paused");
};

const handleError = (event: Event) => {
  emit("error", event);
};

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
```
:::

## index
::hr-underline
::

A renderless provider component that manages screen sharing functionality.

This component uses the getDisplayMedia API to enable screen, window, or tab sharing.
It manages the sharing state and provides reactive access to the screen stream.

Unlike MediaDevicesProvider, screen sharing doesn&#39;t enumerate available sources.
Instead, the browser displays a picker for the user to select what to share.

---

## ScreenShareProvider
::hr-underline
::

The ScreenShareProvider component manages screen sharing functionality
and exposes the screen stream and control functions to its child components
via scoped slots and provide/inject.

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `autoStart`{.primary .text-primary} | `boolean` | false | Automatically start screen sharing on mount. |
| `defaultOptions`{.primary .text-primary} | `ScreenShareOptions` | - | Default options to use when starting screen share. |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | Slot for child components to access screen sharing state and controls |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `ScreenShareStreamKey`{.primary .text-primary} | `screenStream` | `Ref<MediaStream \| null>` | Provide screen sharing state and controls to child components. |
| `ScreenShareStateKey`{.primary .text-primary} | `shareState` | `Ref<ScreenShareState>` | — |
| `ScreenShareTypeKey`{.primary .text-primary} | `shareType` | `Ref<ScreenShareType \| null>` | — |
| `ScreenShareErrorsKey`{.primary .text-primary} | `errors` | `Ref<Error[]>` | — |
| `ScreenShareStartKey`{.primary .text-primary} | `startScreenShare` | `ScreenShareStartFn` | — |
| `ScreenShareStopKey`{.primary .text-primary} | `stopScreenShare` | `ScreenShareStopFn` | — |

---

## ScreenShareViewer
::hr-underline
::

The ScreenShareViewer component displays the shared screen in a video element.
It automatically connects to the screen stream provided by ScreenShareProvider.

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `options`{.primary .text-primary} | `ScreenShareOptions` | - | Options to pass when starting screen share. |
| `autoPlay`{.primary .text-primary} | `boolean` | true | Whether the video should start playing automatically. |
| `muted`{.primary .text-primary} | `boolean` | true | Whether the video should be muted. |
| `controls`{.primary .text-primary} | `boolean` | false | Whether to show video controls. |
| `class`{.primary .text-primary} | `string` | - | CSS class to apply to the video element. |
| `autoStart`{.primary .text-primary} | `boolean` | false | Whether to automatically start screen sharing when mounted.
If true, will call startShare() on mount if not already sharing. |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `ScreenShareStreamKey`{.primary .text-primary} | — | — | Inject screen sharing state and controls from parent ScreenShareProvider. |
| `ScreenShareStateKey`{.primary .text-primary} | — | — | — |
| `ScreenShareStartKey`{.primary .text-primary} | — | — | — |
| `ScreenShareStopKey`{.primary .text-primary} | — | — | — |

---

  ## Advanced Usage
  ::hr-underline
  ::

### Advanced Options
::hr-underline
::

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <screen-share-provider-demo-advanced />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ScreenShareProvider,
  ScreenShareViewer,
  type ScreenShareOptions,
} from "..";

const includeAudio = ref(false);
const preferCurrentTab = ref(false);
const surfaceSwitching = ref<"include" | "exclude">("include");
const systemAudio = ref<"include" | "exclude">("exclude");

const shareOptions = computed<ScreenShareOptions>(() => ({
  video: true,
  audio: includeAudio.value,
  preferCurrentTab: preferCurrentTab.value,
  surfaceSwitching: surfaceSwitching.value,
  systemAudio: systemAudio.value,
}));
</script>

<template>
  <div class="space-y-4">
    <ScreenShareProvider>
      <template>
        <div class="space-y-4">
          <div class="border rounded-lg p-4 bg-muted/30 space-y-4">
            <Label class="text-sm font-bold">Screen Share Options</Label>

            <div class="grid md:grid-cols-2 gap-4">
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="includeAudio"
                    v-model="includeAudio"
                    :disabled="isSharing"
                    class="h-4 w-4 rounded border-gray-300"
                  />
                  <label
                    for="includeAudio"
                    class="text-sm font-medium leading-none"
                  >
                    Include system audio
                  </label>
                </div>

                <div class="space-y-2">
                  <Label for="systemAudio" class="text-sm"
                    >System audio option:</Label
                  >
                  <select
                    id="systemAudio"
                    v-model="systemAudio"
                    :disabled="isSharing"
                    class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value="include">Include</option>
                    <option value="exclude">Exclude</option>
                  </select>
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="preferCurrentTab"
                    v-model="preferCurrentTab"
                    :disabled="isSharing"
                    class="h-4 w-4 rounded border-gray-300"
                  />
                  <label
                    for="preferCurrentTab"
                    class="text-sm font-medium leading-none"
                  >
                    Prefer current tab (Chrome/Edge)
                  </label>
                </div>

                <div class="space-y-2">
                  <Label for="surfaceSwitching" class="text-sm"
                    >Surface switching:</Label
                  >
                  <select
                    id="surfaceSwitching"
                    v-model="surfaceSwitching"
                    :disabled="isSharing"
                    class="w-full px-3 py-2 text-sm rounded-md border border-input bg-background"
                  >
                    <option value="include">Include</option>
                    <option value="exclude">Exclude</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <Button
              @click="() => startShare(shareOptions)"
              :disabled="isSharing"
            >
              {{ isSharing ? "Sharing..." : "Start Screen Share" }}
            </Button>

            <Button
              @click="stopShare()"
              :disabled="!isSharing"
              variant="destructive"
            >
              Stop Sharing
            </Button>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="border rounded-lg p-4 bg-muted/30 space-y-2">
              <h4 class="font-medium text-sm">Status:</h4>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <span>State:</span>
                  <Badge
                    :variant="
                      shareState === 'active'
                        ? 'default'
                        : shareState === 'error'
                          ? 'destructive'
                          : 'secondary'
                    "
                  >
                    {{ shareState }}
                  </Badge>
                </div>
                <div v-if="shareType" class="flex items-center gap-2">
                  <span>Share Type:</span>
                  <Badge variant="outline">{{ shareType }}</Badge>
                </div>
              </div>
            </div>

            <div class="border rounded-lg p-4 bg-muted/30">
              <h4 class="font-medium mb-2 text-sm">Stream Info:</h4>
              <div v-if="screenStream" class="text-xs space-y-1 font-mono">
                <p>Video tracks: {{ screenStream.getVideoTracks().length }}</p>
                <p>Audio tracks: {{ screenStream.getAudioTracks().length }}</p>
                <p>Total tracks: {{ screenStream.getTracks().length }}</p>
                <p v-if="screenStream.getVideoTracks().length > 0">
                  Active:
                  {{ screenStream.getVideoTracks()[0]?.enabled ? "Yes" : "No" }}
                </p>
              </div>
              <p v-else class="text-xs text-muted-foreground">
                Start sharing to see stream info
              </p>
            </div>
          </div>

          <div
            class="relative bg-black rounded-lg overflow-hidden border border-muted"
            style="aspect-ratio: 16/9"
          >
            <ScreenShareViewer
              v-if="isSharing"
              :auto-play="true"
              :muted="!includeAudio"
              :controls="includeAudio"
              class="w-full h-full object-contain"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center bg-muted/50"
            >
              <p class="text-muted-foreground">
                Configure options and click "Start Screen Share"
              </p>
            </div>

            <div
              v-if="isSharing && shareType"
              class="absolute top-2 left-2 space-y-1 bg-black/70 text-white px-2 py-1 rounded text-xs"
            >
              <div>Sharing: {{ shareType }}</div>
              <div v-if="includeAudio && screenStream?.getAudioTracks().length">
                🎵 Audio enabled
              </div>
            </div>
          </div>
        </div>
      </template>
    </ScreenShareProvider>
  </div>
</template>
```
  :::
::

::tip
You can copy and adapt this template for any component documentation.
::