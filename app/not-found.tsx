import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist. Browse our Duane Syndrome resources, specialist directory, and community tools.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-warm-300">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-warm-800">Page not found</h2>
      <p className="mt-3 text-warm-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <nav className="mt-10 w-full max-w-md" aria-label="Suggested pages">
        <p className="mb-4 text-sm font-medium text-warm-400 uppercase tracking-wide">
          Try one of these instead
        </p>
        <ul className="space-y-2">
          {[
            { href: '/', label: 'Home' },
            { href: '/about', label: 'About Duane Syndrome' },
            { href: '/specialists', label: 'Find a Specialist' },
            { href: '/community', label: 'Community' },
            { href: '/research', label: 'Research Papers' },
            { href: '/tools', label: 'Interactive Tools' },
          ].map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-lg border border-warm-200 px-4 py-3 text-warm-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
