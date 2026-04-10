import { redirect } from "next/navigation";

// Required when app/ directory is present alongside pages/.
// Without this file, any unmatched App Router path (e.g. localhost:3000/ outside
// the basePath) shows a blank "__next_error__" screen instead of a proper page.
//
// redirect('/404') issues a server-side HTTP redirect before any HTML is sent.
// Next.js automatically prepends basePath, so '/404' becomes '/blog/404' in production.
// This is faster and more reliable than a client-side window.location approach,
// and the tests see the actual 404 page content immediately after navigation.
export default function NotFound() {
  redirect("/404");
}
