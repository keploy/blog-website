import Link from "next/link";
import Image from "next/image";
import { IoLogoLinkedin } from "react-icons/io";

export type AuthorCardProps = {
  name: string;
  avatarUrl?: string;
  slug: string;
  postCount: number;
  linkedin?: string;
  bio?: string;
};

export default function AuthorCard({ name, avatarUrl, slug, postCount, linkedin, bio }: AuthorCardProps) {
  const displayBio = bio || `Articles by ${name} on testing, DevTools and more.`;
  const hasAvatar = avatarUrl && avatarUrl !== "imag1" && avatarUrl !== "image";

  return (
    <div className="p-5 rounded-xl border border-gray-100 bg-white shadow-md hover:shadow-lg ring-1 ring-gray-100/60 transition-all duration-200 flex flex-col h-full hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {hasAvatar ? (
            <Image
              src={avatarUrl as string}
              alt={`${name}'s Avatar`}
              className="w-12 h-12 rounded-full mr-3 sm:mr-2"
              height={48}
              width={48}
            />
          ) : (
            <Image
              src={`/blog/images/author.png`}
              alt={`${name}'s Avatar`}
              className="w-12 h-12 rounded-full mr-3 sm:mr-2"
              height={48}
              width={48}
            />
          )}
          <h2 className="bg-gradient-to-r from-orange-200 to-orange-100 bg-[length:100%_20px] bg-no-repeat bg-left-bottom w-max text-2xl heading1 md:text-xl font-bold tracking-tighter leading-tight">
            {name}
          </h2>
        </div>
        <a
          href={linkedin || '#'}
          target={linkedin ? "_blank" : undefined}
          rel={linkedin ? "noopener noreferrer" : undefined}
          aria-label={`${name} LinkedIn`}
          className={`text-gray-400 transition-colors ${linkedin ? 'hover:text-gray-600' : 'opacity-40 cursor-default pointer-events-none'}`}
        >
          <IoLogoLinkedin className="h-5 w-5" />
        </a>
      </div>

      <p className="text-sm text-gray-600 mt-4 mb-6 leading-6 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
        {displayBio}
      </p>

      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          {postCount} {postCount === 1 ? 'post' : 'posts'}
        </span>
        <Link
          href={`/authors/${slug}`}
          className="group text-sm text-orange-600 hover:text-orange-700 inline-flex items-center font-medium"
        >
          <span className="underline underline-offset-4 decoration-2 decoration-orange-400">View more</span>
          <span aria-hidden className="ml-1 transition-transform duration-150 group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </div>
  );
}


