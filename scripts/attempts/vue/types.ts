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
 * Extrait les types TypeScript définis dans le <script setup> d'un composant Vue.
 * @param scriptContent Le contenu du bloc <script setup>
 * @param absPath Le chemin absolu du fichier (pour le contexte TS)
 */
export function extractComponentTypes(scriptContent: string, absPath: string): ComponentTypeInfo[] {
  const types: ComponentTypeInfo[] = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  function visit(node: ts.Node) {
    // Types alias
    if (ts.isTypeAliasDeclaration(node)) {
      let jsdoc = '';
      const ranges = ts.getLeadingCommentRanges(scriptContent, node.pos) || [];
      for (const range of ranges) {
        const cmt = scriptContent.slice(range.pos, range.end).trim();
        if (cmt.startsWith('/**')) {
          jsdoc = cmt
            .replace(/^\/\*\*|\*\/$/g, '')
            .replace(/^[*\s]+/gm, '')
            .trim();
        } else if (cmt.startsWith('//')) {
          jsdoc = cmt.replace(/^\/\//, '').trim();
        }
      }
      if (!jsdoc) jsdoc = '-';
      types.push({
        name: node.name.text,
        type: node.type.getText(),
        description: jsdoc,
      });
    }
    // Interfaces
    if (ts.isInterfaceDeclaration(node)) {
      let jsdoc = '';
      const ranges = ts.getLeadingCommentRanges(scriptContent, node.pos) || [];
      for (const range of ranges) {
        const cmt = scriptContent.slice(range.pos, range.end).trim();
        if (cmt.startsWith('/**')) {
          jsdoc = cmt
            .replace(/^\/\*\*|\*\/$/g, '')
            .replace(/^[*\s]+/gm, '')
            .trim();
        } else if (cmt.startsWith('//')) {
          jsdoc = cmt.replace(/^\/\//, '').trim();
        }
      }
      if (!jsdoc) jsdoc = '-';
      // Propriétés et méthodes détaillées
      const properties: Array<{ name: string; type: string; description: string }> = [];
      const methods: Array<{ name: string; signature: string; description: string }> = [];
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
          let propDesc = '-';
          const propRanges = ts.getLeadingCommentRanges(scriptContent, member.pos) || [];
          for (const range of propRanges) {
            const cmt = scriptContent.slice(range.pos, range.end).trim();
            if (cmt.startsWith('/**')) {
              propDesc = cmt
                .replace(/^\/\*\*|\*\/$/g, '')
                .replace(/^[*\s]+/gm, '')
                .trim();
            } else if (cmt.startsWith('//')) {
              propDesc = cmt.replace(/^\/\//, '').trim();
            }
          }
          properties.push({
            name: member.name.text,
            type: member.type ? member.type.getText() : 'any',
            description: propDesc || '-',
          });
        } else if (ts.isMethodSignature(member) && member.name && ts.isIdentifier(member.name)) {
          let methDesc = '-';
          const methRanges = ts.getLeadingCommentRanges(scriptContent, member.pos) || [];
          for (const range of methRanges) {
            const cmt = scriptContent.slice(range.pos, range.end).trim();
            if (cmt.startsWith('/**')) {
              methDesc = cmt
                .replace(/^\/\*\*|\*\/$/g, '')
                .replace(/^[*\s]+/gm, '')
                .trim();
            } else if (cmt.startsWith('//')) {
              methDesc = cmt.replace(/^\/\//, '').trim();
            }
          }
          // Signature TypeScript complète
          const sig = member.getText();
          methods.push({
            name: member.name.text,
            signature: sig,
            description: methDesc || '-',
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
  }
  visit(sourceFile);
  return types;
}
