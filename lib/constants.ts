export const EXAMPLE_PATH = 'cms-wordpress'
export const CMS_NAME = 'WordPress'
export const CMS_URL = 'https://wordpress.org'
export const HOME_OG_IMAGE_URL =
  'https://wp.keploy.io/wp-content/uploads/2023/11/thumbnil-.png'
// Single source of truth for the local placeholder avatar shown when a real
// author image is missing. Referenced by the UI components AND the
// structured-data guard that keeps this generic image out of author JSON-LD,
// so the two can never drift (e.g. when the file extension changes).
export const AUTHOR_AVATAR_PLACEHOLDER = '/blog/images/author.webp'
