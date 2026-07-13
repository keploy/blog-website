import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { GatedReportConfig } from "../config/gated-reports";

export default function GatedReport({ config }: { config: GatedReportConfig }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [showBtn, setShowBtn] = useState(true);

  const checkScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const el = scrollRef.current;
      if (!el) return;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
      const overflows = el.scrollHeight > el.clientHeight + 8;
      setShowBtn(overflows && !atBottom);
    });
  }, []);

  useEffect(() => { checkScroll(); }, [checkScroll]);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  return (
    <div className="my-10 relative rounded-2xl border border-gray-200 shadow-lg overflow-hidden w-full p-2 h-[240px] sm:h-[380px]">
      <style>{`
        .gr-scroll::-webkit-scrollbar { display: none; }
        @keyframes gr-bob {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(-4px); }
        }
        .gr-btn { animation: gr-bob 2s ease-in-out infinite; }
      `}</style>

      <div
        ref={scrollRef}
        className="gr-scroll h-full overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={checkScroll}
      >
        <img
          src={config.preview.imageSrc}
          alt={config.preview.alt}
          className="block"
          style={{ width: "100%", maxWidth: "none", marginTop: 0, borderRadius: 0 }}
          loading="lazy"
          onLoad={checkScroll}
        />

        <div
          style={{
            marginTop: "-160px",
            paddingTop: "64px",
            paddingBottom: "32px",
            paddingLeft: "24px",
            paddingRight: "24px",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.78) 38%, rgba(255,255,255,0.96) 65%, white 85%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 38%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 38%)",
            textAlign: "center",
          }}
        >
          <p className="text-sm font-bold text-gray-900 mt-0 mb-1">{config.title}</p>
          <p className="text-gray-500 text-xs mb-3 mt-0">{config.subtitle}</p>
          <Link
            href={config.redirectUrl}
            className="inline-block px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors duration-150 whitespace-nowrap"
          >
            {config.ctaText || "Read Full Blog →"}
          </Link>
        </div>
      </div>

      {showBtn && (
        <button
          onClick={scrollToBottom}
          aria-label="Scroll down to read more"
          className="gr-btn"
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            background: "rgba(255,255,255,0.92)",
            border: "1px solid #e5e7eb",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            zIndex: 10,
            padding: 0,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </div>
  );
}
