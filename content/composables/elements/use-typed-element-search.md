---
title: useTypedElementSearch
description: 
---

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-typed-element-search.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-typed-element-search.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-typed-element-search.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-typed-element-search.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-typed-element-search/useTypedElementSearch.ts"}

```ts [src/composables/use-typed-element-search/useTypedElementSearch.ts]
export const useTypedElementSearch = () => {
  const searchTypedElementInTree = <T extends Element>(
    root: Element,
    predicate: (el: Element) => el is T,
  ): T | null => {
    if (predicate(root)) return root;
    for (const child of Array.from(root.children)) {
      const found = searchTypedElementInTree(child, predicate);
      if (found) return found;
    }
    return null;
  };

  const getTypedElementAmongSiblings = <T extends Element>(
    refEl: Element,
    predicate: (el: Element) => el is T,
  ): T | null => {
    if (!refEl || !refEl.parentElement) return null;
    const siblings = Array.from(refEl.parentElement.children).filter(
      (el) => el !== refEl,
    );
    for (const sibling of siblings) {
      const found = searchTypedElementInTree(sibling, predicate);
      if (found) return found;
    }
    return null;
  };

  const getContainerOfType = <T extends Element>(
    refEl: Element,
    predicate: (el: Element) => el is T,
  ): T | null => {
    let current: Element | null = refEl.parentElement;
    while (current) {
      if (predicate(current)) return current;
      current = current.parentElement;
    }
    return null;
  };

  const getContainer = (refEl: Element): HTMLElement | null => {
    let current: Element | null = refEl.parentElement;
    while (current) {
      if (current instanceof HTMLElement) return current;
      current = current.parentElement;
    }
    return null;
  };

  return {
    searchTypedElementInTree,
    getTypedElementAmongSiblings,
    getContainerOfType,
    getContainer,
  };
};
```
:::

## API
::hr-underline
::

  ### Returns

| Property | Type | Description |
|----------|------|-------------|
| `searchTypedElementInTree`{.primary .text-primary} | `any` | — |
| `getTypedElementAmongSiblings`{.primary .text-primary} | `any` | — |
| `getContainerOfType`{.primary .text-primary} | `any` | — |
| `getContainer`{.primary .text-primary} | `any` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
