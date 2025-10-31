import ts from 'typescript';
import { isEmitsProperty } from '../common/is.emits-property';
import { isArrayLiteral } from '../common/is.array-literal';
import { getEmitDescriptionFromObjectProperty } from '../common/get-emit-description-from-object-property';
import { extractCommentDescription } from '../common/extract-comment-description';

// Handles emits defined as an array in the SFC
const handleArrayEmits = (
  initializer: ts.Expression,
  scriptContent: string,
  emits: Array<{ name: string; description: string }>
): void => {
  if (!isArrayLiteral(initializer)) return;
  if (ts.isArrayLiteralExpression(initializer)) {
    // Retrieve JSDoc comments associated with each array element
    const elements = initializer.elements;
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (typeof element !== 'undefined' && ts.isStringLiteral(element)) {
        // Look for a JSDoc comment just before the element
        let description = '';
        const jsDoc = ts.getJSDocCommentsAndTags?.(element) ?? [];
        if (jsDoc.length > 0) {
          // Take the last JSDoc comment found
          const last = jsDoc[jsDoc.length - 1];
          if (last && 'comment' in last && typeof (last as any).comment === 'string') {
            description = (last as any).comment.trim();
          } else if (last && 'text' in last && typeof (last as any).text === 'string') {
            description = (last as any).text.trim();
          }
        } else {
          // Fallback: use extractCommentDescription to extract any possible description
          const pos = element.getFullStart();
          // Simulate a ts.CommentRange covering the last block before the element
          // Look for the last JSDoc comment before the element
          const before = scriptContent.slice(Math.max(0, pos - 120), pos);
          const match = /\/\*\*([\s\S]*?)\*\//g.exec(before);
          if (match && match.index !== undefined) {
            const commentStart = pos - (before.length - match.index);
            const commentEnd = commentStart + match[0].length;
            const fakeRange = { pos: commentStart, end: commentEnd } as ts.CommentRange;
            description = extractCommentDescription(scriptContent, fakeRange, element);
          }
        }
        emits.push({ name: element.text, description });
      }
    }
  }
};

// Handles emits defined as an object in the SFC
const handleObjectEmits = (
  initializer: ts.Expression,
  scriptContent: string,
  emits: Array<{ name: string; description: string }>
): void => {
  if (!ts.isObjectLiteralExpression(initializer)) return;
  for (const e of initializer.properties) {
    if (ts.isPropertyAssignment(e) && ts.isIdentifier(e.name)) {
      const name = e.name.text;
      const description = getEmitDescriptionFromObjectProperty(e, scriptContent);
      emits.push({ name, description });
    }
  }
};

// Visits the AST to find export default emits definitions
const visitExportDefaultEmits = (
  node: ts.Node,
  scriptContent: string,
  emits: Array<{ name: string; description: string }>
): void => {
  // If it's an export default { ... }, process the exported object and do not descend into this same object
  if (ts.isExportAssignment(node) && ts.isObjectLiteralExpression(node.expression)) {
    extractEmitsFromObjectLiteral(node.expression, scriptContent, emits);
    // Do not descend into node.expression to avoid duplicates
    ts.forEachChild(node, (child) => {
      if (child !== node.expression) {
        visitExportDefaultEmits(child, scriptContent, emits);
      }
    });
    return;
  }
  // Otherwise, process object literals (for fallback or alternative patterns)
  if (ts.isObjectLiteralExpression(node)) {
    extractEmitsFromObjectLiteral(node, scriptContent, emits);
  }
  ts.forEachChild(node, (child) => visitExportDefaultEmits(child, scriptContent, emits));
};

// Extracts emits from an object literal
const extractEmitsFromObjectLiteral = (
  obj: ts.ObjectLiteralExpression,
  scriptContent: string,
  emits: Array<{ name: string; description: string }>
): void => {
  for (const prop of obj.properties) {
    if (isEmitsProperty(prop)) {
      const initializer = (prop as ts.PropertyAssignment).initializer;
      handleArrayEmits(initializer, scriptContent, emits);
      handleObjectEmits(initializer, scriptContent, emits);
    }
  }
};

// Extracts emits from the export default object of a classic SFC
// @param scriptContent content of the <script> block
// @param absPath absolute path of the file (for TS)
export const extractEmits = (scriptContent: string, absPath: string) => {
  const emits: Array<{ name: string; description: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  visitExportDefaultEmits(sourceFile, scriptContent, emits);
  return emits;
};
