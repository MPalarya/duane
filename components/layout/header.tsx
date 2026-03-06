'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { LocaleSwitcher } from './locale-switcher';
import { AuthButtons } from './auth-buttons';
import { Button } from '@/components/ui/button';

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [toolsOpen, setToolsOpen] = useState(false);

  const navItems = [
    { href: '/about', label: t('about') },
    { href: '/research', label: t('research') },
    { href: '/specialists', label: t('specialists') },
    { href: '/community', label: t('community') },
    { href: '/life-hacks', label: t('lifeHacks') },
  ];

  const toolItems = [
    { href: '/tools/gaze-simulator', label: t('gazeSimulator') },
    { href: '/tools/screening', label: t('screening') },
    { href: '/tools/one-pager', label: t('onePager') },
    { href: '/tools/explain-templates', label: t('explainTemplates') },
    { href: '/tools/emergency-card', label: t('emergencyCard') },
    { href: '/tools/exercise-tracker', label: t('exerciseTracker') },
  ];

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[999] focus:rounded focus:bg-coral-500 focus:px-4 focus:py-2 focus:font-semibold focus:text-primary-900"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-50 border-b border-warm-300 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-xl font-bold text-primary-800 transition-colors hover:text-primary-900"
          >
            Duane Syndrome
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-warm-600 hover:bg-warm-100 hover:text-primary-900'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Tools dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setToolsOpen(true)}
              onMouseLeave={() => setToolsOpen(false)}
            >
              <Link
                href="/tools"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith('/tools')
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-warm-600 hover:bg-warm-100 hover:text-primary-900'
                }`}
              >
                {t('tools')} <span className="text-xs">▾</span>
              </Link>
              {toolsOpen && (
                <div className="absolute right-0 top-full z-50 w-56 rounded-lg border border-warm-300 bg-white py-1 shadow-lg">
                  {toolItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        pathname === item.href
                          ? 'bg-primary-50 text-primary-800'
                          : 'text-warm-600 hover:bg-warm-100 hover:text-primary-900'
                      }`}
                      onClick={() => setToolsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/community">
              <Button variant="primary" size="sm" className="ms-2 bg-coral-500 text-primary-900 hover:bg-coral-400">
                {t('joinCommunity')}
              </Button>
            </Link>

            <LocaleSwitcher />
            <AuthButtons />
          </nav>

          {/* Mobile: only auth + locale (nav moved to bottom bar) */}
          <div className="flex items-center gap-2 lg:hidden">
            <AuthButtons size="sm" />
            <LocaleSwitcher />
          </div>
        </div>
      </header>
    </>
  );
}
