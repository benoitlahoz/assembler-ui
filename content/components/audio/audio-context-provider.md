---
title: AudioContextProvider
description: 
---

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-context-provider.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-context-provider.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-context-provider.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/audio-context-provider.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/audio-context-provider/index.ts"}

```ts [src/components/ui/audio-context-provider/index.ts]
export { default as AudioContextProvider } from "./AudioContextProvider.vue";

export { type AudioContextProviderProps } from "./AudioContextProvider.vue";
```

```vue [src/components/ui/audio-context-provider/AudioContextProvider.vue]
<script setup lang="ts">
import { ref, watch } from "vue";
import { useAudioContext } from "~~/registry/new-york/composables/use-audio-context/useAudioContext";

export interface AudioContextProviderProps {
  latencyHint?: AudioContextLatencyCategory;
  sampleRate?: number;
}

const props = withDefaults(defineProps<AudioContextProviderProps>(), {
  latencyHint: "interactive",
  sampleRate: 44100,
});

const { context, updateContext } = useAudioContext({
  latencyHint: props.latencyHint,
  sampleRate: props.sampleRate,
});

const latencyHint = ref(props.latencyHint);
const sampleRate = ref(props.sampleRate);

watch(
  () => [props.latencyHint, props.sampleRate],
  ([newLatencyHint, newSampleRate]) => {
    if (typeof newLatencyHint === "string") {
      latencyHint.value = newLatencyHint;
    }

    if (typeof newSampleRate === "number") {
      sampleRate.value = newSampleRate;
    }

    updateContext({
      latencyHint:
        typeof latencyHint.value === "string"
          ? (latencyHint.value as AudioContextLatencyCategory)
          : undefined,
      sampleRate: sampleRate.value,
    });
  },
);
</script>

<template>
  <slot
    :audioContext="context"
    :updateContext="updateContext"
    :latencyHint="latencyHint"
    :sampleRate="sampleRate"
  />
</template>

<style scoped></style>
```

```ts [src/composables/use-audio-context/useAudioContext.ts]
import { onMounted, ref } from "vue";

const context = ref<AudioContext | null>(null);

export interface UseAudioContextOptions {
  latencyHint?: AudioContextLatencyCategory;
  sampleRate?: number;
}

export const useAudioContext = (options: UseAudioContextOptions) => {
  const latency = ref(options.latencyHint || "interactive");
  const sampleRate = ref(options.sampleRate || 44100);

  const createContext = () => {
    context.value = new AudioContext({
      latencyHint: latency.value,
      sampleRate: sampleRate.value,
    });
  };

  const updateContext = (options: {
    latencyHint?: AudioContextLatencyCategory;
    sampleRate?: number;
  }) => {
    if (context.value) {
      context.value.close();
      context.value = null;
    }
    createContext();
  };

  if (!context.value) {
    createContext();
  }

  onMounted(() => {
    if (context.value && context.value.state === "suspended") {
      context.value.resume();
      return;
    }

    if (!context.value) {
      createContext();
    }
  });

  return {
    context,
    updateContext,
  };
};
```
:::

## AudioContextProvider
::hr-underline
::

**API**: composition

  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `latencyHint`{.primary .text-primary} | `AudioContextLatencyCategory` | interactive |  |
| `sampleRate`{.primary .text-primary} | `number` | 44100 |  |

  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |

---

::tip
You can copy and adapt this template for any component documentation.
::