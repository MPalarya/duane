'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { LocaleSwitcher } from './locale-switcher';

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  const navItems = [
    { href: '/about', label: t('about') },
    { href: '/blog', label: t('blog') },
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
    <header className="sticky top-0 z-50 border-b border-warm-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold text-primary-700 transition-colors hover:text-primary-800"
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
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-warm-600 hover:bg-warm-50 hover:text-warm-900'
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
            <button
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname.startsWith('/tools')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-warm-600 hover:bg-warm-50 hover:text-warm-900'
              }`}
            >
              {t('tools')} <span className="text-xs">▾</span>
            </button>
            {toolsOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-warm-200 bg-white py-1 shadow-lg">
                {toolItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      pathname === item.href
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-warm-600 hover:bg-warm-50 hover:text-warm-900'
                    }`}
                    onClick={() => setToolsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <LocaleSwitcher />
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-warm-600 hover:bg-warm-50"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="border-t border-warm-200 bg-white px-4 py-2 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-warm-600 hover:bg-warm-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="my-1 border-t border-warm-100" />
          <p className="px-3 py-1 text-xs font-semibold uppercase text-warm-400">{t('tools')}</p>
          {toolItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                pathname === item.href
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-warm-600 hover:bg-warm-50'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
