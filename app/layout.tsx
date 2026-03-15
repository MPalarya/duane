import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BottomNav } from '@/components/layout/bottom-nav';
import { ScrollToTop } from '@/components/layout/scroll-to-top';
import { ComingSoonModal } from '@/components/layout/coming-soon-modal';
import { LoginTracker } from '@/components/layout/login-tracker';
import { ClarityInit } from '@/components/layout/clarity-init';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const metadata: Metadata = {
  title: {
    default: 'Duane Syndrome - Global Information & Community Portal',
    template: '%s | Duane Syndrome - Global Information & Community Portal',
  },
  description:
    'Comprehensive resource for Duane Syndrome patients, parents, and friends. Medical information, specialist directory, community support, and interactive tools.',
  metadataBase: new URL('https://duane-syndrome.com'),
  alternates: {
    canonical: 'https://duane-syndrome.com',
  },
  openGraph: {
    title: 'Duane Syndrome - Global Information & Community Portal',
    description:
      'Comprehensive resource for Duane Syndrome patients, parents, and friends. Medical information, specialist directory, community support, and interactive tools.',
    siteName: 'Duane Syndrome Portal',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Duane Syndrome - Global Information & Community Portal',
    description:
      'Comprehensive resource for Duane Syndrome patients, parents, and friends. Medical information, specialist directory, community support, and interactive tools.',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large' as const,
    'max-video-preview': -1,
  },
};

function InnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const inner = (
    <html lang="en" dir="ltr" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  name: 'Duane Syndrome Portal',
                  url: 'https://duane-syndrome.com',
                  logo: 'https://duane-syndrome.com/images/logo.png',
                  description:
                    'Comprehensive resource for Duane Syndrome patients, parents, and friends.',
                },
                {
                  '@type': 'WebSite',
                  name: 'Duane Syndrome Portal',
                  alternateName: ['Duane Syndrome', 'DS Portal'],
                  url: 'https://duane-syndrome.com/',
                },
              ],
            }),
          }}
        />
        <InnerLayout>{children}</InnerLayout>
        <BottomNav />
        <ScrollToTop />
        <ComingSoonModal />
        <LoginTracker />
        <ClarityInit />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );

  if (!isClerkConfigured) {
    return inner;
  }

  return <ClerkProvider>{inner}</ClerkProvider>;
}
