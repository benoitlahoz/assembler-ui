export const cssVarCommentBlockRegex = /\/\*([^*]+)\*\/\s*([\w\s\-{}:;\n]*)/g;

export function matchCssVarCommentBlocks(str: string): IterableIterator<RegExpMatchArray> {
  return str.matchAll(cssVarCommentBlockRegex);
}
