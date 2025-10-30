// Extracts CSS variables defined in the style block of a SFC, with their description (preceding comment)

export interface CssVarInfo {
  name: string;
  value: string;
  description: string;
}

/**
 * Extracts CSS variables (and their comment) from a <style> block
 * @param styleContent content of the <style> block
 */
export const extractCssVars = (styleContent: string): CssVarInfo[] => {
  const result: CssVarInfo[] = [];
  // Look for comments /* ... */ followed by --var: ...;
  const regex = /\/\*([^*]+)\*\/\s*([\w\s\-{}:;\n]*)/g;
  let match;
  while ((match = regex.exec(styleContent))) {
    const comment = match[1] ? match[1].trim().replace(/\s+/g, ' ') : '';
    const block = match[2] || '';
    // Look for all variables in this block
    const varRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
    let varMatch;
    while ((varMatch = varRegex.exec(block))) {
      if (varMatch[1] && varMatch[2]) {
        result.push({
          name: varMatch[1],
          value: varMatch[2].trim(),
          description: comment,
        });
      }
    }
  }
  return result;
};
