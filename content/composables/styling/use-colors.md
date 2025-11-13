---
title: useColors
description: Composable pour gérer les conversions de couleurs
---

## Install with CLI
::hr-underline
::

This will install the composable in the path defined by your `components.json` file, thanks to shadcn-vue.

:::code-group{.w-full}
```bash [yarn]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-colors.json"
  ```

```bash [npm]
  npx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-colors.json"
  ```

```bash [pnpm]
  pnpm dlx shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-colors.json"
  ```

```bash [bun]
  bunx --bun shadcn-vue@latest add "https://benoitlahoz.github.io/assembler-ui/r/use-colors.json"
  ```
:::

## Install Manually
::hr-underline
::

Copy and paste these files into your project.

:::code-tree{default-value="src/composables/use-colors/useColors.ts"}

```ts [src/composables/use-colors/useColors.ts]
export const useColors = () => {
  const oklchToRgb = (
    l: number,
    c: number,
    h: number,
  ): { r: number; g: number; b: number } => {
    const hRad = (h * Math.PI) / 180;

    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    const gammaCorrect = (val: number): number => {
      if (val <= 0.0031308) {
        return 12.92 * val;
      }
      return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
    };

    r = gammaCorrect(r);
    g = gammaCorrect(g);
    bl = gammaCorrect(bl);

    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    bl = Math.max(0, Math.min(1, bl));

    return { r, g, b: bl };
  };

  const oklabToRgb = (
    l: number,
    a: number,
    b: number,
  ): { r: number; g: number; b: number } => {
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    const gammaCorrect = (val: number): number => {
      if (val <= 0.0031308) {
        return 12.92 * val;
      }
      return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
    };

    r = gammaCorrect(r);
    g = gammaCorrect(g);
    bl = gammaCorrect(bl);

    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    bl = Math.max(0, Math.min(1, bl));

    return { r, g, b: bl };
  };

  const parseOklchOrOklab = (
    colorString: string,
  ): { r: number; g: number; b: number } | null => {
    const defaultColor = { r: 0.2, g: 0.53, b: 1.0 };

    const oklchMatch = colorString.match(
      /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+%?))?\s*\)/i,
    );
    if (oklchMatch) {
      let l = parseFloat(oklchMatch[1]!);
      const c = parseFloat(oklchMatch[2]!);
      const h = parseFloat(oklchMatch[3]!);

      if (oklchMatch[1]!.includes("%") || l > 1) {
        l = l / 100;
      }

      return oklchToRgb(l, c, h);
    }

    const oklabMatch = colorString.match(
      /oklab\(\s*([\d.]+)%?\s+([-\d.]+)\s+([-\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)/i,
    );
    if (oklabMatch) {
      let l = parseFloat(oklabMatch[1]!);
      const a = parseFloat(oklabMatch[2]!);
      const b = parseFloat(oklabMatch[3]!);

      if (oklabMatch[1]!.includes("%") || l > 1) {
        l = l / 100;
      }

      return oklabToRgb(l, a, b);
    }

    return null;
  };

  const parseColor = (color: string): { r: number; g: number; b: number } => {
    const defaultColor = { r: 0.2, g: 0.53, b: 1.0 };

    if (!color) return defaultColor;

    if (color.startsWith("oklch") || color.startsWith("oklab")) {
      const result = parseOklchOrOklab(color);
      if (result) return result;
      return defaultColor;
    }

    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      if (hex.length === 3 && hex[0] && hex[1] && hex[2]) {
        return {
          r: parseInt(hex[0] + hex[0], 16) / 255,
          g: parseInt(hex[1] + hex[1], 16) / 255,
          b: parseInt(hex[2] + hex[2], 16) / 255,
        };
      } else if (hex.length === 6) {
        return {
          r: parseInt(hex.substring(0, 2), 16) / 255,
          g: parseInt(hex.substring(2, 4), 16) / 255,
          b: parseInt(hex.substring(4, 6), 16) / 255,
        };
      }
    }

    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch && rgbMatch[1] && rgbMatch[2] && rgbMatch[3]) {
      return {
        r: parseInt(rgbMatch[1]) / 255,
        g: parseInt(rgbMatch[2]) / 255,
        b: parseInt(rgbMatch[3]) / 255,
      };
    }

    return defaultColor;
  };

  return {
    oklchToRgb,
    oklabToRgb,
    parseOklchOrOklab,
    parseColor,
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
| `oklchToRgb`{.primary .text-primary} | `any` | — |
| `oklabToRgb`{.primary .text-primary} | `any` | — |
| `parseOklchOrOklab`{.primary .text-primary} | `any` | — |
| `parseColor`{.primary .text-primary} | `any` | — |

---

::tip
You can copy and adapt this template for any composable documentation.
::
