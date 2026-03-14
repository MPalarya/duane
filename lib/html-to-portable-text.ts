/**
 * Converts HTML (from marked/markdown) to Sanity Portable Text blocks.
 * Handles: headings, paragraphs, lists, blockquotes, images, links, bold, italic, underline.
 */

interface PortableTextBlock {
  _type: 'block';
  _key: string;
  style: string;
  children: PortableTextSpan[];
  markDefs: MarkDef[];
  listItem?: 'bullet' | 'number';
  level?: number;
}

interface PortableTextSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}

interface MarkDef {
  _type: 'link';
  _key: string;
  href: string;
}

interface PortableTextImage {
  _type: 'image';
  _key: string;
  asset: { _type: 'reference'; _ref: string };
  alt?: string;
  caption?: string;
}

type PortableTextNode = PortableTextBlock | PortableTextImage;

let keyCounter = 0;
function genKey(): string {
  return `k${++keyCounter}`;
}

function resetKeys() {
  keyCounter = 0;
}

/**
 * Parse inline HTML content into spans with marks.
 * Handles <strong>, <em>, <u>, <a>, <code>, and nested combinations.
 */
function parseInlineHtml(
  html: string,
  markDefs: MarkDef[]
): PortableTextSpan[] {
  const spans: PortableTextSpan[] = [];

  // Simple regex-based inline parser
  // We'll use a recursive approach with a state machine
  function walk(node: string, activeMarks: string[]): void {
    if (!node) return;

    // Match the first inline tag
    const tagMatch = node.match(
      /^([\s\S]*?)<(strong|b|em|i|u|a|code)(\s[^>]*)?>(.[\s\S]*)$/
    );

    if (!tagMatch) {
      // No more tags — plain text
      if (node) {
        // Decode HTML entities
        const text = decodeEntities(node);
        if (text) {
          spans.push({
            _type: 'span',
            _key: genKey(),
            text,
            marks: [...activeMarks],
          });
        }
      }
      return;
    }

    const [, before, tag, attrs, rest] = tagMatch;

    // Text before the tag
    if (before) {
      const text = decodeEntities(before);
      if (text) {
        spans.push({
          _type: 'span',
          _key: genKey(),
          text,
          marks: [...activeMarks],
        });
      }
    }

    // Find the closing tag
    const closeTag = tag === 'b' ? 'b' : tag === 'i' ? 'i' : tag;
    const closeRegex = new RegExp(`^([\\s\\S]*?)</${closeTag}>([\\s\\S]*)$`);
    const closeMatch = rest.match(closeRegex);

    if (!closeMatch) {
      // No closing tag found — treat as text
      walk(rest, activeMarks);
      return;
    }

    const [, inner, after] = closeMatch;

    // Determine the mark
    let mark: string;
    if (tag === 'strong' || tag === 'b') {
      mark = 'strong';
    } else if (tag === 'em' || tag === 'i') {
      mark = 'em';
    } else if (tag === 'u') {
      mark = 'underline';
    } else if (tag === 'code') {
      mark = 'code';
    } else if (tag === 'a') {
      // Extract href
      const hrefMatch = attrs?.match(/href="([^"]*)"/);
      const href = hrefMatch ? hrefMatch[1] : '#';
      const linkKey = genKey();
      markDefs.push({ _type: 'link', _key: linkKey, href });
      mark = linkKey;
    } else {
      mark = tag;
    }

    // Process inner content with the new mark
    walk(inner, [...activeMarks, mark]);

    // Process content after the closing tag
    walk(after, activeMarks);
  }

  walk(html, []);
  return spans;
}

function decodeEntities(html: string): string {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Convert an HTML string (from marked) to Portable Text blocks.
 */
export function htmlToPortableText(html: string): PortableTextNode[] {
  resetKeys();
  const blocks: PortableTextNode[] = [];

  // Split HTML into block-level elements
  // We process line by line, looking for block tags
  const blockRegex =
    /<(h[1-6]|p|blockquote|ul|ol|li|img|hr)(\s[^>]*)?>[\s\S]*?<\/\1>|<(img|hr)(\s[^>]*)?\/?>|<(ul|ol)>[\s\S]*?<\/\5>/g;

  // First, handle lists specially — extract them as a unit
  const listRegex = /<(ul|ol)>([\s\S]*?)<\/\1>/g;
  const processed = html.replace(listRegex, (match, listType, inner) => {
    const itemRegex = /<li>([\s\S]*?)<\/li>/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(inner)) !== null) {
      const markDefs: MarkDef[] = [];
      const children = parseInlineHtml(itemMatch[1].trim(), markDefs);
      if (children.length === 0) {
        children.push({
          _type: 'span',
          _key: genKey(),
          text: '',
          marks: [],
        });
      }
      blocks.push({
        _type: 'block',
        _key: genKey(),
        style: 'normal',
        listItem: listType === 'ul' ? 'bullet' : 'number',
        level: 1,
        children,
        markDefs,
      });
    }
    return ''; // Remove from further processing
  });

  // Process remaining block elements
  const remaining = processed.trim();
  const elementRegex =
    /<(h[1-6]|p|blockquote)(\s[^>]*)?>(?:<p>)?([\s\S]*?)(?:<\/p>)?<\/\1>|<img(\s[^>]*)?\/?>/g;
  let match;

  while ((match = elementRegex.exec(remaining)) !== null) {
    const [, tag, , inner, imgAttrs] = match;

    if (imgAttrs !== undefined) {
      // Image tag
      const srcMatch = imgAttrs.match(/src="([^"]*)"/);
      const altMatch = imgAttrs.match(/alt="([^"]*)"/);
      if (srcMatch) {
        // Store as image block — will need asset upload during approval
        // For now, store the URL in a way the approval API can process
        blocks.push({
          _type: 'block',
          _key: genKey(),
          style: 'normal',
          children: [
            {
              _type: 'span',
              _key: genKey(),
              text: `![${altMatch?.[1] || ''}](${srcMatch[1]})`,
              marks: [],
            },
          ],
          markDefs: [],
        });
      }
      continue;
    }

    if (!tag) continue;

    const markDefs: MarkDef[] = [];
    const content = inner?.trim() || '';

    // Determine style
    let style: string;
    if (tag.startsWith('h')) {
      style = tag; // h1, h2, h3, etc.
    } else if (tag === 'blockquote') {
      style = 'blockquote';
    } else {
      style = 'normal';
    }

    const children = parseInlineHtml(content, markDefs);
    if (children.length === 0) {
      children.push({
        _type: 'span',
        _key: genKey(),
        text: '',
        marks: [],
      });
    }

    blocks.push({
      _type: 'block',
      _key: genKey(),
      style,
      children,
      markDefs,
    });
  }

  // If no blocks were parsed (plain text), wrap in a paragraph
  if (blocks.length === 0 && html.trim()) {
    const markDefs: MarkDef[] = [];
    blocks.push({
      _type: 'block',
      _key: genKey(),
      style: 'normal',
      children: parseInlineHtml(html.trim(), markDefs),
      markDefs,
    });
  }

  return blocks;
}
