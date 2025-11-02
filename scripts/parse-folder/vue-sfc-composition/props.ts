import ts from 'typescript';
import { getWithDefaultsPropRegex } from '../common/with-defaults-prop.regex';

export const extractProps = (scriptContent: string, absPath: string) => {
  const props: Array<{ name: string; type: string; default?: any; description: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  const visit = (node: ts.Node) => {
    // --- Cas withDefaults(defineProps<Type>(), { ... })
    if (
      ts.isCallExpression(node) &&
      node.expression.getText() === 'withDefaults' &&
      node.arguments &&
      node.arguments.length === 2
    ) {
      const definePropsCall =
        node.arguments && node.arguments.length > 0 ? node.arguments[0] : undefined;
      const defaultsArg =
        node.arguments && node.arguments.length > 1 ? node.arguments[1] : undefined;
      if (
        definePropsCall &&
        ts.isCallExpression(definePropsCall) &&
        definePropsCall.expression.getText() === 'defineProps' &&
        definePropsCall.typeArguments &&
        definePropsCall.typeArguments.length > 0
      ) {
        const typeArg = definePropsCall.typeArguments[0];
        let defaultsObj: Record<string, any> = {};
        if (defaultsArg && ts.isObjectLiteralExpression(defaultsArg)) {
          for (const prop of defaultsArg.properties) {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
              try {
                // eslint-disable-next-line no-eval
                defaultsObj[prop.name.text] = eval(prop.initializer.getText());
              } catch {
                defaultsObj[prop.name.text] = prop.initializer.getText();
              }
            }
          }
        }
        if (typeArg && ts.isTypeReferenceNode(typeArg)) {
          // Cherche la déclaration de l'interface dans le fichier
          const typeName = typeArg.typeName.getText();
          ts.forEachChild(sourceFile, (child) => {
            if (ts.isInterfaceDeclaration(child) && child.name.text === typeName) {
              for (const member of child.members) {
                if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
                  const propName = member.name.text;
                  let type = member.type ? member.type.getText() : 'any';
                  let isOptional = !!member.questionToken;
                  let defaultValue: any = '-';
                  if (Object.prototype.hasOwnProperty.call(defaultsObj, propName)) {
                    defaultValue = defaultsObj[propName];
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
                      description = cmt.replace(/^\/\//, '').trim();
                    }
                  }
                  props.push({ name: propName, type, default: defaultValue, description });
                }
              }
            }
          });
        } else if (typeArg && ts.isTypeLiteralNode(typeArg)) {
          for (const member of typeArg.members) {
            if (ts.isPropertySignature(member) && member.name && ts.isIdentifier(member.name)) {
              const propName = member.name.text;
              let type = member.type ? member.type.getText() : 'any';
              let isOptional = !!member.questionToken;
              let defaultValue: any = '-';
              if (Object.prototype.hasOwnProperty.call(defaultsObj, propName)) {
                defaultValue = defaultsObj[propName];
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
                  description = cmt.replace(/^\/\//, '').trim();
                }
              }
              props.push({ name: propName, type, default: defaultValue, description });
            }
          }
        }
      }
    }
    // Forme type: defineProps<Type>()
    else if (ts.isCallExpression(node) && node.expression.getText() === 'defineProps') {
      // --- Forme typeArguments (defineProps<Type>())
      if (node.typeArguments && node.typeArguments.length > 0) {
        const typeArg = node.typeArguments[0];
        // Cas type inline
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
                    getWithDefaultsPropRegex(propName)
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
                  description = cmt.replace(/^\/\//, '').trim();
                }
              }
              props.push({ name: propName, type, default: defaultValue, description });
            }
          }
        }
        // Cas interface déclarée dans le fichier
        else if (typeArg && ts.isTypeReferenceNode(typeArg)) {
          const typeName = typeArg.typeName.getText();
          ts.forEachChild(sourceFile, (child) => {
            if (ts.isInterfaceDeclaration(child) && child.name.text === typeName) {
              for (const member of child.members) {
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
                        getWithDefaultsPropRegex(propName)
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
                      description = cmt.replace(/^\/\//, '').trim();
                    }
                  }
                  props.push({ name: propName, type, default: defaultValue, description });
                }
              }
            }
          });
        }
      }
      // --- Forme objet (defineProps({ ... }))
      if (node.arguments && node.arguments.length > 0) {
        const arg = node.arguments[0];
        if (arg && ts.isObjectLiteralExpression(arg)) {
          for (const prop of arg.properties) {
            if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
              const propName = prop.name.text;
              let type = 'any';
              let defaultValue: any = '-';
              let required = false;
              let description = '';
              if (ts.isObjectLiteralExpression(prop.initializer)) {
                for (const p of prop.initializer.properties) {
                  if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name)) {
                    const key = p.name.text;
                    if (key === 'type') {
                      type = p.initializer.getText();
                    } else if (key === 'default') {
                      defaultValue = p.initializer.getText();
                    } else if (key === 'required') {
                      required = p.initializer.getText() === 'true';
                    }
                  }
                }
              }
              // Recherche du commentaire JSDoc
              const ranges = ts.getLeadingCommentRanges(scriptContent, prop.pos) || [];
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
              // Recherche withDefaults
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
                    getWithDefaultsPropRegex(propName)
                  );
                  if (defaultMatch && defaultMatch[1]) {
                    defaultValue = defaultMatch[1].trim();
                  }
                }
              }
              props.push({ name: propName, type, default: defaultValue, description });
            }
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  // Déduplication des props par nom (garde la première occurrence)
  const seen = new Set();
  const dedupedProps = [];
  for (const prop of props) {
    if (!seen.has(prop.name)) {
      dedupedProps.push(prop);
      seen.add(prop.name);
    }
  }
  return dedupedProps;
};
