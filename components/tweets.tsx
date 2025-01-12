import React from "react";
import Image from "next/image";
import Link from "next/link";

const Tweets = ({ avatar, name, id, post, content }) => {
  return (
    <>
      <Link
        className="bg-gray-100 border p-6 rounded-md lg:hover:shadow-md transition m-1"
        href={post}
        target="_blank"
      >
        <div className="flex flex-row items-center justify-between ">
          <div className="flex flex-row gap-2 items-center">
            <Image
              src={avatar}
              alt="profile_image"
              width={"100"}
              height={"100"}
              className="rounded-full h-12 w-auto aspect-square"
            />
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
      </Link>
    </>
  );
};

export default Tweets;
