'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

/**
 * Reads the Clerk user's primary email. Only works inside ClerkProvider.
 */
function ClerkEmailReader({ onEmail }: { onEmail: (email: string) => void }) {
  const { user } = useUser();

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) onEmail(email);
  }, [user, onEmail]);

  return null;
}

/**
 * Component that prefills a callback with the logged-in Clerk user's email.
 * Renders nothing. Silently does nothing when Clerk is not configured.
 */
export function ClerkEmailPrefill({ onEmail }: { onEmail: (email: string) => void }) {
  if (!isClerkConfigured) return null;
  return <ClerkEmailReader onEmail={onEmail} />;
}
