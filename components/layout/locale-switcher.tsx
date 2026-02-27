'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/lib/i18n/navigation';
import { locales, localeNames, type Locale } from '@/lib/i18n/config';

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: Locale) {
    router.replace(pathname, { locale: newLocale });
  }

  // Simple toggle between available locales
  const otherLocale = locales.find((l) => l !== locale) as Locale;

  return (
    <button
      onClick={() => switchLocale(otherLocale)}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-100 hover:text-warm-900"
      aria-label={`Switch to ${localeNames[otherLocale]}`}
    >
      {localeNames[otherLocale]}
    </button>
  );
}
