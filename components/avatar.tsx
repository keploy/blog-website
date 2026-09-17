import { Post } from "../types/post";

export interface AvatarProps {
  author?: Post["ppmaAuthorName"] | string | null;
  className?: string;
}

export default function Avatar({ author, className }: AvatarProps) {
  const authorName = author || "Keploy Contributor";

  return (
    <div className={`flex items-center${className ? ` ${className}` : ""}`}>
      <div data-testid="hero-post-author" className="text-md font-medium heading1">
        {authorName}
      </div>
    </div>
  );
}
