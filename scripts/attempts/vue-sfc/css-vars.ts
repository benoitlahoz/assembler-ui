export interface CssVarInfo {
  name: string;
  value: string;
  description: string;
}

/**
 * Extrait les variables CSS (et leur commentaire) d'un bloc <style>
 * @param styleContent contenu du bloc <style>
 */
export const extractCssVars = (styleContent: string): CssVarInfo[] => {
  const result: CssVarInfo[] = [];
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
  return result;
};
