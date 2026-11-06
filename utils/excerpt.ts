export function getExcerpt(content: string | null | undefined, maxWords: number) {
  if (!content) return '';
  const words = content.split(" ");

  // Ensure the excerpt does not exceed the maximum number of words
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "...";
  }

  return content;
}
