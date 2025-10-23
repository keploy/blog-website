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

// Helper function to generate initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

export default function AuthorCard({ name, avatarUrl, slug, postCount, linkedin, bio }: AuthorCardProps) {
  const displayBio = bio || `Articles by ${name} on testing, DevTools and more.`;
  const hasAvatar = avatarUrl && avatarUrl !== "imag1" && avatarUrl !== "image" && avatarUrl.trim() !== "";

  return (
    <div className="bg-white rounded-xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200 transition-all duration-300 overflow-hidden group hover:border-orange-300 hover:-translate-y-1">
      <div className="p-6">
        <div className="w-full h-48 mb-4 rounded-t-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {hasAvatar ? (
            <Image
              src={avatarUrl as string}
              alt={`${name}'s Avatar`}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center 30%' }}
              height={192}
              width={300}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-blue-500 flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">
                  {getInitials(name)}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug group-hover:text-orange-600 transition-colors duration-200">
            {name}
          </h2>
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} LinkedIn`}
              className="text-gray-400 transition-colors hover:text-orange-600"
            >
              <IoLogoLinkedin className="h-5 w-5" />
            </a>
          )}
        </div>
        
        <div className="text-gray-600 line-clamp-3 mb-6">
          {displayBio}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
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
    </div>
  );
}


