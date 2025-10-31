export const stringLiteralRegex = /^['\"].*['\"]$/;
// Returns true if the string is a string literal (quoted)
export const isStringLiteral = (str: string): boolean => {
  return stringLiteralRegex.test(str);
};
