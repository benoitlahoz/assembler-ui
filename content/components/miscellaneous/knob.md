---
title: Knob
description: 
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <knob />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
  ```vue
  <Knob />
  ```
  :::
::



## Install with CLI
:::code-group{.w-full}
  
  ```bash [yarn]
  yarn dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/knob.json"
  ```
  
  ```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/knob.json"
  ```

  ```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/knob.json"
  ```
  
  ```bash [bun]
  bunx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/knob.json"
  ```
:::



## Install Manually

Copy and paste the following code
::code-tree


```vue [Knob.vue]
<script setup lang="ts">
// @ajs-description A simple knob component that displays a button with "Hello World" text.
import { Button } from '@/components/ui/button';

const props = withDefaults(
  defineProps<{
    // @ajs-prop An optional string property named foo.
    foo?: string;
    // @ajs-prop A required number property named bar.
    bar: number;
  }>(),
  {
    bar: 42,
  }
);
</script>

<template>
  <Button>Hello World</Button>
</template>

```


::




## Knob



**API**: composition





  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `foo`{.primary .text-primary} | `string` | `-` | @ajs-prop An optional string property named foo. |
| `bar`{.primary .text-primary} | `number` | `42` | @ajs-prop A required number property named bar. |
| `foo`{.primary .text-primary} | `string` | `-` | @ajs-prop An optional string property named foo. |
| `bar`{.primary .text-primary} | `number` | `42` | @ajs-prop A required number property named bar. |




















<details>
  <summary>Voir le code source HTML</summary>
  <pre><code>&lt;script setup lang=&#34;ts&#34;&gt;
// @ajs-description A simple knob component that displays a button with &#34;Hello World&#34; text.
import { Button } from &#39;@/components/ui/button&#39;;

const props = withDefaults(
  defineProps&lt;{
    // @ajs-prop An optional string property named foo.
    foo?: string;
    // @ajs-prop A required number property named bar.
    bar: number;
  }&gt;(),
  {
    bar: 42,
  }
);
&lt;/script&gt;

&lt;template&gt;
  &lt;Button&gt;Hello World&lt;/Button&gt;
&lt;/template&gt;
</code></pre>
</details>



<details>
  <summary>Voir le code source Pug</summary>
  <pre><code>&lt;script setup lang=&#34;ts&#34;&gt;
// @ajs-description A simple knob component that displays a button with &#34;Hello World&#34; text.
import { Button } from &#39;@/components/ui/button&#39;;

const props = withDefaults(
  defineProps&lt;{
    // @ajs-prop An optional string property named foo.
    foo?: string;
    // @ajs-prop A required number property named bar.
    bar: number;
  }&gt;(),
  {
    bar: 42,
  }
);
&lt;/script&gt;

&lt;template lang=&#34;pug&#34;&gt;
Button
  | Hello World
&lt;/template&gt;
</code></pre>
</details>





## Advanced Usage

<!-- Add more code-preview/code-group/code-tree blocks as needed for advanced examples -->

::tip
You can copy and adapt this template for any component documentation.
::