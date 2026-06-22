import CoverImage from "./cover-image";
import PostTitle from "./post-title";
import Categories from "./categories";
import PostHeaderAuthors from "./PostHeaderAuthors";

export default function PostHeader({
  title,
  coverImage,
  date,
  author,
  categories,
  BlogWriter,
  BlogReviewer,
  TimeToRead,
  tags,
}) {
  return (
    <div className="max-w-[780px] mx-auto px-4 sm:px-6">
      {/* 1. Cover image — top banner with rounded corners (LCP element, priority=true) */}
      <div className="w-full rounded-xl overflow-hidden mb-8">
        <CoverImage title={title} coverImage={coverImage} priority={true} />
      </div>

      {/* 2. Category labels */}
      <div className="mb-2">
        <Categories categories={categories} />
      </div>

      {/* 3. Title */}
      <PostTitle>{title}</PostTitle>

      {/* 4. Author card + social share icons */}
      <div className="mb-8">
        <PostHeaderAuthors
          blogwriter={BlogWriter}
          blogreviewer={BlogReviewer}
          timetoRead={TimeToRead}
          date={date}
          tags={tags}
        />
      </div>
    </div>
  );
}
