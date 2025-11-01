export const extractDescriptionAndTags = (scriptContent: string) => {
  let description = '';
  const tags: Record<
    string,
    | string
    | { name: string; definition: string[] }
    | Array<string | { name: string; definition: string[] }>
  > = {};
  const multilineComment = scriptContent.match(/\/\*\*([\s\S]*?)\*\//);
  if (multilineComment && multilineComment[1]) {
    const descBlock = multilineComment[1].replace(/^[*\s]+/gm, '').trim();
    // Trouve la position du premier tag @
    const tagIndex = descBlock.search(/@[a-zA-Z]+/);
    if (tagIndex > -1) {
      description = descBlock.slice(0, tagIndex).trim();
      // Extraction de tous les tags @xxx
      const tagLines = descBlock.slice(tagIndex).split(/\r?\n/);
      let i = 0;
      while (i < tagLines.length) {
        const line = tagLines[i];
        if (!line) {
          i++;
          continue;
        }
        const tagMatch = line.match(/^@([a-zA-Z0-9_-]+)\s+(.+)/);
        if (tagMatch && typeof tagMatch[1] === 'string' && typeof tagMatch[2] === 'string') {
          const tagName: string = tagMatch[1];
          const tagValue: string = tagMatch[2].trim();
          // Cherche les lignes suivantes commençant par --
          const definition: string[] = [];
          let j = i + 1;
          while (j < tagLines.length) {
            const nextLine = tagLines[j];
            if (typeof nextLine !== 'string' || !nextLine.trim().startsWith('--')) break;
            definition.push(nextLine.replace(/^--\s?/, '').trim());
            j++;
          }
          const isStructured = definition.length > 0;
          const valueToAdd = isStructured ? { name: tagValue, definition } : tagValue;
          const current = tags[tagName];
          if (typeof current === 'undefined') {
            tags[tagName] = valueToAdd;
          } else if (Array.isArray(current)) {
            current.push(valueToAdd);
          } else {
            // On transforme en tableau seulement à la deuxième occurrence, même pour les tags structurés
            tags[tagName] = [current, valueToAdd];
          }
          if (isStructured) {
            i = j;
            continue;
          }
        }
        i++;
      }
    } else {
      description = descBlock;
    }
  }

  return { description, tags };
};
