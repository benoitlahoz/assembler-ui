/**
 * Normalise les sauts de lignes multiples dans un fichier Markdown
 * en les réduisant à un maximum de 1 ligne vide consécutive (= 2 \n),
 * tout en préservant la structure Markdown (blocs de code, listes, etc.)
 *
 * @param content Le contenu Markdown à normaliser
 * @returns Le contenu avec les sauts de lignes normalisés
 */
export function normalizeLineBreaks(content: string): string {
  if (!content) return '';

  // Sépare le contenu en blocs de code et texte normal
  const parts: Array<{ type: 'code' | 'text'; content: string }> = [];
  const codeBlockRegex = /(```[\s\S]*?```|~~~[\s\S]*?~~~)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Ajoute le texte avant le bloc de code
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index),
      });
    }

    // Ajoute le bloc de code
    parts.push({
      type: 'code',
      content: match[0],
    });

    lastIndex = match.index + match[0].length;
  }

  // Ajoute le texte restant après le dernier bloc de code
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex),
    });
  }

  // Normalise chaque partie
  const normalizedParts = parts.map((part) => {
    if (part.type === 'code') {
      // Ne touche pas aux blocs de code
      return part.content;
    } else {
      // D'abord, supprime les lignes qui ne contiennent que des espaces
      let text = part.content.replace(/^[ \t]+$/gm, '');
      // Puis réduit les sauts de lignes multiples à maximum 2 \n (1 ligne vide)
      text = text.replace(/\n{3,}/g, '\n\n');
      return text;
    }
  });

  // Rejoint les parties
  let finalContent = normalizedParts.join('');

  // Supprime les lignes vides excessives en fin de fichier (garde juste un \n final)
  finalContent = finalContent.replace(/\n{3,}$/g, '\n');

  return finalContent;
}
