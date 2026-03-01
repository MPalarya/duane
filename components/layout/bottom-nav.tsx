'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/lib/i18n/navigation';
import { Home, BookOpen, Users, Wrench, User } from 'lucide-react';

const tabs = [
  { href: '/' as const, icon: Home, labelKey: 'home' },
  { href: '/blog' as const, icon: BookOpen, labelKey: 'blog' },
  { href: '/community' as const, icon: Users, labelKey: 'community' },
  { href: '/tools/gaze-simulator' as const, icon: Wrench, labelKey: 'tools' },
  { href: '/community/mentors' as const, icon: User, labelKey: 'profile' },
] as const;

export function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label={t('mobileNavLabel')}
      className="fixed bottom-0 inset-x-0 z-50 border-t border-warm-300 bg-white/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === '/'
              ? pathname === '/'
              : pathname === tab.href || pathname.startsWith(tab.href + '/');
          const Icon = tab.icon;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-primary-800'
                    : 'text-warm-500 hover:text-primary-700'
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span>{t(tab.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
