"use client";

import * as React from "react";
import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "./ui/command";
import { Button } from "./ui/button";
import Link from "next/link";
import { Search } from "lucide-react";

type SearchItem = {
  title: string;
  slug: string;
  author: string;
  tags: string[];
  categories: string[];
  isCommunity: boolean;
};

export default function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onDown);
    return () => window.removeEventListener("keydown", onDown);
  }, []);

  useEffect(() => {
    if (!open || items.length) return;
    setLoading(true);
    const controller = new AbortController();
    let isMounted = true;

    fetch("/api/search-index", { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        setItems(data.items || []);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          // eslint-disable-next-line no-console
          console.error(err);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [open, items.length]);

  const fuse = useMemo(() => {
    return new Fuse(items, {
      keys: [
        { name: "title", weight: 0.6 },
        { name: "author", weight: 0.3 },
        { name: "tags", weight: 0.3 },
      ],
      includeScore: true,
      threshold: 0.35,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [items]);

  const results = useMemo(() => {
    if (!query) return items.slice(0, 10).map((item) => ({ item, score: 0 }));
    return fuse.search(query).slice(0, 20);
  }, [fuse, items, query]);

  const buttonClasses =
    "inline-flex items-center gap-2 h-9 px-3 rounded-md border bg-white text-sm text-zinc-600 hover:bg-zinc-100 transition";

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={buttonClasses}
        onClick={() => setOpen(true)}
        aria-label="Search"
      >
        <Search className="h-4 w-4 text-zinc-600" />
        <span className="hidden md:inline">Search</span>
        <kbd className="ml-2 hidden md:inline rounded border bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-500">
          ⌘ K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder={loading ? "Loading index..." : "Search by title, tag, or author"}
        />
        <CommandList>
          <CommandEmpty>{loading ? "Loading..." : "No results found."}</CommandEmpty>

          {results.length > 0 && (
            <>
              <CommandGroup heading="Results">
                {results.map(({ item }) => {
                  const href = `${item.isCommunity ? "/community" : "/technology"}/${item.slug}`;
                  return (
                    <CommandItem key={item.slug} className="flex flex-col items-start">
                      <Link href={href} className="w-full">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium text-black" dangerouslySetInnerHTML={{ __html: item.title }} />
                          <span className="text-[11px] text-zinc-500">{item.isCommunity ? "community" : "technology"}</span>
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {item.author}
                          {item.tags?.length ? ` • ${item.tags.slice(0, 3).join(", ")}` : ""}
                        </div>
                      </Link>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}


