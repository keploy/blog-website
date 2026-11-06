export interface AuthorData {
  avatarUrl: string;
  name: string;
  linkedIn: string;
  description: string;
}

export const extractAuthorData = (html: string): AuthorData => {
  if (typeof document === "undefined") {
    return {
      avatarUrl: "n/a",
      name: "",
      linkedIn: "n/a",
      description: "n/a",
    };
  }

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const avatarImgElement = tempDiv.querySelector(".pp-author-boxes-avatar img");
  const authorNameElement = tempDiv.querySelector(".pp-author-boxes-name a");
  const linkedinLink = tempDiv.querySelector(
    '.pp-author-boxes-avatar-details a[aria-label="Website"]'
  );
  const authorDescriptionElement = tempDiv.querySelector(
    ".pp-author-boxes-description"
  );

  const avatarUrl = avatarImgElement?.getAttribute("src") || "n/a";
  
  let name = "";
  if (authorNameElement?.textContent) {
    name = authorNameElement.textContent.trim();
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  const linkedIn = linkedinLink?.getAttribute("href") || "n/a";
  const description = authorDescriptionElement?.textContent?.trim() || "n/a";

  return {
    avatarUrl,
    name,
    linkedIn,
    description,
  };
};
