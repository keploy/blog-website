export type AuthorCounts = Record<string, number>;

function normalizeName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(",").join(" ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .trim();
}

// Accepts edges: { node: { ppmaAuthorName: string } }[]; returns counts keyed by normalized display name
export function calculateAuthorPostCounts(edges: Array<{ node: { ppmaAuthorName?: string } }>): AuthorCounts {
  const counts: AuthorCounts = {};
  if (!Array.isArray(edges)) return counts;

  edges.forEach(({ node }) => {
    const raw = (node?.ppmaAuthorName || "").trim();
    if (!raw) return;

    if (raw.includes(",")) {
      raw.split(",").forEach((token) => {
        const norm = normalizeName(token);
        if (!norm) return;
        counts[norm] = (counts[norm] || 0) + 1;
      });
    } else {
      const norm = normalizeName(raw);
      if (!norm) return;
      counts[norm] = (counts[norm] || 0) + 1;
    }
  });

  return counts;
}

export { normalizeName };
