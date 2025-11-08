---
title: AudioMotionAnalyzer
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
import {
  AudioMotionAnalyzer,
  AudioMotionGradient,
  AudioMotionMirror,
  AudioMotionMode,
  type AudioMotionGradientDefinition,
} from "~~/registry/new-york/components/audio-motion-analyzer";

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

const poppyGradient: AudioMotionGradientDefinition = {
  name: "poppy",
  gradient: {
    bgColor: "rgba(0, 0, 0, 0, 0)",
    dir: "v" as const,
    colorStops: [
      { color: "#ff0000", pos: 0 },
      { color: "#ff8000", pos: 0.2 },
      { color: "#ffff00", pos: 0.4 },
      { color: "#80ff00", pos: 0.6 },
      { color: "#00ff00", pos: 0.8 },
      { color: "#00ffff", pos: 1 },
    ],
  },
};
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
        <AudioMotionAnalyzer
          :stream="stream"
          connect-speakers
          gradient="sunset"
          show-peaks
          overlay
          true-leds
          :mirror="AudioMotionMirror.None"
        >
          <AudioMotionGradient
            name="sunset"
            class="bg-linear-to-r from-red-500 to-orange-500"
            style="background: linear-gradient(to bottom)"
          />

          <AudioMotionGradient
            name="foreground"
            style="
              background: linear-gradient(
                to bottom,
                var(--color-foreground) 0%,
                var(--color-foreground) 100%
              );
            "
          />

          <AudioMotionGradient
            name="foreground-broken"
            class="bg-linear-to-b from-[--color-foreground] via-purple-400 to-[--color-background] to-90%"
          />

          <AudioMotionGradient
            :name="poppyGradient.name"
            :gradient="poppyGradient.gradient"
          />

          <canvas width="600" height="400" />
        </AudioMotionAnalyzer>

        <template v-if="errors && errors.length">
          <div class="text-red-500 text-xs mt-2" style="">
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
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-motion-analyzer.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-motion-analyzer.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-motion-analyzer.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-motion-analyzer.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/audio-motion-analyzer/index.ts"}

```ts [src/components/ui/audio-motion-analyzer/index.ts]
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { InjectionKey, Ref } from "vue";
import {
  useTailwindClassParser,
  type GradientColorStop,
} from "~~/registry/new-york/composables/use-tailwind-class-parser/useTailwindClassParser";

export const gradientFromClasses = (
  classes: string = "",
): AudioMotionGradientProperties | null => {
  const { getTailwindBaseCssValues, parseGradient } = useTailwindClassParser();

  const el = document.createElement("div");
  el.className = classes;
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.zIndex = "-9999";
  document.body.appendChild(el);

  const computedClass = getTailwindBaseCssValues(el, ["background-image"]);
  const computedGradient =
    computedClass["background-image"] &&
    computedClass["background-image"] !== "none"
      ? parseGradient(computedClass["background-image"])
      : null;

  let gradient: AudioMotionGradientProperties | null = null;

  if (computedGradient) {
    gradient = { bgColor: "rgba(0, 0, 0, 0, 0)", dir: "v", colorStops: [] };
    gradient.dir = (
      computedGradient.direction.includes("bottom") ||
      computedGradient.direction.includes("top")
        ? "v"
        : "h"
    ) as "h" | "v";
    gradient.colorStops = computedGradient.stops;
  }

  document.body.removeChild(el);
  return gradient;
};

export const gradientFromElement = (
  el: HTMLElement | null,
): AudioMotionGradientProperties | null => {
  if (!el) return null;

  const classes = el?.className || "";
  const styles = el?.getAttribute("style");

  if (styles) {
    const { parseGradient } = useTailwindClassParser();
    const result = parseGradient(styles);
    if (result) {
      const gradient = {
        bgColor: "rgba(0, 0, 0, 0, 0)",
        dir: "v" as "h" | "v",
        colorStops: [] as any[],
      };
      gradient.dir =
        result.direction.includes("bottom") || result.direction.includes("top")
          ? ("v" as const)
          : ("h" as const);
      gradient.colorStops = result.stops;
      return gradient;
    }
  }

  return gradientFromClasses(classes);
};

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

export enum AudioMotionMode {
  Discrete = 0,
  OctaveBands24th = 1,
  OctaveBands12th = 2,
  OctaveBands8th = 3,
  OctaveBands6th = 4,
  OctaveBands4th = 5,
  OctaveBands3rd = 6,
  HalfOctaveBands = 7,
  FullOctaveBands = 8,
  Graph = 10,
}

export enum AudioMotionMirror {
  Left = -1,
  None = 0,
  Right = 1,
}

export enum AudioMotionFrequencyScale {
  Bark = "bark",
  Linear = "linear",
  Log = "log",
  Mel = "mel",
}

export type AudioMotionFftSize =
  | 32
  | 64
  | 128
  | 256
  | 512
  | 1024
  | 2048
  | 4096
  | 8192
  | 16384
  | 32768;

export interface AudioMotionGradientDefinition {
  name: string;
  gradient: AudioMotionGradientProperties;
}

export interface AudioMotionGradientProperties {
  bgColor: string;
  dir?: "h" | "v" | undefined;
  colorStops: GradientColorStop[];
}

export enum AudioMotionWeightingFilter {
  None = "",
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  ItuR468 = "468",
}

export { default as AudioVisualizer } from "./AudioVisualizer.vue";
export { default as AudioMotionAnalyzer } from "./AudioMotionAnalyzer.vue";
export { default as AudioMotionGradient } from "./AudioMotionGradient.vue";

export type { AudioMotionAnalyzerProps } from "./AudioMotionAnalyzer.vue";
export type { AudioMotionGradientProps } from "./AudioMotionGradient.vue";

export const AudioMotionGradientsKey: InjectionKey<
  Ref<AudioMotionGradientDefinition[]>
> = Symbol("AudioMotionGradients");

export { type AudioVisualizerMode } from "./AudioVisualizer.vue";
export { type AudioVisualizerProps } from "./AudioVisualizer.vue";
```

```vue [src/components/ui/audio-motion-analyzer/AudioMotionAnalyzer.vue]
<script setup lang="ts">
import AudioMotion, { type FrequencyScale } from "audiomotion-analyzer";
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
  provide,
  watchEffect,
} from "vue";
import { AudioContextInjectionKey } from "@/components/ui/audio-context-provider";
import { useTypedElementSearch } from "~~/registry/new-york/composables/use-typed-element-search/useTypedElementSearch";
import {
  AudioMotionMode,
  AudioMotionMirror,
  AudioMotionGradientsKey,
  AudioMotionWeightingFilter,
  type AudioMotionGradientDefinition,
  type AudioMotionGradientProperties,
  type AudioMotionFftSize,
} from ".";

export interface AudioMotionAnalyzerProps {
  alphaBars?: boolean;
  ansiBands?: boolean;
  audio?: HTMLAudioElement | Ref<HTMLAudioElement | null> | null;
  barSpace?: number;
  channelLayout?:
    | "single"
    | "dual-combined"
    | "dual-horizontal"
    | "dual-vertical";
  class?: HTMLAttributes["class"];
  colorMode?: "gradient" | "bar-index" | "bar-level";
  connectSpeakers?: boolean;
  disableReflexFit?: boolean;
  fadePeaks?: boolean;
  fftSize?: AudioMotionFftSize;
  fillAlpha?: number;
  frequencyScale?: string;
  gradient?:
    | "classic"
    | "orangered"
    | "prism"
    | "rainbow"
    | "steelblue"
    | string;
  gradientLeft?:
    | "classic"
    | "orangered"
    | "prism"
    | "rainbow"
    | "steelblue"
    | string;
  gradientRight?:
    | "classic"
    | "orangered"
    | "prism"
    | "rainbow"
    | "steelblue"
    | string;
  gravity?: number;
  ledBars?: boolean;
  linearAmplitude?: boolean;
  linearBoost?: number;
  lineWidth?: number;
  lumiBars?: boolean;
  maxDecibels?: number;
  minDecibels?: number;
  maxFps?: number;
  maxFreq?: number;
  minFreq?: number;
  mirror?: number;
  mode?: number;
  noteLabels?: boolean;
  outlineBars?: boolean;
  overlay?: boolean;
  peakFadeTime?: number;
  peakHoldTime?: number;
  peakLine?: boolean;
  radial?: boolean;
  radialInvert?: boolean;
  radius?: number;
  reflexAlpha?: number;
  reflexBright?: number;
  reflexRatio?: number;
  roundBars?: boolean;
  showBgColor?: boolean;
  showFPS?: boolean;
  showPeaks?: boolean;
  showScaleX?: boolean;
  showScaleY?: boolean;
  smoothing?: number;
  spinSpeed?: number;
  splitGradient?: boolean;
  stream?: MediaStream | null;
  trueLeds?: boolean;
  volume?: number;
  weightingFilter?: string;
}

const props = withDefaults(defineProps<AudioMotionAnalyzerProps>(), {
  audio: undefined,
  barSpace: 0.1,
  channelLayout: "dual-combined",
  colorMode: "gradient",
  connectSpeakers: false,
  disableReflexFit: false,
  fadePeaks: false,
  fftSize: 8192,
  fillAlpha: 1,
  frequencyScale: "log",
  gradient: "classic",
  gravity: 3.8,
  ledBars: false,
  linearAmplitude: false,
  linearBoost: 1,
  lineWidth: 0,
  lumiBars: false,
  maxDecibels: -25,
  minDecibels: -85,
  maxFps: 0,
  maxFreq: 22000,
  minFreq: 20,
  mirror: 0,
  mode: 3,
  noteLabels: false,
  outlineBars: false,
  overlay: false,
  peakFadeTime: 750,
  peakHoldTime: 500,
  peakLine: false,
  radial: false,
  radialInvert: false,
  radius: 0.3,
  reflexAlpha: 0.15,
  reflexBright: 1,
  reflexRatio: 0,
  roundBars: false,
  showBgColor: false,
  showFPS: false,
  showPeaks: false,
  showScaleX: false,
  showScaleY: false,
  smoothing: 0.5,
  spinSpeed: 0,
  splitGradient: false,
  stream: undefined,
  trueLeds: false,
  volume: 1,
  weightingFilter: "",
});

const { getTypedElementAmongSiblings, getContainer } = useTypedElementSearch();

const noDisplayElement = useTemplateRef("noDisplayRef");
const injectedContext = inject<Ref<AudioContext | null>>(
  AudioContextInjectionKey,
  ref(null),
);

const gradients = ref<AudioMotionGradientDefinition[]>([]);
provide<Ref<AudioMotionGradientDefinition[]>>(
  AudioMotionGradientsKey,
  gradients,
);

let analyzer: AudioMotion | null = null;
let source: MediaStreamAudioSourceNode | null = null;

const registerGradients = () => {
  if (analyzer) {
    for (const gradientDef of gradients.value) {
      const { name, gradient } = gradientDef;
      analyzer.registerGradient(
        name,
        gradient as any & AudioMotionGradientProperties,
      );
    }
  }
};

const setupAnalyzer = async () => {
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
        analyzer = new AudioMotion(container, {
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
        analyzer = new AudioMotion({
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

    const width = canvas ? canvas.width : container?.clientWidth;
    const height = canvas ? canvas.height : container?.clientHeight;
    const options = {
      alphaBars: props.alphaBars,
      ansiBands: props.ansiBands,
      audioCtx: context,
      barSpace: props.barSpace,
      channelLayout: props.channelLayout,
      colorMode: props.colorMode,
      connectSpeakers: props.connectSpeakers,
      fadePeaks: props.fadePeaks,
      fftSize: props.fftSize,
      fillAlpha: props.fillAlpha,
      frequencyScale: props.frequencyScale as FrequencyScale,
      gravity: props.gravity,
      height,
      ledBars: props.ledBars,
      linearAmplitude: props.linearAmplitude,
      linearBoost: Math.max(props.linearBoost, 1),
      lineWidth: Math.max(props.lineWidth || 0, 0),
      lumiBars: props.lumiBars,
      maxDecibels: props.maxDecibels,
      minDecibels: props.minDecibels,
      maxFPS: props.maxFps,
      maxFreq: Math.max(props.maxFreq, 1),
      minFreq: Math.max(props.minFreq, 1),
      mirror: props.mirror,
      mode: props.mode,
      noteLabels: props.noteLabels,
      outlineBars: props.outlineBars,
      overlay: props.overlay,
      peakFadeTime: props.peakFadeTime,
      peakHoldTime: props.peakHoldTime,
      peakLine: props.peakLine,
      radial: props.radial,
      radialInvert: props.radialInvert,
      radius: props.radius,
      reflexAlpha: Math.max(0, Math.min(props.reflexAlpha ?? 0, 1)),
      reflexBright: Math.max(0, props.reflexBright ?? 1),
      reflexFit: !props.disableReflexFit,
      reflexRatio: Math.max(0, Math.min(props.reflexRatio ?? 0, 1)),
      roundBars: props.roundBars,
      showBgColor: props.showBgColor,
      showFPS: props.showFPS,
      showPeaks: props.showPeaks,
      showScaleX: props.showScaleX,
      showScaleY: props.showScaleY,
      smoothing: Math.max(0, Math.min(props.smoothing ?? 0, 1)),
      spinSpeed: props.spinSpeed || 0,
      splitGradient: props.splitGradient || false,
      trueLeds: props.trueLeds || false,
      volume: Math.max(0, props.volume || 1),
      weightingFilter: props.weightingFilter as AudioMotionWeightingFilter,
      width,
      ...(canvas ? { canvas } : {}),
    };

    analyzer = canvas
      ? new AudioMotion(options)
      : container
        ? new AudioMotion(container, options)
        : null;

    if (analyzer) {
      if (canvas) {
        analyzer.showBgColor = false;
        registerGradients();
      }
      analyzer.gradient = props.gradient;
      if (props.gradientLeft) analyzer.gradientLeft = props.gradientLeft;
      if (props.gradientRight) analyzer.gradientRight = props.gradientRight;

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

watch(
  () => [props.stream, props.audio, injectedContext.value],
  () => {
    nextTick(async () => {
      await setupAnalyzer();
    });
  },
  { immediate: true },
);

watch(
  () => gradients.value,
  async () => {
    if (analyzer) {
      registerGradients();
    }
  },
  { immediate: true },
);

watch(
  () => props.connectSpeakers,
  async () => {
    if (analyzer) {
      const ctx = analyzer.audioCtx;
      const destination = ctx.destination;

      props.connectSpeakers
        ? analyzer.connectOutput()
        : analyzer.disconnectOutput(destination);
    }
  },
);

watchEffect(
  () => {
    if (analyzer) {
      analyzer.alphaBars = !!props.alphaBars;
      analyzer.ansiBands = !!props.ansiBands;
      analyzer.barSpace = props.barSpace || 0.1;
      analyzer.channelLayout = props.channelLayout;
      analyzer.colorMode = props.colorMode || "gradient";
      analyzer.fadePeaks = !!props.fadePeaks;
      analyzer.fftSize = props.fftSize as AudioMotionFftSize;
      analyzer.fillAlpha = props.fillAlpha || 1;
      analyzer.frequencyScale = props.frequencyScale as FrequencyScale;
      if (props.gradientLeft) analyzer.gradientLeft = props.gradientLeft;
      if (props.gradientRight) analyzer.gradientRight = props.gradientRight;
      analyzer.gravity = props.gravity || 3.8;
      analyzer.ledBars = !!props.ledBars;
      analyzer.linearAmplitude = !!props.linearAmplitude;
      analyzer.linearBoost = Math.max(props.linearBoost, 1);
      analyzer.lineWidth = Math.max(props.lineWidth || 0, 0);
      analyzer.lumiBars = !!props.lumiBars;
      analyzer.maxDecibels = props.maxDecibels;
      analyzer.minDecibels = props.minDecibels;
      analyzer.maxFPS = props.maxFps || 0;
      analyzer.maxFreq = Math.max(props.maxFreq, 1);
      analyzer.minFreq = Math.max(props.minFreq, 1);
      analyzer.mirror = props.mirror || AudioMotionMirror.None;
      analyzer.mode = props.mode || AudioMotionMode.OctaveBands8th;
      analyzer.noteLabels = !!props.noteLabels;
      analyzer.outlineBars = !!props.outlineBars;
      analyzer.overlay = props.overlay;
      analyzer.peakFadeTime = props.peakFadeTime || 750;
      analyzer.peakHoldTime = props.peakHoldTime || 500;
      analyzer.peakLine = props.peakLine || false;
      analyzer.radial = props.radial || false;
      analyzer.radialInvert = props.radialInvert || false;
      analyzer.radius = props.radius || 0.3;
      analyzer.reflexAlpha = Math.max(0, Math.min(props.reflexAlpha ?? 0, 1));
      analyzer.reflexBright = Math.max(0, props.reflexBright ?? 1);
      analyzer.reflexFit = !props.disableReflexFit;
      analyzer.reflexRatio = Math.max(0, Math.min(props.reflexRatio ?? 0, 1));
      analyzer.roundBars = !!props.roundBars;
      analyzer.showBgColor = !!props.showBgColor;
      analyzer.showFPS = !!props.showFPS;
      analyzer.showPeaks = !!props.showPeaks;
      analyzer.showScaleX = !!props.showScaleX;
      analyzer.showScaleY = !!props.showScaleY;
      analyzer.smoothing = Math.max(0, Math.min(props.smoothing ?? 0.5, 1));
      analyzer.spinSpeed = props.spinSpeed || 0;
      analyzer.splitGradient = !!props.splitGradient;
      analyzer.trueLeds = !!props.trueLeds;
      analyzer.volume = Math.max(0, props.volume || 1);
      analyzer.weightingFilter = (props.weightingFilter ||
        "") as AudioMotionWeightingFilter;
    }
  },
  { flush: "post" },
);

onUnmounted(() => {
  cleanUp();
});
</script>

<template>
  <div ref="noDisplayRef" class="hidden z-[-9999]" />
  <slot data-slot="audio-motion-analyzer" />
</template>
```

```vue [src/components/ui/audio-motion-analyzer/AudioMotionGradient.vue]
<script setup lang="ts">
import {
  nextTick,
  unref,
  useTemplateRef,
  watch,
  inject,
  ref,
  type HTMLAttributes,
  type Ref,
} from "vue";
import { cn } from "@/lib/utils";
import {
  AudioMotionGradientsKey,
  gradientFromElement,
  type AudioMotionGradientDefinition,
  type AudioMotionGradientProperties,
} from ".";

export interface AudioMotionGradientProps {
  name: string;
  class?: HTMLAttributes["class"];
  style?: HTMLAttributes["style"];
  gradient?: AudioMotionGradientProperties | null;
}

const props = defineProps<AudioMotionGradientProps>();

const gradients = inject<Ref<AudioMotionGradientDefinition[]>>(
  AudioMotionGradientsKey,
  ref([]),
);

const gradientRef = useTemplateRef("gradientRef");

const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!bKeys.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
};

const addIfNotExisting = (
  gradientDefinition: AudioMotionGradientDefinition,
) => {
  const existingIndex = gradients.value.findIndex(
    (g) => g.name === gradientDefinition.name,
  );
  console.log("Got existing gradient index:", existingIndex);
  if (existingIndex !== -1) {
    const newGradient = gradientDefinition.gradient;
    const existingGradient = gradients.value[existingIndex]!.gradient;

    const isSame = deepEqual(newGradient, existingGradient);
    if (!isSame) {
      console.warn(
        "Updating existing gradient:",
        gradientDefinition.name,
        gradientDefinition.gradient,
      );
      gradients.value[existingIndex]!.gradient = newGradient;
    }
  } else {
    gradients.value.push({
      name: props.name,
      gradient: gradientDefinition.gradient,
    });
  }
};

const addGradient = () => {
  const propsGradient: AudioMotionGradientProperties | null | undefined =
    props.gradient;
  if (propsGradient) {
    addIfNotExisting({
      name: props.name,
      gradient: propsGradient,
    });
    return;
  }

  const el = unref(gradientRef);
  if (el) {
    const gradientProperties: AudioMotionGradientProperties | null =
      gradientFromElement(el);
    if (gradientProperties) {
      addIfNotExisting({
        name: props.name,
        gradient: gradientProperties,
      });
    }
  }
};

watch(
  () => [props.gradient, props.class, props.style],
  () => {
    nextTick(() => {
      addGradient();
    });
  },
  { immediate: true },
);
</script>

<template>
  <div
    ref="gradientRef"
    data-slot="audio-motion-gradient"
    :class="cn('hidden', props.class)"
    :style="props.style"
  ></div>
</template>
```

```vue [src/components/ui/audio-motion-analyzer/AudioVisualizer.vue]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawFft.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawFftEnhanced.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawFrequencyBars.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawLedBars.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawMirroredSpectrum.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawPeakHold.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawScopeXY.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawSpectrogram.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawWaterfall.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawWaveform.ts]
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

```ts [src/components/ui/audio-motion-analyzer/index.ts]
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { InjectionKey, Ref } from "vue";
import {
  useTailwindClassParser,
  type GradientColorStop,
} from "~~/registry/new-york/composables/use-tailwind-class-parser/useTailwindClassParser";

export const gradientFromClasses = (
  classes: string = "",
): AudioMotionGradientProperties | null => {
  const { getTailwindBaseCssValues, parseGradient } = useTailwindClassParser();

  const el = document.createElement("div");
  el.className = classes;
  el.style.position = "absolute";
  el.style.visibility = "hidden";
  el.style.zIndex = "-9999";
  document.body.appendChild(el);

  const computedClass = getTailwindBaseCssValues(el, ["background-image"]);
  const computedGradient =
    computedClass["background-image"] &&
    computedClass["background-image"] !== "none"
      ? parseGradient(computedClass["background-image"])
      : null;

  let gradient: AudioMotionGradientProperties | null = null;

  if (computedGradient) {
    gradient = { bgColor: "rgba(0, 0, 0, 0, 0)", dir: "v", colorStops: [] };
    gradient.dir = (
      computedGradient.direction.includes("bottom") ||
      computedGradient.direction.includes("top")
        ? "v"
        : "h"
    ) as "h" | "v";
    gradient.colorStops = computedGradient.stops;
  }

  document.body.removeChild(el);
  return gradient;
};

export const gradientFromElement = (
  el: HTMLElement | null,
): AudioMotionGradientProperties | null => {
  if (!el) return null;

  const classes = el?.className || "";
  const styles = el?.getAttribute("style");

  if (styles) {
    const { parseGradient } = useTailwindClassParser();
    const result = parseGradient(styles);
    if (result) {
      const gradient = {
        bgColor: "rgba(0, 0, 0, 0, 0)",
        dir: "v" as "h" | "v",
        colorStops: [] as any[],
      };
      gradient.dir =
        result.direction.includes("bottom") || result.direction.includes("top")
          ? ("v" as const)
          : ("h" as const);
      gradient.colorStops = result.stops;
      return gradient;
    }
  }

  return gradientFromClasses(classes);
};

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

export enum AudioMotionMode {
  Discrete = 0,
  OctaveBands24th = 1,
  OctaveBands12th = 2,
  OctaveBands8th = 3,
  OctaveBands6th = 4,
  OctaveBands4th = 5,
  OctaveBands3rd = 6,
  HalfOctaveBands = 7,
  FullOctaveBands = 8,
  Graph = 10,
}

export enum AudioMotionMirror {
  Left = -1,
  None = 0,
  Right = 1,
}

export enum AudioMotionFrequencyScale {
  Bark = "bark",
  Linear = "linear",
  Log = "log",
  Mel = "mel",
}

export type AudioMotionFftSize =
  | 32
  | 64
  | 128
  | 256
  | 512
  | 1024
  | 2048
  | 4096
  | 8192
  | 16384
  | 32768;

export interface AudioMotionGradientDefinition {
  name: string;
  gradient: AudioMotionGradientProperties;
}

export interface AudioMotionGradientProperties {
  bgColor: string;
  dir?: "h" | "v" | undefined;
  colorStops: GradientColorStop[];
}

export enum AudioMotionWeightingFilter {
  None = "",
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  ItuR468 = "468",
}

export { default as AudioVisualizer } from "./AudioVisualizer.vue";
export { default as AudioMotionAnalyzer } from "./AudioMotionAnalyzer.vue";
export { default as AudioMotionGradient } from "./AudioMotionGradient.vue";

export type { AudioMotionAnalyzerProps } from "./AudioMotionAnalyzer.vue";
export type { AudioMotionGradientProps } from "./AudioMotionGradient.vue";

export const AudioMotionGradientsKey: InjectionKey<
  Ref<AudioMotionGradientDefinition[]>
> = Symbol("AudioMotionGradients");

export { type AudioVisualizerMode } from "./AudioVisualizer.vue";
export { type AudioVisualizerProps } from "./AudioVisualizer.vue";
```

```vue [src/components/ui/audio-motion-analyzer/AudioMotionAnalyzer.vue]
<script setup lang="ts">
import AudioMotion, { type FrequencyScale } from "audiomotion-analyzer";
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
  provide,
  watchEffect,
} from "vue";
import { AudioContextInjectionKey } from "@/components/ui/audio-context-provider";
import { useTypedElementSearch } from "~~/registry/new-york/composables/use-typed-element-search/useTypedElementSearch";
import {
  AudioMotionMode,
  AudioMotionMirror,
  AudioMotionGradientsKey,
  AudioMotionWeightingFilter,
  type AudioMotionGradientDefinition,
  type AudioMotionGradientProperties,
  type AudioMotionFftSize,
} from ".";

export interface AudioMotionAnalyzerProps {
  alphaBars?: boolean;
  ansiBands?: boolean;
  audio?: HTMLAudioElement | Ref<HTMLAudioElement | null> | null;
  barSpace?: number;
  channelLayout?:
    | "single"
    | "dual-combined"
    | "dual-horizontal"
    | "dual-vertical";
  class?: HTMLAttributes["class"];
  colorMode?: "gradient" | "bar-index" | "bar-level";
  connectSpeakers?: boolean;
  disableReflexFit?: boolean;
  fadePeaks?: boolean;
  fftSize?: AudioMotionFftSize;
  fillAlpha?: number;
  frequencyScale?: string;
  gradient?:
    | "classic"
    | "orangered"
    | "prism"
    | "rainbow"
    | "steelblue"
    | string;
  gradientLeft?:
    | "classic"
    | "orangered"
    | "prism"
    | "rainbow"
    | "steelblue"
    | string;
  gradientRight?:
    | "classic"
    | "orangered"
    | "prism"
    | "rainbow"
    | "steelblue"
    | string;
  gravity?: number;
  ledBars?: boolean;
  linearAmplitude?: boolean;
  linearBoost?: number;
  lineWidth?: number;
  lumiBars?: boolean;
  maxDecibels?: number;
  minDecibels?: number;
  maxFps?: number;
  maxFreq?: number;
  minFreq?: number;
  mirror?: number;
  mode?: number;
  noteLabels?: boolean;
  outlineBars?: boolean;
  overlay?: boolean;
  peakFadeTime?: number;
  peakHoldTime?: number;
  peakLine?: boolean;
  radial?: boolean;
  radialInvert?: boolean;
  radius?: number;
  reflexAlpha?: number;
  reflexBright?: number;
  reflexRatio?: number;
  roundBars?: boolean;
  showBgColor?: boolean;
  showFPS?: boolean;
  showPeaks?: boolean;
  showScaleX?: boolean;
  showScaleY?: boolean;
  smoothing?: number;
  spinSpeed?: number;
  splitGradient?: boolean;
  stream?: MediaStream | null;
  trueLeds?: boolean;
  volume?: number;
  weightingFilter?: string;
}

const props = withDefaults(defineProps<AudioMotionAnalyzerProps>(), {
  audio: undefined,
  barSpace: 0.1,
  channelLayout: "dual-combined",
  colorMode: "gradient",
  connectSpeakers: false,
  disableReflexFit: false,
  fadePeaks: false,
  fftSize: 8192,
  fillAlpha: 1,
  frequencyScale: "log",
  gradient: "classic",
  gravity: 3.8,
  ledBars: false,
  linearAmplitude: false,
  linearBoost: 1,
  lineWidth: 0,
  lumiBars: false,
  maxDecibels: -25,
  minDecibels: -85,
  maxFps: 0,
  maxFreq: 22000,
  minFreq: 20,
  mirror: 0,
  mode: 3,
  noteLabels: false,
  outlineBars: false,
  overlay: false,
  peakFadeTime: 750,
  peakHoldTime: 500,
  peakLine: false,
  radial: false,
  radialInvert: false,
  radius: 0.3,
  reflexAlpha: 0.15,
  reflexBright: 1,
  reflexRatio: 0,
  roundBars: false,
  showBgColor: false,
  showFPS: false,
  showPeaks: false,
  showScaleX: false,
  showScaleY: false,
  smoothing: 0.5,
  spinSpeed: 0,
  splitGradient: false,
  stream: undefined,
  trueLeds: false,
  volume: 1,
  weightingFilter: "",
});

const { getTypedElementAmongSiblings, getContainer } = useTypedElementSearch();

const noDisplayElement = useTemplateRef("noDisplayRef");
const injectedContext = inject<Ref<AudioContext | null>>(
  AudioContextInjectionKey,
  ref(null),
);

const gradients = ref<AudioMotionGradientDefinition[]>([]);
provide<Ref<AudioMotionGradientDefinition[]>>(
  AudioMotionGradientsKey,
  gradients,
);

let analyzer: AudioMotion | null = null;
let source: MediaStreamAudioSourceNode | null = null;

const registerGradients = () => {
  if (analyzer) {
    for (const gradientDef of gradients.value) {
      const { name, gradient } = gradientDef;
      analyzer.registerGradient(
        name,
        gradient as any & AudioMotionGradientProperties,
      );
    }
  }
};

const setupAnalyzer = async () => {
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
        analyzer = new AudioMotion(container, {
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
        analyzer = new AudioMotion({
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

    const width = canvas ? canvas.width : container?.clientWidth;
    const height = canvas ? canvas.height : container?.clientHeight;
    const options = {
      alphaBars: props.alphaBars,
      ansiBands: props.ansiBands,
      audioCtx: context,
      barSpace: props.barSpace,
      channelLayout: props.channelLayout,
      colorMode: props.colorMode,
      connectSpeakers: props.connectSpeakers,
      fadePeaks: props.fadePeaks,
      fftSize: props.fftSize,
      fillAlpha: props.fillAlpha,
      frequencyScale: props.frequencyScale as FrequencyScale,
      gravity: props.gravity,
      height,
      ledBars: props.ledBars,
      linearAmplitude: props.linearAmplitude,
      linearBoost: Math.max(props.linearBoost, 1),
      lineWidth: Math.max(props.lineWidth || 0, 0),
      lumiBars: props.lumiBars,
      maxDecibels: props.maxDecibels,
      minDecibels: props.minDecibels,
      maxFPS: props.maxFps,
      maxFreq: Math.max(props.maxFreq, 1),
      minFreq: Math.max(props.minFreq, 1),
      mirror: props.mirror,
      mode: props.mode,
      noteLabels: props.noteLabels,
      outlineBars: props.outlineBars,
      overlay: props.overlay,
      peakFadeTime: props.peakFadeTime,
      peakHoldTime: props.peakHoldTime,
      peakLine: props.peakLine,
      radial: props.radial,
      radialInvert: props.radialInvert,
      radius: props.radius,
      reflexAlpha: Math.max(0, Math.min(props.reflexAlpha ?? 0, 1)),
      reflexBright: Math.max(0, props.reflexBright ?? 1),
      reflexFit: !props.disableReflexFit,
      reflexRatio: Math.max(0, Math.min(props.reflexRatio ?? 0, 1)),
      roundBars: props.roundBars,
      showBgColor: props.showBgColor,
      showFPS: props.showFPS,
      showPeaks: props.showPeaks,
      showScaleX: props.showScaleX,
      showScaleY: props.showScaleY,
      smoothing: Math.max(0, Math.min(props.smoothing ?? 0, 1)),
      spinSpeed: props.spinSpeed || 0,
      splitGradient: props.splitGradient || false,
      trueLeds: props.trueLeds || false,
      volume: Math.max(0, props.volume || 1),
      weightingFilter: props.weightingFilter as AudioMotionWeightingFilter,
      width,
      ...(canvas ? { canvas } : {}),
    };

    analyzer = canvas
      ? new AudioMotion(options)
      : container
        ? new AudioMotion(container, options)
        : null;

    if (analyzer) {
      if (canvas) {
        analyzer.showBgColor = false;
        registerGradients();
      }
      analyzer.gradient = props.gradient;
      if (props.gradientLeft) analyzer.gradientLeft = props.gradientLeft;
      if (props.gradientRight) analyzer.gradientRight = props.gradientRight;

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

watch(
  () => [props.stream, props.audio, injectedContext.value],
  () => {
    nextTick(async () => {
      await setupAnalyzer();
    });
  },
  { immediate: true },
);

watch(
  () => gradients.value,
  async () => {
    if (analyzer) {
      registerGradients();
    }
  },
  { immediate: true },
);

watch(
  () => props.connectSpeakers,
  async () => {
    if (analyzer) {
      const ctx = analyzer.audioCtx;
      const destination = ctx.destination;

      props.connectSpeakers
        ? analyzer.connectOutput()
        : analyzer.disconnectOutput(destination);
    }
  },
);

watchEffect(
  () => {
    if (analyzer) {
      analyzer.alphaBars = !!props.alphaBars;
      analyzer.ansiBands = !!props.ansiBands;
      analyzer.barSpace = props.barSpace || 0.1;
      analyzer.channelLayout = props.channelLayout;
      analyzer.colorMode = props.colorMode || "gradient";
      analyzer.fadePeaks = !!props.fadePeaks;
      analyzer.fftSize = props.fftSize as AudioMotionFftSize;
      analyzer.fillAlpha = props.fillAlpha || 1;
      analyzer.frequencyScale = props.frequencyScale as FrequencyScale;
      if (props.gradientLeft) analyzer.gradientLeft = props.gradientLeft;
      if (props.gradientRight) analyzer.gradientRight = props.gradientRight;
      analyzer.gravity = props.gravity || 3.8;
      analyzer.ledBars = !!props.ledBars;
      analyzer.linearAmplitude = !!props.linearAmplitude;
      analyzer.linearBoost = Math.max(props.linearBoost, 1);
      analyzer.lineWidth = Math.max(props.lineWidth || 0, 0);
      analyzer.lumiBars = !!props.lumiBars;
      analyzer.maxDecibels = props.maxDecibels;
      analyzer.minDecibels = props.minDecibels;
      analyzer.maxFPS = props.maxFps || 0;
      analyzer.maxFreq = Math.max(props.maxFreq, 1);
      analyzer.minFreq = Math.max(props.minFreq, 1);
      analyzer.mirror = props.mirror || AudioMotionMirror.None;
      analyzer.mode = props.mode || AudioMotionMode.OctaveBands8th;
      analyzer.noteLabels = !!props.noteLabels;
      analyzer.outlineBars = !!props.outlineBars;
      analyzer.overlay = props.overlay;
      analyzer.peakFadeTime = props.peakFadeTime || 750;
      analyzer.peakHoldTime = props.peakHoldTime || 500;
      analyzer.peakLine = props.peakLine || false;
      analyzer.radial = props.radial || false;
      analyzer.radialInvert = props.radialInvert || false;
      analyzer.radius = props.radius || 0.3;
      analyzer.reflexAlpha = Math.max(0, Math.min(props.reflexAlpha ?? 0, 1));
      analyzer.reflexBright = Math.max(0, props.reflexBright ?? 1);
      analyzer.reflexFit = !props.disableReflexFit;
      analyzer.reflexRatio = Math.max(0, Math.min(props.reflexRatio ?? 0, 1));
      analyzer.roundBars = !!props.roundBars;
      analyzer.showBgColor = !!props.showBgColor;
      analyzer.showFPS = !!props.showFPS;
      analyzer.showPeaks = !!props.showPeaks;
      analyzer.showScaleX = !!props.showScaleX;
      analyzer.showScaleY = !!props.showScaleY;
      analyzer.smoothing = Math.max(0, Math.min(props.smoothing ?? 0.5, 1));
      analyzer.spinSpeed = props.spinSpeed || 0;
      analyzer.splitGradient = !!props.splitGradient;
      analyzer.trueLeds = !!props.trueLeds;
      analyzer.volume = Math.max(0, props.volume || 1);
      analyzer.weightingFilter = (props.weightingFilter ||
        "") as AudioMotionWeightingFilter;
    }
  },
  { flush: "post" },
);

onUnmounted(() => {
  cleanUp();
});
</script>

<template>
  <div ref="noDisplayRef" class="hidden z-[-9999]" />
  <slot data-slot="audio-motion-analyzer" />
</template>
```

```vue [src/components/ui/audio-motion-analyzer/AudioMotionGradient.vue]
<script setup lang="ts">
import {
  nextTick,
  unref,
  useTemplateRef,
  watch,
  inject,
  ref,
  type HTMLAttributes,
  type Ref,
} from "vue";
import { cn } from "@/lib/utils";
import {
  AudioMotionGradientsKey,
  gradientFromElement,
  type AudioMotionGradientDefinition,
  type AudioMotionGradientProperties,
} from ".";

export interface AudioMotionGradientProps {
  name: string;
  class?: HTMLAttributes["class"];
  style?: HTMLAttributes["style"];
  gradient?: AudioMotionGradientProperties | null;
}

const props = defineProps<AudioMotionGradientProps>();

const gradients = inject<Ref<AudioMotionGradientDefinition[]>>(
  AudioMotionGradientsKey,
  ref([]),
);

const gradientRef = useTemplateRef("gradientRef");

const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== "object" || a === null || b === null) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (!bKeys.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
};

const addIfNotExisting = (
  gradientDefinition: AudioMotionGradientDefinition,
) => {
  const existingIndex = gradients.value.findIndex(
    (g) => g.name === gradientDefinition.name,
  );
  console.log("Got existing gradient index:", existingIndex);
  if (existingIndex !== -1) {
    const newGradient = gradientDefinition.gradient;
    const existingGradient = gradients.value[existingIndex]!.gradient;

    const isSame = deepEqual(newGradient, existingGradient);
    if (!isSame) {
      console.warn(
        "Updating existing gradient:",
        gradientDefinition.name,
        gradientDefinition.gradient,
      );
      gradients.value[existingIndex]!.gradient = newGradient;
    }
  } else {
    gradients.value.push({
      name: props.name,
      gradient: gradientDefinition.gradient,
    });
  }
};

const addGradient = () => {
  const propsGradient: AudioMotionGradientProperties | null | undefined =
    props.gradient;
  if (propsGradient) {
    addIfNotExisting({
      name: props.name,
      gradient: propsGradient,
    });
    return;
  }

  const el = unref(gradientRef);
  if (el) {
    const gradientProperties: AudioMotionGradientProperties | null =
      gradientFromElement(el);
    if (gradientProperties) {
      addIfNotExisting({
        name: props.name,
        gradient: gradientProperties,
      });
    }
  }
};

watch(
  () => [props.gradient, props.class, props.style],
  () => {
    nextTick(() => {
      addGradient();
    });
  },
  { immediate: true },
);
</script>

<template>
  <div
    ref="gradientRef"
    data-slot="audio-motion-gradient"
    :class="cn('hidden', props.class)"
    :style="props.style"
  ></div>
</template>
```

```vue [src/components/ui/audio-motion-analyzer/AudioVisualizer.vue]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawFft.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawFftEnhanced.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawFrequencyBars.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawLedBars.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawMirroredSpectrum.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawPeakHold.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawScopeXY.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawSpectrogram.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawWaterfall.ts]
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

```ts [src/components/ui/audio-motion-analyzer/visualizers/drawWaveform.ts]
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

```ts [src/composables/use-tailwind-class-parser/useTailwindClassParser.ts]
export interface GradientColorStop {
  color: string;
  pos: number;
}

export interface GradientParseResult {
  stops: GradientColorStop[];
  direction: string;
}

const combineRegExp = (regexpList: (RegExp[] | string)[], flags: string) => {
  let i,
    source = "";
  for (i = 0; i < regexpList.length; i++) {
    if (typeof regexpList[i] === "string") {
      source += regexpList[i];
    } else {
      source += (regexpList[i] as any).source;
    }
  }
  return new RegExp(source, flags);
};

const buildGradientRegExp = () => {
  const searchFlags = "gi";
  const rAngle = /(?:[+-]?\d*\.?\d+)(?:deg|grad|rad|turn)/;

  const rSideCornerCapture =
    /to\s+((?:left|right|top|bottom)(?:\s+(?:left|right|top|bottom))?)/;
  const rComma = /\s*,\s*/;
  const rColorHex = /\#(?:[a-f0-9]{6}|[a-f0-9]{3})/;
  const rColorOklch = /oklch\(\s*(?:[+-]?\d*\.?\d+\s*){3}\)/;
  const rDigits3 = /\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\)/;
  const rDigits4 = /\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*,\s*\d*\.?\d+\)/;
  const rValue = /(?:[+-]?\d*\.?\d+)(?:%|[a-z]+)?/;
  const rKeyword = /[_a-z-][_a-z0-9-]*/;
  const rColor = combineRegExp(
    [
      "(?:",
      rColorHex.source,
      "|",
      "(?:rgb|hsl)",
      rDigits3.source,
      "|",
      "(?:rgba|hsla)",
      rDigits4.source,
      "|",
      rColorOklch.source,
      "|",
      rKeyword.source,
      ")",
    ],
    "",
  );
  const rColorStop = combineRegExp(
    [rColor.source, "(?:\\s+", rValue.source, "(?:\\s+", rValue.source, ")?)?"],
    "",
  );
  const rColorStopList = combineRegExp(
    ["(?:", rColorStop.source, rComma.source, ")*", rColorStop.source],
    "",
  );
  const rLineCapture = combineRegExp(
    ["(?:(", rAngle.source, ")|", rSideCornerCapture.source, ")"],
    "",
  );
  const rGradientSearch = combineRegExp(
    [
      "(?:(",
      rLineCapture.source,
      ")",
      rComma.source,
      ")?(",
      rColorStopList.source,
      ")",
    ],
    searchFlags,
  );
  const rColorStopSearch = combineRegExp(
    [
      "\\s*(",
      rColor.source,
      ")",
      "(?:\\s+",
      "(",
      rValue.source,
      "))?",
      "(?:",
      rComma.source,
      "\\s*)?",
    ],
    searchFlags,
  );

  return {
    gradientSearch: rGradientSearch,
    colorStopSearch: rColorStopSearch,
  };
};

const RegExpLib = buildGradientRegExp();

export const useTailwindClassParser = () => {
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

  const parseGradient = function (
    input: string,
  ): GradientParseResult | undefined {
    const rGradientEnclosedInBrackets =
      /.*gradient\s*\(((?:\([^\)]*\)|[^\)\(]*)*)\)/;
    const matchGradientType = rGradientEnclosedInBrackets.exec(input);

    let strToParse = input;
    if (matchGradientType && matchGradientType[1]) {
      strToParse = matchGradientType[1];
    }

    let result: GradientParseResult | undefined;
    let matchGradient: RegExpExecArray | null;
    let matchColorStop: RegExpExecArray | null;
    let stopResult: GradientColorStop;

    RegExpLib.gradientSearch.lastIndex = 0;

    matchGradient = RegExpLib.gradientSearch.exec(strToParse);
    if (matchGradient !== null) {
      result = {
        stops: [],
        direction: "to bottom",
      };

      if (!!matchGradient[1]) {
        result.direction = matchGradient[1] || "to bottom";
      }

      if (!!matchGradient[2]) {
        result.direction = matchGradient[2];
      }

      if (!!matchGradient[3]) {
        result.direction = matchGradient[3] || "to bottom";
      }

      RegExpLib.colorStopSearch.lastIndex = 0;

      if (typeof matchGradient[4] === "string") {
        matchColorStop = RegExpLib.colorStopSearch.exec(matchGradient[4]);
        while (matchColorStop !== null) {
          stopResult = {
            color: matchColorStop[1] || "rgba(0,0,0,0)",
            pos: 0,
          };

          if (!!matchColorStop[2]) {
            let pos = matchColorStop[2];
            if (pos && pos.endsWith("%")) {
              stopResult.pos = parseFloat(pos) / 100;
            } else {
              stopResult.pos = Number(pos);
            }
          }
          result.stops.push(stopResult);

          matchColorStop = RegExpLib.colorStopSearch.exec(matchGradient[4]);
        }
      }
    }

    return result;
  };

  return {
    getTailwindBaseCssValues,
    parseGradient,
  };
};
```
:::

## AudioMotionAnalyzer
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `alphaBars`{.primary .text-primary} | `boolean` | - |  |
| `ansiBands`{.primary .text-primary} | `boolean` | - |  |
| `audio`{.primary .text-primary} | `HTMLAudioElement \| Ref<HTMLAudioElement \| null> \| null` | — |  |
| `barSpace`{.primary .text-primary} | `number` | 0.1 |  |
| `channelLayout`{.primary .text-primary} | `'single' \| 'dual-combined' \| 'dual-horizontal' \| 'dual-vertical'` | dual-combined |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |
| `colorMode`{.primary .text-primary} | `'gradient' \| 'bar-index' \| 'bar-level'` | gradient |  |
| `connectSpeakers`{.primary .text-primary} | `boolean` | false |  |
| `disableReflexFit`{.primary .text-primary} | `boolean` | false |  |
| `fadePeaks`{.primary .text-primary} | `boolean` | false |  |
| `fftSize`{.primary .text-primary} | `AudioMotionFftSize` | 8192 |  |
| `fillAlpha`{.primary .text-primary} | `number` | 1 |  |
| `frequencyScale`{.primary .text-primary} | `string` | log |  |
| `gradient`{.primary .text-primary} | `'classic' \| 'orangered' \| 'prism' \| 'rainbow' \| 'steelblue' \| string` | classic |  |
| `gradientLeft`{.primary .text-primary} | `'classic' \| 'orangered' \| 'prism' \| 'rainbow' \| 'steelblue' \| string` | - |  |
| `gradientRight`{.primary .text-primary} | `'classic' \| 'orangered' \| 'prism' \| 'rainbow' \| 'steelblue' \| string` | - |  |
| `gravity`{.primary .text-primary} | `number` | 3.8 |  |
| `ledBars`{.primary .text-primary} | `boolean` | false |  |
| `linearAmplitude`{.primary .text-primary} | `boolean` | false |  |
| `linearBoost`{.primary .text-primary} | `number` | 1 |  |
| `lineWidth`{.primary .text-primary} | `number` | 0 |  |
| `lumiBars`{.primary .text-primary} | `boolean` | false |  |
| `maxDecibels`{.primary .text-primary} | `number` | -25 |  |
| `minDecibels`{.primary .text-primary} | `number` | -85 |  |
| `maxFps`{.primary .text-primary} | `number` | 0 |  |
| `maxFreq`{.primary .text-primary} | `number` | 22000 |  |
| `minFreq`{.primary .text-primary} | `number` | 20 |  |
| `mirror`{.primary .text-primary} | `number` | 0 |  |
| `mode`{.primary .text-primary} | `number` | 3 |  |
| `noteLabels`{.primary .text-primary} | `boolean` | false |  |
| `outlineBars`{.primary .text-primary} | `boolean` | false |  |
| `overlay`{.primary .text-primary} | `boolean` | false |  |
| `peakFadeTime`{.primary .text-primary} | `number` | 750 |  |
| `peakHoldTime`{.primary .text-primary} | `number` | 500 |  |
| `peakLine`{.primary .text-primary} | `boolean` | false |  |
| `radial`{.primary .text-primary} | `boolean` | false |  |
| `radialInvert`{.primary .text-primary} | `boolean` | false |  |
| `radius`{.primary .text-primary} | `number` | 0.3 |  |
| `reflexAlpha`{.primary .text-primary} | `number` | 0.15 |  |
| `reflexBright`{.primary .text-primary} | `number` | 1 |  |
| `reflexRatio`{.primary .text-primary} | `number` | 0 |  |
| `roundBars`{.primary .text-primary} | `boolean` | false |  |
| `showBgColor`{.primary .text-primary} | `boolean` | false |  |
| `showFPS`{.primary .text-primary} | `boolean` | false |  |
| `showPeaks`{.primary .text-primary} | `boolean` | false |  |
| `showScaleX`{.primary .text-primary} | `boolean` | false |  |
| `showScaleY`{.primary .text-primary} | `boolean` | false |  |
| `smoothing`{.primary .text-primary} | `number` | 0.5 |  |
| `spinSpeed`{.primary .text-primary} | `number` | 0 |  |
| `splitGradient`{.primary .text-primary} | `boolean` | false |  |
| `stream`{.primary .text-primary} | `MediaStream \| null` | — |  |
| `trueLeds`{.primary .text-primary} | `boolean` | false |  |
| `volume`{.primary .text-primary} | `number` | 1 |  |
| `weightingFilter`{.primary .text-primary} | `string` | — |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `AudioMotionGradientsKey`{.primary .text-primary} | `gradients` | `Ref<AudioMotionGradientDefinition[]>` | — |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `AudioContextInjectionKey`{.primary .text-primary} | `ref(null)` | `any` | — |

---

## AudioMotionGradient
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name`{.primary .text-primary} | `string` | - |  |
| `class`{.primary .text-primary} | `HTMLAttributes['class']` | - |  |
| `style`{.primary .text-primary} | `HTMLAttributes['style']` | - |  |
| `gradient`{.primary .text-primary} | `AudioMotionGradientProperties \| null` | - |  |

  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `AudioMotionGradientsKey`{.primary .text-primary} | `ref([])` | `any` | — |

---

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
import { AudioVisualizer } from "~~/registry/new-york/components/audio-motion-analyzer";

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