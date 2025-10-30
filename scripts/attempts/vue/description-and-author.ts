import ts from 'typescript';

export const extractDescriptionAndAuthor = (scriptContent: string) => {
  let description = '';
  let author = '';
  const multilineComment = scriptContent.match(/\/\*\*([\s\S]*?)\*\//);
  if (multilineComment && multilineComment[1]) {
    const descBlock = multilineComment[1].replace(/^[*\s]+/gm, '').trim();
    const tagIndex = descBlock.search(/@[a-zA-Z]+/);
    if (tagIndex > -1) {
      description = descBlock.slice(0, tagIndex).trim();
    } else {
      description = descBlock;
    }
    const authorMatch = descBlock.match(/@author\s+(.+)/);
    if (authorMatch && authorMatch[1]) {
      author = authorMatch[1].trim();
    }
  }
  return { description, author };
};
