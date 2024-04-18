// Function to calculate estimated time needed to read content
export function calculateReadingTime(content) {
    // Average reading speed in words per minute
    const wordsPerMinute = 250;
  
    // Count the number of words in the content
    const wordCount = content.split(/\s+/).length;
  
    // Calculate the estimated reading time in minutes
    const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  
    // Return the estimated reading time
    return readingTimeMinutes;
  }