export const commentRegex = /^\/\*\*([\s\S]*?)\*\//;

// Returns the first JSDoc comment block match in a string
export const matchCommentBlock = (str: string): RegExpMatchArray | null => {
  return str.match(commentRegex);
};

// Returns true if the string contains a JSDoc comment block
export const testCommentBlock = (str: string): boolean => {
  return commentRegex.test(str);
};
