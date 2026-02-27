import createMiddleware from 'next-intl/middleware';
import { routing } from '@/lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except api, _next, admin, and static files
    '/((?!api|_next|admin|.*\\..*).*)',
  ],
};
