import React from "react";

/*
 * "Add as a preferred source on Google" — deep-links to Google's Preferred
 * Sources picker pre-filtered to Keploy. When a reader adds Keploy as a
 * preferred source, Google surfaces our content more often in Top Stories /
 * Search for them. GEO / discovery play, sits alongside the Summarize-with-AI
 * row in the post header.
 */

// The site Google resolves in its Preferred Sources picker (?q=<site>).
const PREFERRED_SOURCE_URL =
  "https://www.google.com/preferences/source?q=keploy.io";

/* Google's four-colour "G" mark. */
const GoogleGIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      fill="#4285F4"
      d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.88-3c-1.08.72-2.45 1.16-4.06 1.16-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.29 14.3a7.2 7.2 0 0 1 0-4.6V6.61H1.28a12 12 0 0 0 0 10.78l4.01-3.09Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.76 0 3.34.61 4.58 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.28 6.61l4.01 3.09C6.23 6.86 8.88 4.75 12 4.75Z"
    />
  </svg>
);

/* Up-right arrow, matches the "opens in Google" affordance. */
const ArrowUpRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className="shrink-0"
  >
    <path
      d="M5 11L11 5M11 5H6M11 5V10"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function PreferredSourceButton() {
  return (
    <a
      href={PREFERRED_SOURCE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Add Keploy as a preferred source on Google"
      title="Add as a preferred source on Google"
      className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 h-9 text-gray-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-orange-300 hover:text-orange-600 hover:shadow-sm"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <GoogleGIcon />
      <span className="text-sm font-semibold leading-tight whitespace-nowrap">
        Add as preferred source
      </span>
      <ArrowUpRightIcon />
    </a>
  );
}
