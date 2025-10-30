import ts from 'typescript';

export interface ComponentTypeInfo {
  name: string;
  type: string;
  description?: string;
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
      types.push({
        name: node.name.text,
        type: 'interface',
        description: jsdoc,
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return types;
}
