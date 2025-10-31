export const cssVarRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;

// Returns an iterator for all CSS variable matches in a string
export const matchCssVars = (str: string): IterableIterator<RegExpMatchArray> => {
  return str.matchAll(cssVarRegex);
};
