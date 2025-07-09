"use client";

import { useEffect, useState } from "react";
import type { BundledLanguage } from "shiki";

interface Props {
  code: string;
  lang: BundledLanguage;
}

export default function CodeBlockPage({ code, lang }: Props) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    async function highlight() {
      const { codeToHtml } = await import("shiki");

      const out = await codeToHtml(code, {
        lang,
        theme: "dark-plus",
      });
      setHtml(out);
    }

    highlight();
  }, [code, lang]);

  return (
    <div
      className="shiki text-sm overflow-x-auto rounded-md"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
