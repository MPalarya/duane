'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FlaskConical, Users, Wrench, User } from 'lucide-react';

const tabs = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/research', icon: FlaskConical, label: 'Research' },
  { href: '/community', icon: Users, label: 'Community' },
  { href: '/tools', icon: Wrench, label: 'Tools' },
  { href: '/community/mentors', icon: User, label: 'Profile' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
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
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
