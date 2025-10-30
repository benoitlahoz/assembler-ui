// Extraction of child components used in the template of a Vue SFC

import htmlTags from 'html-tags';
import svgTags from 'svg-tags';

// Set of all native HTML and SVG tags to ignore
const NativeTags = new Set([...htmlTags, ...svgTags]);

/**
 * Extracts child components used in the template of a Vue SFC.
 * @param templateContent The template content.
 * @returns An array of child component names used.
 */
export const extractChildComponents = (templateContent: string): string[] => {
  // Regex to find all tags
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
