import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { sanitizeAuthorSlug } from "../utils/sanitizeAuthorSlug";

/* ── Tag pill ── */
const TagPill = ({ name }: { name: string }) => {
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  return (
    <Link href={`/tag/${name}`}>
      <span
        className="inline-block border border-gray-300 text-gray-600 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap transition-colors duration-150 hover:border-orange-400 hover:text-orange-500 cursor-pointer"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {label}
      </span>
    </Link>
  );
};

/* ── Orange SVG icons ── */
const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="3" width="14" height="12" rx="2" stroke="#f97316" strokeWidth="1.5" fill="none" />
    <path d="M1 7h14" stroke="#f97316" strokeWidth="1.5" />
    <path d="M5 1v4M11 1v4" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" stroke="#f97316" strokeWidth="1.5" fill="none" />
    <path d="M8 5v3.5l2 2" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Small arrow icon for profile link ── */
const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Format ISO date → "7. June 2024" ── */
const formatPostDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return `${d.getDate()}. ${d.toLocaleDateString("en-GB", { month: "long" })} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

/* ── Author hover card (appears on name hover) ── */
const AuthorHoverCard = ({
  visible,
  person,
  role,
  onMouseEnter,
  onMouseLeave,
}: {
  visible: boolean;
  person: { name: string; ImageUrl: string; description: string };
  role: "Writer" | "Reviewer";
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  if (!visible) return null;

  const profileHref = `/authors/${sanitizeAuthorSlug(person.name)}`;
  const roleColor = role === "Writer" ? "#f97316" : "#8b5cf6";

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute top-[calc(100%+4px)] left-0 z-50 bg-white rounded-lg w-60"
      style={{
        border: "1.5px solid #e5e7eb",
      }}
    >
      {/* Top accent bar */}
      <div
        className="h-[3px] rounded-t-lg"
        style={{ background: roleColor }}
      />

      <div className="px-3 py-2.5">
        {/* Role badge */}
        <span
          className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-[1px] rounded-full mb-2"
          style={{
            color: roleColor,
            border: `1.5px solid ${roleColor}`,
            background: role === "Writer" ? "#FFF7ED" : "#F5F3FF",
          }}
        >
          {role}
        </span>

        {/* Avatar + name row */}
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={person.ImageUrl}
            alt={person.name}
            height={32}
            width={32}
            className="rounded-full object-cover border border-gray-200"
            style={{ width: 32, height: 32, minWidth: 32 }}
          />
          <p
            className="font-bold text-gray-900 truncate"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.8125rem" }}
          >
            {person.name}
          </p>
        </div>

        {/* Description */}
        <p
          className="text-[11px] text-gray-500 leading-relaxed mb-2 line-clamp-2"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {person.description}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-2" />

        {/* View profile link */}
        <Link
          href={profileHref}
          className="flex items-center justify-center gap-1 w-full py-1.5 rounded-md text-xs font-semibold transition-colors duration-150"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: roleColor,
            border: `1.5px solid ${roleColor}`,
            background: "transparent",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              role === "Writer" ? "#FFF7ED" : "#F5F3FF";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          View Profile <ArrowRightIcon />
        </Link>
      </div>
    </div>
  );
};

/* ── Hook: instant hover with enter/leave on both trigger & card ── */
const useInstantHover = (dismissOther?: () => void) => {
  const [visible, setVisible] = useState(false);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    if (hideRef.current) {
      clearTimeout(hideRef.current);
      hideRef.current = null;
    }
    dismissOther?.();
    setVisible(true);
  }, [dismissOther]);

  const hide = useCallback(() => {
    hideRef.current = setTimeout(() => setVisible(false), 60);
  }, []);

  const dismiss = useCallback(() => {
    if (hideRef.current) clearTimeout(hideRef.current);
    setVisible(false);
  }, []);

  return { visible, show, hide, dismiss };
};

/* ──────────────────────────────────────── */
/*         PostHeaderAuthors               */
/* ──────────────────────────────────────── */
const PostHeaderAuthors = ({
  blogwriter,
  blogreviewer,
  timetoRead,
  date,
  tags,
}: {
  blogwriter: { name: string; ImageUrl: string; description: string }[];
  blogreviewer: { name: string; ImageUrl: string; description: string }[];
  timetoRead: number;
  date: string;
  tags?: { edges: { node: { name: string } }[] };
}) => {
  const sameAuthor =
    blogwriter[0].name.split(" ")[0].toLowerCase() ===
    blogreviewer[0].name.toLowerCase();

  /* refs let each hook dismiss the other without circular deps */
  const reviewerDismissRef = useRef<() => void>(() => {});
  const writerDismissRef = useRef<() => void>(() => {});

  const writer = useInstantHover(() => reviewerDismissRef.current());
  const reviewer = useInstantHover(() => writerDismissRef.current());

  reviewerDismissRef.current = reviewer.dismiss;
  writerDismissRef.current = writer.dismiss;

  const tagList = tags?.edges?.slice(0, 4) || [];

  return (
    <>
      {/* ── Author row: avatar + info ── */}
      <div className="flex flex-row items-center gap-3 sm:gap-4 py-2">

        {/* Avatar — no hover trigger here */}
        <div className="flex-shrink-0">
          <Image
            src={blogwriter[0].ImageUrl}
            alt={blogwriter[0].name}
            height={96}
            width={96}
            className="rounded-full object-cover"
            style={{ width: 96, height: 96, minWidth: 96 }}
          />
        </div>

        {/* Text column */}
        <div className="flex flex-col" style={{ gap: "3px" }}>

          {/* Writer name — hover trigger */}
          <div className="relative inline-flex items-baseline gap-1">
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(0.9375rem, 2vw, 1.25rem)",
                lineHeight: "150%",
                color: "#111827",
              }}
            >
              Written By:{" "}
            </span>
            <span
              onMouseEnter={writer.show}
              onMouseLeave={writer.hide}
              className="cursor-pointer border-b border-dashed border-gray-400 hover:border-orange-400 hover:text-orange-600 transition-colors duration-100"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(0.9375rem, 2vw, 1.25rem)",
                lineHeight: "150%",
                color: "inherit",
              }}
            >
              {blogwriter[0].name}
            </span>

            <AuthorHoverCard
              visible={writer.visible}
              person={blogwriter[0]}
              role="Writer"
              onMouseEnter={writer.show}
              onMouseLeave={writer.hide}
            />
          </div>

          {/* Reviewer name — hover trigger (or description if same author) */}
          {!sameAuthor ? (
            <div className="relative inline-flex items-baseline gap-1">
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(0.875rem, 1.8vw, 1.125rem)",
                  lineHeight: "150%",
                  color: "#6b7280",
                }}
              >
                Reviewed by:{" "}
              </span>
              <span
                onMouseEnter={reviewer.show}
                onMouseLeave={reviewer.hide}
                className="cursor-pointer border-b border-dashed border-gray-400 hover:border-purple-400 hover:text-purple-600 transition-colors duration-100"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: "clamp(0.875rem, 1.8vw, 1.125rem)",
                  lineHeight: "150%",
                  color: "#6b7280",
                }}
              >
                {blogreviewer[0].name}
              </span>

              <AuthorHoverCard
                visible={reviewer.visible}
                person={blogreviewer[0]}
                role="Reviewer"
                onMouseEnter={reviewer.show}
                onMouseLeave={reviewer.hide}
              />
            </div>
          ) : (
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400,
                fontSize: "clamp(0.875rem, 1.8vw, 1.125rem)",
                lineHeight: "150%",
                color: "#6b7280",
              }}
            >
              {blogwriter[0].description}
            </p>
          )}

          {/* Date + reading time */}
          <div className="flex items-center gap-4 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
              <CalendarIcon />
              <span>{formatPostDate(date)}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
              <ClockIcon />
              <span>{timetoRead} minutes</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Tags row (below author) ── */}
      {tagList.length > 0 && (
        <div className="flex flex-row items-center gap-2 flex-wrap mt-3">
          {tagList.map((tag, i) => (
            <TagPill key={i} name={tag.node.name} />
          ))}
        </div>
      )}
    </>
  );
};

export default PostHeaderAuthors;