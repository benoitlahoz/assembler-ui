---
title: useDragDropContext
description: useDragDropContext - Composable pour accéder au contexte drag-drop fourni par DragDropProvider
---

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop-context.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop-context.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop-context.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-drag-drop-context.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-drag-drop-context/useDragDropContext.ts"}

```ts [src/composables/use-drag-drop-context/useDragDropContext.ts]
import { inject } from "vue";
import type {
  UseDragDropReturn,
  UseDragDropOptions,
} from "../use-drag-drop/useDragDrop";

export const DRAG_DROP_INJECTION_KEY = Symbol("drag-drop-context");

export interface DragDropContext<T = any> extends UseDragDropReturn<T> {
  options: Readonly<UseDragDropOptions & { mode?: "drag" | "resize" | "both" }>;
}

export function useDragDropContext<T = any>(): DragDropContext<T> {
  const context = inject<DragDropContext<T>>(DRAG_DROP_INJECTION_KEY);

  if (!context) {
    throw new Error(
      "useDragDropContext must be used within a DragDropProvider component. " +
        "Make sure to wrap your component with <DragDropProvider>.",
    );
  }

  return context;
}

export function useDragDropContextOptional<T = any>():
  | DragDropContext<T>
  | undefined {
  return inject<DragDropContext<T> | undefined>(
    DRAG_DROP_INJECTION_KEY,
    undefined,
  );
}
```
:::

## API
::hr-underline
::

  ### Returns

Le contexte drag-drop s&#39;il existe, undefined sinon

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `DragDropContext`{.primary .text-primary} | `interface` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
