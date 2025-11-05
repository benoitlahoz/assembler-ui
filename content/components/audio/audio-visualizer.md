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
          mode="fft-enhanced"
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

export { type AudioVisualizerMode } from "./AudioVisualizer.vue";

export { type AudioVisualizerProps } from "./AudioVisualizer.vue";
```

```vue [src/components/ui/audio-visualizer/AudioVisualizer.vue]
<script setup lang="ts">
import { ref, onUnmounted, watch, computed } from "vue";
import { drawWaveforms } from "./visualizers/drawWaveform";
import { drawFrequencyBars } from "./visualizers/drawFrequencyBars";
import { drawFft } from "./visualizers/drawFft";
import { drawFftEnhanced } from "./visualizers/drawFftEnhanced";

export type AudioVisualizerMode =
  | "waveform"
  | "frequency-bars"
  | "fft"
  | "fft-enhanced";

export interface AudioVisualizerProps {
  mode?: AudioVisualizerMode;
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
  mode: "waveform",
  width: 600,
  height: 200,
  fftSize: 2048,
  lineWidth: 2,
  colors: () => ["#ff5252", "#448aff", "#43a047", "#ffd600"],
  audioContext: null,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const animationId = ref<number | null>(null);
let analyser: AnalyserNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let channelData: Float32Array[] = [];

const drawFunction = computed(() => {
  switch (props.mode) {
    case "frequency-bars":
      return drawFrequencyBars;
    case "fft":
      return drawFft;
    case "fft-enhanced":
      return drawFftEnhanced;
    case "waveform":
    default:
      return drawWaveforms;
  }
});

const draw = () => {
  drawFunction.value({
    analyser,
    canvasRef,
    props,
    channelData,
    animationIdRef: animationId,
  });
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
      if (animationId.value) cancelAnimationFrame(animationId.value);
      analyser = null;
      source = null;
      channelData = [];
    }
  },
  { immediate: true },
);

watch(
  () => props.mode,
  () => {
    if (animationId.value) cancelAnimationFrame(animationId.value);
    draw();
  },
);

onUnmounted(() => {
  if (animationId.value) cancelAnimationFrame(animationId.value);
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

```ts [src/components/ui/audio-visualizer/visualizers/drawFft.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawFftParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawFft({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawFftParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  const width = props.width ?? 600;
  const height = props.height ?? 200;

  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.save();
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  analyser.getFloatFrequencyData(dataArray);

  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const value =
      typeof dataArray[i] === "number" && Number.isFinite(dataArray[i])
        ? dataArray[i]
        : -100;

    if (!value) continue;

    const magnitude = Math.max(0, Math.min(1, (value + 100) / 100));
    const x = (i / bufferLength) * width;
    const y = height - magnitude * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  let strokeColor = "#fff";
  if (
    Array.isArray(props.colors) &&
    props.colors.length > 0 &&
    typeof props.colors[0] === "string"
  ) {
    strokeColor = props.colors[0] ?? "#fff";
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = props.lineWidth ?? 2;
  ctx.stroke();
  ctx.restore();

  animationIdRef.value = requestAnimationFrame(() =>
    drawFft({ analyser, canvasRef, props, channelData, animationIdRef }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawFftEnhanced.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawFftEnhancedParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawFftEnhanced({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawFftEnhancedParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  const width = props.width ?? 600;
  const height = props.height ?? 200;

  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.save();
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const bufferLength = analyser.frequencyBinCount;
  const channels = analyser.channelCount || 1;
  for (let ch = 0; ch < channels; ch++) {
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatFrequencyData(dataArray);

    const yOffset = (height / channels) * ch;

    ctx.save();
    let glowColor = "#00eaff";
    if (
      Array.isArray(props.colors) &&
      props.colors.length > 0 &&
      typeof props.colors[ch % props.colors.length] === "string"
    ) {
      glowColor = props.colors[ch % props.colors.length] ?? "#00eaff";
    }
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
      const value = Number.isFinite(dataArray[i]) ? dataArray[i] : -100;
      const magnitude = Math.max(0, Math.min(1, (value + 100) / 100));
      const x = (i / bufferLength) * width;
      const y = yOffset + height / channels - magnitude * (height / channels);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineTo(width, yOffset + height / channels);
    ctx.lineTo(0, yOffset + height / channels);
    ctx.closePath();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = glowColor;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = props.lineWidth ?? 2;
    ctx.stroke();
    ctx.restore();
  }

  animationIdRef.value = requestAnimationFrame(() =>
    drawFftEnhanced({
      analyser,
      canvasRef,
      props,
      channelData,
      animationIdRef,
    }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawFrequencyBars.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawFrequencyBarsParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawFrequencyBars({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawFrequencyBarsParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  ctx.save();

  const width = props.width ?? 600;
  const height = props.height ?? 200;

  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.save();
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  analyser.getFloatFrequencyData(dataArray);

  const barWidth = width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const value =
      typeof dataArray[i] === "number" && Number.isFinite(dataArray[i])
        ? dataArray[i]
        : -100;

    if (!value) continue;

    const magnitude = Math.max(0, Math.min(1, (value + 100) / 100));
    const barHeight = magnitude * height;
    const x = i * barWidth;
    const y = height - barHeight;
    let color = "#fff";
    if (Array.isArray(props.colors) && props.colors.length > 0) {
      color = props.colors[i % props.colors.length] ?? "#fff";
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);
  }
  animationIdRef.value = requestAnimationFrame(() =>
    drawFrequencyBars({
      analyser,
      canvasRef,
      props,
      channelData,
      animationIdRef,
    }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawWaveform.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawVisualizerParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawWaveforms({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawVisualizerParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  ctx.save();

  if (props.background) ctx.fillStyle = props.background;

  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const fftSize = props.fftSize ?? 2048;

  ctx.fillRect(0, 0, width, height);
  ctx.restore();
  const channels = analyser.channelCount || 1;
  for (let ch = 0; ch < channels; ch++) {
    if (!channelData[ch] || !(channelData[ch] instanceof Float32Array)) {
      channelData[ch] = new Float32Array(fftSize);
    }
    const data = channelData[ch] as Float32Array<ArrayBuffer>;

    if (!data) continue;

    analyser.getFloatTimeDomainData(data);
    ctx.beginPath();
    const yOffset = (height / channels) * ch;
    for (let i = 0; i < data.length; i++) {
      const value =
        typeof data[i] === "number" && Number.isFinite(data[i]) ? data[i] : 0;

      if (!value) continue;

      const x = (i / data.length) * width;
      const y =
        yOffset + (value * (height / channels)) / 2 + height / channels / 2;
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
  animationIdRef.value = requestAnimationFrame(() =>
    drawWaveforms({ analyser, canvasRef, props, channelData, animationIdRef }),
  );
}
```

```ts [src/components/ui/audio-visualizer/index.ts]
export { default as AudioVisualizer } from "./AudioVisualizer.vue";

export { type AudioVisualizerMode } from "./AudioVisualizer.vue";

export { type AudioVisualizerProps } from "./AudioVisualizer.vue";
```

```vue [src/components/ui/audio-visualizer/AudioVisualizer.vue]
<script setup lang="ts">
import { ref, onUnmounted, watch, computed } from "vue";
import { drawWaveforms } from "./visualizers/drawWaveform";
import { drawFrequencyBars } from "./visualizers/drawFrequencyBars";
import { drawFft } from "./visualizers/drawFft";
import { drawFftEnhanced } from "./visualizers/drawFftEnhanced";

export type AudioVisualizerMode =
  | "waveform"
  | "frequency-bars"
  | "fft"
  | "fft-enhanced";

export interface AudioVisualizerProps {
  mode?: AudioVisualizerMode;
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
  mode: "waveform",
  width: 600,
  height: 200,
  fftSize: 2048,
  lineWidth: 2,
  colors: () => ["#ff5252", "#448aff", "#43a047", "#ffd600"],
  audioContext: null,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const animationId = ref<number | null>(null);
let analyser: AnalyserNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let channelData: Float32Array[] = [];

const drawFunction = computed(() => {
  switch (props.mode) {
    case "frequency-bars":
      return drawFrequencyBars;
    case "fft":
      return drawFft;
    case "fft-enhanced":
      return drawFftEnhanced;
    case "waveform":
    default:
      return drawWaveforms;
  }
});

const draw = () => {
  drawFunction.value({
    analyser,
    canvasRef,
    props,
    channelData,
    animationIdRef: animationId,
  });
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
      if (animationId.value) cancelAnimationFrame(animationId.value);
      analyser = null;
      source = null;
      channelData = [];
    }
  },
  { immediate: true },
);

watch(
  () => props.mode,
  () => {
    if (animationId.value) cancelAnimationFrame(animationId.value);
    draw();
  },
);

onUnmounted(() => {
  if (animationId.value) cancelAnimationFrame(animationId.value);
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

```ts [src/components/ui/audio-visualizer/visualizers/drawFft.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawFftParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawFft({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawFftParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  const width = props.width ?? 600;
  const height = props.height ?? 200;

  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.save();
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  analyser.getFloatFrequencyData(dataArray);

  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const value =
      typeof dataArray[i] === "number" && Number.isFinite(dataArray[i])
        ? dataArray[i]
        : -100;

    if (!value) continue;

    const magnitude = Math.max(0, Math.min(1, (value + 100) / 100));
    const x = (i / bufferLength) * width;
    const y = height - magnitude * height;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  let strokeColor = "#fff";
  if (
    Array.isArray(props.colors) &&
    props.colors.length > 0 &&
    typeof props.colors[0] === "string"
  ) {
    strokeColor = props.colors[0] ?? "#fff";
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = props.lineWidth ?? 2;
  ctx.stroke();
  ctx.restore();

  animationIdRef.value = requestAnimationFrame(() =>
    drawFft({ analyser, canvasRef, props, channelData, animationIdRef }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawFftEnhanced.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawFftEnhancedParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawFftEnhanced({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawFftEnhancedParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  const width = props.width ?? 600;
  const height = props.height ?? 200;

  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.save();
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const bufferLength = analyser.frequencyBinCount;
  const channels = analyser.channelCount || 1;
  for (let ch = 0; ch < channels; ch++) {
    const dataArray = new Float32Array(bufferLength);
    analyser.getFloatFrequencyData(dataArray);

    const yOffset = (height / channels) * ch;

    ctx.save();
    let glowColor = "#00eaff";
    if (
      Array.isArray(props.colors) &&
      props.colors.length > 0 &&
      typeof props.colors[ch % props.colors.length] === "string"
    ) {
      glowColor = props.colors[ch % props.colors.length] ?? "#00eaff";
    }
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
      const value = Number.isFinite(dataArray[i]) ? dataArray[i] : -100;
      const magnitude = Math.max(0, Math.min(1, (value + 100) / 100));
      const x = (i / bufferLength) * width;
      const y = yOffset + height / channels - magnitude * (height / channels);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.lineTo(width, yOffset + height / channels);
    ctx.lineTo(0, yOffset + height / channels);
    ctx.closePath();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = glowColor;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = glowColor;
    ctx.lineWidth = props.lineWidth ?? 2;
    ctx.stroke();
    ctx.restore();
  }

  animationIdRef.value = requestAnimationFrame(() =>
    drawFftEnhanced({
      analyser,
      canvasRef,
      props,
      channelData,
      animationIdRef,
    }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawFrequencyBars.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawFrequencyBarsParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawFrequencyBars({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawFrequencyBarsParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  ctx.save();

  const width = props.width ?? 600;
  const height = props.height ?? 200;

  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.save();
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  analyser.getFloatFrequencyData(dataArray);

  const barWidth = width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const value =
      typeof dataArray[i] === "number" && Number.isFinite(dataArray[i])
        ? dataArray[i]
        : -100;

    if (!value) continue;

    const magnitude = Math.max(0, Math.min(1, (value + 100) / 100));
    const barHeight = magnitude * height;
    const x = i * barWidth;
    const y = height - barHeight;
    let color = "#fff";
    if (Array.isArray(props.colors) && props.colors.length > 0) {
      color = props.colors[i % props.colors.length] ?? "#fff";
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);
  }
  animationIdRef.value = requestAnimationFrame(() =>
    drawFrequencyBars({
      analyser,
      canvasRef,
      props,
      channelData,
      animationIdRef,
    }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawWaveform.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawVisualizerParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawWaveforms({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawVisualizerParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  ctx.save();

  if (props.background) ctx.fillStyle = props.background;

  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const fftSize = props.fftSize ?? 2048;

  ctx.fillRect(0, 0, width, height);
  ctx.restore();
  const channels = analyser.channelCount || 1;
  for (let ch = 0; ch < channels; ch++) {
    if (!channelData[ch] || !(channelData[ch] instanceof Float32Array)) {
      channelData[ch] = new Float32Array(fftSize);
    }
    const data = channelData[ch] as Float32Array<ArrayBuffer>;

    if (!data) continue;

    analyser.getFloatTimeDomainData(data);
    ctx.beginPath();
    const yOffset = (height / channels) * ch;
    for (let i = 0; i < data.length; i++) {
      const value =
        typeof data[i] === "number" && Number.isFinite(data[i]) ? data[i] : 0;

      if (!value) continue;

      const x = (i / data.length) * width;
      const y =
        yOffset + (value * (height / channels)) / 2 + height / channels / 2;
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
  animationIdRef.value = requestAnimationFrame(() =>
    drawWaveforms({ analyser, canvasRef, props, channelData, animationIdRef }),
  );
}
```
:::

## AudioVisualizer
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `mode`{.primary .text-primary} | `AudioVisualizerMode` | waveform |  |
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