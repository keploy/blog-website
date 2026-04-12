// Required when app/ directory is present alongside pages/.
// Without this file, any unmatched App Router path shows a blank
// "__next_error__" shell instead of a usable page.
//
// This file renders a standalone 404 UI (NotFoundClient) — it does NOT redirect.
// redirect() cannot be used here: it is an RSC soft-navigation, not a hard HTTP
// redirect. Since /404 has no App Router page, calling redirect('/404') causes
// the router to invoke this boundary again → infinite loop.
//
// Header/FloatingNavbar/NotFoundPage are intentionally not imported here because
// they use useRouter() from next/router, which throws "NextRouter was not mounted"
// in App Router context. Pages Router components are left completely unchanged.
import { getAllPostsForTechnology, getAllPostsForCommunity } from "../lib/api";
import NotFoundClient from "./not-found-client";

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`NotFound posts fetch timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

export default async function NotFound() {
  let latestPosts     = { edges: [] as any[] };
  let communityPosts  = { edges: [] as any[] };
  let technologyPosts = { edges: [] as any[] };

  try {
    // Posts are decorative; keep the 404 UI fast even if WordPress is slow/hung.
    const [techPosts, commPosts] = await withTimeout(Promise.all([
      getAllPostsForTechnology(false, null),
      getAllPostsForCommunity(false, null),
    ]), 3000);
    const allEdges = [...techPosts.edges, ...commPosts.edges].sort(
      (a, b) => new Date(b.node.date).getTime() - new Date(a.node.date).getTime()
    );
    latestPosts     = { edges: allEdges.slice(0, 6) };
    technologyPosts = { edges: techPosts.edges.slice(0, 6) };
    communityPosts  = { edges: commPosts.edges.slice(0, 6) };
  } catch {
    // Posts are decorative — render without them rather than blank screen.
  }

  return (
    <NotFoundClient
      latestPosts={latestPosts}
      communityPosts={communityPosts}
      technologyPosts={technologyPosts}
    />
  );
}
