export const numberRegex = /^\d+(\.\d+)?$/;
// Returns true if the string is a valid number
export const testNumber = (str: string): boolean => {
  return numberRegex.test(str);
};
