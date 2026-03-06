import { useTranslations } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  return (
    <footer className="border-t border-warm-200 bg-warm-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-900">
              {t('about')}
            </h3>
            <p className="mt-3 text-sm text-warm-500">{t('aboutText')}</p>
            <p className="mt-2 text-sm font-medium text-primary-600">
              {t('tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-900">
              {t('quickLinks')}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-warm-500 hover:text-primary-600">
                  {nav('about')}
                </Link>
              </li>
              <li>
                <Link href="/specialists" className="text-sm text-warm-500 hover:text-primary-600">
                  {nav('specialists')}
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-sm text-warm-500 hover:text-primary-600">
                  {nav('research')}
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-warm-500 hover:text-primary-600">
                  {nav('community')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-900">
              {nav('tools')}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/tools/gaze-simulator" className="text-sm text-warm-500 hover:text-primary-600">
                  {nav('gazeSimulator')}
                </Link>
              </li>
              <li>
                <Link href="/tools/screening" className="text-sm text-warm-500 hover:text-primary-600">
                  {nav('screening')}
                </Link>
              </li>
              <li>
                <Link href="/community/blog" className="text-sm text-warm-500 hover:text-primary-600">
                  {nav('blog')}
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm text-warm-500 hover:text-primary-600">
                  {nav('submit')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-900">
              {t('legal')}
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-warm-500">
                  {t('privacy')}
                </span>
              </li>
              <li>
                <span className="text-sm text-warm-500">
                  {t('terms')}
                </span>
              </li>
              <li>
                <span className="text-sm text-warm-500">
                  {t('contact')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-warm-200 pt-8 text-center">
          <p className="text-sm text-warm-400">
            &copy; {new Date().getFullYear()} {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
