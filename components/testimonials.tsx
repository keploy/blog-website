import React from "react";
import { useRouter } from "next/router";
import { Quote } from "lucide-react";
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
    <a href={post} target="_blank" className="lg:mx-2 block h-fit relative group/card hover:z-50 transition-all duration-300">
      <figure className="relative flex w-80 flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 group-hover/card:scale-105 group-hover/card:shadow-2xl dark:border-gray-800 dark:bg-gray-950 overflow-hidden">
        <Quote className="absolute -top-2 -right-2 h-24 w-24 text-orange-400/10 -rotate-12 transition-transform duration-500 group-hover/card:rotate-0" aria-hidden="true" />

        <div className="relative z-10">
          <blockquote className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {content}
          </blockquote>
        </div>

        <div className="mt-4 flex flex-row items-center gap-3 relative z-10">
          <img
            className="rounded-full object-cover bg-gray-100"
            width="40"
            height="40"
            alt=""
            src={avatar}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
            }}
          />
          <div className="flex flex-col">
            <figcaption className="text-sm font-bold text-gray-900 dark:text-white">
              {name}
            </figcaption>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              @{id}
            </p>
          </div>
        </div>
      </figure>
    </a>
  );
};

const TwitterTestimonials = () => {
  return (
    <div className="py-20 w-full overflow-hidden">
      <div className="mb-12 flex flex-col items-center justify-center text-center px-4">
        <div className="mb-2 inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
          <span className="mr-1">💬</span> Testimonials
        </div>
        <h3 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
          What our <span className="relative inline-block px-2">
            <span className="absolute inset-0 -skew-y-2 transform bg-orange-200 dark:bg-orange-800/60" aria-hidden="true"></span>
            <span className="relative text-gray-900 dark:text-white">community</span>
          </span> thinks
        </h3>
        <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-400">
          Join thousands of developers who trust Keploy for their testing needs
        </p>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center overflow-visible">
        <Marquee pauseOnHover className="[--duration:40s] py-12">
          {firstRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:40s] py-12">
          {secondRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 z-20"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 z-20"></div>
      </div>
    </div>
  );
};

export default TwitterTestimonials;
