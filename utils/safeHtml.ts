/**
 * Safely wraps HTML string into dangerouslySetInnerHTML object with null/undefined guards.
 */
export function createSafeHtml(htmlContent: string | null | undefined): { __html: string } {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return { __html: '' };
  }
  return { __html: htmlContent };
}
