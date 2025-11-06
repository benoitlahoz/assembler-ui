---
title: AudioVisualizer
description: 
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <audio-motion-simple />
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
import { AudioMotion } from "~~/registry/new-york/components/audio-visualizer";

const selectedId = ref<string | null>(null);

const selectedMode = ref<
  | "fft"
  | "fft-enhanced"
  | "waveform"
  | "frequency-bars"
  | "mirrored-spectrum"
  | "peak-hold"
  | "spectrogram"
  | "scope-xy"
  | "waterfall"
  | "led-bars"
>("fft-enhanced");
const visualizerModes = [
  { value: "fft", label: "FFT" },
  { value: "fft-enhanced", label: "Enhanced FFT" },
  { value: "waveform", label: "Waveform" },
  { value: "frequency-bars", label: "Bars" },
  { value: "mirrored-spectrum", label: "Mirrored Spectrum" },
  { value: "peak-hold", label: "Peak Hold" },
  { value: "spectrogram", label: "Spectrogram" },
  { value: "scope-xy", label: "Scope XY" },
  { value: "waterfall", label: "Waterfall" },
  { value: "led-bars", label: "LED Bars" },
];
</script>

<template>
  <MediaDevicesProvider :open="true" v-slot="{ microphones, stopAll, errors }">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
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

      <FieldSet>
        <FieldLegend>Visualization Mode</FieldLegend>
        <FieldDescription>
          Choose the display mode for the audio visualizer.
        </FieldDescription>
        <FieldGroup class="space-y-4">
          <Field>
            <Select v-model="selectedMode">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="mode in visualizerModes"
                    :key="mode.value"
                    :value="mode.value"
                  >
                    <SelectItemText>{{ mode.label }}</SelectItemText>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>

    <AudioDevice
      v-if="selectedId"
      :device-id="selectedId ?? ''"
      auto-start
      echo-cancellation
      v-slot="{ stream }"
    >
      <AudioContextProvider v-slot="{ errors, state }">
        <AudioMotion
          :stream="stream"
          class="bg-linear-to-b from-primary to-background"
        >
          <canvas width="600" height="400" />
        </AudioMotion>

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
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as AudioVisualizer } from "./AudioVisualizer.vue";
export { default as AudioMotion } from "./AudioMotion.vue";

export const motionVariants = cva("", {
  variants: {
    gradient: {
      classic: "classic",
      orangered: "orangered",
      prism: "prism",
      rainbow: "rainbow",
      steelblue: "steelblue",
    },
  },
  defaultVariants: {
    gradient: "classic",
  },
});

export type AudioMotionVariants = VariantProps<typeof motionVariants>;

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
import { drawMirroredSpectrum } from "./visualizers/drawMirroredSpectrum";
import { drawPeakHold } from "./visualizers/drawPeakHold";
import { drawSpectrogram } from "./visualizers/drawSpectrogram";
import { drawScopeXY } from "./visualizers/drawScopeXY";
import { drawWaterfall } from "./visualizers/drawWaterfall";
import { drawLedBars } from "./visualizers/drawLedBars";

export type AudioVisualizerMode =
  | "waveform"
  | "frequency-bars"
  | "fft"
  | "fft-enhanced"
  | "mirrored-spectrum"
  | "peak-hold"
  | "spectrogram"
  | "scope-xy"
  | "waterfall"
  | "led-bars";

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
    case "mirrored-spectrum":
      return drawMirroredSpectrum;
    case "peak-hold":
      return drawPeakHold;
    case "spectrogram":
      return drawSpectrogram;
    case "scope-xy":
      return drawScopeXY;
    case "waterfall":
      return drawWaterfall;
    case "led-bars":
      return drawLedBars;
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

```vue [src/components/ui/audio-visualizer/AudioMotion.vue]
<script setup lang="ts">
import AudioMotionAnalyzer from "audiomotion-analyzer";
import {
  type Ref,
  type HTMLAttributes,
  inject,
  ref,
  watch,
  nextTick,
  useTemplateRef,
  unref,
  onUnmounted,
  computed,
} from "vue";
import { AudioContextInjectionKey } from "@/components/ui/audio-context-provider";
import { useTypedElementSearch } from "~~/registry/new-york/composables/use-typed-element-search/useTypedElementSearch";
import { useTailwindClassParser } from "~~/registry/new-york/composables/use-tailwind-class-parser/useTailwindClassParser";

export interface AudioMotionAnalyzerProps {
  class?: HTMLAttributes["class"];
  stream?: MediaStream | null;
  audio?: HTMLAudioElement | Ref<HTMLAudioElement | null> | null;
  gradient?: "classic" | "orangered" | "prism" | "rainbow" | "steelblue";
}

const props = withDefaults(defineProps<AudioMotionAnalyzerProps>(), {
  stream: undefined,
  audio: undefined,
  gradient: "classic",
});

const { getTypedElementAmongSiblings, getContainer } = useTypedElementSearch();
const { getTailwindBaseCssValues, parseLinearGradient } =
  useTailwindClassParser();

const noDisplayElement = useTemplateRef("noDisplayRef");
const injectedContext = inject<Ref<AudioContext | null>>(
  AudioContextInjectionKey,
  ref(null),
);

let analyzer: AudioMotionAnalyzer | null = null;
let source: MediaStreamAudioSourceNode | null = null;

const setupAudio = async () => {
  if (analyzer) {
    analyzer.destroy();
    analyzer = null;
  }

  const canvas: HTMLCanvasElement | null = searchCanvas();
  const container: HTMLElement | null = searchContainer();

  if (props.audio) {
    const audioElement =
      props.audio instanceof HTMLAudioElement ? props.audio : props.audio.value;
    if (audioElement) {
      if (!canvas && container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        analyzer = new AudioMotionAnalyzer(container, {
          source: audioElement,
          width,
          height,
          gradient: props.gradient,
          mode: 3,
          barSpace: 0.6,
          ledBars: true,
          connectSpeakers: false,
        });
      } else if (canvas) {
        analyzer = new AudioMotionAnalyzer({
          source: audioElement,
          canvas: canvas,
          width: canvas.width,
          height: canvas.height,
          gradient: props.gradient,
          mode: 3,
          barSpace: 0.6,
          ledBars: true,
          connectSpeakers: false,
        });
      } else {
        console.error(
          "No valid container or canvas found for AudioMotionAnalyzer with audio element.",
        );
      }
    }
  } else if (props.stream) {
    if (source) {
      source.disconnect();
      source = null;
    }
    const context = injectedContext.value || new AudioContext();
    source = context.createMediaStreamSource(props.stream);

    if (!canvas && container) {
      const width = container.clientWidth;
      const height = container.clientHeight;
      analyzer = new AudioMotionAnalyzer(container, {
        audioCtx: context,
        width,
        height,
        gradient: props.gradient,
        mode: 3,
        barSpace: 0.6,
        ledBars: true,
        connectSpeakers: false,
      });
      analyzer.connectInput(source);
    } else if (canvas) {
      const width = canvas.width;
      const height = canvas.height;
      analyzer = new AudioMotionAnalyzer({
        audioCtx: context,
        canvas,
        width,
        height,
        gradient: props.gradient,
        mode: 3,
        barSpace: 0.6,
        ledBars: true,
        connectSpeakers: false,
      });

      const computedGradient = handleGradientClass();
      if (computedGradient) {
        analyzer.registerGradient("custom", computedGradient as any);
        analyzer.gradient = "custom";
      }
      analyzer.connectInput(source);
    } else {
      console.error(
        "No valid container or canvas found for AudioMotionAnalyzer with media stream.",
      );
    }
  } else {
    console.error(
      "No audio source (audio element or media stream) provided to AudioMotionAnalyzer.",
    );
  }
};

const searchCanvas = (): HTMLCanvasElement | null => {
  const el = unref(noDisplayElement);
  return el
    ? getTypedElementAmongSiblings(
        el,
        (el): el is HTMLCanvasElement => el instanceof HTMLCanvasElement,
      )
    : null;
};

const searchContainer = (): HTMLElement | null => {
  const el = unref(noDisplayElement);
  return el ? getContainer(el) : null;
};

const cleanUp = () => {
  if (analyzer) {
    analyzer.destroy();
    analyzer = null;
  }
  if (source) {
    source.disconnect();
    source = null;
  }
};

const handleGradientClass = () => {
  const el = document.createElement("div");
  el.className = props.class || "";
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.zIndex = "-9999";
  document.body.appendChild(el);
  const computedClass = getTailwindBaseCssValues(el, ["background-image"]);
  console.warn("Computed Class:", computedClass);
  const computedGradient =
    computedClass["background-image"] &&
    computedClass["background-image"] !== "none"
      ? parseLinearGradient(computedClass["background-image"])
      : null;

  let gradient: {
    dir?: "h" | "v" | undefined;
    colorStops: Array<{ color: string; pos: number }>;
  } | null = null;

  if (computedGradient) {
    gradient = { dir: "v", colorStops: [] };
    gradient.dir =
      computedGradient.direction.includes("bottom") ||
      computedGradient.direction.includes("top")
        ? "v"
        : "h";
    gradient.colorStops = computedGradient.stops;
  }
  document.body.removeChild(el);
  return gradient;
};

watch(
  () => [props.stream, props.audio, props.class, injectedContext.value],
  () => {
    nextTick(async () => {
      await setupAudio();
    });
  },
  { immediate: true },
);

onUnmounted(() => {
  cleanUp();
});
</script>

<template>
  <div ref="noDisplayRef" class="hidden z-[-9999]" />
  <slot />
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

      if (!value) continue;

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

```ts [src/components/ui/audio-visualizer/visualizers/drawLedBars.ts]
import type { Ref } from "vue";

export function drawLedBars({
  canvasRef,
  data,
  props,
}: {
  canvasRef: Ref<HTMLCanvasElement | null>;
  data: Float32Array[];
  props: any;
}) {
  const canvas = canvasRef?.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const colors = props.colors ?? ["#00ff00", "#00eaff", "#ffea00", "#ff00ea"];
  const barCount = props.barCount ?? 32;
  const ledRows = props.ledRows ?? 12;
  const spacing = props.spacing ?? 2;
  const ledRadius = props.ledRadius ?? 6;
  const background = props.background ?? "#111";

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const channel = data[0] ?? new Float32Array(barCount);
  const barWidth = (width - spacing * (barCount - 1)) / barCount;
  const maxVal = 1;

  for (let i = 0; i < barCount; i++) {
    const value = Math.max(0, Math.min(channel[i] ?? 0, maxVal));

    const ledsOn = Math.round(value * ledRows);
    for (let j = 0; j < ledRows; j++) {
      const x = i * (barWidth + spacing) + barWidth / 2;

      const totalLedHeight = ledRows * (ledRadius * 2 + spacing);
      const yStart = height - totalLedHeight + ledRadius;
      const y = yStart + j * (ledRadius * 2 + spacing);

      if (y < 0 || y > height) continue;

      const colorIdx = Math.floor((j / ledRows) * colors.length);
      const ledColor: string = colors[colorIdx] || colors[0];
      if (j < ledsOn) {
        ctx.beginPath();
        ctx.arc(x, y, ledRadius, 0, Math.PI * 2);
        ctx.fillStyle = ledColor;
        ctx.shadowColor = ledColor;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.95;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.arc(x, y, ledRadius, 0, Math.PI * 2);
        ctx.fillStyle = background;
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
  ctx.restore();
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawMirroredSpectrum.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawMirroredSpectrumParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawMirroredSpectrum({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawMirroredSpectrumParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
  }
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  const barWidth = width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const value = dataArray[i];
    const barHeight = (value / 255) * (height / 2);
    const x = i * barWidth;

    ctx.fillStyle = `hsl(${(i / bufferLength) * 360}, 80%, 60%)`;
    ctx.fillRect(x, height / 2 - barHeight, barWidth, barHeight);

    ctx.fillRect(x, height / 2, barWidth, barHeight);
  }
  animationIdRef.value = requestAnimationFrame(() =>
    drawMirroredSpectrum({
      analyser,
      canvasRef,
      props,
      channelData,
      animationIdRef,
    }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawPeakHold.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

const PEAK_DECAY = 0.97;
let peakArray: number[] = [];

export interface DrawPeakHoldParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawPeakHold({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawPeakHoldParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
  }
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  if (peakArray.length !== bufferLength)
    peakArray = new Array(bufferLength).fill(0);
  const barWidth = width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const value = dataArray[i];
    if (value > peakArray[i]) peakArray[i] = value;
    else peakArray[i] *= PEAK_DECAY;
    const barHeight = (value / 255) * height;
    const peakHeight = (peakArray[i] / 255) * height;
    const x = i * barWidth;
    ctx.fillStyle = props.colors?.[0] ?? "#43a047";
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);

    ctx.fillStyle = "#ffd600";
    ctx.fillRect(x, height - peakHeight - 2, barWidth, 2);
  }
  animationIdRef.value = requestAnimationFrame(() =>
    drawPeakHold({ analyser, canvasRef, props, channelData, animationIdRef }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawScopeXY.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawScopeXYParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawScopeXY({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawScopeXYParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
  }
  const fftSize = props.fftSize ?? 2048;

  if (!channelData[0] || !(channelData[0] instanceof Float32Array))
    channelData[0] = new Float32Array(fftSize);
  if (!channelData[1] || !(channelData[1] instanceof Float32Array))
    channelData[1] = new Float32Array(fftSize);
  analyser.getFloatTimeDomainData(channelData[0] as Float32Array<ArrayBuffer>);
  analyser.getFloatTimeDomainData(channelData[1] as Float32Array<ArrayBuffer>);
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < fftSize; i++) {
    const x = (channelData[0][i] + 1) * (width / 2);
    const y = (channelData[1][i] + 1) * (height / 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = props.colors?.[0] ?? "#448aff";
  ctx.lineWidth = props.lineWidth ?? 2;
  ctx.stroke();
  ctx.restore();
  animationIdRef.value = requestAnimationFrame(() =>
    drawScopeXY({ analyser, canvasRef, props, channelData, animationIdRef }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawSpectrogram.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

let spectrogramData: ImageData | null = null;

export interface DrawSpectrogramParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawSpectrogram({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawSpectrogramParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const bufferLength = analyser.frequencyBinCount;
  if (
    !spectrogramData ||
    spectrogramData.width !== width ||
    spectrogramData.height !== height
  ) {
    spectrogramData = ctx.createImageData(width, height);
    for (let i = 0; i < spectrogramData.data.length; i++)
      spectrogramData.data[i] = 255;
  }

  ctx.putImageData(spectrogramData, -1, 0);

  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  for (let y = 0; y < height; y++) {
    const freqIdx = Math.floor((y / height) * bufferLength);
    const value = dataArray[freqIdx];
    const color =
      value !== undefined
        ? `hsl(${240 - (value / 255) * 240}, 100%, 50%)`
        : "#000";
    ctx.fillStyle = color;
    ctx.fillRect(width - 1, height - y, 1, 1);
  }

  spectrogramData = ctx.getImageData(0, 0, width, height);
  animationIdRef.value = requestAnimationFrame(() =>
    drawSpectrogram({
      analyser,
      canvasRef,
      props,
      channelData,
      animationIdRef,
    }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawWaterfall.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

let waterfallData: ImageData | null = null;

export interface DrawWaterfallParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawWaterfall({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawWaterfallParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const bufferLength = analyser.frequencyBinCount;
  if (
    !waterfallData ||
    waterfallData.width !== width ||
    waterfallData.height !== height
  ) {
    waterfallData = ctx.createImageData(width, height);
    for (let i = 0; i < waterfallData.data.length; i++)
      waterfallData.data[i] = 255;
  }

  ctx.putImageData(waterfallData, 0, 1);

  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  for (let x = 0; x < width; x++) {
    const freqIdx = Math.floor((x / width) * bufferLength);
    const value = dataArray[freqIdx];
    const color =
      value !== undefined
        ? `hsl(${240 - (value / 255) * 240}, 100%, 50%)`
        : "#000";
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, 1, 1);
  }

  waterfallData = ctx.getImageData(0, 0, width, height);
  animationIdRef.value = requestAnimationFrame(() =>
    drawWaterfall({ analyser, canvasRef, props, channelData, animationIdRef }),
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

```ts [src/components/ui/audio-context-provider/index.ts]
import type { InjectionKey, Ref } from "vue";

export { default as AudioContextProvider } from "./AudioContextProvider.vue";

export const AudioContextInjectionKey: InjectionKey<Ref<AudioContext | null>> =
  Symbol("AudioContext");

export const AudioContextUpdateInjectionKey: InjectionKey<
  (options: {
    latencyHint?: AudioContextLatencyCategory;
    sampleRate?: number;
  }) => void
> = Symbol("AudioContextUpdate");

export const AudioContextLatencyHintKey: InjectionKey<
  Ref<AudioContextLatencyCategory>
> = Symbol("AudioContextLatencyHint");

export const AudioContextSampleRateKey: InjectionKey<Ref<number>> = Symbol(
  "AudioContextSampleRate",
);

export { type AudioContextProviderProps } from "./AudioContextProvider.vue";
```

```vue [src/components/ui/audio-context-provider/AudioContextProvider.vue]
<script setup lang="ts">
import { ref, watch, computed, provide } from "vue";
import { useAudioContext } from "~~/registry/new-york/composables/use-audio-context/useAudioContext";
import {
  AudioContextInjectionKey,
  AudioContextLatencyHintKey,
  AudioContextSampleRateKey,
  AudioContextUpdateInjectionKey,
} from ".";

export interface AudioContextProviderProps {
  latencyHint?: AudioContextLatencyCategory;
  sampleRate?: number;
}

const props = withDefaults(defineProps<AudioContextProviderProps>(), {
  latencyHint: "interactive",
  sampleRate: 44100,
});

const { context, updateContext, errors, state } = useAudioContext({
  latencyHint: props.latencyHint,
  sampleRate: props.sampleRate,
});

const latencyHint = ref(props.latencyHint);
const sampleRate = ref(props.sampleRate);

provide(AudioContextInjectionKey, context);
provide(AudioContextUpdateInjectionKey, updateContext);
provide(AudioContextLatencyHintKey, latencyHint);
provide(AudioContextSampleRateKey, sampleRate);

watch(
  () => [props.latencyHint, props.sampleRate],
  ([newLatencyHint, newSampleRate], [oldLatencyHint, oldSampleRate]) => {
    if (
      newLatencyHint !== oldLatencyHint &&
      typeof newLatencyHint === "string"
    ) {
      latencyHint.value = newLatencyHint as AudioContextLatencyCategory;
    }
    if (newSampleRate !== oldSampleRate && typeof newSampleRate === "number") {
      sampleRate.value = newSampleRate;
    }
    updateContext({
      latencyHint:
        typeof latencyHint.value === "string" ? latencyHint.value : undefined,
      sampleRate: sampleRate.value,
    });
  },
);

defineExpose({
  context: computed(() => context.value),
  updateContext,
  latencyHint,
  sampleRate,
  errors: computed(() => errors.value),
  state: computed(() => state.value),
});
</script>

<template>
  <slot
    :context="context"
    :update-context="updateContext"
    :latency-hint="latencyHint"
    :sample-rate="sampleRate"
    :errors="errors"
    :state="state"
  />
</template>

<style scoped></style>
```

```ts [src/composables/use-typed-element-search/useTypedElementSearch.ts]
export const useTypedElementSearch = () => {
  const searchTypedElementInTree = <T extends Element>(
    root: Element,
    predicate: (el: Element) => el is T,
  ): T | null => {
    if (predicate(root)) return root;
    for (const child of Array.from(root.children)) {
      const found = searchTypedElementInTree(child, predicate);
      if (found) return found;
    }
    return null;
  };

  const getTypedElementAmongSiblings = <T extends Element>(
    refEl: Element,
    predicate: (el: Element) => el is T,
  ): T | null => {
    if (!refEl || !refEl.parentElement) return null;
    const siblings = Array.from(refEl.parentElement.children).filter(
      (el) => el !== refEl,
    );
    for (const sibling of siblings) {
      const found = searchTypedElementInTree(sibling, predicate);
      if (found) return found;
    }
    return null;
  };

  const getContainerOfType = <T extends Element>(
    refEl: Element,
    predicate: (el: Element) => el is T,
  ): T | null => {
    let current: Element | null = refEl.parentElement;
    while (current) {
      if (predicate(current)) return current;
      current = current.parentElement;
    }
    return null;
  };

  const getContainer = (refEl: Element): HTMLElement | null => {
    let current: Element | null = refEl.parentElement;
    while (current) {
      if (current instanceof HTMLElement) return current;
      current = current.parentElement;
    }
    return null;
  };

  return {
    searchTypedElementInTree,
    getTypedElementAmongSiblings,
    getContainerOfType,
    getContainer,
  };
};
```

```ts [src/composables/use-tailwind-class-parser/useTailwindClassParser.ts]
export const useTailwindClassParser = () => {
  const parseTailwindClasses = (classes: string): string[] => {
    return classes
      .split(" ")
      .map((cls) => cls.trim())
      .filter((cls) => cls.length > 0);
  };

  const getTailwindBaseCssValues = (
    el: HTMLElement,
    properties?: string[],
  ): Record<string, string> => {
    const computed = window.getComputedStyle(el);
    const result: Record<string, string> = {};
    if (properties && properties.length > 0) {
      for (const prop of properties) {
        result[prop] = computed.getPropertyValue(prop);
      }
    } else {
      for (let i = 0; i < computed.length; i++) {
        const prop = computed.item(i);
        if (typeof prop === "string") {
          result[prop] = computed.getPropertyValue(prop);
        }
      }
    }

    return result;
  };

  const parseLinearGradient = (gradientStr: string) => {
    const result = {
      direction: "",
      orientation: "unknown",
      stops: [] as Array<{ color: string; pos: number }>,
    };

    const gradientContent = gradientStr
      .replace(/^linear-gradient\(|\)$/gi, "")
      .replace(/^in\s+(\w+)\s*,\s*(.*)$/gi, "");

    let direction = "";
    let stopsPart = "";

    const firstComma = gradientContent.indexOf(",");
    if (firstComma !== -1) {
      const firstPart = gradientContent.slice(0, firstComma).trim();
      if (
        /^(to\s+(right|left|top|bottom)(\s+(right|left|top|bottom))?|[0-9.]+deg)$/.test(
          firstPart,
        )
      ) {
        direction = firstPart;
        stopsPart = gradientContent.slice(firstComma + 1);
      } else {
        direction = "to bottom";
        stopsPart = gradientContent;
      }
    } else {
      direction = gradientContent.trim();
    }
    result.direction = direction;

    if (/to\s+right\b/.test(direction) && /to\s+bottom\b/.test(direction)) {
      result.orientation = "diagonal";
    } else if (/to\s+right\b/.test(direction)) {
      result.orientation = "horizontal";
    } else if (/to\s+left\b/.test(direction)) {
      result.orientation = "horizontal";
    } else if (/to\s+bottom\b/.test(direction)) {
      result.orientation = "vertical";
    } else if (/to\s+top\b/.test(direction)) {
      result.orientation = "vertical";
    } else if (/deg$/.test(direction)) {
      result.orientation = "angle";
    }

    const stops = stopsPart
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stop of stops) {
      const stopMatch = stop.match(
        /((?:#(?:[0-9a-fA-F]{3,8})|oklch\([^)]*\)|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-zA-Z]+))\s*(\d+%|0|1)?$/,
      );
      if (stopMatch && stopMatch[1]) {
        let value = 0;
        const pos = stopMatch[2] ?? "";
        if (pos.endsWith("%")) {
          value = parseFloat(pos) / 100;
        } else if (pos === "1") {
          value = 1;
        } else if (pos === "0") {
          value = 0;
        }
        console.warn("Parsed stop:", {
          color: stopMatch[1].trim(),
          pos: value,
        });
        result.stops.push({ color: stopMatch[1].trim(), pos: value });
      }
    }
    return result;
  };

  return {
    parseTailwindClasses,
    getTailwindBaseCssValues,
    parseLinearGradient,
  };
};
```

```ts [src/components/ui/audio-visualizer/index.ts]
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as AudioVisualizer } from "./AudioVisualizer.vue";
export { default as AudioMotion } from "./AudioMotion.vue";

export const motionVariants = cva("", {
  variants: {
    gradient: {
      classic: "classic",
      orangered: "orangered",
      prism: "prism",
      rainbow: "rainbow",
      steelblue: "steelblue",
    },
  },
  defaultVariants: {
    gradient: "classic",
  },
});

export type AudioMotionVariants = VariantProps<typeof motionVariants>;

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
import { drawMirroredSpectrum } from "./visualizers/drawMirroredSpectrum";
import { drawPeakHold } from "./visualizers/drawPeakHold";
import { drawSpectrogram } from "./visualizers/drawSpectrogram";
import { drawScopeXY } from "./visualizers/drawScopeXY";
import { drawWaterfall } from "./visualizers/drawWaterfall";
import { drawLedBars } from "./visualizers/drawLedBars";

export type AudioVisualizerMode =
  | "waveform"
  | "frequency-bars"
  | "fft"
  | "fft-enhanced"
  | "mirrored-spectrum"
  | "peak-hold"
  | "spectrogram"
  | "scope-xy"
  | "waterfall"
  | "led-bars";

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
    case "mirrored-spectrum":
      return drawMirroredSpectrum;
    case "peak-hold":
      return drawPeakHold;
    case "spectrogram":
      return drawSpectrogram;
    case "scope-xy":
      return drawScopeXY;
    case "waterfall":
      return drawWaterfall;
    case "led-bars":
      return drawLedBars;
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

```vue [src/components/ui/audio-visualizer/AudioMotion.vue]
<script setup lang="ts">
import AudioMotionAnalyzer from "audiomotion-analyzer";
import {
  type Ref,
  type HTMLAttributes,
  inject,
  ref,
  watch,
  nextTick,
  useTemplateRef,
  unref,
  onUnmounted,
  computed,
} from "vue";
import { AudioContextInjectionKey } from "@/components/ui/audio-context-provider";
import { useTypedElementSearch } from "~~/registry/new-york/composables/use-typed-element-search/useTypedElementSearch";
import { useTailwindClassParser } from "~~/registry/new-york/composables/use-tailwind-class-parser/useTailwindClassParser";

export interface AudioMotionAnalyzerProps {
  class?: HTMLAttributes["class"];
  stream?: MediaStream | null;
  audio?: HTMLAudioElement | Ref<HTMLAudioElement | null> | null;
  gradient?: "classic" | "orangered" | "prism" | "rainbow" | "steelblue";
}

const props = withDefaults(defineProps<AudioMotionAnalyzerProps>(), {
  stream: undefined,
  audio: undefined,
  gradient: "classic",
});

const { getTypedElementAmongSiblings, getContainer } = useTypedElementSearch();
const { getTailwindBaseCssValues, parseLinearGradient } =
  useTailwindClassParser();

const noDisplayElement = useTemplateRef("noDisplayRef");
const injectedContext = inject<Ref<AudioContext | null>>(
  AudioContextInjectionKey,
  ref(null),
);

let analyzer: AudioMotionAnalyzer | null = null;
let source: MediaStreamAudioSourceNode | null = null;

const setupAudio = async () => {
  if (analyzer) {
    analyzer.destroy();
    analyzer = null;
  }

  const canvas: HTMLCanvasElement | null = searchCanvas();
  const container: HTMLElement | null = searchContainer();

  if (props.audio) {
    const audioElement =
      props.audio instanceof HTMLAudioElement ? props.audio : props.audio.value;
    if (audioElement) {
      if (!canvas && container) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        analyzer = new AudioMotionAnalyzer(container, {
          source: audioElement,
          width,
          height,
          gradient: props.gradient,
          mode: 3,
          barSpace: 0.6,
          ledBars: true,
          connectSpeakers: false,
        });
      } else if (canvas) {
        analyzer = new AudioMotionAnalyzer({
          source: audioElement,
          canvas: canvas,
          width: canvas.width,
          height: canvas.height,
          gradient: props.gradient,
          mode: 3,
          barSpace: 0.6,
          ledBars: true,
          connectSpeakers: false,
        });
      } else {
        console.error(
          "No valid container or canvas found for AudioMotionAnalyzer with audio element.",
        );
      }
    }
  } else if (props.stream) {
    if (source) {
      source.disconnect();
      source = null;
    }
    const context = injectedContext.value || new AudioContext();
    source = context.createMediaStreamSource(props.stream);

    if (!canvas && container) {
      const width = container.clientWidth;
      const height = container.clientHeight;
      analyzer = new AudioMotionAnalyzer(container, {
        audioCtx: context,
        width,
        height,
        gradient: props.gradient,
        mode: 3,
        barSpace: 0.6,
        ledBars: true,
        connectSpeakers: false,
      });
      analyzer.connectInput(source);
    } else if (canvas) {
      const width = canvas.width;
      const height = canvas.height;
      analyzer = new AudioMotionAnalyzer({
        audioCtx: context,
        canvas,
        width,
        height,
        gradient: props.gradient,
        mode: 3,
        barSpace: 0.6,
        ledBars: true,
        connectSpeakers: false,
      });

      const computedGradient = handleGradientClass();
      if (computedGradient) {
        analyzer.registerGradient("custom", computedGradient as any);
        analyzer.gradient = "custom";
      }
      analyzer.connectInput(source);
    } else {
      console.error(
        "No valid container or canvas found for AudioMotionAnalyzer with media stream.",
      );
    }
  } else {
    console.error(
      "No audio source (audio element or media stream) provided to AudioMotionAnalyzer.",
    );
  }
};

const searchCanvas = (): HTMLCanvasElement | null => {
  const el = unref(noDisplayElement);
  return el
    ? getTypedElementAmongSiblings(
        el,
        (el): el is HTMLCanvasElement => el instanceof HTMLCanvasElement,
      )
    : null;
};

const searchContainer = (): HTMLElement | null => {
  const el = unref(noDisplayElement);
  return el ? getContainer(el) : null;
};

const cleanUp = () => {
  if (analyzer) {
    analyzer.destroy();
    analyzer = null;
  }
  if (source) {
    source.disconnect();
    source = null;
  }
};

const handleGradientClass = () => {
  const el = document.createElement("div");
  el.className = props.class || "";
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.zIndex = "-9999";
  document.body.appendChild(el);
  const computedClass = getTailwindBaseCssValues(el, ["background-image"]);
  console.warn("Computed Class:", computedClass);
  const computedGradient =
    computedClass["background-image"] &&
    computedClass["background-image"] !== "none"
      ? parseLinearGradient(computedClass["background-image"])
      : null;

  let gradient: {
    dir?: "h" | "v" | undefined;
    colorStops: Array<{ color: string; pos: number }>;
  } | null = null;

  if (computedGradient) {
    gradient = { dir: "v", colorStops: [] };
    gradient.dir =
      computedGradient.direction.includes("bottom") ||
      computedGradient.direction.includes("top")
        ? "v"
        : "h";
    gradient.colorStops = computedGradient.stops;
  }
  document.body.removeChild(el);
  return gradient;
};

watch(
  () => [props.stream, props.audio, props.class, injectedContext.value],
  () => {
    nextTick(async () => {
      await setupAudio();
    });
  },
  { immediate: true },
);

onUnmounted(() => {
  cleanUp();
});
</script>

<template>
  <div ref="noDisplayRef" class="hidden z-[-9999]" />
  <slot />
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

      if (!value) continue;

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

```ts [src/components/ui/audio-visualizer/visualizers/drawLedBars.ts]
import type { Ref } from "vue";

export function drawLedBars({
  canvasRef,
  data,
  props,
}: {
  canvasRef: Ref<HTMLCanvasElement | null>;
  data: Float32Array[];
  props: any;
}) {
  const canvas = canvasRef?.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const colors = props.colors ?? ["#00ff00", "#00eaff", "#ffea00", "#ff00ea"];
  const barCount = props.barCount ?? 32;
  const ledRows = props.ledRows ?? 12;
  const spacing = props.spacing ?? 2;
  const ledRadius = props.ledRadius ?? 6;
  const background = props.background ?? "#111";

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const channel = data[0] ?? new Float32Array(barCount);
  const barWidth = (width - spacing * (barCount - 1)) / barCount;
  const maxVal = 1;

  for (let i = 0; i < barCount; i++) {
    const value = Math.max(0, Math.min(channel[i] ?? 0, maxVal));

    const ledsOn = Math.round(value * ledRows);
    for (let j = 0; j < ledRows; j++) {
      const x = i * (barWidth + spacing) + barWidth / 2;

      const totalLedHeight = ledRows * (ledRadius * 2 + spacing);
      const yStart = height - totalLedHeight + ledRadius;
      const y = yStart + j * (ledRadius * 2 + spacing);

      if (y < 0 || y > height) continue;

      const colorIdx = Math.floor((j / ledRows) * colors.length);
      const ledColor: string = colors[colorIdx] || colors[0];
      if (j < ledsOn) {
        ctx.beginPath();
        ctx.arc(x, y, ledRadius, 0, Math.PI * 2);
        ctx.fillStyle = ledColor;
        ctx.shadowColor = ledColor;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = 0.95;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      } else {
        ctx.beginPath();
        ctx.arc(x, y, ledRadius, 0, Math.PI * 2);
        ctx.fillStyle = background;
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
  ctx.restore();
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawMirroredSpectrum.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawMirroredSpectrumParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawMirroredSpectrum({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawMirroredSpectrumParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
  }
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  const barWidth = width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const value = dataArray[i];
    const barHeight = (value / 255) * (height / 2);
    const x = i * barWidth;

    ctx.fillStyle = `hsl(${(i / bufferLength) * 360}, 80%, 60%)`;
    ctx.fillRect(x, height / 2 - barHeight, barWidth, barHeight);

    ctx.fillRect(x, height / 2, barWidth, barHeight);
  }
  animationIdRef.value = requestAnimationFrame(() =>
    drawMirroredSpectrum({
      analyser,
      canvasRef,
      props,
      channelData,
      animationIdRef,
    }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawPeakHold.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

const PEAK_DECAY = 0.97;
let peakArray: number[] = [];

export interface DrawPeakHoldParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawPeakHold({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawPeakHoldParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
  }
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  if (peakArray.length !== bufferLength)
    peakArray = new Array(bufferLength).fill(0);
  const barWidth = width / bufferLength;
  for (let i = 0; i < bufferLength; i++) {
    const value = dataArray[i];
    if (value > peakArray[i]) peakArray[i] = value;
    else peakArray[i] *= PEAK_DECAY;
    const barHeight = (value / 255) * height;
    const peakHeight = (peakArray[i] / 255) * height;
    const x = i * barWidth;
    ctx.fillStyle = props.colors?.[0] ?? "#43a047";
    ctx.fillRect(x, height - barHeight, barWidth, barHeight);

    ctx.fillStyle = "#ffd600";
    ctx.fillRect(x, height - peakHeight - 2, barWidth, 2);
  }
  animationIdRef.value = requestAnimationFrame(() =>
    drawPeakHold({ analyser, canvasRef, props, channelData, animationIdRef }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawScopeXY.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

export interface DrawScopeXYParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawScopeXY({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawScopeXYParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  ctx.clearRect(0, 0, width, height);
  if (props.background) {
    ctx.fillStyle = props.background;
    ctx.fillRect(0, 0, width, height);
  }
  const fftSize = props.fftSize ?? 2048;

  if (!channelData[0] || !(channelData[0] instanceof Float32Array))
    channelData[0] = new Float32Array(fftSize);
  if (!channelData[1] || !(channelData[1] instanceof Float32Array))
    channelData[1] = new Float32Array(fftSize);
  analyser.getFloatTimeDomainData(channelData[0] as Float32Array<ArrayBuffer>);
  analyser.getFloatTimeDomainData(channelData[1] as Float32Array<ArrayBuffer>);
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < fftSize; i++) {
    const x = (channelData[0][i] + 1) * (width / 2);
    const y = (channelData[1][i] + 1) * (height / 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = props.colors?.[0] ?? "#448aff";
  ctx.lineWidth = props.lineWidth ?? 2;
  ctx.stroke();
  ctx.restore();
  animationIdRef.value = requestAnimationFrame(() =>
    drawScopeXY({ analyser, canvasRef, props, channelData, animationIdRef }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawSpectrogram.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

let spectrogramData: ImageData | null = null;

export interface DrawSpectrogramParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawSpectrogram({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawSpectrogramParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const bufferLength = analyser.frequencyBinCount;
  if (
    !spectrogramData ||
    spectrogramData.width !== width ||
    spectrogramData.height !== height
  ) {
    spectrogramData = ctx.createImageData(width, height);
    for (let i = 0; i < spectrogramData.data.length; i++)
      spectrogramData.data[i] = 255;
  }

  ctx.putImageData(spectrogramData, -1, 0);

  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  for (let y = 0; y < height; y++) {
    const freqIdx = Math.floor((y / height) * bufferLength);
    const value = dataArray[freqIdx];
    const color =
      value !== undefined
        ? `hsl(${240 - (value / 255) * 240}, 100%, 50%)`
        : "#000";
    ctx.fillStyle = color;
    ctx.fillRect(width - 1, height - y, 1, 1);
  }

  spectrogramData = ctx.getImageData(0, 0, width, height);
  animationIdRef.value = requestAnimationFrame(() =>
    drawSpectrogram({
      analyser,
      canvasRef,
      props,
      channelData,
      animationIdRef,
    }),
  );
}
```

```ts [src/components/ui/audio-visualizer/visualizers/drawWaterfall.ts]
import type { Ref } from "vue";
import type { AudioVisualizerProps } from "../AudioVisualizer.vue";

let waterfallData: ImageData | null = null;

export interface DrawWaterfallParams {
  analyser: AnalyserNode | null;
  canvasRef: Ref<HTMLCanvasElement | null>;
  props: AudioVisualizerProps;
  channelData: Float32Array[];
  animationIdRef: Ref<number | null>;
}

export function drawWaterfall({
  analyser,
  canvasRef,
  props,
  channelData,
  animationIdRef,
}: DrawWaterfallParams) {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  const width = props.width ?? 600;
  const height = props.height ?? 200;
  const bufferLength = analyser.frequencyBinCount;
  if (
    !waterfallData ||
    waterfallData.width !== width ||
    waterfallData.height !== height
  ) {
    waterfallData = ctx.createImageData(width, height);
    for (let i = 0; i < waterfallData.data.length; i++)
      waterfallData.data[i] = 255;
  }

  ctx.putImageData(waterfallData, 0, 1);

  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  for (let x = 0; x < width; x++) {
    const freqIdx = Math.floor((x / width) * bufferLength);
    const value = dataArray[freqIdx];
    const color =
      value !== undefined
        ? `hsl(${240 - (value / 255) * 240}, 100%, 50%)`
        : "#000";
    ctx.fillStyle = color;
    ctx.fillRect(x, 0, 1, 1);
  }

  waterfallData = ctx.getImageData(0, 0, width, height);
  animationIdRef.value = requestAnimationFrame(() =>
    drawWaterfall({ analyser, canvasRef, props, channelData, animationIdRef }),
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

## AudioMotion
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |
| `stream`{.primary .text-primary} | `MediaStream \| null` | — |  |
| `audio`{.primary .text-primary} | `HTMLAudioElement \| Ref<HTMLAudioElement \| null> \| null` | — |  |
| `gradient`{.primary .text-primary} | `'classic' \| 'orangered' \| 'prism' \| 'rainbow' \| 'steelblue'` | classic |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `AudioContextInjectionKey`{.primary .text-primary} | `ref(null)` | `any` | — |

---

  ## Examples
  ::hr-underline
  ::

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

const selectedMode = ref<
  | "fft"
  | "fft-enhanced"
  | "waveform"
  | "frequency-bars"
  | "mirrored-spectrum"
  | "peak-hold"
  | "spectrogram"
  | "scope-xy"
  | "waterfall"
  | "led-bars"
>("fft-enhanced");
const visualizerModes = [
  { value: "fft", label: "FFT" },
  { value: "fft-enhanced", label: "Enhanced FFT" },
  { value: "waveform", label: "Waveform" },
  { value: "frequency-bars", label: "Bars" },
  { value: "mirrored-spectrum", label: "Mirrored Spectrum" },
  { value: "peak-hold", label: "Peak Hold" },
  { value: "spectrogram", label: "Spectrogram" },
  { value: "scope-xy", label: "Scope XY" },
  { value: "waterfall", label: "Waterfall" },
  { value: "led-bars", label: "LED Bars" },
];
</script>

<template>
  <MediaDevicesProvider :open="true" v-slot="{ microphones, stopAll, errors }">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
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

      <FieldSet>
        <FieldLegend>Visualization Mode</FieldLegend>
        <FieldDescription>
          Choose the display mode for the audio visualizer.
        </FieldDescription>
        <FieldGroup class="space-y-4">
          <Field>
            <Select v-model="selectedMode">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select a mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="mode in visualizerModes"
                    :key="mode.value"
                    :value="mode.value"
                  >
                    <SelectItemText>{{ mode.label }}</SelectItemText>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>
      </FieldSet>
    </div>

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
          :height="400"
          :mode="selectedMode"
          :colors="['#00ff00', '#00eaff', '#ffea00', '#ff00ea']"
          :background="'#111'"
          :barCount="32"
          :ledRows="12"
          :spacing="2"
          :ledRadius="6"
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

::tip
You can copy and adapt this template for any component documentation.
::