// Function to calculate estimated time needed to read content
export function calculateReadingTime(content: string) {
  if (!content || typeof content !== "string") {
    return 0;
  }

  // Average reading speed in words per minute
  const wordsPerMinute = 250;

  // Strip HTML and common entities before counting
  const plainText = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&[a-z0-9#]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!plainText) {
    return 0;
  }

  // Count the number of words in the content
  const wordCount = plainText.split(/\s+/).length;

  // Calculate the estimated reading time in minutes
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);

  // Return the estimated reading time
  return readingTimeMinutes;
}
