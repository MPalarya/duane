'use client';

import { useCallback, useRef, useState } from 'react';
import type { Value } from 'platejs';
import {
  Plate,
  PlateContent,
  PlateElement,
  PlateLeaf,
  usePlateEditor,
  useEditorRef,
  useEditorSelector,
  type PlateElementProps,
  type PlateLeafProps,
} from 'platejs/react';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  BlockquotePlugin,
  H2Plugin,
  H3Plugin,
  HorizontalRulePlugin,
} from '@platejs/basic-nodes/react';
import { LinkPlugin } from '@platejs/link/react';
import { ImagePlugin } from '@platejs/media/react';
import { ListPlugin } from '@platejs/list/react';
import { toggleList } from '@platejs/list';
import { IndentPlugin } from '@platejs/indent/react';
import { KEYS } from 'platejs';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Minus,
  Loader2,
} from 'lucide-react';

// ─── Element components ───

function H2Element(props: PlateElementProps) {
  return (
    <PlateElement
      as="h2"
      className="mb-3 mt-5 text-2xl font-semibold text-warm-800"
      {...props}
    />
  );
}

function H3Element(props: PlateElementProps) {
  return (
    <PlateElement
      as="h3"
      className="mb-2 mt-4 text-xl font-semibold text-warm-800"
      {...props}
    />
  );
}

function BlockquoteElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="blockquote"
      className="my-4 border-l-4 border-primary-300 bg-primary-50 py-2 pl-4 italic text-warm-600"
      {...props}
    />
  );
}

function HrElement(props: PlateElementProps) {
  return (
    <PlateElement {...props}>
      <hr className="my-6 border-warm-200" />
      {props.children}
    </PlateElement>
  );
}

function LinkElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="a"
      className="text-primary-600 underline decoration-primary-300 hover:text-primary-700 cursor-pointer"
      {...props}
      attributes={{
        ...props.attributes,
        href: (props.element as Record<string, unknown>).url as string,
        target: '_blank',
        rel: 'noopener noreferrer',
      }}
    />
  );
}

function ResizableImage({ src, alt, width: initialWidth }: { src: string; alt: string; width?: number }) {
  const [width, setWidth] = useState(initialWidth || 0);
  const [isResizing, setIsResizing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, direction: 'left' | 'right') => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = imgRef.current?.offsetWidth || 400;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = direction === 'right'
          ? moveEvent.clientX - startXRef.current
          : startXRef.current - moveEvent.clientX;
        const newWidth = Math.max(100, Math.min(startWidthRef.current + delta, 800));
        setWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [],
  );

  return (
    <div
      className="group relative inline-block"
      style={width ? { width: `${width}px` } : undefined}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full rounded-lg"
        draggable={false}
      />
      {/* Resize handles */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'left')}
        className={`absolute left-0 top-0 bottom-0 w-2 cursor-col-resize rounded-l-lg transition-colors ${
          isResizing ? 'bg-primary-400/60' : 'bg-transparent group-hover:bg-primary-300/40'
        }`}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'right')}
        className={`absolute right-0 top-0 bottom-0 w-2 cursor-col-resize rounded-r-lg transition-colors ${
          isResizing ? 'bg-primary-400/60' : 'bg-transparent group-hover:bg-primary-300/40'
        }`}
      />
      {/* Size indicator while resizing */}
      {isResizing && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
          {width}px
        </div>
      )}
      {/* Width badge on hover */}
      {!isResizing && width > 0 && (
        <div className="absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
          {width}px
        </div>
      )}
    </div>
  );
}

function ImageElement(props: PlateElementProps) {
  const editor = useEditorRef();
  const element = props.element as Record<string, unknown> & {
    url?: string;
    alt?: string;
    caption?: string;
    width?: number;
  };
  const { url, alt, caption, width } = element;

  // Persist width changes back to the Plate node
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    // Read current width from the resizable image and save to node
    const img = containerRef.current?.querySelector('img');
    if (!img) return;
    const container = img.closest('[style]') as HTMLElement;
    const currentWidth = container?.offsetWidth;
    if (currentWidth && currentWidth !== width) {
      const path = editor.api.findPath(props.element);
      if (path) {
        editor.tf.setNodes({ width: currentWidth } as Record<string, unknown>, { at: path });
      }
    }
  }, [editor, props.element, width]);

  return (
    <PlateElement {...props}>
      <figure className="my-6" ref={containerRef} onMouseUp={handleMouseUp}>
        {url && (
          <ResizableImage
            src={url as string}
            alt={(alt as string) || ''}
            width={width}
          />
        )}
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-warm-500">
            {caption as string}
          </figcaption>
        )}
      </figure>
      {props.children}
    </PlateElement>
  );
}

function ParagraphElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="p"
      className="mb-3 leading-relaxed text-warm-800"
      {...props}
    />
  );
}

// ─── Leaf components ───

function BoldLeaf(props: PlateLeafProps) {
  return <PlateLeaf as="strong" className="font-semibold" {...props} />;
}

function ItalicLeaf(props: PlateLeafProps) {
  return <PlateLeaf as="em" className="italic" {...props} />;
}

function UnderlineLeaf(props: PlateLeafProps) {
  return <PlateLeaf as="u" className="underline" {...props} />;
}

function StrikethroughLeaf(props: PlateLeafProps) {
  return <PlateLeaf as="s" className="line-through" {...props} />;
}

// ─── Toolbar ───

function ToolbarButton({
  icon,
  title,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent losing editor focus
        onClick();
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        isActive
          ? 'bg-primary-100 text-primary-700'
          : 'text-warm-600 hover:bg-warm-200 hover:text-warm-900'
      }`}
    >
      {icon}
    </button>
  );
}

function ToolbarSeparator() {
  return <div className="mx-1 h-5 w-px bg-warm-200" />;
}

function EditorToolbar() {
  const editor = useEditorRef();

  // Check active marks
  const isBold = useEditorSelector(
    (editor) => {
      const marks = editor.api.marks();
      return marks ? !!marks.bold : false;
    },
    [],
  );
  const isItalic = useEditorSelector(
    (editor) => {
      const marks = editor.api.marks();
      return marks ? !!marks.italic : false;
    },
    [],
  );
  const isUnderline = useEditorSelector(
    (editor) => {
      const marks = editor.api.marks();
      return marks ? !!marks.underline : false;
    },
    [],
  );
  const isStrikethrough = useEditorSelector(
    (editor) => {
      const marks = editor.api.marks();
      return marks ? !!marks.strikethrough : false;
    },
    [],
  );

  const toggleMark = useCallback(
    (mark: string) => {
      editor.tf.toggleMark(mark);
    },
    [editor],
  );

  const toggleBlock = useCallback(
    (type: string) => {
      editor.tf.toggleBlock(type);
    },
    [editor],
  );

  const insertLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (!url) return;

    const text = editor.api.string(editor.selection!) || url;
    editor.tf.insertNodes({
      type: KEYS.link,
      url,
      children: [{ text }],
    });
  }, [editor]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const insertImageByUrl = useCallback(() => {
    const url = window.prompt('Enter image URL:');
    if (!url) return;

    editor.tf.insertNodes({
      type: KEYS.img,
      url,
      children: [{ text: '' }],
    });
  }, [editor]);

  const handleImageUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const result = await uploadImageFile(file);
        if (result) {
          editor.tf.insertNodes({
            type: KEYS.img,
            url: result.url,
            sanityAssetId: result.assetId,
            children: [{ text: '' }],
          });
        }
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImageUpload(file);
      // Reset so the same file can be selected again
      e.target.value = '';
    },
    [handleImageUpload],
  );

  const insertHr = useCallback(() => {
    editor.tf.insertNodes({
      type: KEYS.hr,
      children: [{ text: '' }],
    });
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-warm-200 bg-warm-50/80 px-2 py-1.5">
      <ToolbarButton
        icon={<Bold size={16} />}
        title="Bold (Ctrl+B)"
        isActive={isBold}
        onClick={() => toggleMark(KEYS.bold)}
      />
      <ToolbarButton
        icon={<Italic size={16} />}
        title="Italic (Ctrl+I)"
        isActive={isItalic}
        onClick={() => toggleMark(KEYS.italic)}
      />
      <ToolbarButton
        icon={<Underline size={16} />}
        title="Underline (Ctrl+U)"
        isActive={isUnderline}
        onClick={() => toggleMark(KEYS.underline)}
      />
      <ToolbarButton
        icon={<Strikethrough size={16} />}
        title="Strikethrough"
        isActive={isStrikethrough}
        onClick={() => toggleMark(KEYS.strikethrough)}
      />

      <ToolbarSeparator />

      <ToolbarButton
        icon={<Heading2 size={16} />}
        title="Heading 2"
        onClick={() => toggleBlock(KEYS.h2)}
      />
      <ToolbarButton
        icon={<Heading3 size={16} />}
        title="Heading 3"
        onClick={() => toggleBlock(KEYS.h3)}
      />

      <ToolbarSeparator />

      <ToolbarButton
        icon={<List size={16} />}
        title="Bullet list"
        onClick={() => {
          toggleList(editor, { listStyleType: KEYS.ul });
        }}
      />
      <ToolbarButton
        icon={<ListOrdered size={16} />}
        title="Numbered list"
        onClick={() => {
          toggleList(editor, { listStyleType: KEYS.ol });
        }}
      />
      <ToolbarButton
        icon={<Quote size={16} />}
        title="Blockquote"
        onClick={() => toggleBlock(KEYS.blockquote)}
      />

      <ToolbarSeparator />

      <ToolbarButton
        icon={<LinkIcon size={16} />}
        title="Insert link"
        onClick={insertLink}
      />
      <ToolbarButton
        icon={<ImageIcon size={16} />}
        title="Image from URL"
        onClick={insertImageByUrl}
      />
      <ToolbarButton
        icon={uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
        title="Upload image"
        onClick={() => fileInputRef.current?.click()}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        onChange={onFileSelect}
        className="hidden"
      />
      <ToolbarButton
        icon={<Minus size={16} />}
        title="Horizontal rule"
        onClick={insertHr}
      />
    </div>
  );
}

// ─── Word count ───

function WordCount() {
  const wordCount = useEditorSelector(
    (editor) => {
      const text = editor.api.string([]);
      return text.split(/\s+/).filter(Boolean).length;
    },
    [],
  );
  return <span>{wordCount} words</span>;
}

// ─── Main Editor ───

interface RichEditorProps {
  value?: Value;
  onChange?: (value: Value) => void;
}

const INITIAL_VALUE: Value = [
  { type: 'p', children: [{ text: '' }] },
];

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function EditorWithDrop({ editor }: { editor: NonNullable<ReturnType<typeof usePlateEditor>> }) {
  const [dragOver, setDragOver] = useState(false);

  const insertUploadedImage = useCallback(
    (result: UploadResult) => {
      editor.tf.insertNodes({
        type: KEYS.img,
        url: result.url,
        sanityAssetId: result.assetId,
        children: [{ text: '' }],
      });
    },
    [editor],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      const files = Array.from(e.dataTransfer.files).filter(isImageFile);
      if (files.length === 0) return;

      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      for (const file of files) {
        const result = await uploadImageFile(file);
        if (result) insertUploadedImage(result);
      }
    },
    [insertUploadedImage],
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const files = Array.from(e.clipboardData.files).filter(isImageFile);
      if (files.length === 0) return;

      e.preventDefault();
      for (const file of files) {
        const result = await uploadImageFile(file);
        if (result) insertUploadedImage(result);
      }
    },
    [insertUploadedImage],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onPaste={handlePaste}
      className={`relative ${dragOver ? 'ring-2 ring-primary-300 ring-inset bg-primary-50/30' : ''}`}
    >
      {dragOver && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-primary-50/60">
          <p className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
            Drop image here
          </p>
        </div>
      )}
      <PlateContent
        className="min-h-[450px] px-5 py-4 text-[15px] leading-relaxed text-warm-900 outline-none [&_[data-slate-placeholder]]:!text-warm-400 [&_[data-slate-placeholder]]:!opacity-100"
        placeholder="Start writing your post..."
      />
    </div>
  );
}

interface UploadResult {
  url: string;
  assetId: string;
}

async function uploadImageFile(file: File): Promise<UploadResult | null> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Upload failed');
      return null;
    }
    return { url: data.url, assetId: data.assetId };
  } catch {
    alert('Image upload failed. Please try again.');
    return null;
  }
}

export function RichEditor({ value, onChange }: RichEditorProps) {
  const editor = usePlateEditor({
    plugins: [
      // Marks
      BoldPlugin.withComponent(BoldLeaf),
      ItalicPlugin.withComponent(ItalicLeaf),
      UnderlinePlugin.withComponent(UnderlineLeaf),
      StrikethroughPlugin.withComponent(StrikethroughLeaf),
      // Block elements
      H2Plugin.withComponent(H2Element),
      H3Plugin.withComponent(H3Element),
      BlockquotePlugin.withComponent(BlockquoteElement),
      HorizontalRulePlugin.withComponent(HrElement),
      // Link
      LinkPlugin.withComponent(LinkElement),
      // Image
      ImagePlugin.withComponent(ImageElement),
      // Lists (indent-based)
      IndentPlugin.configure({
        inject: {
          targetPlugins: [KEYS.p, ...KEYS.heading, KEYS.blockquote],
        },
      }),
      ListPlugin.configure({
        inject: {
          targetPlugins: [KEYS.p, ...KEYS.heading, KEYS.blockquote],
        },
      }),
    ],
    value: value || INITIAL_VALUE,
    override: {
      components: {
        [KEYS.p]: ParagraphElement,
      },
    },
  });

  return (
    <div className="overflow-hidden rounded-xl border border-warm-200 bg-white shadow-sm">
      <Plate
        editor={editor}
        onChange={onChange ? ({ value }) => onChange(value) : undefined}
      >
        <EditorToolbar />
        <EditorWithDrop editor={editor} />
        <div className="flex items-center justify-between border-t border-warm-100 bg-warm-50/50 px-4 py-2 text-xs text-warm-400">
          <span>Tip: Ctrl+B bold, Ctrl+I italic, Ctrl+U underline | Drop or paste images</span>
          <WordCount />
        </div>
      </Plate>
    </div>
  );
}

/**
 * Serialize Plate value (Slate JSON) to HTML for storage.
 */
export function plateValueToHtml(value: Value): string {
  function serializeChildren(children: unknown[]): string {
    return children.map((child) => serializeNode(child as Record<string, unknown>)).join('');
  }

  function serializeNode(node: Record<string, unknown>): string {
    // Text node
    if (node.text !== undefined) {
      let text = escapeHtml(node.text as string);
      if (node.bold) text = `<strong>${text}</strong>`;
      if (node.italic) text = `<em>${text}</em>`;
      if (node.underline) text = `<u>${text}</u>`;
      if (node.strikethrough) text = `<s>${text}</s>`;
      return text;
    }

    const children = serializeChildren((node.children as unknown[]) || []);

    switch (node.type) {
      case 'h1':
        return `<h1>${children}</h1>`;
      case 'h2':
        return `<h2>${children}</h2>`;
      case 'h3':
        return `<h3>${children}</h3>`;
      case 'blockquote':
        return `<blockquote>${children}</blockquote>`;
      case 'hr':
        return '<hr />';
      case 'a':
        return `<a href="${escapeHtml((node.url as string) || '')}">${children}</a>`;
      case 'img': {
        const imgWidth = node.width ? ` style="width:${node.width}px;max-width:100%"` : '';
        return `<img src="${escapeHtml((node.url as string) || '')}" alt="${escapeHtml((node.alt as string) || '')}"${imgWidth} />`;
      }
      case 'p':
      default: {
        // Handle indent-based lists
        if (node.listStyleType === 'disc' || node.listStyleType === 'decimal') {
          const tag = node.listStyleType === 'disc' ? 'ul' : 'ol';
          return `<${tag}><li>${children}</li></${tag}>`;
        }
        return `<p>${children}</p>`;
      }
    }
  }

  return value.map((node) => serializeNode(node as Record<string, unknown>)).join('\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
