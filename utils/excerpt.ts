export function getExcerpt(content: string | null | undefined, maxWords: number): string {
  if (!content || typeof content !== "string") return '';
  const trimmed = content.trim();
  if (!trimmed) return '';

  const words = trimmed.split(/\s+/).filter(Boolean);

  // Ensure the excerpt does not exceed the maximum number of words
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "...";
  }

  return trimmed;
}

