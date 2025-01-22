export function sanitizeStringForURL(encodedStr: string, toLowerCase: boolean = true): string {
    try {
      const decodedStr = decodeURIComponent(encodedStr);
      const strippedStr = decodedStr.replace(/<\/?[^>]+(>|$)/g, "");
      let sanitizedStr = strippedStr.replace(/ /g, '-');
      sanitizedStr = sanitizedStr.replace(/[^a-zA-Z0-9-]/g, '-');
      sanitizedStr = sanitizedStr.replace(/-+/g, '-');
      sanitizedStr = sanitizedStr.replace(/^[-]+|[-]+$/g, '');
      if (toLowerCase) {
        sanitizedStr = sanitizedStr.toLowerCase();
      }
      return sanitizedStr;
    } catch (error) {
      console.error("Error sanitizing string:", error);
      return '';
    }
}