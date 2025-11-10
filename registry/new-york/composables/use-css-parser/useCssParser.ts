/**
 * Utility to parse tailwind classes and get their CSS values.
 *
 * @type registry:hook
 * @category styling
 */

export interface GradientColorStop {
  color: string;
  pos: number;
}

export interface GradientParseResult {
  stops: GradientColorStop[];
  direction: string;
}

// Adapted for oklch from https://stackoverflow.com/a/20238168
// Posted by Dean Taylor, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-07, License - CC BY-SA 4.0
const combineRegExp = (regexpList: (RegExp[] | string)[], flags: string) => {
  let i,
    source = '';
  for (i = 0; i < regexpList.length; i++) {
    if (typeof regexpList[i] === 'string') {
      source += regexpList[i];
    } else {
      source += (regexpList[i] as any).source;
    }
  }
  return new RegExp(source, flags);
};

const buildGradientRegExp = () => {
  // Note any variables with "Capture" in name include capturing bracket set(s).
  const searchFlags = 'gi'; // ignore case for angles, "rgb" etc
  const rAngle = /(?:[+-]?\d*\.?\d+)(?:deg|grad|rad|turn)/; // Angle +ive, -ive and angle types
  // const rSideCornerCapture = /to\s+((?:(?:left|right)(?:\s+(?:top|bottom))?))/; // optional 2nd part
  const rSideCornerCapture = /to\s+((?:left|right|top|bottom)(?:\s+(?:left|right|top|bottom))?)/;
  const rComma = /\s*,\s*/; // Allow space around comma.
  const rColorHex = /\#(?:[a-f0-9]{6}|[a-f0-9]{3})/; // 3 or 6 character form
  const rColorOklch = /oklch\(\s*(?:[+-]?\d*\.?\d+\s*){3}\)/; // "oklch(0.623 0.214 259.815)"
  const rDigits3 = /\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*\)/; // "(1, 2, 3)"
  const rDigits4 = /\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}\s*,\s*\d*\.?\d+\)/; // "(1, 2, 3, 4)"
  const rValue = /(?:[+-]?\d*\.?\d+)(?:%|[a-z]+)?/; // ".9", "-5px", "100%".
  const rKeyword = /[_a-z-][_a-z0-9-]*/; // "red", "transparent", "border-collapse".
  const rColor = combineRegExp(
    [
      '(?:',
      rColorHex.source,
      '|',
      '(?:rgb|hsl)',
      rDigits3.source,
      '|',
      '(?:rgba|hsla)',
      rDigits4.source,
      '|',
      rColorOklch.source,
      '|',
      rKeyword.source,
      ')',
    ],
    ''
  );
  const rColorStop = combineRegExp(
    [rColor.source, '(?:\\s+', rValue.source, '(?:\\s+', rValue.source, ')?)?'],
    ''
  ); // Single Color Stop, optional %, optional length.
  const rColorStopList = combineRegExp(
    ['(?:', rColorStop.source, rComma.source, ')*', rColorStop.source],
    ''
  ); // List of color stops min 1.
  const rLineCapture = combineRegExp(
    ['(?:(', rAngle.source, ')|', rSideCornerCapture.source, ')'],
    ''
  ); // Angle or SideCorner
  const rGradientSearch = combineRegExp(
    ['(?:(', rLineCapture.source, ')', rComma.source, ')?(', rColorStopList.source, ')'],
    searchFlags
  ); // Capture 1:"line", 2:"angle" (optional), 3:"side corner" (optional) and 4:"stop list".
  const rColorStopSearch = combineRegExp(
    [
      '\\s*(',
      rColor.source,
      ')',
      '(?:\\s+',
      '(',
      rValue.source,
      '))?',
      '(?:',
      rComma.source,
      '\\s*)?',
    ],
    searchFlags
  ); // Capture 1:"color" and 2:"position" (optional).

  return {
    gradientSearch: rGradientSearch,
    colorStopSearch: rColorStopSearch,
  };
};

const RegExpLib = buildGradientRegExp();

export const useTailwindClassParser = () => {
  const getTailwindBaseCssValues = (
    el: HTMLElement,
    properties?: string[]
  ): Record<string, string> => {
    if (typeof window === 'undefined') {
      return {};
    }
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

  const parseGradient = function (input: string): GradientParseResult | undefined {
    // Captures inside brackets - max one additional inner set.
    const rGradientEnclosedInBrackets = /.*gradient\s*\(((?:\([^\)]*\)|[^\)\(]*)*)\)/;
    const matchGradientType = rGradientEnclosedInBrackets.exec(input);

    // The content of the gradient or the whole gradient string.
    let strToParse = input;
    if (matchGradientType && matchGradientType[1]) {
      strToParse = matchGradientType[1];
    }

    let result: GradientParseResult | undefined;
    let matchGradient: RegExpExecArray | null;
    let matchColorStop: RegExpExecArray | null;
    let stopResult: GradientColorStop;

    // Reset search position, because we reuse regex.
    RegExpLib.gradientSearch.lastIndex = 0;

    matchGradient = RegExpLib.gradientSearch.exec(strToParse);
    if (matchGradient !== null) {
      result = {
        stops: [],
        direction: 'to bottom',
      };

      // Line (Angle or Side-Corner).
      if (!!matchGradient[1]) {
        result.direction = matchGradient[1] || 'to bottom';
      }
      // Angle or undefined if side-corner.
      if (!!matchGradient[2]) {
        result.direction = matchGradient[2];
      }
      // Side-corner or undefined if angle.
      if (!!matchGradient[3]) {
        result.direction = matchGradient[3] || 'to bottom';
      }

      // reset search position, because we reuse regex.
      RegExpLib.colorStopSearch.lastIndex = 0;

      // Loop though all the color-stops.
      if (typeof matchGradient[4] === 'string') {
        matchColorStop = RegExpLib.colorStopSearch.exec(matchGradient[4]);
        while (matchColorStop !== null) {
          stopResult = {
            color: matchColorStop[1] || 'rgba(0,0,0,0)',
            pos: 0,
          };

          // Position (optional).
          if (!!matchColorStop[2]) {
            let pos = matchColorStop[2];
            if (pos && pos.endsWith('%')) {
              stopResult.pos = parseFloat(pos) / 100;
            } else {
              stopResult.pos = Number(pos);
            }
          }
          result.stops.push(stopResult);

          // Continue searching from previous position.
          matchColorStop = RegExpLib.colorStopSearch.exec(matchGradient[4]);
        }
      }
    }

    // Can be undefined if match not found.
    return result;
  };

  return {
    getTailwindBaseCssValues,
    parseGradient,
  };
};
