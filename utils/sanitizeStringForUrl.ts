export function sanitizeStringForURL(encodedStr: string | null | undefined, toLowerCase: boolean = true): string {
    if (!encodedStr || typeof encodedStr !== "string") {
      return "";
    }
    try {
      const decodedStr = decodeURIComponent(encodedStr);
      const strippedStr = decodedStr.replace(/<\/?[^>]+(>|$)/g, "");
      let sanitizedStr = strippedStr.trim().replace(/\s+/g, "-");
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