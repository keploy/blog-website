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
  const isExternal =
    typeof avatar === "string" && /^https?:\/\//i.test(avatar);

  const proxiedAvatar = isExternal
    ? `${basePath}/api/proxy-image?url=${encodeURIComponent(avatar)}`
    : avatar;

  return (
    <a
      href={post}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-4"
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
        <div className="absolute
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
          " />




        {/* content */}
        <blockquote className="relative z-10 text-[14.5px] leading-relaxed text-gray-600">
          {content}
        </blockquote>

        {/* author */}
        <div className="relative z-10 mt-6 flex items-center gap-3">
          <img
            src={proxiedAvatar}
            alt={name}
            className="h-9 w-9 rounded-full object-cover"
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
  return (
    <section className="relative py-20 bg-white overflow-hidden">
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
          Join thousands of developers who trust Keploy for their testing needs
        </p>
      </div>

      {/* Testimonials */}
      <div className="relative">
        <Marquee pauseOnHover className="[--duration:28s] py-4">

          {firstRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>

        <Marquee reverse pauseOnHover className="[--duration:25s] mt-8">
          {secondRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>

        {/* Gradient fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white" />
      </div>
    </section>
  );
};


export default TwitterTestimonials;
