import ts from 'typescript';
import { testStringLiteral } from '../common/string-literal.regex';
import { testNumber } from '../common/number.regex';
import { testBoolean } from '../common/boolean.regex';

/**
 * Extracts injects from the export default object of a classic SFC (key inject)
 * @param scriptContent content of the <script> block
 * @param absPath absolute path of the file (for TS)
 */

export const extractInjects = (scriptContent: string, absPath: string) => {
  const injects: Array<{ key: string; default?: any; type?: string; description: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  // 1. Extraction via export default (Options API)
  function visitExportDefault(node: ts.Node) {
    if (ts.isExportAssignment(node) && ts.isObjectLiteralExpression(node.expression)) {
      const obj = node.expression;
      for (const prop of obj.properties) {
        if (
          ts.isPropertyAssignment(prop) &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === 'inject'
        ) {
          // inject: ['foo', 'bar'] or inject: { foo: ... }
          if (ts.isArrayLiteralExpression(prop.initializer)) {
            for (const el of prop.initializer.elements) {
              if (ts.isStringLiteral(el)) {
                injects.push({ key: el.text, description: '' });
              }
            }
          } else if (ts.isObjectLiteralExpression(prop.initializer)) {
            for (const e of prop.initializer.properties) {
              if (ts.isPropertyAssignment(e) && ts.isIdentifier(e.name)) {
                const key = e.name.text;
                let def: any = undefined;
                let type: string | undefined = undefined;
                let desc = '';
                if (e.initializer) {
                  def = e.initializer.getText();
                  if (testStringLiteral(def)) type = 'string';
                  else if (testNumber(def)) type = 'number';
                  else if (testBoolean(def)) type = 'boolean';
                  else if (def === '[]') type = 'any[]';
                  else if (def === '{}') type = 'Record<string, any>';
                  else type = 'any';
                }
                // Looks for the comment immediately above (JSDoc or //), ignores if blank line or code between
                const ranges = ts.getLeadingCommentRanges(scriptContent, e.pos) || [];
                if (ranges.length > 0) {
                  const lastRange = ranges[ranges.length - 1];
                  if (lastRange) {
                    const between = scriptContent.slice(lastRange.end, e.pos);
                    if (/^([ \t]*\r?\n)*$/.test(between)) {
                      const cmt = scriptContent.slice(lastRange.pos, lastRange.end).trim();
                      if (cmt.startsWith('/**')) {
                        desc = cmt
                          .replace(/^\/\*\*|\*\/$/g, '')
                          .replace(/^[*\s]+/gm, '')
                          .trim();
                      } else if (cmt.startsWith('//')) {
                        desc = cmt.replace(/^\/\//, '').trim();
                      }
                    }
                  }
                }
                injects.push({ key, default: def, type, description: desc });
              }
            }
          }
        }
      }
    }
    ts.forEachChild(node, visitExportDefault);
  }
  // 2. Extraction via inject() calls in the code (Composition API)
  function visitInjectCalls(node: ts.Node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText() === 'inject' &&
      node.arguments.length > 0
    ) {
      // inject(key, defaultValue?)
      let key = '';
      let def: any = undefined;
      let type: string | undefined = undefined;
      let description = '';
      // key (string, identifier, or expression)
      const arg0 = node.arguments[0];
      if (arg0) {
        if (ts.isStringLiteral(arg0)) {
          key = arg0.text;
          type = 'string';
        } else if (ts.isIdentifier(arg0)) {
          key = arg0.getText();
          type = 'symbol|object|any';
        } else {
          key = arg0.getText();
          type = 'any';
        }
      }
      // default value
      if (node.arguments.length > 1 && node.arguments[1]) {
        def = node.arguments[1].getText();
      }
      // Looks for the comment immediately above (JSDoc or //), ignores if blank line or code between
      let desc = '';
      const ranges = ts.getLeadingCommentRanges(scriptContent, node.pos) || [];
      if (ranges.length > 0) {
        const lastRange = ranges[ranges.length - 1];
        if (lastRange) {
          const between = scriptContent.slice(lastRange.end, node.pos);
          if (/^([ \t]*\r?\n)*$/.test(between)) {
            const cmt = scriptContent.slice(lastRange.pos, lastRange.end).trim();
            if (cmt.startsWith('/**')) {
              desc = cmt
                .replace(/^\/\*\*|\*\/$/g, '')
                .replace(/^[*\s]+/gm, '')
                .trim();
            } else if (cmt.startsWith('//')) {
              desc = cmt.replace(/^\/\//, '').trim();
            }
          }
        }
      }
      injects.push({ key, default: def, type, description: desc });
    }
    ts.forEachChild(node, visitInjectCalls);
  }
  visitExportDefault(sourceFile);
  visitInjectCalls(sourceFile);
  return injects;
};
