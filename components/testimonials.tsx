import React, { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Tweets from "../services/Tweets";

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
  if (words.length === 0) {
    return "";
  }
  // For single-word names, take the first two alphabetic characters.
  if (words.length === 1) {
    const lettersOnly = words[0].replace(/[^A-Za-z]/g, "");
    return lettersOnly.slice(0, 2).toUpperCase();
  }
  // For multi-word names, take the first alphabetic character of up to two words.
  const initialsChars: string[] = [];
  for (let i = 0; i < words.length && initialsChars.length < 2; i++) {
    const match = words[i].match(/[A-Za-z]/);
    if (match) {
      initialsChars.push(match[0].toUpperCase());
    }
  }
  return initialsChars.join("");
};

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
  const [imgError, setImgError] = useState(false);
  const isExternal = typeof avatar === "string" && /^https?:\/\//i.test(avatar);
  const proxiedAvatar = isExternal
    ? `${basePath}/api/proxy-image?url=${encodeURIComponent(avatar)}`
    : avatar;

  return (
    <a
      href={post}
      target="_blank"
      rel="noopener noreferrer"
      className="block group flex-shrink-0 w-[350px] md:w-[400px] min-h-[320px]"
    >
      <div className="relative h-full bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 ease-out border border-gray-100 overflow-hidden group-hover:scale-[1.02] flex flex-col">
        {/* Decorative gradient blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-200 via-orange-100 to-transparent rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Quote icon with gradient */}
        <div className="relative mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-300 to-primary-100 flex items-center justify-center shadow-lg shadow-orange-200/50">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
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
                onError={() => setImgError(true)}
              />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-bold text-gray-900 text-base truncate">
              {name}
            </span>
            <span className="text-sm text-primary-300 font-semibold truncate flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
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

const TwitterTestimonials = () => {
  // Duplicate the tweets array multiple times for seamless infinite scroll - memoized to avoid recreation on each render
  const duplicatedTweets = useMemo(
    () => [...Tweets, ...Tweets, ...Tweets],
    []
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
          <span aria-hidden="true" className="mr-1">💬</span>
          <span>Testimonials</span>
        </span>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight heading1 text-gray-900">
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

        {/* Marquee Track */}
        <div
          className="flex gap-6 py-4 testimonials-marquee-animation"
          role="region"
          aria-label="Scrolling testimonials from our community"
        >
          {duplicatedTweets.map((tweet, index) => (
            <TestimonialCard key={`${tweet.id}-${index}`} {...tweet} />
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
            /* Move left by one full set of tweets. 3 must match the number of duplicated tweet sets. */
            transform: translateX(calc(-100% / 3));
          }
        }
        .testimonials-marquee-animation {
          --marquee-duration: 18s;
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