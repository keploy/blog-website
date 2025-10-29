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
    <div className="bg-white/20 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg shadow-black/10">
      {/* Background container - touches corners */}
      <div className="w-full h-52 relative">
        {/* Gradient overlay - only 50% of container height */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-orange-100/70 via-orange-50/60 to-orange-200/70"></div>
        
        {/* Circular profile image at center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg">
            {hasAvatar ? (
              <Image
                src={avatarUrl as string}
                alt={`${name}'s Avatar`}
                className="w-full h-full object-cover object-center"
                height={144}
                width={144}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {getInitials(name)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-6 h-0.5 bg-gradient-to-r from-orange-300/30 via-orange-500/45 to-orange-300/30" />

      <div className="p-6">
        
        {/* Author Name and LinkedIn */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 leading-tight transition-colors duration-200 flex-1 pr-2 group-hover:text-orange-600">
            {name}
          </h2>
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} LinkedIn`}
              className="text-gray-400 transition-colors hover:text-orange-600 flex-shrink-0"
            >
              <IoLogoLinkedin className="h-5 w-5" />
            </a>
          )}
        </div>
        
        {/* Bio with consistent truncation */}
        <div className="text-gray-700 text-sm leading-relaxed mb-6 min-h-[4.5rem] overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {displayBio}
        </div>
        
        {/* Footer with post count and link */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300 group-hover:bg-orange-200 group-hover:text-orange-900 group-hover:border-orange-400">
            {postCount} {postCount === 1 ? 'post' : 'posts'}
          </span>
          <Link
            href={`/authors/${slug}`}
            className="group text-sm text-orange-700 hover:text-orange-800 inline-flex items-center font-medium transition-colors duration-200"
          >
            <span className="underline underline-offset-4 decoration-2 decoration-orange-500 group-hover:decoration-orange-600">View more</span>
            <span aria-hidden className="ml-1 transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


