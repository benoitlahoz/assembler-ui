---
title: useCssParser
description: Utility to parse tailwind classes and get their CSS values.
---

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-css-parser.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-css-parser.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-css-parser.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-css-parser.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-css-parser/useCssParser.ts"}

```ts [src/composables/use-css-parser/useCssParser.ts]
export interface GradientColorStop {
  color: string;
  pos: number;
}

export interface GradientParseResult {
  stops: GradientColorStop[];
  direction: string;
}

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
  const rColorOklch = /oklch\(\s*(?:[+-]?\d*\.?\d+\s*){3}\)/;
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
      rColorOklch.source,
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

export const useCssParser = () => {
  const fetchStylesFromElementClass = (
    fn: (el: HTMLElement) => any,
    className: string,
  ) => {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.width = "0px";
    el.style.height = "0px";
    el.style.visibility = "hidden";
    el.className = className;
    el.style.overflow = "hidden";
    document.body.appendChild(el);
    const result = fn(el);
    document.body.removeChild(el);
    return result;
  };

  const parseHTMLToElement = (fn: (el: HTMLElement) => any, html: string) => {
    const el = document.createElement("div");
    el.style.visibility = "hidden";
    el.style.zIndex = "-1000";
    el.style.position = "absolute";
    el.style.top = "0";
    el.style.left = "0";
    el.innerHTML = html;
    document.body.appendChild(el);
    const result = fn(el);
    document.body.removeChild(el);
    return result;
  };

  const getTailwindBaseCssValues = (
    el: HTMLElement,
    properties?: string[],
  ): Record<string, string> => {
    if (typeof window === "undefined") {
      return {};
    }

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

  const getLeafletShapeColors = (
    classNames?: string | string[] | Record<string, boolean>,
  ) => {
    if (typeof window === "undefined") {
      return {
        color: "#3388ff",
        fillColor: "#3388ff",
        fillOpacity: 0.2,
        weight: 2,
      };
    }

    try {
      let classList: string[] = [];
      if (typeof classNames === "string") {
        classList = classNames.split(" ");
      } else if (Array.isArray(classNames)) {
        classList = classNames;
      } else if (classNames && typeof classNames === "object") {
        classList = Object.keys(classNames).filter((key) => classNames[key]);
      }

      const cssValues = fetchStylesFromElementClass(
        (el) =>
          getTailwindBaseCssValues(el, [
            "border-color",
            "color",
            "background-color",
            "opacity",
            "border-width",
          ]),
        classList.join(" "),
      );

      return {
        color: cssValues["border-color"] || cssValues["color"] || "#3388ff",
        fillColor: cssValues["background-color"] || "#3388ff",
        fillOpacity: cssValues["opacity"]
          ? parseFloat(cssValues["opacity"])
          : 0.2,
        weight: cssValues["border-width"]
          ? parseFloat(cssValues["border-width"])
          : 2,
      };
    } catch (err) {
      console.error("Error in getLeafletShapeColors:", err);
      return {
        color: "#3388ff",
        fillColor: "#3388ff",
        fillOpacity: 0.2,
        weight: 2,
      };
    }
  };

  const getLeafletLineColors = (
    classNames?: string | string[] | Record<string, boolean>,
  ) => {
    if (typeof window === "undefined") {
      return {
        color: "#3388ff",
        opacity: 1,
      };
    }

    try {
      let classList: string[] = [];
      if (typeof classNames === "string") {
        classList = classNames.split(" ");
      } else if (Array.isArray(classNames)) {
        classList = classNames;
      } else if (classNames && typeof classNames === "object") {
        classList = Object.keys(classNames).filter((key) => classNames[key]);
      }

      const cssValues = fetchStylesFromElementClass(
        (el) =>
          getTailwindBaseCssValues(el, ["border-color", "color", "opacity"]),
        classList.join(" "),
      );

      return {
        color: cssValues["border-color"] || cssValues["color"] || "#3388ff",
        opacity: cssValues["opacity"] ? parseFloat(cssValues["opacity"]) : 1,
      };
    } catch (err) {
      console.error("Error in getLeafletLineColors:", err);
      return {
        color: "#3388ff",
        opacity: 1,
      };
    }
  };

  const parseGradient = function (
    input: string,
  ): GradientParseResult | undefined {
    const rGradientEnclosedInBrackets =
      /.*gradient\s*\(((?:\([^\)]*\)|[^\)\(]*)*)\)/;
    const matchGradientType = rGradientEnclosedInBrackets.exec(input);

    let strToParse = input;
    if (matchGradientType && matchGradientType[1]) {
      strToParse = matchGradientType[1];
    }

    let result: GradientParseResult | undefined;
    let matchGradient: RegExpExecArray | null;
    let matchColorStop: RegExpExecArray | null;
    let stopResult: GradientColorStop;

    RegExpLib.gradientSearch.lastIndex = 0;

    matchGradient = RegExpLib.gradientSearch.exec(strToParse);
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

  return {
    fetchStylesFromElementClass,
    parseHTMLToElement,
    getTailwindBaseCssValues,
    getLeafletShapeColors,
    getLeafletLineColors,
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
| `fetchStylesFromElementClass`{.primary .text-primary} | `any` | — |
| `parseHTMLToElement`{.primary .text-primary} | `any` | — |
| `getTailwindBaseCssValues`{.primary .text-primary} | `any` | — |
| `getLeafletShapeColors`{.primary .text-primary} | `any` | — |
| `getLeafletLineColors`{.primary .text-primary} | `any` | — |
| `parseGradient`{.primary .text-primary} | `any` | — |

  ### Types
| Name | Type | Description |
|------|------|-------------|
| `GradientColorStop`{.primary .text-primary} | `interface` | — |
| `GradientParseResult`{.primary .text-primary} | `interface` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
