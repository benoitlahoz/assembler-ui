---
title: AudioVisualizer
description: 
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <audio-visualizer-simple />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
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
  SelectItemText,
} from "@/components/ui/select";
import {
  MediaDevicesProvider,
  AudioDevice,
} from "@/components/ui/media-devices-provider";
import { AudioContextProvider } from "~~/registry/new-york/components/audio-context-provider";
import { AudioVisualizer } from "~~/registry/new-york/components/audio-visualizer";

const selectedId = ref<string | null>(null);
</script>

<template>
  <MediaDevicesProvider :open="true" v-slot="{ microphones, stopAll, errors }">
    <FieldSet>
      <FieldLegend>Audio Inputs</FieldLegend>
      <FieldDescription>
        Select an audio input from the list of available devices.
      </FieldDescription>
      <FieldGroup class="space-y-4">
        <Field>
          <Select :disabled="!microphones.length" v-model="selectedId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select an audio input" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <template v-if="microphones.length">
                  <SelectItem
                    v-for="microphone in microphones"
                    :key="microphone.deviceId"
                    :name="microphone.label"
                    :value="microphone.deviceId"
                    class="truncate"
                  >
                    <SelectItemText>
                      {{ microphone.label || "Unnamed Device" }}
                    </SelectItemText>
                  </SelectItem>
                </template>
                <template v-else>
                  <SelectLabel>No Devices Found</SelectLabel>
                </template>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>
    </FieldSet>

    <AudioDevice
      v-if="selectedId"
      :device-id="selectedId ?? ''"
      auto-start
      v-slot="{ stream }"
    >
      <AudioContextProvider v-slot="{ context, errors, state }">
        <AudioVisualizer
          :stream="stream"
          :context="context"
          :width="600"
          :height="200"
        />
        <template v-if="errors && errors.length">
          <div class="text-red-500 text-xs mt-2">
            <div v-for="(err, i) in errors" :key="i">{{ err.message }}</div>
          </div>
        </template>
        <template v-if="state !== 'running'">
          <div class="text-yellow-500 text-xs mt-2">AudioContext non actif</div>
        </template>
      </AudioContextProvider>
    </AudioDevice>
  </MediaDevicesProvider>
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
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-visualizer.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-visualizer.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-visualizer.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-visualizer.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/audio-visualizer/index.ts"}

```ts [src/components/ui/audio-visualizer/index.ts]
export { default as AudioVisualizer } from "./AudioVisualizer.vue";

export { type AudioVisualizerProps } from "./AudioVisualizer.vue";
```

```vue [src/components/ui/audio-visualizer/AudioVisualizer.vue]
<script setup lang="ts">
import { ref, onUnmounted, watch } from "vue";

export interface AudioVisualizerProps {
  stream?: MediaStream | null;
  context?: AudioContext | null;
  width?: number;
  height?: number;
  fftSize?: number;
  lineWidth?: number;
  background?: string;
  colors?: string[];
}

const props = withDefaults(defineProps<AudioVisualizerProps>(), {
  width: 600,
  height: 200,
  fftSize: 2048,
  lineWidth: 2,
  colors: () => ["#ff5252", "#448aff", "#43a047", "#ffd600"],
  audioContext: null,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let channelData: Float32Array[] = [];

const draw = () => {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  ctx.save();

  if (props.background) ctx.fillStyle = props.background;

  ctx.fillRect(0, 0, props.width, props.height);
  ctx.restore();
  const channels = analyser.channelCount || 1;
  for (let ch = 0; ch < channels; ch++) {
    if (!channelData[ch] || !(channelData[ch] instanceof Float32Array)) {
      channelData[ch] = new Float32Array(props.fftSize);
    }
    const data = channelData[ch] as Float32Array<ArrayBuffer>;

    if (!data) continue;

    analyser.getFloatTimeDomainData(data);
    ctx.beginPath();
    const yOffset = (props.height / channels) * ch;
    for (let i = 0; i < data.length; i++) {
      const value =
        typeof data[i] === "number" && Number.isFinite(data[i]) ? data[i] : 0;

      if (!value) continue;

      const x = (i / data.length) * props.width;
      const y =
        yOffset +
        (value * (props.height / channels)) / 2 +
        props.height / channels / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    const color =
      Array.isArray(props.colors) &&
      typeof props.colors[ch % props.colors.length] === "string"
        ? props.colors[ch % props.colors.length]
        : "#fff";

    if (!color) continue;

    ctx.strokeStyle = color;
    ctx.lineWidth = props.lineWidth ?? 2;
    ctx.stroke();
  }
  animationId = requestAnimationFrame(draw);
};

const setupAudio = () => {
  if (!props.context || !props.stream) return;
  source = props.context.createMediaStreamSource(props.stream);
  analyser = props.context.createAnalyser();
  analyser.fftSize = props.fftSize;
  source.connect(analyser);
  draw();
};

watch(
  () => [props.context, props.stream],
  ([audioContext, stream]) => {
    if (audioContext && stream) {
      setupAudio();
    } else {
      if (animationId) cancelAnimationFrame(animationId);
      analyser = null;
      source = null;
      channelData = [];
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  analyser = null;
  source = null;
  channelData = [];
});
</script>

<template>
  <canvas
    ref="canvasRef"
    :width="width"
    :height="height"
    class="w-full border border-border"
  />
</template>
```
:::

## AudioVisualizer
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `stream`{.primary .text-primary} | `MediaStream \| null` | - |  |
| `context`{.primary .text-primary} | `AudioContext \| null` | - |  |
| `width`{.primary .text-primary} | `number` | 600 |  |
| `height`{.primary .text-primary} | `number` | 200 |  |
| `fftSize`{.primary .text-primary} | `number` | 2048 |  |
| `lineWidth`{.primary .text-primary} | `number` | 2 |  |
| `background`{.primary .text-primary} | `string` | - |  |
| `colors`{.primary .text-primary} | `string[]` | #ff5252,#448aff,#43a047,#ffd600 |  |

---

::tip
You can copy and adapt this template for any component documentation.
::