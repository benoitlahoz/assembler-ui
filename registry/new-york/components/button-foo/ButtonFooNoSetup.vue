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

// --- PROVIDES ---
/**
 * Provides a value with key 'someOtherKey'.
 */
provide('someOtherKey', 'providedValue');
// Provide avec clé symbole
provide(symKey, 'valSym');
// Provide avec clé objet
provide(objKey, 123);
// Provide avec clé computed
provide(computedKey, true);
// Provide avec spread
provide('spread', { ...spreadObj });

// --- INJECTS ---
/**
 * Injects a value with key 'someKey'.
 */
const injected = inject('someKey', 'defaultValue');
// Inject avec clé symbole
const injectedSym = inject(symKey, 'defaultSym');
// Inject avec spread
const injectedSpread = inject('spread', { ...spreadObj });

export default {
  name: 'ButtonFooNoSetup',
  /**
   * Définit les props du composant.
   */
  props: {
    // @ajs-prop An optional string property named foo.
    /**
     * An optional string property named foo
     */
    foo: {
      type: String,
      required: false,
    },
    // @ajs-prop A required number property named bar.
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
    /**
     * An exposed string property
     */
    exposed() {
      return exposed.value;
    },
    /**
     * Another exposed string property
     */
    other() {
      return other.value;
    },
  },
};
</script>

<template>
  <Button class="btn-main" :class="['dynamic-class', { 'btn-secondary': true }]">
    <!-- Text of the button -->
    <slot :foo="foo">Hello World</slot>
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
