import React from "react";
import Image from "next/image";

const Tweets = ({ avatar, name, id, post, content }) => {
  return (
    <>
      <a
        className="p-6 m-1 transition bg-gray-100 border rounded-md lg:hover:shadow-md"
        href={post}
        target="_blank"
      >
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-2">
            <div className="relative w-12 h-12">
              <Image
                src={avatar}
                alt="profile_image"
                className="h-12 rounded-full"
                fill
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="font-bold">{name}</div>
              <div className="">@{id}</div>
            </div>
          </div>
          <Image
            src="blog/favicon/x-twitter.svg"
            width={20}
            height={20}
            alt="twitter icon"
          />
        </div>
        <div className="pt-2">{content}</div>
      </a>
    </>
  );
};

export default Tweets;
