---
title: AudioContextProvider
description: The component provides a global AudioContext to its child components via slots or provide/inject.
---

  <p class="text-pretty mt-4">Using the component or the useAudioContext composable ensures that only one AudioContext instance is created and shared between all components.</p>

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

```ts [src/composables/use-audio-context/useAudioContext.ts]
import { onMounted, ref } from "vue";

const context = ref<AudioContext | null>(null);

export interface UseAudioContextOptions {
  latencyHint?: AudioContextLatencyCategory;
  sampleRate?: number;
}

export const useAudioContext = (options?: UseAudioContextOptions) => {
  const latency = ref(options?.latencyHint || "interactive");
  const sampleRate = ref(options?.sampleRate || 44100);
  const errors = ref<Error[]>([]);
  const state = ref<"suspended" | "running" | "closed" | "interrupted">(
    "suspended",
  );

  const createContext = () => {
    try {
      context.value = new AudioContext({
        latencyHint: latency.value,
        sampleRate: sampleRate.value,
      });
      state.value = context.value.state;
      context.value.onstatechange = () => {
        state.value = context.value?.state ?? "closed";
      };
    } catch (err) {
      errors.value.push(err as Error);
      context.value = null;
      state.value = "closed";
    }
  };

  const updateContext = (options: {
    latencyHint?: AudioContextLatencyCategory;
    sampleRate?: number;
  }) => {
    try {
      if (context.value) {
        context.value.close();
        context.value = null;
        state.value = "closed";
      }
      if (options.latencyHint) latency.value = options.latencyHint;
      if (options.sampleRate) sampleRate.value = options.sampleRate;
      createContext();
    } catch (err) {
      errors.value.push(err as Error);
    }
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
    errors,
    state,
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

  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `AudioContextInjectionKey`{.primary .text-primary} | `context` | `any` | — |
| `AudioContextUpdateInjectionKey`{.primary .text-primary} | `updateContext` | `any` | — |
| `AudioContextLatencyHintKey`{.primary .text-primary} | `latencyHint` | `any` | — |
| `AudioContextSampleRateKey`{.primary .text-primary} | `sampleRate` | `any` | — |

  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `context`{.primary .text-primary} | — | — |
| `updateContext`{.primary .text-primary} | — | — |
| `latencyHint`{.primary .text-primary} | `Ref<any>` | — |
| `sampleRate`{.primary .text-primary} | `Ref<any>` | — |
| `errors`{.primary .text-primary} | — | — |
| `state`{.primary .text-primary} | — | — |

---

::tip
You can copy and adapt this template for any component documentation.
::