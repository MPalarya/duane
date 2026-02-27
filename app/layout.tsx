import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const isClerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isClerkConfigured) {
    return children;
  }

  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
