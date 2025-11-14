---
title: useDownload
description: A composable to simplify file building and downloading.
---

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-download.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-download.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-download.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-download.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-download/useDownload.ts"}

```ts [src/composables/use-download/useDownload.ts]
export const useDownload = () => {
  const downloadJson = (filename: string, content: object) => {
    const jsonString = JSON.stringify(content, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.visibility = "hidden";
    a.style.position = "absolute";
    a.style.zIndex = "-9999";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadText = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.visibility = "hidden";
    a.style.position = "absolute";
    a.style.zIndex = "-9999";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    downloadJson,
    downloadText,
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
| `downloadJson`{.primary .text-primary} | `any` | — |
| `downloadText`{.primary .text-primary} | `any` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
