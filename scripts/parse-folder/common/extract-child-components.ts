// Extraction of child components used in the template of a Vue SFC

import htmlTags from 'html-tags';
import svgTags from 'svg-tags';
import { matchComponentTags } from './match-component-tag';

// Set of all native HTML and SVG tags to ignore
const NativeTags = new Set([...htmlTags, ...svgTags]);

/**
 * Extracts child components used in the template of a Vue SFC.
 * @param templateContent The template content.
 * @returns An array of child component names used.
 */
export const extractChildComponents = (templateContent: string): string[] => {
  const found = new Set<string>();
  for (const match of matchComponentTags(templateContent)) {
    const tag = match[1];
    if (tag && !NativeTags.has(tag.toLowerCase())) {
      found.add(tag);
    }
  }
  return Array.from(found);
};
