export const extractDescriptionAndTags = (scriptContent: string) => {
  let description = '';
  const tags: Record<string, string> = {};
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
        if (tagMatch && tagMatch[1] && tagMatch[2]) {
          tags[String(tagMatch[1])] = String(tagMatch[2]).trim();
        }
      }
    } else {
      description = descBlock;
    }
  }
  return { description, tags };
};
