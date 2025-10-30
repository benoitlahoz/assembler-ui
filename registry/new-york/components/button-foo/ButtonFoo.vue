<script setup lang="ts">
/**
 * A simple knob component that displays a button with "Hello World" text
 * @author John Doe <john.doe@example.com>
 */
// @ajs-author John Doe <john.doe@example.com>
import { ref } from 'vue';
import { Button } from '@/components/ui/button';

const exposed = ref('');
const other: ref<string> = ref('other exposed');

const props = withDefaults(
  defineProps<{
    // @ajs-prop An optional string property named foo.
    /**
     * An optional string property named foo
     */
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
});
</script>

<template>
  <Button>
    <!-- Text of the button -->
    <slot>Hello World</slot>
    <!-- Icon slot for the button -->
    <slot name="icon" />
  </Button>
</template>
