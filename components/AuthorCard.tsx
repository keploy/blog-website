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
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-white/50 transition-all duration-300 overflow-hidden group hover:border-orange-400 hover:border-2 hover:-translate-y-2 hover:bg-white/95">
      <div className="p-6">
        {/* Standardized Author Image Container */}
        <div className="w-full h-52 mb-6 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
          {hasAvatar ? (
            <Image
              src={avatarUrl as string}
              alt={`${name}'s Avatar`}
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: 'center 30%' }}
              height={208}
              width={300}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">
                  {getInitials(name)}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Author Name and LinkedIn */}
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors duration-200 flex-1 pr-2">
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
        <div className="text-gray-600 text-sm leading-relaxed mb-6 min-h-[4.5rem] overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical'
        }}>
          {displayBio}
        </div>
        
        {/* Footer with post count and link */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            {postCount} {postCount === 1 ? 'post' : 'posts'}
          </span>
          <Link
            href={`/authors/${slug}`}
            className="group text-sm text-orange-600 hover:text-orange-700 inline-flex items-center font-medium transition-colors duration-200"
          >
            <span className="underline underline-offset-4 decoration-2 decoration-orange-400 group-hover:decoration-orange-500">View more</span>
            <span aria-hidden className="ml-1 transition-transform duration-200 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


