import htmlTags from 'html-tags';
import svgTags from 'svg-tags';

const NativeTags = new Set([...htmlTags, ...svgTags]);

/**
 * Extrait les composants enfants utilisés dans le template d'un SFC.
 * @param templateContent contenu du template
 * @returns tableau des noms de composants enfants
 */
export const extractChildComponents = (templateContent: string): string[] => {
  const tagRegex = /<([A-Z][\w-]*)\b/g;
  const found = new Set<string>();
  let match;
  while ((match = tagRegex.exec(templateContent))) {
    const tag = match[1];
    if (tag && !NativeTags.has(tag.toLowerCase())) {
      found.add(tag);
    }
  }
  return Array.from(found);
};
