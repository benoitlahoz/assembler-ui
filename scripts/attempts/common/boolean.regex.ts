export const booleanRegex = /^(true|false)$/;
// Returns true if the string is a boolean literal ('true' or 'false')
export const testBoolean = (str: string): boolean => {
  return booleanRegex.test(str);
};
