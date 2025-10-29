import * as ts from 'typescript';
import { conditionally } from '@assemblerjs/core';
import type { PropInfo } from './types';

export const handleExportDefaultProps = (
  node: ts.Node,
  props: PropInfo[],
  sourceFile: ts.SourceFile
) =>
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
              default: defaultValue,
            });
          }
        });
      }
    },
  })(node);
