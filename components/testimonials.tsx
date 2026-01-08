import React from "react";
import { useRouter } from "next/router";
import { Marquee } from "./Marquee";
import Tweets from "../services/Tweets";
// const firstRow = Tweets.slice(0, Tweets.length / 2);
const firstRow = Tweets.slice(0);
// const secondRow = Tweets.slice(Tweets.length / 2);

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
  const proxiedAvatar = isExternal ? `${basePath}/api/proxy-image?url=${encodeURIComponent(avatar)}` : avatar;
  return (
    <a href={post} target="_blank" className="lg:mx-2 inline-block">
      <figure className="relative w-80 min-h-64 cursor-pointer overflow-visible rounded-2xl border-2 border-gray-200/50 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-200/50 hover:scale-[1.05] p-5 bg-gradient-to-br from-white to-orange-50/30 backdrop-blur-sm shadow-lg transition-all duration-300 flex flex-col">
        <div className="flex flex-row items-center gap-3 mb-4">
          <div className="relative">
            <img
              className="rounded-full ring-2 ring-orange-200/80 shadow-md"
              width="44"
              height="44"
              alt=""
              src={proxiedAvatar}
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col flex-1">
            <figcaption className="text-sm font-bold text-gray-900">{name}</figcaption>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <p className="text-xs font-medium text-gray-500">{id}</p>
            </div>
          </div>
        </div>
        <blockquote className="text-sm leading-relaxed text-gray-700 flex-1">{content}</blockquote>
        <div className="absolute top-3 right-3 opacity-8">
          <svg className="w-10 h-10 text-orange-300/40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>
        </div>
      </figure>
    </a>
  );
};

const TwitterTestimonials = () => {
  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 py-8">
          <div className="relative w-max mb-3">
            <h3 className="text-center lg:text-left bg-gradient-to-r from-orange-200/80 to-orange-100/60 bg-[length:100%_18px] bg-no-repeat bg-left-bottom text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tight leading-tight mt-16 relative">
              What our community thinks
            </h3>
          </div>
        <p className="text-center lg:text-left text-gray-600 text-base mb-8">
          Join thousands of developers who trust Keploy for their testing needs
        </p>
      <div className="relative flex mb-8 h-fix w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-200/50 bg-gradient-to-br from-orange-50/30 via-white to-orange-50/20 p-8 shadow-inner">
        
        <Marquee pauseOnHover className="[--duration:20s]">
          {firstRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white via-white/80 to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white via-white/80 to-transparent"></div>
      </div>
    </div>
  );
};

export default TwitterTestimonials;
