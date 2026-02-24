import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Marquee } from "./Marquee";
import Tweets from "../services/Tweets";

const firstRow = Tweets.slice(0, Math.ceil(Tweets.length / 2));
const secondRow = Tweets.slice(Math.ceil(Tweets.length / 2));

import { User } from "lucide-react";

/** Generates a two-letter initial from a name string */
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

/** Fallback avatar component – renders a user icon/initials in a branded circle */
const FallbackAvatar = ({ name }: { name: string }) => (
  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 ring-2 ring-gray-100 p-1">
    <User className="h-full w-full opacity-60" />
  </div>
);

const ReviewCard = ({
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
  const router = useRouter();
  const [imgError, setImgError] = React.useState(false);

  // Safe basePath handling for SSR/Hydration
  const basePath = router?.basePath || "";

  // Determine if we should use the proxy
  const isExternal = typeof avatar === "string" && /^https?:\/\//i.test(avatar);
  const proxiedAvatar = isExternal
    ? `${basePath}/api/proxy-image?url=${encodeURIComponent(avatar)}`
    : avatar;

  // Handle case where avatar might be empty or invalid
  React.useEffect(() => {
    if (!avatar) {
      setImgError(true);
    } else {
      setImgError(false);
    }
  }, [avatar]);

  return (
    <a
      href={post}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-2 block"
    >
      <figure className="group/card relative w-[320px] cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        {/* Quote icon */}
        <svg
          className="absolute right-4 top-4 h-8 w-8 text-primary-200 opacity-60"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
        </svg>

        <div className="flex flex-row items-center gap-3">
          <div className="h-10 w-10 relative shrink-0">
            {imgError ? (
              <FallbackAvatar name={name} />
            ) : (
              <img
                className="h-full w-full rounded-full object-cover ring-2 ring-primary-100"
                width={40}
                height={40}
                alt={name ? `${name}'s avatar` : "Avatar"}
                src={proxiedAvatar}
                onError={() => setImgError(true)}
                loading="lazy"
              />
            )}
          </div>
          <div className="flex flex-col">
            <figcaption className="text-sm font-semibold text-gray-900 leading-tight">
              {name}
            </figcaption>
            <p className="text-xs font-medium text-gray-500">@{id}</p>
          </div>
        </div>

        <blockquote className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-600">
          {content}
        </blockquote>

        {/* Bottom accent bar */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary-300 to-primary-100 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" />
      </figure>
    </a>
  );
};

const TwitterTestimonials = () => {
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <section className="py-12 md:py-16">
        <h3 className="text-left bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-8 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
          What our community thinks
        </h3>
        <div className="h-40 flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-200 rounded"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                  <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="flex items-center justify-between mb-8 overflow-hidden">
        <h3 className="text-left bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight">
          What our community thinks
        </h3>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
          aria-label={isPaused ? "Play marquee" : "Pause marquee"}
        >
          {isPaused ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              <span>Play</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              <span>Pause</span>
            </>
          )}
        </button>
      </div>

      <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-xl py-4">
        {/* Row 1 – scrolls left */}
        <Marquee pauseOnHover isPaused={isPaused} className="[--duration:11s]">
          {firstRow.map((tweet) => (
            <ReviewCard key={tweet.id + "-r1"} {...tweet} />
          ))}
        </Marquee>

        {/* Row 2 – scrolls right */}
        <Marquee reverse pauseOnHover isPaused={isPaused} className="[--duration:11s]">
          {secondRow.map((tweet) => (
            <ReviewCard key={tweet.id + "-r2"} {...tweet} />
          ))}
        </Marquee>

        {/* Gradient fade overlays */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white to-transparent" />
      </div>
    </section>
  );
};

export default TwitterTestimonials;
