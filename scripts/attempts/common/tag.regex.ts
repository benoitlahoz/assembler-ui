export const tagRegex = /<([A-Z][\w-]*)\b/g;

export function matchComponentTags(str: string): IterableIterator<RegExpMatchArray> {
  return str.matchAll(tagRegex);
}
