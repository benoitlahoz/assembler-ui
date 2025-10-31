import ts from 'typescript';

export const isEmitsProperty = (prop: ts.ObjectLiteralElementLike) => {
  if (ts.isPropertyAssignment(prop)) {
    const name = prop.name;
    let key = '';
    if (ts.isIdentifier(name)) key = name.text;
    else if (ts.isStringLiteral(name)) key = name.text;
    if (key === 'emits') {
      return true;
    }
  }
  return false;
};
