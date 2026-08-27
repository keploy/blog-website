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
  const isOwnAsset = typeof avatar === "string" && avatar.startsWith(S3_ASSET_BASE);
  const proxiedAvatar = isExternal && !isOwnAsset
    ? `${basePath}/api/proxy-image?url=${encodeURIComponent(avatar)}`
    : avatar;

  const [src, setSrc] = useState(proxiedAvatar);
  const [unoptimized, setUnoptimized] = useState(false);

  // Re-sync if the derived avatar changes (Tweets are static today, so this is
  // defensive) — otherwise the state seeded from the prop would go stale.
  React.useEffect(() => {
    setSrc(proxiedAvatar);
    setUnoptimized(false);
  }, [proxiedAvatar]);

  return (
    <a href={post} target="_blank" rel="noopener noreferrer" className="lg:mx-2" aria-label={`View tweet by ${name}`}>
      <figure className="relative w-80 cursor-pointer overflow-hidden rounded-xl border  p-4  border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]">
        <div className="flex flex-row items-center gap-2">
          <Image
            className="rounded-full"
            width={32}
            height={32}
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
          <div className="flex flex-col">
            <figcaption className="text-sm font-bold">{name}</figcaption>
            <p className="text-xs font-medium ">{id}</p>
          </div>
        </div>
        <blockquote className="mt-2 text-sm">{content}</blockquote>
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
    <div className="">
      <h3 className="text-center lg:text-left bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16">
        What our community thinks
      </h3>
      <div
        ref={marqueeRef}
        className="relative flex mb-8 h-[700px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-transparent marquee-mask"
      >

        <Marquee paused={paused} pauseOnHover repeat={2} className="[--duration:17s]">
          {firstRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>
        <Marquee paused={paused} reverse pauseOnHover repeat={2} className="[--duration:17s]">
          {secondRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>

      </div>
    </div>
  );
};

export default TwitterTestimonials;
