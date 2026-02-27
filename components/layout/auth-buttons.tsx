'use client';

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

// These components only work inside ClerkProvider.
// When Clerk is not configured, ClerkProvider is not rendered,
// so we check for the publishable key before rendering.
const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export function AuthButtons({ size = 'md' }: { size?: 'sm' | 'md' }) {
  if (!isClerkConfigured) return null;

  const buttonClass = size === 'sm'
    ? 'rounded-md bg-primary-600 px-2 py-1 text-xs font-medium text-white'
    : 'rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700';

  return (
    <>
      <SignedOut>
        <SignInButton>
          <button className={buttonClass}>Sign In</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
