import React from "react";
import Image from "next/image";
import Link from "next/link";

interface TweetProps {
  avatar: string;
  name: string;
  id: string;
  post: string;
  content: string;
}

const Tweets = ({ avatar, name, id, post, content }: TweetProps) => {
  return (
    <Link
      href={post}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 m-2 block"
      aria-label={`View tweet by ${name}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src={avatar}
            alt={`${name}'s avatar`}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <p className="font-semibold text-lg text-gray-800">{name}</p>
            <p className="text-gray-500 text-sm">@{id}</p>
          </div>
        </div>
        <Image
          src="/blog/favicon/x-twitter.svg"
          width={20}
          height={20}
          alt="Twitter Icon"
        />
      </div>

      <p className="mt-4 text-gray-700">{content}</p>
    </Link>
  );
};

export default Tweets;