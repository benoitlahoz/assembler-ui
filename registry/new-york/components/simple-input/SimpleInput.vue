<script lang="ts">
/**
 * Un champ de saisie simple avec label et placeholder
 * @author Jane Doe <jane.doe@example.com>
 * @type registry:ui
 */

const symKey = Symbol('symKey');

export default {
  name: 'SimpleInput',
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
  },
  emits: [
    /**
     * Émis à chaque modification de la valeur
     */
    'update:modelValue',
  ],
  inject: {
    // Injects a value with key 'someKey'.
    injected: 'someKey',
    // Inject avec clé symbole
    injectedSym: symKey,
    // Inject avec spread
    injectedSpread: 'spread',
  },
  provide() {
    return {
      // Provides a value with key 'someOtherKey'.
      someOtherKey: 'providedValue',
      // Provide avec clé symbole
      symKey: 'valSym',
      // Provide avec clé computed
      computedKey: true,
    };
  },
  methods: {
    onInput(event: Event) {
      this.$emit('update:modelValue', (event.target as HTMLInputElement).value);
    },
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
  <div class="flex flex-col">
    <label v-if="label">{{ label }}</label>
    <input :placeholder="placeholder" :value="modelValue" @input="onInput" type="text" />
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
