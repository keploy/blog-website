import React from "react";
import { useRouter } from "next/router";
import { Marquee } from "./Marquee";
import Tweets from "../services/Tweets";

const firstRow = Tweets.slice(0, Math.ceil(Tweets.length / 2));
const secondRow = Tweets.slice(Math.ceil(Tweets.length / 2));

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
  // Use the avatar URL directly. The previous /api/proxy-image route
  // does not exist in this project and was causing 404 errors.
  const imageSrc = isExternal ? avatar : `${basePath}${avatar}`;

  return (
    <a
      href={post}
      target="_blank"
      rel="noreferrer"
      className="block lg:mx-2"
    >
      <figure className="relative flex h-full w-[320px] flex-col justify-between rounded-3xl border border-orange-100/80 bg-white/90 px-6 py-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_20px_70px_rgba(15,23,42,0.15)]">
        <div>
          <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-2xl text-orange-500">
            &ldquo;
          </span>
          <blockquote className="mt-2 text-sm leading-relaxed text-slate-700">
            {content}
          </blockquote>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <img
            className="h-10 w-10 rounded-full object-cover"
            width={40}
            height={40}
            alt={name}
            src={imageSrc}
          />
          <div className="flex flex-col">
            <figcaption className="text-sm font-semibold text-slate-900">
              {name}
            </figcaption>
            <p className="text-xs font-medium text-slate-500">{id}</p>
          </div>
        </div>
      </figure>
    </a>
  );
};

const TwitterTestimonials = () => {
  return (
    <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto mb-8 max-w-3xl text-center lg:text-left">
        <p className="mx-auto mb-3 inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
          Testimonials
        </p>
        <h3 className="bg-gradient-to-r from-orange-400 to-orange-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-4xl">
          What our community thinks
        </h3>
        <p className="mt-3 text-sm text-slate-600 md:text-base">
          Join thousands of developers who trust Keploy for their testing
          needs. Here&apos;s what they are saying about their experience.
        </p>
      </div>

      <div className="relative flex h-[380px] w-full flex-col justify-center gap-6 overflow-hidden">
        <Marquee pauseOnHover className="[--duration:28s]">
          {firstRow.map((tweet, index) => (
            <ReviewCard
              key={`${tweet.id}-${index}-row1`}
              {...tweet}
            />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover className="[--duration:32s]">
          {secondRow.map((tweet, index) => (
            <ReviewCard
              key={`${tweet.id}-${index}-row2`}
              {...tweet}
            />
          ))}
        </Marquee>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-orange-50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-orange-50 to-transparent" />
      </div>
    </div>
  );
};

export default TwitterTestimonials;