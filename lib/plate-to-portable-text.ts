/**
 * Converts Plate.js editor value (Slate JSON) to Sanity Portable Text.
 *
 * Plate/Slate format:
 *   [{ type: 'p', children: [{ text: 'hello', bold: true }] }]
 *
 * Portable Text format:
 *   [{ _type: 'block', style: 'normal', _key: 'k1',
 *      children: [{ _type: 'span', _key: 'k2', text: 'hello', marks: ['strong'] }],
 *      markDefs: [] }]
 */

interface SlateNode {
  type?: string;
  text?: string;
  children?: SlateNode[];
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  url?: string;
  alt?: string;
  caption?: string;
  listStyleType?: string;
  indent?: number;
  [key: string]: unknown;
}

interface PTBlock {
  _type: 'block';
  _key: string;
  style: string;
  children: PTSpan[];
  markDefs: PTMarkDef[];
  listItem?: 'bullet' | 'number';
  level?: number;
}

interface PTSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}

interface PTMarkDef {
  _type: 'link';
  _key: string;
  href: string;
}

interface PTImage {
  _type: 'image';
  _key: string;
  asset: { _type: 'reference'; _ref: string };
  alt?: string;
  caption?: string;
}

type PTNode = PTBlock | PTImage | { _type: string; _key: string; [key: string]: unknown };

let counter = 0;
function key(): string {
  return `k${++counter}`;
}

const TYPE_TO_STYLE: Record<string, string> = {
  p: 'normal',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  blockquote: 'blockquote',
};

const MARK_MAP: Record<string, string> = {
  bold: 'strong',
  italic: 'em',
  underline: 'underline',
  strikethrough: 'strike-through',
  code: 'code',
};

function convertTextNode(
  node: SlateNode,
  markDefs: PTMarkDef[],
): PTSpan {
  const marks: string[] = [];
  for (const [slateKey, ptMark] of Object.entries(MARK_MAP)) {
    if (node[slateKey]) marks.push(ptMark);
  }
  return {
    _type: 'span',
    _key: key(),
    text: node.text || '',
    marks,
  };
}

function convertInlineChildren(
  children: SlateNode[],
  markDefs: PTMarkDef[],
): PTSpan[] {
  const spans: PTSpan[] = [];

  for (const child of children) {
    // Text leaf
    if (child.text !== undefined) {
      spans.push(convertTextNode(child, markDefs));
      continue;
    }

    // Inline link
    if (child.type === 'a') {
      const linkKey = key();
      markDefs.push({ _type: 'link', _key: linkKey, href: child.url || '' });
      const innerChildren = child.children || [];
      for (const inner of innerChildren) {
        if (inner.text !== undefined) {
          const span = convertTextNode(inner, markDefs);
          span.marks.push(linkKey);
          spans.push(span);
        }
      }
      continue;
    }

    // Other inline — extract text
    if (child.children) {
      spans.push(...convertInlineChildren(child.children, markDefs));
    }
  }

  return spans;
}

function convertNode(node: SlateNode): PTNode[] {
  const nodes: PTNode[] = [];

  // Horizontal rule
  if (node.type === 'hr') {
    nodes.push({
      _type: 'block',
      _key: key(),
      style: 'normal',
      children: [{ _type: 'span', _key: key(), text: '---', marks: [] }],
      markDefs: [],
    });
    return nodes;
  }

  // Image
  if (node.type === 'img') {
    const imageWidth = node.width ? (node.width as number) : undefined;
    if (node.sanityAssetId) {
      // Already uploaded to Sanity — use asset reference directly
      nodes.push({
        _type: 'image',
        _key: key(),
        asset: { _type: 'reference', _ref: node.sanityAssetId as string },
        alt: (node.alt as string) || undefined,
        caption: (node.caption as string) || undefined,
        width: imageWidth,
      } as unknown as PTNode);
    } else {
      // URL-only image — needs upload during approval
      nodes.push({
        _type: 'image',
        _key: key(),
        _imageUrl: node.url || '',
        alt: node.alt || '',
        caption: node.caption || '',
        width: imageWidth,
      } as PTNode);
    }
    return nodes;
  }

  // Block elements (paragraph, headings, blockquote)
  const style = TYPE_TO_STYLE[node.type || 'p'] || 'normal';
  const markDefs: PTMarkDef[] = [];
  const children = convertInlineChildren(node.children || [], markDefs);

  // Ensure at least one span
  if (children.length === 0) {
    children.push({ _type: 'span', _key: key(), text: '', marks: [] });
  }

  const block: PTBlock = {
    _type: 'block',
    _key: key(),
    style,
    children,
    markDefs,
  };

  // Indent-based lists
  if (node.listStyleType === 'disc' || node.listStyleType === 'decimal') {
    block.listItem = node.listStyleType === 'disc' ? 'bullet' : 'number';
    block.level = (node.indent as number) || 1;
  }

  nodes.push(block);
  return nodes;
}

/**
 * Convert a Plate/Slate value array to Sanity Portable Text blocks.
 */
export function plateToPortableText(value: SlateNode[]): PTNode[] {
  counter = 0;
  const blocks: PTNode[] = [];

  for (const node of value) {
    blocks.push(...convertNode(node));
  }

  return blocks;
}
