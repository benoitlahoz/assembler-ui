import ts from 'typescript';
import { conditionally } from '@assemblerjs/core';
import { hasLeadingComment } from './has.leading-comment';
import { extractCommentDescription } from './extract-comment-description';

export const getEmitDescriptionFromObjectProperty = (
  e: ts.PropertyAssignment,
  scriptContent: string
): string => {
  // Extracts the description for an emit from a property assignment
  const ranges = ts.getLeadingCommentRanges(scriptContent, e.pos) || [];
  let description = '';
  conditionally({
    if: () => hasLeadingComment(ranges),
    then: () => {
      const lastRange = ranges[ranges.length - 1];
      if (lastRange) {
        description = extractCommentDescription(scriptContent, lastRange, e.name as ts.Identifier);
      }
    },
  });
  return description;
};
