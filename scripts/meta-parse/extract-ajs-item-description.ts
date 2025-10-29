// Peut prendre soit un chemin de fichier, soit le contenu du fichier
export const extractAjsItemDescription = (
  fileOrContent: string,
  isContent = false
): string | undefined => {
  let source = fileOrContent;
  if (!isContent) {
    try {
      source = require('fs').readFileSync(fileOrContent, 'utf-8');
    } catch {
      return undefined;
    }
  }
  const match = source.match(/@ajs-description\s+([^\n]+)/);
  return match?.[1]?.trim();
};
