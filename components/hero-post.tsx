import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";
import { motion } from 'framer-motion';
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
}) {
  const basePath = isCommunity ? "/community" : "/technology";

  return (
    <section>
      <div className="bg-gray-100 border px-8 py-8 rounded-md lg:grid lg:grid-cols-1 lg:gap-x-8 mb-20 md:mb-28 content-center  lg:hover:shadow-md transition">
        <div className="">
          <div>
            <h3 className="heading1 text-center text-4xl lg:text-6xl  font-bold leading-none text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-500">
              <Link
                href={`${basePath}/${slug}`}
                className="hero-title-link title-link  bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: title }}
              ></Link>
            </h3>
          </div>
          <div className="flex justify-center flex-col sm:flex-row items-center gap-0 md:gap-4 ">
            <div className="flex items-center gap-x-2 mt-1">
              <div className="text-md font-medium heading1">Written By: </div>
              <Avatar author={author ? author : "Anonymous"} />
            </div>

            <div className="divider bg-orange-700 h-1 w-1 rounded-full hidden sm:block"></div>

            <div className="text-md mb-4 pt-4">
              <Date dateString={date} />
            </div>
          </div>
          <div>
          </div>
        </div>

        <div className="relative group mb-8 lg:mb-0">
          <Link href={`${basePath}/${slug}`}>
            {coverImage && (
              <div className="relative">
                <motion.div
                  className="transition duration-300 ease-in-out"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05, filter: 'blur(2px)' }}
                >
                  <CoverImage
                    title={title}
                    coverImage={coverImage}
                    slug={slug}
                    isCommunity={isCommunity}
                  />
                </motion.div>

                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 p-4 z-10"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="body xl:text-md text-2xl leading-relaxed text-white font-semibold"
                    dangerouslySetInnerHTML={{ __html: excerpt }}
                  />
                </motion.div>
              </div>
            )}
          </Link>
        </div>
      </div>

    </section>
  );
}
