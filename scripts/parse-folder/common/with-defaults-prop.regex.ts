// Returns a regex to match a prop with defaults in an object

export const getWithDefaultsPropRegex = (propName: string): RegExp => {
  return new RegExp(`${propName}\\s*:\\s*([^,}\\n]+)`);
};
