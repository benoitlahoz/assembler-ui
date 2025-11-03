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
    // Découpe le bloc en lignes et retire uniquement le préfixe * (et espaces), sans supprimer les lignes vides
    const lines = multilineComment[1].split(/\r?\n/).map((line) => line.replace(/^\s*\* ?/, ''));
    // Recherche du début des tags pour séparer description et tags sans toucher aux sauts de ligne
    let tagStartIndex = -1;
    for (let idx = 0; idx < lines.length; idx++) {
      if (/^@[a-zA-Z0-9_-]+/.test(lines[idx] ?? '')) {
        tagStartIndex = idx;
        break;
      }
    }
    if (tagStartIndex === -1) {
      description = lines.join('\n');
    } else {
      description = lines.slice(0, tagStartIndex).join('\n');
    }
    // Supprime le tout premier saut de ligne s'il existe, puis le saut de ligne de fin uniquement
    description = description.replace(/^\n+/, '').replace(/\n+$/, '');

    // Pour la suite, on utilise lines pour les tags
    if (tagStartIndex > -1) {
      // Extraction de tous les tags @xxx
      const tagLines = lines.slice(tagStartIndex);
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
    }
  }

  return { description, tags };
};
