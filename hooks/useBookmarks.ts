import { useEffect, useState } from "react";

const STORAGE_KEY = "keploy-blog-bookmarks";

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch {
        setBookmarks([]);
      }
    }
  }, []);

  const toggleBookmark = (slug: string) => {
    const updated = bookmarks.includes(slug)
      ? bookmarks.filter((s) => s !== slug)
      : [...bookmarks, slug];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setBookmarks(updated);
  };

  const isBookmarked = (slug: string) => bookmarks.includes(slug);

  return { bookmarks, toggleBookmark, isBookmarked };
};
