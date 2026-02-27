import { PortableText as BasePortableText, type PortableTextComponents, type PortableTextProps as BasePortableTextProps } from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity/image';

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) return null;
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(800).url()}
            alt={value.alt || ''}
            width={800}
            height={450}
            className="rounded-lg"
          />
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
