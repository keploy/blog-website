import React from "react";
import { useRouter } from "next/router";
import { Marquee } from "./Marquee";
import Tweets from "../services/Tweets";

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
  const isExternal = typeof avatar === "string" && /^https?:\/\//i.test(avatar);
  const proxiedAvatar = isExternal
    ? `${basePath}/api/proxy-image?url=${encodeURIComponent(avatar)}`
    : avatar;

  return (
    <a href={post} target="_blank" className="lg:mx-2">
      <figure className="relative w-80 cursor-pointer overflow-hidden rounded-xl border border-gray-950/[.1] dark:border-gray-700 p-4 bg-gray-950/[.01] dark:bg-gray-800 hover:bg-gray-950/[.05] dark:hover:bg-gray-700 transition-all duration-300">
        <div className="flex flex-row items-center gap-2">
          <img
            className="rounded-full"
            width="32"
            height="32"
            alt=""
            src={proxiedAvatar}
          />
          <div className="flex flex-col">
            <figcaption className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {name}
            </figcaption>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {id}
            </p>
          </div>
        </div>
        <blockquote className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          {content}
        </blockquote>
      </figure>
    </a>
  );
};

const TwitterTestimonials = () => {
  return (
    <div>
      {/* === Section Title (Updated for Gradient Support) === */}
      <h3 className="text-center lg:text-left bg-gradient-to-r from-orange-200 to-orange-100 dark:from-orange-400 dark:to-yellow-300 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16">
        What our community thinks
        <span className="absolute left-0 bottom-0 h-[3px] w-[60px] rounded-full bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-yellow-400"></span>
      </h3>

      {/* === Testimonials Section === */}
      <div className="relative flex mb-8 h-[700px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[hsl(220,14%,18%)] transition-colors duration-500">
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

        {/* Gradient Fades on Left/Right */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-neutral-100 dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-neutral-100 dark:from-background"></div>
      </div>
    </div>
  );
};

export default TwitterTestimonials;
