import * as ts from 'typescript';
import { conditionally } from '@assemblerjs/core';
import { extractAjsPropDescriptions } from '../meta-parse';
import type { PropInfo } from '../types';

export const handleDefineProps = (node: ts.Node, props: PropInfo[], sourceFile: ts.SourceFile) =>
  conditionally({
    if: (n: ts.Node) => {
      if (!ts.isVariableStatement(n)) return false;
      const decls = n.declarationList.declarations;
      if (!decls.length) return false;
      const decl = decls[0];
      if (!decl) return false;
      if (!decl.initializer || !ts.isCallExpression(decl.initializer)) return false;
      const callExpr = decl.initializer;
      if (!ts.isIdentifier(callExpr.expression)) return false;
      return callExpr.expression.escapedText === 'defineProps';
    },
    then: (n: ts.Node) => {
      const decls = (n as ts.VariableStatement).declarationList.declarations;
      if (!decls.length) return;
      const decl = decls[0];
      if (!decl) return;
      if (!decl.initializer || !ts.isCallExpression(decl.initializer)) return;
      const initializer = decl.initializer;
      if (!initializer.typeArguments || initializer.typeArguments.length === 0) return;
      const typeArg = initializer.typeArguments[0];
      if (!typeArg || !ts.isTypeLiteralNode(typeArg)) return;
      // Prepares the textual detection of @ajs-prop descriptions
      const propDescriptions = extractAjsPropDescriptions(sourceFile.getFullText());
      typeArg.members.forEach((member) => {
        if (ts.isPropertySignature(member) && member.type && member.name) {
          const name = ts.isIdentifier(member.name)
            ? member.name.escapedText.toString()
            : ts.isStringLiteral(member.name)
              ? member.name.text
              : undefined;
          let description: string | undefined = undefined;
          // Searches for a JSDoc @ajs-prop comment
          // Uses the TypeScript API to retrieve JSDoc tags
          const jsDocTags = ts.getJSDocTags(member);
          for (const tag of jsDocTags) {
            if (tag.tagName && tag.tagName.escapedText === 'ajs-prop' && tag.comment) {
              if (typeof tag.comment === 'string') {
                description = tag.comment.trim();
              } else if (Array.isArray(tag.comment)) {
                // If it's a NodeArray<JSDocComment>, concatenate the texts
                description = tag.comment
                  .map((c: any) => c.text)
                  .join(' ')
                  .trim();
              }
              break;
            }
          }
          // Searches in raw JSDoc comments if not found in the tags
          if (!description) {
            const jsDocs = ts.getJSDocCommentsAndTags(member);
            for (const doc of jsDocs) {
              if ('comment' in doc && typeof doc.comment === 'string') {
                const match = /@ajs-prop\s+([^@]*)/.exec(doc.comment);
                if (match && match[1]) {
                  description = match[1].trim();
                  break;
                }
              }
            }
          }
          // Textual search via extractAjsPropDescriptions
          if (!description && name && propDescriptions[name]) {
            description = propDescriptions[name];
          }
          if (name) {
            props.push({
              name,
              type: member.type.getText(sourceFile),
              default: '-',
              ...(description ? { description } : {}),
            });
          }
        }
      });
    },
  })(node);
