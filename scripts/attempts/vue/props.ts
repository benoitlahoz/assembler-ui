import ts from 'typescript';

export const extractProps = (scriptContent: string, absPath: string) => {
  const props: Array<{ name: string; type: string; default?: any; description: string }> = [];
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
      node.expression.getText() === 'defineProps' &&
      node.typeArguments &&
      node.typeArguments.length > 0
    ) {
      const typeArg = node.typeArguments[0];
      if (typeArg && ts.isTypeLiteralNode(typeArg)) {
        for (const member of typeArg.members) {
          if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
            const propName = member.name.text;
            let type = member.type ? member.type.getText() : 'any';
            let isOptional = !!member.questionToken;
            let defaultValue: any = '-';
            const withDefaultsMatch = scriptContent.match(
              /withDefaults\s*\([^,]+,\s*({[\s\S]*?})\s*\)/
            );
            if (withDefaultsMatch && withDefaultsMatch[1]) {
              try {
                // eslint-disable-next-line no-eval
                const defaultsObj = eval('(' + withDefaultsMatch[1] + ')');
                if (Object.prototype.hasOwnProperty.call(defaultsObj, propName)) {
                  defaultValue = defaultsObj[propName];
                }
              } catch (e) {
                const defaultMatch = withDefaultsMatch[1].match(
                  new RegExp(`${propName}\\s*:\\s*([^,}\n]+)`)
                );
                if (defaultMatch && defaultMatch[1]) {
                  defaultValue = defaultMatch[1].trim();
                }
              }
            }
            if (isOptional && typeof defaultValue === 'undefined') {
              defaultValue = '-';
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
              } else if (cmt.startsWith('//')) {
                // Prend le dernier commentaire simple ligne trouvé
                description = cmt.replace(/^\/\//, '').trim();
              }
            }
            props.push({ name: propName, type, default: defaultValue, description });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return props;
};
