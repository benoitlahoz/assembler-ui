---
title: ButtonFoo
description: A simple knob component that displays a button with &#34;Hello World&#34; text
---

::tabs
  :::tabs-item{icon="i-lucide-eye" label="Preview"}
    <button-foo />
  :::

  :::tabs-item{icon="i-lucide-code" label="Code"}
  ```vue
  <ButtonFoo />
  ```
  :::
::



## Install with CLI
:::code-group{.w-full}
  
  ```bash [yarn]
  yarn dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/button-foo.json"
  ```
  
  ```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/button-foo.json"
  ```

  ```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/button-foo.json"
  ```
  
  ```bash [bun]
  bunx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/button-foo.json"
  ```
:::



## Install Manually

Copy and paste the following code
::code-tree


```vue [ButtonFoo.vue]
<script setup lang="ts">
/**
 * @author John Doe <john.doe@example.com>
 */
import { ref, inject, provide } from 'vue';
import type { Ref } from 'vue';
import { Button } from '@/components/ui/button';

export type ExportedType = { foo: string };
export interface ExportedInterface {
  bar: number;
}

// Clés pour provide/inject
const symKey = Symbol('symKey');
const objKey = { key: 'objKey' };
const computedKey = { toString: () => 'computedKey' };
const spreadObj = { a: 1, b: 2 };

// Provide avec clé symbole
provide(symKey, 'valSym');
// Provide avec clé objet
provide(objKey, 123);
// Provide avec clé computed
provide(computedKey, true);
// Provide avec spread
provide('spread', { ...spreadObj });

// Inject avec clé symbole
const injectedSym = inject(symKey, 'defaultSym');
// Inject avec spread
const injectedSpread = inject('spread', { ...spreadObj });
/**
 * A simple knob component that displays a button with "Hello World" text
 * @author John Doe <john.doe@example.com>
 */
// @ajs-author John Doe <john.doe@example.com>

/**
 * Possible return types for myFunc.
 */
type FuncReturn = 'foo' | 'bar' | 'baz';

/**
 * An example interface with a sample property
 */
interface MyInterface {
  /**
   * A sample string property
   */
  sampleProp: string;
  /**
   * Another sample number property
   */
  sampleNumber: number;
  foo(): void;
}

const exposed = ref('');
const other: Ref<string> = ref('other exposed');
const myFunc = (): FuncReturn => {
  console.log('This is my function');
  return 'foo';
};

/**
 * Définit les slots disponibles pour ce composant.
 */

const slots = defineSlots({
  /**
   * Slot principal par défaut
   */
  default: (props: { label: string }) => {},
  // Slot pour l'icône à gauche
  icon: () => {},
});

/**
 * Injects a value with key 'someKey'.
 */
const injected = inject('someKey', 'defaultValue');

/**
 * Provides a value with key 'someOtherKey'.
 */
provide('someOtherKey', 'providedValue');

const props = withDefaults(
  defineProps<{
    // @ajs-prop An optional string property named foo.
    // An optional string property named foo
    foo?: string;
    // @ajs-prop A required number property named bar.
    /**
     * A required number property named bar
     */
    bar: number;
  }>(),
  {
    bar: 42,
  }
);

const emit = defineEmits<{
  /**
   * Emitted when the button is clicked
   */
  (e: 'click'): void;
}>();

defineExpose({
  /**
   * An exposed string property
   */
  exposed,
  /**
   * Another exposed string property
   */
  other,
  /**
   * An exposed function that logs a message and returns 'foo'
   */
  myFunc,
});
</script>

<template>
  <Button class="btn-main" :class="['dynamic-class', { 'btn-secondary': true }]">
    <!-- Text of the button -->
    <slot>Hello World</slot>
    <!-- Icon slot for the button -->
    <slot name="icon" />
    <!-- Right icon slot for the button -->
    <slot name="icon-right" />
    <slot :name="'named-dynamic'">Named dynamic slot</slot>
    <slot name="static-named">Static named slot</slot>
    <MyChild :foo="foo">
      <template #header>Header slot</template>
      <template v-slot:footer>Footer slot</template>
      <template #dynamicSlot>Dynamic slot</template>
    </MyChild>
    <OtherChild bar="42"> </OtherChild>
  </Button>
</template>

<style scoped>
.btn-main {
  color: red;
}

.btn-secondary {
  color: blue;
}

.dynamic-class {
  font-weight: bold;
}

/* Couleur principale du bouton */
:root {
  --btn-main-color: #ff0000;
  /* Rayon de bordure du bouton */
  --btn-radius: 4px;
  /* Padding horizontal du bouton */
  --btn-padding-x: 1.5em;
}
</style>

```

```vue [ButtonFooBar.vue]
<script setup lang="ts">
import { Button } from '@/components/ui/button';

const props = withDefaults(
  defineProps<{
    // @ajs-prop An optional string property named foo.
    foo?: string;
    // @ajs-prop A required number property named ack.
    ack: number;
  }>(),
  {
    ack: 1242,
  }
);
</script>

<template>
  <Button>Hello World</Button>
</template>

```

```vue [ButtonFooNoSetup.vue]
<script lang="ts">
/**
 * A simple knob component that displays a button with "Hello World" text
 * @author John Doe <john.doe@example.com>
 */
import { ref, inject, provide } from 'vue';
import { Button } from '@/components/ui/button';

// Types d'export
/**
 * Possible return types for myFunc.
 */
export type ExportedType = { foo: string };
/**
 * An example interface with a sample property
 */
export interface ExportedInterface {
  /**
   * A sample string property
   */
  bar: number;
}

// Clés pour provide/inject
const symKey = Symbol('symKey');
const objKey = { key: 'objKey' };
const computedKey = { toString: () => 'computedKey' };
const spreadObj = { a: 1, b: 2 };

const exposed = ref('');
const other = ref('other exposed');

export default {
  name: 'ButtonFooNoSetup',
  /**
   * Définit les props du composant.
   */
  props: {
    /**
     * An optional string property named foo
     */
    foo: {
      type: String,
      required: false,
    },
    /**
     * A required number property named bar
     */
    bar: {
      type: Number,
      required: true,
      default: 42,
    },
  },
  /**
   * Définit les événements émis par le composant.
   */
  emits: [
    /**
     * Emitted when the button is clicked
     */
    'click',
  ],
  /**
   * Méthodes du composant.
   */
  methods: {
    /**
     * An exposed function that logs a message and returns 'foo'
     */
    myFunc() {
      console.log('This is my function');
      return 'foo';
    },
    emitClick() {
      this.$emit('click');
    },
  },
  /**
   * Propriétés calculées exposées.
   */
  computed: {
    // ...autres computed...
    foo() {
      return this.$props.foo;
    },
  },
  inject: {
    // Injects a value with key 'someKey'.
    injected: 'someKey',
    // Inject avec clé symbole
    injectedSym: symKey,
    // Inject avec spread
    injectedSpread: 'spread',
  },
  /**
   * Fournit des valeurs via l'option provide de l'API Options.
   */
  /**
   * Fournit des valeurs via l'option provide de l'API Options.
   *
   * - someOtherKey : Provides a value with key 'someOtherKey'.
   * - symKey : Provide avec clé symbole
   * - computedKey : Provide avec clé computed
   * - spread : Provide avec spread
   */
  /**
   * Fournit des valeurs via l'option provide de l'API Options.
   *
   * - someOtherKey : Provides a value with key 'someOtherKey'.
   * - symKey : Provide avec clé symbole
   * - computedKey : Provide avec clé computed
   * - spread : Provide avec spread
   */
  provide() {
    return {
      // Provides a value with key 'someOtherKey'.
      someOtherKey: 'providedValue',
      // Provide avec clé symbole
      symKey: 'valSym',
      // Provide avec clé computed
      computedKey: true,
      // Provide avec spread
      spread: { ...spreadObj },
    };
  },
  /**
   * Expose properties and methods like defineExpose in <script setup>
   */
  expose: [
    /**
     * An exposed string property
     */
    'exposed',
    /**
     * Another exposed string property
     */
    'other',
    /**
     * An exposed function that logs a message and returns 'foo'
     */
    'myFunc',
  ],
};
</script>

<template>
  <Button class="btn-main" :class="['dynamic-class', { 'btn-secondary': true }]">
    <!-- Text of the button -->
    <slot :foo="this.foo ?? ''">Hello World</slot>
    <!-- Icon slot for the button -->
    <slot name="icon" />
    <!-- Right icon slot for the button -->
    <slot name="icon-right" />
    <slot :name="'named-dynamic'">Named dynamic slot</slot>
    <slot name="static-named">Static named slot</slot>
    <MyChild :foo="this.foo ?? ''">
      <template #header>Header slot</template>
      <template v-slot:footer>Footer slot</template>
      <template #dynamicSlot>Dynamic slot</template>
    </MyChild>
    <OtherChild bar="42"> </OtherChild>
  </Button>
</template>

<style scoped>
.btn-main {
  color: red;
}
.btn-secondary {
  color: blue;
}
.dynamic-class {
  font-weight: bold;
}

/* Couleur principale du bouton */
:root {
  --btn-main-color: #ff0000;
  /* Rayon de bordure du bouton */
  --btn-radius: 4px;
  /* Padding horizontal du bouton */
  --btn-padding-x: 1.5em;
}
</style>

```


::




## ButtonFoo



**API**: composition


**Author**: John Doe &lt;john.doe@example.com&gt;




  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `foo`{.primary .text-primary} | `string` | `-` | An optional string property named foo |
| `bar`{.primary .text-primary} | `number` | `42` | A required number property named bar |
| `foo`{.primary .text-primary} | `string` | `-` | An optional string property named foo |
| `bar`{.primary .text-primary} | `number` | `42` | A required number property named bar |




  ### Events
| Name | Description |
|------|-------------|
| `click`{.primary .text-primary} | Emitted when the button is clicked |





  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | Slot principal par défaut |
| `icon`{.primary .text-primary} | Slot pour l&#39;icône à gauche |
| `static-named`{.primary .text-primary} | — |





  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `symKey`{.primary .text-primary} | `'valSym'` | `string` | Provide avec clé symbole || `objKey`{.primary .text-primary} | `123` | `number` | Provide avec clé objet || `computedKey`{.primary .text-primary} | `true` | `boolean` | Provide avec clé computed || `spread`{.primary .text-primary} | `{ ...spreadObj }` | `any` | Provide avec spread || `someOtherKey`{.primary .text-primary} | `'providedValue'` | `string` | Provides a value with key &#39;someOtherKey&#39;. |



  ### Inject
| Key | Default | Type | Description |
|-----|--------|------|-------------|
| `symKey`{.primary .text-primary} | `'defaultSym'` | `string` | Inject avec clé symbole || `spread`{.primary .text-primary} | `{ ...spreadObj }` | `any` | Inject avec spread || `someKey`{.primary .text-primary} | `'defaultValue'` | `string` | Injects a value with key &#39;someKey&#39;. |



  ### Expose
| Name | Type | Description |
|------|------|-------------|
| `exposed`{.primary .text-primary} | `Ref&lt;any&gt;` | An exposed string property |
| `other`{.primary .text-primary} | `Ref&lt;string&gt;` | Another exposed string property |
| `myFunc`{.primary .text-primary} | `() =&gt; FuncReturn` | An exposed function that logs a message and returns &#39;foo&#39; |





  ### CSS Variables
| Name | Value | Description |
|------|-------|-------------|
| `--btn-radius`{.primary .text-primary} | `4px` | Rayon de bordure du bouton |
| `--btn-main-color`{.primary .text-primary} | `#ff0000` | — |
| `--btn-padding-x`{.primary .text-primary} | `1.5em` | — |





  ### Types
| Name | Type | Description |
|------|------|-------------|
| `ExportedType`{.primary .text-primary} | `{ foo: string }` | - |
| `ExportedInterface`{.primary .text-primary} | `interface` | - |
| `FuncReturn`{.primary .text-primary} | `&#39;foo&#39; | &#39;bar&#39; | &#39;baz&#39;` | Possible return types for myFunc. |
| `MyInterface`{.primary .text-primary} | `interface` | An example interface with a sample property |





  ### Child Components
<ul>

  <li>MyChild</li>

  <li>OtherChild</li>

</ul>




<details>
  <summary>Voir le code source HTML</summary>
  <pre><code>&lt;script setup lang=&#34;ts&#34;&gt;
/**
 * @author John Doe &lt;john.doe@example.com&gt;
 */
import { ref, inject, provide } from &#39;vue&#39;;
import type { Ref } from &#39;vue&#39;;
import { Button } from &#39;@/components/ui/button&#39;;

export type ExportedType = { foo: string };
export interface ExportedInterface {
  bar: number;
}

// Clés pour provide/inject
const symKey = Symbol(&#39;symKey&#39;);
const objKey = { key: &#39;objKey&#39; };
const computedKey = { toString: () =&gt; &#39;computedKey&#39; };
const spreadObj = { a: 1, b: 2 };

// Provide avec clé symbole
provide(symKey, &#39;valSym&#39;);
// Provide avec clé objet
provide(objKey, 123);
// Provide avec clé computed
provide(computedKey, true);
// Provide avec spread
provide(&#39;spread&#39;, { ...spreadObj });

// Inject avec clé symbole
const injectedSym = inject(symKey, &#39;defaultSym&#39;);
// Inject avec spread
const injectedSpread = inject(&#39;spread&#39;, { ...spreadObj });
/**
 * A simple knob component that displays a button with &#34;Hello World&#34; text
 * @author John Doe &lt;john.doe@example.com&gt;
 */
// @ajs-author John Doe &lt;john.doe@example.com&gt;

/**
 * Possible return types for myFunc.
 */
type FuncReturn = &#39;foo&#39; | &#39;bar&#39; | &#39;baz&#39;;

/**
 * An example interface with a sample property
 */
interface MyInterface {
  /**
   * A sample string property
   */
  sampleProp: string;
  /**
   * Another sample number property
   */
  sampleNumber: number;
  foo(): void;
}

const exposed = ref(&#39;&#39;);
const other: Ref&lt;string&gt; = ref(&#39;other exposed&#39;);
const myFunc = (): FuncReturn =&gt; {
  console.log(&#39;This is my function&#39;);
  return &#39;foo&#39;;
};

/**
 * Définit les slots disponibles pour ce composant.
 */

const slots = defineSlots({
  /**
   * Slot principal par défaut
   */
  default: (props: { label: string }) =&gt; {},
  // Slot pour l&#39;icône à gauche
  icon: () =&gt; {},
});

/**
 * Injects a value with key &#39;someKey&#39;.
 */
const injected = inject(&#39;someKey&#39;, &#39;defaultValue&#39;);

/**
 * Provides a value with key &#39;someOtherKey&#39;.
 */
provide(&#39;someOtherKey&#39;, &#39;providedValue&#39;);

const props = withDefaults(
  defineProps&lt;{
    // @ajs-prop An optional string property named foo.
    // An optional string property named foo
    foo?: string;
    // @ajs-prop A required number property named bar.
    /**
     * A required number property named bar
     */
    bar: number;
  }&gt;(),
  {
    bar: 42,
  }
);

const emit = defineEmits&lt;{
  /**
   * Emitted when the button is clicked
   */
  (e: &#39;click&#39;): void;
}&gt;();

defineExpose({
  /**
   * An exposed string property
   */
  exposed,
  /**
   * Another exposed string property
   */
  other,
  /**
   * An exposed function that logs a message and returns &#39;foo&#39;
   */
  myFunc,
});
&lt;/script&gt;

&lt;template&gt;
  &lt;Button class=&#34;btn-main&#34; :class=&#34;[&#39;dynamic-class&#39;, { &#39;btn-secondary&#39;: true }]&#34;&gt;
    &lt;!-- Text of the button --&gt;
    &lt;slot&gt;Hello World&lt;/slot&gt;
    &lt;!-- Icon slot for the button --&gt;
    &lt;slot name=&#34;icon&#34; /&gt;
    &lt;!-- Right icon slot for the button --&gt;
    &lt;slot name=&#34;icon-right&#34; /&gt;
    &lt;slot :name=&#34;&#39;named-dynamic&#39;&#34;&gt;Named dynamic slot&lt;/slot&gt;
    &lt;slot name=&#34;static-named&#34;&gt;Static named slot&lt;/slot&gt;
    &lt;MyChild :foo=&#34;foo&#34;&gt;
      &lt;template #header&gt;Header slot&lt;/template&gt;
      &lt;template v-slot:footer&gt;Footer slot&lt;/template&gt;
      &lt;template #dynamicSlot&gt;Dynamic slot&lt;/template&gt;
    &lt;/MyChild&gt;
    &lt;OtherChild bar=&#34;42&#34;&gt; &lt;/OtherChild&gt;
  &lt;/Button&gt;
&lt;/template&gt;

&lt;style scoped&gt;
.btn-main {
  color: red;
}

.btn-secondary {
  color: blue;
}

.dynamic-class {
  font-weight: bold;
}

/* Couleur principale du bouton */
:root {
  --btn-main-color: #ff0000;
  /* Rayon de bordure du bouton */
  --btn-radius: 4px;
  /* Padding horizontal du bouton */
  --btn-padding-x: 1.5em;
}
&lt;/style&gt;
</code></pre>
</details>



<details>
  <summary>Voir le code source Pug</summary>
  <pre><code>&lt;script setup lang=&#34;ts&#34;&gt;
/**
 * @author John Doe &lt;john.doe@example.com&gt;
 */
import { ref, inject, provide } from &#39;vue&#39;;
import type { Ref } from &#39;vue&#39;;
import { Button } from &#39;@/components/ui/button&#39;;

export type ExportedType = { foo: string };
export interface ExportedInterface {
  bar: number;
}

// Clés pour provide/inject
const symKey = Symbol(&#39;symKey&#39;);
const objKey = { key: &#39;objKey&#39; };
const computedKey = { toString: () =&gt; &#39;computedKey&#39; };
const spreadObj = { a: 1, b: 2 };

// Provide avec clé symbole
provide(symKey, &#39;valSym&#39;);
// Provide avec clé objet
provide(objKey, 123);
// Provide avec clé computed
provide(computedKey, true);
// Provide avec spread
provide(&#39;spread&#39;, { ...spreadObj });

// Inject avec clé symbole
const injectedSym = inject(symKey, &#39;defaultSym&#39;);
// Inject avec spread
const injectedSpread = inject(&#39;spread&#39;, { ...spreadObj });
/**
 * A simple knob component that displays a button with &#34;Hello World&#34; text
 * @author John Doe &lt;john.doe@example.com&gt;
 */
// @ajs-author John Doe &lt;john.doe@example.com&gt;

/**
 * Possible return types for myFunc.
 */
type FuncReturn = &#39;foo&#39; | &#39;bar&#39; | &#39;baz&#39;;

/**
 * An example interface with a sample property
 */
interface MyInterface {
  /**
   * A sample string property
   */
  sampleProp: string;
  /**
   * Another sample number property
   */
  sampleNumber: number;
  foo(): void;
}

const exposed = ref(&#39;&#39;);
const other: Ref&lt;string&gt; = ref(&#39;other exposed&#39;);
const myFunc = (): FuncReturn =&gt; {
  console.log(&#39;This is my function&#39;);
  return &#39;foo&#39;;
};

/**
 * Définit les slots disponibles pour ce composant.
 */

const slots = defineSlots({
  /**
   * Slot principal par défaut
   */
  default: (props: { label: string }) =&gt; {},
  // Slot pour l&#39;icône à gauche
  icon: () =&gt; {},
});

/**
 * Injects a value with key &#39;someKey&#39;.
 */
const injected = inject(&#39;someKey&#39;, &#39;defaultValue&#39;);

/**
 * Provides a value with key &#39;someOtherKey&#39;.
 */
provide(&#39;someOtherKey&#39;, &#39;providedValue&#39;);

const props = withDefaults(
  defineProps&lt;{
    // @ajs-prop An optional string property named foo.
    // An optional string property named foo
    foo?: string;
    // @ajs-prop A required number property named bar.
    /**
     * A required number property named bar
     */
    bar: number;
  }&gt;(),
  {
    bar: 42,
  }
);

const emit = defineEmits&lt;{
  /**
   * Emitted when the button is clicked
   */
  (e: &#39;click&#39;): void;
}&gt;();

defineExpose({
  /**
   * An exposed string property
   */
  exposed,
  /**
   * Another exposed string property
   */
  other,
  /**
   * An exposed function that logs a message and returns &#39;foo&#39;
   */
  myFunc,
});
&lt;/script&gt;

&lt;template lang=&#34;pug&#34;&gt;
&lt;!-- Text of the button --&gt;
&lt;!-- Icon slot for the button --&gt;
&lt;!-- Right icon slot for the button --&gt;
Button(class=&#34;btn-main&#34; :class=&#34;[&#39;dynamic-class&#39;, { &#39;btn-secondary&#39;: true }]&#34;)
  slot
    | Hello World
  slot(name=&#34;icon&#34;)
  slot(name=&#34;icon-right&#34;)
  slot(:name=&#34;&#39;named-dynamic&#39;&#34;)
    | Named dynamic slot
  slot(name=&#34;static-named&#34;)
    | Static named slot
  MyChild(:foo=&#34;foo&#34;)
    template(#header)
      | Header slot
    template(v-slot:footer)
      | Footer slot
    template(#dynamicSlot)
      | Dynamic slot
  OtherChild(bar=&#34;42&#34;)
&lt;/template&gt;
      &lt;template v-slot:footer&gt;Footer slot&lt;/template&gt;
      &lt;template #dynamicSlot&gt;Dynamic slot&lt;/template&gt;
    &lt;/MyChild&gt;
    &lt;OtherChild bar=&#34;42&#34;&gt; &lt;/OtherChild&gt;
  &lt;/Button&gt;
&lt;/template&gt;

&lt;style scoped&gt;
.btn-main {
  color: red;
}

.btn-secondary {
  color: blue;
}

.dynamic-class {
  font-weight: bold;
}

/* Couleur principale du bouton */
:root {
  --btn-main-color: #ff0000;
  /* Rayon de bordure du bouton */
  --btn-radius: 4px;
  /* Padding horizontal du bouton */
  --btn-padding-x: 1.5em;
}
&lt;/style&gt;
</code></pre>
</details>




## ButtonFooBar



**API**: composition





  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `foo`{.primary .text-primary} | `string` | `-` | @ajs-prop An optional string property named foo. |
| `ack`{.primary .text-primary} | `number` | `1242` | @ajs-prop A required number property named ack. |
| `foo`{.primary .text-primary} | `string` | `-` | @ajs-prop An optional string property named foo. |
| `ack`{.primary .text-primary} | `number` | `1242` | @ajs-prop A required number property named ack. |




















<details>
  <summary>Voir le code source HTML</summary>
  <pre><code>&lt;script setup lang=&#34;ts&#34;&gt;
import { Button } from &#39;@/components/ui/button&#39;;

const props = withDefaults(
  defineProps&lt;{
    // @ajs-prop An optional string property named foo.
    foo?: string;
    // @ajs-prop A required number property named ack.
    ack: number;
  }&gt;(),
  {
    ack: 1242,
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
import { Button } from &#39;@/components/ui/button&#39;;

const props = withDefaults(
  defineProps&lt;{
    // @ajs-prop An optional string property named foo.
    foo?: string;
    // @ajs-prop A required number property named ack.
    ack: number;
  }&gt;(),
  {
    ack: 1242,
  }
);
&lt;/script&gt;

&lt;template lang=&#34;pug&#34;&gt;
Button
  | Hello World
&lt;/template&gt;
</code></pre>
</details>




## ButtonFooNoSetup

A simple knob component that displays a button with &#34;Hello World&#34; text

**API**: options


**Author**: John Doe &lt;john.doe@example.com&gt;




  ### Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `foo`{.primary .text-primary} | `String` | `-` | An optional string property named foo |
| `bar`{.primary .text-primary} | `Number` | `42` | A required number property named bar |




  ### Events
| Name | Description |
|------|-------------|
| `click`{.primary .text-primary} | Définit les événements émis par le composant. |





  ### Slots
| Name | Description |
|------|-------------|
| `default`{.primary .text-primary} | — |
| `icon`{.primary .text-primary} | — |
| `static-named`{.primary .text-primary} | — |





  ### Provide
| Key | Value | Type | Description |
|-----|-------|------|-------------|
| `someOtherKey`{.primary .text-primary} | `'providedValue'` | `string` | Provides a value with key &#39;someOtherKey&#39;. || `symKey`{.primary .text-primary} | `'valSym'` | `string` | Provide avec clé symbole || `computedKey`{.primary .text-primary} | `true` | `boolean` | Provide avec clé computed || `spread`{.primary .text-primary} | `{ ...spreadObj }` | `any` | Provide avec spread |



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
| `--btn-radius`{.primary .text-primary} | `4px` | Rayon de bordure du bouton |
| `--btn-main-color`{.primary .text-primary} | `#ff0000` | — |
| `--btn-padding-x`{.primary .text-primary} | `1.5em` | — |





  ### Types
| Name | Type | Description |
|------|------|-------------|
| `ExportedType`{.primary .text-primary} | `{ foo: string }` | Possible return types for myFunc. |
| `ExportedInterface`{.primary .text-primary} | `interface` | An example interface with a sample property |





  ### Child Components
<ul>

  <li>MyChild</li>

  <li>OtherChild</li>

</ul>




<details>
  <summary>Voir le code source HTML</summary>
  <pre><code>&lt;script lang=&#34;ts&#34;&gt;
/**
 * A simple knob component that displays a button with &#34;Hello World&#34; text
 * @author John Doe &lt;john.doe@example.com&gt;
 */
import { ref, inject, provide } from &#39;vue&#39;;
import { Button } from &#39;@/components/ui/button&#39;;

// Types d&#39;export
/**
 * Possible return types for myFunc.
 */
export type ExportedType = { foo: string };
/**
 * An example interface with a sample property
 */
export interface ExportedInterface {
  /**
   * A sample string property
   */
  bar: number;
}

// Clés pour provide/inject
const symKey = Symbol(&#39;symKey&#39;);
const objKey = { key: &#39;objKey&#39; };
const computedKey = { toString: () =&gt; &#39;computedKey&#39; };
const spreadObj = { a: 1, b: 2 };

const exposed = ref(&#39;&#39;);
const other = ref(&#39;other exposed&#39;);

export default {
  name: &#39;ButtonFooNoSetup&#39;,
  /**
   * Définit les props du composant.
   */
  props: {
    /**
     * An optional string property named foo
     */
    foo: {
      type: String,
      required: false,
    },
    /**
     * A required number property named bar
     */
    bar: {
      type: Number,
      required: true,
      default: 42,
    },
  },
  /**
   * Définit les événements émis par le composant.
   */
  emits: [
    /**
     * Emitted when the button is clicked
     */
    &#39;click&#39;,
  ],
  /**
   * Méthodes du composant.
   */
  methods: {
    /**
     * An exposed function that logs a message and returns &#39;foo&#39;
     */
    myFunc() {
      console.log(&#39;This is my function&#39;);
      return &#39;foo&#39;;
    },
    emitClick() {
      this.$emit(&#39;click&#39;);
    },
  },
  /**
   * Propriétés calculées exposées.
   */
  computed: {
    // ...autres computed...
    foo() {
      return this.$props.foo;
    },
  },
  inject: {
    // Injects a value with key &#39;someKey&#39;.
    injected: &#39;someKey&#39;,
    // Inject avec clé symbole
    injectedSym: symKey,
    // Inject avec spread
    injectedSpread: &#39;spread&#39;,
  },
  /**
   * Fournit des valeurs via l&#39;option provide de l&#39;API Options.
   */
  /**
   * Fournit des valeurs via l&#39;option provide de l&#39;API Options.
   *
   * - someOtherKey : Provides a value with key &#39;someOtherKey&#39;.
   * - symKey : Provide avec clé symbole
   * - computedKey : Provide avec clé computed
   * - spread : Provide avec spread
   */
  /**
   * Fournit des valeurs via l&#39;option provide de l&#39;API Options.
   *
   * - someOtherKey : Provides a value with key &#39;someOtherKey&#39;.
   * - symKey : Provide avec clé symbole
   * - computedKey : Provide avec clé computed
   * - spread : Provide avec spread
   */
  provide() {
    return {
      // Provides a value with key &#39;someOtherKey&#39;.
      someOtherKey: &#39;providedValue&#39;,
      // Provide avec clé symbole
      symKey: &#39;valSym&#39;,
      // Provide avec clé computed
      computedKey: true,
      // Provide avec spread
      spread: { ...spreadObj },
    };
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
  &lt;Button class=&#34;btn-main&#34; :class=&#34;[&#39;dynamic-class&#39;, { &#39;btn-secondary&#39;: true }]&#34;&gt;
    &lt;!-- Text of the button --&gt;
    &lt;slot :foo=&#34;this.foo ?? &#39;&#39;&#34;&gt;Hello World&lt;/slot&gt;
    &lt;!-- Icon slot for the button --&gt;
    &lt;slot name=&#34;icon&#34; /&gt;
    &lt;!-- Right icon slot for the button --&gt;
    &lt;slot name=&#34;icon-right&#34; /&gt;
    &lt;slot :name=&#34;&#39;named-dynamic&#39;&#34;&gt;Named dynamic slot&lt;/slot&gt;
    &lt;slot name=&#34;static-named&#34;&gt;Static named slot&lt;/slot&gt;
    &lt;MyChild :foo=&#34;this.foo ?? &#39;&#39;&#34;&gt;
      &lt;template #header&gt;Header slot&lt;/template&gt;
      &lt;template v-slot:footer&gt;Footer slot&lt;/template&gt;
      &lt;template #dynamicSlot&gt;Dynamic slot&lt;/template&gt;
    &lt;/MyChild&gt;
    &lt;OtherChild bar=&#34;42&#34;&gt; &lt;/OtherChild&gt;
  &lt;/Button&gt;
&lt;/template&gt;

&lt;style scoped&gt;
.btn-main {
  color: red;
}
.btn-secondary {
  color: blue;
}
.dynamic-class {
  font-weight: bold;
}

/* Couleur principale du bouton */
:root {
  --btn-main-color: #ff0000;
  /* Rayon de bordure du bouton */
  --btn-radius: 4px;
  /* Padding horizontal du bouton */
  --btn-padding-x: 1.5em;
}
&lt;/style&gt;
</code></pre>
</details>



<details>
  <summary>Voir le code source Pug</summary>
  <pre><code>&lt;script lang=&#34;ts&#34;&gt;
/**
 * A simple knob component that displays a button with &#34;Hello World&#34; text
 * @author John Doe &lt;john.doe@example.com&gt;
 */
import { ref, inject, provide } from &#39;vue&#39;;
import { Button } from &#39;@/components/ui/button&#39;;

// Types d&#39;export
/**
 * Possible return types for myFunc.
 */
export type ExportedType = { foo: string };
/**
 * An example interface with a sample property
 */
export interface ExportedInterface {
  /**
   * A sample string property
   */
  bar: number;
}

// Clés pour provide/inject
const symKey = Symbol(&#39;symKey&#39;);
const objKey = { key: &#39;objKey&#39; };
const computedKey = { toString: () =&gt; &#39;computedKey&#39; };
const spreadObj = { a: 1, b: 2 };

const exposed = ref(&#39;&#39;);
const other = ref(&#39;other exposed&#39;);

export default {
  name: &#39;ButtonFooNoSetup&#39;,
  /**
   * Définit les props du composant.
   */
  props: {
    /**
     * An optional string property named foo
     */
    foo: {
      type: String,
      required: false,
    },
    /**
     * A required number property named bar
     */
    bar: {
      type: Number,
      required: true,
      default: 42,
    },
  },
  /**
   * Définit les événements émis par le composant.
   */
  emits: [
    /**
     * Emitted when the button is clicked
     */
    &#39;click&#39;,
  ],
  /**
   * Méthodes du composant.
   */
  methods: {
    /**
     * An exposed function that logs a message and returns &#39;foo&#39;
     */
    myFunc() {
      console.log(&#39;This is my function&#39;);
      return &#39;foo&#39;;
    },
    emitClick() {
      this.$emit(&#39;click&#39;);
    },
  },
  /**
   * Propriétés calculées exposées.
   */
  computed: {
    // ...autres computed...
    foo() {
      return this.$props.foo;
    },
  },
  inject: {
    // Injects a value with key &#39;someKey&#39;.
    injected: &#39;someKey&#39;,
    // Inject avec clé symbole
    injectedSym: symKey,
    // Inject avec spread
    injectedSpread: &#39;spread&#39;,
  },
  /**
   * Fournit des valeurs via l&#39;option provide de l&#39;API Options.
   */
  /**
   * Fournit des valeurs via l&#39;option provide de l&#39;API Options.
   *
   * - someOtherKey : Provides a value with key &#39;someOtherKey&#39;.
   * - symKey : Provide avec clé symbole
   * - computedKey : Provide avec clé computed
   * - spread : Provide avec spread
   */
  /**
   * Fournit des valeurs via l&#39;option provide de l&#39;API Options.
   *
   * - someOtherKey : Provides a value with key &#39;someOtherKey&#39;.
   * - symKey : Provide avec clé symbole
   * - computedKey : Provide avec clé computed
   * - spread : Provide avec spread
   */
  provide() {
    return {
      // Provides a value with key &#39;someOtherKey&#39;.
      someOtherKey: &#39;providedValue&#39;,
      // Provide avec clé symbole
      symKey: &#39;valSym&#39;,
      // Provide avec clé computed
      computedKey: true,
      // Provide avec spread
      spread: { ...spreadObj },
    };
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
&lt;!-- Text of the button --&gt;
&lt;!-- Icon slot for the button --&gt;
&lt;!-- Right icon slot for the button --&gt;
Button(class=&#34;btn-main&#34; :class=&#34;[&#39;dynamic-class&#39;, { &#39;btn-secondary&#39;: true }]&#34;)
  slot(:foo=&#34;this.foo ?? &#39;&#39;&#34;)
    | Hello World
  slot(name=&#34;icon&#34;)
  slot(name=&#34;icon-right&#34;)
  slot(:name=&#34;&#39;named-dynamic&#39;&#34;)
    | Named dynamic slot
  slot(name=&#34;static-named&#34;)
    | Static named slot
  MyChild(:foo=&#34;this.foo ?? &#39;&#39;&#34;)
    template(#header)
      | Header slot
    template(v-slot:footer)
      | Footer slot
    template(#dynamicSlot)
      | Dynamic slot
  OtherChild(bar=&#34;42&#34;)
&lt;/template&gt;
      &lt;template v-slot:footer&gt;Footer slot&lt;/template&gt;
      &lt;template #dynamicSlot&gt;Dynamic slot&lt;/template&gt;
    &lt;/MyChild&gt;
    &lt;OtherChild bar=&#34;42&#34;&gt; &lt;/OtherChild&gt;
  &lt;/Button&gt;
&lt;/template&gt;

&lt;style scoped&gt;
.btn-main {
  color: red;
}
.btn-secondary {
  color: blue;
}
.dynamic-class {
  font-weight: bold;
}

/* Couleur principale du bouton */
:root {
  --btn-main-color: #ff0000;
  /* Rayon de bordure du bouton */
  --btn-radius: 4px;
  /* Padding horizontal du bouton */
  --btn-padding-x: 1.5em;
}
&lt;/style&gt;
</code></pre>
</details>





## Advanced Usage

<!-- Add more code-preview/code-group/code-tree blocks as needed for advanced examples -->

::tip
You can copy and adapt this template for any component documentation.
::