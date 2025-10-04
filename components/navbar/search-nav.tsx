import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { getAllPosts } from "../../lib/api"; // fetch all posts
import { after } from "node:test";

export function SearchNav() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [searchBoxOpen, setSearchBoxOpen] = useState(false);

  const handleSearch = async () => {
    const data = await getAllPosts();
    console.log(data);
    setPosts(data.edges.map((edge: any) => edge.node));
  };

  useEffect(() => {
    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchBoxOpen((prev) => !prev);
        console.log("You just pressed Control + K!");
      }
      if (event.key === "Escape") {
        setSearchBoxOpen(false);
      }
    };

    window.addEventListener("keydown", keyDownHandler);
    return () => {
      window.removeEventListener("keydown", keyDownHandler);
    };
  }, []);

  useEffect(() => {
    handleSearch();
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fuse = new Fuse(posts, {
      keys: ["title", "author.node.name", "categories.edges.node.name"],
      threshold: 0.4,
    });

    const searchResults = fuse.search(query).map((res) => res.item);
    setResults(searchResults);
  }, [query, posts]);

  return (
    <div className="relative flex flex-col justify-center items-center">
      <button
        onClick={() => setSearchBoxOpen(true)}
        className="px-3 py-2 border border-gray-400 rounded-md hover:border-orange-300 bg-transparent"
      >
        Search <span className="text-gray-500 ml-1">Ctrl K</span>
      </button>

      {searchBoxOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-70 p-10">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                onClick={() => setSearchBoxOpen(false)}
                className="ml-3 text-gray-600 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 && query ? (
                <p className="text-gray-500">No results found.</p>
              ) : (
                <ul className="space-y-2">
                  {results.map((post: any) => (
                    <li
                      key={post.slug}
                      className="p-2 border-b hover:bg-orange-50 rounded"
                    >
                      <a href={`/posts/${post.slug}`} className="block">
                        <h3 className="font-semibold text-gray-900">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {post.author?.node?.name} •{" "}
                          {post.categories?.edges
                            ?.map((c: any) => c.node.name)
                            .join(", ")}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
