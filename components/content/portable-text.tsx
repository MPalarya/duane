import { PortableText as BasePortableText, type PortableTextComponents, type PortableTextProps as BasePortableTextProps } from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity/image';

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      // Determine image source: Sanity asset ref, direct URL, or placeholder _imageUrl
      let src: string | null = null;
      const customWidth = value?.width as number | undefined;
      if (value?.asset?._ref) {
        src = urlFor(value).width(customWidth || 800).url();
      } else if (value?.url) {
        src = value.url;
      } else if (value?._imageUrl) {
        src = value._imageUrl;
      }

      if (!src) return null;

      const style = customWidth
        ? { width: `${customWidth}px`, maxWidth: '100%' }
        : undefined;

      return (
        <figure className="my-8" style={style}>
          {value?.asset?._ref ? (
            <Image
              src={src}
              alt={value.alt || ''}
              width={customWidth || 800}
              height={customWidth ? Math.round(customWidth * 0.5625) : 450}
              className="rounded-lg"
              style={{ width: '100%', height: 'auto' }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={value.alt || ''}
              className="rounded-lg"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-warm-500">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
  block: {
    h1: ({ children }) => (
      <h1 className="mb-4 mt-8 text-3xl font-bold text-warm-900">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-3 mt-6 text-2xl font-semibold text-warm-800">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-4 text-xl font-semibold text-warm-800">{children}</h3>
    ),
    normal: ({ children }) => (
      <p className="mb-4 text-warm-700 leading-relaxed">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-4 border-l-4 border-primary-300 bg-primary-50 py-2 pl-4 italic text-warm-600">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="text-primary-600 underline decoration-primary-300 hover:text-primary-700"
        target={value?.href?.startsWith('http') ? '_blank' : undefined}
        rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-warm-900">{children}</strong>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc pl-6 text-warm-700">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-decimal pl-6 text-warm-700">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="mb-1">{children}</li>,
    number: ({ children }) => <li className="mb-1">{children}</li>,
  },
};

export function PortableTextContent({ value }: { value: BasePortableTextProps['value'] }) {
  return <BasePortableText value={value} components={components} />;
}
