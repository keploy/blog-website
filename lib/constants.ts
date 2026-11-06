export const EXAMPLE_PATH = 'cms-wordpress'
export const CMS_NAME = 'WordPress'
export const CMS_URL = 'https://wordpress.org'
export const HOME_OG_IMAGE_URL =
  'https://wp.keploy.io/wp-content/uploads/2023/11/thumbnil-.png'
// Base URL for first-party static assets, served from S3 instead of shipping
// in the app bundle. Mirrors the repo's public/ folder structure, so a file at
// public/images/foo.webp is `${S3_ASSET_BASE}/images/foo.webp`. (The literal
// "+" in the key is intentional — that is the actual object prefix in S3.)
export const S3_ASSET_BASE =
  'https://keploy-devrel.s3.us-west-2.amazonaws.com/blog+site/public'

// Single source of truth for the placeholder avatar shown when a real author
// image is missing. Served from S3 (see S3_ASSET_BASE). Referenced by the UI
// components AND the structured-data guard that keeps this generic image out of
// author JSON-LD, so the two can never drift. The guard matches by filename, so
// the S3 URL still works.
export const AUTHOR_AVATAR_PLACEHOLDER = `${S3_ASSET_BASE}/images/author.webp`

// Resolve an author avatar to a real, loadable src. Some WordPress authors carry
// junk in ppmaAuthorImage (e.g. the literal strings "imag1" / "image", "n/a", or
// empty), and passing those to next/image renders /_next/image?url=imag1 → HTTP
// 400 → a broken avatar on every post that author wrote. Only an absolute http(s)
// URL or a root-relative "/..." path is a real image; anything else falls back to
// the placeholder. A valid URL passes through unchanged.
export function resolveAuthorAvatar(url?: string | null): string {
  const u = (url ?? '').trim()
  return /^https?:\/\//i.test(u) || u.startsWith('/') ? u : AUTHOR_AVATAR_PLACEHOLDER
}
