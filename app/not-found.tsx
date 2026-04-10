// Required when app/ directory is present alongside pages/.
// Without this file, any unmatched App Router path shows a blank
// "__next_error__" shell instead of a usable page.
//
// IMPORTANT: Do NOT call redirect() here. redirect('/404') issues an RSC
// soft-navigation to /blog/404. Because /404 has no App Router page, the
// router calls this boundary again — infinite loop. Even a server-side
// HTTP redirect via redirect() inside not-found.tsx re-enters the App Router
// client on load, finds no route at /404, and loops.
//
// IMPORTANT: Do NOT render <html>/<body> here. app/layout.tsx already wraps
// every App Router page (including this boundary) with <html><body>.
// Rendering them again produces invalid nested HTML that browsers silently
// repair by moving or dropping elements, making them invisible to Playwright.
//
// Instead, render a minimal but complete 404 page inline. All elements
// that NotFoundPage.spec.ts tests for are present:
//   - text matching /404|not found/i
//   - <nav> element
//   - <header> with img[alt="Keploy Logo"]
//   - links to /blog, /blog/technology, /blog/community
//   - no [data-testid="site-footer"]
export default function NotFound() {
  return (
    <>
      <header style={{ padding: "1rem 2rem", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: "1rem" }}>
        <a href="/blog" aria-label="Keploy home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/blog/favicon/Group.png" alt="Keploy Logo" width={100} height={32} style={{ display: "block" }} />
        </a>
        <nav aria-label="Main navigation" style={{ display: "flex", gap: "1.5rem", marginLeft: "auto" }}>
          <a href="/blog" style={{ textDecoration: "none", color: "#111" }}>Home</a>
          <a href="/blog/technology" style={{ textDecoration: "none", color: "#111" }}>Technology</a>
          <a href="/blog/community" style={{ textDecoration: "none", color: "#111" }}>Community</a>
        </nav>
      </header>
      <main style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: 700, color: "#FF6B35" }}>404</h1>
        <p style={{ fontSize: "1.25rem", color: "#444" }}>Page not found</p>
        <p style={{ color: "#888" }}>
          The page you are looking for does not exist.
        </p>
        <a
          href="/blog"
          style={{
            display: "inline-block",
            marginTop: "2rem",
            padding: "0.75rem 2rem",
            background: "#FF6B35",
            color: "#fff",
            borderRadius: "0.375rem",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Go to Home
        </a>
      </main>
    </>
  );
}
