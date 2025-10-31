---
title: SimpleInput
description: Index file for input components
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <simple-input />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
  ```vue
  <SimpleInput />
  ```
  :::
::

## Install with CLI 

:::code-group{.w-full}
  ```bash [pnpm]
  pnpm add @nuxt/ui
  ```
  
  ```bash [yarn]
  yarn add @nuxt/ui
  ```
  
  ```bash [npm]
  npm install @nuxt/ui
  ```
  
  ```bash [bun]
  bun add @nuxt/ui
  ```
:::


## Install Manually

:::code-tree{default-value="src/components/ui/index.ts"}


```ts [src/components/ui/index.ts]
export { default as SimpleInput } from "./SimpleInput.vue";
export { default as SimpleInputSetup } from "./SimpleInputSetup.vue";

```

```ts [src/components/ui/something.ts]
export const a = 42;

```

```vue [src/components/ui/SimpleInput.vue]
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
  <label v-if="label">{{ label }}</label>
  <div>
    <slot name="prefix"></slot>
    <slot name="useful" :foo="bar" />
    <slot />
  </div>
  <MyComponent />
  <input
    :placeholder="placeholder"
    :value="modelValue"
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

```vue [src/components/ui/SimpleInputSetup.vue]
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
  <div>
    <slot name="prefix"></slot>
    <slot name="useful" :foo="bar" />
    <slot />
  </div>

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

--- 




## SimpleInput

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





  ### Slots
| Name | Description |
|------|-------------|
| `prefix`{.primary .text-primary} | — |
| `useful`{.primary .text-primary} | — |
| `default`{.primary .text-primary} | — |





  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `someOtherKey`{.primary .text-primary} | `'providedValue'` | `string` | Provides a value with key &#39;someOtherKey&#39;. || `symKey`{.primary .text-primary} | `'valSym'` | `string` | Provide avec clé symbole || `computedKey`{.primary .text-primary} | `true` | `boolean` | Provide avec clé computed |



  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `injected`{.primary .text-primary} | `'someKey'` | `string` | Injects a value with key &#39;someKey&#39;. || `injectedSym`{.primary .text-primary} | `symKey` | `any` | Inject avec clé symbole || `injectedSpread`{.primary .text-primary} | `'spread'` | `string` | Inject avec spread |



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







  ### Child Components
<ul>

  <li>MyComponent</li>

</ul>




<details>
  <summary>Voir le code source HTML</summary>
  <pre><code>&lt;script lang=&#34;ts&#34;&gt;
/**
 * Un champ de saisie simple avec label et placeholder
 * @author Jane Doe &lt;jane.doe@example.com&gt;
 * @type registry:ui
 */

const symKey = Symbol(&#39;symKey&#39;);

export default {
  name: &#39;SimpleInput&#39;,
  /**
   * Propriétés du composant
   */
  props: {
    /**
     * Le label affiché au-dessus du champ
     */
    label: {
      type: String,
      required: false,
      default: &#39;&#39;,
    },
    /**
     * Le placeholder du champ
     */
    placeholder: {
      type: String,
      required: false,
      default: &#39;&#39;,
    },
    /**
     * Valeur du champ
     */
    modelValue: {
      type: String,
      required: false,
      default: &#39;&#39;,
    },
  },
  emits: [
    /**
     * Émis à chaque modification de la valeur
     */
    &#39;update:modelValue&#39;,
  ],
  inject: {
    // Injects a value with key &#39;someKey&#39;.
    injected: &#39;someKey&#39;,
    // Inject avec clé symbole
    injectedSym: symKey,
    // Inject avec spread
    injectedSpread: &#39;spread&#39;,
  },
  provide() {
    return {
      // Provides a value with key &#39;someOtherKey&#39;.
      someOtherKey: &#39;providedValue&#39;,
      // Provide avec clé symbole
      symKey: &#39;valSym&#39;,
      // Provide avec clé computed
      computedKey: true,
    };
  },
  methods: {
    onInput(event: Event) {
      this.$emit(&#39;update:modelValue&#39;, (event.target as HTMLInputElement).value);
    },
  },
  /**
   * Expose properties and methods like defineExpose in &lt;script setup&gt;
   */
  expose: [
    /**
     * An exposed string property
     */
    &#39;exposed&#39;,
    /**
     * Another exposed string property
     */
    &#39;other&#39;,
    /**
     * An exposed function that logs a message and returns &#39;foo&#39;
     */
    &#39;myFunc&#39;,
  ],
};
&lt;/script&gt;

&lt;template&gt;
  &lt;label v-if=&#34;label&#34;&gt;{{ label }}&lt;/label&gt;
  &lt;div&gt;
    &lt;slot name=&#34;prefix&#34;&gt;&lt;/slot&gt;
    &lt;slot name=&#34;useful&#34; :foo=&#34;bar&#34; /&gt;
    &lt;slot /&gt;
  &lt;/div&gt;
  &lt;MyComponent /&gt;
  &lt;input :placeholder=&#34;placeholder&#34; :value=&#34;modelValue&#34; @input=&#34;onInput&#34; type=&#34;text&#34; /&gt;
&lt;/template&gt;

&lt;style scoped&gt;
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
&lt;/style&gt;
</code></pre>
</details>



<details>
  <summary>Voir le code source Pug</summary>
  <pre><code>&lt;script lang=&#34;ts&#34;&gt;
/**
 * Un champ de saisie simple avec label et placeholder
 * @author Jane Doe &lt;jane.doe@example.com&gt;
 * @type registry:ui
 */

const symKey = Symbol(&#39;symKey&#39;);

export default {
  name: &#39;SimpleInput&#39;,
  /**
   * Propriétés du composant
   */
  props: {
    /**
     * Le label affiché au-dessus du champ
     */
    label: {
      type: String,
      required: false,
      default: &#39;&#39;,
    },
    /**
     * Le placeholder du champ
     */
    placeholder: {
      type: String,
      required: false,
      default: &#39;&#39;,
    },
    /**
     * Valeur du champ
     */
    modelValue: {
      type: String,
      required: false,
      default: &#39;&#39;,
    },
  },
  emits: [
    /**
     * Émis à chaque modification de la valeur
     */
    &#39;update:modelValue&#39;,
  ],
  inject: {
    // Injects a value with key &#39;someKey&#39;.
    injected: &#39;someKey&#39;,
    // Inject avec clé symbole
    injectedSym: symKey,
    // Inject avec spread
    injectedSpread: &#39;spread&#39;,
  },
  provide() {
    return {
      // Provides a value with key &#39;someOtherKey&#39;.
      someOtherKey: &#39;providedValue&#39;,
      // Provide avec clé symbole
      symKey: &#39;valSym&#39;,
      // Provide avec clé computed
      computedKey: true,
    };
  },
  methods: {
    onInput(event: Event) {
      this.$emit(&#39;update:modelValue&#39;, (event.target as HTMLInputElement).value);
    },
  },
  /**
   * Expose properties and methods like defineExpose in &lt;script setup&gt;
   */
  expose: [
    /**
     * An exposed string property
     */
    &#39;exposed&#39;,
    /**
     * Another exposed string property
     */
    &#39;other&#39;,
    /**
     * An exposed function that logs a message and returns &#39;foo&#39;
     */
    &#39;myFunc&#39;,
  ],
};
&lt;/script&gt;

&lt;template lang=&#34;pug&#34;&gt;
label(v-if=&#34;label&#34;)
  | {{ label }}
div
  slot(name=&#34;prefix&#34;)
  slot(name=&#34;useful&#34; :foo=&#34;bar&#34;)
  slot
MyComponent
input(:placeholder=&#34;placeholder&#34; :value=&#34;modelValue&#34; @input=&#34;onInput&#34; type=&#34;text&#34;)
&lt;/template&gt;

&lt;style scoped&gt;
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
&lt;/style&gt;
</code></pre>
</details>

---


## SimpleInputSetup

Un champ de saisie simple avec label et placeholder (API Composition)

**API**: composition


**Author**: Jane Doe &lt;jane.doe@example.com&gt;



  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `label`{.primary .text-primary} | `String` | `''` | Le label affiché au-dessus du champ |
| `placeholder`{.primary .text-primary} | `String` | `''` | Le placeholder du champ |
| `modelValue`{.primary .text-primary} | `String` | `''` | Valeur du champ |




  ### Events
| Name | Description |
|------|-------------|
| `update:modelValue`{.primary .text-primary} | Émis à chaque modification de la valeur |





  ### Slots
| Name | Description |
|------|-------------|
| `prefix`{.primary .text-primary} | — |
| `useful`{.primary .text-primary} | — |
| `default`{.primary .text-primary} | — |





  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `someOtherKey`{.primary .text-primary} | `'providedValue'` | `string` | Fourniture || `symKey`{.primary .text-primary} | `'valSym'` | `string` | — || `computedKey`{.primary .text-primary} | `true` | `boolean` | — |



  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `someKey`{.primary .text-primary} | — | — | Injection || `symKey`{.primary .text-primary} | — | — | — || `spread`{.primary .text-primary} | — | — | — |



  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `exposed`{.primary .text-primary} | `Ref&lt;any&gt;` | — |
| `other`{.primary .text-primary} | `Ref&lt;any&gt;` | — |
| `myFunc`{.primary .text-primary} | `() =&gt; string` | — |





  ### CSS Variables
| Name | Value | Description |
|------|-------|-------------|
| `--input-border-color`{.primary .text-primary} | `#ccc` | — |
| `--input-border-radius`{.primary .text-primary} | `4px` | — |
| `--input-padding`{.primary .text-primary} | `0.5em 1em` | — |
| `--input-font-size`{.primary .text-primary} | `1em` | — |







  ### Child Components
<ul>

  <li>MyComponent</li>

</ul>




<details>
  <summary>Voir le code source HTML</summary>
  <pre><code>&lt;script setup lang=&#34;ts&#34;&gt;
/**
 * Un champ de saisie simple avec label et placeholder (API Composition)
 * @author Jane Doe &lt;jane.doe@example.com&gt;
 * @type registry:ui
 */
import { ref, inject, provide, defineExpose } from &#39;vue&#39;;

const props = defineProps({
  /**
   * Le label affiché au-dessus du champ
   */
  label: {
    type: String,
    required: false,
    default: &#39;&#39;,
  },
  /**
   * Le placeholder du champ
   */
  placeholder: {
    type: String,
    required: false,
    default: &#39;&#39;,
  },
  /**
   * Valeur du champ
   */
  modelValue: {
    type: String,
    required: false,
    default: &#39;&#39;,
  },
});

const emit = defineEmits&lt;{
  /**
   * Émis à chaque modification de la valeur
   */
  (e: &#39;update:modelValue&#39;, value: string): void;
}&gt;();

const symKey = Symbol(&#39;symKey&#39;);

// Injection
const injected = inject(&#39;someKey&#39;);
const injectedSym = inject(symKey);
const injectedSpread = inject(&#39;spread&#39;);

// Fourniture
provide(&#39;someOtherKey&#39;, &#39;providedValue&#39;);
provide(symKey, &#39;valSym&#39;);
provide(&#39;computedKey&#39;, true);

// Variable bar pour le slot
const bar = ref(&#39;bar&#39;);

// Méthodes
function onInput(event: Event) {
  emit(&#39;update:modelValue&#39;, (event.target as HTMLInputElement).value);
}

// Exposition
const exposed = ref(&#39;exposed&#39;);
const other = ref(&#39;other&#39;);
function myFunc() {
  console.log(&#39;myFunc called&#39;);
  return &#39;foo&#39;;
}
defineExpose({ exposed, other, myFunc });
&lt;/script&gt;

&lt;template&gt;
  &lt;label v-if=&#34;props.label&#34;&gt;{{ props.label }}&lt;/label&gt;
  &lt;div&gt;
    &lt;slot name=&#34;prefix&#34;&gt;&lt;/slot&gt;
    &lt;slot name=&#34;useful&#34; :foo=&#34;bar&#34; /&gt;
    &lt;slot /&gt;
  &lt;/div&gt;
  &lt;!-- &lt;MyComponent /&gt; --&gt;
  &lt;input :placeholder=&#34;props.placeholder&#34; :value=&#34;props.modelValue&#34; @input=&#34;onInput&#34; type=&#34;text&#34; /&gt;
&lt;/template&gt;

&lt;style scoped&gt;
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
&lt;/style&gt;
</code></pre>
</details>



<details>
  <summary>Voir le code source Pug</summary>
  <pre><code>&lt;script setup lang=&#34;ts&#34;&gt;
/**
 * Un champ de saisie simple avec label et placeholder (API Composition)
 * @author Jane Doe &lt;jane.doe@example.com&gt;
 * @type registry:ui
 */
import { ref, inject, provide, defineExpose } from &#39;vue&#39;;

const props = defineProps({
  /**
   * Le label affiché au-dessus du champ
   */
  label: {
    type: String,
    required: false,
    default: &#39;&#39;,
  },
  /**
   * Le placeholder du champ
   */
  placeholder: {
    type: String,
    required: false,
    default: &#39;&#39;,
  },
  /**
   * Valeur du champ
   */
  modelValue: {
    type: String,
    required: false,
    default: &#39;&#39;,
  },
});

const emit = defineEmits&lt;{
  /**
   * Émis à chaque modification de la valeur
   */
  (e: &#39;update:modelValue&#39;, value: string): void;
}&gt;();

const symKey = Symbol(&#39;symKey&#39;);

// Injection
const injected = inject(&#39;someKey&#39;);
const injectedSym = inject(symKey);
const injectedSpread = inject(&#39;spread&#39;);

// Fourniture
provide(&#39;someOtherKey&#39;, &#39;providedValue&#39;);
provide(symKey, &#39;valSym&#39;);
provide(&#39;computedKey&#39;, true);

// Variable bar pour le slot
const bar = ref(&#39;bar&#39;);

// Méthodes
function onInput(event: Event) {
  emit(&#39;update:modelValue&#39;, (event.target as HTMLInputElement).value);
}

// Exposition
const exposed = ref(&#39;exposed&#39;);
const other = ref(&#39;other&#39;);
function myFunc() {
  console.log(&#39;myFunc called&#39;);
  return &#39;foo&#39;;
}
defineExpose({ exposed, other, myFunc });
&lt;/script&gt;

&lt;template lang=&#34;pug&#34;&gt;
label(v-if=&#34;props.label&#34;)
  | {{ props.label }}
div
  slot(name=&#34;prefix&#34;)
  slot(name=&#34;useful&#34; :foo=&#34;bar&#34;)
  slot
&lt;!-- &lt;MyComponent /&gt; --&gt;
input(:placeholder=&#34;props.placeholder&#34; :value=&#34;props.modelValue&#34; @input=&#34;onInput&#34; type=&#34;text&#34;)
&lt;/template&gt;

&lt;style scoped&gt;
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
&lt;/style&gt;
</code></pre>
</details>

---



## Advanced Usage

<!-- Add more code-preview/code-group/code-tree blocks as needed for advanced examples -->

::tip
You can copy and adapt this template for any component documentation.
::