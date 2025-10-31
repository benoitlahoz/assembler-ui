export const stringLiteralRegex = /^['\"].*['\"]$/;
// Returns true if the string is a string literal (quoted)
export const testStringLiteral = (str: string): boolean => {
  return stringLiteralRegex.test(str);
};
