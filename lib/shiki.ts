import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Highlighter | null = null;

export async function getHtmlFromCode(code: string, lang: string) {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ["vitesse-light"],
      langs: [lang],
    });
  }

  return highlighter.codeToHtml(code, {
    lang,
    theme: "vitesse-light",
  });
}
