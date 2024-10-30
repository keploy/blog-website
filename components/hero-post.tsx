import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Post } from "../types/post";

interface Props extends Pick<Post, "title" | "date" | "excerpt" | "slug"> {
  coverImage: Post["featuredImage"];
  author: Post["ppmaAuthorName"];
  isCommunity?: boolean;
}

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity,
}: Props) {
  const basePath = isCommunity ? "/community" : "/technology";

  return (
    <section className="container mx-auto px-6 py-10">
      <motion.div
        className="bg-white shadow-lg border border-gray-200 rounded-xl overflow-hidden lg:grid lg:grid-cols-2 lg:gap-x-8 mb-20 md:mb-28"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
      >

        <div className="flex items-center justify-center mb-8 lg:mb-0">
          {coverImage && (
            <motion.div
              className="w-full h-auto max-w-xs lg:max-w-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
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
        
        <div className="p-8">
          <motion.h3
            className="text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href={`${basePath}/${slug}`}
              className="bg-gradient-to-r from-pink-400 to-orange-400 bg-[length:0px_8px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 hover:bg-[length:100%_8px]"
              dangerouslySetInnerHTML={{ __html: title }}
            ></Link>
          </motion.h3>
          
          <div className="flex items-center gap-4 mt-2 mb-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Avatar author={author ? author : "Anonymous"} />
            </motion.div>
            <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600"
            >
              <Date dateString={date} />
            </motion.div>
          </div>

          <motion.div
            className="text-md text-gray-700 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div dangerouslySetInnerHTML={{ __html: excerpt }} />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
