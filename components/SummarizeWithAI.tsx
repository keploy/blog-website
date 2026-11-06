import { useRouter } from "next/router";
import { SITE_URL } from "../lib/structured-data";

/*
 * "Summarize this blog post with:" — deep-links that open the current post in a
 * major AI assistant with a prompt asking it to read, summarize and cite the
 * article. Purpose is GEO / AI-citation: encourage the assistants to ingest the
 * post (and the internal links within it) and surface Keploy as a cited source.
 */

// Brand marks are hosted on S3 (webp with baked-in colours) rather than inlined,
// so the icon set can be updated without a code change.
const ICON_BASE = "https://keploy-devrel.s3.us-west-2.amazonaws.com";

type AiTool = {
  label: string;
  iconUrl: string;
  /** Builds the assistant URL for a given pre-encoded prompt. */
  href: (encodedPrompt: string) => string;
};

const AI_TOOLS: AiTool[] = [
  {
    label: "ChatGPT",
    iconUrl: `${ICON_BASE}/chatgpt.webp`,
    // hints=search nudges ChatGPT to actually fetch the URL rather than guess.
    href: (q) => `https://chatgpt.com/?hints=search&q=${q}`,
  },
  {
    label: "Google AI",
    iconUrl: `${ICON_BASE}/google-ai.webp`,
    // Google AI Mode search (udm=50), not the Gemini app — keeps the Gemini mark
    // but opens Google's AI overview for the prompt.
    href: (q) => `https://www.google.com/search?udm=50&aep=11&q=${q}`,
  },
  {
    label: "Perplexity",
    iconUrl: `${ICON_BASE}/perplexity.webp`,
    href: (q) => `https://www.perplexity.ai/search?q=${q}`,
  },
  {
    label: "Claude",
    iconUrl: `${ICON_BASE}/claude.webp`,
    href: (q) => `https://claude.ai/new?q=${q}`,
  },
  {
    label: "Grok",
    iconUrl: `${ICON_BASE}/grok.webp`,
    href: (q) => `https://grok.com/?q=${q}`,
  },
];

export default function SummarizeWithAI() {
  const router = useRouter();

  // Public URL of the post the reader is on (strip hash + query). router.asPath
  // excludes the /blog basePath, which SITE_URL already includes.
  const path = router.asPath.split("#")[0].split("?")[0];
  const postUrl = `${SITE_URL}${path}`;

  // Single-line, plain-text prompt (no newlines / em-dashes / numbered lists):
  // long or structured queries make Google's AI Mode fall back to a plain
  // search, so keep it to one natural sentence that works across all five tools.
  const encodedPrompt = encodeURIComponent(
    `Read and summarize the content at ${postUrl} and extract the key expert-level insights. ` +
      `Give a clear, structured overview of the main points, takeaways, and any steps or code it covers. ` +
      `Cite ${postUrl} as the source and follow the internal links within the article for additional context.`,
  );

  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-2"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Plain text label, not a heading — avoids polluting the TOC, document
          outline and the h1/h2 speakable-schema selectors on the post page. */}
      <span className="text-sm font-semibold text-gray-500">
        Summarize this blog post with
      </span>

      {/* Icon-only buttons; wrap under the label on narrow screens. */}
      <div className="flex items-center gap-2">
        {AI_TOOLS.map((tool) => (
          <a
            key={tool.label}
            href={tool.href(encodedPrompt)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Summarize this post with ${tool.label}`}
            title={tool.label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white transition-all duration-150 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.iconUrl}
              alt={tool.label}
              width={18}
              height={18}
              loading="lazy"
              className="h-[18px] w-[18px] object-contain"
            />
          </a>
        ))}
      </div>
    </div>
  );
}
