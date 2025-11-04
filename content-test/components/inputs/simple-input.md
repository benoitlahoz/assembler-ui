---
title: SimpleInput
description: Index file for input components
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <simple-input-demo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
```vue
<script setup lang="ts">
import { SimpleInput } from "@/components/ui/simple-input";
</script>

<template>
  <div class="h-128 min-h-128 flex flex-col items-center">
    <SimpleInput label="Name" placeholder="Enter your name" />
  </div>
</template>

<style scoped></style>
```
  :::
::

## Install with CLI
::hr-underline
::

This will install the component in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/simple-input.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/simple-input.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/simple-input.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/simple-input.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/components/ui/simple-input/index.ts"}

```ts [src/components/ui/simple-input/index.ts]
export { default as SimpleInput } from "./SimpleInput.vue";
export { default as SimpleInputSetup } from "./SimpleInputSetup.vue";
```

```vue [src/components/ui/simple-input/SimpleInput.vue]
<script lang="ts">
const symKey = Symbol("symKey");

export default {
  name: "SimpleInput",

  props: {
    label: {
      type: String,
      required: false,
      default: "",
    },

    placeholder: {
      type: String,
      required: false,
      default: "",
    },

    modelValue: {
      type: String,
      required: false,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  inject: {
    injected: "someKey",

    injectedSym: symKey,

    injectedSpread: "spread",
  },
  provide() {
    return {
      someOtherKey: "providedValue",

      symKey: "valSym",

      computedKey: true,
    };
  },
  methods: {
    onInput(event: Event) {
      this.$emit("update:modelValue", (event.target as HTMLInputElement).value);
    },
  },

  expose: ["exposed", "other", "myFunc"],
};
</script>

<template>
  <div class="flex flex-col">
    <label v-if="label">{{ label }}</label>
    <input
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
      type="text"
    />
  </div>
</template>

<style scoped>
:root {
  --input-border-color: #ccc;
  --input-border-radius: 4px;
  --input-padding: 0.5em 1em;
  --input-font-size: 1em;
}

input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5em 1em;
  font-size: 1em;
}
label {
  display: block;
  margin-bottom: 0.25em;
  font-weight: bold;
}
</style>
```

```vue [src/components/ui/simple-input/SimpleInputSetup.vue]
<script setup lang="ts">
import { ref, inject, provide, defineExpose } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: false,
    default: "",
  },

  placeholder: {
    type: String,
    required: false,
    default: "",
  },

  modelValue: {
    type: String,
    required: false,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const symKey = Symbol("symKey");

const injected = inject("someKey");
const injectedSym = inject(symKey);
const injectedSpread = inject("spread");

provide("someOtherKey", "providedValue");
provide(symKey, "valSym");
provide("computedKey", true);

const bar = ref("bar");

function onInput(event: Event) {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
}

const exposed = ref("exposed");
const other = ref("other");
function myFunc() {
  console.log("myFunc called");
  return "foo";
}
defineExpose({ exposed, other, myFunc });
</script>

<template>
  <label v-if="props.label">{{ props.label }}</label>
  <input
    :placeholder="props.placeholder"
    :value="props.modelValue"
    @input="onInput"
    type="text"
  />
</template>

<style scoped>
:root {
  --input-border-color: #ccc;
  --input-border-radius: 4px;
  --input-padding: 0.5em 1em;
  --input-font-size: 1em;
}

input {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5em 1em;
  font-size: 1em;
}
label {
  display: block;
  margin-bottom: 0.25em;
  font-weight: bold;
}
</style>
```
:::

