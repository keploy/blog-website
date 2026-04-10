// Required by Next.js App Router — every project with an app/ directory must have
// a root layout. All real layout (fonts, global CSS, scripts, structured data)
// lives in pages/_app.tsx and pages/_document.tsx, which continue to serve all
// existing pages/ routes unchanged. This layout only applies to routes inside app/.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
