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
import { MediaDevicesProvider } from "@/components/ui/media-devices-provider";
</script>

<template>
  <div>Audio</div>
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
import { ref, onMounted, onUnmounted, watch } from "vue";

export interface AudioVisualizerProps {
  stream: MediaStream;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<AudioVisualizerProps>(), {
  width: 600,
  height: 200,
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number | null = null;
let audioCtx: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaStreamAudioSourceNode | null = null;
let channelData: Float32Array[] = [];

const draw = () => {
  if (!analyser || !canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, props.width, props.height);

  const channels = analyser.channelCount || 1;
  for (let ch = 0; ch < channels; ch++) {
    if (!channelData[ch] || !(channelData[ch] instanceof Float32Array)) {
      channelData[ch] = new Float32Array(analyser.fftSize);
    }
    const data = channelData[ch] as Float32Array<ArrayBuffer>;
    analyser.getFloatTimeDomainData(data);
    ctx.beginPath();
    const yOffset = (props.height / channels) * ch;
    for (let i = 0; i < data.length; i++) {
      const value = data[i] && Number.isFinite(data[i]) ? data[i] : 0;

      if (typeof value !== "number") continue;

      const x = (i / data.length) * props.width;
      const y =
        yOffset +
        (value * (props.height / channels)) / 2 +
        props.height / channels / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsl(${ch * 60}, 80%, 60%)`;
    ctx.stroke();
  }
  animationId = requestAnimationFrame(draw);
};

const setupAudio = () => {
  if (audioCtx) audioCtx.close();
  audioCtx = new AudioContext();
  source = audioCtx.createMediaStreamSource(props.stream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);
  draw();
};

onMounted(() => {
  setupAudio();
});

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (audioCtx) audioCtx.close();
});

watch(
  () => props.stream,
  () => {
    setupAudio();
  },
);
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
| `stream`{.primary .text-primary} | `MediaStream` | - |  |
| `width`{.primary .text-primary} | `number` | 600 |  |
| `height`{.primary .text-primary} | `number` | 200 |  |

---

::tip
You can copy and adapt this template for any component documentation.
::