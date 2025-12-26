import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Tweets from "../services/Tweets";

/**
 * Number of times to duplicate the tweets array for seamless infinite scroll.
 * IMPORTANT: The animation transform must match this value (calc(-100% / DUPLICATION_COUNT)).
 */
const DUPLICATION_COUNT = 3;

/**
 * Maximum number of entries to keep in the failed avatar cache.
 * This prevents unbounded growth across long-lived sessions.
 */
const MAX_FAILED_AVATAR_CACHE_SIZE = 500;

/**
 * A Set implementation with a maximum size that evicts the oldest entry
 * when the limit is reached. This preserves the Set API while bounding memory.
 * 
 * Design Note: Uses FIFO (first-in, first-out) eviction strategy. For failed
 * avatar URLs, this is acceptable since URLs that fail once typically continue
 * failing, so preserving recently failed entries is sufficient.
 */
class LimitedSet<T> extends Set<T> {
  private readonly maxSize: number;
  constructor(maxSize: number) {
    super();
    this.maxSize = maxSize;
  }
  add(value: T): this {
    if (this.size >= this.maxSize) {
      const first = this.values().next().value as T | undefined;
      if (first !== undefined) {
        this.delete(first);
      }
    }
    return super.add(value);
  }
}

/**
 * Cache for tracking which avatar URLs have failed to load.
 * This ensures consistent fallback rendering across all instances of the same testimonial,
 * while bounding memory usage via a maximum size with eviction.
 */
const failedAvatarCache = new LimitedSet<string>(MAX_FAILED_AVATAR_CACHE_SIZE);

/**
 * Generate initials from a person's name.
 *
 * Behavior:
 * - Empty, null, or whitespace-only names return an empty string.
 * - Single-word names: take the first two alphabetic characters (letters only),
 *   uppercased. Non-alphabetic characters (digits, punctuation, symbols) are ignored.
 *   Example: "A1!" -> "A", "J@y" -> "JY".
 * - Multi-word names: take the first alphabetic character of up to the first two
 *   words that contain at least one letter, uppercased.
 *   Example: "Jay Vasant" -> "JV", "Mary-Jane O'Neil" -> "MO".
 * - Words that contain no alphabetic characters (e.g., "123") do not contribute
 *   to the initials.
 */
const getInitials = (name: string): string => {
  const trimmed = name ? name.trim() : "";
  if (!trimmed) {
    return "";
  }
  // Split on any sequence of whitespace to avoid extra map/filter passes.
  const words = trimmed.split(/\s+/);

  let initials = "";
  // For single-word names, take the first two alphabetic characters.
  if (words.length === 1) {
    const lettersOnly = words[0].replace(/[^A-Za-z]/g, "");
    initials = lettersOnly.slice(0, 2).toUpperCase();
  } else {
    // For multi-word names, take the first alphabetic character of up to two words.
    const initialsChars: string[] = [];
    for (let i = 0; i < words.length && initialsChars.length < 2; i++) {
      const match = words[i].match(/[A-Za-z]/);
      if (match) {
        initialsChars.push(match[0].toUpperCase());
      }
    }
    initials = initialsChars.join("");
  }

  if (initials) {
    return initials;
  }
  // Fallback: if no alphabetic characters were found, use the first
  // non-whitespace character (uppercased), or "?" as a last resort.
  const firstCharMatch = trimmed.match(/\S/);
  return firstCharMatch ? firstCharMatch[0].toUpperCase() : "?";
};

/**
 * Render a single testimonial card linking to the original post.
 *
 * The card displays the author's avatar (optionally proxied for external URLs),
 * their name, and the testimonial content, and wraps everything in an anchor
 * that opens the original post in a new tab.
 *
 * @param props - Props for the testimonial card.
 * @param props.avatar - URL of the avatar image. External URLs are proxied through
 *   the `/api/proxy-image` endpoint; if the image fails to load, the component
 *   falls back to rendering initials derived from the author's name.
 * @param props.name - Name of the person giving the testimonial, used for
 *   display and to generate initials when the avatar image cannot be loaded.
 * @param props.id - Twitter/X handle of the person giving the testimonial.
 * @param props.content - The testimonial text content shown inside the card.
 * @param props.post - URL of the original post or tweet; the entire card links
 *   to this URL and opens it in a new browser tab.
 * @returns A JSX element representing the testimonial card.
 */
const TestimonialCard = ({
  avatar,
  name,
  id,
  content,
  post,
}: {
  avatar: string;
  name: string;
  post: string;
  id: string;
  content: string;
}) => {
  const { basePath } = useRouter();
  // Check if this avatar has already failed in another instance
  const [imgError, setImgError] = useState(() => failedAvatarCache.has(avatar));
  const isExternal = typeof avatar === "string" && /^https?:\/\//i.test(avatar);
  const proxiedAvatar = isExternal
    ? `${basePath}/api/proxy-image?url=${encodeURIComponent(avatar)}`
    : avatar;

  return (
    <a
      href={post}
      target="_blank"
      rel="noopener noreferrer"
      className="block group flex-shrink-0 w-[90vw] max-w-[350px] md:max-w-[400px]"
      aria-label={`Read testimonial from ${name} on X (formerly Twitter) (opens in new tab)`}
    >
      <div className="relative h-full bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out border border-gray-100 overflow-hidden group-hover:scale-[1.02] flex flex-col">
        {/* Decorative gradient blob */}
        <div className="absolute -top-5 -right-5 md:-top-10 md:-right-10 w-32 h-32 bg-gradient-to-br from-orange-200 via-orange-100 to-transparent rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Quote icon with gradient */}
        <div className="relative mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-300 to-primary-100 flex items-center justify-center shadow-lg shadow-orange-200/50">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>
        </div>

        {/* Testimonial Content */}
        <blockquote
          className="relative text-gray-700 text-base leading-relaxed font-medium flex-grow"
        >
          "{content}"
        </blockquote>

        {/* Author Info with gradient border */}
        <div className="relative flex items-center gap-4 pt-5 mt-auto">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent" />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-300 to-primary-100 rounded-full blur-sm opacity-60" />
            {imgError ? (
              <div
                className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary-300 to-primary-100 flex items-center justify-center border-2 border-white shadow-lg"
                role="img"
                aria-label={`Profile picture for ${name}`}
              >
                <span className="text-white font-bold text-lg">{getInitials(name)}</span>
              </div>
            ) : (
              <img
                className="relative w-14 h-14 rounded-full object-cover border-2 border-white shadow-lg"
                width="56"
                height="56"
                alt={`Profile picture for ${name}`}
                src={proxiedAvatar}
                onError={(event) => {
                  // Log error for debugging in all environments
                  console.error("Failed to load profile image", {
                    src: (event.currentTarget as HTMLImageElement).src,
                    name,
                  });
                  // Add to shared cache so other instances show fallback too
                  failedAvatarCache.add(avatar);
                  setImgError(true);
                }}
              />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-gray-900 text-base truncate">
              {name}
            </span>
            <span className="text-sm text-primary-300 font-semibold truncate flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              @{id}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
};

/**
 * Display a section with an infinite scrolling marquee of testimonials.
 *
 * This component renders a header and an auto-scrolling horizontal carousel
 * of testimonial cards. The animation pauses on hover or keyboard focus
 * and respects the user's reduced-motion preference.
 *
 * @returns A JSX element representing the testimonials section.
 */
const TwitterTestimonials = () => {
  // Memoize the duplicated tweets array to prevent recreation on each render.
  // The animation translates by calc(-100% / DUPLICATION_COUNT) to match.
  const duplicatedTweets = useMemo(
    () => Array(DUPLICATION_COUNT).fill(Tweets).flat(),
    [Tweets]
  );

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-50 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Section Header */}
      <div className="relative max-w-7xl mx-auto mb-14 text-center px-4 md:px-8 lg:px-16">
        <span className="inline-block px-4 py-1.5 mb-4 text-sm font-semibold text-primary-300 bg-orange-50 rounded-full border border-orange-100">
          <svg
            aria-hidden="true"
            className="mr-1 inline-block h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M5 4h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-5.586L9 20.414A1 1 0 0 1 7.586 19L9 17.586H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          </svg>
          <span>Testimonials</span>
        </span>
        <h2 id="testimonials-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight heading1 text-gray-900">
          What our{" "}
          <span className="relative">
            <span className="relative z-10">community</span>
            <span className="absolute bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-orange-200 to-orange-100 -z-0 rounded" />
          </span>
          {" "}thinks
        </h2>
        <p className="mt-5 text-gray-500 text-lg md:text-xl max-w-2xl mx-auto">
          Join thousands of developers who trust Keploy for their testing needs
        </p>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative">
        {/* Gradient overlays for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-6 py-4 testimonials-marquee-animation"
          role="region"
          aria-labelledby="testimonials-heading"
        >
          {duplicatedTweets.map((tweet, index) => (
            <TestimonialCard key={index} {...tweet} />
          ))}
        </div>
      </div>

      {/* CSS for infinite scroll animation */}
      <style jsx>{`
        @keyframes testimonials-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            /*
             * Scroll through exactly one copy of the tweets before looping.
             * This creates seamless infinite scrolling because the duplicated
             * content ensures there's always visible content during the loop reset.
             * The divisor must match DUPLICATION_COUNT.
             */
            transform: translateX(calc(-100% / ${DUPLICATION_COUNT}));
          }
        }
        .testimonials-marquee-animation {
          /*
           * Dynamic duration with min/max bounds for consistent UX.
           * Multiplier of 2 gives ~2 seconds per card, providing readable scroll speed.
           * Clamped to 30s min (fast enough to be engaging) and 90s max (not too slow).
           */
          --marquee-duration: ${Math.max(30, Math.min(duplicatedTweets.length * 2, 90))}s;
          animation: testimonials-marquee var(--marquee-duration) linear infinite;
        }
        .testimonials-marquee-animation:hover,
        .testimonials-marquee-animation:focus,
        .testimonials-marquee-animation:focus-within {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .testimonials-marquee-animation {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};

export default TwitterTestimonials;