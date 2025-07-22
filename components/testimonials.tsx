import React from "react";
import { Marquee } from "./Marquee";
import Tweets from "../services/Tweets";
import Image from "next/image";

const firstRow = Tweets.slice(0, Tweets.length / 2);
const secondRow = Tweets.slice(Tweets.length / 2, (2 * Tweets.length) / 2);
const thirdRow = Tweets.slice((2 * Tweets.length) / 2);

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
    <a href={post} target="_blank" className="mx-2 my-2">
      <figure className="relative w-80 cursor-pointer overflow-hidden rounded-2xl p-4 border border-white/20 bg-white/30 shadow-md backdrop-blur-lg transition-all duration-300 hover:scale-[1.025] hover:border-orange-300/60 hover:shadow-xl hover:bg-gradient-to-br hover:from-orange-100/40 hover:via-purple-100/30 hover:to-white/20">
        <div className="flex flex-row items-center gap-3">
          <Image
            className="rounded-full"
            width="36"
            height="36"
            alt="avatar"
            src={avatar}
          />
          <div className="flex flex-col">
            <figcaption className="text-sm font-semibold text-gray-900">
              {name}
            </figcaption>
            <p className="text-xs text-gray-500">{id}</p>
          </div>
        </div>
        <blockquote className="mt-3 text-sm text-gray-800 leading-relaxed">
          {content}
        </blockquote>

        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 hover:opacity-100">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-200/20 via-purple-200/10 to-transparent blur-md" />
        </div>
      </figure>
    </a>
  );
};

const TwitterTestimonials = () => {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="flex flex-col justify-center items-center relative w-full bg-gradient-to-br from-orange-200/20 via-rose-50 to-purple-200/20 bg-orange-50/30">
        <h3 className="text-center w-max mb-4 text-3xl md:text-4xl font-bold tracking-tight leading-tight bg-gradient-to-r from-orange-500 to-purple-800 bg-clip-text text-transparent p-4">
          What our community thinks
        </h3>

        <div className="relative flex flex-col space-y-8 h-[700px] w-full overflow-hidden rounded-lg">
          <div className="absolute inset-0 z-10 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,white_10%,white_90%,transparent_100%)]" />

          <div className="absolute left-0 top-0 h-full w-24 z-20 pointer-events-none" />

          <div className="absolute right-0 top-0 h-full w-24 z-20 pointer-events-none" />

          <Marquee direction="up" pauseOnHover className="[--duration:30s]">
            {firstRow.map((tweet) => (
              <ReviewCard key={tweet.id} {...tweet} />
            ))}
          </Marquee>
          <Marquee
            direction="up"
            pauseOnHover
            className="[--duration:35s] [--delay:5s]"
          >
            {secondRow.map((tweet) => (
              <ReviewCard key={tweet.id} {...tweet} />
            ))}
          </Marquee>
          <Marquee
            direction="up"
            pauseOnHover
            className="[--duration:40s] [--delay:10s]"
          >
            {thirdRow.map((tweet) => (
              <ReviewCard key={tweet.id} {...tweet} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default TwitterTestimonials;
