import ts from 'typescript';

export const extractEmits = (scriptContent: string, absPath: string) => {
  const emits: Array<{ name: string; description: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  function visit(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText() === 'defineEmits' &&
      node.typeArguments &&
      node.typeArguments.length > 0
    ) {
      const typeArg = node.typeArguments[0];
      if (typeArg && ts.isTypeLiteralNode(typeArg)) {
        for (const member of typeArg.members) {
          if (
            ts.isCallSignatureDeclaration(member) &&
            Array.isArray(member.parameters) &&
            member.parameters.length > 0 &&
            member.parameters[0] &&
            member.parameters[0].type &&
            ts.isLiteralTypeNode(member.parameters[0].type)
          ) {
            const paramType = member.parameters[0].type;
            let name = '';
            if (
              paramType &&
              'literal' in paramType &&
              paramType.literal &&
              ts.isStringLiteral(paramType.literal)
            ) {
              name = paramType.literal.text;
            }
            let description = '';
            const ranges = ts.getLeadingCommentRanges(scriptContent, member.pos) || [];
            for (const range of ranges) {
              const cmt = scriptContent.slice(range.pos, range.end).trim();
              if (cmt.startsWith('/**')) {
                description = cmt
                  .replace(/^\/\*\*|\*\/$/g, '')
                  .replace(/^[*\s]+/gm, '')
                  .trim();
              }
            }
            emits.push({ name, description });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return emits;
};
