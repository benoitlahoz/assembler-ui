import ts from 'typescript';

export interface SlotInfo {
  name: string;
  description: string;
  params?: string;
}

export const extractSlots = (
  scriptContent: string,
  absPath: string,
  templateContent?: string
): SlotInfo[] => {
  const slots: SlotInfo[] = [];
  // Extraction from <script setup> using defineSlots (if present)
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
      node.expression.getText() === 'defineSlots' &&
      node.arguments.length === 1
    ) {
      const arg = node.arguments[0];
      if (arg && ts.isObjectLiteralExpression(arg)) {
        arg.properties.forEach((prop) => {
          if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
            const name = prop.name.text;
            let description = '';
            let params = '';
            const ranges = ts.getLeadingCommentRanges(scriptContent, prop.pos) || [];
            for (const range of ranges) {
              const cmt = scriptContent.slice(range.pos, range.end).trim();
              if (cmt.startsWith('/**')) {
                description = cmt
                  .replace(/^\/\*\*|\*\/$/g, '')
                  .replace(/^[*\s]+/gm, '')
                  .trim();
              }
            }
            if (ts.isFunctionLike(prop.initializer)) {
              params = prop.initializer.parameters.map((p) => p.getText()).join(', ');
            }
            slots.push({ name, description, params });
          }
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  // Extraction from <template> (if provided)
  if (templateContent) {
    // Regex to find <slot name="..."> or <slot>
    const slotRegex = /<slot(?:\s+name=["']([\w-]+)["'])?[^>]*>/g;
    let match;
    while ((match = slotRegex.exec(templateContent))) {
      const name = match[1] || 'default';
      if (!slots.some((s) => s.name === name)) {
        slots.push({ name, description: '', params: undefined });
      }
    }
  }
  return slots;
};
