import { cva, type VariantProps } from "class-variance-authority";

export { default as MacOsDock } from "./MacOsDock.vue";
export { default as MacOsDockItem } from "./MacOsDockItem.vue";
export { default as MacOsDockSeparator } from "./MacOsDockSeparator.vue";

export const dockVariants = cva("flex items-center justify-center rounded-full", {
  variants: {
    color: {
      default: "border border-gray-200",
      dark: "border border-gray-800",
      accent: "border border-primary",
    },
    orientation: {
      vertical: "flex-col",
      horizontal: "flex-row",
    },
  },
  defaultVariants: {
    color: "default",
    orientation: "horizontal",
  },
});

export const dockItemVariants = cva(
  "flex items-center justify-center rounded-full transition-all cursor-pointer",
  {
    variants: {
      size: {
        sm: "w-8 h-8 p-2",
        md: "w-12 h-12 p-3",
        lg: "w-16 h-16 p-4",
      },
      active: {
        true: "ring-2 ring-primary",
        false: "opacity-80 hover:opacity-100",
      },
    },
    defaultVariants: {
      size: "sm",
      active: false,
    },
  },
);

export const dockSeparatorVariants = cva("bg-border shrink-0", {
  variants: {
    variant: {
      default: "bg-foreground",
      primary: "bg-primary",
      secondary: "bg-secondary",
      muted: "bg-muted",
    },
    orientation: {
      vertical: "w-px",
      horizontal: "h-px",
    },
  },
  defaultVariants: {
    variant: "default",
    orientation: "vertical",
  },
});

export type DockVariants = VariantProps<typeof dockVariants>;
export type DockItemVariants = VariantProps<typeof dockItemVariants>;
export type DockSeparatorVariants = VariantProps<typeof dockSeparatorVariants>;

export type DockOrientation = "vertical" | "horizontal";

export { type DockProps } from "./MacOsDock.vue";
export { type DockItemProps } from "./MacOsDockItem.vue";
export { type DockSeparatorProps } from "./MacOsDockSeparator.vue";
