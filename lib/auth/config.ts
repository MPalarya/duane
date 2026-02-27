// Auth is handled by Clerk (@clerk/nextjs).
//
// Setup: https://dashboard.clerk.com
// Enable Google + Facebook in: Clerk Dashboard > User & Authentication > Social Connections
//
// Server Components:
//   import { auth, currentUser } from '@clerk/nextjs/server';
//   const { userId } = await auth();
//   const user = await currentUser();
//
// Client Components:
//   import { useUser, SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
