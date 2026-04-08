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
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=64`;
  const localPlaceholder = "/blog/avatars/avatar-placeholder.svg";
  return (
    <a href={post} target="_blank" rel="noopener noreferrer" className="lg:mx-2">
      <figure className="relative w-80 cursor-pointer overflow-hidden rounded-xl border  p-4  border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]">
        <div className="flex flex-row items-center gap-2">
          <img
            className="rounded-full"
            width="32"
            height="32"
            alt={`${name}'s avatar`}
            src={avatar}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (img.src !== localPlaceholder) {
                img.onerror = () => { img.src = localPlaceholder; };
                img.src = fallbackAvatar;
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
  return (
    <div className="">
      <h3 className="text-center lg:text-left bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16">
        What our community thinks
      </h3>
      <div className="relative flex mb-8 h-[700px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-transparent marquee-mask">

        <Marquee pauseOnHover repeat={2} className="[--duration:17s]">
          {firstRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>
        <Marquee reverse pauseOnHover repeat={2} className="[--duration:17s]">
          {secondRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>

      </div>
    </div>
  );
};

export default TwitterTestimonials;