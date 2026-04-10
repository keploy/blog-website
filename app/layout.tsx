// Required by Next.js App Router. Every app/ directory MUST have a root layout
// and it MUST include <html> and <body> — Next.js 14 will not inject them
// automatically, and the App Router runtime crashes on root path without them
// (causing a blank screen on localhost:3000/).
//
// All real layout (fonts, global CSS, analytics, structured data) continues to
// live in pages/_app.tsx and pages/_document.tsx, which serve all pages/ routes
// unchanged. This layout is only reached for routes inside app/ — currently just
// app/sitemap.xml/route.ts, which is a Route Handler (not a rendered page), so
// this layout's <body> is never actually visible to users or crawlers.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
