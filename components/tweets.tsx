"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";

const fallbackAvatar =
  "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png";

const Tweets = ({ avatar, name, id, post, content }) => {
  const { basePath } = useRouter();

  let imgSrc = avatar || fallbackAvatar;

  const isExternal = /^https?:\/\//i.test(imgSrc);
  const isTwitterCDN =
    imgSrc.includes("pbs.twimg.com") || imgSrc.includes("abs.twimg.com");

  if (isExternal && !isTwitterCDN) {
    imgSrc = `${basePath}/api/proxy-image?url=${encodeURIComponent(imgSrc)}`;
  }

  // ✅ HOOKS MUST COME BEFORE ANY RETURN
  const [src, setSrc] = useState(imgSrc);

  // ✅ Conditional return AFTER hooks
  if (!post || !post.startsWith("https://")) return null;

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
            src={src}
            alt={`${name} avatar`}
            width={48}
            height={48}
            className="rounded-full"
            unoptimized
            onError={() => setSrc(fallbackAvatar)}
            loading="lazy"
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
