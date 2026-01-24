"use client";

import { useBookmarks } from "../hooks/useBookmarks";

type Props = {
  slug: string;
};

export default function BookmarkButton({ slug }: Props) {
  const { toggleBookmark, isBookmarked } = useBookmarks();

  return (
    <button
      onClick={() => toggleBookmark(slug)}
      aria-label="Bookmark post"
      style={{
        cursor: "pointer",
        border: "none",
        background: "transparent",
        fontSize: "18px",
      }}
    >
      {isBookmarked(slug) ? "★ Saved" : "☆ Save"}
    </button>
  );
}
