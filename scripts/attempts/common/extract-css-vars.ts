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
  // 1. Extraction with comment (as before)
  const regex = /\/\*([^*]+)\*\/\s*([\w\s\-{}:;\n]*)/g;
  let match;
  while ((match = regex.exec(styleContent))) {
    const comment = match[1] ? match[1].trim().replace(/\s+/g, ' ') : '';
    const block = match[2] || '';
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
  // 2. Extraction without comment (all vars not already listed)
  const allVarsRegex = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let allVarMatch;
  const already = new Set(result.map((v) => v.name));
  while ((allVarMatch = allVarsRegex.exec(styleContent))) {
    if (allVarMatch[1] && allVarMatch[2] && !already.has(allVarMatch[1])) {
      result.push({
        name: allVarMatch[1],
        value: allVarMatch[2].trim(),
        description: '',
      });
      already.add(allVarMatch[1]);
    }
  }
  return result;
};
