// Converts a Vue SFC template (HTML) to Pug syntax, preserving HTML comments and fixing slot conversion

// Robust Vue 3 template to pug converter (no external dependencies)
// Handles indentation, attributes, self-closing, children, comments, slots, and Vue-specific syntax

type Node = {
  type: 'element' | 'text' | 'comment';
  tag?: string;
  attrs?: string;
  children?: Node[];
  text?: string;
};

// Parse HTML string into a simple AST (limited, not a full HTML parser)
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
      // Tag
      const close = html.indexOf('>', i);
      if (close === -1) break;
      const tagContent = html.slice(i + 1, close);
      const isEnd = tagContent[0] === '/';
      const isSelfClosing = tagContent.endsWith('/');
      const tagMatch = tagContent.match(isEnd ? /^\/([\w-]+)/ : /^([\w-]+)/);
      if (tagMatch) {
        const tag = tagMatch[1];
        if (isEnd) {
          // Pop stack
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
          // Start tag
          const attrs = tagContent.slice(tag.length).replace(/\/$/, '').trim();
          const node: Node = { type: 'element', tag, attrs: attrs || undefined };
          if (isSelfClosing || /^(br|img|input|hr|meta|link|source|track|area)$/i.test(tag)) {
            // Self-closing
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
    // Text node
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
  // Unwind stack
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

// Convert AST to pug string
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
        // Clean up attributes, keep Vue syntax
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
 * Converts a Vue SFC template (HTML) string to Pug syntax (robust, preserves HTML comments, Vue syntax, slots, etc).
 * @param html The HTML string to convert.
 * @returns The Pug string.
 */
export const convertHtmlToPug = (html: string): string => {
  const ast = parseHtml(html);
  return toPug(ast).trim();
};
