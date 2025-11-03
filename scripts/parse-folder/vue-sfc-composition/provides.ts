import ts from 'typescript';

export const extractProvides = (scriptContent: string, absPath: string) => {
  const provides: Array<{ key: string; value: string; type?: string; description: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText() === 'provide' &&
      node.arguments.length >= 2
    ) {
      const keyArg = node.arguments[0];
      const valueArg = node.arguments[1];
      let key = '';
      if (keyArg) {
        if (ts.isStringLiteral(keyArg) || ts.isNoSubstitutionTemplateLiteral(keyArg)) {
          key = keyArg.text;
        } else {
          key = keyArg.getText();
        }
      }
      let value = valueArg ? valueArg.getText() : '';
      let type: string | undefined = undefined;
      if (node.typeArguments && node.typeArguments.length > 0) {
        type = node.typeArguments.map((arg) => arg.getText()).join(', ');
      } else if (/^['"].*['"]$/.test(value)) type = 'string';
      else if (/^\d+(\.\d+)?$/.test(value)) type = 'number';
      else if (/^(true|false)$/.test(value)) type = 'boolean';
      else if (value === '[]') type = 'any[]';
      else if (value === '{}') type = 'Record<string, any>';
      else type = 'any';
      let description = '';
      let parent = node.parent;
      while (parent && !ts.isVariableStatement(parent) && !ts.isExpressionStatement(parent)) {
        parent = parent.parent;
      }
      if (parent) {
        const ranges = ts.getLeadingCommentRanges(scriptContent, parent.pos) || [];
        for (const range of ranges) {
          const cmt = scriptContent.slice(range.pos, range.end).trim();
          if (cmt.startsWith('/**')) {
            description = cmt
              .replace(/^\/\*\*|\*\/$/g, '')
              .replace(/^[*\s]+/gm, '')
              .trim();
          } else if (cmt.startsWith('//')) {
            description = cmt.replace(/^\/\//, '').trim();
          }
        }
      }
      provides.push({ key, value, type, description });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return provides;
};
