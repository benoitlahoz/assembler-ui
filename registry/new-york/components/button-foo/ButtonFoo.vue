<script setup lang="ts">
import { onMounted, onUpdated, onUnmounted, onBeforeMount } from 'vue';

onMounted(() => {
  console.log('Mounted!');
});
onUpdated(() => {
  console.log('Updated!');
});
onUnmounted(() => {
  console.log('Unmounted!');
});
onBeforeMount(() => {
  console.log('Before mount!');
});
// Imports variés pour test
import type { Ref } from 'vue';
import * as All from '@/lib/utils';
import { something, another as alias } from '@/lib/utils';
import DefaultExport from '@/lib/utils';

// Exports variés pour test
export const exportedConst = 123;
export let exportedLet = 'abc';
export var exportedVar = true;
export function exportedFn() {
  return 'fn';
}
export type ExportedType = { foo: string };
export interface ExportedInterface {
  bar: number;
}
export default function () {
  return 'default';
}
// Cas avancés pour provide/inject
const symKey = Symbol('symKey');
const objKey = { foo: 'bar' };
const computedKey = `prefix_${foo}`;
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
// Inject avec clé objet
const injectedObj = inject(objKey, 0);
// Inject avec clé computed
const injectedComputed = inject(computedKey, false);
// Inject avec spread
const injectedSpread = inject('spread', { ...spreadObj });
/**
 * A simple knob component that displays a button with "Hello World" text
 * @author John Doe <john.doe@example.com>
 */
// @ajs-author John Doe <john.doe@example.com>
import { ref, inject, provide } from 'vue';
import { Button } from '@/components/ui/button';

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
const other: ref<string> = ref('other exposed');
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
  <Button
    class="btn-main"
    :class="['dynamic-class', { 'btn-secondary': true }]"
    @custom-event="onCustomEvent"
    v-foo
  >
    <!-- Text of the button -->
    <slot>Hello World</slot>
    <!-- Icon slot for the button -->
    <slot name="icon" />
    <!-- Right icon slot for the button -->
    <slot name="icon-right" />
    <MyChild :foo="foo">
      <template #header>Header slot</template>
      <template v-slot:footer>Footer slot</template>
      <template #dynamicSlot>Dynamic slot</template>
    </MyChild>
    <OtherChild bar="42">
      <slot :name="'named-dynamic'">Named dynamic slot</slot>
      <slot name="static-named">Static named slot</slot>
    </OtherChild>
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
