// Function to calculate estimated time needed to read content
export function calculateReadingTime(content?: string | null): number {
  if (!content || typeof content !== "string") {
    return 0;
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return 0;
  }

  // Average reading speed in words per minute
  const wordsPerMinute = 250;

  // Count the number of words in the content accurately
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  if (wordCount === 0) {
    return 0;
  }

  // Calculate the estimated reading time in minutes
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);

  return readingTimeMinutes;
}