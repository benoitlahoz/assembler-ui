---
title: useAudioContext
description: 
---

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-audio-context.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-audio-context.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-audio-context.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-audio-context.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-audio-context/useAudioContext.ts"}

```ts [src/composables/use-audio-context/useAudioContext.ts]
import { onMounted, ref } from "vue";

let context: AudioContext | null = null;

export interface UseAudioContextOptions {
  latencyHint?: AudioContextLatencyCategory;
  sampleRate?: number;
}

export const useAudioContext = (options: UseAudioContextOptions) => {
  const latency = ref(options.latencyHint || "interactive");
  const sampleRate = ref(options.sampleRate || 44100);

  const createContext = () => {
    context = new AudioContext({
      latencyHint: latency.value,
      sampleRate: sampleRate.value,
    });
  };

  const updateContext = (options: {
    latencyHint?: AudioContextLatencyCategory;
    sampleRate?: number;
  }) => {
    if (context) {
      context.close();
      context = null;
    }
    createContext();
  };

  if (!context) {
    createContext();
  }

  onMounted(() => {
    if (context && context.state === "suspended") {
      context.resume();
      return;
    }

    if (!context) {
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

## API
::hr-underline
::

  ### Parameters
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `options`{.primary .text-primary} | `UseAudioContextOptions` | — | — |

  ### Returns

| Property | Type | Description |
|----------|------|-------------|
| `context`{.primary .text-primary} | `any` | — |
| `updateContext`{.primary .text-primary} | `any` | — |

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `UseAudioContextOptions`{.primary .text-primary} | `interface` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
