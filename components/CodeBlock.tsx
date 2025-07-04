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
        theme: "vitesse-light",
      });
      setHtml(out);
    }
    highlight();
  }, [code, lang]);

  return (
    <div
      className="shiki text-sm overflow-x-auto p-4 rounded-md"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
