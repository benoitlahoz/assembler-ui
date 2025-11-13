/**
 * Composable pour gérer les conversions de couleurs
 *
 * @type registry:hook
 * @category styling
 */
export const useColors = () => {
  /**
   * Convertit une couleur oklch en RGB
   * @param l - Luminosité (0-1)
   * @param c - Chroma (0-0.4 typiquement)
   * @param h - Hue en degrés (0-360)
   * @returns Objet RGB avec valeurs 0-1
   */
  const oklchToRgb = (l: number, c: number, h: number): { r: number; g: number; b: number } => {
    // Convertir hue en radians
    const hRad = (h * Math.PI) / 180;

    // OKLCH -> OKLAB
    const a = c * Math.cos(hRad);
    const b = c * Math.sin(hRad);

    // OKLAB -> Linear RGB (approximation)
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    // Linear RGB
    let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    // Gamma correction (sRGB)
    const gammaCorrect = (val: number): number => {
      if (val <= 0.0031308) {
        return 12.92 * val;
      }
      return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
    };

    r = gammaCorrect(r);
    g = gammaCorrect(g);
    bl = gammaCorrect(bl);

    // Clamp to [0, 1]
    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    bl = Math.max(0, Math.min(1, bl));

    return { r, g, b: bl };
  };

  /**
   * Convertit une couleur oklab en RGB
   * @param l - Luminosité (0-1)
   * @param a - Axe vert-rouge (-0.4 à 0.4 typiquement)
   * @param b - Axe bleu-jaune (-0.4 à 0.4 typiquement)
   * @returns Objet RGB avec valeurs 0-1
   */
  const oklabToRgb = (l: number, a: number, b: number): { r: number; g: number; b: number } => {
    // OKLAB -> Linear RGB
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    // Linear RGB
    let r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    let g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    // Gamma correction (sRGB)
    const gammaCorrect = (val: number): number => {
      if (val <= 0.0031308) {
        return 12.92 * val;
      }
      return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
    };

    r = gammaCorrect(r);
    g = gammaCorrect(g);
    bl = gammaCorrect(bl);

    // Clamp to [0, 1]
    r = Math.max(0, Math.min(1, r));
    g = Math.max(0, Math.min(1, g));
    bl = Math.max(0, Math.min(1, bl));

    return { r, g, b: bl };
  };

  /**
   * Parse une chaîne de couleur oklch() ou oklab()
   * Formats supportés:
   * - oklch(0.5 0.1 180)
   * - oklch(50% 0.1 180deg)
   * - oklab(0.5 0.1 -0.2)
   */
  const parseOklchOrOklab = (colorString: string): { r: number; g: number; b: number } | null => {
    const defaultColor = { r: 0.2, g: 0.53, b: 1.0 }; // #3388ff

    // Parser oklch
    const oklchMatch = colorString.match(
      /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+%?))?\s*\)/i
    );
    if (oklchMatch) {
      let l = parseFloat(oklchMatch[1]!);
      const c = parseFloat(oklchMatch[2]!);
      const h = parseFloat(oklchMatch[3]!);

      // Convertir le pourcentage en valeur 0-1 si nécessaire
      if (oklchMatch[1]!.includes('%') || l > 1) {
        l = l / 100;
      }

      return oklchToRgb(l, c, h);
    }

    // Parser oklab
    const oklabMatch = colorString.match(
      /oklab\(\s*([\d.]+)%?\s+([-\d.]+)\s+([-\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)/i
    );
    if (oklabMatch) {
      let l = parseFloat(oklabMatch[1]!);
      const a = parseFloat(oklabMatch[2]!);
      const b = parseFloat(oklabMatch[3]!);

      // Convertir le pourcentage en valeur 0-1 si nécessaire
      if (oklabMatch[1]!.includes('%') || l > 1) {
        l = l / 100;
      }

      return oklabToRgb(l, a, b);
    }

    return null;
  };

  /**
   * Convertit n'importe quelle couleur CSS en RGB
   * Supporte: hex, rgb, rgba, oklch, oklab
   */
  const parseColor = (color: string): { r: number; g: number; b: number } => {
    const defaultColor = { r: 0.2, g: 0.53, b: 1.0 }; // #3388ff

    if (!color) return defaultColor;

    // Tenter oklch/oklab d'abord
    if (color.startsWith('oklch') || color.startsWith('oklab')) {
      const result = parseOklchOrOklab(color);
      if (result) return result;
      return defaultColor;
    }

    // Hex colors
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
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

    // RGB/RGBA colors
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
