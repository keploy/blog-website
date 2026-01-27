import React from "react";
import { useRouter } from "next/router";
import { Marquee } from "./Marquee";
import Tweets from "../services/Tweets";

const fallbackAvatar =
  "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

const firstRow = Tweets.slice(0, Tweets.length / 2);
const secondRow = Tweets.slice(Tweets.length / 2);

const ReviewCard = ({ avatar, name, id, content, post }) => {
  const { basePath } = useRouter();

  // Validate post link
  if (!post || !post.startsWith("https://")) return null;

  let imgSrc = avatar || fallbackAvatar;

  const isExternal = /^https?:\/\//i.test(imgSrc);

  const isTwitterCDN =
    imgSrc.includes("pbs.twimg.com") || imgSrc.includes("abs.twimg.com");

  // Only proxy non-twitter external images
  if (isExternal && !isTwitterCDN) {
    imgSrc = `${basePath}/api/proxy-image?url=${encodeURIComponent(imgSrc)}`;
  }

  const handleError = (e) => {
    e.currentTarget.src = fallbackAvatar;
    e.currentTarget.onerror = null;
  };

  return (
    <a href={post} target="_blank" rel="noopener noreferrer" className="lg:mx-2">
      <figure className="relative w-80 cursor-pointer overflow-hidden rounded-xl border p-4 border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]">
        <div className="flex flex-row items-center gap-2">
          <img
            src={imgSrc}
            width={32}
            height={32}
            alt={`${name} avatar`}
            onError={handleError}
            className="rounded-full"
            loading="lazy"
            decoding="async"
          />
          <div className="flex flex-col">
            <figcaption className="text-sm font-bold">{name}</figcaption>
            <p className="text-xs font-medium">@{id}</p>
          </div>
        </div>
        <blockquote className="mt-2 text-sm">{content}</blockquote>
      </figure>
    </a>
  );
};

const TwitterTestimonials = () => {
  return (
    <div>
      <h3 className="text-center lg:text-left bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16">
        What our community thinks
      </h3>

      <div className="relative flex mb-8 h-[700px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border">
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>

        <Marquee reverse pauseOnHover className="[--duration:20s]">
          {secondRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-neutral-100 dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-neutral-100 dark:from-background"></div>
      </div>
    </div>
  );
};

export default TwitterTestimonials;
