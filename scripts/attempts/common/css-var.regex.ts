export const cssVarRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;

export function matchCssVars(str: string): IterableIterator<RegExpMatchArray> {
  return str.matchAll(cssVarRegex);
}
