export const isJSDocComment = (cmt: string) => {
  return cmt.trim().startsWith('/**');
};
