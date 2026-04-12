// Required when app/ directory is present alongside pages/.
// Without this file, any unmatched App Router path shows a blank
// "__next_error__" shell instead of a usable page.
//
// IMPORTANT: Do NOT call redirect() here — causes an infinite loop.
// redirect('/404') is an RSC soft-navigation; since /404 has no App Router
// page, the router calls this boundary again forever.
//
// Header and NotFoundPage previously used useRouter() from next/router.
// Those components now use usePathname() from next/navigation so they work
// in both Pages Router and App Router contexts.
import { getAllPostsForTechnology, getAllPostsForCommunity } from "../lib/api";
import NotFoundPage from "../components/NotFoundPage";

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
    // Posts are decorative — render without them rather than showing blank screen.
  }

  return (
    <NotFoundPage
      latestPosts={latestPosts}
      communityPosts={communityPosts}
      technologyPosts={technologyPosts}
    />
  );
}
