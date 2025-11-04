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


## SimpleInput
::hr-underline
::


Un champ de saisie simple avec label et placeholder


**API**: options


**Author**: Jane Doe &lt;jane.doe@example.com&gt;


  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `label`{.primary .text-primary} | `String` | — | Le label affiché au-dessus du champ |
| `placeholder`{.primary .text-primary} | `String` | — | Le placeholder du champ |
| `modelValue`{.primary .text-primary} | `String` | — | Valeur du champ |


  ### Events
| Name | Description |
|------|-------------|
| `update:modelValue`{.primary .text-primary} | Valeur du champ |


  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `someOtherKey`{.primary .text-primary} | `'providedValue'` | `string` | Provides a value with key 'someOtherKey'. |
| `symKey`{.primary .text-primary} | `'valSym'` | `string` | Provide avec clé symbole |
| `computedKey`{.primary .text-primary} | `true` | `boolean` | Provide avec clé computed |


  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `injected`{.primary .text-primary} | `'someKey'` | `string` | Injects a value with key 'someKey'. |
| `injectedSym`{.primary .text-primary} | `symKey` | `any` | Inject avec clé symbole |
| `injectedSpread`{.primary .text-primary} | `'spread'` | `string` | Inject avec spread |


  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `exposed`{.primary .text-primary} | — | An exposed string property |
| `other`{.primary .text-primary} | — | Another exposed string property |
| `myFunc`{.primary .text-primary} | — | An exposed function that logs a message and returns &#39;foo&#39; |


  ### CSS Variables
| Name | Value | Description |
|------|-------|-------------|
| `--input-border-color`{.primary .text-primary} | `#ccc` | — |
| `--input-border-radius`{.primary .text-primary} | `4px` | — |
| `--input-padding`{.primary .text-primary} | `0.5em 1em` | — |
| `--input-font-size`{.primary .text-primary} | `1em` | — |


---


## SimpleInputSetup
::hr-underline
::


Un champ de saisie simple avec label et placeholder (API Composition)


**API**: composition


**Author**: Jane Doe &lt;jane.doe@example.com&gt;


  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `label`{.primary .text-primary} | `String` | '' | Le label affiché au-dessus du champ |
| `placeholder`{.primary .text-primary} | `String` | '' | Le placeholder du champ |
| `modelValue`{.primary .text-primary} | `String` | '' | Valeur du champ |


  ### Events
| Name | Description |
|------|-------------|
| `update:modelValue`{.primary .text-primary} | Émis à chaque modification de la valeur |


  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `someOtherKey`{.primary .text-primary} | `'providedValue'` | `string` | Fourniture |
| `symKey`{.primary .text-primary} | `'valSym'` | `string` | — |
| `computedKey`{.primary .text-primary} | `true` | `boolean` | — |


  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `someKey`{.primary .text-primary} | — | — | Injection |
| `symKey`{.primary .text-primary} | — | — | — |
| `spread`{.primary .text-primary} | — | — | — |


  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `exposed`{.primary .text-primary} | `Ref<any>` | — |
| `other`{.primary .text-primary} | `Ref<any>` | — |
| `myFunc`{.primary .text-primary} | `() => string` | — |


  ### CSS Variables
| Name | Value | Description |
|------|-------|-------------|
| `--input-border-color`{.primary .text-primary} | `#ccc` | — |
| `--input-border-radius`{.primary .text-primary} | `4px` | — |
| `--input-padding`{.primary .text-primary} | `0.5em 1em` | — |
| `--input-font-size`{.primary .text-primary} | `1em` | — |


---


  ## Advanced Usage
  ::hr-underline
  ::

  
### Example
::hr-underline
::

A very simple example of SimpleInput usage.


::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <simple-input-demo-bis />
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

  
::tip
You can copy and adapt this template for any component documentation.
::