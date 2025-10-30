/**
 * A simple knob component that displays a button with "Hello World" text
 * @category buttons
 * @author John Doe <john.doe@example.com>
 */

export interface ButtonFooProps {
  /**
   * The label to display on the button
   * @default "Hello World"
   */
  label?: string;
}

// @ajs-description A simple knob component that displays a button with "Hello World" text.
// @ajs-category buttons
export { default as ButtonFoo } from './ButtonFoo.vue';
export { default as ButtonFooBar } from './ButtonFooBar.vue';
export { default as ButtonFooNoSetup } from './ButtonFooNoSetup.vue';
