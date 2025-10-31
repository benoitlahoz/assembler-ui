<script setup lang="ts">
/**
 * Un champ de saisie simple avec label et placeholder (API Composition)
 * @author Jane Doe <jane.doe@example.com>
 * @type registry:ui
 */
import { ref, inject, provide, defineExpose } from 'vue';

const props = defineProps({
  /**
   * Le label affiché au-dessus du champ
   */
  label: {
    type: String,
    required: false,
    default: '',
  },
  /**
   * Le placeholder du champ
   */
  placeholder: {
    type: String,
    required: false,
    default: '',
  },
  /**
   * Valeur du champ
   */
  modelValue: {
    type: String,
    required: false,
    default: '',
  },
});

const emit = defineEmits<{
  /**
   * Émis à chaque modification de la valeur
   */
  (e: 'update:modelValue', value: string): void;
}>();

const symKey = Symbol('symKey');

// Injection
const injected = inject('someKey');
const injectedSym = inject(symKey);
const injectedSpread = inject('spread');

// Fourniture
provide('someOtherKey', 'providedValue');
provide(symKey, 'valSym');
provide('computedKey', true);

// Variable bar pour le slot
const bar = ref('bar');

// Méthodes
function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
}

// Exposition
const exposed = ref('exposed');
const other = ref('other');
function myFunc() {
  console.log('myFunc called');
  return 'foo';
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
  <!-- <MyComponent /> -->
  <input :placeholder="props.placeholder" :value="props.modelValue" @input="onInput" type="text" />
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
