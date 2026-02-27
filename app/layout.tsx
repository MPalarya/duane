import './globals.css';

// This root layout only provides the global CSS import.
// The actual HTML structure is in app/[locale]/layout.tsx.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
