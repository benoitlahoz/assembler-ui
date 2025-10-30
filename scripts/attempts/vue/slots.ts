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
  const slotsMap: Record<string, SlotInfo> = {};
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  // 1. Récupère les slots définis dans defineSlots
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
            let params: string | undefined = undefined;
            const ranges = ts.getLeadingCommentRanges(scriptContent, prop.pos) || [];
            for (const range of ranges) {
              const cmt = scriptContent.slice(range.pos, range.end).trim();
              if (cmt.startsWith('/**')) {
                description = cmt
                  .replace(/^\/\*\*|\*\/$/g, '')
                  .replace(/^[*\s]+/gm, '')
                  .trim();
                break;
              } else if (cmt.startsWith('//')) {
                description = cmt.replace(/^\/\//, '').trim();
                break;
              }
            }
            if (ts.isFunctionLike(prop.initializer)) {
              if (prop.initializer.parameters.length > 0) {
                params = prop.initializer.parameters.map((p) => p.getText()).join(', ');
              } else {
                params = undefined;
              }
            }
            slotsMap[name] = { name, description, params };
          }
        });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  // 2. Complète avec les slots du template si non présents dans defineSlots
  if (templateContent) {
    // On va parcourir le template ligne par ligne pour associer les commentaires HTML aux slots
    const lines = templateContent.split(/\r?\n/);
    let lastComment: string | null = null;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? '';
      const commentMatch = line.match(/<!--\s*(.*?)\s*-->/);
      if (commentMatch && typeof commentMatch[1] === 'string') {
        lastComment = commentMatch[1].trim();
        continue;
      }
      const slotMatch = line.match(/<slot(?:\s+name=["']([\w-]+)["'])?[^>]*>/);
      if (slotMatch) {
        const name = slotMatch[1] || 'default';
        if (!slotsMap[name]) {
          slotsMap[name] = { name, description: lastComment || '', params: undefined };
        }
        lastComment = null;
      }
    }
  }
  // 3. Retourne la liste des slots (defineSlots prioritaire, premier commentaire trouvé)
  // Remplace params undefined par '-'
  return Object.values(slotsMap).map(slot => ({
    ...slot,
    params: slot.params === undefined ? '-' : slot.params,
  }));
};
