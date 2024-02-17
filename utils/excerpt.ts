export function getExcerpt(content, maxWords) {
  // Split the content into an array of words
  const words = content.split(" ");

  // Ensure the excerpt does not exceed the maximum number of words
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(" ") + "...";
  }

  return content;
}
