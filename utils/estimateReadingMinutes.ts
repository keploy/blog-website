/**
 * Safe reading time calculator with code snippet skimming and empty string guards.
 */
export function estimateReadingMinutes(rawContent: string, wordsPerMinute: number = 200): number {
  if (!rawContent || typeof rawContent !== 'string') {
    return 1;
  }
  const stripped = rawContent
    .replace(/`[\s\S]*?`/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[#*_~\[\]()]/g, ' ')
    .trim();
  const wordCount = stripped.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
