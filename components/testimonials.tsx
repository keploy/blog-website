import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { Marquee } from "./Marquee";
import Tweets from "../services/Tweets";
import { S3_ASSET_BASE } from "../lib/constants";

const firstRow = Tweets.slice(0, Tweets.length / 2);
const secondRow = Tweets.slice(Tweets.length / 2);

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
  const { basePath } = useRouter();
  const localPlaceholder = `${S3_ASSET_BASE}/avatars/avatar-placeholder.svg`;
  const isExternal = typeof avatar === "string" && /^https?:\/\//i.test(avatar);
  // Our own S3 assets are allowlisted for next/image, so serve them directly;
  // only proxy genuinely third-party avatars (e.g. Twitter) through the endpoint.
  const isOwnAsset =
    typeof avatar === "string" && avatar.startsWith(S3_ASSET_BASE);
  const proxiedAvatar =
    isExternal && !isOwnAsset
      ? `${basePath}/api/proxy-image?url=${encodeURIComponent(avatar)}`
      : avatar;

  const [src, setSrc] = useState(proxiedAvatar);
  const [unoptimized, setUnoptimized] = useState(false);

  // Re-sync if the derived avatar changes (Tweets are static today, so this is
  // defensive) — otherwise the state seeded from the prop would go stale.
  useEffect(() => {
    setSrc(proxiedAvatar);
    setUnoptimized(false);
  }, [proxiedAvatar]);

  return (
    <a
      href={post}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-4"
      aria-label={`View tweet by ${name}`}
    >
      <figure
        className="
          relative
          w-[360px]
          rounded-2xl
          bg-white
          px-6
          pt-6
          pb-5
          border
          border-gray-200
          shadow-[0_8px_26px_rgba(0,0,0,0.08)]
          overflow-hidden
        "
      >
        {/* decorative orange circle */}
        <div
          className="
            absolute
            top-0
            right-0
            h-28
            w-28
            translate-x-1/3
            -translate-y-1/3
            rounded-full
            bg-orange-50
            pointer-events-none
            z-0
          "
        />

        {/* content */}
        <blockquote className="relative z-10 text-[14.5px] leading-relaxed text-gray-600">
          {content}
        </blockquote>

        {/* author */}
        <div className="relative z-10 mt-6 flex items-center gap-3">
          <Image
            className="h-9 w-9 rounded-full object-cover"
            width={36}
            height={36}
            alt={`${name}'s avatar`}
            src={src}
            unoptimized={unoptimized}
            onError={() => {
              if (src !== localPlaceholder) {
                setUnoptimized(true);
                setSrc(localPlaceholder);
              }
            }}
          />
          <div>
            <figcaption className="text-sm font-semibold text-gray-900">
              {name}
            </figcaption>
            <p className="text-sm text-orange-500">{id}</p>
          </div>
        </div>
      </figure>
    </a>
  );
};

const TwitterTestimonials = () => {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  // Pause the infinite marquees while the section is off-screen so they don't
  // burn compositor/CPU (and battery on mobile) when nobody's watching. Start
  // paused; the observer resumes them ~200px before they scroll into view, so
  // the viewer always sees continuous motion — resume is seamless (CSS
  // animation-play-state continues, no reset).
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const node = marqueeRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setPaused(false); // fail open — animate if we can't observe.
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-20 bg-transparent overflow-hidden">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="inline-block mb-4 rounded-full bg-orange-100 px-4 py-1 text-sm font-medium text-orange-600">
          Testimonials
        </span>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          What our{" "}
          <span className="relative inline-block">
            <span className="relative z-10">community</span>
            <span className="absolute bottom-0 left-0 right-0 h-3 bg-orange-200 rounded -z-0" />
          </span>{" "}
          thinks
        </h2>

        <p className="mt-4 text-gray-500 max-w-2xl mx-auto text-lg">
          Join thousands of developers who trust Keploy for their testing needs.
        </p>
      </div>

      {/* Testimonials (edge fade comes from the marquee-mask class) */}
      <div ref={marqueeRef} className="relative marquee-mask">
        <Marquee
          paused={paused}
          pauseOnHover
          repeat={2}
          className="[--duration:17s] py-4"
        >
          {firstRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>

        <Marquee
          paused={paused}
          reverse
          pauseOnHover
          repeat={2}
          className="[--duration:17s] mt-8"
        >
          {secondRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default TwitterTestimonials;