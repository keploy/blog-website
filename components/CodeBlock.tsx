"use client";

import { useEffect, useState } from "react";
import type { BundledLanguage } from "shiki";
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  code: string;
  lang: BundledLanguage;
}

export default function CodeBlockPage({ code, lang }: Props) {
  const [html, setHtml] = useState("");
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (!copied) return;

    const handleClickOutside = () => {
      setCopied(false);
      document.removeEventListener("click", handleClickOutside);
    };

    setTimeout(() => {
      setCopied(false);
      document.removeEventListener("click", handleClickOutside);
    }, 900);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
    });
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between bg-[#18181B] text-[#d4d4d4] px-4 py-2 rounded-t-xl text-sm font-mono">
        <span className="capitalize">{lang}</span>
        <button
          onClick={handleCopy}
          className="hover:bg-[#424141] px-2 py-2 rounded text-base text-gray-300 transition-all duration-200 focus:outline-none outline-none"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="check"
                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <IoCheckmarkOutline size={18} />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                <IoCopyOutline size={18} />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <div
        className="shiki text-sm overflow-x-auto rounded-b-xl bg-[#09090B] border-t border-[#27272A]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
