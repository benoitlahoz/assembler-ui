/**
 * Supprime tous les commentaires (mono et multi-lignes) d'un code source.
 * Prend en charge JS/TS/Vue/JSON/CSS/HTML.
 */
export function stripComments(code: string): string {
  if (!code) return '';
  // Supprime les commentaires multi-lignes /* ... */
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  // Supprime les commentaires mono-ligne // ...
  code = code.replace(/(^|[^:])\/\/.*$/gm, '$1');
  // Supprime les commentaires HTML <!-- ... -->
  code = code.replace(/<!--([\s\S]*?)-->/g, '');
  // Supprime les commentaires de type # ... (pour .sh, .md, .yml)
  code = code.replace(/^\s*#.*$/gm, '');
  return code;
}
