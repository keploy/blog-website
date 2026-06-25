import { useState } from "react";
import type { GatedReportConfig } from "../config/gated-reports";

export default function GatedReport({ config }: { config: GatedReportConfig }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/blog/api/request-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, reportId: config.reportId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(json.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div
      className="my-10 rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
      style={{ height: "520px" }}
    >
      <style>{`
        .gr-scroll::-webkit-scrollbar { display: none; }
        @keyframes gr-circle-in {
          from { stroke-dashoffset: 214; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes gr-check-in {
          from { stroke-dashoffset: 53; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes gr-confirm-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        className="gr-scroll h-full overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Report preview image */}
        <img
          src={config.preview.imageSrc}
          alt={config.preview.alt}
          className="w-full block"
          loading="lazy"
        />

        {/*
          Overlay sits 220px up into the image via negative margin.
          backdrop-filter blurs the image visible behind it.
          mask-image fades the whole overlay in gradually so there's no hard edge.
        */}
        <div
          style={{
            marginTop: "-220px",
            paddingTop: "88px",
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
          {status === "success" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                animation: "gr-confirm-in 0.32s ease both",
              }}
            >
              {/* Animated checkmark */}
              <svg
                width="72"
                height="72"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginBottom: 14 }}
              >
                <defs>
                  <linearGradient id="gr-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
                <circle cx="40" cy="40" r="38" fill="rgba(34,197,94,0.08)" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="url(#gr-ring-grad)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="214"
                  strokeDashoffset="214"
                  style={{
                    animation: "gr-circle-in 0.55s cubic-bezier(0.4,0,0.2,1) 0.05s forwards",
                    transformOrigin: "center",
                    transform: "rotate(-90deg)",
                  }}
                />
                <path
                  d="M22 42 L34 54 L58 28"
                  stroke="#22c55e"
                  strokeWidth="4.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="53"
                  strokeDashoffset="53"
                  style={{
                    animation: "gr-check-in 0.38s cubic-bezier(0.4,0,0.2,1) 0.52s forwards",
                  }}
                />
              </svg>

              <p style={{ fontSize: 16, fontWeight: 700, color: "#1c1917", margin: "0 0 6px" }}>
                You&apos;re on the list!
              </p>
              <p style={{ fontSize: 13, color: "#78716c", margin: "0 0 4px", lineHeight: 1.6 }}>
                We&apos;ll send the full report to{" "}
                <strong style={{ color: "#44403c" }}>{email}</strong> shortly.
              </p>
            
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-900 mt-0 mb-1">{config.title}</p>
              <p className="text-gray-500 text-xs mb-3 mt-0">{config.subtitle}</p>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg("");
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="your@email.com"
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white"
                  disabled={status === "loading"}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {status === "loading" ? "Sending…" : "Get Full Report →"}
                </button>
              </form>
              {errorMsg && (
                <p className="text-red-500 text-xs mt-2 mb-0">{errorMsg}</p>
              )}
             
            </>
          )}
        </div>
      </div>
    </div>
  );
}
