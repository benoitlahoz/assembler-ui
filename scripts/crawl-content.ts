import * as ts from 'typescript';
import { readFileSync } from 'node:fs';
import { parse } from '@vue/compiler-sfc';
import { conditionally } from '@assemblerjs/core';

type PropInfo = { name: string; type: string; defaultValue: string };

const handleWithDefaults = (
  node: ts.Node,
  props: PropInfo[],
  defaultsMap: Record<string, string>,
  sourceFile: ts.SourceFile
) =>
  conditionally({
    if: (n: ts.Node) =>
      Boolean(
        ts.isVariableStatement(n) &&
          n.declarationList.declarations.length &&
          ts.isCallExpression(n.declarationList.declarations[0].initializer!) &&
          ts.isIdentifier(n.declarationList.declarations[0].initializer!.expression) &&
          n.declarationList.declarations[0].initializer!.expression.escapedText === 'withDefaults'
      ),
    then: (n: ts.Node) => {
      const decl = (n as ts.VariableStatement).declarationList.declarations[0];
      const initializer = decl.initializer as ts.CallExpression;
      const args = initializer.arguments;
      if (
        args.length === 2 &&
        ts.isCallExpression(args[0]) &&
        ts.isIdentifier(args[0].expression) &&
        args[0].expression.escapedText === 'defineProps'
      ) {
        const call = args[0];
        if (call.typeArguments && call.typeArguments.length > 0) {
          const typeArg = call.typeArguments[0];
          if (ts.isTypeLiteralNode(typeArg)) {
            typeArg.members.forEach((member) => {
              if (ts.isPropertySignature(member) && member.type && member.name) {
                const name = ts.isIdentifier(member.name)
                  ? member.name.escapedText.toString()
                  : ts.isStringLiteral(member.name)
                    ? member.name.text
                    : undefined;
                if (name) {
                  props.push({
                    name,
                    type: member.type.getText(sourceFile),
                    defaultValue: defaultsMap[name] ?? '-',
                  });
                }
              }
            });
          }
        }
      }
    },
  })(node);

const handleDefineProps = (node: ts.Node, props: PropInfo[], sourceFile: ts.SourceFile) =>
  conditionally({
    if: (n: ts.Node) =>
      Boolean(
        ts.isVariableStatement(n) &&
          n.declarationList.declarations.length &&
          ts.isCallExpression(n.declarationList.declarations[0].initializer!) &&
          ts.isIdentifier(n.declarationList.declarations[0].initializer!.expression) &&
          n.declarationList.declarations[0].initializer!.expression.escapedText === 'defineProps'
      ),
    then: (n: ts.Node) => {
      const decl = (n as ts.VariableStatement).declarationList.declarations[0];
      const initializer = decl.initializer as ts.CallExpression;
      if (initializer.typeArguments && initializer.typeArguments.length > 0) {
        const typeArg = initializer.typeArguments[0];
        if (ts.isTypeLiteralNode(typeArg)) {
          typeArg.members.forEach((member) => {
            if (ts.isPropertySignature(member) && member.type && member.name) {
              const name = ts.isIdentifier(member.name)
                ? member.name.escapedText.toString()
                : ts.isStringLiteral(member.name)
                  ? member.name.text
                  : undefined;
              if (name) {
                props.push({
                  name,
                  type: member.type.getText(sourceFile),
                  defaultValue: '-',
                });
              }
            }
          });
        }
      }
    },
  })(node);

const handleExportDefaultProps = (node: ts.Node, props: PropInfo[], sourceFile: ts.SourceFile) =>
  conditionally({
    if: (n: ts.Node) =>
      Boolean(ts.isExportAssignment(n) && ts.isObjectLiteralExpression(n.expression)),
    then: (n: ts.Node) => {
      const expr = (n as ts.ExportAssignment).expression as ts.ObjectLiteralExpression;
      const propsProp = expr.properties.find(
        (p) =>
          ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.escapedText === 'props'
      );
      if (
        propsProp &&
        ts.isPropertyAssignment(propsProp) &&
        ts.isObjectLiteralExpression(propsProp.initializer)
      ) {
        propsProp.initializer.properties.forEach((prop) => {
          if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
            // Cherche default dans l'objet prop
            let defaultValue = '-';
            if (ts.isObjectLiteralExpression(prop.initializer)) {
              const def = prop.initializer.properties.find(
                (p) =>
                  ts.isPropertyAssignment(p) &&
                  ts.isIdentifier(p.name) &&
                  p.name.escapedText === 'default'
              );
              if (def && ts.isPropertyAssignment(def) && def.initializer) {
                defaultValue = def.initializer.getText(sourceFile);
              }
            }
            props.push({
              name: prop.name.escapedText.toString(),
              type: 'unknown',
              defaultValue,
            });
          }
        });
      }
    },
  })(node);

const visit = (
  node: ts.Node,
  props: PropInfo[],
  defaultsMap: Record<string, string>,
  sourceFile: ts.SourceFile
) => {
  handleWithDefaults(node, props, defaultsMap, sourceFile);
  handleDefineProps(node, props, sourceFile);
  handleExportDefaultProps(node, props, sourceFile);
  // Ajout : détecte aussi les expressions d'appel direct (ex: withDefaults(defineProps<T>(), ...))
  if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
    const expr = node.expression;
    if (
      ts.isIdentifier(expr.expression) &&
      expr.expression.escapedText === 'withDefaults' &&
      expr.arguments.length === 2 &&
      ts.isCallExpression(expr.arguments[0]) &&
      ts.isIdentifier(expr.arguments[0].expression) &&
      expr.arguments[0].expression.escapedText === 'defineProps'
    ) {
      const call = expr.arguments[0];
      if (call.typeArguments && call.typeArguments.length > 0) {
        const typeArg = call.typeArguments[0];
        if (ts.isTypeLiteralNode(typeArg)) {
          typeArg.members.forEach((member) => {
            if (ts.isPropertySignature(member) && member.type && member.name) {
              const name = ts.isIdentifier(member.name)
                ? member.name.escapedText.toString()
                : ts.isStringLiteral(member.name)
                  ? member.name.text
                  : undefined;
              if (name) {
                props.push({
                  name,
                  type: member.type.getText(sourceFile),
                  defaultValue: defaultsMap[name] ?? '-',
                });
              }
            }
          });
        }
      }
    }
  }
  ts.forEachChild(node, (child) => visit(child, props, defaultsMap, sourceFile));
};

const checkHasDefault = conditionally({
  if: ({ node }: { node: ts.Node; sourceFile: ts.SourceFile }) => {
    return !!(
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.length &&
      ts.isCallExpression(node.declarationList.declarations[0].initializer!) &&
      ts.isIdentifier(node.declarationList.declarations[0].initializer!.expression) &&
      node.declarationList.declarations[0].initializer!.expression.escapedText === 'withDefaults'
    );
  },
  then: ({ node, sourceFile }: { node: ts.Node; sourceFile: ts.SourceFile }) => {
    let defaultsMap: Record<string, string> = {};
    const decl = (node as ts.VariableStatement).declarationList.declarations[0];
    const initializer = decl.initializer as ts.CallExpression;
    const args = initializer.arguments;

    const defaultsObj = isWithDefaultsObject(args);
    if (defaultsObj) {
      defaultsMap = defaultsObj.properties
        .filter(ts.isPropertyAssignment)
        .map((p: ts.PropertyAssignment): [string, string] | undefined => {
          const key: string | undefined = ts.isIdentifier(p.name)
            ? p.name.escapedText.toString()
            : ts.isStringLiteral(p.name)
              ? p.name.text
              : undefined;
          return key ? [key, p.initializer.getText(sourceFile)] : undefined;
        })
        .filter((x: [string, string] | undefined): x is [string, string] => Boolean(x))
        .reduce(
          (acc: Record<string, string>, [key, val]: [string, string]) => {
            acc[key] = val;
            return acc;
          },
          {} as Record<string, string>
        );
    }
    return defaultsMap;
  },
});

const isWithDefaultsObject = conditionally({
  if: (args: ts.NodeArray<ts.Expression>) =>
    args.length === 2 &&
    ts.isCallExpression(args[0]) &&
    ts.isIdentifier(args[0].expression) &&
    args[0].expression.escapedText === 'defineProps' &&
    ts.isObjectLiteralExpression(args[1]),
  then: (args: ts.NodeArray<ts.Expression>) => args[1] as ts.ObjectLiteralExpression,
  else: () => undefined,
});

const findWithDefaults = (node: ts.Node): Record<string, string> => {
  let defaultsMap: Record<string, string> = {};
  const walk = (n: ts.Node) => {
    const result = checkHasDefault({ node: n, sourceFile: node.getSourceFile() });
    if (result && typeof result === 'object') {
      defaultsMap = { ...defaultsMap, ...result };
    }
    ts.forEachChild(n, walk);
  };
  walk(node);
  return defaultsMap;
};

export const extractVueProps = (filePath: string) => {
  const source = readFileSync(filePath, 'utf-8');
  const { descriptor } = parse(source);
  const script = descriptor.scriptSetup || descriptor.script;
  if (!script) return [];
  const sourceFile = ts.createSourceFile(
    filePath,
    script.content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const defaultsMap = findWithDefaults(sourceFile);
  const props: PropInfo[] = [];
  visit(sourceFile, props, defaultsMap, sourceFile);
  return props;
};

console.log(JSON.stringify(extractVueProps('registry/new-york/components/knob/Knob.vue'), null, 2));
