"use client";

import { useEffect, useState } from "react";
import { getHtmlFromCode } from "../lib/shiki";

export function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState("<pre><code>Loading...</code></pre>");

  useEffect(() => {
    let mounted = true;
    getHtmlFromCode(code, lang).then((result) => {
      if (mounted) setHtml(result);
    });
    return () => {
      mounted = false;
    };
  }, [code, lang]);

  return <div className="shiki" dangerouslySetInnerHTML={{ __html: html }} />;
}
