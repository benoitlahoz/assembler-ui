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
const combineRegExp = (regexpList: (RegExp[] | string)[], flags: string) => {
  let i,
    source = "";
  for (i = 0; i < regexpList.length; i++) {
    if (typeof regexpList[i] === "string") {
      source += regexpList[i];
    } else {
      source += (regexpList[i] as any).source;
    }
  }
  return new RegExp(source, flags);
};

const buildGradientRegExp = () => {
  const searchFlags = "gi";
  const rAngle = /(?:[+-]?\d*\.?\d+)(?:deg|grad|rad|turn)/;

  const rSideCornerCapture =
    /to\s+((?:left|right|top|bottom)(?:\s+(?:left|right|top|bottom))?)/;
  const rComma = /\s*,\s*/;
  const rColorHex = /\#(?:[a-f0-9]{6}|[a-f0-9]{3})/;
  const rDigits3 = /\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\)/;
  const rDigits4 = /\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*,\s*\d*\.?\d+\)/;
  const rValue = /(?:[+-]?\d*\.?\d+)(?:%|[a-z]+)?/;
  const rKeyword = /[_a-z-][_a-z0-9-]*/;
  const rColor = combineRegExp(
    [
      "(?:",
      rColorHex.source,
      "|",
      "(?:rgb|hsl)",
      rDigits3.source,
      "|",
      "(?:rgba|hsla)",
      rDigits4.source,
      "|",
      rKeyword.source,
      ")",
    ],
    "",
  );
  const rColorStop = combineRegExp(
    [rColor.source, "(?:\\s+", rValue.source, "(?:\\s+", rValue.source, ")?)?"],
    "",
  );
  const rColorStopList = combineRegExp(
    ["(?:", rColorStop.source, rComma.source, ")*", rColorStop.source],
    "",
  );
  const rLineCapture = combineRegExp(
    ["(?:(", rAngle.source, ")|", rSideCornerCapture.source, ")"],
    "",
  );
  const rGradientSearch = combineRegExp(
    [
      "(?:(",
      rLineCapture.source,
      ")",
      rComma.source,
      ")?(",
      rColorStopList.source,
      ")",
    ],
    searchFlags,
  );
  const rColorStopSearch = combineRegExp(
    [
      "\\s*(",
      rColor.source,
      ")",
      "(?:\\s+",
      "(",
      rValue.source,
      "))?",
      "(?:",
      rComma.source,
      "\\s*)?",
    ],
    searchFlags,
  );

  return {
    gradientSearch: rGradientSearch,
    colorStopSearch: rColorStopSearch,
  };
};

const RegExpLib = buildGradientRegExp();

export const useTailwindClassParser = () => {
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

  type GradientColorStop = {
    color: string;
    pos: number;
  };

  type GradientParseResult =
    | {
        stops: GradientColorStop[];
        direction: string;
      }
    | undefined;

  const parseGradient = function (input: string): GradientParseResult {
    let result: GradientParseResult,
      matchGradient: RegExpExecArray | null,
      matchColorStop: RegExpExecArray | null,
      stopResult: GradientColorStop;

    RegExpLib.gradientSearch.lastIndex = 0;

    matchGradient = RegExpLib.gradientSearch.exec(input);
    if (matchGradient !== null) {
      result = {
        stops: [],
        direction: "to bottom",
      };

      if (!!matchGradient[1]) {
        result.direction = matchGradient[1] || "to bottom";
      }

      if (!!matchGradient[2]) {
        result.direction = matchGradient[2];
      }

      if (!!matchGradient[3]) {
        result.direction = matchGradient[3] || "to bottom";
      }

      RegExpLib.colorStopSearch.lastIndex = 0;

      if (typeof matchGradient[4] === "string") {
        matchColorStop = RegExpLib.colorStopSearch.exec(matchGradient[4]);
        while (matchColorStop !== null) {
          stopResult = {
            color: matchColorStop[1] || "rgba(0,0,0,0)",
            pos: 0,
          };

          if (!!matchColorStop[2]) {
            let pos = matchColorStop[2];
            if (pos && pos.endsWith("%")) {
              stopResult.pos = parseFloat(pos) / 100;
            } else {
              stopResult.pos = Number(pos);
            }
          }
          result.stops.push(stopResult);

          matchColorStop = RegExpLib.colorStopSearch.exec(matchGradient[4]);
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
      .replace(/^gradient\(|\)$/gi, "")
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

    const stops = [];
    let buffer = "";
    let parenLevel = 0;
    for (let i = 0; i < stopsPart.length; i++) {
      const char = stopsPart[i];
      if (char === "(") parenLevel++;
      if (char === ")") parenLevel--;
      if (char === "," && parenLevel === 0) {
        if (buffer.trim()) stops.push(buffer.trim());
        buffer = "";
      } else {
        buffer += char;
      }
    }
    if (buffer.trim()) stops.push(buffer.trim());

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

        result.stops.push({ color: stopMatch[1].trim(), pos: value });
      }
    }

    return result;
  };

  return {
    getTailwindBaseCssValues,
    parseLinearGradient,
    parseGradient,
  };
};
```
:::

## API
::hr-underline
::

  ### Returns

Can be undefined if match not found.

| Property | Type | Description |
|----------|------|-------------|
| `getTailwindBaseCssValues`{.primary .text-primary} | `any` | — |
| `parseLinearGradient`{.primary .text-primary} | `any` | — |
| `parseGradient`{.primary .text-primary} | `any` | — |

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `GradientColorStop`{.primary .text-primary} | `type` | — |
| `GradientParseResult`{.primary .text-primary} | `type` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
