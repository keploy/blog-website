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
    <a href={post} target="_blank" className="lg:mx-2 block h-full">
      <figure className="relative flex h-full w-80 flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-950">
        <div>
          <Quote className="h-8 w-8 text-orange-400 mb-4 fill-orange-400/20" />
          <blockquote className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {content}
          </blockquote>
        </div>

        <div className="mt-6 flex flex-row items-center gap-3">
          <img
            className="rounded-full object-cover"
            width="40"
            height="40"
            alt={name}
            src={avatar}
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
      <div className="mb-12 flex flex-col items-center justify-center text-center">
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

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:40s] py-4">
          {firstRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:40s] py-4">
          {secondRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80"></div>
      </div>
    </div>
  );
};

export default TwitterTestimonials;
