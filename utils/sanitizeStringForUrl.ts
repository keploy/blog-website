export function sanitizeStringForURL(encodedStr?: string | null, toLowerCase: boolean = true): string {
  if (!encodedStr || typeof encodedStr !== "string") {
    return "";
  }

  try {
    let text = encodedStr;
    try {
      text = decodeURIComponent(encodedStr);
    } catch {
      // If malformed URI sequence, proceed with raw string
    }

    const strippedStr = text.replace(/<\/?[^>]+(>|$)/g, "");
    let sanitizedStr = strippedStr.replace(/\s+/g, "-");
    sanitizedStr = sanitizedStr.replace(/[^a-zA-Z0-9-]/g, "-");
    sanitizedStr = sanitizedStr.replace(/-+/g, "-");
    sanitizedStr = sanitizedStr.replace(/^[-]+|[-]+$/g, "");

    if (toLowerCase) {
      sanitizedStr = sanitizedStr.toLowerCase();
    }

    return sanitizedStr;
  } catch (error) {
    console.error("Error sanitizing string:", error);
    return "";
  }
}