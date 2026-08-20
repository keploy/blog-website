export const EXAMPLE_PATH = 'cms-wordpress'
export const CMS_NAME = 'WordPress'
export const CMS_URL = 'https://wordpress.org'
export const HOME_OG_IMAGE_URL =
  'https://wp.keploy.io/wp-content/uploads/2023/11/thumbnil-.png'

// Local placeholder avatar shown when an author has no usable image.
export const AUTHOR_AVATAR_PLACEHOLDER = '/blog/images/author.webp'

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
