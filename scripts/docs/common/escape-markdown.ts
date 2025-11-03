/**
 * Échappe les caractères spéciaux Markdown dans une chaîne
 * pour une utilisation dans un tableau Markdown.
 * @param text Le texte à échapper
 */
export function escapeMarkdownTableCell(text: string): string {
  if (!text) return text;

  // Échappe les pipes qui sont utilisés comme délimiteurs de colonnes en Markdown
  return text.replace(/\|/g, '\\|');
}

/**
 * Échappe les pipes dans une définition de type TypeScript
 * pour les tableaux Markdown.
 * @param type Le type TypeScript à échapper
 */
export function escapeTypeForMarkdown(type: string): string {
  if (!type) return type;

  // Échappe les pipes dans les unions de types
  return type.replace(/\|/g, '\\|');
}
