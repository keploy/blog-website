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
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <div
      className="my-10 rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
      style={{ height: "520px" }}
    >
      <style>{`.gr-scroll::-webkit-scrollbar{display:none}`}</style>

      <div
        className="gr-scroll h-full overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Report preview image */}
        <img
          src={config.previewImageSrc}
          alt={config.previewImageAlt}
          className="w-full block"
          loading="lazy"
        />

        {/*
          Overlay sits 220px up into the image via negative margin.
          backdrop-filter blurs the image visible behind it.
          mask-image fades the whole overlay in gradually so there's no hard edge.
          The background gradient goes transparent → near-white → white, giving
          the frosted-glass locked-PDF look without a separate white block.
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
            <div className="flex flex-col items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                ✓
              </div>
              <p className="text-sm font-bold text-gray-900 m-0">Check your inbox!</p>
              <p className="text-gray-500 text-xs m-0">
                Report sent to <strong>{email}</strong>.
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
              <p className="text-gray-400 text-xs mt-2 mb-0">No spam. Unsubscribe anytime.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
