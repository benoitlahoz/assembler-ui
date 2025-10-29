// Extraction d'une description @ajs-prop pour une prop à partir du code source d'un bloc script
// Renvoie un objet { [propName]: description }

export const extractAjsPropDescriptions = (scriptContent: string): Record<string, string> => {
  const propDescriptions: Record<string, string> = {};
  const lines = scriptContent.split(/\r?\n/);
  let lastAjsProp: string | undefined = undefined;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const match = line.match(/\/\/\s*@ajs-prop\s+(.+)/);
    if (match && typeof match[1] === 'string') {
      lastAjsProp = match[1].trim();
      continue;
    }
    // Cherche une déclaration de prop juste après le commentaire
    if (lastAjsProp) {
      // Ex: foo?: string; ou bar: number;
      const propMatch = line.match(/([a-zA-Z0-9_]+)\s*[:?]/);
      if (propMatch && typeof propMatch[1] === 'string') {
        const propName = propMatch[1];
        propDescriptions[propName] = lastAjsProp;
        lastAjsProp = undefined;
      }
    }
  }
  return propDescriptions;
};
