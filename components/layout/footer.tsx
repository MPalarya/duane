import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-warm-200 bg-warm-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-900">
              About this site
            </h3>
            <p className="mt-3 text-sm text-warm-500">A free, open-source resource built by and for the Duane Syndrome community.</p>
            <p className="mt-2 text-sm font-medium text-primary-600">
              Empowering the Duane Syndrome community worldwide
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-900">
              Quick Links
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-warm-500 hover:text-primary-600">
                  About Duane
                </Link>
              </li>
              <li>
                <Link href="/specialists" className="text-sm text-warm-500 hover:text-primary-600">
                  Specialists
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-sm text-warm-500 hover:text-primary-600">
                  Research
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-warm-500 hover:text-primary-600">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-900">
              Tools
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/tools/gaze-simulator" className="text-sm text-warm-500 hover:text-primary-600">
                  Gaze Simulator
                </Link>
              </li>
              <li>
                <Link href="/tools/screening" className="text-sm text-warm-500 hover:text-primary-600">
                  Screening Tool
                </Link>
              </li>
              <li>
                <Link href="/community/blog" className="text-sm text-warm-500 hover:text-primary-600">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm text-warm-500 hover:text-primary-600">
                  Contribute
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-900">
              Legal
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <span className="text-sm text-warm-500">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-sm text-warm-500">
                  Terms of Use
                </span>
              </li>
              <li>
                <span className="text-sm text-warm-500">
                  Contact
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-warm-200 pt-8 text-center">
          <p className="text-sm text-warm-400">
            &copy; {new Date().getFullYear()} Duane Syndrome Portal. Open source.
          </p>
        </div>
      </div>
    </footer>
  );
}
