"use client";

import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import type { BundledLanguage } from "shiki";

interface Props {
  code: string;
  lang: BundledLanguage;
}

export default function CodeBlockPage({ code, lang }: Props) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    async function highlight() {
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
