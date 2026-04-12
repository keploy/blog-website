// Required by Next.js App Router. Every app/ directory MUST have a root layout
// and it MUST include <html> and <body> — Next.js 14 will not inject them
// automatically, and the App Router runtime crashes on root path without them
// (causing a blank screen on localhost:3000/).
//
// Global CSS is imported here so App Router pages (e.g. not-found.tsx) get
// Tailwind and site styles. Pages Router routes continue to load CSS via
// pages/_app.tsx as before — importing the same file twice is fine (deduped).
import "../styles/index.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
