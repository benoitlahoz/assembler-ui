/**
 * Parses tailwind classes.
 *
 * @type registry:hook
 * @category styling
 */

export const useTailwindClassParser = () => {
  /**
   * Parses a string of tailwind classes into an array of individual classes.
   */
  const parseTailwindClasses = (classes: string): string[] => {
    return classes
      .split(' ')
      .map((cls) => cls.trim())
      .filter((cls) => cls.length > 0);
  };

  /**
   * Retourne les valeurs CSS calculées pour un ensemble de classes Tailwind appliquées à un élément donné.
   */
  const getTailwindBaseCssValues = (
    el: HTMLElement,
    properties?: string[]
  ): Record<string, string> => {
    // Récupère les styles calculés
    const computed = window.getComputedStyle(el);
    const result: Record<string, string> = {};
    if (properties && properties.length > 0) {
      for (const prop of properties) {
        result[prop] = computed.getPropertyValue(prop);
      }
    } else {
      // Si aucune propriété fournie, on retourne toutes les propriétés calculées
      for (let i = 0; i < computed.length; i++) {
        const prop = computed.item(i);
        if (typeof prop === 'string') {
          result[prop] = computed.getPropertyValue(prop);
        }
      }
    }
    return result;
  };

  /**
   * Parse une string linear-gradient en objet avec direction, orientation et color stops
   * @param gradientStr string - ex: 'linear-gradient(to right bottom, oklch(0.623 0.214 259.815) 0%, oklch(0.627 0.265 303.9) 50%, oklch(0.656 0.241 354.308) 100%)'
   * @returns { direction: string, orientation: string, stops: Array<{color: string, position: string}> }
   */
  const parseLinearGradient = (gradientStr: string) => {
    const result = {
      direction: '',
      orientation: 'unknown',
      stops: [] as Array<{ color: string; pos: string }>,
    };
    // Nouveau parsing plus robuste
    const gradientContent = gradientStr.replace(/^linear-gradient\(|\)$/gi, '');
    // Sépare direction et stops
    let direction = '';
    let stopsPart = '';
    // Si la première partie ressemble à une direction
    const firstComma = gradientContent.indexOf(',');
    if (firstComma !== -1) {
      const firstPart = gradientContent.slice(0, firstComma).trim();
      if (
        /^(to\s+(right|left|top|bottom)(\s+(right|left|top|bottom))?|[0-9.]+deg)$/.test(firstPart)
      ) {
        direction = firstPart;
        stopsPart = gradientContent.slice(firstComma + 1);
      } else {
        direction = 'to bottom'; // valeur par défaut
        stopsPart = gradientContent;
      }
    } else {
      // Pas de virgule, tout est direction
      direction = gradientContent.trim();
    }
    result.direction = direction;
    // Orientation
    if (/to\s+right\b/.test(direction) && /to\s+bottom\b/.test(direction)) {
      result.orientation = 'diagonal';
    } else if (/to\s+right\b/.test(direction)) {
      result.orientation = 'horizontal';
    } else if (/to\s+left\b/.test(direction)) {
      result.orientation = 'horizontal';
    } else if (/to\s+bottom\b/.test(direction)) {
      result.orientation = 'vertical';
    } else if (/to\s+top\b/.test(direction)) {
      result.orientation = 'vertical';
    } else if (/deg$/.test(direction)) {
      result.orientation = 'angle';
    }
    // Color stops
    const stops = stopsPart
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    for (const stop of stops) {
      // Sépare couleur et position si possible
      const stopMatch = stop.match(/(.+?)\s*(\d+%|0|1)?$/);
      if (stopMatch && stopMatch[1]) {
        result.stops.push({ color: stopMatch[1].trim(), pos: stopMatch[2] ?? '' });
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
