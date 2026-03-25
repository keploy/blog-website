import React from "react";
import Image from "next/image";
import Link from "next/link";
import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";

/* ── Small arrow icon ── */
const ArrowRightIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 8h10M9 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

interface AuthorCardProps {
  name: string;
  imageUrl: string;
  description: string;
  role: "Writer" | "Reviewer";
  linkedIn?: string;
  basePath?: string;
}

const AuthorCard: React.FC<AuthorCardProps> = ({
  name,
  imageUrl,
  description,
  role,
  linkedIn,
  basePath = "",
}) => {
  const roleColor = role === "Writer" ? "#f97316" : "#8b5cf6";
  const roleBg = role === "Writer" ? "#FFF7ED" : "#F5F3FF";
  const profileHref = `/authors/${sanitizeAuthorSlug(name)}`;

  /* Resolve avatar src (handle external URLs via proxy) */
  const resolvedSrc =
    !imageUrl || imageUrl === "n/a"
      ? "/blog/images/author.png"
      : /^https?:\/\//i.test(imageUrl) && basePath
        ? `${basePath}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
        : imageUrl;

  /* Clean description sentences */
  const descriptionText =
    !description || description === "n/a"
      ? `${role} at Keploy.`
      : description;

  return (
    <div
      data-testid="author-card"
      className="rounded-xl overflow-hidden bg-white"
      style={{ border: "1.5px solid #e5e7eb" }}
    >
      {/* Accent bar */}
      <div className="h-1" style={{ background: roleColor }} />

      <div className="flex flex-col sm:flex-row gap-5 p-5 sm:p-6">
        {/* Avatar */}
        <div className="flex-shrink-0 flex justify-center sm:justify-start">
          <Image
            src={resolvedSrc}
            alt={name}
            width={80}
            height={80}
            className="rounded-full object-cover border border-gray-200"
            style={{ width: 80, height: 80, minWidth: 80 }}
            priority
          />
        </div>

        {/* Info */}
        <div className="flex flex-col min-w-0 flex-1">
          {/* Role badge */}
          <span
            className="self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2"
            style={{
              color: roleColor,
              border: `1.5px solid ${roleColor}`,
              background: roleBg,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {role}
          </span>

          {/* Name */}
          <h3
            className="text-lg font-bold text-gray-900 mb-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {name}
          </h3>

          {/* Description */}
          <p
            className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {descriptionText}
          </p>

          {/* Actions row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Profile button */}
            <Link
              href={profileHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors duration-150"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: roleColor,
                border: `1.5px solid ${roleColor}`,
                background: "transparent",
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.background = roleBg;
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              View All Posts <ArrowRightIcon />
            </Link>

            {/* LinkedIn link */}
            {linkedIn && linkedIn !== "n/a" && (
              <Link
                href={linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0A66C2] transition-colors duration-150"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                <LinkedInIcon /> LinkedIn
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorCard;
