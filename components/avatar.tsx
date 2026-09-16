import { Post } from "../types/post";

interface AvatarProps {
  author?: Post["ppmaAuthorName"] | null;
  className?: string;
}

export default function Avatar({ author, className = "" }: AvatarProps) {
  if (!author) return null;

  return (
    <div className={`flex items-center ${className}`.trim()}>
      <div data-testid="hero-post-author" className="text-md font-medium heading1">
        {author}
      </div>
    </div>
  );
}

