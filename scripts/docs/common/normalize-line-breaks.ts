/**
 * Normalise les sauts de lignes multiples dans un fichier Markdown
 * en les réduisant à un maximum de 2 sauts de lignes consécutifs,
 * tout en préservant la structure Markdown (blocs de code, listes, etc.)
 *
 * @param content Le contenu Markdown à normaliser
 * @returns Le contenu avec les sauts de lignes normalisés
 */
export function normalizeLineBreaks(content: string): string {
  if (!content) return '';

  // Découpe le contenu en lignes
  const lines = content.split('\n');
  const result: string[] = [];
  let consecutiveEmptyLines = 0;
  let inCodeBlock = false;
  let codeBlockMarker = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;

    const trimmedLine = line.trim();

    // Détecte les blocs de code (```, ~~~, ou code fence avec options)
    if (trimmedLine.startsWith('```') || trimmedLine.startsWith('~~~')) {
      if (!inCodeBlock) {
        // Début d'un bloc de code
        inCodeBlock = true;
        codeBlockMarker = trimmedLine.substring(0, 3);
        result.push(line);
        consecutiveEmptyLines = 0;
      } else if (trimmedLine.startsWith(codeBlockMarker)) {
        // Fin d'un bloc de code
        inCodeBlock = false;
        codeBlockMarker = '';
        result.push(line);
        consecutiveEmptyLines = 0;
      } else {
        // Ligne dans un bloc de code
        result.push(line);
        consecutiveEmptyLines = 0;
      }
      continue;
    }

    // Si on est dans un bloc de code, on ne touche pas aux lignes vides
    if (inCodeBlock) {
      result.push(line);
      consecutiveEmptyLines = 0;
      continue;
    }

    // Ligne vide
    if (trimmedLine === '') {
      consecutiveEmptyLines++;
      // On autorise maximum 2 lignes vides consécutives (= 1 ligne blanche visible)
      if (consecutiveEmptyLines <= 2) {
        result.push(line);
      }
      continue;
    }

    // Ligne non vide
    consecutiveEmptyLines = 0;
    result.push(line);
  }

  // Rejoint les lignes et supprime les lignes vides en fin de fichier
  let finalContent = result.join('\n');

  // Supprime les lignes vides excessives en fin de fichier (garde juste un \n final)
  finalContent = finalContent.replace(/\n{3,}$/g, '\n');

  return finalContent;
}
