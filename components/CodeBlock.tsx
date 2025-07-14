"use client";

import { useEffect, useState } from "react";
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import type { BundledLanguage } from "shiki";

interface Props {
  code: string;
  lang: BundledLanguage;
}

export default function CodeBlockPage({ code, lang }: Props) {
  const [hasCopied, setHasCopied] = useState(false);
  const [html, setHtml] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => setHasCopied(true));
  };

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
    <div className="mb-6">
      <div className="flex items-center justify-between bg-[#18181B] text-[#d4d4d4] py-2 rounded-t-xl text-sm font-mono px-[1rem]">
        <span className="capitalize pl-1">{lang}</span>
        <motion.button
          onClick={() => {
            handleCopy();
            setTimeout(() => setHasCopied(false), 500);
          }}
          className={`transition-colors duration-200 rounded-xl pr-1 ${
            hasCopied ? "bg-[#27272A] p-1.5" : "hover:bg-[#27272A] p-1.5"
          }`}
          aria-label="Copy command"
        >
          <AnimatePresence mode="wait" initial={false}>
            {hasCopied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <IoCheckmarkOutline className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <IoCopyOutline className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <div
        className="shiki text-sm overflow-x-auto rounded-b-xl bg-[#09090B] border-t border-[#27272A]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
