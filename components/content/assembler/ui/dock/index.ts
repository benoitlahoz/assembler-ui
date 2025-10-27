import { cva } from "class-variance-authority";

import { type Component } from "vue";

export const badgeVariants = cva("", {
  variants: {
    variant: {
      default: "bg-destructive text-foreground font-bold rounded-full shadow text-xs",
      primary: "bg-primary text-foreground font-bold rounded-full shadow text-xs",
      destructive: "bg-destructive text-foreground font-bold rounded-full shadow text-xs",
      secondary: "bg-secondary text-foreground font-bold rounded-full shadow text-xs",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const separatorVariants = cva("", {
  variants: {
    variant: {
      default: "bg-foreground mx-2",
      primary: "bg-primary mx-2",
      destructive: "bg-destructive mx-2",
      secondary: "bg-secondary mx-2",
      muted: "bg-muted mx-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type DockBadgeType = "circle" | "number";

export interface DockBadgeConfig {
  type: DockBadgeType;
  value?: number;
  variant?: "primary" | "destructive" | "secondary";
}

export interface DockStandardItem {
  icon: Component;
  label: string;
  name: string;
  action: () => void;
  badge?: DockBadgeConfig;
}

export interface DockSeparatorItem extends Partial<DockStandardItem> {
  separator: true;
}

export type DockItemDescription = DockStandardItem | DockSeparatorItem;

export type DockItemsList = DockItemDescription[];

export { default as Dock } from "./Dock.vue";
export { default as DockItem } from "./DockItem.vue";
export { default as DockSeparator } from "./DockSeparator.vue";
