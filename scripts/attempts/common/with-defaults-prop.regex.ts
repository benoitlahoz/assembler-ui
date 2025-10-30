export function getWithDefaultsPropRegex(propName: string): RegExp {
  return new RegExp(`${propName}\\s*:\\s*([^,}\n]+)`);
}
