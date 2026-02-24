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
<<<<<<< HEAD
  const localPlaceholder = "/blog/avatars/avatar-placeholder.svg";
=======
>>>>>>> a04007f (fix: broken testimonial avatars + marquee UX improvements)
  return (
    <a href={post} target="_blank" rel="noopener noreferrer" className="lg:mx-2">
      <figure className="relative w-80 cursor-pointer overflow-hidden rounded-xl border  p-4  border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]">
        <div className="flex flex-row items-center gap-2">
          <img
            className="rounded-full"
            width="32"
            height="32"
<<<<<<< HEAD
            alt={`${name}'s avatar`}
            src={avatar}
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              if (img.src !== localPlaceholder) {
                img.onerror = () => { img.src = localPlaceholder; };
                img.src = fallbackAvatar;
              }
=======
            alt=""
            src={avatar}
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackAvatar;
>>>>>>> a04007f (fix: broken testimonial avatars + marquee UX improvements)
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
    <div className="px-4 md:px-8 lg:px-16">
      <h3 className="text-center lg:text-left bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max mb-6 text-3xl lg:text-4xl heading1 md:text-4xl font-bold tracking-tighter leading-tight mt-16">
        What our community thinks
      </h3>
<<<<<<< HEAD
      <div className="relative flex mb-8 h-[700px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-transparent marquee-mask">

        <Marquee pauseOnHover repeat={2} className="[--duration:17s]">
=======
      <div className="relative flex mb-8  h-[700px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-transparent" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', willChange: 'transform' }}>

        <Marquee pauseOnHover className="[--duration:17s]">
>>>>>>> a04007f (fix: broken testimonial avatars + marquee UX improvements)
          {firstRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>
<<<<<<< HEAD
        <Marquee reverse pauseOnHover repeat={2} className="[--duration:17s]">
=======
        <Marquee reverse pauseOnHover className="[--duration:17s]">
>>>>>>> a04007f (fix: broken testimonial avatars + marquee UX improvements)
          {secondRow.map((tweet) => (
            <ReviewCard key={tweet.id} {...tweet} />
          ))}
        </Marquee>

      </div>
    </div>
  );
};

export default TwitterTestimonials;
