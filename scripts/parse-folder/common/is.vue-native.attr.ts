const nativeAttrs = new Set([
  'name',
  'key',
  'ref',
  'slot',
  'is',
  'v-if',
  'v-else',
  'v-else-if',
  'v-for',
  'v-show',
  'v-model',
  'v-bind',
  'v-on',
  'v-slot',
  'v-pre',
  'v-cloak',
  'v-html',
  'v-text',
]);

export const isVueNativeAttr = (attr: string): boolean => {
  return nativeAttrs.has(attr);
};
