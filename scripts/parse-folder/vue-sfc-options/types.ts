import ts from 'typescript';

export interface ComponentTypeInfo {
  name: string;
  type: string;
  description?: string;
  properties?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  methods?: Array<{
    name: string;
    signature: string;
    description: string;
  }>;
}

/**
 * Extracts TypeScript types defined in the <script> of a Vue component (classic SFC)
 * @param scriptContent The content of the <script> block
 * @param absPath The absolute path of the file (for TS context)
 */
export const extractComponentTypes = (
  scriptContent: string,
  absPath: string
): ComponentTypeInfo[] => {
  const types: ComponentTypeInfo[] = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const visit = (node: ts.Node) => {
    // Alias types
    if (ts.isTypeAliasDeclaration(node)) {
      let jsdoc = '-';
      const ranges = ts.getLeadingCommentRanges(scriptContent, node.pos) || [];
      if (ranges.length > 0) {
        const lastRange = ranges[ranges.length - 1];
        if (lastRange) {
          const between = scriptContent.slice(lastRange.end, node.pos);
          if (/^([ \t]*\r?\n)*$/.test(between)) {
            const cmt = scriptContent.slice(lastRange.pos, lastRange.end).trim();
            if (cmt.startsWith('/**')) {
              jsdoc = cmt
                .replace(/^\/\*\*|\*\/$/g, '')
                .replace(/^[*\s]+/gm, '')
                .trim();
            } else if (cmt.startsWith('//')) {
              jsdoc = cmt.replace(/^\/\//, '').trim();
            }
          }
        }
      }
      types.push({
        name: node.name.text,
        type: node.type.getText(),
        description: jsdoc,
      });
    }
    // Interfaces
    if (ts.isInterfaceDeclaration(node)) {
      let jsdoc = '-';
      const ranges = ts.getLeadingCommentRanges(scriptContent, node.pos) || [];
      if (ranges.length > 0) {
        const lastRange = ranges[ranges.length - 1];
        if (lastRange) {
          const between = scriptContent.slice(lastRange.end, node.pos);
          if (/^([ \t]*\r?\n)*$/.test(between)) {
            const cmt = scriptContent.slice(lastRange.pos, lastRange.end).trim();
            if (cmt.startsWith('/**')) {
              jsdoc = cmt
                .replace(/^\/\*\*|\*\/$/g, '')
                .replace(/^[*\s]+/gm, '')
                .trim();
            } else if (cmt.startsWith('//')) {
              jsdoc = cmt.replace(/^\/\//, '').trim();
            }
          }
        }
      }
      const properties: Array<{ name: string; type: string; description: string }> = [];
      const methods: Array<{ name: string; signature: string; description: string }> = [];
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
          let propDesc = '-';
          const propRanges = ts.getLeadingCommentRanges(scriptContent, member.pos) || [];
          if (propRanges.length > 0) {
            const lastRange = propRanges[propRanges.length - 1];
            if (lastRange) {
              const between = scriptContent.slice(lastRange.end, member.pos);
              if (/^([ \t]*\r?\n)*$/.test(between)) {
                const cmt = scriptContent.slice(lastRange.pos, lastRange.end).trim();
                if (cmt.startsWith('/**')) {
                  propDesc = cmt
                    .replace(/^\/\*\*|\*\/$/g, '')
                    .replace(/^[*\s]+/gm, '')
                    .trim();
                } else if (cmt.startsWith('//')) {
                  propDesc = cmt.replace(/^\/\//, '').trim();
                }
              }
            }
          }
          properties.push({
            name: member.name.text,
            type: member.type ? member.type.getText() : 'any',
            description: propDesc,
          });
        } else if (ts.isMethodSignature(member) && member.name && ts.isIdentifier(member.name)) {
          let methDesc = '-';
          const methRanges = ts.getLeadingCommentRanges(scriptContent, member.pos) || [];
          if (methRanges.length > 0) {
            const lastRange = methRanges[methRanges.length - 1];
            if (lastRange) {
              const between = scriptContent.slice(lastRange.end, member.pos);
              if (/^([ \t]*\r?\n)*$/.test(between)) {
                const cmt = scriptContent.slice(lastRange.pos, lastRange.end).trim();
                if (cmt.startsWith('/**')) {
                  methDesc = cmt
                    .replace(/^\/\*\*|\*\/$/g, '')
                    .replace(/^[*\s]+/gm, '')
                    .trim();
                } else if (cmt.startsWith('//')) {
                  methDesc = cmt.replace(/^\/\//, '').trim();
                }
              }
            }
          }
          const sig = member.getText();
          methods.push({
            name: member.name.text,
            signature: sig,
            description: methDesc,
          });
        }
      }
      types.push({
        name: node.name.text,
        type: 'interface',
        description: jsdoc,
        properties: properties.length ? properties : undefined,
        methods: methods.length ? methods : undefined,
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return types;
};
