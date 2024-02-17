import Avatar from "./avatar";
import Date from "./date";
import CoverImage from "./cover-image";
import Link from "next/link";

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
  isCommunity = false,
}) {
  const basePath = isCommunity ? "/community" : "/technology";
  return (
    <div className="bg-gray-100 border p-6 rounded-md   lg:hover:shadow-md transition">
      <div className="mb-5">
        {coverImage && (
          <CoverImage
            title={title}
            coverImage={coverImage}
            slug={slug}
            isCommunity={isCommunity}
          />
        )}
      </div>
      <h3 className="text-2xl leading-snug leading-none heading1 font-bold">
        <Link
          href={`${basePath}/${slug}`}
          className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_10px] group-hover:bg-[length:100%_10px]"
          dangerouslySetInnerHTML={{ __html: title }}
        ></Link>
      </h3>
      <div className="flex items-center gap-4">
        <Avatar author={author ? author : "Anonymous"} />
        <div className="divider bg-orange-700 h-1 w-1 rounded-full"></div>
        <div className="text-md mb-4 pt-4">
          <Date dateString={date} />
        </div>
      </div>
      <div
        className="text-sm leading-normal mb-4 body text-slate-600"
        dangerouslySetInnerHTML={{ __html: excerpt }}
      />
    </div>
  );
}
