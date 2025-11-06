---
title: useTailwindClassParser
description: Utility to parse tailwind classes and get their CSS values.
---

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-tailwind-class-parser.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-tailwind-class-parser.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-tailwind-class-parser.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-tailwind-class-parser.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-tailwind-class-parser/useTailwindClassParser.ts"}

```ts [src/composables/use-tailwind-class-parser/useTailwindClassParser.ts]
export const useTailwindClassParser = () => {
  const parseTailwindClasses = (classes: string): string[] => {
    return classes
      .split(" ")
      .map((cls) => cls.trim())
      .filter((cls) => cls.length > 0);
  };

  const getTailwindBaseCssValues = (
    el: HTMLElement,
    properties?: string[],
  ): Record<string, string> => {
    const computed = window.getComputedStyle(el);
    const result: Record<string, string> = {};
    if (properties && properties.length > 0) {
      for (const prop of properties) {
        result[prop] = computed.getPropertyValue(prop);
      }
    } else {
      for (let i = 0; i < computed.length; i++) {
        const prop = computed.item(i);
        if (typeof prop === "string") {
          result[prop] = computed.getPropertyValue(prop);
        }
      }
    }

    return result;
  };

  const parseLinearGradient = (gradientStr: string) => {
    const result = {
      direction: "",
      orientation: "unknown",
      stops: [] as Array<{ color: string; pos: number }>,
    };

    const gradientContent = gradientStr
      .replace(/^linear-gradient\(|\)$/gi, "")
      .replace(/^in\s+(\w+)\s*,\s*(.*)$/gi, "");

    let direction = "";
    let stopsPart = "";

    const firstComma = gradientContent.indexOf(",");
    if (firstComma !== -1) {
      const firstPart = gradientContent.slice(0, firstComma).trim();
      if (
        /^(to\s+(right|left|top|bottom)(\s+(right|left|top|bottom))?|[0-9.]+deg)$/.test(
          firstPart,
        )
      ) {
        direction = firstPart;
        stopsPart = gradientContent.slice(firstComma + 1);
      } else {
        direction = "to bottom";
        stopsPart = gradientContent;
      }
    } else {
      direction = gradientContent.trim();
    }
    result.direction = direction;

    if (/to\s+right\b/.test(direction) && /to\s+bottom\b/.test(direction)) {
      result.orientation = "diagonal";
    } else if (/to\s+right\b/.test(direction)) {
      result.orientation = "horizontal";
    } else if (/to\s+left\b/.test(direction)) {
      result.orientation = "horizontal";
    } else if (/to\s+bottom\b/.test(direction)) {
      result.orientation = "vertical";
    } else if (/to\s+top\b/.test(direction)) {
      result.orientation = "vertical";
    } else if (/deg$/.test(direction)) {
      result.orientation = "angle";
    }

    const stops = stopsPart
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stop of stops) {
      const stopMatch = stop.match(
        /((?:#(?:[0-9a-fA-F]{3,8})|oklch\([^)]*\)|rgba?\([^)]*\)|hsla?\([^)]*\)|[a-zA-Z]+))\s*(\d+%|0|1)?$/,
      );
      if (stopMatch && stopMatch[1]) {
        let value = 0;
        const pos = stopMatch[2] ?? "";
        if (pos.endsWith("%")) {
          value = parseFloat(pos) / 100;
        } else if (pos === "1") {
          value = 1;
        } else if (pos === "0") {
          value = 0;
        }
        console.warn("Parsed stop:", {
          color: stopMatch[1].trim(),
          pos: value,
        });
        result.stops.push({ color: stopMatch[1].trim(), pos: value });
      }
    }
    return result;
  };

  return {
    parseTailwindClasses,
    getTailwindBaseCssValues,
    parseLinearGradient,
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
| `parseTailwindClasses`{.primary .text-primary} | `any` | — |
| `getTailwindBaseCssValues`{.primary .text-primary} | `any` | — |
| `parseLinearGradient`{.primary .text-primary} | `any` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
