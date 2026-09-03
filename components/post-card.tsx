import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { animated, easings, useSpring } from "@react-spring/web";

export default function PostCard({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity = false,
}: {
  title: Post["title"];
  coverImage: Post["featuredImage"];
  date: Post["date"];
  excerpt: Post["excerpt"];
  author: Post["ppmaAuthorName"];
  slug: Post["slug"];
  isCommunity?: boolean;
}) {
  const basePath = isCommunity ? "/community" : "/technology";
  const cleanedExcerpt = (excerpt || "").replace("Table of Contents", "");

  // Fade in on mount instead of gating visibility on an IntersectionObserver
  // (react-spring useInView). The observer never fired under `next dev`, so
  // cards stayed stuck at opacity 0 / invisible. useSpring runs on mount and
  // always settles at opacity 1, so a misfiring reveal can never leave the
  // content hidden.
  const springStyles = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: {
      duration: 500,
      delay: 100,
      easing: easings.easeInCubic,
    },
  });

  return (
    <animated.div
      data-testid="post-card"
      className="bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 overflow-hidden group"
      style={springStyles}
    >
      <div className="aspect-video overflow-hidden">
        {coverImage && (
          <CoverImage
            title={title}
            coverImage={coverImage}
            slug={slug}
            isCommunity={isCommunity}
            imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            // Grid is 1/2/3 columns (mobile/sm/lg). CoverImage's default sizes
            // assumes a full-width image, so cards fetched an 828px variant for
            // a ~345px slot. Match the grid so next/image serves a right-sized file.
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
      </div>
      <div className="p-6">
        <h3
          className="mb-3 leading-tight"
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: "20px",
            fontWeight: 700,
            color: "rgb(29, 32, 34)",
          }}
        >
          <Link
            href={`${basePath}/${slug}`}
            className="line-clamp-2 hover:text-orange-600 transition-colors duration-200"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </h3>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', color: "rgb(99, 114, 119)" }}>{author ? author : "Anonymous"}</span>
          <span className="text-gray-300">•</span>
          <span className="text-sm" style={{ fontFamily: 'var(--font-dm-sans), sans-serif', color: "rgb(99, 114, 119)" }}>
            <Date dateString={date} />
          </span>
        </div>
        <div
          className="line-clamp-3"
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: "15px",
            lineHeight: "24px",
            color: "rgb(99, 114, 119)",
          }}
          dangerouslySetInnerHTML={{ __html: cleanedExcerpt }}
        />
      </div>
    </animated.div>
  );
}


