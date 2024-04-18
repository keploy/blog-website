import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import PostTitle from "./post-title";
import Categories from "./categories";
import BrushStroke from "../public/images/backgroundStroke.png";
import Image from "next/image";
import PostHeaderAuthors from "./PostHeaderAuthors";
import SharingComponent from "./SharingComponent";
import { useRouter } from "next/router";
export default function PostHeader({
  title,
  coverImage,
  date,
  author,
  categories,
  BlogWriter,
  BlogReviewer,
  TimeToRead,
}) {
  return (
    <>
      <div className="hidden md:flex flex-col items-center justify-center md:mb-12">
        <div className="mb-6 text-base">
          <Date dateString={date} />
          <Categories categories={categories} />
        </div>
        <PostTitle>{title}</PostTitle>
        {/* <Avatar author={author} /> */}
        <div>
        <PostHeaderAuthors blogreviewer={BlogReviewer} blogwriter={BlogWriter}/>
        </div>
      </div>
      <div>
      <SharingComponent timetoRead={TimeToRead} />
      </div>
      
      <div className="mb-8 md:mb-16 sm:mx-0 xl:w-2/3 md:w-4/5 w-full md:-translate-x-1/2 md:left-1/2 relative">
        <CoverImage title={title} coverImage={coverImage} />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="block md:hidden mb-6">
          <div className="relative">
            <Image src={BrushStroke} alt="Background" className="opacity-80" />
            <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
              <p className="text-white text-md font-semibold">{author}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
