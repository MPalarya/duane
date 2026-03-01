'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

const isClerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
);

export function LoginTracker() {
  if (!isClerkConfigured) return null;
  return <LoginTrackerInner />;
}

function LoginTrackerInner() {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (sessionStorage.getItem('ds_login_tracked')) return;

    sessionStorage.setItem('ds_login_tracked', '1');
    fetch('/api/track-login', { method: 'POST' }).catch(() => {});
  }, [isLoaded, isSignedIn]);

  return null;
}
