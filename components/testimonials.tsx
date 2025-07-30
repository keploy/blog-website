import React from "react";
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
  return (
    <a
      href={post}
      target="_blank"
      rel="noopener noreferrer"
      className="lg:mx-2 focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-xl"
    >
      <figure className="
        relative w-80 cursor-pointer overflow-hidden rounded-xl border
        border-gray-200 dark:border-gray-700
        bg-white/60 dark:bg-gray-900/80
        hover:bg-orange-50 dark:hover:bg-gray-800/70
        p-4 shadow transition-colors duration-300
      ">
        <div className="flex flex-row items-center gap-3">
          <img
            className="rounded-full border border-gray-300 dark:border-gray-600"
            width="40"
            height="40"
            alt={name}
            src={avatar}
          />
          <div className="flex flex-col">
            <figcaption className="text-sm font-bold text-gray-900 dark:text-gray-100">{name}</figcaption>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{id}</p>
          </div>
        </div>
        <blockquote className="mt-3 text-base text-gray-800 dark:text-gray-200 italic">
          {content}
        </blockquote>
      </figure>
    </a>
  );
};

const TwitterTestimonials = () => {
  return (
    <div>
      <h3 className="
        text-center lg:text-left
        bg-gradient-to-r from-orange-200 to-orange-100 dark:from-orange-900 dark:to-orange-800
        bg-[length:100%_20px] bg-no-repeat bg-left-bottom
        w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16
        text-gray-900 dark:text-gray-100
      ">
        What our community thinks
      </h3>
      <div className="
        relative flex mb-8 h-[700px] w-full flex-col items-center justify-center
        overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700
        bg-white/80 dark:bg-gray-900/80
        shadow-lg
      ">
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
        <div className="
          pointer-events-none absolute inset-y-0 left-0 w-1/3
          bg-gradient-to-r from-white dark:from-gray-900 to-transparent
        "></div>
        <div className="
          pointer-events-none absolute inset-y-0 right-0 w-1/3
          bg-gradient-to-l from-white dark:from-gray-900 to-transparent
        "></div>
      </div>
    </div>
  );
};

export default TwitterTestimonials;
