/**
 * A 1:1 aspect ratio button component for grid-based layouts.
 *
 * @category controls
 * @demo ControlButtonDemo
 */

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as ControlButton } from './ControlButton.vue';
export { default as ControlButtonLabel } from './ControlButtonLabel.vue';

export const buttonVariants = cva(
  "aspect-square w-auto h-auto min-w-0 min-h-0 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'shadow-xs hover:brightness-90',
        outline:
          'border border-current/20 bg-transparent shadow-xs hover:bg-current/10 dark:border-current/30 dark:hover:bg-current/20',
        ghost: 'bg-transparent hover:bg-current/10',
        solid: 'shadow-xs hover:brightness-90',
      },
      shape: {
        square: 'rounded-md',
        circle: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      shape: 'square',
    },
  }
);

export type ControlButtonVariants = VariantProps<typeof buttonVariants>;
export { type ControlButtonProps } from './ControlButton.vue';
export { type ControlButtonLabelProps } from './ControlButtonLabel.vue';
