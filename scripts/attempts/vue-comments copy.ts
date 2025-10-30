import fs from 'fs';
import { parse } from '@vue/compiler-sfc';
import ts from 'typescript';

// --- Extraction helpers ---
const extractDescriptionAndAuthor = (scriptContent: string) => {
  let description = '';
  let author = '';
  const multilineComment = scriptContent.match(/\/\*\*([\s\S]*?)\*\//);
  if (multilineComment && multilineComment[1]) {
    const descBlock = multilineComment[1].replace(/^[*\s]+/gm, '').trim();
    const tagIndex = descBlock.search(/@[a-zA-Z]+/);
    if (tagIndex > -1) {
      description = descBlock.slice(0, tagIndex).trim();
    } else {
      description = descBlock;
    }
    const authorMatch = descBlock.match(/@author\s+(.+)/);
    if (authorMatch && authorMatch[1]) {
      author = authorMatch[1].trim();
    }
  }
  return { description, author };
};

const extractEmits = (scriptContent: string, absPath: string) => {
  const emits: Array<{ name: string; description: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  function visit(node: ts.Node) {
    // Recherche les emits dans defineEmits<...>()
    if (
      ts.isCallExpression(node) &&
      node.expression.getText() === 'defineEmits' &&
      node.typeArguments &&
      node.typeArguments.length > 0
    ) {
      const typeArg = node.typeArguments[0];
      if (typeArg && ts.isTypeLiteralNode(typeArg)) {
        for (const member of typeArg.members) {
          if (
            ts.isCallSignatureDeclaration(member) &&
            Array.isArray(member.parameters) &&
            member.parameters.length > 0 &&
            member.parameters[0] &&
            member.parameters[0].type &&
            ts.isLiteralTypeNode(member.parameters[0].type)
          ) {
            const paramType = member.parameters[0].type;
            let name = '';
            if (
              paramType &&
              'literal' in paramType &&
              paramType.literal &&
              ts.isStringLiteral(paramType.literal)
            ) {
              name = paramType.literal.text;
            }
            // Récupère le commentaire jsdoc
            let description = '';
            const ranges = ts.getLeadingCommentRanges(scriptContent, member.pos) || [];
            for (const range of ranges) {
              const cmt = scriptContent.slice(range.pos, range.end).trim();
              if (cmt.startsWith('/**')) {
                description = cmt
                  .replace(/^\/\*\*|\*\/$/g, '')
                  .replace(/^[*\s]+/gm, '')
                  .trim();
              }
            }
            emits.push({ name, description });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return emits;
};

const extractExposes = (scriptContent: string, absPath: string) => {
  // Infère le type de retour d'une fonction à partir de ses return
  function inferFunctionReturnType(fn: ts.FunctionLikeDeclarationBase): string {
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
  const exposes: Array<{ name: string; description: string; type?: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  function visit(node: ts.Node) {
    // Recherche les exposes dans defineExpose({ ... })
    if (
      ts.isCallExpression(node) &&
      node.expression.getText() === 'defineExpose' &&
      node.arguments &&
      node.arguments.length > 0
    ) {
      const arg = node.arguments[0];
      if (arg && ts.isObjectLiteralExpression(arg)) {
        // Pour les propriétés shorthand, on va chercher leur déclaration dans le scope parent
        // On construit une map des déclarations de variables dans le script setup
        const varTypes: Record<string, string | undefined> = {};
        // Pour stocker les signatures de fonctions
        const funcSignatures: Record<string, string | undefined> = {};
        const visitVar = (node: ts.Node) => {
          // Déclaration de variable
          if (ts.isVariableStatement(node)) {
            for (const decl of node.declarationList.declarations) {
              if (ts.isIdentifier(decl.name)) {
                const varName = decl.name.text;
                // Si annotation de type explicite
                if (decl.type) {
                  varTypes[varName] = decl.type.getText();
                } else if (decl.initializer && ts.isCallExpression(decl.initializer)) {
                  // Heuristique pour ref/computed/reactive
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
                    const fn = decl.initializer as any;
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
                    const fn = decl.initializer as any;
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
                  const fn = decl.initializer;
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
                  const fn = decl.initializer;
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
          // Déclaration de fonction nommée
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
            // Récupère le commentaire jsdoc
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
            // Type heuristique (reprend l'ancien findExposedType)
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
              const fn = initializer;
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
              const fn = initializer;
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
            // Récupère le commentaire jsdoc
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
            // On tente de retrouver le type dans varTypes ou la signature dans funcSignatures
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

const extractProps = (scriptContent: string, absPath: string) => {
  const props: Array<{ name: string; type: string; default?: any; description: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  function visit(node: ts.Node) {
    // Recherche les props dans defineProps<...>()
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
            // Recherche la valeur par défaut dans withDefaults
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
            // Récupère le commentaire jsdoc
            let description = '';
            const ranges = ts.getLeadingCommentRanges(scriptContent, member.pos) || [];
            for (const range of ranges) {
              const cmt = scriptContent.slice(range.pos, range.end).trim();
              if (cmt.startsWith('/**')) {
                description = cmt
                  .replace(/^\/\*\*|\*\/$/g, '')
                  .replace(/^[*\s]+/gm, '')
                  .trim();
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

const extractInjects = (scriptContent: string, absPath: string) => {
  const injects: Array<{ key: string; default?: any; type?: string; description: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  function visit(node: ts.Node) {
    // Cherche les appels à inject
    if (
      ts.isCallExpression(node) &&
      node.expression.getText() === 'inject' &&
      node.arguments.length >= 1
    ) {
      // Récupère la clé (premier argument)
      const keyArg = node.arguments[0];
      let key = '';
      if (keyArg) {
        if (ts.isStringLiteral(keyArg) || ts.isNoSubstitutionTemplateLiteral(keyArg)) {
          key = keyArg.text;
        } else {
          key = keyArg.getText();
        }
      }
      // Récupère la valeur par défaut (second argument)
      let def: any = undefined;
      if (node.arguments.length > 1) {
        const defArg = node.arguments[1];
        if (defArg) {
          def = defArg.getText();
        }
      }
      // Récupère le type (si possible)
      let type: string | undefined = undefined;
      if (def !== undefined) {
        if (/^['"].*['"]$/.test(def)) type = 'string';
        else if (/^\d+(\.\d+)?$/.test(def)) type = 'number';
        else if (/^(true|false)$/.test(def)) type = 'boolean';
        else if (def === '[]') type = 'any[]';
        else if (def === '{}') type = 'Record<string, any>';
        else type = 'any';
      }
      // Récupère le commentaire jsdoc associé à la déclaration parente
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

const extractProvides = (scriptContent: string, absPath: string) => {
  const provides: Array<{ key: string; value?: any; type?: string; description: string }> = [];
  const sourceFile = ts.createSourceFile(
    absPath,
    scriptContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
  function visit(node: ts.Node) {
    // Cherche les appels à provide
    if (
      ts.isCallExpression(node) &&
      node.expression.getText() === 'provide' &&
      node.arguments.length >= 1
    ) {
      // Récupère la clé (premier argument)
      const keyArg = node.arguments[0];
      let key = '';
      if (keyArg) {
        if (ts.isStringLiteral(keyArg) || ts.isNoSubstitutionTemplateLiteral(keyArg)) {
          key = keyArg.text;
        } else {
          key = keyArg.getText();
        }
      }
      // Récupère la valeur (second argument)
      let value: any = undefined;
      if (node.arguments.length > 1) {
        const valueArg = node.arguments[1];
        if (valueArg) {
          value = valueArg.getText();
        }
      }
      // Récupère le type (si possible)
      let type: string | undefined = undefined;
      if (value !== undefined) {
        if (/^['"].*['"]$/.test(value)) type = 'string';
        else if (/^\d+(\.\d+)?$/.test(value)) type = 'number';
        else if (/^(true|false)$/.test(value)) type = 'boolean';
        else if (value === '[]') type = 'any[]';
        else if (value === '{}') type = 'Record<string, any>';
        else type = 'any';
      }
      // Récupère le commentaire jsdoc associé à la déclaration parente
      let description = '';
      let parent = node.parent;
      while (parent && !ts.isExpressionStatement(parent) && !ts.isVariableStatement(parent)) {
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
      provides.push({ key, value, type, description });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return provides;
};

const extractSlots = (templateContent: string) => {
  const slots: Array<{ name: string; description: string }> = [];
  const slotRegex = /<!--([\s\S]*?)-->\s*<slot([^>]*)>/g;
  let match;
  while ((match = slotRegex.exec(templateContent)) !== null) {
    const description = match[1] ? match[1].replace(/^[\s\*]+/gm, '').trim() : '';
    const nameMatch = match[2] ? match[2].match(/name\s*=\s*['"]([^'"]+)['"]/) : null;
    const name = nameMatch && nameMatch[1] ? nameMatch[1] : 'default';
    slots.push({ name, description });
  }
  return slots;
};

// Fonction principale exportée
export const extractVueDoc = (vueFilePath: string) => {
  const absPath = vueFilePath.startsWith('/') ? vueFilePath : `${process.cwd()}/${vueFilePath}`;
  const vueSource = fs.readFileSync(absPath, 'utf-8');
  const { descriptor } = parse(vueSource);
  const script = descriptor.scriptSetup || descriptor.script;
  let description = '';
  let author = '';
  let props: Array<{ name: string; type: string; default?: any; description: string }> = [];
  let slots: Array<{ name: string; description: string }> = [];
  let emits: Array<{ name: string; description: string }> = [];
  let exposes: Array<{ name: string; description: string; type?: string }> = [];
  let injects: Array<{ key: string; default?: any; type?: string; description: string }> = [];
  let provides: Array<{ key: string; value?: any; type?: string; description: string }> = [];
  if (script) {
    const descAndAuthor = extractDescriptionAndAuthor(script.content);
    description = descAndAuthor.description;
    author = descAndAuthor.author;
    props = extractProps(script.content, absPath);
    emits = extractEmits(script.content, absPath);
    exposes = extractExposes(script.content, absPath);
    injects = extractInjects(script.content, absPath);
    provides = extractProvides(script.content, absPath);
  }
  if (descriptor.template && descriptor.template.content) {
    slots = extractSlots(descriptor.template.content);
  }
  return {
    file: vueFilePath,
    description,
    author,
    props,
    slots,
    emits,
    exposes,
    injects,
    provides,
  };
};

// Utilisation CLI
if (require.main === module) {
  const vueFilePath = process.argv[2] || 'registry/new-york/components/button-foo/ButtonFoo.vue';
  const result = extractVueDoc(vueFilePath);
  fs.writeFileSync('scripts/attempts/vue-comments.json', JSON.stringify(result, null, 2), 'utf-8');
  console.log('Vue comments extraction result written to scripts/attempts/vue-comments.json');
}
