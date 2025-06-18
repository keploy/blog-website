import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { Post } from "../types/post";
import { motion } from "framer-motion";

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity = false,
}: {
  title: Post["title"];
  coverImage: Post["featuredImage"];
  date: Post["date"];
  excerpt: Post["excerpt"];
  author: Post["ppmaAuthorName"];
  slug: Post["slug"];
  isCommunity?: boolean;
}) {
  const basePath = isCommunity ? "/community" : "/technology";
  excerpt = excerpt.replace("Table of Contents", "");
  
  return (
    <motion.div
      className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:border-orange-300/50 overflow-hidden"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-blue-50/0 group-hover:from-orange-50/30 group-hover:to-blue-50/30 transition-all duration-500 rounded-2xl pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-5 overflow-hidden rounded-xl">
          {coverImage && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <CoverImage
                title={title}
                coverImage={coverImage}
                slug={slug}
                isCommunity={isCommunity}
              />
            </motion.div>
          )}
        </div>
        
        <h3 className="text-2xl leading-snug leading-none heading1 font-bold mb-4">
          <Link
            href={`${basePath}/${slug}`}
            className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px] text-gray-800 hover:text-gray-900"
            dangerouslySetInnerHTML={{ __html: title }}
          ></Link>
        </h3>
        
        <div className="flex items-center gap-4 mb-4">
          <Avatar author={author ? author : "Anonymous"} />
          <div className="divider bg-orange-400 h-1 w-1 rounded-full"></div>
          <div className="text-md">
            <Date dateString={date} />
          </div>
        </div>
        
        <div
          className="text-sm leading-relaxed body text-gray-600 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: excerpt }}
        />
        
        {/* Read more indicator */}
        <div className="mt-4 flex items-center text-orange-500 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Read more
          <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
