import ts from 'typescript';

export function inferFunctionReturnType(fn: ts.FunctionLikeDeclarationBase): string {
  let foundTypes: Set<string> = new Set();
  function visit(n: ts.Node) {
    if (ts.isReturnStatement(n) && n.expression) {
      const expr = n.expression;
      if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
        foundTypes.add('string');
      } else if (ts.isNumericLiteral(expr)) {
        foundTypes.add('number');
      } else if (
        expr.kind === ts.SyntaxKind.TrueKeyword ||
        expr.kind === ts.SyntaxKind.FalseKeyword
      ) {
        foundTypes.add('boolean');
      } else if (ts.isArrayLiteralExpression(expr)) {
        foundTypes.add('any[]');
      } else if (ts.isObjectLiteralExpression(expr)) {
        foundTypes.add('Record<string, any>');
      } else {
        foundTypes.add('any');
      }
    }
    ts.forEachChild(n, visit);
  }
  ts.forEachChild(fn, visit);
  if (foundTypes.size === 1) {
    const t = Array.from(foundTypes)[0];
    return t === undefined ? 'any' : t;
  }
  if (foundTypes.size > 1) return 'any';
  return 'void';
}

export const extractExposes = (scriptContent: string, absPath: string) => {
  const exposes: Array<{ name: string; description: string; type?: string }> = [];
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
      node.expression.getText() === 'defineExpose' &&
      node.arguments &&
      node.arguments.length > 0
    ) {
      const arg = node.arguments[0];
      if (arg && ts.isObjectLiteralExpression(arg)) {
        const varTypes: Record<string, string | undefined> = {};
        const funcSignatures: Record<string, string | undefined> = {};
        const visitVar = (node: ts.Node) => {
          if (ts.isVariableStatement(node)) {
            for (const decl of node.declarationList.declarations) {
              if (ts.isIdentifier(decl.name)) {
                const varName = decl.name.text;
                if (decl.type) {
                  varTypes[varName] = decl.type.getText();
                } else if (decl.initializer && ts.isCallExpression(decl.initializer)) {
                  const call = decl.initializer;
                  const callee = call.expression.getText();
                  if (callee === 'ref' || callee === 'computed' || callee === 'reactive') {
                    if (
                      call.typeArguments &&
                      Array.isArray(call.typeArguments) &&
                      call.typeArguments.length > 0 &&
                      call.typeArguments[0]
                    ) {
                      varTypes[varName] =
                        `${callee.charAt(0).toUpperCase() + callee.slice(1)}<${call.typeArguments[0].getText()}>`;
                    } else {
                      varTypes[varName] =
                        `${callee.charAt(0).toUpperCase() + callee.slice(1)}<any>`;
                    }
                  } else if (decl.initializer && ts.isArrowFunction(decl.initializer)) {
                    const fn = decl.initializer as ts.ArrowFunction;
                    const params = fn.parameters
                      .map((p: ts.ParameterDeclaration) => {
                        const paramName = p.name.getText();
                        const paramType = p.type ? `: ${p.type.getText()}` : '';
                        return paramName + paramType;
                      })
                      .join(', ');
                    let returnType = 'any';
                    if (fn.type) {
                      returnType = fn.type.getText();
                    } else {
                      returnType = inferFunctionReturnType(fn);
                    }
                    funcSignatures[varName] = `(${params}) => ${returnType}`;
                  } else if (decl.initializer && ts.isFunctionExpression(decl.initializer)) {
                    const fn = decl.initializer as ts.FunctionExpression;
                    const params = fn.parameters
                      .map((p: ts.ParameterDeclaration) => {
                        const paramName = p.name.getText();
                        const paramType = p.type ? `: ${p.type.getText()}` : '';
                        return paramName + paramType;
                      })
                      .join(', ');
                    let returnType = 'any';
                    if (fn.type) {
                      returnType = fn.type.getText();
                    } else {
                      returnType = inferFunctionReturnType(fn);
                    }
                    funcSignatures[varName] = `(${params}) => ${returnType}`;
                  } else {
                    varTypes[varName] = undefined;
                  }
                } else if (decl.initializer && ts.isArrowFunction(decl.initializer)) {
                  const fn = decl.initializer as ts.ArrowFunction;
                  const params = fn.parameters
                    .map((p: ts.ParameterDeclaration) => {
                      const paramName = p.name.getText();
                      const paramType = p.type ? `: ${p.type.getText()}` : '';
                      return paramName + paramType;
                    })
                    .join(', ');
                  let returnType = 'any';
                  if (fn.type) {
                    returnType = fn.type.getText();
                  } else {
                    returnType = inferFunctionReturnType(fn);
                  }
                  funcSignatures[varName] = `(${params}) => ${returnType}`;
                } else if (decl.initializer && ts.isFunctionExpression(decl.initializer)) {
                  const fn = decl.initializer as ts.FunctionExpression;
                  const params = fn.parameters
                    .map((p: ts.ParameterDeclaration) => {
                      const paramName = p.name.getText();
                      const paramType = p.type ? `: ${p.type.getText()}` : '';
                      return paramName + paramType;
                    })
                    .join(', ');
                  let returnType = 'any';
                  if (fn.type) {
                    returnType = fn.type.getText();
                  } else {
                    returnType = inferFunctionReturnType(fn);
                  }
                  funcSignatures[varName] = `(${params}) => ${returnType}`;
                } else {
                  varTypes[varName] = undefined;
                }
              }
            }
          }
          if (ts.isFunctionDeclaration(node) && node.name && ts.isIdentifier(node.name)) {
            const fnName = node.name.text;
            const params = node.parameters
              .map((p: ts.ParameterDeclaration) => {
                const paramName = p.name.getText();
                const paramType = p.type ? `: ${p.type.getText()}` : '';
                return paramName + paramType;
              })
              .join(', ');
            let returnType = 'any';
            if (node.type) {
              returnType = node.type.getText();
            } else {
              returnType = inferFunctionReturnType(node);
            }
            funcSignatures[fnName] = `(${params}) => ${returnType}`;
          }
          ts.forEachChild(node, visitVar);
        };
        ts.forEachChild(sourceFile, visitVar);

        for (const prop of arg.properties) {
          let name: string | undefined = undefined;
          let description = '';
          let type: string | undefined = undefined;
          if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
            name = prop.name.text;
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
            const initializer = prop.initializer;
            if (
              initializer &&
              ts.isCallExpression(initializer) &&
              initializer.expression.getText() === 'ref'
            ) {
              if (
                initializer.typeArguments &&
                initializer.typeArguments.length > 0 &&
                initializer.typeArguments[0]
              ) {
                type = `Ref<${initializer.typeArguments[0].getText()}>`;
              } else if (
                initializer.arguments &&
                initializer.arguments.length > 0 &&
                initializer.arguments[0]
              ) {
                const val = initializer.arguments[0].getText();
                if (/^['"].*['"]$/.test(val)) type = 'Ref<string>';
                else if (/^\d+(\.\d+)?$/.test(val)) type = 'Ref<number>';
                else if (/^(true|false)$/.test(val)) type = 'Ref<boolean>';
                else if (val === '[]') type = 'Ref<any[]>';
                else if (val === '{}') type = 'Ref<Record<string, any>>';
                else type = 'Ref<any>';
              } else {
                type = 'Ref<any>';
              }
            } else if (initializer && ts.isArrowFunction(initializer)) {
              const fn = initializer as ts.ArrowFunction;
              const params = fn.parameters
                .map((p: ts.ParameterDeclaration) => {
                  const paramName = p.name.getText();
                  const paramType = p.type ? `: ${p.type.getText()}` : '';
                  return paramName + paramType;
                })
                .join(', ');
              let returnType = 'any';
              if (fn.type) {
                returnType = fn.type.getText();
              } else {
                returnType = inferFunctionReturnType(fn);
              }
              type = `(${params}) => ${returnType}`;
            } else if (initializer && ts.isFunctionExpression(initializer)) {
              const fn = initializer as ts.FunctionExpression;
              const params = fn.parameters
                .map((p: ts.ParameterDeclaration) => {
                  const paramName = p.name.getText();
                  const paramType = p.type ? `: ${p.type.getText()}` : '';
                  return paramName + paramType;
                })
                .join(', ');
              let returnType = 'any';
              if (fn.type) {
                returnType = fn.type.getText();
              } else {
                returnType = inferFunctionReturnType(fn);
              }
              type = `(${params}) => ${returnType}`;
            }
          } else if (ts.isShorthandPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
            name = prop.name.text;
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
            type = funcSignatures[name] || varTypes[name] || undefined;
          }
          if (name) {
            exposes.push({ name, description, type });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return exposes;
};
