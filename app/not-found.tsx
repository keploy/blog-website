// Required when app/ directory is present alongside pages/.
// Without this file, any unmatched App Router path shows a blank
// "__next_error__" shell instead of a usable page.
//
// IMPORTANT: Do NOT call redirect() here — infinite loop.
// IMPORTANT: Do NOT import Header/FloatingNavbar/NotFoundPage — they use
// useRouter() from next/router which throws in App Router context.
// Pages Router components are intentionally left unchanged.
import { getAllPostsForTechnology, getAllPostsForCommunity } from "../lib/api";
import NotFoundClient from "./not-found-client";

export default async function NotFound() {
  let latestPosts     = { edges: [] as any[] };
  let communityPosts  = { edges: [] as any[] };
  let technologyPosts = { edges: [] as any[] };

  try {
    const [techPosts, commPosts] = await Promise.all([
      getAllPostsForTechnology(false, null),
      getAllPostsForCommunity(false, null),
    ]);
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
