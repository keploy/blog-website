"use client";
import { useEffect } from "react";

// Required when app/ directory is present alongside pages/.
// Without this file, any unmatched App Router path (e.g. localhost:3000/ outside
// the basePath) shows a blank "__next_error__" screen instead of a proper page.
//
// redirect() from next/navigation cannot be used here because not-found boundaries
// run after the error has already been thrown. A client-side redirect is the
// correct pattern for this boundary.
export default function NotFound() {
  useEffect(() => {
    // Redirect to the Pages Router 404 page which has the full blog layout.
    // basePath /blog is not prepended by window.location — use the full path.
    window.location.replace("/blog/404");
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <p>Page not found — redirecting...</p>
    </div>
  );
}
