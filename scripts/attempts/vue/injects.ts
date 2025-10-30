import ts from 'typescript';

export const extractInjects = (scriptContent: string, absPath: string) => {
  const injects: Array<{ key: string; default?: any; type?: string; description: string }> = [];
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
      node.expression.getText() === 'inject' &&
      node.arguments.length >= 1
    ) {
      const keyArg = node.arguments[0];
      let key = '';
      if (keyArg) {
        if (ts.isStringLiteral(keyArg) || ts.isNoSubstitutionTemplateLiteral(keyArg)) {
          key = keyArg.text;
        } else {
          key = keyArg.getText();
        }
      }
      let def: any = undefined;
      if (node.arguments.length > 1) {
        const defArg = node.arguments[1];
        if (defArg) {
          def = defArg.getText();
        }
      }
      let type: string | undefined = undefined;
      if (def !== undefined) {
        if (/^['"].*['"]$/.test(def)) type = 'string';
        else if (/^\d+(\.\d+)?$/.test(def)) type = 'number';
        else if (/^(true|false)$/.test(def)) type = 'boolean';
        else if (def === '[]') type = 'any[]';
        else if (def === '{}') type = 'Record<string, any>';
        else type = 'any';
      }
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
          }
        }
      }
      injects.push({ key, default: def, type, description });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return injects;
};
