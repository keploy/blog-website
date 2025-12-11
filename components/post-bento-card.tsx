"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PostBentoCard({
  title,
  excerpt,
  coverImage,
  author,
  readTime,
  slug,
  size = "normal",
}) {
  const sizeClasses = {
    normal: "col-span-1 row-span-1",
    wide: "md:col-span-2 row-span-1",
    tall: "col-span-1 md:row-span-2",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      //   animate={}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
      className={sizeClasses[size]}
    >
      <Link
        href={`/posts/${slug}`}
        className={`
          group 
          relative 
          overflow-hidden 
          rounded-3xl 
          bg-[#1c1c1c] 
          border border-white/10 
          shadow-[0_4px_25px_rgba(0,0,0,0.45)]
          p-6 flex flex-col
          transition-all 
          duration-300 
          hover:scale-[1.02]
          hover:shadow-orange-300
          w-full h-full
        `}
      >
        {/* Background image */}
        <img
          src={coverImage?.node?.sourceUrl}
          alt={title}
          className="
            absolute inset-0 
            w-full h-full 
            object-cover 
            opacity-40 
            group-hover:opacity-50 
            transition-opacity duration-300
          "
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

        {/* Content */}
        <div className="relative z-10 text-white mt-auto">
          <h3 className="text-xl font-semibold group-hover:text-orange-300 transition">
            {title}
          </h3>

          <p
            dangerouslySetInnerHTML={{ __html: excerpt }}
            className="text-sm opacity-80 mt-1 line-clamp-3"
          />

          {/* Footer */}
          <div className="flex justify-between items-center text-sm text-white/80 mt-4">
            <span>✍️ {author}</span>
            <span>⏱ {readTime} min</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
