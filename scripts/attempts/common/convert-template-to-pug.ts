import { templateTagRegex } from './template-tag.regex';

/**
 * Génère la version pug d'un SFC à partir du code source et du template HTML.
 * @param vueSource Le code source du SFC
 * @param templateContent Le contenu du template (HTML)
 * @returns string (le code source avec le template remplacé par du pug)
 */
export function convertTemplateToPug(vueSource: string, templateContent?: string): string {
  if (templateContent) {
    const pugString = convertContent(templateContent);
    return vueSource.replace(templateTagRegex, `<template lang="pug">\n${pugString}\n</template>`);
  }
  return vueSource;
}

type Node = {
  type: 'element' | 'text' | 'comment';
  tag?: string;
  attrs?: string;
  children?: Node[];
  text?: string;
};

const parseHtml = (html: string): Node[] => {
  const nodes: Node[] = [];
  const stack: Node[] = [];
  let i = 0;
  const len = html.length;
  while (i < len) {
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i + 4);
      if (end !== -1) {
        nodes.push({ type: 'comment', text: html.slice(i, end + 3) });
        i = end + 3;
        continue;
      }
    }
    if (html[i] === '<') {
      const close = html.indexOf('>', i);
      if (close === -1) break;
      const tagContent = html.slice(i + 1, close);
      const isEnd = tagContent[0] === '/';
      const isSelfClosing = tagContent.endsWith('/');
      const tagMatch = tagContent.match(isEnd ? /^\/([\w-]+)/ : /^([\w-]+)/);
      if (tagMatch) {
        const tag = tagMatch[1];
        if (isEnd) {
          let last = stack.pop();
          if (stack.length) {
            const parent = stack[stack.length - 1];
            if (parent && last) {
              if (!parent.children) parent.children = [];
              parent.children.push(last);
            }
          } else if (last) {
            nodes.push(last);
          }
        } else if (tag) {
          const attrs = tagContent.slice(tag.length).replace(/\/$/, '').trim();
          const node: Node = { type: 'element', tag, attrs: attrs || undefined };
          if (isSelfClosing || /^(br|img|input|hr|meta|link|source|track|area)$/i.test(tag)) {
            if (stack.length) {
              const parent = stack[stack.length - 1];
              if (parent) {
                if (!parent.children) parent.children = [];
                parent.children.push(node);
              }
            } else {
              nodes.push(node);
            }
          } else {
            stack.push(node);
          }
        }
        i = close + 1;
        continue;
      }
    }
    const nextTag = html.indexOf('<', i);
    const text = html.slice(i, nextTag === -1 ? len : nextTag);
    if (text.trim()) {
      if (stack.length) {
        const parent = stack[stack.length - 1];
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push({ type: 'text', text });
        }
      } else {
        nodes.push({ type: 'text', text });
      }
    }
    i = nextTag === -1 ? len : nextTag;
  }
  while (stack.length) {
    const node = stack.pop();
    if (stack.length) {
      const parent = stack[stack.length - 1];
      if (parent && node) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
    } else if (node) {
      nodes.push(node);
    }
  }
  return nodes;
};

const toPug = (nodes: Node[], indent = 0): string => {
  const pad = (n: number) => '  '.repeat(n);
  let out = '';
  for (const node of nodes) {
    if (node.type === 'comment') {
      out += pad(indent) + node.text + '\n';
    } else if (node.type === 'text') {
      if (node.text) {
        const lines = node.text
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        for (const l of lines) {
          out += pad(indent) + '| ' + l + '\n';
        }
      }
    } else if (node.type === 'element') {
      let line = pad(indent) + node.tag;
      if (node.attrs) {
        line += '(' + node.attrs.replace(/\s+/g, ' ').trim() + ')';
      }
      out += line + '\n';
      if (node.children && node.children.length) {
        out += toPug(node.children, indent + 1);
      }
    }
  }
  return out;
};

/**
 * Converts a SFC HTML template to Pug (robust, preserves comments, slots, etc)
 * @param html HTML to convert
 * @returns Pug string
 */
export const convertContent = (html: string): string => {
  const ast = parseHtml(html);
  return toPug(ast).trim();
};
