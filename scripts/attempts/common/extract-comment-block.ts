export const commentRegex = /^\/\*\*([\s\S]*?)\*\//;

// Returns the first JSDoc comment block match in a string
export const extractCommentBlock = (str: string): RegExpMatchArray | null => {
  return str.match(commentRegex);
};
