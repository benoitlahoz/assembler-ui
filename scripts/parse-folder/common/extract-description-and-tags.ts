export const extractDescriptionAndTags = (scriptContent: string) => {
  let description = '';
  const tags: Record<string, string | string[]> = {};
  const multilineComment = scriptContent.match(/\/\*\*([\s\S]*?)\*\//);
  if (multilineComment && multilineComment[1]) {
    const descBlock = multilineComment[1].replace(/^[*\s]+/gm, '').trim();
    // Trouve la position du premier tag @
    const tagIndex = descBlock.search(/@[a-zA-Z]+/);
    if (tagIndex > -1) {
      description = descBlock.slice(0, tagIndex).trim();
      // Extraction de tous les tags @xxx
      const tagLines = descBlock.slice(tagIndex).split(/\r?\n/);
      for (const line of tagLines) {
        const tagMatch = line.match(/^@([a-zA-Z0-9_-]+)\s+(.+)/);
        if (tagMatch && typeof tagMatch[1] === 'string' && typeof tagMatch[2] === 'string') {
          const tagName: string = tagMatch[1];
          const tagValue: string = tagMatch[2].trim();
          const current = tags[tagName];
          if (typeof current === 'string') {
            tags[tagName] = [current, tagValue];
          } else if (Array.isArray(current)) {
            current.push(tagValue);
          } else {
            tags[tagName] = tagValue;
          }
        }
      }
    } else {
      description = descBlock;
    }
  }
  return { description, tags };
};
