export const tagRegex = /<([A-Z][\w-]*)\b/g;

export const matchComponentTags = (str: string): IterableIterator<RegExpMatchArray> => {
  return str.matchAll(tagRegex);
};
